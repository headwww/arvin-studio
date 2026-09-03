import type {
  InternalRuleItem,
  InternalValidateMessages,
  Rule,
  RuleItem,
  Rules,
  RuleType,
  RuleValuePackage,
  SyncErrorType,
  ValidateCallback,
  ValidateError,
  ValidateFieldsError,
  ValidateMessages,
  ValidateOption,
  Values,
} from './interface';

import { messages as defaultMessages, newMessages } from './messages';
import {
  asyncMap,
  complementError,
  convertFieldsError,
  deepMerge,
  format,
  warning,
} from './util';
import validators from './validator/index';

export * from './interface';

/**
 *  Encapsulates a validation schema.
 *
 *  @param descriptor An object declaring validation rules
 *  for this schema.
 */
class Schema {
  static messages = defaultMessages;

  static validators = validators;

  static warning = warning;

  // ======================== Instance ========================
  rules: Record<string, RuleItem[]> = {};

  // eslint-disable-next-line unicorn/consistent-class-member-order
  #messages: InternalValidateMessages = defaultMessages;
  constructor(descriptor: Rules) {
    this.define(descriptor);
  }

  // ========================= Static =========================
  static register = function register(type: string, validator: any) {
    if (typeof validator !== 'function') {
      throw new TypeError(
        'Cannot register a validator by type, validator is not a function',
      );
    }
    (validators as any)[type] = validator;
  };

  define(rules: Rules) {
    if (!rules) {
      throw new Error('Cannot configure a schema with no rules');
    }
    if (typeof rules !== 'object' || Array.isArray(rules)) {
      throw new TypeError('Rules must be an object');
    }
    this.rules = {};

    Object.keys(rules).forEach((name) => {
      const item: Rule = rules[name]!;
      this.rules[name] = Array.isArray(item) ? item : [item];
    });
  }

  getType(rule: InternalRuleItem) {
    if (rule.type === undefined && rule.pattern instanceof RegExp) {
      rule.type = 'pattern';
    }
    if (
      typeof rule.validator !== 'function' &&
      rule.type &&
      !validators.hasOwnProperty(rule.type)
    ) {
      throw new Error(format('Unknown rule type %s', rule.type));
    }
    return rule.type || 'string';
  }

  getValidationMethod(rule: InternalRuleItem) {
    if (typeof rule.validator === 'function') {
      return rule.validator;
    }
    const keys = Object.keys(rule);
    const messageIndex = keys.indexOf('message');
    if (messageIndex !== -1) {
      keys.splice(messageIndex, 1);
    }
    if (keys.length === 1 && keys[0] === 'required') {
      return validators.required;
    }
    return validators[this.getType(rule)] || undefined;
  }
  messages(messages?: ValidateMessages) {
    if (messages) {
      this.#messages = deepMerge(newMessages(), messages);
    }
    return this.#messages;
  }
  validate(
    source: Values,
    option?: ValidateOption,
    callback?: ValidateCallback,
  ): Promise<Values>;
  validate(source: Values, callback: ValidateCallback): Promise<Values>;
  validate(source: Values): Promise<Values>;
  validate(source_: Values, o: any = {}, oc: any = () => {}): Promise<Values> {
    let source: Values = source_;
    let options: ValidateOption = o;
    let callback: ValidateCallback = oc;
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (!this.rules || Object.keys(this.rules).length === 0) {
      if (callback) {
        callback(null, source);
      }
      return Promise.resolve(source);
    }

    function complete(results: (ValidateError | ValidateError[])[]) {
      let errors: ValidateError[] = [];
      // eslint-disable-next-line no-useless-assignment
      let fields: ValidateFieldsError = {};

      function add(e: ValidateError | ValidateError[]) {
        if (Array.isArray(e)) {
          errors = errors.concat(...e);
        } else {
          errors.push(e);
        }
      }

      for (const result of results) {
        add(result);
      }
      if (errors.length === 0) {
        callback(null, source);
      } else {
        fields = convertFieldsError(errors);
        (
          callback as (
            errors: ValidateError[],
            fields: ValidateFieldsError,
          ) => void
        )(errors, fields);
      }
    }

    if (options.messages) {
      let messages = this.messages();
      if (messages === defaultMessages) {
        messages = newMessages();
      }
      deepMerge(messages, options.messages);
      options.messages = messages;
    } else {
      options.messages = this.messages();
    }

    const series: Record<string, RuleValuePackage[]> = {};
    const keys = options.keys || Object.keys(this.rules);
    keys.forEach((z) => {
      const arr = this.rules[z]!;
      let value = source[z];
      arr.forEach((r) => {
        let rule: InternalRuleItem = r;
        if (typeof rule.transform === 'function') {
          if (source === source_) {
            source = { ...source };
          }
          value = source[z] = rule.transform(value);
          if (value !== undefined && value !== null) {
            rule.type ||= (
              Array.isArray(value) ? 'array' : typeof value
            ) as RuleType;
          }
        }
        rule =
          typeof rule === 'function'
            ? {
                validator: rule,
              }
            : { ...rule };

        // Fill validator. Skip if nothing need to validate
        rule.validator = this.getValidationMethod(rule);
        if (!rule.validator) {
          return;
        }

        rule.field = z;
        rule.fullField ||= z;
        rule.type = this.getType(rule);
        series[z] ||= [];
        series[z].push({
          rule,
          value,
          source,
          field: z,
        });
      });
    });
    const errorFields: Record<string, any> = {};
    return asyncMap(
      series,
      options,
      (data, doIt) => {
        const rule = data.rule;
        let deep =
          (rule.type === 'object' || rule.type === 'array') &&
          (typeof rule.fields === 'object' ||
            typeof rule.defaultField === 'object');
        deep &&= rule.required || (!rule.required && data.value);
        rule.field = data.field;

        function addFullField(key: string, schema: RuleItem) {
          return {
            ...schema,
            fullField: `${rule.fullField}.${key}`,
            fullFields: rule.fullFields ? [...rule.fullFields, key] : [key],
          };
        }

        function cb(e: SyncErrorType | SyncErrorType[] = []) {
          let errorList = Array.isArray(e) ? e : [e];
          if (!options.suppressWarning && errorList.length > 0) {
            Schema.warning('async-validator:', errorList);
          }
          if (
            errorList.length > 0 &&
            rule.message !== undefined &&
            rule.message !== null
          ) {
            errorList = [].concat(rule.message as any);
          }

          // Fill error info
          let filledErrors = errorList.map(complementError(rule, source));

          if (options.first && filledErrors.length > 0) {
            errorFields[rule.field!] = 1;
            return doIt(filledErrors);
          }
          if (deep) {
            // if rule is required but the target object
            // does not exist fail at the rule level and don't
            // go deeper
            if (rule.required && !data.value) {
              if (rule.message !== undefined) {
                filledErrors = []
                  .concat(rule.message as any)
                  .map(complementError(rule, source));
              } else if (options.error) {
                filledErrors = [
                  options.error(
                    rule,
                    format(options.messages!.required!, rule.field),
                  ),
                ];
              }
              return doIt(filledErrors);
            }

            let fieldsSchema: Record<string, Rule> = {};
            if (rule.defaultField) {
              Object.keys(data.value).map((key) => {
                fieldsSchema[key] = rule.defaultField as any;
              });
            }
            fieldsSchema = {
              ...fieldsSchema,
              ...data.rule.fields,
            };

            const paredFieldsSchema: Record<string, RuleItem[]> = {};

            Object.keys(fieldsSchema).forEach((field) => {
              const fieldSchema = fieldsSchema[field];
              const fieldSchemaList = Array.isArray(fieldSchema)
                ? fieldSchema
                : [fieldSchema];
              paredFieldsSchema[field] = fieldSchemaList.map(
                addFullField.bind(null, field) as any,
              );
            });
            const schema = new Schema(paredFieldsSchema);
            schema.messages(options.messages);
            if (data.rule.options) {
              data.rule.options.messages = options.messages;
              data.rule.options.error = options.error;
            }
            schema.validate(
              data.value,
              data.rule.options || options,
              (errs) => {
                const finalErrors = [];
                if (filledErrors && filledErrors.length > 0) {
                  finalErrors.push(...filledErrors);
                }
                if (errs && errs.length > 0) {
                  finalErrors.push(...errs);
                }
                doIt((finalErrors.length > 0 ? finalErrors : null) as any);
              },
            );
          } else {
            doIt(filledErrors);
          }
        }

        let res: any;
        if (rule.asyncValidator) {
          res = rule.asyncValidator(rule, data.value, cb, data.source, options);
        } else if (rule.validator) {
          try {
            res = rule.validator(rule, data.value, cb, data.source, options);
          } catch (error) {
            console.error?.(error);
            // rethrow to report error
            if (!options.suppressValidatorError) {
              setTimeout(() => {
                throw error;
              }, 0);
            }
            cb((error as any).message);
          }
          if (res === true) {
            cb();
          } else if (res === false) {
            cb(
              typeof rule.message === 'function'
                ? rule.message(rule.fullField || rule.field)
                : rule.message || `${rule.fullField || rule.field} fails`,
            );
          } else if (Array.isArray(res)) {
            cb(res);
          } else if (res instanceof Error) {
            cb(res.message);
          }
        }
        if (res && (res as Promise<void>).then) {
          // eslint-disable-next-line unicorn/prefer-then-catch
          (res as Promise<void>).then(
            () => cb(),
            (error) => cb(error),
          );
        }
      },
      (results) => {
        complete(results);
      },
      source,
    );
  }
}

export default Schema;

export const AsyncValidator = Schema;

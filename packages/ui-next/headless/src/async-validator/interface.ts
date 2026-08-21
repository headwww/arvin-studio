// >>>>> Rule
// Modified from https://github.com/yiminghe/async-validator/blob/0d51d60086a127b21db76f44dff28ae18c165c47/src/index.d.ts
export type RuleType =
  | 'any'
  | 'array'
  | 'boolean'
  | 'date'
  | 'email'
  | 'enum'
  | 'float'
  | 'hex'
  | 'integer'
  | 'method'
  | 'number'
  | 'object'
  | 'pattern'
  | 'regexp'
  | 'string'
  | 'tel'
  | 'url';

export interface ValidateOption {
  error?: (rule: InternalRuleItem, message: string) => ValidateError;

  // when the first validation rule generates an error stop processed
  first?: boolean;

  // when the first validation rule of the specified field generates an error stop the field processed, 'true' means all fields.
  firstFields?: boolean | string[];

  /** The name of rules need to be trigger. Will validate all rules if leave empty */
  keys?: string[];

  messages?: Partial<ValidateMessages>;

  // whether to suppress validator error
  suppressValidatorError?: boolean;

  // whether to suppress internal warning
  suppressWarning?: boolean;
}

export type SyncErrorType = Error | string;
export type SyncValidateResult = boolean | SyncErrorType | SyncErrorType[];
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ValidateResult = Promise<void> | SyncValidateResult | void;

export interface RuleItem {
  asyncValidator?: (
    rule: InternalRuleItem,
    value: Value,
    callback: (error?: Error | string) => void,
    source: Values,
    options: ValidateOption,
  ) => Promise<void> | void;
  defaultField?: Rule; // 'object' or 'array' containing validation rules
  enum?: (boolean | null | number | string | undefined)[]; // possible values of type 'enum'
  fields?: Record<string, Rule>; // ignore when without required
  len?: number; // Length of type 'string' and 'array'
  max?: number; // Range of type 'string' and 'array'
  message?: ((a?: string) => string) | string;
  min?: number; // Range of type 'string' and 'array'
  options?: ValidateOption;
  pattern?: RegExp | string;
  required?: boolean;
  transform?: (value: Value) => Value;
  type?: RuleType; // default type is 'string'
  validator?: (
    rule: InternalRuleItem,
    value: Value,
    callback: (error?: Error | string) => void,
    source: Values,
    options: ValidateOption,
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  ) => SyncValidateResult | void;
  whitespace?: boolean;
}

export type Rule = RuleItem | RuleItem[];

export type Rules = Record<string, Rule>;

/**
 *  Rule for validating a value exists in an enumerable list.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 *  @param type Rule type
 */
export type ExecuteRule = (
  rule: InternalRuleItem,
  value: Value,
  source: Values,
  errors: string[],
  options: ValidateOption,
  type?: string,
) => void;

/**
 *  Performs validation for any type.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
export type ExecuteValidator = (
  rule: InternalRuleItem,
  value: Value,
  callback: (error?: string[]) => void,
  source: Values,
  options: ValidateOption,
) => void;

// >>>>> Message
type ValidateMessage<T extends any[] = unknown[]> =
  | ((...args: T) => string)
  | string;
type FullField = string | undefined;
type EnumString = string | undefined;
type Pattern = RegExp | string | undefined;
type Range = number | undefined;
type Type = string | undefined;

export interface ValidateMessages {
  array?: {
    len?: ValidateMessage<[FullField, Range]>;
    max?: ValidateMessage<[FullField, Range]>;
    min?: ValidateMessage<[FullField, Range]>;
    range?: ValidateMessage<[FullField, Range, Range]>;
  };
  date?: {
    format?: ValidateMessage;
    invalid?: ValidateMessage;
    parse?: ValidateMessage;
  };
  default?: ValidateMessage;
  enum?: ValidateMessage<[FullField, EnumString]>;
  number?: {
    len?: ValidateMessage<[FullField, Range]>;
    max?: ValidateMessage<[FullField, Range]>;
    min?: ValidateMessage<[FullField, Range]>;
    range?: ValidateMessage<[FullField, Range, Range]>;
  };
  pattern?: {
    mismatch?: ValidateMessage<[FullField, Value, Pattern]>;
  };
  required?: ValidateMessage<[FullField]>;
  string?: {
    len?: ValidateMessage<[FullField, Range]>;
    max?: ValidateMessage<[FullField, Range]>;
    min?: ValidateMessage<[FullField, Range]>;
    range?: ValidateMessage<[FullField, Range, Range]>;
  };
  types?: {
    array?: ValidateMessage<[FullField, Type]>;
    boolean?: ValidateMessage<[FullField, Type]>;
    date?: ValidateMessage<[FullField, Type]>;
    email?: ValidateMessage<[FullField, Type]>;
    float?: ValidateMessage<[FullField, Type]>;
    hex?: ValidateMessage<[FullField, Type]>;
    integer?: ValidateMessage<[FullField, Type]>;
    method?: ValidateMessage<[FullField, Type]>;
    number?: ValidateMessage<[FullField, Type]>;
    object?: ValidateMessage<[FullField, Type]>;
    regexp?: ValidateMessage<[FullField, Type]>;
    string?: ValidateMessage<[FullField, Type]>;
    tel?: ValidateMessage<[FullField, Type]>;
    url?: ValidateMessage<[FullField, Type]>;
  };
  whitespace?: ValidateMessage<[FullField]>;
}

export interface InternalValidateMessages extends ValidateMessages {
  clone: () => InternalValidateMessages;
}

// >>>>> Values
export type Value = any;
export type Values = Record<string, Value>;

// >>>>> Validate
export interface ValidateError {
  field?: string;
  fieldValue?: Value;
  message?: string;
}

export type ValidateFieldsError = Record<string, ValidateError[]>;

export type ValidateCallback = (
  errors: null | ValidateError[],
  fields: ValidateFieldsError | Values,
) => void;

export interface RuleValuePackage {
  field: string;
  rule: InternalRuleItem;
  source: Values;
  value: Value;
}

export interface InternalRuleItem extends Omit<RuleItem, 'validator'> {
  field?: string;
  fullField?: string;
  fullFields?: string[];
  validator?: ExecuteValidator | RuleItem['validator'];
}

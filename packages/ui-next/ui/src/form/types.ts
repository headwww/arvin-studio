import type { Component } from 'vue';

import type { DeepNamePath } from './namePathType';

export type ReducerAction = UpdateAction | ValidateAction;

export type BatchTask = (key: string, callback: VoidFunction) => void;

export type InternalNamePath = (number | string)[];
export type NamePath<T = any> = DeepNamePath<T>;

export type StoreValue = any;
export type Store = Record<string, StoreValue>;

interface UpdateAction {
  namePath: InternalNamePath;
  type: 'updateValue';
  value: StoreValue;
}

interface ValidateAction {
  namePath: InternalNamePath;
  triggerName: string;
  type: 'validateField';
}

export interface Meta {
  errors: string[];
  name: InternalNamePath;
  touched: boolean;
  validated: boolean;
  validating: boolean;
  warnings: string[];
}

export interface InternalFieldData extends Meta {
  value: StoreValue;
}

/**
 * Used by `setFields` config
 */
export interface FieldData<Values = any> extends Partial<
  Omit<InternalFieldData, 'name'>
> {
  name: NamePath<Values>;
}

export type RuleType =
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
  | 'regexp'
  | 'string'
  | 'tel'
  | 'url';

type Validator = (
  rule: RuleObject,
  value: StoreValue,
  callback: (error?: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => Promise<any | void> | void;

export type RuleRender = (form: FormInstance) => RuleObject;

export interface ValidatorRule {
  message?: Component | string;
  validator: Validator;
  warningOnly?: boolean;
}

export type TriggerType = 'blur' | 'change' | 'focus';

interface BaseRule {
  enum?: StoreValue[];
  len?: number;
  max?: number;
  message?: Component | string;
  min?: number;
  pattern?: RegExp;
  required?: boolean;
  transform?: (value: StoreValue) => StoreValue;
  trigger?: TriggerType | TriggerType[];
  type?: RuleType;
  /** Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` */
  validateTrigger?: TriggerType | TriggerType[];
  warningOnly?: boolean;

  whitespace?: boolean;
}

type AggregationRule = BaseRule & Partial<ValidatorRule>;

interface ArrayRule extends Omit<AggregationRule, 'type'> {
  defaultField?: RuleObject;
  type: 'array';
}

export type RuleObject = AggregationRule | ArrayRule;

export type Rule = RuleObject | RuleRender;

/**
 * Form-level rules map keyed by field name.
 *
 * Values are resolved against a field's `namePath` via `getValue`, so the map
 * mirrors the data structure and supports nested objects and array indexes:
 * - flat:    `{ username: [...] }`
 * - nested:  `{ user: { email: [...] } }`
 * - indexed: `{ list: { 0: [...], 1: [...] } }`
 */
export interface RulesMap {
  [key: number | string]: Rule[] | RulesMap;
}

export interface ValidateErrorEntity<Values = any> {
  errorFields: { errors: string[]; name: InternalNamePath }[];
  message: string;
  outOfDate: boolean;
  values: Values;
}

export interface FieldEntity {
  getErrors: () => string[];
  getMeta: () => Meta;
  getNamePath: () => InternalNamePath;
  getWarnings: () => string[];
  /**
   * Mask as invalidate.
   * This will filled when Field is removed but not updated in render yet.
   */
  INVALIDATE_NAME_PATH?: InternalNamePath;
  isFieldDirty: () => boolean;
  isFieldTouched: () => boolean;
  isFieldValidating: () => boolean;
  isList: () => boolean;
  isListField: () => boolean;
  isPreserve: () => boolean;
  onStoreChange: (
    store: Store,
    namePathList: InternalNamePath[] | null,
    info: ValuedNotifyInfo,
  ) => void;
  props: {
    dependencies?: NamePath[];
    initialValue?: any;
    name?: NamePath;
    rules?: Rule[];
  };

  validateRules: (options?: InternalValidateOptions) => Promise<RuleError[]>;
}

export interface FieldError {
  errors: string[];
  name: InternalNamePath;
  warnings: string[];
}

export interface RuleError {
  errors: string[];
  rule: RuleObject;
}

export interface ValidateOptions {
  /** Validate when a field is dirty (validated or touched) */
  dirty?: boolean;
  /**
   * Recursive validate. It will validate all the name path that contains the provided one.
   * e.g. [['a']] will validate ['a'] , ['a', 'b'] and ['a', 1].
   */
  recursive?: boolean;
  /**
   * Validate only and not trigger UI and Field status update
   */
  validateOnly?: boolean;
}

export interface ValidateFields<Values = any> {
  (opt?: ValidateOptions): Promise<Values>;
  (nameList?: NamePath[], opt?: ValidateOptions): Promise<Values>;
}

export interface InternalValidateOptions extends ValidateOptions {
  triggerName?: string;
  validateMessages?: ValidateMessages;
}

export interface InternalValidateFields<Values = any> {
  (options?: InternalValidateOptions): Promise<Values>;
  (nameList?: NamePath[], options?: InternalValidateOptions): Promise<Values>;
}

// >>>>>> Info
interface ValueUpdateInfo {
  source: 'external' | 'internal';
  type: 'valueUpdate';
}

interface ValidateFinishInfo {
  type: 'validateFinish';
}

interface ResetInfo {
  type: 'reset';
}

interface RemoveInfo {
  type: 'remove';
}

interface SetFieldInfo {
  data: FieldData;
  type: 'setField';
}

interface DependenciesUpdateInfo {
  /**
   * Contains all the related `InternalNamePath[]`.
   * a <- b <- c : change `a`
   * relatedFields=[a, b, c]
   */
  relatedFields: InternalNamePath[];
  type: 'dependenciesUpdate';
}

export type NotifyInfo =
  | DependenciesUpdateInfo
  | RemoveInfo
  | ResetInfo
  | SetFieldInfo
  | ValidateFinishInfo
  | ValueUpdateInfo;

export type ValuedNotifyInfo = NotifyInfo & {
  store: Store;
};

export interface Callbacks<Values = any> {
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
  onValuesChange?: (changedValues: Partial<Values>, values: Values) => void;
}

export type WatchCallBack = (
  values: Store,
  allValues: Store,
  namePathList: InternalNamePath[],
) => void;

export interface WatchOptions<Form extends FormInstance = FormInstance> {
  form?: Form;
  preserve?: boolean;
}

export interface InternalHooks {
  destroyForm: (clearOnDestroy?: boolean) => void;
  dispatch: (action: ReducerAction) => void;
  getFields: (namePathList?: InternalNamePath[]) => FieldData[];
  getInitialValue: (namePath: InternalNamePath) => StoreValue;
  initEntityValue: (entity: FieldEntity) => void;
  registerField: (entity: FieldEntity) => () => void;
  registerWatch: (callback: WatchCallBack) => () => void;
  setBatchUpdate: (fn: BatchTask) => void;
  setCallbacks: (callbacks: Callbacks) => void;
  setInitialValues: (values: Store, init: boolean) => void;
  setPreserve: (preserve?: boolean) => void;
  setValidateMessages: (validateMessages: ValidateMessages) => void;
  useSubscribe: (subscribable: boolean) => void;
}

/** Only return partial when type is not any */
type RecursivePartial<T> =
  NonNullable<T> extends object
    ? {
        [P in keyof T]?: NonNullable<T[P]> extends (infer U)[]
          ? RecursivePartial<U>[]
          : NonNullable<T[P]> extends object
            ? RecursivePartial<T[P]>
            : T[P];
      }
    : T;

export type FilterFunc = (meta: Meta | null) => boolean;

export interface GetFieldsValueConfig {
  filter?: FilterFunc;
  /**
   * @deprecated `strict` is deprecated and not working anymore
   */
  strict?: boolean;
}

export interface FormInstance<Values = any> {
  getFieldError: (name: NamePath<Values>) => string[];
  getFieldsError: (nameList?: NamePath<Values>[]) => FieldError[];
  getFieldsValue: (() => Values) &
    ((nameList: NamePath<Values>[] | true, filterFunc?: FilterFunc) => any) &
    ((config: GetFieldsValueConfig) => any);
  // Origin Form API
  getFieldValue: (name: NamePath<Values>) => StoreValue;
  getFieldWarning: (name: NamePath<Values>) => string[];
  isFieldsTouched: ((
    nameList?: NamePath<Values>[],
    allFieldsTouched?: boolean,
  ) => boolean) &
    ((allFieldsTouched?: boolean) => boolean);
  isFieldsValidating: (nameList?: NamePath<Values>[]) => boolean;
  isFieldTouched: (name: NamePath<Values>) => boolean;
  isFieldValidating: (name: NamePath<Values>) => boolean;
  resetFields: (fields?: NamePath<Values>[]) => void;
  setFields: (fields: FieldData<Values>[]) => void;
  setFieldsValue: (values: RecursivePartial<Values>) => void;
  setFieldValue: (name: NamePath<Values>, value: any) => void;
  // New API
  submit: () => void;

  validateFields: ValidateFields<Values>;
}

export type FormRef<Values = any> = FormInstance<Values> & {
  nativeElement?: HTMLElement;
};

export type InternalFormInstance = Omit<FormInstance, 'validateFields'> & {
  /** @private Internal usage. Do not use it in your production */
  _init?: boolean;

  /**
   * Form component should register some content into store.
   * We pass the `HOOK_MARK` as key to avoid user call the function.
   */
  getInternalHooks: (secret: string) => InternalHooks | null;

  /**
   * Passed by field context props
   */
  prefixName?: InternalNamePath;

  validateFields: InternalValidateFields;

  validateTrigger?: false | string | string[];
};

export type EventArgs = any[];

type ValidateMessage = (() => string) | string;
export interface ValidateMessages {
  array?: {
    len?: ValidateMessage;
    max?: ValidateMessage;
    min?: ValidateMessage;
    range?: ValidateMessage;
  };
  date?: {
    format?: ValidateMessage;
    invalid?: ValidateMessage;
    parse?: ValidateMessage;
  };
  default?: ValidateMessage;
  enum?: ValidateMessage;
  number?: {
    len?: ValidateMessage;
    max?: ValidateMessage;
    min?: ValidateMessage;
    range?: ValidateMessage;
  };
  pattern?: {
    mismatch?: ValidateMessage;
  };
  required?: ValidateMessage;
  string?: {
    len?: ValidateMessage;
    max?: ValidateMessage;
    min?: ValidateMessage;
    range?: ValidateMessage;
  };
  types?: {
    array?: ValidateMessage;
    boolean?: ValidateMessage;
    date?: ValidateMessage;
    email?: ValidateMessage;
    float?: ValidateMessage;
    hex?: ValidateMessage;
    integer?: ValidateMessage;
    method?: ValidateMessage;
    number?: ValidateMessage;
    object?: ValidateMessage;
    regexp?: ValidateMessage;
    string?: ValidateMessage;
    tel?: ValidateMessage;
    url?: ValidateMessage;
  };
  whitespace?: ValidateMessage;
}

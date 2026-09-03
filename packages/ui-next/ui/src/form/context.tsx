import type { InjectionKey, Ref } from 'vue';

import type { Key } from '@arvin-studio/headless';

import type { SemanticClassNames, SemanticStyles } from '../_util/hooks';
import type { Variant } from '../config-provider/context';
import type { FormLayout, FormSemanticName, RequiredMark } from './Form';
import type { FeedbackIcons, ValidateStatus } from './FormItem';
import type { ColPropsWithClass, FormTooltipProps } from './FormItemLabel';
import type { FormLabelAlign } from './interface';
import type {
  InternalNamePath,
  Meta,
  NamePath,
  Rule,
  RulesMap,
  ValidateMessages,
} from './types.ts';

import { computed, defineComponent, inject, provide, ref } from 'vue';

/** Form Context. Set top form style and pass to Form Item usage. */
export interface FormFieldRegister {
  clearValidate: () => void;
  getMeta: () => Meta;
  getValue: () => any;
  isFieldDirty?: () => boolean;
  namePath: () => InternalNamePath;
  resetField: () => void;
  rules?: () => Rule[];
  setFieldState?: (
    state: Partial<Meta> & { errors?: any[]; value?: any; warnings?: any[] },
  ) => void;
  validateRules: (options?: Record<string, any>) => Promise<void>;
}

export interface FormContextProps {
  addField?: (eventKey: string, field: FormFieldRegister) => void;
  addItem?: (namePathStr: string, instance: any) => void;
  classes?: SemanticClassNames<FormSemanticName>;
  clearOnDestroy?: boolean;
  colon?: boolean;
  feedbackIcons?: FeedbackIcons;
  getFieldsValue?: (nameList?: InternalNamePath[] | true) => any;
  getFieldValue?: (namePath: InternalNamePath) => any;
  labelAlign?: FormLabelAlign;
  labelCol?: ColPropsWithClass;
  labelWrap?: boolean;
  layout: FormLayout;
  model?: Record<string, any>;
  name?: string;
  onValidate?: (
    name: InternalNamePath,
    status: boolean,
    errors: any[] | null,
  ) => void;
  preserve?: boolean;
  removeField?: (eventKey: string) => void;
  removeItem?: (namePathStr: string) => void;
  requiredMark?: RequiredMark;
  rules?: RulesMap;
  styles?: SemanticStyles<FormSemanticName>;
  tooltip?: FormTooltipProps;
  triggerFieldsChange?: (namePathList?: InternalNamePath[]) => void;
  triggerValuesChange?: (namePath: InternalNamePath, value: any) => void;
  validateMessages?: ValidateMessages;
  validateTrigger?: false | string | string[];
  wrapperCol?: ColPropsWithClass;
}

const FormContextKey: InjectionKey<Ref<FormContextProps>> =
  Symbol('FormContextKey');

export function useFormContextProvider(value: Ref<FormContextProps>) {
  provide(FormContextKey, value);
}

export function useFormContext() {
  return inject(
    FormContextKey,
    ref<FormContextProps>({
      labelAlign: 'right',
      layout: 'horizontal',
    }),
  ) as Ref<FormContextProps>;
}

const FormItemPrefixContextKey: InjectionKey<Ref<FormItemPrefixContextProps>> =
  Symbol('FormItemPrefixContextKey');

/** Used for ErrorList only */
export interface FormItemPrefixContextProps {
  prefixCls: string;
  status?: ValidateStatus;
}

export function useFormItemPrefixContextProvider(
  value: Ref<FormItemPrefixContextProps>,
) {
  provide(FormItemPrefixContextKey, value);
}

export const FormItemPrefixContextProvider =
  defineComponent<FormItemPrefixContextProps>((props, { slots }) => {
    useFormItemPrefixContextProvider(computed(() => props));
    return () => {
      return slots?.default?.();
    };
  });

export function useFormItemPrefixContext() {
  return inject(
    FormItemPrefixContextKey,
    ref({
      prefixCls: '',
    }),
  );
}

const VariantContextKey: InjectionKey<Ref<undefined | Variant>> =
  Symbol('VariantContextKey');
export function useVariantContextProvider(variant: Ref<undefined | Variant>) {
  provide(VariantContextKey, variant);
}

export function useVariantContext() {
  return inject(VariantContextKey, ref(undefined));
}

export interface FormItemStatusContextProps {
  errors?: any[];
  feedbackIcon?: any;
  hasFeedback?: boolean;
  isFormItemInput?: boolean;
  name?: NamePath;
  status?: ValidateStatus;
  warnings?: any[];
}

const FormItemInputContextKey: InjectionKey<Ref<FormItemStatusContextProps>> =
  Symbol('FormItemInputContextKey');

export function useFormItemInputContextProvider(
  value: Ref<FormItemStatusContextProps>,
) {
  provide(FormItemInputContextKey, value);
}
export function useFormItemInputContext() {
  return inject(FormItemInputContextKey, ref({} as FormItemStatusContextProps));
}

/** `noStyle` Form Item Context. Used for error collection */
export type ReportMetaChange = (meta: Meta, uniqueKeys: Key[]) => void;
const NoStyleItemContextKey: InjectionKey<null | ReportMetaChange> = Symbol(
  'NoStyleItemContextKey',
);

export function useNoStyleItemContextProvider(value: ReportMetaChange) {
  provide(NoStyleItemContextKey, value);
}

export const NoStyleItemContextProvider = defineComponent<{
  value: ReportMetaChange;
}>(
  (props, { slots }) => {
    useNoStyleItemContextProvider(props.value);
    return () => {
      return slots?.default?.();
    };
  },
  {
    name: 'NoStyleItemContext',
  },
);

export function useNoStyleItemContext() {
  return inject(NoStyleItemContextKey, null);
}

export const NoFormStyle = defineComponent<{
  override?: boolean;
  status?: boolean;
}>((props, { slots }) => {
  const formItemInputContext = useFormItemInputContext();
  const newFormItemInputContext = computed(() => {
    const { override, status } = props;
    const newContext = { ...formItemInputContext.value };
    if (override) {
      delete newContext.isFormItemInput;
    }
    if (status) {
      delete newContext.status;
      delete newContext.hasFeedback;
      delete newContext.feedbackIcon;
    }
    return newContext;
  });
  useFormItemInputContextProvider(newFormItemInputContext);
  return () => {
    return slots?.default?.();
  };
});

export interface FormItemProviderProps {
  clearValidate: () => void;
  fieldId: Ref<string | undefined>;
  triggerBlur: () => void;
  triggerChange: () => void;
  triggerFocus: () => void;
}

const FormItemProviderContextKey: InjectionKey<FormItemProviderProps> = Symbol(
  'FormItemProviderContextKey',
);
export function useFormItemProvider(value: FormItemProviderProps) {
  provide(FormItemProviderContextKey, value);
}

export function useFormItemContext(rest = false) {
  if (rest) {
    useFormItemProviderRest();
  }
  return inject(FormItemProviderContextKey, undefined);
}

export function useFormItemProviderRest() {
  return provide(FormItemProviderContextKey, {
    fieldId: ref(undefined),
    triggerChange: () => {},
    triggerBlur: () => {},
    clearValidate: () => {},
    triggerFocus: () => {},
  });
}

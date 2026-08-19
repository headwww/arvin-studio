import type { InjectionKey, Ref } from 'vue';

import type { ValidateStatus } from '../_util/statusUtils';
import type { Variant } from '../config-provider/context';

import { inject, provide, ref } from 'vue';

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
  // TODO name?: NamePath;
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

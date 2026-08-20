import type { InjectionKey, Ref } from 'vue';

import type {
  RadioGroupContextProps,
  RadioOptionTypeContextProps,
} from './interface';

import { inject, provide } from 'vue';

const RadioGroupContextKey: InjectionKey<Ref<RadioGroupContextProps>> = Symbol(
  'RadioGroupContextKey',
);

export function useRadioGroupContextProvider(
  value: Ref<RadioGroupContextProps>,
) {
  provide(RadioGroupContextKey, value);
}

export function useRadioGroupContext() {
  return inject(RadioGroupContextKey, undefined);
}

const RadioOptionTypeContextKey: InjectionKey<
  Ref<RadioOptionTypeContextProps>
> = Symbol('RadioOptionTypeContext');

export function useRadioOptionTypeContextProvider(
  value: Ref<RadioOptionTypeContextProps>,
) {
  provide(RadioOptionTypeContextKey, value);
}

export function useRadioOptionTypeContext() {
  return inject(RadioOptionTypeContextKey, undefined);
}

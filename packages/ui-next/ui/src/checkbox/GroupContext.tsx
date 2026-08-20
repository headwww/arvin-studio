import type { InjectionKey, Ref } from 'vue';

import type { CheckboxOptionType } from './Group.tsx';

import { inject, provide } from 'vue';

export interface CheckboxGroupContext {
  cancelValue: (val: any) => void;
  disabled?: boolean;
  name?: string;
  registerValue: (val: any) => void;
  toggleOption?: (option: CheckboxOptionType) => void;
  value?: any;
}

const GroupContextKey: InjectionKey<Ref<CheckboxGroupContext>> =
  Symbol('GroupContext');
export function useGroupContextProvider(value: Ref<CheckboxGroupContext>) {
  provide(GroupContextKey, value);
}
export function useGroupContext() {
  return inject(GroupContextKey, undefined);
}

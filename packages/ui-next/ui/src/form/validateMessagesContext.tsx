import type { InjectionKey, Ref } from 'vue';

import type { ValidateMessages } from './types';

import { inject, provide } from 'vue';

const ValidateMessagesContextKey: InjectionKey<Ref<ValidateMessages>> = Symbol(
  'ValidateMessagesContext',
);
export function useValidateMessagesProvider(
  validateMessages: Ref<ValidateMessages>,
) {
  provide(ValidateMessagesContextKey, validateMessages);
}

export function useValidateMessagesContext() {
  return inject(ValidateMessagesContextKey, undefined);
}

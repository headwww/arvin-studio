import type { InjectionKey, Ref } from 'vue';

import { inject, provide, ref } from 'vue';

export interface InternalContextProps {
  itemComponent: string;
  rootComponent: string;
}

const InternalContext: InjectionKey<Ref<InternalContextProps>> =
  Symbol('InternalContext');

export function provideInternalContext(value: Ref<InternalContextProps>) {
  provide(InternalContext, value);
}
/**
 * When use this context. Will trade as sub component instead of root Steps component.
 */
export function useInternalContext() {
  return inject(
    InternalContext,
    ref(null) as any,
  ) as Ref<InternalContextProps | null>;
}

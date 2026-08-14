import type { InjectionKey, Ref } from 'vue';
import { computed, defineComponent, inject, provide } from 'vue';

export interface IconContextProps {
  prefixCls?: string;
  rootClass?: string;
  csp?: { nonce?: string };
  layer?: string;
  zeroRuntime?: boolean;
}

const IconContextKey: InjectionKey<Ref<IconContextProps>> =
  Symbol('IconContext');

export function useProvideIconContext(context: Ref<IconContextProps>) {
  provide(IconContextKey, context);
}

export const IconContextProvider = defineComponent<IconContextProps>(
  (props, { slots }) => {
    useProvideIconContext(computed(() => props));
    return () => {
      return slots?.default?.();
    };
  },
);

export function useIconContext() {
  return inject(
    IconContextKey,
    computed<IconContextProps>(() => ({})),
  );
}

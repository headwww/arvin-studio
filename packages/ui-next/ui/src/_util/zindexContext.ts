import type { InjectionKey, Ref } from 'vue';

import { computed, defineComponent, inject, provide, ref } from 'vue';

const ZIndexContextKey: InjectionKey<Ref<null | number | undefined>> =
  Symbol('ZIndexContextKey');
export function useZIndexContext() {
  return inject(ZIndexContextKey, ref(undefined));
}

export function useZIndexProvider(zIndex: Ref<number | undefined>) {
  provide(ZIndexContextKey, zIndex);
}

export const ZIndexProvider = defineComponent(
  (props, { slots }) => {
    const zIndex = computed(() => {
      return props.value;
    });
    useZIndexProvider(zIndex);
    return () => {
      return slots?.default?.();
    };
  },
  {
    props: ['value'],
  },
);

import type { ComputedRef, InjectionKey, PropType } from 'vue';

import type { Key } from '../util';

import { computed, defineComponent, inject, provide } from 'vue';

export interface OverflowContextType {
  className?: string;
  display: boolean;
  invalidate: boolean;
  // Item Usage
  item?: any;
  itemKey?: Key;

  order: number;

  prefixCls: string;
  registerSize: (key: Key, width: null | number) => void;
  responsive: boolean;
}

const OverflowContextKey: InjectionKey<
  ComputedRef<null | OverflowContextType>
> = Symbol('OverflowContext');

export const OverflowContextProvider = defineComponent({
  name: 'OverflowContextProvider',
  inheritAttrs: false,
  props: {
    value: { type: Object as PropType<any> },
  },
  setup(props, { slots }) {
    provide(
      OverflowContextKey,
      computed(() => props.value!),
    );
    return () => slots.default?.();
  },
});

export function useInjectOverflowContext() {
  return inject(OverflowContextKey, null);
}

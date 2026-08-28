import type { InjectionKey, Ref } from 'vue';

// Used for Dropdown only
import type { VueNode } from '../_util';
import type { MenuProps } from './menu';

import { computed, defineComponent, inject, provide } from 'vue';

import { ContextIsolator } from '../_util/ContextIsolator';

export interface OverrideContextProps {
  expandIcon?: VueNode;
  mode?: MenuProps['mode'];
  onClick?: () => void;
  prefixCls?: string;
  rootClass?: string;
  selectable?: boolean;
  validator?: (menuProps: Pick<MenuProps, 'mode'>) => void;
}

const OverrideContextKey: InjectionKey<null | Ref<OverrideContextProps>> =
  Symbol('OverrideContext');

export function useOverrideContext() {
  return inject(OverrideContextKey, null);
}
/** @internal Only used for Dropdown component. Do not use this in your production. */
export const OverrideProvider = defineComponent<{
  value?: null | OverrideContextProps;
}>((props, { slots }) => {
  const override = useOverrideContext();
  const value = computed(() => {
    const _override = override?.value ?? {};
    return {
      ..._override,
      ...props?.value,
    };
  });
  provide(OverrideContextKey, value);
  return () => {
    return <ContextIsolator space>{slots?.default?.()}</ContextIsolator>;
  };
});

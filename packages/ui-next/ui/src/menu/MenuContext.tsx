import type { InjectionKey, Ref } from 'vue';

import type { DirectionType } from '../config-provider/context';
import type {
  MenuPopupSemanticClassNames,
  MenuPopupSemanticStyles,
  MenuSemanticClassNames,
  MenuSemanticStyles,
  SubMenuSemanticClassNames,
  SubMenuSemanticStyles,
} from './menu';

import { computed, defineComponent, inject, provide, ref } from 'vue';

export type MenuTheme = 'dark' | 'light';

export interface MenuContextProps {
  classes: MenuSemanticClassNames & {
    popup?: MenuPopupSemanticClassNames;
    subMenu?: SubMenuSemanticClassNames;
  };
  direction?: DirectionType;
  /** @internal Safe to remove */
  disableMenuItemTitleTooltip?: boolean;
  firstLevel: boolean;
  inlineCollapsed: boolean;
  prefixCls: string;
  styles?: MenuSemanticStyles & {
    popup?: MenuPopupSemanticStyles;
    subMenu?: SubMenuSemanticStyles;
  };
  theme?: MenuTheme;
}

const MenuContextKey: InjectionKey<Ref<MenuContextProps>> =
  Symbol('MenuContext');

export function useMenuContextProvider(props: Ref<MenuContextProps>) {
  provide(MenuContextKey, props);
}

export function useMenuContext(): Ref<MenuContextProps> {
  return inject(
    MenuContextKey,
    ref({
      prefixCls: '',
      firstLevel: true,
      inlineCollapsed: false,
      styles: null!,
      classes: null!,
    } as unknown as MenuContextProps),
  );
}

export const MenuContextProvider = defineComponent<{ value: MenuContextProps }>(
  (props, { slots }) => {
    const value = computed(() => props.value);
    useMenuContextProvider(value);
    return () => {
      return slots?.default?.();
    };
  },
);

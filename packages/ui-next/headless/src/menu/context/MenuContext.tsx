import type { InjectionKey, Ref } from 'vue';

import type { CSSMotionProps } from '../../util/transition';
import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  TriggerSubMenuAction,
} from '../interface.ts';
import type { SubMenuProps } from '../SubMenu';

import { computed, defineComponent, inject, provide } from 'vue';

import { omit } from '@arvin-studio/kit';

export interface MenuContextProps {
  // Active
  activeKey: string;
  builtinPlacements?: BuiltinPlacements;
  classes?: SubMenuProps['classes'];
  defaultMotions?: Partial<{ [key in 'other' | MenuMode]: CSSMotionProps }>;
  // Disabled
  disabled?: boolean;
  expandIcon?: RenderIconType;

  forceSubMenuRender?: boolean;

  getPopupContainer: (node: HTMLElement) => HTMLElement;
  // Level
  inlineIndent: number;

  // Icon
  itemIcon?: RenderIconType;
  // Mode
  mode: MenuMode;
  // Motion
  motion?: CSSMotionProps;

  onActive: (key: string) => void;

  onInactive: (key: string) => void;

  // Function
  onItemClick: MenuClickEventHandler;
  onOpenChange: (key: string, open: boolean) => void;

  openKeys: string[];
  // Used for overflow only. Prevent hidden node trigger open
  overflowDisabled?: boolean;
  popupRender?: PopupRender;
  prefixCls: string;
  rootClass?: string;

  rtl?: boolean;

  // Selection
  selectedKeys: string[];
  styles?: SubMenuProps['styles'];

  subMenuCloseDelay: number;
  // Popup
  subMenuOpenDelay: number;
  triggerSubMenuAction?: TriggerSubMenuAction;
}

const MenuContextKey: InjectionKey<Ref<MenuContextProps>> =
  Symbol('MenuContextKey');

function mergeProps(
  origin: MenuContextProps,
  target: Partial<MenuContextProps>,
): MenuContextProps {
  const clone = { ...origin };

  Object.keys(target).forEach((key) => {
    const value = (target as any)[key];
    if (value !== undefined) {
      (clone as any)[key] = value;
    }
  });

  return clone;
}

export interface InheritableContextProps extends Partial<MenuContextProps> {
  locked?: boolean;
}

export function useMenuContext() {
  return inject(MenuContextKey, null);
}

export function useMenuContextProvider(context: Ref<MenuContextProps>) {
  provide(MenuContextKey, context);
}

const InheritableContextProvider = defineComponent<InheritableContextProps>(
  (props, { slots }) => {
    const context = useMenuContext();
    const inheritContext = computed(() => {
      return mergeProps((context?.value ?? {}) as any, omit(props, ['locked']));
    });
    useMenuContextProvider(inheritContext);
    return () => {
      return slots?.default?.();
    };
  },
  {
    inheritAttrs: false,
  },
);

export default InheritableContextProvider;

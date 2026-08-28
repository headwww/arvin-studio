import type { CSSProperties, SlotsType } from 'vue';

import type {
  MenuInfo,
  MenuItemProps,
  RenderIconInfo,
  SelectInfo,
  MenuProps as VcMenuProps,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type { ItemType } from './interface.ts';
import type { MenuContextProps, MenuTheme } from './MenuContext';

import {
  computed,
  createVNode,
  defineComponent,
  isVNode,
  shallowRef,
} from 'vue';

import { filterEmpty, ExportMenu as VcMenu } from '@arvin-studio/headless';
import { EllipsisOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import initCollapseMotion from '../_util/motion';
import { toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { MenuContextProvider } from './MenuContext';
import Divider from './MenuDivider';
import MenuItem from './MenuItem';
import { OverrideProvider, useOverrideContext } from './OverrideContext';
import useStyle from './style';
import SubMenu from './SubMenu';

const omitPropKeys = [
  'prefixCls',
  'theme',
  'expandIcon',
  '_internalDisableMenuItemTitleTooltip',
  'inlineCollapsed',
  'siderCollapsed',
  'rootClass',
  'collapsedWidth',
  'mode',
  'selectable',
  'onClick',
  'overflowedIndicatorPopupClassName',
  'classes',
  'styles',
  'itemIcon',
  'labelRender',
  'extraRender',
];
const MENU_COMPONENTS: any = {
  item: MenuItem,
  submenu: SubMenu,
  divider: Divider,
};
function isEmptyIcon(icon?: VueNode) {
  return icon === null || icon === false;
}

export type MenuSemanticName = keyof MenuSemanticClassNames &
  keyof MenuSemanticStyles;

export interface MenuSemanticClassNames {
  item?: string;
  itemContent?: string;
  itemIcon?: string;
  itemTitle?: string;
  list?: string;
  root?: string;
}

export interface MenuSemanticStyles {
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemIcon?: CSSProperties;
  itemTitle?: CSSProperties;
  list?: CSSProperties;
  root?: CSSProperties;
}

export type SubMenuSemanticName = keyof SubMenuSemanticClassNames &
  keyof SubMenuSemanticStyles;

export interface SubMenuSemanticClassNames {
  item?: string;
  itemContent?: string;
  itemIcon?: string;
  itemTitle?: string;
  list?: string;
}

export interface SubMenuSemanticStyles {
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemIcon?: CSSProperties;
  itemTitle?: CSSProperties;
  list?: CSSProperties;
}

export type MenuPopupSemanticName = keyof MenuPopupSemanticClassNames &
  keyof MenuPopupSemanticStyles;

export interface MenuPopupSemanticClassNames {
  root?: string;
}

export interface MenuPopupSemanticStyles {
  root?: CSSProperties;
}

type MenuClassNamesSchemaType = MenuSemanticClassNames & {
  popup?: MenuPopupSemanticClassNames | string;
  subMenu?: SubMenuSemanticClassNames;
};

type MenuStylesSchemaType = MenuSemanticStyles & {
  popup?: CSSProperties | MenuPopupSemanticStyles;
  subMenu?: SubMenuSemanticStyles;
};

export type MenuClassNamesType =
  | ((info: { props: MenuProps }) => MenuClassNamesSchemaType)
  | MenuClassNamesSchemaType;

export type MenuStylesType =
  | ((info: { props: MenuProps }) => MenuStylesSchemaType)
  | MenuStylesSchemaType;

export interface RenderItem {
  [key: string]: any;
  danger?: boolean;
  disabled?: boolean;
  key: number | string;
  label?: any;
  theme?: 'dark' | 'light';
  title?: string;
  type?: 'divider' | 'group' | 'item' | 'submenu';
}

export interface MenuProps extends Omit<
  VcMenuProps,
  | '_internalComponents'
  | 'activeKey'
  | 'classes'
  | 'defaultActiveFirst'
  | 'extraRender'
  | 'iconRender'
  | 'itemIcon'
  | 'items'
  | 'labelRender'
  | 'onClick'
  | 'onDeselect'
  | 'onOpenChange'
  | 'onSelect'
  | 'rootClass'
  | 'styles'
> {
  // >>>>> Private
  /**
   * @private Internal Usage. Not promise crash if used in production. Connect with chenshuai2144
   *   for removing.
   */
  _internalDisableMenuItemTitleTooltip?: boolean;
  classes?: MenuClassNamesType;

  extraRender?: (item: RenderItem) => any;
  iconRender?: (item: RenderItem) => any;
  inlineIndent?: number;
  itemIcon?: (props: MenuItemProps & RenderIconInfo) => any;
  items?: ItemType[];
  labelRender?: (item: RenderItem) => any;
  rootClass?: string;
  styles?: MenuStylesType;
  theme?: MenuTheme;
}

type InternalMenuProps = MenuProps & {
  collapsedWidth?: number | string;
  siderCollapsed?: boolean;
};

export interface MenuEmits {
  click: (info: MenuInfo) => void;
  deselect: (info: SelectInfo) => void;
  openChange: (openKeys: string[]) => void;
  select: (info: SelectInfo) => void;
  'update:openKeys': (openKeys: string[]) => void;
  'update:selectedKeys': (selectedKeys: string[]) => void;
}

export interface MenuEmitsProps {
  onClick?: MenuEmits['click'];
  onDeselect?: MenuEmits['deselect'];
  onOpenChange?: MenuEmits['openChange'];
  onSelect?: MenuEmits['select'];
  'onUpdate:openKeys'?: MenuEmits['update:openKeys'];
  'onUpdate:selectedKeys'?: MenuEmits['update:selectedKeys'];
}

export interface MenuSlots {
  default: () => any;
  expandIcon: () => any;
  extraRender?: (item: RenderItem) => any;
  iconRender?: (item: RenderItem) => any;
  itemIcon?: (props: MenuItemProps & RenderIconInfo) => any;
  labelRender?: (item: RenderItem) => any;
}

const defaults = {
  theme: 'light',
} as any;
interface InternalMenuRuntimeProps
  extends
    InternalMenuProps,
    /* @vue-ignore */
    MenuEmitsProps {}

const InternalMenu = defineComponent<
  InternalMenuRuntimeProps,
  MenuEmits,
  string,
  SlotsType<MenuSlots>
>(
  (props = defaults, { slots, emit, attrs, expose }) => {
    const override = useOverrideContext();
    const overrideObj = computed(() => {
      if (!override?.value) {
        return {};
      }
      return override?.value;
    });
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const {
      getPrefixCls,
      direction,
      getPopupContainer,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      expandIcon: contextExpandIcon,
    } = useComponentBaseConfig('menu', props, ['expandIcon']);
    const prefixCls = computed(() =>
      getPrefixCls('menu', props?.prefixCls || overrideObj.value?.prefixCls),
    );
    const rootPrefixCls = computed(() => getPrefixCls());

    overrideObj?.value?.validator?.({ mode: props.mode });
    // ========================== Click ==========================
    // Tell dropdown that item clicked
    const onItemClick: VcMenuProps['onClick'] = (...args) => {
      emit('click', ...args);
      overrideObj?.value?.onClick?.();
    };
    // ========================== Mode ===========================
    const mergedMode = computed(() => {
      return overrideObj?.value?.mode || props?.mode;
    });

    // ======================= Selectable ========================
    const mergedSelectable = computed(
      () => props?.selectable ?? overrideObj?.value?.selectable,
    );

    // ======================== Collapsed ========================
    // Inline Collapsed
    const mergedInlineCollapsed = computed(
      () => props?.inlineCollapsed ?? props?.siderCollapsed,
    );

    // ================ Merged Props for Semantic ================
    const mergedProps = computed(() => {
      return {
        ...props,
        mode: mergedMode.value,
        inlineCollapsed: mergedInlineCollapsed.value,
        selectable: mergedSelectable.value,
      } as MenuProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      MenuClassNamesType,
      MenuStylesType,
      MenuProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
      computed(() => ({
        popup: {
          _default: 'root',
        },
        subMenu: {
          _default: 'item',
        },
      })),
    );

    const defaultMotions: MenuProps['defaultMotions'] = {
      horizontal: { name: `${rootPrefixCls.value}-slide-up` },
      inline: initCollapseMotion(rootPrefixCls.value),
      other: { name: `${rootPrefixCls.value}-zoom-big` },
    };

    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls, !override?.value);
    // ======================== Context ==========================
    const contextValue = computed(() => ({
      prefixCls: prefixCls.value,
      inlineCollapsed: mergedInlineCollapsed.value || false,
      direction: direction.value,
      firstLevel: true,
      theme: props.theme,
      mode: mergedMode.value,
      disableMenuItemTitleTooltip: props._internalDisableMenuItemTitleTooltip,
      classes: mergedClassNames.value as MenuContextProps['classes'],
      styles: mergedStyles.value as MenuContextProps['styles'],
    }));

    const menuRef = shallowRef<any>();
    expose({
      menu: menuRef,
    });
    return () => {
      // ====================== ExpandIcon ========================
      const expandIcon = slots?.expandIcon ?? props?.expandIcon;
      const mergedExpandIcon = (props: any) => {
        if (typeof expandIcon === 'function' || isEmptyIcon(expandIcon)) {
          return expandIcon || null;
        }

        if (
          typeof overrideObj.value?.expandIcon === 'function' ||
          isEmptyIcon(overrideObj.value?.expandIcon)
        ) {
          return overrideObj.value.expandIcon || null;
        }

        if (
          typeof contextExpandIcon.value === 'function' ||
          isEmptyIcon(contextExpandIcon.value as any)
        ) {
          return contextExpandIcon.value || null;
        }

        const mergedIcon =
          expandIcon ??
          overrideObj?.value.expandIcon ??
          contextExpandIcon.value;
        const icon =
          typeof mergedIcon === 'function'
            ? (mergedIcon as any)?.(props)
            : mergedIcon;
        const iconChild = filterEmpty(Array.isArray(icon) ? icon : [icon])[0];
        if (isVNode(iconChild)) {
          return createVNode(iconChild, {
            class: `${prefixCls.value}-submenu-expand-icon`,
          });
        }
      };
      const _getPopupContainer = props?.getPopupContainer ?? getPopupContainer;
      const { theme, overflowedIndicatorPopupClassName, rootClass } = props;
      const passedProps = omit(props, omitPropKeys);
      const menuClassName = clsx(
        `${prefixCls.value}-${theme}`,
        contextClassName.value,
        (attrs as any).class,
      );
      const itemIcon = slots?.itemIcon ?? props?.itemIcon;
      const labelRender = slots?.labelRender ?? props?.labelRender;
      const extraRender = slots?.extraRender ?? props?.extraRender;
      const iconRender = slots?.iconRender ?? props?.iconRender;
      // ========================= Render ==========================
      return (
        <OverrideProvider value={null}>
          <MenuContextProvider value={contextValue.value as any}>
            <VcMenu
              classes={
                {
                  list: mergedClassNames.value?.list,
                  listTitle: mergedClassNames.value?.itemTitle,
                } as any
              }
              getPopupContainer={_getPopupContainer}
              mode={mergedMode.value}
              overflowedIndicator={<EllipsisOutlined />}
              overflowedIndicatorPopupClassName={clsx(
                prefixCls.value,
                `${prefixCls.value}-${theme}`,
                overflowedIndicatorPopupClassName,
              )}
              selectable={mergedSelectable.value}
              styles={
                {
                  list: mergedStyles.value?.list,
                  listTitle: mergedStyles.value?.itemTitle,
                } as any
              }
              {...passedProps}
              _internalComponents={MENU_COMPONENTS}
              class={menuClassName}
              defaultMotions={defaultMotions}
              direction={direction.value}
              expandIcon={mergedExpandIcon}
              extraRender={extraRender as any}
              iconRender={iconRender as any}
              inlineCollapsed={mergedInlineCollapsed.value as any}
              itemIcon={itemIcon}
              labelRender={labelRender as any}
              onClick={onItemClick}
              onDeselect={(info) => {
                emit('deselect', info);
                emit('update:selectedKeys', info.selectedKeys);
              }}
              onOpenChange={(...args) => {
                emit('openChange', ...args);
                emit('update:openKeys', ...args);
              }}
              onSelect={(info) => {
                emit('select', info);
                emit('update:selectedKeys', info.selectedKeys);
              }}
              prefixCls={prefixCls.value}
              ref={menuRef as any}
              rootClass={clsx(
                rootClass,
                hashId.value,
                overrideObj?.value?.rootClass,
                cssVarCls.value,
                rootCls.value,
                mergedClassNames.value?.root,
              )}
              style={{
                ...mergedStyles.value?.root,
                ...(attrs as any).style,
              }}
            >
              {slots?.default?.()}
            </VcMenu>
          </MenuContextProvider>
        </OverrideProvider>
      );
    };
  },
  {
    name: 'InternalMenu',
    inheritAttrs: false,
  },
);

export default InternalMenu;

import type { App, CSSProperties, SlotsType } from 'vue';

import type {
  AlignType,
  MenuInfo,
  MenuProps as VcMenuProps,
} from '@arvin-studio/headless';

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { AdjustOverflow } from '../_util/placements';
import type { ComponentBaseProps } from '../config-provider/context';
import type { MenuEmits, MenuProps, MenuSlots } from '../menu';

import {
  computed,
  createVNode,
  defineComponent,
  isVNode,
  shallowRef,
  watch,
} from 'vue';

import { filterEmpty, Dropdown as VcDropdown } from '@arvin-studio/headless';
import { LeftOutlined, RightOutlined } from '@arvin-studio/icons';
import { clsx, omit } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useToArr,
  useToProps,
  useZIndex,
} from '../_util/hooks';
import getPlacements from '../_util/placements';
import genPurePanel from '../_util/PurePanel';
import { toPropsRefs } from '../_util/tools';
import { devUseWarning } from '../_util/warning';
import { ZIndexProvider } from '../_util/zindexContext';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Menu from '../menu';
import { OverrideProvider } from '../menu/OverrideContext';
import { useToken } from '../theme/internal';
import useStyle from './style';

const _Placements = [
  'topLeft',
  'topCenter',
  'topRight',
  'bottomLeft',
  'bottomCenter',
  'bottomRight',
  'top',
  'bottom',
  'left',
  'leftTop',
  'leftBottom',
  'right',
  'rightTop',
  'rightBottom',
] as const;

type Placement = (typeof _Placements)[number];

type DropdownPlacement = Exclude<Placement, 'bottomCenter' | 'topCenter'>;

export interface DropdownArrowOptions {
  pointAtCenter?: boolean;
}

export type DropdownSemanticName = keyof DropdownSemanticClassNames &
  keyof DropdownSemanticStyles;

export interface DropdownSemanticClassNames {
  item?: string;
  itemContent?: string;
  itemIcon?: string;
  itemTitle?: string;
  root?: string;
}

export interface DropdownSemanticStyles {
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemIcon?: CSSProperties;
  itemTitle?: CSSProperties;
  root?: CSSProperties;
}

export type DropdownClassNamesType = SemanticClassNamesType<
  DropdownProps,
  DropdownSemanticClassNames
>;

export type DropdownStylesType = SemanticStylesType<
  DropdownProps,
  DropdownSemanticStyles
>;

export interface DropdownProps
  extends
    ComponentBaseProps,
    /* @vue-ignore */
    DropdownEmitsProps {
  align?: AlignType;
  arrow?: boolean | DropdownArrowOptions;
  // children?: ReactNode;
  autoAdjustOverflow?: AdjustOverflow | boolean;
  autoFocus?: boolean;
  classes?: DropdownClassNamesType;
  destroyOnHidden?: boolean;
  disabled?: boolean;
  forceRender?: boolean;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  menu?: MenuProps & {
    activeKey?: VcMenuProps['activeKey'];
    onClick?: MenuEmits['click'];
  };
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  // onOpenChange?: (open: boolean, info: { source: 'trigger' | 'menu' }) => void;
  open?: boolean;

  openClassName?: string;
  placement?: Placement;
  popupRender?: (Vnode: any) => any;
  prefixCls?: string;
  styles?: DropdownStylesType;
  transitionName?: string;
  trigger?: ('click' | 'contextmenu' | 'contextMenu' | 'hover')[];
}

export interface DropdownEmits {
  menuClick: MenuEmits['click'];
  openChange: (open: boolean, info: { source: 'menu' | 'trigger' }) => void;
  'update:open': (open: boolean) => void;
}
export interface DropdownEmitsProps {
  onMenuClick?: DropdownEmits['menuClick'];
  onOpenChange?: DropdownEmits['openChange'];
  'onUpdate:open'?: DropdownEmits['update:open'];
}

export interface DropdownSlots extends MenuSlots {
  popupRender: (info: { open: boolean; source: 'menu' | 'trigger' }) => any;
}

const defaults = {
  mouseEnterDelay: 0.15,
  mouseLeaveDelay: 0.1,
  placement: '',
  autoAdjustOverflow: true,
} as any;

const Dropdown = defineComponent<
  DropdownProps,
  DropdownEmits,
  string,
  SlotsType<DropdownSlots>
>(
  (props = defaults, { slots, emit, attrs }) => {
    const {
      getPrefixCls,
      prefixCls,
      direction,
      getPopupContainer: getContextPopupContainer,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('dropdown', props);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');

    const mergedProps = computed(() => {
      return props;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      DropdownClassNamesType,
      DropdownStylesType,
      DropdownProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    const memoPlacement = computed(() => {
      const { placement } = props;
      if (!placement) {
        return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
      }
      if (placement.includes('Center')) {
        return placement.slice(
          0,
          placement.indexOf('Center'),
        ) as DropdownPlacement;
      }
      return placement as DropdownPlacement;
    });

    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
    const [, token] = useToken();

    // =================== Warning =====================
    const warning = devUseWarning('Dropdown');

    const triggerActions = computed(() => {
      if (props.disabled) return [];
      // 兼容处理：将 contextMenu 转换为 contextmenu
      if (
        typeof props.trigger === 'string' &&
        props.trigger === 'contextmenu'
      ) {
        return ['contextMenu'];
      }
      if (Array.isArray(props.trigger)) {
        return props.trigger?.map(
          (t) =>
            (t === 'contextmenu' ? 'contextMenu' : t) as
              | 'click'
              | 'contextMenu'
              | 'hover',
        );
      }
      return props?.trigger;
    });

    const alignPoint = computed(
      () => !!triggerActions.value?.includes?.('contextMenu'),
    );

    // =========================== Open ============================
    const mergedOpen = shallowRef(props.open ?? false);
    watch(
      () => props.open,
      (value) => {
        mergedOpen.value = value ?? false;
      },
    );
    const onInnerOpenChange = (nextOpen: boolean) => {
      if (props.open === undefined) {
        mergedOpen.value = nextOpen;
      }
      emit('openChange', nextOpen, { source: 'trigger' });
      emit('update:open', nextOpen);
    };

    const builtinPlacements = computed(() =>
      getPlacements({
        arrowPointAtCenter:
          typeof props.arrow === 'object' && props.arrow?.pointAtCenter,
        autoAdjustOverflow: props.autoAdjustOverflow,
        offset: token.value?.marginXXS,
        arrowWidth: props?.arrow ? token?.value.sizePopupArrow : 0,
        borderRadius: token?.value.borderRadius,
      }),
    );

    const onMenuClick = () => {
      const menu = props?.menu;
      // eslint-disable-next-line unicorn/consistent-optional-chaining
      if (menu?.selectable && menu?.multiple) {
        return;
      }
      if (props.open === undefined) {
        mergedOpen.value = false;
      }
      emit('update:open', false);
      emit('openChange', false, { source: 'menu' });
    };
    const mergedRootStyles = computed(() => {
      return {
        ...contextStyle.value,
        ...mergedStyles.value.root,
      };
    });
    // =========================== zIndex ============================
    const [zIndex, contextZIndex] = useZIndex(
      'Dropdown',
      computed(() => mergedRootStyles.value.zIndex as number),
    );

    const memoTransitionName = computed(() => {
      const rootPrefixCls = getPrefixCls();
      if (props.transitionName !== undefined) {
        return props.transitionName;
      }
      const placement = props?.placement ?? '';
      if (placement.startsWith('top')) {
        return `${rootPrefixCls}-slide-down`;
      }
      if (placement.startsWith('left')) {
        return `${rootPrefixCls}-slide-right`;
      }
      if (placement.startsWith('right')) {
        return `${rootPrefixCls}-slide-left`;
      }
      return `${rootPrefixCls}-slide-up`;
    });

    return () => {
      const children = filterEmpty(slots?.default?.());
      const child =
        children.length === 1 && isVNode(children[0]) ? (
          children[0]
        ) : (
          <span>{children}</span>
        );
      const {
        menu,
        popupRender,
        mouseEnterDelay,
        mouseLeaveDelay,
        arrow,
        getPopupContainer,
        rootClass,
        destroyOnHidden,
      } = props;
      const mergedPopupRender = slots?.popupRender ?? popupRender;

      const popupTrigger = createVNode(child, {
        class: clsx(`${prefixCls.value}-trigger`, {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        }),
        disabled: child?.props?.disabled ?? props?.disabled,
      });

      const renderOverlay = () => {
        // @v-c/dropdown already can process the function of overlay, but we have check logic here.
        // So we need render the element to check and pass back to @v-c/dropdown.
        const menuClassNames = omit(mergedClassNames.value, ['root']);
        const menuStyles = omit(mergedStyles.value, ['root']);
        let overlayNode: any;
        if (menu?.items) {
          overlayNode = (
            <Menu
              {...omit(menu, ['classes', 'styles', 'rootClass'])}
              classes={{
                ...menu?.classes,
                ...menuClassNames,
                subMenu: {
                  ...menuClassNames,
                },
              }}
              onClick={(menu: MenuInfo) => {
                emit('menuClick', menu);
              }}
              rootClass={clsx(menu?.rootClass)}
              styles={{
                ...menu?.styles,
                ...menuStyles,
                subMenu: {
                  ...menuStyles,
                },
              }}
              v-slots={omit(slots, ['default', 'popupRender'])}
            />
          );
        }
        if (mergedPopupRender) {
          overlayNode = mergedPopupRender(overlayNode);
        }
        const overlayFiltered = filterEmpty(
          Array.isArray(overlayNode) ? overlayNode : [overlayNode],
        ).filter(Boolean);
        overlayNode =
          overlayFiltered.length === 1 &&
          typeof overlayFiltered[0] === 'string' ? (
            <span>{overlayFiltered}</span>
          ) : (
            overlayFiltered
          );

        return (
          <OverrideProvider
            value={{
              prefixCls: `${prefixCls.value}-menu`,
              rootClass: clsx(cssVarCls.value, rootCls.value),
              expandIcon: (
                <span class={`${prefixCls.value}-menu-submenu-arrow`}>
                  {direction.value === 'rtl' ? (
                    <LeftOutlined
                      class={`${prefixCls.value}-menu-submenu-arrow-icon`}
                    ></LeftOutlined>
                  ) : (
                    <RightOutlined
                      class={`${prefixCls.value}-menu-submenu-arrow-icon`}
                    ></RightOutlined>
                  )}
                </span>
              ),
              mode: 'vertical',
              selectable: false,
              onClick: onMenuClick,
              validator({ mode }) {
                // Warning if use other mode
                warning(
                  !mode || mode === 'vertical',
                  'usage',
                  `mode="${mode}" is not supported for Dropdown's Menu.`,
                );
              },
            }}
          >
            {overlayNode}
          </OverrideProvider>
        );
      };

      // =========================== Overlay ============================
      const overlayClassNameCustomized = clsx(
        rootClass,
        hashId.value,
        cssVarCls.value,
        rootCls.value,
        contextClassName.value,
        mergedClassNames.value?.root,
        { [`${prefixCls.value}-rtl`]: direction.value === 'rtl' },
      );
      // ============================ Render ============================
      let renderNode = (
        <VcDropdown
          alignPoint={alignPoint.value}
          {...attrs}
          {...(omit(props, ['rootClass']) as any)}
          arrow={!!arrow}
          autoDestroy={destroyOnHidden}
          builtinPlacements={builtinPlacements.value}
          getPopupContainer={getPopupContainer || getContextPopupContainer}
          mouseEnterDelay={mouseEnterDelay}
          mouseLeaveDelay={mouseLeaveDelay}
          onVisibleChange={onInnerOpenChange}
          overlay={renderOverlay}
          overlayClassName={overlayClassNameCustomized}
          overlayStyle={{ ...mergedStyles.value?.root, zIndex: zIndex.value }}
          placement={memoPlacement.value}
          prefixCls={prefixCls.value}
          transitionName={memoTransitionName.value}
          trigger={triggerActions.value}
          visible={mergedOpen.value}
        >
          {popupTrigger}
        </VcDropdown>
      );
      if (zIndex.value) {
        renderNode = (
          <ZIndexProvider value={contextZIndex.value}>
            {renderNode}
          </ZIndexProvider>
        );
      }
      return renderNode;
    };
  },
  {
    name: 'AsDropdown',
    inheritAttrs: false,
  },
);

// We don't care debug panel
const PurePanel = genPurePanel(
  Dropdown,
  'align',
  undefined,
  'dropdown',
  (prefixCls) => prefixCls,
);

/* istanbul ignore next */
function WrapPurePanel(props: any) {
  return (
    <PurePanel {...props}>
      <span />
    </PurePanel>
  );
}
(Dropdown as any)._InternalPanelDoNotUseOrYouWillBeFired = WrapPurePanel;

(Dropdown as any).install = (app: App) => {
  app.component(Dropdown.name, Dropdown);
};

export default Dropdown;

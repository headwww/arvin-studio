import type { App, CSSProperties, SlotsType } from 'vue';

import type {
  ActionType,
  AlignType,
  LiteralUnion,
  placements as Placements,
  TooltipProps as VcTooltipProps,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type { PresetColorType } from '../_util/colors.ts';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { AdjustOverflow } from '../_util/placements.ts';
import type { ComponentBaseProps } from '../config-provider/context.ts';

import {
  computed,
  createVNode,
  defineComponent,
  isVNode,
  shallowRef,
  watch,
} from 'vue';

import {
  filterEmpty,
  getTransitionName,
  removeUndefined,
  Tooltip as VcTooltip,
} from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { ContextIsolator } from '../_util/ContextIsolator';
import {
  useMergeSemantic,
  useToArr,
  useToProps,
  useZIndex,
} from '../_util/hooks';
import getPlacements from '../_util/placements';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { ZIndexProvider } from '../_util/zindexContext';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useToken } from '../theme/internal';
import useMergedArrow from './hooks/useMergedArrow';
import PurePanel from './PurePanel';
import useStyle from './style';
import UniqueProvider from './UniqueProvider';
import { parseColor } from './util';

export interface TooltipRef {
  forceAlign: VoidFunction;
  /** @deprecated Please use `forceAlign` instead */
  forcePopupAlign: VoidFunction;
  /** Wrapped dom element. Not promise valid if child not support ref */
  nativeElement: HTMLElement;
  /** Popup dom element */
  popupElement: HTMLDivElement;
}

export type TooltipPlacement =
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftBottom'
  | 'leftTop'
  | 'right'
  | 'rightBottom'
  | 'rightTop'
  | 'top'
  | 'topLeft'
  | 'topRight';

// https://github.com/react-component/tooltip
// https://github.com/yiminghe/dom-align
export interface TooltipAlignConfig {
  offset?: [number | string, number | string];
  overflow?: { adjustX: boolean; adjustY: boolean };
  points?: [string, string];
  targetOffset?: [number | string, number | string];
  useCssBottom?: boolean;
  useCssRight?: boolean;
  useCssTransform?: boolean;
}

export type TooltipSemanticName = keyof TooltipSemanticClassNames &
  keyof TooltipSemanticStyles;

export interface TooltipSemanticClassNames {
  arrow?: string;
  container?: string;
  root?: string;
}

export interface TooltipSemanticStyles {
  arrow?: CSSProperties;
  container?: CSSProperties;
  root?: CSSProperties;
}

export type TooltipClassNamesType = SemanticClassNamesType<
  TooltipProps,
  TooltipSemanticClassNames
>;

export type TooltipStylesType = SemanticStylesType<
  TooltipProps,
  TooltipSemanticStyles
>;

export interface TriggerCommonApi extends ComponentBaseProps {
  align?: AlignType;
  arrow?: boolean | { pointAtCenter?: boolean };
  autoAdjustOverflow?: AdjustOverflow | boolean;
  classes?: TooltipClassNamesType;
  color?: LiteralUnion<PresetColorType>;
  defaultOpen?: boolean;
  destroyOnHidden?: boolean;
  fresh?: boolean;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  getTooltipContainer?: (node: HTMLElement) => HTMLElement;
  motion?: VcTooltipProps['motion'];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  open?: boolean;
  placement?: TooltipPlacement;
  styles?: TooltipStylesType;
  trigger?: ActionType | ActionType[];
  zIndex?: number;
}

export interface TooltipProps /* @vue-ignore */
  extends TooltipEmitsProps, TriggerCommonApi {
  afterOpenChange?: (open: boolean) => void;
  builtinPlacements?: typeof Placements;
  openClass?: string;
  overlay?: VueNode;
  title?: VueNode;
  unique?: boolean;
}

export interface TooltipEmits {
  openChange: (open: boolean) => void;
  'update:open': (open: boolean) => void;
}

export interface TooltipEmitsProps {
  onOpenChange?: TooltipEmits['openChange'];
  'onUpdate:open'?: TooltipEmits['update:open'];
}

export interface TooltipSlots {
  default: () => any;
  title: () => any;
}

/**
 * @internal
 * Internal props type with hidden properties
 */
interface InternalTooltipProps extends TooltipProps {
  dataPopoverInject?: boolean;
}

const defaults = {
  autoAdjustOverflow: true,
  placement: 'top',
  mouseEnterDelay: 0.1,
  mouseLeaveDelay: 0.1,
} as any;
const InternalTooltip = defineComponent<
  InternalTooltipProps,
  TooltipEmits,
  string,
  SlotsType<TooltipSlots>
>(
  (props = defaults, { slots, attrs, expose, emit }) => {
    const [, token] = useToken();
    const {
      prefixCls,
      rootPrefixCls,
      direction,
      arrow: rawContextArrow,
      class: rawContextClassName,
      style: rawContextStyle,
      classes: rawContextClassNames,
      styles: rawContextStyles,
      trigger: rawContextTrigger,
      getPopupContainer: getContextPopupContainer,
    } = useComponentBaseConfig('tooltip', props, ['arrow', 'trigger']);
    const {
      arrow: tooltipArrow,
      builtinPlacements,
      autoAdjustOverflow,
      classes,
      styles,
    } = toPropsRefs(
      props,
      'arrow',
      'builtinPlacements',
      'autoAdjustOverflow',
      'classes',
      'styles',
    );
    const injectFromPopover = computed(() => !!props.dataPopoverInject);
    const contextArrow = computed(() =>
      injectFromPopover.value ? undefined : rawContextArrow.value,
    );
    const contextClassName = computed(() =>
      injectFromPopover.value ? undefined : rawContextClassName.value,
    );
    const contextStyle = computed(() =>
      injectFromPopover.value ? undefined : rawContextStyle.value,
    );
    const contextClassNames = computed(() =>
      injectFromPopover.value ? {} : rawContextClassNames.value,
    );
    const contextStyles = computed(() =>
      injectFromPopover.value ? {} : rawContextStyles.value,
    );
    const contextTrigger = computed(() =>
      injectFromPopover.value ? undefined : rawContextTrigger.value,
    );
    const mergedArrow = useMergedArrow(tooltipArrow, contextArrow);
    const mergedTrigger = computed(
      () => props?.trigger ?? contextTrigger.value ?? 'hover',
    );
    const mergedShowArrow = computed(() => mergedArrow.value?.show);
    // ============================== Ref ===============================
    const tooltipRef = shallowRef();
    const forceAlign = () => {
      tooltipRef.value?.forceAlign?.();
    };

    expose({
      forceAlign,
      nativeElement: computed(() => tooltipRef.value?.nativeElement),
      popupElement: computed(() => tooltipRef.value?.popupElement),
    });

    // ============================== Open ==============================
    const open = shallowRef(props?.defaultOpen ?? false);
    watch(
      () => props.open,
      (val, prevVal) => {
        if (val !== undefined) {
          open.value = val;
        } else if (prevVal !== undefined) {
          open.value = false;
        }
      },
      { immediate: true },
    );
    let noTitle = false;
    const onInternalOpenChange = (vis: boolean) => {
      if (props.open === undefined) {
        open.value = noTitle ? false : vis;
      }
      if (!noTitle) {
        emit('openChange', vis);
        emit('update:open', vis);
      }
    };

    const tooltipPlacements = computed(() => {
      return (
        builtinPlacements.value ||
        getPlacements({
          arrowPointAtCenter: mergedArrow?.value?.pointAtCenter ?? false,
          autoAdjustOverflow: autoAdjustOverflow.value,
          arrowWidth: mergedShowArrow.value ? token.value.sizePopupArrow : 0,
          borderRadius: token.value.borderRadius,
          offset: token.value.marginXXS,
          visibleFirst: true,
        })
      );
    });

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        trigger: mergedTrigger.value,
      } as TooltipProps;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TooltipClassNamesType,
      TooltipStylesType,
      TooltipProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    // Style
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(
      prefixCls,
      rootCls,
      !injectFromPopover.value,
    );

    // ============================ zIndex ============================
    const [zIndex, contextZIndex] = useZIndex(
      'Tooltip',
      computed(() => props.zIndex),
    );
    return () => {
      const {
        color,
        rootClass,
        placement,
        mouseLeaveDelay,
        mouseEnterDelay,
        getPopupContainer,
        getTooltipContainer,
        afterOpenChange,
        motion,
        destroyOnHidden,
        openClass,
        arrow: _arrow,
        onOpenChange: _onOpenChange, // 解构出来但不使用
        ...restProps
      } = props;
      const title = getSlotPropsFnRun(slots, props, 'title');
      const overlay = getSlotPropsFnRun(slots, props, 'overlay');
      noTitle = !title && !overlay && title !== 0; // overlay for old version compatibility
      const memoOverlay = title === 0 ? title : overlay || title || '';
      const memoOverlayWrapper = (
        <ContextIsolator form space>
          {memoOverlay}
        </ContextIsolator>
      );
      const children = filterEmpty(slots.default?.());
      let child = children?.[0];
      child = isVNode(child) ? child : <span>{child}</span>;
      const childProps = child?.props ?? {};
      const childCls =
        !childProps?.class || typeof childProps?.class === 'string'
          ? clsx(childProps.class, openClass || `${prefixCls.value}-open`)
          : childProps.class;

      // Color
      const colorInfo = parseColor(rootPrefixCls.value, prefixCls.value, color);
      const arrowContentStyle = colorInfo.arrowStyle;
      const themeCls = clsx(rootCls.value, hashId.value, cssVarCls.value);
      const rootClassNames = clsx(
        { [`${prefixCls.value}-rtl`]: direction.value === 'rtl' },
        colorInfo.className,
        rootClass,
        themeCls,
        contextClassName.value,
        mergedClassNames.value.root,
      );
      const containerStyle = {
        ...mergedStyles.value.container,
        ...colorInfo.overlayStyle,
      };

      let tempOpen = open.value;
      // Hide tooltip when there is no title or the node is rendered for table measurement.
      // eslint-disable-next-line unicorn/prefer-ternary
      if (props.open === undefined && noTitle) {
        tempOpen = false;
      }

      const content = (
        <VcTooltip
          unique
          {...removeUndefined(restProps)}
          {...attrs}
          afterVisibleChange={afterOpenChange}
          arrowContent={<span class={`${prefixCls.value}-arrow-content`} />}
          builtinPlacements={tooltipPlacements.value}
          classNames={{
            root: rootClassNames,
            container: mergedClassNames.value.container,
            arrow: mergedClassNames.value.arrow,
            uniqueContainer: clsx(themeCls, mergedClassNames.value.container),
          }}
          destroyOnHidden={destroyOnHidden}
          getTooltipContainer={
            getPopupContainer || getTooltipContainer || getContextPopupContainer
          }
          motion={
            {
              name: getTransitionName(
                rootPrefixCls.value,
                'zoom-big-fast',
                typeof motion?.name === 'string' ? motion?.name : undefined,
              ),
              duration: 1000,
            } as any
          }
          mouseEnterDelay={mouseEnterDelay}
          mouseLeaveDelay={mouseLeaveDelay}
          onVisibleChange={onInternalOpenChange}
          overlay={memoOverlayWrapper}
          placement={placement}
          prefixCls={prefixCls.value}
          ref={tooltipRef}
          showArrow={mergedShowArrow.value}
          styles={{
            root: {
              ...arrowContentStyle,
              ...mergedStyles.value?.root,
              ...contextStyle.value,
            },
            container: containerStyle,
            uniqueContainer: containerStyle,
            arrow: mergedStyles.value.arrow,
          }}
          trigger={mergedTrigger.value}
          visible={tempOpen}
          zIndex={zIndex.value}
        >
          {tempOpen ? createVNode(child, { class: childCls }) : child}
        </VcTooltip>
      );
      return (
        <ZIndexProvider value={contextZIndex.value}>{content}</ZIndexProvider>
      );
    };
  },
  {
    name: 'AsTooltip',
    inheritAttrs: false,
  },
);

(InternalTooltip as any).install = (app: App) => {
  app.component(InternalTooltip.name, InternalTooltip);
  app.component('AsUniqueProvider', UniqueProvider);
};

(InternalTooltip as any).UniqueProvider = UniqueProvider;
(InternalTooltip as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

export { UniqueProvider };

export default InternalTooltip as typeof InternalTooltip & {
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
  UniqueProvider: typeof UniqueProvider;
};

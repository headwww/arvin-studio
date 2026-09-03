import type { App, CSSProperties, Ref, SlotsType } from 'vue';

import type { LiteralUnion } from '@arvin-studio/headless';

import type { EmptyEmit, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type {
  StepItem,
  StepsProps,
  StepsSemanticClassNames,
  StepsSemanticName,
  StepsSemanticStyles,
} from '../steps';

import { computed, defineComponent, ref, toRefs } from 'vue';

import { filterEmpty, useStepsUnstableProvider } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import isNonNullable from '../_util/isNonNullable';
import { toPropsRefs } from '../_util/tools';
import { resolveSlotsNode } from '../_util/vnode';
import {
  useBaseConfig,
  useComponentBaseConfig,
} from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import Steps from '../steps';
import { provideInternalContext } from '../steps/context';
import { genCssVar } from '../theme/util/genStyleUtils';
import useStyle from './style';
import { TIMELINE_ITEM_MARK, TimelineItem } from './TimelineItem';
import useItems from './useItems';

type Color = 'blue' | 'gray' | 'green' | 'red';

export type ItemPlacement = 'end' | 'start';

export type ItemPosition = 'end' | 'left' | 'right' | 'start';

export interface TimelineItemType {
  /** @deprecated Please use `content` instead */
  children?: VueNode;
  class?: string;
  classes?: NonNullable<StepItem['classes']>;
  className?: string;
  // Style
  color?: LiteralUnion<Color>;
  content?: VueNode;

  /** @deprecated Please use `icon` instead */
  dot?: VueNode;
  // Icon
  icon?: VueNode;
  // Data
  key?: number | string;

  /** @deprecated Please use `title` instead */
  label?: VueNode;
  loading?: boolean;
  // Design
  placement?: ItemPlacement;
  /** @deprecated please use `placement` instead */
  position?: ItemPosition;
  style?: CSSProperties;

  styles?: NonNullable<StepItem['styles']>;
  title?: VueNode;
}

export type TimelineSemanticName = StepsSemanticName;

export type TimelineSemanticClassNames = StepsSemanticClassNames;

export type TimelineSemanticStyles = StepsSemanticStyles;

export type TimelineClassNamesType = SemanticClassNamesType<
  TimelineProps,
  TimelineSemanticClassNames
>;

export type TimelineMode = 'alternate' | ItemPosition;

export interface TimelineProps extends ComponentBaseProps {
  classes?: TimelineClassNamesType;
  contentRender?: (params: {
    index: number;
    item: TimelineItemType;
  }) => VueNode;
  dotRender?: (params: { index: number; item: TimelineItemType }) => VueNode;
  items?: TimelineItemType[];
  labelRender?: (params: { index: number; item: TimelineItemType }) => VueNode;
  mode?: 'alternate' | 'end' | 'left' | 'right' | 'start';
  orientation?: 'horizontal' | 'vertical';
  pending?: VueNode;
  pendingDot?: VueNode;
  reverse?: boolean;
  styles?: TimelineStylesType;
  titleSpan?: number | string;
  variant?: StepsProps['variant'];
}

export type TimelineStylesType = SemanticStylesType<
  TimelineProps,
  TimelineSemanticStyles
>;

export interface TimelineSlots {
  contentRender?: (params: { index: number; item: TimelineItemType }) => any;
  dotRender?: (params: { index: number; item: TimelineItemType }) => any;
  labelRender?: (params: { index: number; item: TimelineItemType }) => any;
  pending?: () => void;
  pendingDot?: () => void;
}

const defaults = {
  variant: 'outlined',
  orientation: 'vertical',
} as any;

const Timeline = defineComponent<
  TimelineProps,
  EmptyEmit,
  string,
  SlotsType<TimelineSlots>
>(
  (props = defaults, { slots, attrs }) => {
    provideInternalContext(
      ref({
        rootComponent: 'ol',
        itemComponent: 'li',
      }),
    );

    const { reverse } = toRefs(props);
    const orientation = computed(() => props.orientation || 'vertical');
    useStepsUnstableProvider({ railFollowPrevStatus: reverse as Ref<boolean> });

    const {
      classes: contextClassNames,
      styles: contextStyles,
      style: contextStyle,
      class: contextClassName,
    } = useComponentBaseConfig('timeline', props);

    const { prefixCls, timeline, direction, getPrefixCls } = useBaseConfig(
      'timeline',
      props,
    );
    const rootPrefixCls = computed(() => getPrefixCls());

    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const items = computed(
      () =>
        props.items ||
        resolveSlotsNode(slots, 'default', undefined, TIMELINE_ITEM_MARK),
    );
    const pending = computed(() => props.pending);
    const pendingDot = computed(() => props.pendingDot);

    // ===================== Mode =======================
    const mergedMode = computed(() => {
      // Deprecated
      if (props.mode === 'left') {
        return 'start';
      }

      if (props.mode === 'right') {
        return 'end';
      }

      // Fill
      const modeList: (string | undefined)[] = ['alternate', 'start', 'end'];
      return (
        modeList.includes(props.mode) ? props.mode : 'start'
      ) as TimelineMode;
    });

    // ==================== Styles ======================
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const [varName] = genCssVar(rootPrefixCls.value, 'timeline');

    const stepsClassNames = computed<StepsProps['classes']>(() => ({
      item: `${prefixCls.value}-item`,
      itemTitle: `${prefixCls.value}-item-title`,
      itemIcon: `${prefixCls.value}-item-icon`,
      itemContent: `${prefixCls.value}-item-content`,
      itemRail: `${prefixCls.value}-item-rail`,
      itemWrapper: `${prefixCls.value}-item-wrapper`,
      itemSection: `${prefixCls.value}-item-section`,
      itemHeader: `${prefixCls.value}-item-header`,
    }));

    // ===================== Data =======================
    // 插槽优先，其次 props(与 getSlotPropFnRun 的约定一致)。
    // 插槽结果是规范化后的 VNode 数组(条件不渲染时为注释节点),须过滤后
    // 判空,空结果返回 undefined 以触发 item 自身字段的回退。
    const wrapRender = (fn: any): TimelineProps['dotRender'] => {
      if (typeof fn !== 'function') return undefined;
      return (params) => {
        const node = fn(params);
        const nodes = filterEmpty(Array.isArray(node) ? node : [node]).filter(
          (n) => n !== undefined && n !== null,
        );
        if (nodes.length === 0) return undefined;
        return nodes.length === 1 ? nodes[0] : nodes;
      };
    };
    const itemRenders = computed(() => ({
      dotRender: wrapRender(slots.dotRender ?? props.dotRender),
      labelRender: wrapRender(slots.labelRender ?? props.labelRender),
      contentRender: wrapRender(slots.contentRender ?? props.contentRender),
    }));
    const rawItems = useItems(
      rootPrefixCls,
      prefixCls,
      mergedMode,
      items,
      pending,
      pendingDot,
      itemRenders,
    );

    const mergedItems = computed(() => {
      return (
        props.reverse ? [...rawItems.value].toReversed() : rawItems.value
      ) as StepItem[];
    });

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        variant: props.variant || 'outlined',
        mode: mergedMode.value,
        orientation: orientation.value,
        items: mergedItems.value,
      } as TimelineProps;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TimelineClassNamesType,
      TimelineStylesType,
      TimelineProps
    >(
      useToArr(stepsClassNames, contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    // ==================== Design ======================
    const layoutAlternate = computed(() => {
      return (
        mergedMode.value === 'alternate' ||
        (orientation.value === 'vertical' &&
          mergedItems.value.some((item) => item.title))
      );
    });

    return () => {
      const { variant = 'outlined', titleSpan } = props;

      // ==================== Styles ======================
      const stepStyle: CSSProperties = {
        ...contextStyle.value,
        ...timeline?.value?.style,
        ...(attrs as any).style,
      };

      if (isNonNullable(titleSpan) && mergedMode.value !== 'alternate') {
        if (typeof titleSpan === 'number' && !Number.isNaN(titleSpan)) {
          (stepStyle as any)[varName('head-span')] = titleSpan;
        } else {
          (stepStyle as any)[varName('head-span-ptg')] = titleSpan;
        }
      }

      return (
        <Steps
          {...omit(attrs, ['class', 'style'])}
          {...omit(props, [
            'items',
            'prefixCls',
            'titleSpan',
            'dotRender',
            'labelRender',
            'contentRender',
          ])}
          class={clsx(
            contextClassName.value,
            timeline.value?.class,
            (attrs as any).class,
            rootCls.value,
            hashId.value,
            cssVarCls.value,
            prefixCls.value,
            {
              [`${prefixCls.value}-${orientation.value}`]:
                orientation.value === 'horizontal',
              [`${prefixCls.value}-layout-alternate`]: layoutAlternate.value,
              [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
            },
          )}
          classes={mergedClassNames.value}
          current={mergedItems.value.length - 1}
          items={mergedItems.value}
          orientation={orientation.value}
          style={stepStyle}
          styles={mergedStyles.value}
          // Layout
          type="dot"
          v-slots={slots}
          // Design
          variant={variant}
        />
      );
    };
  },
  {
    name: 'AsTimeline',
    inheritAttrs: false,
  },
);

(Timeline as any).install = (app: App) => {
  app.component(Timeline.name, Timeline);
  app.component(TimelineItem.name, TimelineItem);
};

export default Timeline;

import type { App, CSSProperties, SlotsType } from 'vue';

import type { StepsProps as VcStepsProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent } from 'vue';

import { getAttrStyleAndClass, Steps as VcSteps } from '@arvin-studio/headless';
import { CheckOutlined } from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import Wave from '../_util/wave';
import { TARGET_CLS } from '../_util/wave/interface';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import useBreakpoint from '../grid/hooks/useBreakpoint';
import { genCssVar } from '../theme/util/genStyleUtils';
import Tooltip from '../tooltip';
import { useInternalContext } from './context';
import PanelArrow from './PanelArrow';
import ProgressIcon from './ProgressIcon';
import useStyle from './style';
import useDisplaySteps from './useDisplaySteps';

type RcIconRenderTypeInfo = Parameters<
  NonNullable<VcStepsProps['iconRender']>
>[1];

export type IconRenderType = (params: {
  info: Pick<RcIconRenderTypeInfo, 'active' | 'components' | 'index' | 'item'>;
  oriNode: any;
}) => any;

export type StepsSemanticName = keyof StepsSemanticClassNames &
  keyof StepsSemanticStyles;

export interface StepsSemanticClassNames {
  item?: string;
  itemContent?: string;
  itemHeader?: string;
  itemIcon?: string;
  itemRail?: string;
  itemSection?: string;
  itemSubtitle?: string;
  itemTitle?: string;
  itemWrapper?: string;
  root?: string;
}

export interface StepsSemanticStyles {
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemHeader?: CSSProperties;
  itemIcon?: CSSProperties;
  itemRail?: CSSProperties;
  itemSection?: CSSProperties;
  itemSubtitle?: CSSProperties;
  itemTitle?: CSSProperties;
  itemWrapper?: CSSProperties;
  root?: CSSProperties;
}

export type StepsClassNamesType = SemanticClassNamesType<
  StepsProps,
  StepsSemanticClassNames
>;

export type StepsStylesType = SemanticStylesType<
  StepsProps,
  StepsSemanticStyles
>;

export interface StepItem {
  class?: string;
  classes?: NonNullable<VcStepsProps['items']>[number]['classNames'];
  content?: VueNode;
  /** @deprecated Please use `content` instead */
  description?: VueNode;
  disabled?: boolean;

  icon?: VueNode;
  key?: PropertyKey;
  onClick?: (e: MouseEvent) => void;
  status?: 'error' | 'finish' | 'process' | 'wait';
  style?: CSSProperties;
  styles?: NonNullable<VcStepsProps['items']>[number]['styles'];
  subTitle?: VueNode;
  title?: VueNode;
}

export type ProgressDotRender = (params: {
  iconDot: any;
  info: {
    content: any;
    /** @deprecated Please use `content` instead. */
    description: any;
    index: number;
    status: NonNullable<VcStepsProps['status']>;
    title: any;
  };
}) => any;

export interface BaseStepsProps {
  classes?: StepsClassNamesType;
  // Data
  current?: number;
  /** @deprecated Please use `orientation` instead. */
  direction?: 'horizontal' | 'vertical';
  ellipsis?: boolean;
  // Render
  iconRender?: IconRenderType;

  initial?: number;
  items?: StepItem[];
  /** @deprecated Please use `titlePlacement` instead. */
  labelPlacement?: 'horizontal' | 'vertical';
  /**
   * Maximum number of step items to display (`>= 3`).
   * Hidden step ranges are collapsed into disabled ellipsis steps.
   */
  maxCount?: number;
  /**
   * Set offset cell, only work when `type` is `inline`.
   */
  offset?: number;
  onChange?: (current: number) => void;
  orientation?: 'horizontal' | 'vertical';
  percent?: number;
  /** @deprecated Please use `type` and `iconRender` instead. */
  progressDot?: boolean | ProgressDotRender;

  responsive?: boolean;

  // Style
  rootClass?: string;
  size?: 'default' | Exclude<SizeType, 'large'>;
  status?: 'error' | 'finish' | 'process' | 'wait';
  styles?: StepsStylesType;
  titlePlacement?: 'horizontal' | 'vertical';

  // Layout
  type?: 'default' | 'dot' | 'inline' | 'navigation' | 'panel';
  variant?: 'filled' | 'outlined';
}

export interface StepsProps
  extends
    BaseStepsProps,
    /* @vue-ignore */
    StepsEmitsProps {
  prefixCls?: string;
}

export interface StepsEmits {
  'update:current': (current: number) => void;
}
export interface StepsEmitsProps {
  'onUpdate:current'?: StepsEmits['update:current'];
}

const waveEffectClassNames: StepsProps['classes'] = {
  itemIcon: TARGET_CLS,
};

export interface StepsSlots {
  default: () => any;
  iconRender?: IconRenderType;
}

const defaults = {
  variant: 'filled',
  responsive: true,
  offset: 0,
  current: 0,
} as any;

const Steps = defineComponent<
  StepsProps,
  StepsEmits,
  string,
  SlotsType<StepsSlots>
>(
  (props = defaults, { slots, attrs, emit }) => {
    const internalContent = useInternalContext();
    const {
      direction: rtlDirection,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      prefixCls,
      rootPrefixCls,
    } = useComponentBaseConfig('steps', props);
    const { size, items, responsive, type, classes, styles } = toPropsRefs(
      props,
      'size',
      'items',
      'responsive',
      'type',
      'classes',
      'styles',
    );
    const components = computed(() => {
      return {
        root: internalContent.value?.rootComponent,
        item: internalContent.value?.itemComponent,
      };
    });

    const itemIconCls = computed(() => `${prefixCls.value}-item-icon`);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const [varName] = genCssVar(rootPrefixCls.value, 'cmp-steps');
    // ============================= Size =============================
    const mergedSize = useSize(size);

    // ============================= Item =============================
    const mergedItems = computed(() => (items.value || []).filter(Boolean));

    // ========================== Max Count ==========================
    const mergedCurrent = computed(() => props.current ?? 0);
    const mergedInitial = computed(() => props.initial ?? 0);
    const mergedMaxCount = computed(() => props.maxCount);
    const {
      canApplyMaxCount,
      displaySteps,
      mappedDisplayCurrent,
      displayItems,
    } = useDisplaySteps(
      mergedItems,
      mergedCurrent,
      mergedInitial,
      mergedMaxCount,
      prefixCls,
    );

    // ============================ Layout ============================
    const breakpoint = useBreakpoint(responsive as any);
    const xs = computed(() => breakpoint.value?.xs);

    const mergedType = computed(() => {
      if (type.value && type.value !== 'default') {
        return type.value;
      }
      if (props.progressDot) {
        return 'dot';
      }
      return type.value;
    });
    const isInline = computed(() => mergedType.value === 'inline');
    const isDot = computed(
      () => mergedType.value === 'dot' || mergedType.value === 'inline',
    );

    const mergedOrientation = computed(() => {
      const nextOrientation = props.orientation || props.direction;
      if (mergedType.value === 'panel') {
        return 'horizontal';
      }
      return (responsive.value && xs.value) || nextOrientation === 'vertical'
        ? 'vertical'
        : 'horizontal';
    });

    const mergedTitlePlacement = computed(() => {
      if (isDot.value || mergedOrientation.value === 'vertical') {
        return mergedOrientation.value === 'vertical'
          ? 'horizontal'
          : 'vertical';
      }
      if (type.value === 'navigation') {
        return 'horizontal';
      }
      return props.titlePlacement || props.labelPlacement || 'horizontal';
    });

    // ========================== Percentage ==========================
    const mergedPercent = computed(() =>
      isInline.value ? undefined : props?.percent,
    );

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        size: mergedSize.value,
        type: mergedType.value,
        orientation: mergedOrientation.value,
        titlePlacement: mergedTitlePlacement.value,
        percent: mergedPercent.value,
      } as StepsProps;
    });

    // ============================ Styles ============================
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      StepsClassNamesType,
      StepsStylesType,
      StepsProps
    >(
      useToArr(
        computed(() => waveEffectClassNames),
        contextClassNames,
        classes,
      ),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    // =========================== Warning ============================
    if (isDev) {
      const { labelPlacement, progressDot, direction } = props;
      const warning = devUseWarning('Steps');

      warning.deprecated(
        props.size !== 'default',
        'size="default"',
        'size="medium"',
      );
      warning.deprecated(!labelPlacement, 'labelPlacement', 'titlePlacement');
      warning.deprecated(!progressDot, 'progressDot', 'type="dot"');
      warning.deprecated(!direction, 'direction', 'orientation');
      warning.deprecated(
        mergedItems.value.every((item) => !item.description),
        'items.description',
        'items.content',
      );
      warning(
        props.maxCount === undefined || props.maxCount >= 3,
        'usage',
        '`maxCount` should be greater than or equal to 3.',
      );
    }
    return () => {
      const {
        variant,
        onChange,
        offset,
        ellipsis,
        rootClass,
        current: _current,
        initial: _initial,
        maxCount: _maxCount,
        ...restProps
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      // const icon = getSlotPropsFnRun(slots,props,"icon")
      const iconRender = slots?.iconRender || props?.iconRender;

      // Progress Dot Render function
      const legacyProgressDotRenderFn = () => {
        return mergedType.value === 'dot' &&
          typeof props.progressDot === 'function'
          ? props.progressDot
          : undefined;
      };
      const legacyProgressDotRender = legacyProgressDotRenderFn();
      // ============================= Icon =============================
      const internalIconRender: VcStepsProps['iconRender'] = (
        _: any,
        info: any,
      ) => {
        const {
          index,
          item,
          active,
          components: { Icon: StepIcon },
        } = info;

        const originIndex = displaySteps.value[index]?.originIndex;
        const mappedIndex =
          originIndex !== undefined && originIndex >= 0
            ? mergedInitial.value + originIndex
            : index;

        const { status, icon } = item;

        let iconContent: any;
        if (isDot.value || icon) {
          iconContent = icon;
        } else {
          switch (status) {
            case 'error': {
              iconContent = (
                <CheckOutlined class={`${itemIconCls.value}-error`} />
              );
              break;
            }
            case 'finish': {
              iconContent = (
                <CheckOutlined class={`${itemIconCls.value}-finish`} />
              );
              break;
            }
            default: {
              let numNode = (
                <span class={`${itemIconCls.value}-number`}>
                  {mappedIndex + 1}
                </span>
              );
              if (status === 'process' && mergedPercent.value !== undefined) {
                numNode = (
                  <ProgressIcon
                    percent={mergedPercent.value}
                    prefixCls={prefixCls.value}
                    rootPrefixCls={rootPrefixCls.value}
                  >
                    {numNode}
                  </ProgressIcon>
                );
              }
              iconContent = numNode;
            }
          }
        }

        let iconNode = <StepIcon>{iconContent}</StepIcon>;

        // Custom Render Props
        if (iconRender) {
          iconNode = iconRender({
            oriNode: iconNode,
            info: {
              index: mappedIndex,
              active,
              item,
              components: {
                Icon: StepIcon,
              },
            },
          });
        } else if (typeof legacyProgressDotRender === 'function') {
          iconNode = legacyProgressDotRender({
            iconDot: iconNode,
            info: {
              index: mappedIndex,
              ...(item as any),
            },
          });
        }
        return iconNode;
      };

      // ============================ Custom ============================
      const itemRender: any = (
        itemNode: any,
        itemInfo: { item: { disabled: any } },
      ) => {
        let content = itemNode;
        const itemContent = getSlotPropsFnRun({}, itemInfo.item, 'content');
        if (isInline.value && itemContent) {
          content = (
            <Tooltip destroyOnHidden title={itemContent}>
              {itemNode}
            </Tooltip>
          );
        }

        return (
          <Wave
            colorSource={variant === 'filled' ? 'color' : null}
            component="Steps"
            disabled={itemInfo.item.disabled || !onChange}
          >
            {content}
          </Wave>
        );
      };

      const itemWrapperRender: VcStepsProps['itemWrapperRender'] =
        mergedType.value === 'panel'
          ? (itemNode: any) => {
              return (
                <>
                  {itemNode}
                  <PanelArrow prefixCls={prefixCls.value} />
                </>
              );
            }
          : undefined;

      // ============================ Styles ============================
      const mergedStyle = {
        [varName('items-offset')]: `${offset}`,
        ...contextStyle.value,
        ...style,
      };

      const stepsClassName = clsx(
        contextClassName.value,
        `${prefixCls.value}-${variant}`,
        {
          [`${prefixCls.value}-${mergedType.value}`]:
            mergedType.value === 'dot' ? false : mergedType.value,
          [`${prefixCls.value}-rtl`]: rtlDirection.value === 'rtl',
          [`${prefixCls.value}-dot`]: isDot.value,
          [`${prefixCls.value}-ellipsis`]: ellipsis,
          [`${prefixCls.value}-max-count`]: canApplyMaxCount.value,
          [`${prefixCls.value}-with-progress`]:
            mergedPercent.value !== undefined,
          [`${prefixCls.value}-small`]: mergedSize.value === 'small',
        },
        className,
        rootClass,
        hashId.value,
        cssVarCls.value,
      );

      // ============================ Render ============================
      return (
        <VcSteps
          {...restProps}
          {...restAttrs}
          className={stepsClassName}
          classNames={mergedClassNames.value}
          components={components.value}
          current={mappedDisplayCurrent.value}
          // Render
          iconRender={internalIconRender}
          // Data
          initial={0}
          itemRender={itemRender}
          items={displayItems.value as any}
          itemWrapperRender={itemWrapperRender}
          onChange={(displayCurrent: any) => {
            const target = displaySteps.value[displayCurrent];
            const originIndex =
              target && target.originIndex >= 0
                ? target.originIndex
                : displayCurrent;
            const next = mergedInitial.value + originIndex;
            onChange?.(next);
            emit('update:current', next);
          }}
          // Layout
          orientation={mergedOrientation.value}
          // Style
          prefixCls={prefixCls.value}
          style={mergedStyle}
          styles={mergedStyles.value as any}
          titlePlacement={mergedTitlePlacement.value}
        />
      );
    };
  },
  {
    name: 'AsSteps',
    inheritAttrs: false,
  },
);

(Steps as any).install = (app: App) => {
  app.component(Steps.name, Steps);
};
export default Steps;

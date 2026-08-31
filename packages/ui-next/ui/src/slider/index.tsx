import type { App, CSSProperties, SlotsType } from 'vue';

import type { SliderProps as VcSliderProps } from '@arvin-studio/headless';

import type {
  Orientation,
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { TooltipPlacement, TriggerCommonApi } from '../tooltip';

import {
  cloneVNode,
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  shallowRef,
} from 'vue';

import { raf, Slider as VcSlider } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useOrientation,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import { useSliderInternalContext } from './Context';
import SliderTooltip from './SliderTooltip';
import useStyle from './style';
import useRafLock from './useRafLock';

export type SliderMarks = VcSliderProps['marks'];

export type SliderSemanticName = keyof SliderSemanticClassNames &
  keyof SliderSemanticStyles;

export interface SliderSemanticClassNames {
  handle?: string;
  rail?: string;
  root?: string;
  track?: string;
  tracks?: string;
}

export interface SliderSemanticStyles {
  handle?: CSSProperties;
  rail?: CSSProperties;
  root?: CSSProperties;
  track?: CSSProperties;
  tracks?: CSSProperties;
}

export type SliderClassNamesType = SemanticClassNamesType<
  SliderBaseProps,
  SliderSemanticClassNames
>;

export type SliderStylesType = SemanticStylesType<
  SliderBaseProps,
  SliderSemanticStyles
>;

export interface SliderProps extends Omit<
  VcSliderProps,
  'classNames' | 'styles'
> {
  classes?: SliderClassNamesType;
  styles?: SliderStylesType;
}

interface HandleGeneratorInfo {
  dragging?: boolean;
  index: number;
  value?: number;
}

export type HandleGeneratorFn = (config: {
  info: HandleGeneratorInfo;
  prefixCls?: string;
  tooltipPrefixCls?: string;
}) => any;

export type Formatter = ((value?: number) => any) | null;

export interface SliderTooltipProps extends TriggerCommonApi {
  autoAdjustOverflow?: boolean;
  formatter?: Formatter;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  open?: boolean;
  placement?: TooltipPlacement;
  prefixCls?: string;
}

export interface SliderBaseProps {
  ariaLabelForHandle?: SliderProps['ariaLabelForHandle'];
  ariaLabelledByForHandle?: SliderProps['ariaLabelledByForHandle'];
  ariaRequired?: SliderProps['ariaRequired'];
  ariaValueTextFormatterForHandle?: SliderProps['ariaValueTextFormatterForHandle'];
  autoFocus?: boolean;
  classes?: SliderClassNamesType;
  /** Set `boolean[]` to individually disable specific handles (Range mode). */
  disabled?: boolean | boolean[];
  dots?: boolean;
  id?: string;
  included?: boolean;
  keyboard?: boolean;
  marks?: SliderMarks;
  max?: number;
  min?: number;
  orientation?: Orientation;
  prefixCls?: string;

  reverse?: boolean;
  // className?: string
  rootClass?: string;
  // onFocus?: FocusEventHandler<HTMLDivElement>;
  // onBlur?: FocusEventHandler<HTMLDivElement>;

  step?: null | number;
  styles?: SliderStylesType;
  // Accessibility
  tabIndex?: SliderProps['tabIndex'];
  // style?: CSSProperties;
  tooltip?: SliderTooltipProps;
  vertical?: boolean;
}

export interface SliderInternalProps
  extends
    SliderBaseProps,
    /* @vue-ignore */
    SliderEmitsProps {
  defaultValue?: number | number[];
  // onChange?: (value: number) => void
  // /** @deprecated Please use `onChangeComplete` instead */
  // onAfterChange?: (value: number) => void
  // onChangeComplete?: (value: number) => void
  /** @deprecated Please use `styles.handle` instead */
  handleStyle?: CSSProperties | CSSProperties[];
  /** @deprecated Please use `styles.rail` instead */
  railStyle?: CSSProperties;
  range?: boolean | SliderRange;
  /** @deprecated Please use `styles.track` instead */
  trackStyle?: CSSProperties | CSSProperties[];
  value?: number | number[];
}

export interface SliderEmits {
  afterChange: (value: any) => void;
  change: (value: any) => void;
  changeComplete: (value: any) => void;
  'update:value': (value: any) => void;
}
export interface SliderEmitsProps {
  onAfterChange?: SliderEmits['afterChange'];
  onChange?: SliderEmits['change'];
  onChangeComplete?: SliderEmits['changeComplete'];
  'onUpdate:value'?: SliderEmits['update:value'];
}

export interface SliderSlots {}

type SliderRange = VcSliderProps['range'];

export interface Opens {
  [index: number]: boolean;
}

function getTipFormatter(tipFormatter?: Formatter) {
  if (tipFormatter || tipFormatter === null) {
    return tipFormatter;
  }
  return (val?: number) => (typeof val === 'number' ? val.toString() : '');
}

const Slider = defineComponent<
  SliderInternalProps,
  SliderEmits,
  string,
  SlotsType<SliderSlots>
>(
  (props, { attrs, emit, expose }) => {
    const { classes, styles, vertical, orientation } = toPropsRefs(
      props,
      'classes',
      'styles',
      'vertical',
      'orientation',
    );
    const [, mergedVertical] = useOrientation(orientation, vertical);
    const sliderRef = shallowRef();
    const {
      prefixCls,
      direction: contextDirection,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
      getPopupContainer,
      getPrefixCls,
    } = useComponentBaseConfig('slider', props);

    const contextDisabled = useDisabledContext();
    const mergedDisabled = computed(
      () => props.disabled ?? contextDisabled.value,
    );

    // =========== Merged Props for Semantic ==========
    const mergedProps = computed(() => {
      return {
        ...props,
        disabled: mergedDisabled.value,
        vertical: mergedVertical.value,
      } as SliderInternalProps;
    });

    const contextStyleRoot = useSemanticRootStyle(contextStyle);

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      SliderClassNamesType,
      SliderStylesType,
      SliderInternalProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    // ============================= Context ==============================
    const {
      handleRender: contextHandleRender,
      direction: internalContextDirection,
    } = useSliderInternalContext();

    const mergedDirection = computed(
      () => internalContextDirection?.value || contextDirection.value,
    );
    const isRTL = computed(() => mergedDirection.value === 'rtl');

    // =============================== Open ===============================
    const [hoverOpen, setHoverOpen] = useRafLock();
    const [focusOpen, setFocusOpen] = useRafLock();

    const tooltipProps = computed(() => {
      return {
        ...props.tooltip,
      };
    });

    const lockOpen = computed(() => tooltipProps.value?.open);
    const activeOpen = computed(
      () => (hoverOpen.value || focusOpen.value) && lockOpen.value !== false,
    );

    // ============================= Change ==============================
    const [dragging, setDragging] = useRafLock();

    const onInternalChangeComplete: VcSliderProps['onChangeComplete'] = (
      nextValues,
    ) => {
      emit('changeComplete', nextValues);
      setDragging(false);
    };

    // ============================ Placement ============================
    const getTooltipPlacement = (
      placement?: TooltipPlacement,
      vert?: boolean,
    ) => {
      if (placement) {
        return placement;
      }
      if (!vert) {
        return 'top';
      }
      return isRTL.value ? 'left' : 'right';
    };

    const [hashId, cssVarCls] = useStyle(prefixCls);

    // ============================== Handle ==============================
    const onMouseUp = () => {
      raf(() => {
        focusOpen.value = false;
      }, 1);
    };
    onMounted(() => {
      document.addEventListener('mouseup', onMouseUp);
    });
    onUnmounted(() => {
      document.removeEventListener('mouseup', onMouseUp);
    });
    expose({
      focus: () => sliderRef.value?.focus?.(),
      blur: () => sliderRef.value?.blur?.(),
    });
    return () => {
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const { rootClass, tooltip, range } = props;
      const tooltipProps: SliderTooltipProps = {
        ...tooltip,
      };
      const {
        placement: tooltipPlacement,
        getPopupContainer: getTooltipPopupContainer,
        prefixCls: customizeTooltipPrefixCls,
        formatter: tipFormatter,
      } = tooltipProps;
      const rootClassNames = clsx(
        className,
        contextClassName.value,
        mergedClassNames.value.root,
        rootClass,
        {
          [`${prefixCls.value}-rtl`]: isRTL.value,
          [`${prefixCls.value}-lock`]: dragging.value,
        },
        hashId.value,
        cssVarCls.value,
      );

      const restProps: Record<string, any> = {
        ...omit(props, [
          'prefixCls',
          'range',
          'rootClass',
          'style',
          'disabled',
          'tooltip', // Deprecated
          'classes',
          'styles',
          'vertical',
          'orientation',
        ]),
        ...restAttrs,
      };
      if (isRTL.value && !mergedVertical.value) {
        restProps.reverse = !restProps.reverse;
      }
      const mergedTipFormatter = getTipFormatter(tipFormatter);
      const useActiveTooltipHandle = range && !lockOpen.value;
      const handleRender: VcSliderProps['handleRender'] =
        contextHandleRender ||
        (({ node, index, value }) => {
          const nodeProps: Record<string, any> = {};
          function proxyEvent(
            eventName: keyof any,
            event: any,
            triggerRestPropsEvent?: boolean,
          ) {
            if (triggerRestPropsEvent) {
              (restProps as any)[eventName]?.(event);
            }

            (nodeProps as any)[eventName]?.(event);
          }

          const passedProps: Record<string, any> = {
            onMouseenter: (e: MouseEvent) => {
              setHoverOpen(true);
              proxyEvent('onMouseenter', e);
            },
            onMouseleave: (e: MouseEvent) => {
              setHoverOpen(false);
              proxyEvent('onMouseleave', e);
            },
            onMousedown: (e: MouseEvent) => {
              setFocusOpen(true);
              setDragging(true);
              proxyEvent('onMousedown', e);
            },
            onFocus: (e: FocusEvent) => {
              setFocusOpen(true);
              restProps?.onFocus?.(e);
              proxyEvent('onFocus', e, true);
            },
            onBlur: (e: FocusEvent) => {
              setFocusOpen(false);
              restProps?.onBlur?.(e);
              proxyEvent('onBlur', e, true);
            },
          };

          const cloneNode = cloneVNode(node, passedProps);
          const open =
            (!!lockOpen.value || activeOpen.value) &&
            mergedTipFormatter !== null;
          // Wrap on handle with Tooltip when is single mode or multiple with all show tooltip
          if (!useActiveTooltipHandle) {
            return (
              <SliderTooltip
                {...tooltipProps}
                classes={{ root: `${prefixCls.value}-tooltip` }}
                getPopupContainer={
                  getTooltipPopupContainer || getPopupContainer
                }
                key={index!}
                open={open}
                placement={getTooltipPlacement(
                  tooltipPlacement,
                  mergedVertical.value,
                )}
                prefixCls={getPrefixCls('tooltip', customizeTooltipPrefixCls)}
                title={mergedTipFormatter ? mergedTipFormatter(value) : ''}
                value={value}
              >
                {cloneNode}
              </SliderTooltip>
            );
          }
          return cloneNode;
        });

      // ========================== Active Handle ===========================
      const activeHandleRender: SliderProps['activeHandleRender'] =
        useActiveTooltipHandle
          ? ({ node, ...info }) => {
              const cloneNode = cloneVNode(node, {
                style: {
                  visibility: 'hidden',
                },
              });
              return (
                <SliderTooltip
                  {...tooltipProps}
                  classes={{ root: `${prefixCls.value}-tooltip` }}
                  draggingDelete={info.draggingDelete}
                  getPopupContainer={
                    getTooltipPopupContainer || getPopupContainer
                  }
                  key="tooltip"
                  open={mergedTipFormatter !== null && activeOpen.value}
                  placement={getTooltipPlacement(
                    tooltipPlacement,
                    mergedVertical.value,
                  )}
                  prefixCls={getPrefixCls('tooltip', customizeTooltipPrefixCls)}
                  title={
                    mergedTipFormatter ? mergedTipFormatter(info.value) : ''
                  }
                >
                  {cloneNode}
                </SliderTooltip>
              );
            }
          : undefined;

      // ============================== Render ==============================
      const rootStyle = {
        ...mergedStyles.value.root,
        ...style,
      };
      return (
        <VcSlider
          {...restProps}
          activeHandleRender={activeHandleRender}
          className={rootClassNames}
          classNames={mergedClassNames.value}
          disabled={mergedDisabled.value}
          handleRender={handleRender}
          onChange={(...args: any) => {
            emit('change', args);
            emit('update:value', args);
          }}
          onChangeComplete={onInternalChangeComplete}
          prefixCls={prefixCls.value}
          range={range}
          ref={sliderRef}
          step={restProps.step}
          style={rootStyle}
          styles={mergedStyles.value}
          vertical={mergedVertical.value}
        />
      );
    };
  },
  {
    name: 'ASlider',
    inheritAttrs: false,
  },
);

(Slider as any).install = (app: App) => {
  app.component(Slider.name, Slider);
};
export default Slider;

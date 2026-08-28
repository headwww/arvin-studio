import type { App, CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { debounce } from 'throttle-debounce';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import {
  useComponentBaseConfig,
  useComponentConfig,
} from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import Indicator from './Indicator';
import useStyle from './style/index';
import usePercent from './usePercent';

export type SpinSemanticName = keyof SpinSemanticClassNames &
  keyof SpinSemanticStyles;

export interface SpinSemanticClassNames {
  container?: string;
  description?: string;
  indicator?: string;
  /** @deprecated Please use `root` instead */
  mask?: string;

  root?: string;

  section?: string;
  /** @deprecated Please use `description` instead */
  tip?: string;
}

export interface SpinSemanticStyles {
  container?: CSSProperties;
  description?: CSSProperties;
  indicator?: CSSProperties;
  /** @deprecated Please use `root` instead */
  mask?: CSSProperties;

  root?: CSSProperties;

  section?: CSSProperties;
  /** @deprecated Please use `description` instead */
  tip?: CSSProperties;
}

export type SpinClassNamesType = SemanticClassNamesType<
  SpinProps,
  SpinSemanticClassNames
>;

export type SpinStylesType = SemanticStylesType<SpinProps, SpinSemanticStyles>;

export interface SpinProps extends ComponentBaseProps {
  classes?: SpinClassNamesType;
  /** Specifies a delay in milliseconds for loading state (prevent flush) */
  delay?: number;
  description?: VueNode;
  /** Display a backdrop with the `Spin` component */
  fullscreen?: boolean;
  /** React node of the spinning indicator */
  indicator?: VueNode;
  percent?: 'auto' | number;
  /**
   * Note: `default` is deprecated and will be removed in v7, please use `medium` instead.
   */
  size?: 'default' | SizeType;
  /** Whether Spin is spinning */
  spinning?: boolean;
  styles?: SpinStylesType;
  /** Customize description content when Spin has children */
  /** @deprecated Please use `description` instead */
  tip?: VueNode;
  /** The className of wrapper when Spin has children */
  /** @deprecated Please use `classes.root` instead */
  wrapperClassName?: string;
}

export interface SpinSlots {
  default?: () => any;
  description?: () => any;
  indicator?: () => any;
  /** @deprecated Please use `description` instead */
  tip?: () => any;
}

// Render indicator
let defaultIndicator: VueNode;

function shouldDelay(spinning?: boolean, delay?: number): boolean {
  return !!spinning && !!delay && !Number.isNaN(delay);
}

const defaultSpinProps = {
  spinning: true,
  delay: 0,
  fullscreen: false,
} as any;

const Spin = defineComponent<
  SpinProps,
  EmptyEmit,
  string,
  SlotsType<SpinSlots>
>(
  (props = defaultSpinProps, { slots, attrs }) => {
    const componentCtx = useComponentConfig('spin');
    const {
      direction,
      prefixCls,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('spin', props, ['indicator']);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const spinning = shallowRef(
      shouldDelay(props.spinning, props.delay) ? false : !!props.spinning,
    );
    const mergedPercent = usePercent(
      spinning,
      computed(() => props.percent),
    );

    watch(
      [() => props.delay, () => props.spinning],
      (_, _p, onCleanup) => {
        if (props.spinning) {
          const showSpinning = debounce(props?.delay ?? 0, () => {
            spinning.value = true;
          });
          showSpinning();
          onCleanup(() => {
            showSpinning?.cancel?.();
          });
          return;
        }
        spinning.value = false;
      },
      {
        immediate: true,
      },
    );

    const mergedSize = useSize((ctx) => props.size ?? ctx);

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return {
        ...props,
        size: mergedSize.value,
        spinning: spinning.value,
        fullscreen: props.fullscreen,
        percent: mergedPercent.value,
      } as SpinProps;
    });
    // ========================= Style ==========================
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      SpinClassNamesType,
      SpinStylesType,
      SpinProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );
    return () => {
      const { fullscreen, rootClass, wrapperClassName } = props;
      const children = filterEmpty(slots?.default?.() || []);
      const indicator = getSlotPropsFnRun(slots, props, 'indicator');
      const contextIndicator = getSlotPropsFnRun(
        {},
        componentCtx.value,
        'indicator',
      );
      const hasChildren = children.length > 0;
      const isNested = hasChildren || fullscreen;
      const description = getSlotPropsFnRun(slots, props, 'description');
      const tip = getSlotPropsFnRun(slots, props, 'tip');
      const mergedDescription = description ?? tip;
      const { style, className, restAttrs } = getAttrStyleAndClass(attrs);

      // ======================= Indicator ========================
      const mergedIndicator = indicator ?? contextIndicator ?? defaultIndicator;

      // ========================= Render =========================
      const indicatorNode = (
        <>
          <Indicator
            class={clsx(mergedClassNames.value.indicator)}
            indicator={mergedIndicator}
            percent={mergedPercent.value as any}
            prefixCls={prefixCls.value}
            style={mergedStyles.value.indicator}
          />
          {mergedDescription && (
            <div
              class={clsx(
                `${prefixCls.value}-description`,
                mergedClassNames.value.tip,
                mergedClassNames.value.description,
              )}
              style={{
                ...mergedStyles.value.tip,
                ...mergedStyles.value.description,
              }}
            >
              {mergedDescription}
            </div>
          )}
        </>
      );

      return (
        <div
          {...restAttrs}
          aria-busy={spinning.value}
          aria-live="polite"
          class={clsx(
            prefixCls.value,
            {
              [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
              [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
              [`${prefixCls.value}-spinning`]: spinning.value,
              [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
              [`${prefixCls.value}-fullscreen`]: fullscreen,
            },
            rootClass,
            mergedClassNames.value.root,
            fullscreen && mergedClassNames.value.mask,
            isNested
              ? wrapperClassName
              : [`${prefixCls.value}-section`, mergedClassNames.value.section],
            contextClassName.value,
            className,
            hashId.value,
            cssVarCls.value,
          )}
          style={{
            ...mergedStyles.value.root,
            ...(!isNested && mergedStyles.value.section),
            ...(fullscreen && mergedStyles.value.mask),
            ...contextStyle.value,
            ...style,
          }}
        >
          {/* Indicator */}
          {spinning.value &&
            (isNested ? (
              <div
                class={clsx(
                  `${prefixCls.value}-section`,
                  mergedClassNames.value.section,
                )}
                style={mergedStyles.value.section}
              >
                {indicatorNode}
              </div>
            ) : (
              indicatorNode
            ))}

          {/* Children */}
          {hasChildren && (
            <div
              class={clsx(
                `${prefixCls.value}-container`,
                mergedClassNames.value.container,
              )}
              style={mergedStyles.value.container}
            >
              {children}
            </div>
          )}
        </div>
      );
    };
  },
  {
    name: 'AsSpin',
    inheritAttrs: false,
  },
);

(Spin as any).setDefaultIndicator = (indicator: VueNode) => {
  defaultIndicator = indicator;
};

(Spin as any).install = (app: App) => {
  app.component(Spin.name, Spin);
};
export default Spin as typeof Spin & {
  setDefaultIndicator: (indicator: VueNode) => void;
};

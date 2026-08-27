import type { CSSProperties, SlotsType } from 'vue';

import type { LiteralUnion } from '@arvin-studio/headless';

import type { EmptyEmit, VueNode } from '../_util';
import type { PresetColorType } from '../_util/colors';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';

import { computed, defineComponent } from 'vue';

import { getAttrStyleAndClass } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { isPresetColor } from '../_util/colors';
import { useMergeSemantic, useToArr, useToProps } from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import useStyle from './style/ribbon';

type RibbonPlacement = 'end' | 'start';

export type RibbonSemanticName = keyof RibbonSemanticClassNames &
  keyof RibbonSemanticStyles;

export interface RibbonSemanticClassNames {
  content?: string;
  indicator?: string;
  root?: string;
}

export interface RibbonSemanticStyles {
  content?: CSSProperties;
  indicator?: CSSProperties;
  root?: CSSProperties;
}

export type RibbonClassNamesType = SemanticClassNamesType<
  RibbonProps,
  RibbonSemanticClassNames
>;

export type RibbonStylesType = SemanticStylesType<
  RibbonProps,
  RibbonSemanticStyles
>;

export interface RibbonProps extends ComponentBaseProps {
  classes?: RibbonClassNamesType;
  color?: LiteralUnion<PresetColorType>;
  placement?: RibbonPlacement;
  styles?: RibbonStylesType;
  text?: VueNode;
}

export interface RibbonSlots {
  default?: () => any;
  text?: () => any;
}

const defaults = {
  placement: 'end',
} as any;

export default defineComponent<
  RibbonProps,
  EmptyEmit,
  string,
  SlotsType<RibbonSlots>
>(
  (props = defaults, { slots, attrs }) => {
    const { styles, classes: ribbonClassNames } = toPropsRefs(
      props,
      'classes',
      'styles',
    );
    const {
      prefixCls,
      class: contextClassName,
      style: contextStyle,
      direction,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('ribbon', props);
    const wrapperCls = computed(() => `${prefixCls.value}-wrapper`);
    const [hashId, cssVarCls] = useStyle(prefixCls, wrapperCls);

    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => {
      return props;
    });

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      RibbonClassNamesType,
      RibbonStylesType,
      RibbonProps
    >(
      useToArr(contextClassNames, ribbonClassNames),
      useToArr(contextStyles, styles),
      useToProps(mergedProps),
    );

    return () => {
      const { placement = 'end', color } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const colorInPreset = isPresetColor(props.color, false);

      const ribbonCls = clsx(
        prefixCls.value,
        `${prefixCls.value}-placement-${placement}`,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-color-${color}`]: colorInPreset,
        },
        className,
        contextClassName.value,
        mergedClassNames.value.indicator,
      );

      const colorStyle: CSSProperties = {};
      const cornerColorStyle: CSSProperties = {};
      if (props.color && !colorInPreset) {
        colorStyle.background = props.color;
        cornerColorStyle.color = props.color;
      }

      const textNodes = getSlotPropsFnRun(slots, props, 'text');
      const children = slots.default?.();

      return (
        <div
          class={clsx(
            wrapperCls.value,
            props.rootClass,
            hashId.value,
            cssVarCls.value,
            mergedClassNames.value?.root,
          )}
          style={mergedStyles.value?.root}
        >
          {children}
          <div
            {...restAttrs}
            class={clsx(ribbonCls, hashId.value)}
            style={[
              colorStyle,
              mergedStyles.value?.indicator,
              contextStyle.value,
              style,
            ]}
          >
            <span
              class={clsx(
                `${prefixCls.value}-content`,
                mergedClassNames.value.content,
              )}
              style={mergedStyles.value?.content}
            >
              {Array.isArray(textNodes) ? textNodes : (textNodes ?? props.text)}
            </span>
            <div class={`${prefixCls.value}-corner`} style={cornerColorStyle} />
          </div>
        </div>
      );
    };
  },
  {
    name: 'ABadgeRibbon',
    inheritAttrs: false,
  },
);

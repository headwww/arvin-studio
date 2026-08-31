import type { CSSProperties, SlotsType, VNodeChild } from 'vue';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { FormatConfig, valueType } from './utils';

import { computed, defineComponent, shallowRef } from 'vue';

import { pickAttrs } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import {
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig } from '../config-provider/context';
import Skeleton from '../skeleton';
import StatisticNumber from './Number';
import useStyle from './style';

export type StatisticSemanticName = keyof StatisticSemanticClassNames &
  keyof StatisticSemanticStyles;

export interface StatisticSemanticClassNames {
  content?: string;
  header?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
  title?: string;
  value?: string;
}

export interface StatisticSemanticStyles {
  content?: CSSProperties;
  header?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
  title?: CSSProperties;
  value?: CSSProperties;
}

export type StatisticClassNamesType = SemanticClassNamesType<
  StatisticProps,
  StatisticSemanticClassNames
>;

export type StatisticStylesType = SemanticStylesType<
  StatisticProps,
  StatisticSemanticStyles
>;

type StatisticRectProps = FormatConfig &
  ComponentBaseProps & {
    classes?: StatisticClassNamesType;
    loading?: boolean;
    prefix?: VueNode;
    styles?: StatisticStylesType;
    suffix?: VueNode;
    title?: VueNode;
    value?: valueType;
    valueRender?: (node: any) => VNodeChild;
    valueStyle?: CSSProperties;
  };

export type StatisticProps = StatisticRectProps;

export interface StatisticEmits {
  mouseenter: (e: MouseEvent) => void;
  mouseleave: (e: MouseEvent) => void;
}

export interface StatisticSlots {
  default: () => any;
  prefix: () => any;
  suffix: () => any;
  title: () => any;
}

const defaults = {
  value: 0,
  decimalSeparator: '.',
  groupSeparator: ',',
  loading: false,
  title: undefined,
  suffix: undefined,
  prefix: undefined,
} as any;

export interface InternalStatisticProps /* @vue-ignore */
  extends StatisticEmitsProps, StatisticProps {}

export interface StatisticEmitsProps {
  onMouseenter?: StatisticEmits['mouseenter'];
  onMouseleave?: StatisticEmits['mouseleave'];
}

const Statistic = defineComponent<
  InternalStatisticProps,
  StatisticEmits,
  string,
  SlotsType<StatisticSlots>
>(
  (props = defaults, { slots, attrs, emit, expose }) => {
    const {
      direction,
      prefixCls,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('statistic', props);
    const { classes, styles } = toPropsRefs(props, 'classes', 'styles');
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const internalRef = shallowRef<HTMLDivElement>();
    // =========== Merged Props for Semantic ===========
    const mergedProps = computed(() => props);
    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      StatisticClassNamesType,
      StatisticStylesType,
      StatisticProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );
    expose({
      nativeElement: internalRef,
    });
    const handleMouseEnter = (e: MouseEvent) => {
      emit('mouseenter', e);
    };
    const handleMouseLeave = (e: MouseEvent) => {
      emit('mouseleave', e);
    };
    return () => {
      const {
        decimalSeparator,
        groupSeparator,
        formatter,
        precision,
        value,
        rootClass,
        loading,
        valueStyle,
        valueRender,
      } = props;
      const title = getSlotPropsFnRun(slots, props, 'title');
      const prefix = getSlotPropsFnRun(slots, props, 'prefix');
      const suffix = getSlotPropsFnRun(slots, props, 'suffix');

      const cls = clsx(
        prefixCls.value,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        contextClassName.value,
        (attrs as any).class,
        rootClass,
        mergedClassNames.value.root,
        hashId.value,
        cssVarCls.value,
      );
      const restProps = pickAttrs(attrs, { data: true, aria: true });

      const headerClassNames = clsx(
        `${prefixCls.value}-header`,
        mergedClassNames.value.header,
      );

      const titleClassNames = clsx(
        `${prefixCls.value}-title`,
        mergedClassNames.value.title,
      );

      const contentClassNames = clsx(
        `${prefixCls.value}-content`,
        mergedClassNames.value.content,
      );

      const valueClassNames = clsx(
        `${prefixCls.value}-content-value`,
        mergedClassNames.value.value,
      );

      const prefixClassNames = clsx(
        `${prefixCls.value}-content-prefix`,
        mergedClassNames.value.prefix,
      );

      const suffixClassNames = clsx(
        `${prefixCls.value}-content-suffix`,
        mergedClassNames.value.suffix,
      );

      const valueNode = (
        <StatisticNumber
          className={valueClassNames}
          decimalSeparator={decimalSeparator}
          formatter={formatter}
          groupSeparator={groupSeparator}
          precision={precision}
          prefixCls={prefixCls.value}
          style={mergedStyles.value.value}
          value={value!}
        />
      );
      return (
        <div
          {...restProps}
          class={cls}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
          ref={internalRef}
          style={[mergedStyles.value.root, (attrs as any).style]}
        >
          {!!title && (
            <div class={headerClassNames} style={mergedStyles.value.header}>
              <div class={titleClassNames} style={mergedStyles.value.title}>
                {title}
              </div>
            </div>
          )}
          <Skeleton
            active
            class={`${prefixCls.value}-skeleton`}
            loading={loading}
            paragraph={false}
          >
            <div
              class={contentClassNames}
              style={[valueStyle, mergedStyles.value.content]}
            >
              {!!prefix && (
                <span
                  class={prefixClassNames}
                  style={mergedStyles.value.prefix}
                >
                  {prefix}
                </span>
              )}
              {valueRender ? valueRender(valueNode) : valueNode}
              {!!suffix && (
                <span
                  class={suffixClassNames}
                  style={mergedStyles.value.suffix}
                >
                  {suffix}
                </span>
              )}
            </div>
          </Skeleton>
        </div>
      );
    };
  },
  {
    name: 'AStatistic',
    inheritAttrs: false,
  },
);

export default Statistic;

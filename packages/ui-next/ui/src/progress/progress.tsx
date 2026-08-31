import type { App, AriaAttributes, CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';

import { computed, defineComponent } from 'vue';

import { FastColor } from '@arvin-studio/headless';
import {
  CheckCircleFilled,
  CheckOutlined,
  CloseCircleFilled,
  CloseOutlined,
} from '@arvin-studio/icons';
import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  useMergeSemantic,
  useSemanticRootStyle,
  useToArr,
  useToProps,
} from '../_util/hooks';
import { toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import { useComponentBaseConfig } from '../config-provider/context';
import Circle from './Circle';
import Line from './Line';
import Steps from './Steps';
import useStyle from './style';
import { getSize, getSuccessPercent, validProgress } from './utils';

export type ProgressSemanticName = keyof ProgressSemanticClassNames &
  keyof ProgressSemanticStyles;

export interface ProgressSemanticClassNames {
  body?: string;
  indicator?: string;
  rail?: string;
  root?: string;
  track?: string;
}

export interface ProgressSemanticStyles {
  body?: CSSProperties;
  indicator?: CSSProperties;
  rail?: CSSProperties;
  root?: CSSProperties;
  track?: CSSProperties;
}

export type ProgressClassNamesType = SemanticClassNamesType<
  ProgressProps,
  ProgressSemanticClassNames
>;

export type ProgressStylesType = SemanticStylesType<
  ProgressProps,
  ProgressSemanticStyles
>;

export const ProgressTypes = ['line', 'circle', 'dashboard'] as const;
export type ProgressType = (typeof ProgressTypes)[number];
const ProgressStatuses = ['normal', 'exception', 'active', 'success'] as const;
export type ProgressSize = 'default' | 'medium' | 'small';
export type StringGradients = Record<string, string>;
interface FromToGradients {
  from: string;
  to: string;
}
export type ProgressGradient = (FromToGradients | StringGradients) & {
  direction?: string;
};
export interface PercentPositionType {
  align?: 'center' | 'end' | 'start';
  type?: 'inner' | 'outer';
}

export interface SuccessProps {
  percent?: number;
  strokeColor?: string;
}

export type ProgressAriaProps = Pick<
  AriaAttributes,
  'aria-label' | 'aria-labelledby'
>;

export type GapPlacement = 'bottom' | 'end' | 'start' | 'top';
export type GapPosition = 'bottom' | 'left' | 'right' | 'top';

export interface ProgressProps extends ComponentBaseProps, ProgressAriaProps {
  classes?: ProgressClassNamesType;
  format?: (percent?: number, successPercent?: number) => any;
  gapDegree?: number;
  gapPlacement?: GapPlacement;
  /** @deprecated please use `gapPlacement` instead */
  gapPosition?: GapPosition;
  percent?: number;
  percentPosition?: PercentPositionType;
  railColor?: string;
  rounding?: (step: number) => number;
  showInfo?: boolean;
  size?:
    | [number | string, number]
    | number
    | ProgressSize
    | { height?: number; width?: number };
  status?: (typeof ProgressStatuses)[number];
  steps?: number | { count: number; gap: number };
  strokeColor?: ProgressGradient | string | string[];
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeWidth?: number;
  styles?: ProgressStylesType;
  success?: SuccessProps;
  /** @deprecated Please use `railColor` instead */
  trailColor?: string;
  type?: ProgressType;
  /** @deprecated Use `size` instead */
  width?: number;
}

export interface ProgressSlots {
  default?: () => any;
}

const defaultProps = {
  percent: 0,
  showInfo: true,
  size: 'medium',
  type: 'line',
  percentPosition: {},
} as ProgressProps;

function getStrokeColorIsBright(strokeColor?: ProgressProps['strokeColor']) {
  if (!strokeColor) {
    return false;
  }
  const color =
    typeof strokeColor === 'string'
      ? strokeColor
      : Object.values(strokeColor)[0];
  try {
    return new FastColor(color).isLight();
  } catch (error) {
    if (isDev) {
      console.error(error);
    }
    return false;
  }
}

function getPercentNumber(
  percent: number | undefined,
  success: ProgressProps['success'],
) {
  const successPercent = getSuccessPercent({ success });
  return Number.parseInt((successPercent ?? percent ?? 0)?.toString(), 10);
}

const Progress = defineComponent<
  ProgressProps,
  EmptyEmit,
  string,
  SlotsType<ProgressSlots>
>(
  (props = defaultProps, { attrs }) => {
    const {
      prefixCls,
      direction,
      class: contextClassName,
      style: contextStyle,
      classes: contextClassNames,
      styles: contextStyles,
    } = useComponentBaseConfig('progress', props);
    const { classes, styles, rootClass } = toPropsRefs(
      props,
      'classes',
      'styles',
      'rootClass',
    );
    const [hashId, cssVarCls] = useStyle(prefixCls);

    const mergedPercent = computed(() => props.percent ?? defaultProps.percent);
    const mergedSize = computed(() => props.size ?? defaultProps.size);
    const mergedShowInfo = computed(
      () => props.showInfo ?? defaultProps.showInfo,
    );
    const mergedType = computed(() => props.type ?? defaultProps.type);
    const mergedPercentPosition = computed(
      () => props.percentPosition ?? defaultProps.percentPosition!,
    );

    const mergedProps = computed(() => ({
      ...props,
      percent: mergedPercent.value,
      size: mergedSize.value,
      showInfo: mergedShowInfo.value,
      type: mergedType.value,
      percentPosition: mergedPercentPosition.value,
    }));

    const contextStyleRoot = useSemanticRootStyle(contextStyle);
    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      ProgressClassNamesType,
      ProgressStylesType,
      ProgressProps
    >(
      useToArr(contextClassNames, classes),
      useToArr(contextStyles, contextStyleRoot as any, styles),
      useToProps(mergedProps),
    );

    const infoAlign = computed(
      () => mergedPercentPosition.value.align ?? 'end',
    );
    const infoPosition = computed(
      () => mergedPercentPosition.value.type ?? 'outer',
    );
    const isLineType = computed(() => mergedType.value === 'line');
    const isPureLineType = computed(() => isLineType.value && !props.steps);

    const strokeColorNotArray = computed(() =>
      Array.isArray(props.strokeColor)
        ? props.strokeColor[0]
        : props.strokeColor,
    );
    const strokeColorNotGradient = computed(() =>
      typeof props.strokeColor === 'string' || Array.isArray(props.strokeColor)
        ? props.strokeColor
        : undefined,
    );
    const strokeColorIsBright = computed(() =>
      getStrokeColorIsBright(strokeColorNotArray.value),
    );

    const percentNumber = computed(() =>
      getPercentNumber(mergedPercent.value, props.success),
    );
    const progressStatus = computed<(typeof ProgressStatuses)[number]>(() => {
      if (
        !ProgressStatuses.includes(props.status!) &&
        percentNumber.value >= 100
      ) {
        return 'success';
      }
      return props.status || 'normal';
    });

    if (isDev) {
      const warning = devUseWarning('Progress');
      [
        ['width', 'size'],
        ['trailColor', 'railColor'],
        ['gapPosition', 'gapPlacement'],
      ].forEach(([deprecatedName, newName]) => {
        warning.deprecated(
          (props as any)[deprecatedName!] === undefined,
          deprecatedName!,
          newName!,
        );
      });

      if (mergedType.value === 'circle' || mergedType.value === 'dashboard') {
        if (Array.isArray(props.size)) {
          warning(
            false,
            'usage',
            'Type "circle" and "dashboard" do not accept array as `size`, please use number or preset size instead.',
          );
        } else if (typeof props.size === 'object') {
          warning(
            false,
            'usage',
            'Type "circle" and "dashboard" do not accept object as `size`, please use number or preset size instead.',
          );
        }
      }

      warning.deprecated(
        props.size !== 'default',
        'size="default"',
        'size="medium"',
      );
    }

    const progressInfo = computed(() => {
      if (!mergedShowInfo.value) {
        return null;
      }

      const successPercent = getSuccessPercent(props);
      let text: any;
      const textFormatter = props.format || ((number?: number) => `${number}%`);
      const isBrightInnerColor =
        isLineType.value &&
        strokeColorIsBright.value &&
        infoPosition.value === 'inner';
      if (
        infoPosition.value === 'inner' ||
        props.format ||
        (progressStatus.value !== 'exception' &&
          progressStatus.value !== 'success')
      ) {
        text = textFormatter(
          validProgress(mergedPercent.value),
          validProgress(successPercent),
        );
      } else if (progressStatus.value === 'exception') {
        text = isLineType.value ? <CloseCircleFilled /> : <CloseOutlined />;
      } else if (progressStatus.value === 'success') {
        text = isLineType.value ? <CheckCircleFilled /> : <CheckOutlined />;
      }

      return (
        <span
          class={clsx(
            `${prefixCls.value}-indicator`,
            {
              [`${prefixCls.value}-indicator-bright`]: isBrightInnerColor,
              [`${prefixCls.value}-indicator-${infoAlign.value}`]:
                isPureLineType.value,
              [`${prefixCls.value}-indicator-${infoPosition.value}`]:
                isPureLineType.value,
            },
            mergedClassNames.value.indicator,
          )}
          style={mergedStyles.value.indicator}
          title={typeof text === 'string' ? text : undefined}
        >
          {text}
        </span>
      );
    });

    const sharedProps = computed(() => ({
      ...mergedProps.value,
      classes: mergedClassNames.value,
      styles: mergedStyles.value,
    }));

    return () => {
      const {
        className,
        style: attrStyle,
        restAttrs,
      } = getAttrStyleAndClass(attrs);
      let progress: any;

      if (mergedType.value === 'line') {
        const steps =
          typeof props.steps === 'object' ? props.steps.count : props.steps;
        progress = props.steps ? (
          <Steps
            {...sharedProps.value}
            prefixCls={prefixCls.value}
            steps={steps!}
            strokeColor={strokeColorNotGradient.value}
          >
            {progressInfo.value}
          </Steps>
        ) : (
          <Line
            {...sharedProps.value}
            direction={direction.value}
            percentPosition={{
              align: infoAlign.value,
              type: infoPosition.value,
            }}
            prefixCls={prefixCls.value}
            strokeColor={strokeColorNotArray.value}
          >
            {progressInfo.value}
          </Line>
        );
      } else if (
        mergedType.value === 'circle' ||
        mergedType.value === 'dashboard'
      ) {
        progress = (
          <Circle
            {...sharedProps.value}
            prefixCls={prefixCls.value}
            progressStatus={progressStatus.value}
            strokeColor={strokeColorNotArray.value as any}
          >
            {progressInfo.value}
          </Circle>
        );
      }

      const classString = clsx(
        prefixCls.value,
        `${prefixCls.value}-status-${progressStatus.value}`,
        {
          [`${prefixCls.value}-${(mergedType.value === 'dashboard' && 'circle') || mergedType.value}`]:
            mergedType.value !== 'line',
          [`${prefixCls.value}-inline-circle`]:
            mergedType.value === 'circle' &&
            getSize(mergedSize.value, 'circle')[0] <= 20,
          [`${prefixCls.value}-line`]: isPureLineType.value,
          [`${prefixCls.value}-line-align-${infoAlign.value}`]:
            isPureLineType.value,
          [`${prefixCls.value}-line-position-${infoPosition.value}`]:
            isPureLineType.value,
          [`${prefixCls.value}-steps`]: props.steps,
          [`${prefixCls.value}-show-info`]: mergedShowInfo.value,
          [`${prefixCls.value}-small`]: mergedSize.value === 'small',
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        contextClassName.value,
        className,
        rootClass.value,
        mergedClassNames.value.root,
        hashId.value,
        cssVarCls.value,
      );

      const rootStyle = [mergedStyles.value.root, attrStyle];

      const ariaProps: Record<string, any> = {};
      if (props['aria-label'] !== undefined) {
        ariaProps['aria-label'] = props['aria-label'];
      }
      if (props['aria-labelledby'] !== undefined) {
        ariaProps['aria-labelledby'] = props['aria-labelledby'];
      }

      return (
        <div
          {...restAttrs}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percentNumber.value}
          class={classString}
          role="progressbar"
          style={rootStyle}
          {...ariaProps}
        >
          {progress}
        </div>
      );
    };
  },
  {
    name: 'AsProgress',
    inheritAttrs: false,
  },
);

(Progress as any).install = (app: App) => {
  app.component(Progress.name, Progress);
};

export default Progress;

import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';
import type {
  ProgressProps,
  ProgressSemanticClassNames,
  ProgressSemanticStyles,
} from './progress';

import { computed, defineComponent } from 'vue';

import { Circle as VCCircle } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import { useComponentBaseConfig } from '../config-provider/context';
import Tooltip from '../tooltip';
import { getPercentage, getSize, getStrokeColor } from './utils';

const CIRCLE_MIN_STROKE_WIDTH = 3;

const getMinPercent = (width: number): number =>
  (CIRCLE_MIN_STROKE_WIDTH / width) * 100;

const OMIT_SEMANTIC_NAMES = ['root', 'body', 'indicator'];

export interface CircleProps extends Omit<ProgressProps, 'classes' | 'styles'> {
  classes: ProgressSemanticClassNames;
  prefixCls: string;
  progressStatus: string;
  strokeColor?: Record<string, string> | string;
  styles: ProgressSemanticStyles;
}

const defaults = {
  strokeLinecap: 'round',
  width: 120,
} as any;
const Circle = defineComponent<
  CircleProps,
  EmptyEmit,
  string,
  SlotsType<{
    default?: () => any;
  }>
>(
  (props = defaults, { slots }) => {
    const size = computed(() => props.size ?? props.width ?? 120);

    const { direction } = useComponentBaseConfig('progress', props);
    const realGapDegree = computed(() => {
      const { gapDegree, type } = props;
      // Support gapDeg = 0 when type = 'dashboard'
      if (gapDegree || gapDegree === 0) {
        return gapDegree;
      }
      if (type === 'dashboard') {
        return 75;
      }
      return undefined;
    });

    const gapPos = computed(() => {
      const { gapPosition, gapPlacement, type } = props;
      const mergedPlacement =
        (gapPlacement ?? gapPosition) ||
        (type === 'dashboard' && 'bottom') ||
        undefined;
      const isRTL = direction.value === 'rtl';
      switch (mergedPlacement) {
        case 'end': {
          return isRTL ? 'left' : 'right';
        }
        case 'start': {
          return isRTL ? 'right' : 'left';
        }
        default: {
          return mergedPlacement;
        }
      }
    });
    return () => {
      const {
        trailColor,
        railColor,
        strokeColor: customStrokeColor,
        success,
        prefixCls,
        classes,
        styles,
        strokeLinecap,
        steps,
      } = props;
      const mergedRailColor = railColor ?? trailColor;
      const [width, height] = getSize(size.value, 'circle');
      let strokeWidth = props?.strokeWidth;
      if (strokeWidth === undefined) {
        strokeWidth = Math.max(getMinPercent(width), 6);
      }
      const circleStyle = {
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${width * 0.15 + 6}px`,
      };

      // using className to style stroke color
      const isGradient =
        Object.prototype.toString.call(customStrokeColor) === '[object Object]';
      const strokeColor = getStrokeColor({
        success,
        strokeColor: props.strokeColor,
      });
      const percentArray = getPercentage(props);

      const wrapperClassName = clsx(
        `${prefixCls}-body`,
        { [`${prefixCls}-circle-gradient`]: isGradient },
        classes.body,
      );

      const circleContent = (
        <VCCircle
          classNames={omit(classes, OMIT_SEMANTIC_NAMES)}
          gapDegree={realGapDegree.value}
          gapPosition={gapPos.value}
          percent={steps ? percentArray[1] : percentArray}
          prefixCls={prefixCls}
          railColor={mergedRailColor}
          railWidth={strokeWidth}
          steps={steps}
          strokeColor={steps ? strokeColor[1] : strokeColor}
          strokeLinecap={strokeLinecap}
          strokeWidth={strokeWidth}
          styles={omit(styles, OMIT_SEMANTIC_NAMES)}
        />
      );
      const smallCircle = width <= 20;
      const children = slots?.default ? slots.default() : null;

      const node = (
        <div
          class={wrapperClassName}
          style={{ ...circleStyle, ...styles.body }}
        >
          {circleContent}
          {!smallCircle && children}
        </div>
      );
      if (smallCircle) {
        return <Tooltip title={children as any}>{node}</Tooltip>;
      }
      return node;
    };
  },
  {
    name: 'ProgressCircle',
    inheritAttrs: false,
  },
);

export default Circle;

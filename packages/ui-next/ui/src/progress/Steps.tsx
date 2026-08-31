import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';
import type {
  ProgressProps,
  ProgressSemanticClassNames,
  ProgressSemanticStyles,
} from './progress';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getSize } from './utils';

export interface ProgressStepsProps extends Omit<
  ProgressProps,
  'classes' | 'styles'
> {
  classes: ProgressSemanticClassNames;
  railColor?: string;
  steps: number;
  strokeColor?: string | string[];
  styles: ProgressSemanticStyles;
  /** @deprecated Please use `railColor` instead */
  trailColor?: string;
}

export interface ProgressStepsSlots {
  default?: () => any;
}

const Steps = defineComponent<
  ProgressStepsProps,
  EmptyEmit,
  string,
  SlotsType<ProgressStepsSlots>
>(
  (props, { slots }) => {
    return () => {
      const {
        classes,
        styles,
        size,
        steps,
        rounding = Math.round,
        percent = 0,
        strokeWidth = 8,
        strokeColor,
        railColor,
        trailColor,
        prefixCls,
      } = props;

      const current = rounding(steps * (percent / 100));
      const stepWidth = size === 'small' ? 2 : 14;
      const mergedSize = size ?? [stepWidth, strokeWidth];
      const [width, height] = getSize(mergedSize, 'step', {
        steps,
        strokeWidth,
      });
      const unitWidth = width / steps;

      const mergedRailColor = railColor ?? trailColor;

      const styledSteps = Array.from<any>({ length: steps }).map((_, index) => {
        const color = Array.isArray(strokeColor)
          ? strokeColor[index]
          : strokeColor;
        return (
          <div
            class={clsx(
              `${prefixCls}-steps-item`,
              {
                [`${prefixCls}-steps-item-active`]: index <= current - 1,
              },
              classes.track,
            )}
            key={index}
            style={{
              backgroundColor: index <= current - 1 ? color : mergedRailColor,
              width: `${unitWidth}px`,
              height: `${height}px`,
              ...styles.track,
            }}
          />
        );
      });

      return (
        <div
          class={clsx(`${prefixCls}-steps-body`, classes.body)}
          style={styles.body}
        >
          {styledSteps}
          {slots.default?.()}
        </div>
      );
    };
  },
  {
    name: 'ProgressSteps',
    inheritAttrs: false,
  },
);

export default Steps;

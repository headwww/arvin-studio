import type { CSSProperties } from 'vue';

import { defineComponent, shallowRef, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface ProgressProps {
  percent: number;
  prefixCls: string;
}

const viewSize = 100;
const borderWidth = viewSize / 5;
const radius = viewSize / 2 - borderWidth / 2;
const circumference = radius * 2 * Math.PI;
const position = 50;

interface CircleProps {
  dotClassName?: string;
  hasCircleCls?: boolean;
}

const CustomCircle = defineComponent<CircleProps>((props) => {
  return () => {
    const { dotClassName, hasCircleCls } = props;
    return (
      <circle
        class={clsx(`${dotClassName}-circle`, {
          [`${dotClassName}-circle-bg`]: hasCircleCls,
        })}
        cx={position}
        cy={position}
        r={radius}
        stroke-width={borderWidth}
      />
    );
  };
});

const Progress = defineComponent<ProgressProps>((props) => {
  const render = shallowRef(false);
  // ==================== Visible =====================

  watch(
    () => props.percent !== 0,
    () => {
      if (props.percent !== 0) {
        render.value = true;
      }
    },
    {
      immediate: true,
    },
  );
  return () => {
    const { percent, prefixCls } = props;
    const dotClassName = `${prefixCls}-dot`;
    const holderClassName = `${dotClassName}-holder`;
    const hideClassName = `${holderClassName}-hidden`;
    // ==================== Progress ====================
    const safePtg = Math.max(Math.min(percent, 100), 0);

    // ===================== Render =====================
    if (!render.value) {
      return null;
    }

    const circleStyle: CSSProperties = {
      strokeDashoffset: `${circumference / 4}`,
      strokeDasharray: `${(circumference * safePtg) / 100} ${
        (circumference * (100 - safePtg)) / 100
      }`,
    };
    return (
      <span
        class={clsx(
          holderClassName,
          `${dotClassName}-progress`,
          safePtg <= 0 && hideClassName,
        )}
      >
        <svg
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={safePtg}
          role="progressbar"
          viewBox={`0 0 ${viewSize} ${viewSize}`}
        >
          <CustomCircle dotClassName={dotClassName} hasCircleCls />
          <CustomCircle dotClassName={dotClassName} style={circleStyle} />
        </svg>
      </span>
    );
  };
});

export default Progress;

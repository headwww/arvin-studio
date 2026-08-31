import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import Progress from './Progress';

export interface IndicatorProps {
  percent?: number;
  prefixCls: string;
}

export const Looper = defineComponent<IndicatorProps>(
  (props, { attrs }) => {
    return () => {
      const { prefixCls, percent = 0 } = props;
      const dotClassName = `${prefixCls}-dot`;
      const holderClassName = `${dotClassName}-holder`;
      const hideClassName = `${holderClassName}-hidden`;
      // ===================== Render =====================
      return (
        <>
          <span
            {...attrs}
            class={clsx(holderClassName, percent > 0 && hideClassName)}
          >
            <span class={dotClassName} />
          </span>
          <Progress percent={percent} prefixCls={prefixCls} />
        </>
      );
    };
  },
  {
    inheritAttrs: false,
  },
);
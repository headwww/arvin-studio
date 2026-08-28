import type { VueNode } from '../../_util';

import { createVNode, defineComponent, isVNode } from 'vue';

import { getSlotPropsFnRun } from '../../_util/tools';
import { Looper } from './Looper';

export interface IndicatorProps {
  indicator?: VueNode;
  percent?: number;
  prefixCls: string;
}

const defaultProps = {
  indicator: undefined,
} as any;

const Indicator = defineComponent<IndicatorProps>(
  (props = defaultProps, { slots, attrs }) => {
    return () => {
      const { prefixCls, percent } = props;
      const dotClassName = `${prefixCls}-dot`;
      const indicator = getSlotPropsFnRun(slots, props, 'indicator');

      if (indicator && isVNode(indicator)) {
        return createVNode(indicator, {
          class: dotClassName,
          percent,
        });
      }

      return <Looper {...attrs} percent={percent} prefixCls={prefixCls} />;
    };
  },
  {
    inheritAttrs: false,
  },
);

export default Indicator;

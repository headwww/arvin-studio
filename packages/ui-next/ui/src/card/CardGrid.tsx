import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { useBaseConfig } from '../config-provider/context';

export interface CardGridProps {
  hoverable?: boolean;
  prefixCls?: string;
}

const defaultProps: CardGridProps = {
  hoverable: true,
};

const CardGrid = defineComponent<CardGridProps>(
  (props = defaultProps, { attrs, slots }) => {
    const { prefixCls } = useBaseConfig('card', props);
    return () => {
      const prefix = `${prefixCls.value}-grid`;
      const { className, restAttrs, style } = getAttrStyleAndClass(attrs);
      const classString = clsx(prefix, className, {
        [`${prefix}-hoverable`]: props.hoverable,
      });
      return (
        <div {...restAttrs} class={classString} style={style}>
          {slots?.default?.()}
        </div>
      );
    };
  },
  {
    name: 'AsCardGrid',
    inheritAttrs: false,
  },
);

export default CardGrid;

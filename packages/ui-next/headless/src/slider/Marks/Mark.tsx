import type { CSSProperties } from 'vue';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useInjectSlider } from '../context';
import { getDirectionStyle } from '../util';

export interface MarkProps {
  onClick?: Function;
  prefixCls: string;
  style?: CSSProperties;
  value: number;
}

const Mark = defineComponent<MarkProps>((props, { slots }) => {
  const sliderContext = useInjectSlider();
  return () => {
    const { prefixCls, value } = props;
    const { min, max, direction, includedStart, includedEnd, included } =
      sliderContext.value;

    const textCls = `${prefixCls}-text`;

    // ============================ Offset ============================
    const positionStyle = getDirectionStyle(direction, value, min, max);

    return (
      <span
        class={clsx(textCls, {
          [`${textCls}-active`]:
            included && includedStart <= value && value <= includedEnd,
        })}
        onClick={() => {
          props?.onClick?.(value);
        }}
        onMousedown={(e: MouseEvent) => {
          e.stopPropagation();
        }}
        style={{ ...positionStyle, ...((props.style || {}) as CSSProperties) }}
      >
        {slots.default?.()}
      </span>
    );
  };
});

export default Mark;

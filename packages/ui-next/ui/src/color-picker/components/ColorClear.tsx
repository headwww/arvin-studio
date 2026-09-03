import type { AggregationColor } from '../color';

import { defineComponent } from 'vue';

import { getAttrStyleAndClass } from '@arvin-studio/headless';

import { generateColor } from '../util';

export interface ColorClearProps {
  onChange?: (value: AggregationColor) => void;
  prefixCls: string;
  value?: AggregationColor;
}

export default defineComponent<ColorClearProps>(
  (props, { attrs }) => {
    const handleClick = () => {
      if (!props.onChange || !props.value || props.value.cleared) {
        return;
      }
      const hsba = props.value.toHsb();
      hsba.a = 0;
      const genColor = generateColor(hsba);
      genColor.cleared = true;
      props.onChange(genColor);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.key === 'Enter' || e.key === ' ')) {
        return;
      }

      e.preventDefault();
      handleClick();
    };

    return () => {
      const { className, style } = getAttrStyleAndClass(attrs);
      return (
        <div
          aria-label="Clear color"
          class={[`${props.prefixCls}-clear`, className]}
          onClick={handleClick}
          onKeydown={handleKeyDown}
          role="button"
          style={style}
          tabindex={0}
        />
      );
    };
  },
  {
    name: 'ColorClear',
    inheritAttrs: false,
  },
);

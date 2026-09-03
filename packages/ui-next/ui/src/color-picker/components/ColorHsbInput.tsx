import type { HSB } from '@arvin-studio/headless';

import type { AggregationColor } from '../color';

import { defineComponent, shallowRef } from 'vue';

import { generateColor, getRoundNumber } from '../util';
import ColorSteppers from './ColorSteppers';

export interface ColorHsbInputProps {
  onChange?: (value: AggregationColor) => void;
  prefixCls: string;
  value?: AggregationColor;
}

export default defineComponent<ColorHsbInputProps>(
  (props) => {
    const internalValue = shallowRef<AggregationColor>(
      generateColor(props.value || '#000'),
    );

    const hsbValue = () => props.value || internalValue.value;

    const handleHsbChange = (step: null | number, type: keyof HSB) => {
      const hsb = hsbValue().toHsb();
      hsb[type] = type === 'h' ? step || 0 : (step || 0) / 100;
      const genColor = generateColor(hsb);

      internalValue.value = genColor;
      props.onChange?.(genColor);
    };

    return () => {
      const prefix = props.prefixCls;
      const hsb = hsbValue().toHsb();

      return (
        <div class={`${prefix}-hsb-input`}>
          <ColorSteppers
            className={`${prefix}-hsb-input`}
            formatter={(step) => getRoundNumber(step || 0).toString()}
            max={360}
            min={0}
            onChange={(step) => handleHsbChange(Number(step), 'h')}
            prefixCls={prefix}
            value={Number(hsb.h)}
          />
          <ColorSteppers
            className={`${prefix}-hsb-input`}
            formatter={(step) => `${getRoundNumber(step || 0)}%`}
            max={100}
            min={0}
            onChange={(step) => handleHsbChange(Number(step), 's')}
            prefixCls={prefix}
            value={Number(hsb.s) * 100}
          />
          <ColorSteppers
            className={`${prefix}-hsb-input`}
            formatter={(step) => `${getRoundNumber(step || 0)}%`}
            max={100}
            min={0}
            onChange={(step) => handleHsbChange(Number(step), 'b')}
            prefixCls={prefix}
            value={Number(hsb.b) * 100}
          />
        </div>
      );
    };
  },
  {
    name: 'ColorHsbInput',
    inheritAttrs: false,
  },
);

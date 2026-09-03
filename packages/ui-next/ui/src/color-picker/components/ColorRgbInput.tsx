import type { RGB } from '@arvin-studio/headless';

import type { AggregationColor } from '../color';

import { defineComponent, shallowRef } from 'vue';

import { generateColor } from '../util';
import ColorSteppers from './ColorSteppers';

export interface ColorRgbInputProps {
  onChange?: (value: AggregationColor) => void;
  prefixCls: string;
  value?: AggregationColor;
}

export default defineComponent<ColorRgbInputProps>(
  (props) => {
    const internalValue = shallowRef<AggregationColor>(
      generateColor(props.value || '#000'),
    );

    const rgbValue = () => props.value || internalValue.value;

    const handleRgbChange = (step: null | number, type: keyof RGB) => {
      const rgb = rgbValue().toRgb();
      rgb[type] = step || 0;
      const genColor = generateColor(rgb);

      internalValue.value = genColor;
      props.onChange?.(genColor);
    };

    return () => {
      const prefix = props.prefixCls;
      const rgb = rgbValue().toRgb();

      return (
        <div class={`${prefix}-rgb-input`}>
          <ColorSteppers
            className={`${prefix}-rgb-input`}
            max={255}
            min={0}
            onChange={(step) => handleRgbChange(Number(step), 'r')}
            prefixCls={prefix}
            value={Number(rgb.r)}
          />
          <ColorSteppers
            className={`${prefix}-rgb-input`}
            max={255}
            min={0}
            onChange={(step) => handleRgbChange(Number(step), 'g')}
            prefixCls={prefix}
            value={Number(rgb.g)}
          />
          <ColorSteppers
            className={`${prefix}-rgb-input`}
            max={255}
            min={0}
            onChange={(step) => handleRgbChange(Number(step), 'b')}
            prefixCls={prefix}
            value={Number(rgb.b)}
          />
        </div>
      );
    };
  },
  {
    name: 'ColorRgbInput',
    inheritAttrs: false,
  },
);

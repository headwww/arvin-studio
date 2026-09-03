import type { AggregationColor } from '../color';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { generateColor, getColorAlpha } from '../util';
import ColorSteppers from './ColorSteppers';

export interface ColorAlphaInputProps {
  onChange?: (value: AggregationColor) => void;
  prefixCls: string;
  value?: AggregationColor;
}

export default defineComponent<ColorAlphaInputProps>(
  (props) => {
    const internalValue = shallowRef<AggregationColor>(
      generateColor(props.value || '#000'),
    );

    watch(
      () => props.value,
      (val) => {
        if (val) internalValue.value = val;
      },
    );

    const alphaValue = computed(() => props.value ?? internalValue.value);

    const handleAlphaChange = (step: null | number) => {
      const hsba = alphaValue.value.toHsb();
      hsba.a = (step || 0) / 100;
      const genColor = generateColor(hsba);

      internalValue.value = genColor;
      props.onChange?.(genColor);
    };

    return () => {
      const { prefixCls } = props;
      return (
        <ColorSteppers
          className={`${prefixCls}-alpha-input`}
          formatter={(step) => `${step}%`}
          onChange={handleAlphaChange}
          prefixCls={prefixCls}
          value={getColorAlpha(alphaValue.value)}
        />
      );
    };
  },
  {
    name: 'ColorAlphaInput',
    inheritAttrs: false,
  },
);

import type { AggregationColor } from '../color';

import { defineComponent, shallowRef, watch } from 'vue';

import Input from '../../input/Input';
import { toHexFormat } from '../color';
import { generateColor } from '../util';

export interface ColorHexInputProps {
  onChange?: (value: AggregationColor) => void;
  prefixCls: string;
  value?: AggregationColor;
}

const hexReg = /(^#[\da-f]{6}$)|(^#[\da-f]{8}$)/i;
const isHexString = (hex?: string) => hexReg.test(`#${hex}`);

export default defineComponent<ColorHexInputProps>(
  (props) => {
    const hexValue = shallowRef<string>();

    watch(
      () => props.value,
      (val) => {
        if (val) {
          hexValue.value = toHexFormat(val.toHexString());
        }
      },
      { immediate: true },
    );

    const handleHexChange = (e: Event) => {
      const originValue = (e.target as HTMLInputElement).value;
      const formatted = toHexFormat(originValue);
      hexValue.value = formatted;

      if (isHexString(toHexFormat(originValue, true))) {
        props.onChange?.(generateColor(originValue));
      }
    };

    return () => (
      <Input
        class={`${props.prefixCls}-hex-input`}
        onChange={handleHexChange}
        prefix="#"
        size="small"
        value={hexValue.value}
      />
    );
  },
  {
    name: 'ColorHexInput',
    inheritAttrs: false,
  },
);

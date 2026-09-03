import type { EmptyEmit } from '../../_util/';
import type { AggregationColor } from '../color';
import type { ColorFormatType } from '../interface';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import Select from '../../select';
import { FORMAT_HEX, FORMAT_HSB, FORMAT_RGB } from '../interface';
import ColorAlphaInput from './ColorAlphaInput';
import ColorHexInput from './ColorHexInput';
import ColorHsbInput from './ColorHsbInput';
import ColorRgbInput from './ColorRgbInput';

export interface ColorInputProps {
  disabledAlpha?: boolean;
  disabledFormat?: boolean;
  format?: ColorFormatType;
  onChange?: (value: AggregationColor) => void;
  onFormatChange?: (format: ColorFormatType) => void;
  prefixCls: string;
  value?: AggregationColor;
}

const selectOptions = [FORMAT_HEX, FORMAT_HSB, FORMAT_RGB].map((format) => ({
  value: format,
  label: format.toUpperCase(),
}));

export default defineComponent<ColorInputProps, EmptyEmit, string>(
  (props) => {
    const colorFormat = shallowRef<ColorFormatType>(props.format ?? FORMAT_HEX);

    watch(
      () => props.format,
      (val) => {
        if (val) colorFormat.value = val;
      },
    );

    const triggerFormatChange = (fmt: ColorFormatType) => {
      colorFormat.value = fmt;
      props.onFormatChange?.(fmt);
    };

    const steppersNode = computed(() => {
      const inputProps = {
        value: props.value,
        prefixCls: props.prefixCls,
        onChange: props.onChange,
      };
      switch (colorFormat.value) {
        case FORMAT_HSB: {
          return <ColorHsbInput {...inputProps} />;
        }
        case FORMAT_RGB: {
          return <ColorRgbInput {...inputProps} />;
        }
        default: {
          return <ColorHexInput {...inputProps} />;
        }
      }
    });

    return () => {
      const prefixCls = props.prefixCls;

      return (
        <div class={`${prefixCls}-input-container`}>
          {!props.disabledFormat && (
            <Select
              class={`${prefixCls}-format-select`}
              getPopupContainer={(current) => current}
              onChange={triggerFormatChange}
              options={selectOptions}
              placement="bottomRight"
              popupMatchSelectWidth={68}
              size="small"
              value={colorFormat.value}
              variant="borderless"
            />
          )}
          <div class={`${prefixCls}-input`}>{steppersNode.value}</div>
          {!props.disabledAlpha && (
            <ColorAlphaInput
              onChange={props.onChange}
              prefixCls={prefixCls}
              value={props.value}
            />
          )}
        </div>
      );
    };
  },
  {
    name: 'ColorInput',
    inheritAttrs: false,
  },
);

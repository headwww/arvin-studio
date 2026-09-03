import { computed, defineComponent, shallowRef, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import InputNumber from '../../input-number';

export interface ColorSteppersProps {
  className?: string;
  formatter?: (value: null | number) => number | string;
  max?: number;
  min?: number;
  onChange?: (value: null | number) => void;
  prefixCls: string;
  value?: number;
}

export default defineComponent<ColorSteppersProps>(
  (props) => {
    const internalValue = shallowRef<number | undefined>(0);

    watch(
      () => props.value,
      (val) => {
        if (typeof val === 'number') {
          internalValue.value = val;
        }
      },
    );

    const stepValue = computed(() =>
      Number.isNaN(props.value) ? internalValue.value : props.value,
    );

    return () => {
      const { prefixCls, className, min, max, formatter, onChange } = props;
      return (
        <InputNumber
          class={clsx(`${prefixCls}-steppers`, className)}
          formatter={formatter as any}
          max={max ?? 100}
          min={min ?? 0}
          onChange={(step: any) => {
            internalValue.value = (step ?? 0) as number;
            onChange?.(step ?? null);
          }}
          size="small"
          value={stepValue.value as number | undefined}
        />
      );
    };
  },
  {
    name: 'ColorSteppers',
    inheritAttrs: false,
  },
);

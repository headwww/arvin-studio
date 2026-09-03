import type { GradientColor } from '../../color';
import type { PanelPickerContextProps } from '../../context';

import { computed, defineComponent, shallowRef, watch } from 'vue';

import { AggregationColor } from '../../color';
import { getGradientPercentColor } from '../../util';
import { GradientColorSlider } from '../ColorSlider';

function sortColors(colors: { color: string; percent: number }[]) {
  return [...colors].toSorted((a, b) => a.percent - b.percent);
}

export interface GradientColorBarProps extends PanelPickerContextProps {
  colors: GradientColor;
}

/**
 * GradientColorBar will auto show when the mode is `gradient`.
 */
export default defineComponent<GradientColorBarProps>(
  (props) => {
    const isGradient = computed(() => props.mode === 'gradient');

    const colorList = computed(() =>
      props.colors.map((info) => ({
        percent: info.percent,
        color: info.color.toRgbString(),
      })),
    );

    const values = computed(() => colorList.value.map((info) => info.percent));

    const colorsRef = shallowRef(colorList.value);

    watch(
      colorList,
      (val) => {
        colorsRef.value = val;
      },
      { deep: true },
    );

    const onDragStart = ({
      rawValues,
      draggingIndex,
      draggingValue,
    }: {
      draggingIndex: number;
      draggingValue: number;
      rawValues: number[];
    }) => {
      if (rawValues.length > colorList.value.length) {
        // Add new node
        const newPointColor = getGradientPercentColor(
          colorList.value,
          draggingValue,
        );
        const nextColors = [...colorList.value];
        nextColors.splice(draggingIndex, 0, {
          percent: draggingValue,
          color: newPointColor,
        });

        colorsRef.value = nextColors;
      } else {
        colorsRef.value = colorList.value;
      }

      props.onGradientDragging(true);
      props.onChange?.(new AggregationColor(sortColors(colorsRef.value)), true);
    };

    const onDragChange = ({
      deleteIndex,
      draggingIndex,
      draggingValue,
    }: {
      deleteIndex: number;
      draggingIndex: number;
      draggingValue: number;
    }) => {
      let nextColors = [...colorsRef.value];

      if (deleteIndex === -1) {
        (nextColors as any)[draggingIndex] = {
          ...nextColors[draggingIndex],
          percent: draggingValue,
        };

        nextColors = sortColors(nextColors);
      } else {
        nextColors.splice(deleteIndex, 1);
      }

      props.onChange?.(new AggregationColor(nextColors), true);
    };

    const onKeyDelete = (index: number) => {
      const nextColors = [...colorList.value];
      nextColors.splice(index, 1);

      const nextColor = new AggregationColor(nextColors);

      props.onChange?.(nextColor);
      props.onChangeComplete?.(nextColor);
    };

    const onInternalChangeComplete = (nextValues: number[]) => {
      props.onChangeComplete?.(new AggregationColor(colorList.value));

      if (props.activeIndex >= nextValues.length) {
        props.onActive(nextValues.length - 1);
      }

      props.onGradientDragging(false);
    };

    return () => {
      if (!isGradient.value) {
        return null;
      }

      return (
        <GradientColorSlider
          activeIndex={props.activeIndex}
          className={`${props.prefixCls}-gradient-slider`}
          color={null as any}
          colors={colorList.value}
          disabled={false}
          max={100}
          min={0}
          onActive={props.onActive}
          onChangeComplete={onInternalChangeComplete}
          onDragChange={onDragChange}
          onDragStart={onDragStart}
          onKeyDelete={onKeyDelete}
          prefixCls={props.prefixCls}
          range
          type="gradient"
          value={values.value}
        />
      );
    };
  },
  {
    name: 'GradientColorBar',
    inheritAttrs: false,
  },
);

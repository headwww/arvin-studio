import type { BaseSliderProps } from '@arvin-studio/headless';

import { cloneVNode, computed, defineComponent } from 'vue';

import { UnstableProvider } from '@arvin-studio/headless';
import { clsx, omit } from '@arvin-studio/kit';

import Slider from '../../slider';
import { useSliderInternalContextProvider } from '../../slider/Context';
import { getGradientPercentColor } from '../util';

interface DragStartInfo {
  draggingIndex: number;
  draggingValue: number;
  rawValues: number[];
}
interface DragChangeInfo {
  deleteIndex: number;
  draggingIndex: number;
  draggingValue: number;
  rawValues: number[];
}

export interface GradientColorSliderProps extends Omit<
  BaseSliderProps,
  'color' | 'onChange' | 'onChangeComplete' | 'type' | 'value'
> {
  activeIndex?: number;
  className?: string;
  color: BaseSliderProps['color'] | null;
  onActive?: (index: number) => void;
  onChange?: (value: number[]) => void;
  onChangeComplete: (value: number[]) => void;
  onDragChange?: (info: DragChangeInfo) => void;
  // Drag events
  onDragStart?: (info: DragStartInfo) => void;

  // Key event
  onKeyDelete?: (index: number) => void;
  range?: boolean;

  type: 'gradient' | BaseSliderProps['type'];
  value: number[];
}

export const GradientColorSlider = defineComponent<GradientColorSliderProps>(
  (props) => {
    const linearCss = computed(() => {
      const colorsStr = props.colors
        .map((c) => `${c.color} ${c.percent}%`)
        .join(', ');
      return `linear-gradient(90deg, ${colorsStr})`;
    });

    const pointColor = computed(() => {
      if (!props.color || !props.type) {
        return null;
      }
      if (props.type === 'alpha') {
        return props.color.toRgbString();
      }
      if (props.type === 'gradient') {
        return null;
      }
      return `hsl(${props.color.toHsb().h}, 100%, 50%)`;
    });

    const handleRender = ({ node, index, value }: any) => {
      const nodeProps = node?.props || {};
      const mergedStyle = { ...nodeProps.style };

      if (props.type === 'gradient') {
        mergedStyle.background = getGradientPercentColor(props.colors, value);
      }

      const mergedNode = cloneVNode(node, {
        ...nodeProps,
        style: mergedStyle,
        class: clsx(nodeProps.class, {
          [`${props.prefixCls}-slider-handle-active`]:
            props.activeIndex === index,
        }),
        onFocus: (e: FocusEvent) => {
          props.onActive?.(index);
          nodeProps.onFocus?.(e);
        },
        onKeydown: (e: KeyboardEvent) => {
          if (
            (e.key === 'Delete' || e.key === 'Backspace') &&
            props.onKeyDelete
          ) {
            props.onKeyDelete(index);
          }
          nodeProps.onKeydown?.(e);
        },
      });

      return mergedNode;
    };

    useSliderInternalContextProvider({
      handleRender,
    });

    return () => {
      const {
        prefixCls,
        range = false,
        className,
        onDragStart,
        onDragChange,
        value,
        onChange,
        onChangeComplete,
        ...restProps
      } = props;
      const {
        activeIndex: _activeIndex,
        onActive: _onActive,
        onKeyDelete: _onKeyDelete,
        colors: _colors,
        color: _color,
        type: _type,
        ...sliderRestProps
      } = restProps;
      return (
        <UnstableProvider value={{ onDragStart, onDragChange }}>
          <Slider
            {...(sliderRestProps as any)}
            class={clsx(className, `${prefixCls}-slider`)}
            classes={{
              rail: `${prefixCls}-slider-rail`,
              handle: `${prefixCls}-slider-handle`,
            }}
            onChange={(v: number | number[]) =>
              onChange?.(Array.isArray(v) ? v : [v])
            }
            onChangeComplete={(v: number | number[]) =>
              onChangeComplete(Array.isArray(v) ? v : [v])
            }
            range={range ? { editable: true, minCount: 2 } : false}
            styles={{
              rail: {
                background: linearCss.value,
              },
              handle: pointColor.value
                ? {
                    background: pointColor.value,
                  }
                : {},
            }}
            tooltip={{ open: false }}
            track={false}
            value={value}
          />
        </UnstableProvider>
      );
    };
  },
  {
    name: 'GradientColorSlider',
    inheritAttrs: false,
  },
);

const SingleColorSlider = defineComponent<BaseSliderProps>(
  (props) => {
    const onChange = (v: number[]) => props.onChange?.(v[0]!);
    const onChangeComplete = (v: number[]) => props.onChangeComplete?.(v[0]!);

    return () => {
      const { value, ...restProps } = props;
      return (
        <GradientColorSlider
          {...(omit(restProps, ['onChange', 'onChangeComplete']) as any)}
          onChange={onChange}
          onChangeComplete={onChangeComplete}
          value={[value]}
        />
      );
    };
  },
  {
    name: 'ColorSlider',
    inheritAttrs: false,
  },
);

export default SingleColorSlider;

import type { PropType } from 'vue';

import type { HsbaColorType, TransformOffset } from '../interface';

import { computed, defineComponent, ref } from 'vue';

import { clsx } from '@arvin-studio/kit';

import useEvent from '../../util/hooks/useEvent';
import { Color } from '../color';
import useColorDrag from '../hooks/useColorDrag';
import { calcOffset, calculateColor } from '../util';
import Gradient from './Gradient';
import Handler from './Handler';
import Palette from './Palette';
import Transform from './Transform';

export interface BaseSliderProps {
  color: Color;
  colors: { color: string; percent: number }[];
  disabled: boolean;
  max: number;
  min: number;
  onChange: (value: number) => void;
  onChangeComplete: (value: number) => void;
  prefixCls: string;
  type: HsbaColorType;
  value: number;
}

export default defineComponent({
  name: 'Slider',
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    colors: {
      type: Array as PropType<{ color: string; percent: number }[]>,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    onChange: Function,
    onChangeComplete: Function,
    type: {
      type: String as PropType<HsbaColorType>,
      required: true,
    },
    color: {
      type: Object as PropType<Color>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const sliderRef = ref();
    const transformRef = ref();
    const colorRef = ref<Color>(props.color);

    const getValue = (c: Color) => {
      return props.type === 'hue' ? c.getHue() : c.a * 100;
    };

    const onDragChange = useEvent((offsetValue: TransformOffset) => {
      const calcColor = calculateColor({
        offset: offsetValue,
        targetRef: transformRef,
        containerRef: sliderRef,
        color: props.color,
        type: props.type,
      });

      colorRef.value = calcColor;
      emit('change', getValue(calcColor));
    });

    const [offset, dragStartHandle] = useColorDrag({
      color: props.color,
      targetRef: transformRef,
      containerRef: sliderRef,
      calculate: () => calcOffset(props.color, props.type),
      onDragChange,
      onDragChangeComplete() {
        emit('changeComplete', getValue(colorRef.value as Color));
      },
      direction: 'x',
      disabledDrag: props.disabled,
    });

    const handleColor = computed(() => {
      if (props.type === 'hue') {
        const hsb = props.color.toHsb();
        hsb.s = 1;
        hsb.b = 1;
        hsb.a = 1;

        const lightColor = new Color(hsb);
        return lightColor;
      }

      return props.color;
    });

    // ========================== Render ==========================
    return () => {
      const { prefixCls, colors, type } = props;

      // ========================= Gradient =========================
      const gradientList = colors.map(
        (info) => `${info.color} ${info.percent}%`,
      );
      return (
        <div
          class={clsx(`${prefixCls}-slider`, `${prefixCls}-slider-${type}`)}
          onMousedown={dragStartHandle}
          onTouchstart={dragStartHandle}
          ref={sliderRef}
        >
          <Palette prefixCls={prefixCls}>
            <Transform ref={transformRef} x={offset.value.x} y={offset.value.y}>
              <Handler
                color={handleColor.value.toHexString()}
                prefixCls={prefixCls}
                size="small"
              />
            </Transform>
            <Gradient colors={gradientList} prefixCls={prefixCls} type={type} />
          </Palette>
        </div>
      );
    };
  },
});

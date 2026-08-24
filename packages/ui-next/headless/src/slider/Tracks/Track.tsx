import type { CSSProperties, PropType } from 'vue';

import type { OnStartMove } from '../interface';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useInjectSlider } from '../context';
import { getOffset } from '../util';

export interface TrackProps {
  end: number;
  index: number;
  onStartMove?: OnStartMove;
  prefixCls: string;
  /** Replace with origin prefix concat className */
  replaceCls?: string;
  start: number;
}

const Track = defineComponent({
  name: 'Track',
  props: {
    prefixCls: { type: String, required: true },
    replaceCls: { type: String },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    index: { type: Number, default: () => null },
    onStartMove: { type: Function as PropType<OnStartMove> },
  },
  setup(props, { attrs }) {
    const sliderContext = useInjectSlider();

    // ============================ Events ============================
    const onInternalStartMove = (e: MouseEvent | TouchEvent) => {
      if (!sliderContext.value.disabled && props.onStartMove) {
        props.onStartMove(e, -1);
      }
    };

    // ============================ Render ============================
    return () => {
      const { prefixCls, index, onStartMove, replaceCls, start, end } = props;
      const { direction, min, max, range, classNames } = sliderContext.value;

      const offsetStart = getOffset(start, min, max);
      const offsetEnd = getOffset(end, min, max);

      const trackPrefixCls = `${prefixCls}-track`;
      const className =
        replaceCls ||
        clsx(
          trackPrefixCls,
          {
            [`${trackPrefixCls}-${index + 1}`]: index !== null && range,
            [`${prefixCls}-track-draggable`]: onStartMove,
          },
          classNames.track,
        );

      const positionStyle: CSSProperties = {};
      switch (direction) {
        case 'btt': {
          positionStyle.bottom = `${offsetStart * 100}%`;
          positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`;
          break;
        }

        case 'rtl': {
          positionStyle.right = `${offsetStart * 100}%`;
          positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`;
          break;
        }

        case 'ttb': {
          positionStyle.top = `${offsetStart * 100}%`;
          positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`;
          break;
        }

        default: {
          positionStyle.left = `${offsetStart * 100}%`;
          positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`;
        }
      }
      return (
        <div
          class={className}
          onMousedown={onStartMove ? onInternalStartMove : undefined}
          style={{ ...positionStyle, ...(attrs.style as CSSProperties) }}
        />
      );
    };
  },
});

export default Track;

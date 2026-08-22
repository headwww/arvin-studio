import type { CSSProperties, PropType, VNode } from 'vue';

import { defineComponent } from 'vue';

import ResizeObserver from '../resize-observer';

export interface InnerProps {
  id?: string;
  role?: string;
}

export default defineComponent({
  name: 'Filler',
  props: {
    prefixCls: String,
    /** Virtual filler height. Should be `count * itemMinHeight` */
    height: Number,
    /** Set offset of visible items. Should be the top of start item position */
    offsetY: Number,
    offsetX: Number,
    scrollWidth: Number,
    onInnerResize: Function as PropType<() => void>,
    innerProps: Object as PropType<InnerProps>,
    rtl: Boolean,
    extra: Object as PropType<VNode>,
  },
  setup(props, { slots }) {
    return () => {
      let outerStyle: CSSProperties = {};
      let innerStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
      };

      if (props.offsetY !== undefined) {
        outerStyle = {
          height: `${props.height}px`,
          position: 'relative',
          overflow: 'hidden',
        };

        innerStyle = {
          ...innerStyle,
          transform: `translateY(${props.offsetY}px)`,
          [props.rtl ? 'marginRight' : 'marginLeft']:
            `-${props.offsetX || 0}px`,
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
        };
      }

      return (
        <div style={outerStyle}>
          <ResizeObserver
            onResize={({ offsetHeight }) => {
              if (offsetHeight && props.onInnerResize) {
                props.onInnerResize();
              }
            }}
          >
            <div
              class={
                props.prefixCls ? `${props.prefixCls}-holder-inner` : undefined
              }
              style={innerStyle}
              {...props.innerProps}
            >
              {slots.default?.()}
              {props.extra}
            </div>
          </ResizeObserver>
        </div>
      );
    };
  },
});

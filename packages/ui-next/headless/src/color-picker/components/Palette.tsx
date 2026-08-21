import type { CSSProperties } from 'vue';

import { defineComponent } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    prefixCls: String,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { prefixCls } = props;
      return (
        <div
          class={`${prefixCls}-palette`}
          style={{
            position: 'relative',
            ...(attrs.style as CSSProperties),
          }}
        >
          {slots.default?.()}
        </div>
      );
    };
  },
});

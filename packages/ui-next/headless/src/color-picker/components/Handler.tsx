import type { PropType } from 'vue';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

type HandlerSize = 'default' | 'small';

export default defineComponent({
  inheritAttrs: false,
  props: {
    size: String as PropType<HandlerSize>,
    color: String,
    prefixCls: String,
  },
  setup(props) {
    return () => {
      const { size = 'default', color, prefixCls } = props;

      return (
        <div
          class={clsx(`${prefixCls}-handler`, {
            [`${prefixCls}-handler-sm`]: size === 'small',
          })}
          style={{
            backgroundColor: color,
          }}
        />
      );
    };
  },
});

import type { CSSProperties } from 'vue';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../../util';

export interface ColorBlockProps {
  color: string;
  /** Internal usage. Only used in antd ColorPicker semantic structure only */
  innerClassName?: string;
  /** Internal usage. Only used in antd ColorPicker semantic structure only */
  innerStyle?: CSSProperties;
  prefixCls?: string;
}

export default defineComponent({
  inheritAttrs: false,
  props: ['color', 'prefixCls', 'innerClassName', 'innerStyle'],
  setup(props, { attrs, emit }) {
    const handleClickChange = (e: Event) => {
      emit('click', e);
    };

    return () => {
      const { color, prefixCls, innerClassName, innerStyle } = props;

      const { className, style } = getAttrStyleAndClass(attrs);
      const colorBlockCls = `${prefixCls}-color-block`;

      return (
        <div
          class={clsx(colorBlockCls, className)}
          onClick={handleClickChange}
          style={style}
        >
          <div
            class={clsx(`${colorBlockCls}-inner`, innerClassName)}
            style={{
              background: color,
              ...innerStyle,
            }}
          />
        </div>
      );
    };
  },
});

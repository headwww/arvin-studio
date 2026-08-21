import type { KeyboardEventHandler, MouseEventHandler } from '../util';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass, pickAttrs } from '../util';
import { useRefContext } from './context';

export interface DrawerPanelEvents {
  onClick?: MouseEventHandler;
  onKeyDown?: KeyboardEventHandler;
  onKeyUp?: KeyboardEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  onMouseOver?: MouseEventHandler;
}

export interface DrawerPanelProps extends DrawerPanelEvents {
  id?: string;
  prefixCls: string;
}

export default defineComponent<DrawerPanelProps>({
  name: 'DrawerPanel',
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const { setPanel } = useRefContext();
    const setRef = (el: any) => {
      setPanel?.(el);
    };
    return () => {
      const { prefixCls, id } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const attrsProps = {
        onMouseenter: props.onMouseEnter,
        onMouseover: props.onMouseOver,
        onMouseleave: props.onMouseLeave,
        onClick: props.onClick,
        onKeydown: props.onKeyDown,
        onKeyup: props.onKeyUp,
      };

      return (
        <div
          class={clsx(`${prefixCls}-section`, className)}
          role="dialog"
          style={style}
          {...pickAttrs(restAttrs, { aria: true })}
          {...attrsProps}
          aria-modal="true"
          id={id}
          ref={setRef}
        >
          {slots.default?.()}
        </div>
      );
    };
  },
});

import type { CSSMotionProps } from '../../util';

import { defineComponent, Transition } from 'vue';

import { getTransitionProps } from '../../util';

export interface MaskProps {
  mask?: boolean;
  mobile?: boolean;
  // Motion
  motion?: CSSMotionProps;
  open?: boolean;

  prefixCls: string;

  zIndex?: number;
}

const Mask = defineComponent<MaskProps>(
  (props, { attrs }) => {
    return () => {
      const { prefixCls, open, zIndex, mask, motion, mobile } = props;
      if (!mask) {
        return null;
      }
      const transitionProps = getTransitionProps(motion?.name, motion);
      return (
        <Transition {...transitionProps}>
          {open ? (
            <div
              class={[
                `${prefixCls}-mask`,
                mobile && `${prefixCls}-mask-mobile`,
                (attrs as any).class,
              ]}
              style={{ zIndex }}
            />
          ) : null}
        </Transition>
      );
    };
  },
  {
    name: 'PopupMask',
    inheritAttrs: false,
  },
);
export default Mask;

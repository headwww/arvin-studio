import type { CSSProperties, HTMLAttributes } from 'vue';

import { defineComponent, Transition } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getTransitionProps } from '../../util';

export interface MaskProps {
  className?: string;
  maskProps?: HTMLAttributes;
  motionName?: string;
  prefixCls: string;
  style?: CSSProperties;
  visible: boolean;
}

const Mask = defineComponent<MaskProps>(
  (props) => {
    return () => {
      const { maskProps, prefixCls, className, style, visible, motionName } =
        props;
      return (
        <Transition {...getTransitionProps(motionName!)} key="mask">
          {visible && (
            <div
              class={clsx(`${prefixCls}-mask`, className)}
              style={[style]}
              {...maskProps}
            />
          )}
        </Transition>
      );
    };
  },
  {
    name: 'Mask',
  },
);

export default Mask;

import { defineComponent, isVNode, Transition } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

import { getTransitionProps } from '../../_util/motion';
import { useBaseConfig } from '../../config-provider/context';

const MotionContent = defineComponent((_, { slots }) => {
  const { getPrefixCls } = useBaseConfig();
  const rootPrefixCls = getPrefixCls();
  const visible = true;
  return () => {
    const children = filterEmpty(slots?.default?.() ?? [])?.[0];
    if (!isVNode(children)) {
      return slots?.default?.();
    }

    const transitionProps = getTransitionProps(`${rootPrefixCls}-fade`);
    return (
      <Transition appear={true} {...transitionProps}>
        {visible ? children : null}
      </Transition>
    );
  };
});

export default MotionContent;

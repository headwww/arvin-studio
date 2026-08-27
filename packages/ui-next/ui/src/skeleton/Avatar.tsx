import type { SkeletonElementProps } from './Element';

import { defineComponent, toRef } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import Element from './Element';
import useStyle from './style';

export interface SkeletonAvatarProps extends Omit<
  SkeletonElementProps,
  'shape'
> {
  shape?: 'circle' | 'square';
}

const defaults = {
  shape: 'circle',
} as any;

const SkeletonAvatar = defineComponent<SkeletonAvatarProps>(
  (props = defaults, { attrs }) => {
    const {
      prefixCls,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('skeleton', props);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const mergedSize = useSize<SkeletonAvatarProps['size']>(
      toRef(props, 'size'),
    );

    return () => {
      const { active, rootClass, shape, classes, styles } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const cls = clsx(
        prefixCls.value,
        `${prefixCls.value}-element`,
        {
          [`${prefixCls.value}-active`]: active,
        },
        classes?.root,
        rootClass,
        hashId.value,
        cssVarCls.value,
        contextClassName.value,
        className,
      );
      return (
        <div
          {...restAttrs}
          class={cls}
          style={[styles?.root, contextStyle.value]}
        >
          <Element
            class={classes?.content}
            prefixCls={`${prefixCls.value}-avatar`}
            shape={shape}
            size={mergedSize.value}
            style={[styles?.content, style]}
          />
        </div>
      );
    };
  },
  {
    name: 'AsSkeletonAvatar',
    inheritAttrs: false,
  },
);

export default SkeletonAvatar;

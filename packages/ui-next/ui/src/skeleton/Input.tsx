import type { SizeType } from '../config-provider/size-context';
import type { SkeletonElementProps } from './Element';

import { defineComponent, toRef } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import Element from './Element';
import useStyle from './style';

export interface SkeletonInputProps extends Omit<
  SkeletonElementProps,
  'shape' | 'size'
> {
  block?: boolean;
  /**
   * Note: `default` is deprecated and will be removed in v7, please use `medium` instead.
   */
  size?: 'default' | SizeType;
}

const defaults = {} as any;

const SkeletonInput = defineComponent<SkeletonInputProps>(
  (props = defaults, { attrs }) => {
    const {
      prefixCls,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('skeleton', props);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const mergedSize = useSize<SkeletonInputProps['size']>(
      toRef(props, 'size'),
    );

    return () => {
      const { active, rootClass, block, classes, styles } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const cls = clsx(
        prefixCls.value,
        `${prefixCls.value}-element`,
        {
          [`${prefixCls.value}-active`]: active,
          [`${prefixCls.value}-block`]: block,
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
            prefixCls={`${prefixCls.value}-input`}
            size={mergedSize.value}
            style={[styles?.content, style]}
          />
        </div>
      );
    };
  },
  {
    name: 'AsSkeletonInput',
    inheritAttrs: false,
  },
);

export default SkeletonInput;

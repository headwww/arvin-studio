import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../_util';
import type { SkeletonElementProps } from './Element';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { useComponentBaseConfig } from '../config-provider/context';
import useStyle from './style';

export interface SkeletonNodeProps extends Omit<
  SkeletonElementProps,
  'shape' | 'size'
> {
  fullSize?: boolean;
  internalClassName?: string;
}

export interface SkeletonNodeSlots {
  default?: () => any;
}

const SkeletonNode = defineComponent<
  SkeletonNodeProps,
  EmptyEmit,
  string,
  SlotsType<SkeletonNodeSlots>
>(
  (props, { attrs, slots }) => {
    const {
      prefixCls,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('skeleton', props);
    const [hashId, cssVarCls] = useStyle(prefixCls);

    return () => {
      const { active, rootClass, internalClassName, classes, styles } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);
      const cls = clsx(
        prefixCls.value,
        `${prefixCls.value}-element`,
        {
          [`${prefixCls.value}-active`]: active,
        },
        hashId.value,
        classes?.root,
        rootClass,
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
          <div
            class={clsx(
              internalClassName || `${prefixCls.value}-node`,
              classes?.content,
            )}
            style={[styles?.content, style]}
          >
            {slots.default?.()}
          </div>
        </div>
      );
    };
  },
  {
    name: 'AsSkeletonNode',
    inheritAttrs: false,
  },
);

export default SkeletonNode;

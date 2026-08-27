import type { CSSProperties } from 'vue';

import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks/useMergeSemantic';

export interface ElementSemanticClassNames {
  content?: string;
  root?: string;
}

export interface ElementSemanticStyles {
  content?: CSSProperties;
  root?: CSSProperties;
}

export interface SkeletonElementProps extends ComponentBaseProps {
  active?: boolean;
  classes?: ElementSemanticClassNames;
  shape?: 'circle' | 'default' | 'round' | 'square';
  /**
   * Note: `default` is deprecated and will be removed in v7, please use `medium` instead.
   */
  size?: 'default' | number | SizeType;
  styles?: ElementSemanticStyles;
}

const Element = defineComponent<SkeletonElementProps>(
  (props, { attrs }) => {
    return () => {
      const { prefixCls, size, shape, classes, styles } = props;
      const { className, style } = getAttrStyleAndClass(attrs);
      const sizeCls = clsx({
        [`${prefixCls}-lg`]: size === 'large',
        [`${prefixCls}-sm`]: size === 'small',
      });

      const shapeCls = clsx({
        [`${prefixCls}-circle`]: shape === 'circle',
        [`${prefixCls}-square`]: shape === 'square',
        [`${prefixCls}-round`]: shape === 'round',
      });
      const sizeStyle =
        typeof size === 'number'
          ? {
              width: size,
              height: size,
              lineHeight: `${size}px`,
            }
          : {};
      return (
        <span
          class={clsx(
            prefixCls,
            sizeCls,
            shapeCls,
            classes?.root,
            classes?.content,
            className,
          )}
          style={[sizeStyle, styles?.root, styles?.content, style]}
        />
      );
    };
  },
  { inheritAttrs: false },
);

export default Element;

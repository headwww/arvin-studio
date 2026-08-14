import type { CSSProperties } from 'vue';
import { clsx } from '@arvin-studio/kit';
import { filterEmpty } from '@arvin-studio/headless';
import { createVNode, defineComponent, shallowRef } from 'vue';
import { svgBaseProps, useInsertStyles } from '../utils.ts';
import { useIconContext } from './Context.tsx';

export interface IconBaseProps {
  spin?: boolean;
  rotate?: number;
}

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill?: string;
  viewBox?: string;
}

export interface IconComponentProps extends IconBaseProps {
  viewBox?: string;
  component?: any;
  ariaLabel?: any;
  tabIndex?: number;
  onClick?: ((e: MouseEvent) => void) | Array<(e: MouseEvent) => void>;
}

const Icon = defineComponent<IconComponentProps>(
  (props, { slots, attrs }) => {
    const iconRef = shallowRef();
    useInsertStyles(iconRef);
    const iconContext = useIconContext();
    return () => {
      const { rootClass, prefixCls = 'asicon' } = iconContext.value;
      const { spin, component, rotate, viewBox, tabIndex, onClick } = props;
      const classString = clsx(rootClass, prefixCls, {
        [`${prefixCls}-spin`]: !!spin && !!component,
      });

      const svgClassString = clsx({
        [`${prefixCls}-spin`]: !!spin,
      });
      const svgStyle: CSSProperties | undefined = rotate
        ? {
            msTransform: `rotate(${rotate}deg)`,
            transform: `rotate(${rotate}deg)`,
          }
        : undefined;

      const innerSvgProps: any = {
        ...svgBaseProps,
        class: svgClassString,
        style: svgStyle,
        viewBox,
      };
      if (!viewBox) {
        delete innerSvgProps.viewBox;
      }
      const children = filterEmpty(slots?.default?.());
      const comp = filterEmpty(slots?.component?.(innerSvgProps));

      const renderInnerNode = () => {
        if (slots?.component) {
          return slots.component();
        }
        if (component) {
          return createVNode(component, innerSvgProps, slots);
        }
        if (children.length) {
          return (
            <svg {...innerSvgProps} viewBox={viewBox}>
              {slots?.default?.()}
            </svg>
          );
        }
        return null;
      };

      let iconTabIndex = tabIndex;
      if (iconTabIndex === undefined && onClick) {
        iconTabIndex = -1;
      }
      return (
        <span
          role="img"
          {...attrs}
          tabindex={iconTabIndex}
          onClick={(e) => {
            if (Array.isArray(onClick)) {
              onClick.forEach((fn) => fn?.(e));
            } else {
              onClick?.(e);
            }
          }}
          class={classString}
        >
          {renderInnerNode()}
        </span>
      );
    };
  },
  {
    name: 'AsIcon',
    inheritAttrs: false,
  },
);

export default Icon;

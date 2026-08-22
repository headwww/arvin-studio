import type { CSSProperties } from 'vue';

import type { RenderNode } from './interface.ts';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface TransBtnProps {
  className: string;
  customizeIcon?: RenderNode;
  customizeIconProps?: any;
  onClick?: (event: MouseEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  style?: CSSProperties;
}

/**
 * Small wrapper for Select icons (clear/arrow/etc.).
 * Prevents default mousedown to avoid blurring or caret moves, and
 * renders a custom icon or a fallback icon span.
 *
 * DOM structure:
 * <span className={className} ...>
 *   { icon || <span className={`${className}-icon`}>{children}</span> }
 * </span>
 */

const TransBtn = defineComponent<TransBtnProps>(
  (props, { slots }) => {
    return () => {
      const {
        className,
        style,
        customizeIcon,
        customizeIconProps,
        onMouseDown,
        onClick,
      } = props;

      const icon =
        typeof customizeIcon === 'function'
          ? (customizeIcon as any)(customizeIconProps)
          : customizeIcon;
      return (
        <span
          aria-hidden
          class={className}
          onClick={onClick}
          onMousedown={(event) => {
            event.preventDefault();
            onMouseDown?.(event);
          }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', ...style }}
          unselectable="on"
        >
          {icon === undefined ? (
            <span
              class={clsx(className.split(/\s+/).map((cls) => `${cls}-icon`))}
            >
              {slots?.default?.()}
            </span>
          ) : (
            icon
          )}
        </span>
      );
    };
  },
  {
    name: 'TransBtn',
    inheritAttrs: false,
  },
);

export default TransBtn;

import type { CSSProperties } from 'vue';

import type { TooltipProps } from './Tooltip';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

export interface ContentProps {
  className?: string;
  classNames?: TooltipProps['classNames'];
  id?: string;
  prefixCls?: string;
  style?: CSSProperties;
  styles?: TooltipProps['styles'];
}

const Popup = defineComponent<ContentProps>(
  (props, { slots }) => {
    return () => {
      const { prefixCls, id, classNames, styles, className, style } = props;
      const children = slots?.default?.();
      return (
        <div
          class={clsx(
            `${prefixCls}-container`,
            classNames?.container,
            className,
          )}
          id={id}
          role="tooltip"
          style={{ ...styles?.container, ...style }}
        >
          {children}
        </div>
      );
    };
  },
  { name: 'Popup' },
);

export default Popup;

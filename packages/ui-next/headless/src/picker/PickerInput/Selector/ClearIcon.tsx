import type { CSSProperties } from 'vue';

import type { VueNode } from '../../../util';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { usePickerContext } from '../context';

export interface ClearIconProps {
  icon?: VueNode;
  onClear: VoidFunction;
}

/**
 * Rendered as a real `<button>` rather than a `<span role="button">` so it is
 * focusable and activatable by keyboard, and announced with a label.
 */
const ClearIcon = defineComponent<ClearIconProps>(
  (props, { attrs }) => {
    const ctx = usePickerContext();

    return () => {
      const { prefixCls, classNames, styles, locale } = ctx.value;

      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs as any;
      const mergedAttrStyle =
        attrStyle && typeof attrStyle === 'object'
          ? (attrStyle as CSSProperties)
          : {};

      return (
        <button
          {...restAttrs}
          aria-label={locale.clear}
          class={clsx(`${prefixCls}-clear`, classNames.suffix, attrClass)}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            props.onClear();
          }}
          onMousedown={(e: MouseEvent) => {
            e.preventDefault();
          }}
          style={{ ...styles.suffix, ...mergedAttrStyle }}
          type="button"
        >
          {props.icon}
        </button>
      );
    };
  },
  {
    name: 'ClearIcon',
    inheritAttrs: false,
  },
);

export default ClearIcon;

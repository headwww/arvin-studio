import type { CollapsePanelProps } from './interface';

import { defineComponent, ref, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

const PanelContent = defineComponent<CollapsePanelProps>({
  name: 'PanelContent',
  inheritAttrs: false,
  setup(props, { slots }) {
    const rendered = ref(props.isActive || props.forceRender);

    watch(
      () => [props.isActive, props.forceRender],
      () => {
        if (props.isActive || props.forceRender) {
          rendered.value = true;
        }
      },
    );

    return () => {
      if (!rendered.value) {
        return null;
      }

      const {
        prefixCls,
        isActive,
        style,
        role,
        class: className,
        classNames: customizeClassNames,
        styles,
      } = props;

      return (
        <div
          class={clsx(
            `${prefixCls}-panel`,
            {
              [`${prefixCls}-panel-active`]: isActive,
              [`${prefixCls}-panel-inactive`]: !isActive,
            },
            className,
          )}
          role={role}
          style={style as any}
        >
          <div
            class={clsx(`${prefixCls}-body`, customizeClassNames?.body)}
            style={styles?.body}
          >
            {slots.default?.()}
          </div>
        </div>
      );
    };
  },
});

export default PanelContent;

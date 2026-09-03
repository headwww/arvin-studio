import type { SlotsType } from 'vue';

import type { VueNode } from '../_util';
import type { ComponentBaseProps } from '../config-provider/context';

import { computed, defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { pureAttrs } from '../_util/hooks';
import { getSlotPropsFnRun, toPropsRefs } from '../_util/tools';
import { useComponentBaseConfig, useConfig } from '../config-provider/context';
import { useDisabledContext } from '../config-provider/disabled-context';
import useStyle from './style';

export interface CheckableTagProps /* @vue-ignore */
  extends CheckableTagEmitsProps, ComponentBaseProps {
  /**
   * It is an absolute controlled component and has no uncontrolled mode.
   *
   * .zh-cn 该组件为完全受控组件，不支持非受控用法。
   */
  checked: boolean;
  disabled?: boolean;
  /**
   * @since 5.27.0
   */
  icon?: VueNode;
}

export interface CheckableTagEmits {
  change: (checked: boolean) => void;
  click: (e: MouseEvent) => void;
  keydown: (e: KeyboardEvent) => void;
  'update:checked': (checked: boolean) => void;
}
export interface CheckableTagEmitsProps {
  onChange?: CheckableTagEmits['change'];
  onClick?: CheckableTagEmits['click'];
  onKeydown?: CheckableTagEmits['keydown'];
  'onUpdate:checked'?: CheckableTagEmits['update:checked'];
}

export interface CheckableTagSlots {
  default: () => any;
  icon: () => any;
}

const CheckableTag = defineComponent<
  CheckableTagProps,
  CheckableTagEmits,
  string,
  SlotsType<CheckableTagSlots>
>(
  (props, { slots, emit, attrs }) => {
    const configCtx = useConfig();
    const { prefixCls } = useComponentBaseConfig('tag', props);
    const { disabled: customDisabled } = toPropsRefs(props, 'disabled');

    const disabled = useDisabledContext();
    const mergedDisabled = computed(
      () => customDisabled.value ?? disabled.value,
    );
    const handleClick = (e: MouseEvent) => {
      if (mergedDisabled.value) {
        return;
      }
      const checked = !props.checked;
      emit('change', checked);
      emit('update:checked', checked);
      emit('click', e);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      emit('keydown', e);
      if (e.defaultPrevented || mergedDisabled.value) {
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        const checked = !props.checked;
        emit('change', checked);
        emit('update:checked', checked);
      }
    };
    const [hashId, cssVarCls] = useStyle(prefixCls);

    return () => {
      const tag = configCtx.value.tag;
      const { checked } = props;
      const cls = clsx(
        prefixCls.value,
        `${prefixCls.value}-checkable`,
        {
          [`${prefixCls.value}-checkable-checked`]: checked,
          [`${prefixCls.value}-checkable-disabled`]: mergedDisabled.value,
        },
        tag?.class,
        (attrs as any).class,
        hashId.value,
        cssVarCls.value,
      );
      const icon = getSlotPropsFnRun(slots, props, 'icon');

      return (
        <span
          {...pureAttrs(attrs)}
          aria-checked={checked}
          aria-disabled={mergedDisabled.value || undefined}
          class={cls}
          onClick={handleClick}
          onKeydown={handleKeyDown}
          role="checkbox"
          style={[tag?.style, (attrs as any).style]}
          tabindex={mergedDisabled.value ? -1 : 0}
        >
          {icon}
          <span>{slots?.default?.()}</span>
        </span>
      );
    };
  },
  {
    name: 'AsCheckableTag',
    inheritAttrs: false,
  },
);

export default CheckableTag;

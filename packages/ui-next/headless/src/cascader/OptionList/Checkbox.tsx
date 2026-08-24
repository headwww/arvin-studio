import type { VueNode } from '../../util';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useCascaderContext } from '../context';

export interface CheckboxProps {
  checked?: boolean;
  children?: VueNode;
  disableCheckbox?: boolean;
  disabled?: boolean;
  halfChecked?: boolean;
  onClick?: (event: MouseEvent) => void;
  prefixCls: string;
}

const checkboxDefaults: CheckboxProps = {
  prefixCls: '',
  checked: false,
  halfChecked: false,
  disabled: false,
  disableCheckbox: false,
};

const Checkbox = defineComponent<CheckboxProps>((props = checkboxDefaults) => {
  const context = useCascaderContext();

  return () => {
    const checkable = context.value?.checkable;
    const customCheckbox = typeof checkable === 'boolean' ? null : checkable;

    return (
      <span
        class={clsx(`${props.prefixCls}`, {
          [`${props.prefixCls}-checked`]: props.checked,
          [`${props.prefixCls}-indeterminate`]:
            !props.checked && props.halfChecked,
          [`${props.prefixCls}-disabled`]:
            props.disabled || props.disableCheckbox,
        })}
        onClick={props.onClick}
      >
        {customCheckbox}
      </span>
    );
  };
});

export default Checkbox;

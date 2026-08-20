import type { SlotsType } from 'vue';

import type {
  AbstractCheckboxProps,
  CheckboxEmits,
  CheckboxSlots,
} from '../checkbox/Checkbox';

import { defineComponent, ref } from 'vue';

import { useComponentBaseConfig } from '../config-provider/context';
import { useRadioOptionTypeContextProvider } from './context';
import Radio from './radio';

export type RadioButtonProps = AbstractCheckboxProps;

export interface RadioButtonEmitsProps {
  onBlur?: CheckboxEmits['blur'];
  onChange?: CheckboxEmits['change'];
  onClick?: CheckboxEmits['click'];
  onFocus?: CheckboxEmits['focus'];
  onKeydown?: CheckboxEmits['keydown'];
  onKeypress?: CheckboxEmits['keypress'];
  onMouseenter?: CheckboxEmits['mouseenter'];
  onMouseleave?: CheckboxEmits['mouseleave'];
  'onUpdate:checked'?: CheckboxEmits['update:checked'];
  'onUpdate:value'?: CheckboxEmits['update:value'];
}

export interface InternalRadioButtonProps /* @vue-ignore */
  extends RadioButtonEmitsProps, RadioButtonProps {}

const RadioButton = defineComponent<
  InternalRadioButtonProps,
  CheckboxEmits,
  string,
  SlotsType<CheckboxSlots>
>(
  (props, { slots, attrs }) => {
    const { prefixCls } = useComponentBaseConfig('radio', props);
    useRadioOptionTypeContextProvider(ref('button'));
    return () => {
      return (
        <Radio
          prefixCls={prefixCls.value}
          {...attrs}
          {...props}
          v-slots={slots}
        />
      );
    };
  },
  {
    name: 'AsRadioButton',
    inheritAttrs: false,
  },
);

export default RadioButton;

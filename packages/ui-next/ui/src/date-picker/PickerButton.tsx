import type { ButtonProps } from '../button';

import { defineComponent } from 'vue';

import Button from '../button';

const PickerButton = defineComponent<ButtonProps>(
  (props, { slots }) => {
    return () => {
      const { size = 'small', type = 'primary', ...restProps } = props;
      return (
        <Button size={size} type={type} {...restProps}>
          {slots.default?.()}
        </Button>
      );
    };
  },
  {
    name: 'AsPickerButton',
  },
);

export default PickerButton;

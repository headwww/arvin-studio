import type { VueNode } from '../../_util';
import type { ModalEmits, ModalProps } from '../interface';

import { defineComponent } from 'vue';

import Button from '../../button';
import { useModalContext } from '../context';

export interface NormalCancelBtnProps extends Pick<
  ModalProps,
  'cancelButtonProps'
> {
  cancelTextLocale?: VueNode;
  onCancel?: ModalEmits['cancel'];
}

const NormalCancelBtn = defineComponent(
  () => {
    const context = useModalContext();
    return () => {
      const { onCancel, cancelTextLocale, cancelButtonProps } = context.value;
      return (
        <Button onClick={onCancel} {...cancelButtonProps}>
          {cancelTextLocale}
        </Button>
      );
    };
  },
  {
    name: 'NormalCancelBtn',
    inheritAttrs: false,
  },
);

export default NormalCancelBtn;

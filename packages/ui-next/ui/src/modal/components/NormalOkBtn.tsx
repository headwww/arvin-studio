import type { VueNode } from '../../_util';
import type { ModalEmits, ModalProps } from '../interface';

import { defineComponent } from 'vue';

import { getSlotPropsFnRun } from '../../_util/tools';
import Button from '../../button';
import { useModalContext } from '../context';

export interface NormalOkBtnProps extends Pick<
  ModalProps,
  'confirmLoading' | 'okButtonProps' | 'okType'
> {
  okTextLocale?: VueNode;
  onOk?: ModalEmits['ok'];
}

const NormalOkBtn = defineComponent(
  () => {
    const context = useModalContext();
    return () => {
      const { okType, confirmLoading, okButtonProps, onOk } = context.value;
      const okTextLocale = getSlotPropsFnRun(
        {},
        {
          okTextLocale: context.value.okTextLocale,
        },
        'okTextLocale',
      );
      return (
        <Button
          loading={confirmLoading}
          onClick={onOk}
          type={okType}
          {...okButtonProps}
        >
          {okTextLocale}
        </Button>
      );
    };
  },
  {
    name: 'NormalOkBtn',
    inheritAttrs: false,
  },
);

export default NormalOkBtn;

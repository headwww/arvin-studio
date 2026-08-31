import type { VueNode } from '../../_util';
import type { ConfirmDialogProps } from '../ConfirmDialog';

import { defineComponent } from 'vue';

import ActionButton from '../../_util/ActionButton';
import { getSlotPropsFnRun } from '../../_util/tools';
import { useModalContext } from '../context';

export interface ConfirmOkBtnProps extends Pick<
  ConfirmDialogProps,
  | 'close'
  | 'isSilent'
  | 'okButtonProps'
  | 'okType'
  | 'onConfirm'
  | 'onOk'
  | 'rootPrefixCls'
> {
  autoFocusButton?: 'cancel' | 'ok' | false | null;
  okTextLocale?: VueNode;
  onClose?: () => void;
}

const ConfirmOkBtn = defineComponent(
  () => {
    const context = useModalContext();
    return () => {
      const {
        autoFocusButton,
        close,
        isSilent,
        okButtonProps,
        rootPrefixCls,
        okType,
        onConfirm,
        onOk,
        onClose,
      } = context.value;
      const okTextLocale = getSlotPropsFnRun({}, context.value, 'okTextLocale');
      return (
        <ActionButton
          actionFn={onOk}
          autoFocus={autoFocusButton === 'ok'}
          buttonProps={okButtonProps}
          close={(...args: any[]) => {
            close?.(...args);
            onConfirm?.(true);
            onClose?.();
          }}
          isSilent={isSilent}
          prefixCls={`${rootPrefixCls}-btn`}
          type={okType || 'primary'}
        >
          {okTextLocale}
        </ActionButton>
      );
    };
  },
  {
    name: 'ConfirmOkBtn',
    inheritAttrs: false,
  },
);

export default ConfirmOkBtn;

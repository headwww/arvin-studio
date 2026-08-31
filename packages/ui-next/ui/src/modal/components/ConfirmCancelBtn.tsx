import type { VueNode } from '../../_util';
import type { ConfirmDialogProps } from '../ConfirmDialog';

import { defineComponent } from 'vue';

import ActionButton from '../../_util/ActionButton';
import { getSlotPropsFnRun } from '../../_util/tools';
import { useModalContext } from '../context';

export interface ConfirmCancelBtnProps extends Pick<
  ConfirmDialogProps,
  | 'cancelButtonProps'
  | 'close'
  | 'isSilent'
  | 'onCancel'
  | 'onConfirm'
  | 'rootPrefixCls'
> {
  autoFocusButton?: 'cancel' | 'ok' | false | null;
  cancelTextLocale?: VueNode;
  mergedOkCancel?: boolean;
  onClose?: () => void;
}

const ConfirmCancelBtn = defineComponent(
  () => {
    const context = useModalContext();
    return () => {
      const {
        autoFocusButton,
        cancelButtonProps,
        isSilent,
        mergedOkCancel,
        rootPrefixCls,
        close,
        onCancel,
        onConfirm,
        onClose,
      } = context.value;

      const cancelTextLocale = getSlotPropsFnRun(
        {},
        context.value,
        'cancelTextLocale',
      );
      return mergedOkCancel ? (
        <ActionButton
          actionFn={onCancel}
          autoFocus={autoFocusButton === 'cancel'}
          buttonProps={cancelButtonProps}
          close={(...args: any[]) => {
            close?.(...args);
            onConfirm?.(false);
            onClose?.();
          }}
          isSilent={isSilent}
          prefixCls={`${rootPrefixCls}-btn`}
        >
          {cancelTextLocale}
        </ActionButton>
      ) : null;
    };
  },
  {
    name: 'ConfirmCancelBtn',
    inheritAttrs: false,
  },
);

export default ConfirmCancelBtn;

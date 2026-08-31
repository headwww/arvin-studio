import type { ModalEmits, ModalProps } from './interface';

import { computed, defineComponent } from 'vue';

import { CloseOutlined } from '@arvin-studio/icons';

import { getSlotPropsFnRun } from '../_util/tools';
import { DisabledContextProvider } from '../config-provider/disabled-context';
import useLocale from '../locale/useLocale';
import NormalCancelBtn from './components/NormalCancelBtn';
import NormalOkBtn from './components/NormalOkBtn';
import { useModalProvider } from './context';
import { getConfirmLocale } from './locale';

export function renderCloseIcon(prefixCls: string, closeIcon?: any) {
  closeIcon = getSlotPropsFnRun({}, { closeIcon }, 'closeIcon');

  return (
    <span class={`${prefixCls}-close-x`}>
      {closeIcon || <CloseOutlined class={`${prefixCls}-close-icon`} />}
    </span>
  );
}

export interface FooterProps extends Pick<
  ModalProps,
  | 'cancelButtonProps'
  | 'cancelText'
  | 'confirmLoading'
  | 'footer'
  | 'okButtonProps'
  | 'okText'
  | 'okType'
> {
  onCancel?: ModalEmits['cancel']; // aligned with ModalEmits to support MouseEvent | KeyboardEvent
  onOk?: ModalEmits['ok'];
}

export const Footer = defineComponent<FooterProps>(
  (props) => {
    const [locale] = useLocale('Modal', getConfirmLocale());

    const okTextLocale = computed(() => {
      return props.okText ?? locale?.value?.okText;
    });
    const cancelTextLocale = computed(() => {
      return props.cancelText ?? locale?.value?.cancelText;
    });

    const memoizedValue = computed(() => ({
      confirmLoading: props.confirmLoading,
      okButtonProps: props.okButtonProps,
      cancelButtonProps: props.cancelButtonProps,
      okTextLocale: okTextLocale.value,
      cancelTextLocale: cancelTextLocale.value,
      okType: props.okType ?? 'primary',
      onOk: props.onOk,
      onCancel: props.onCancel,
    }));

    useModalProvider(memoizedValue as any);

    return () => {
      const { footer } = props;
      const defaultFooter = (
        <>
          <NormalCancelBtn />
          <NormalOkBtn />
        </>
      );
      let footerNode: any;
      footerNode =
        typeof footer === 'function'
          ? footer({
              originNode: defaultFooter,
              extra: { OkBtn: NormalOkBtn, CancelBtn: NormalCancelBtn },
            })
          : footer;
      if (footerNode === undefined) {
        footerNode = defaultFooter;
      }

      return (
        <DisabledContextProvider disabled={false}>
          {footerNode}
        </DisabledContextProvider>
      );
    };
  },
  {
    name: 'ModalFooter',
    inheritAttrs: false,
  },
);

import type { SlotsType } from 'vue';

import type { EmptyEmit } from '../../_util';
import type { ConfigUpdate } from '../confirm';
import type { ModalFuncProps } from '../interface';

import { computed, defineComponent, shallowRef } from 'vue';

import { useBaseConfig } from '../../config-provider/context';
import defaultLocale from '../../locale/en_US';
import useLocale from '../../locale/useLocale';
import ConfirmDialog from '../ConfirmDialog';

export interface HookModalProps {
  afterClose: () => void;
  config: ModalFuncProps;
  isSilent?: () => boolean;
  onConfirm?: (confirmed: boolean) => void;
}

const HookModal = defineComponent<
  HookModalProps,
  EmptyEmit,
  string,
  SlotsType<{ default?: () => any }>
>(
  (props, { expose }) => {
    const open = shallowRef(true);
    const innerConfig = shallowRef(props.config);
    const { direction, getPrefixCls } = useBaseConfig('modal');

    const prefixCls = computed(
      () =>
        innerConfig.value.prefixCls ??
        getPrefixCls('modal', innerConfig.value.prefixCls),
    );
    const rootPrefixCls = computed(() => getPrefixCls());

    const afterClose = () => {
      props.afterClose?.();
      innerConfig.value.afterClose?.();
    };

    const close = (...args: any[]) => {
      open.value = false;
      const triggerCancel = args.some((param) => param?.triggerCancel);
      if (triggerCancel) {
        innerConfig.value.onCancel?.(() => {}, ...args.slice(1));
      }
    };

    expose({
      destroy: close,
      update: (configUpdate: ConfigUpdate) => {
        innerConfig.value =
          typeof configUpdate === 'function'
            ? (configUpdate as any)(innerConfig.value)
            : { ...innerConfig.value, ...configUpdate };
      },
    });

    const mergedOkCancel = computed(
      () => innerConfig.value.okCancel ?? innerConfig.value.type === 'confirm',
    );
    const [contextLocale] = useLocale('Modal', defaultLocale.Modal);

    return () => {
      return (
        <ConfirmDialog
          {...innerConfig.value}
          afterClose={afterClose}
          cancelText={
            innerConfig.value.cancelText ?? contextLocale?.value?.cancelText
          }
          close={close}
          direction={innerConfig.value.direction ?? direction.value}
          isSilent={props.isSilent}
          okText={
            innerConfig.value.okText ??
            (mergedOkCancel.value
              ? contextLocale?.value?.okText
              : contextLocale?.value?.justOkText)
          }
          onConfirm={props.onConfirm}
          open={open.value}
          prefixCls={prefixCls.value}
          rootPrefixCls={rootPrefixCls.value}
        />
      );
    };
  },
  {
    name: 'HookModal',
    inheritAttrs: false,
  },
);

export default HookModal;

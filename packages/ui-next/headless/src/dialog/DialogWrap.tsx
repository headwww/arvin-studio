import type { PortalProps } from '../portal';
import type { IDialogPropTypes } from './IDialogPropTypes';

import { defineComponent, shallowRef, watch } from 'vue';

import Portal from '../portal';
import { useRefProvide } from './context';
import Dialog from './Dialog';

const defaults = {
  getContainer: undefined,
  closeIcon: undefined,
  prefixCls: 'headless-dialog',
  // visible: true,
  keyboard: true,
  focusTriggerAfterClose: true,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnHidden: false,
  forceRender: false,
} as IDialogPropTypes;
const DialogWrap = defineComponent<IDialogPropTypes>(
  (props = defaults, { slots }) => {
    const animatedVisible = shallowRef(false);
    useRefProvide(props);
    const onEsc: PortalProps['onEsc'] = ({ top, event }) => {
      const { keyboard = true } = props;
      if (top && keyboard) {
        event.stopPropagation();
        props?.onClose?.(event);
      }
    };
    watch(
      () => props.visible,
      () => {
        if (props.visible) {
          animatedVisible.value = true;
        }
      },
      {
        immediate: true,
      },
    );
    return () => {
      const {
        visible,
        getContainer,
        forceRender,
        destroyOnHidden = false,
        scrollLock = true,
        afterClose,
      } = props;
      const { scrollLock: _, ...restProps } = props;

      // Destroy on close will remove wrapped div
      if (!forceRender && destroyOnHidden && !animatedVisible.value) {
        return null;
      }
      return (
        <Portal
          autoDestroy={false}
          autoLock={scrollLock && (visible || animatedVisible.value)}
          getContainer={getContainer}
          onEsc={onEsc}
          open={visible || forceRender || animatedVisible.value}
        >
          <Dialog
            {...restProps}
            afterClose={() => {
              const closableObj =
                props.closable && typeof props.closable === 'object'
                  ? props.closable
                  : {};
              closableObj.afterClose?.();
              afterClose?.();
              animatedVisible.value = false;
            }}
            destroyOnHidden={destroyOnHidden}
            v-slots={slots}
          />
        </Portal>
      );
    };
  },
  {
    name: 'Dialog',
  },
);

export default DialogWrap;

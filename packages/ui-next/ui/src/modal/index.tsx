import type { App } from 'vue';

import type { InternalModalProps } from './Modal';
import type useModal from './useModal';

import confirm, {
  modalGlobalConfig,
  withError,
  withInfo,
  withSuccess,
  withWarn,
} from './confirm';
import destroyFns from './destroyFns';
import ModalComponent from './Modal';
import PurePanel from './PurePanel';
import useModalHook from './useModal/index';

interface StaticModal {
  config: typeof modalGlobalConfig;
  confirm: typeof confirm;
  destroyAll: () => void;
  error: typeof confirm;
  info: typeof confirm;
  success: typeof confirm;
  useModal: typeof useModal;
  warn: typeof confirm;
  warning: typeof confirm;
}

const Modal = ModalComponent as StaticModal & typeof ModalComponent;

Modal.useModal = useModalHook;
Modal.confirm = confirm;
Modal.info = (config) => confirm(withInfo(config));
Modal.success = (config) => confirm(withSuccess(config));
Modal.error = (config) => confirm(withError(config));
Modal.warning = (config) => confirm(withWarn(config));
Modal.warn = Modal.warning;
Modal.destroyAll = () => {
  // Close and clean up all confirm modals
  while (destroyFns.length > 0) {
    destroyFns.pop()?.();
  }
};
Modal.config = modalGlobalConfig;

(Modal as any).install = (app: App) => {
  app.component(Modal.name, Modal);
};

export type { ModalEmits, ModalSlots } from './interface';
export type ModalProps = InternalModalProps;
export { useModalHook as useModal };

export default Modal as StaticModal & typeof ModalComponent;

(Modal as any)._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

import type { AppContext, CSSProperties } from 'vue';

import type { DialogProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ClosableType } from '../_util/hooks/useClosable';
import type { MaskType } from '../_util/hooks/useMergedMask';
import type { Breakpoint } from '../_util/responsiveObserver';
import type { ButtonProps, LegacyButtonType } from '../button';
import type { DirectionType } from '../config-provider/context';
import type { FocusableConfig, OmitFocusType } from '../drawer/useFocusable';

export type ModalSemanticName = keyof ModalSemanticClassNames &
  keyof ModalSemanticStyles;

export interface ModalSemanticClassNames {
  body?: string;
  close?: string;
  container?: string;
  footer?: string;
  header?: string;
  mask?: string;
  root?: string;
  title?: string;
  wrapper?: string;
}

export interface ModalSemanticStyles {
  body?: CSSProperties;
  /**
   * @since 1.3.0
   */
  close?: CSSProperties;
  container?: CSSProperties;
  footer?: CSSProperties;
  header?: CSSProperties;
  mask?: CSSProperties;
  root?: CSSProperties;
  title?: CSSProperties;
  wrapper?: CSSProperties;
}

export type ModalClassNamesType = SemanticClassNamesType<
  ModalProps,
  ModalSemanticClassNames
>;

export type ModalStylesType = SemanticStylesType<
  ModalProps,
  ModalSemanticStyles
>;

interface ModalCommonProps extends Omit<
  DialogProps,
  | 'animation'
  | 'classNames'
  | 'footer'
  | 'mask'
  | 'maskAnimation'
  | 'maskTransitionName'
  | 'modalRender'
  | 'onClose'
  | 'rootStyle'
  | 'style'
  | 'styles'
  | 'transitionName'
  | 'width'
  | OmitFocusType
> {
  classes?: ModalClassNamesType;
  closable?:
    | boolean
    | (Exclude<ClosableType, boolean> & {
        afterClose?: () => void;
        onClose?: () => void;
      });
  footer?:
    | ((params: {
        extra: { CancelBtn: any; OkBtn: any };
        originNode: VueNode;
      }) => any)
    | VueNode;
  styles?: ModalStylesType;
}

type getContainerFunc = () => HTMLElement;

export interface ModalProps extends ModalCommonProps {
  afterClose?: () => void;
  /** Callback when the animation ends when Modal is turned on and off */
  afterOpenChange?: (open: boolean) => void;
  /** @deprecated Please use `styles.body` instead */
  bodyStyle?: CSSProperties;
  cancelButtonProps?: ButtonProps;
  /** Text of the Cancel button */
  cancelText?: VueNode;
  /** Centered Modal */
  centered?: boolean;
  closeIcon?: VueNode;
  /** Whether to apply loading visual effect for OK button or not */
  confirmLoading?: boolean;
  /** @deprecated Please use `destroyOnHidden` instead */
  destroyOnClose?: boolean;
  /**
   * @since 5.25.0
   */
  destroyOnHidden?: boolean;
  focusable?: FocusableConfig;
  focusTriggerAfterClose?: boolean;
  /** Force render Modal */
  forceRender?: boolean;
  getContainer?: false | getContainerFunc | HTMLElement | string;
  keyboard?: boolean;
  /**
   * @since 5.18.0
   */
  loading?: boolean;
  mask?: MaskType;
  /**
   * @deprecated Please use `mask.closable` instead
   * @description Whether to close the modal dialog when the mask (area outside the modal) is clicked
   */
  maskClosable?: boolean;
  /** @deprecated Please use `styles.mask` instead */
  maskStyle?: CSSProperties;
  maskTransitionName?: string;
  modalRender?: (node: any) => any;
  mousePosition?: MousePosition;
  okButtonProps?: ButtonProps;
  /** Text of the OK button */
  okText?: VueNode;
  /** Button `type` of the OK button */
  okType?: LegacyButtonType;
  /** Whether the modal dialog is visible or not */
  open?: boolean;
  prefixCls?: string;
  rootClass?: string;
  rootStyle?: CSSProperties;
  /** Control whether to lock body scroll when modal opens. Default is true. */
  scrollLock?: boolean;
  /** The modal dialog's title */
  title?: VueNode;
  transitionName?: string;
  /** Width of the modal dialog */
  width?: number | Partial<Record<Breakpoint, number | string>> | string;
  wrapClassName?: string;
  wrapProps?: any;
  zIndex?: number;
}

export interface ModalEmits {
  /** Specify a function that will be called when a user clicks mask, close button on top right or Cancel button, or presses Esc key */
  cancel: (e: KeyboardEvent | MouseEvent) => void;
  /** Specify a function that will be called when a user clicks the OK button */
  ok: (e: MouseEvent) => void;
  'update:open': (open: boolean) => void;
}

export interface ModalSlots {
  cancelText?: () => any;
  closeIcon?: () => any;
  default?: () => any;
  footer?: (params: {
    extra: { CancelBtn: any; OkBtn: any };
    originNode: VueNode;
  }) => any;
  modalRender?: (node: any) => any;
  okText?: () => any;
  title?: () => any;
}

export interface ModalFuncProps extends ModalCommonProps {
  afterClose?: () => void;
  appContext?: AppContext;
  autoFocusButton?: 'cancel' | 'ok' | null;
  /** @deprecated Please use `styles.body` instead */
  bodyStyle?: CSSProperties;
  cancelButtonProps?: ButtonProps;
  cancelText?: VueNode;
  centered?: boolean;
  class?: string;
  closeIcon?: VueNode;
  content?: VueNode;
  direction?: DirectionType;
  focusTriggerAfterClose?: boolean;
  footer?: ModalProps['footer'];
  getContainer?: false | getContainerFunc | HTMLElement | string;
  icon?: VueNode;
  keyboard?: boolean;
  mask?: MaskType;
  maskClosable?: boolean;
  /** @deprecated Please use `styles.mask` instead */
  maskStyle?: CSSProperties;
  maskTransitionName?: string;
  modalRender?: ModalProps['modalRender'];
  okButtonProps?: ButtonProps;
  okCancel?: boolean;
  okText?: VueNode;
  okType?: LegacyButtonType;
  onCancel?: (...args: any[]) => any;
  onClose?: DialogProps['onClose'];
  // TODO: find out exact types
  onOk?: (...args: any[]) => any;
  open?: boolean;
  prefixCls?: string;
  rootClass?: string;
  /** Control whether to lock body scroll when modal opens. Default is true. */
  scrollLock?: boolean;
  style?: CSSProperties;
  title?: VueNode;
  transitionName?: string;
  type?: 'confirm' | 'error' | 'info' | 'success' | 'warn' | 'warning';
  width?: number | string;
  wrapClassName?: string;
  zIndex?: number;
}
export interface ModalLocale {
  cancelText: string;
  justOkText: string;
  okText: string;
}
export type MousePosition = null | { x: number; y: number };

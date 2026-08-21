import type { CSSProperties } from 'vue';

import type { GetContainer } from '../portal/Portal';
import type { VueNode } from '../util';

export type SemanticName =
  | 'body'
  | 'close'
  | 'container'
  | 'footer'
  | 'header'
  | 'mask'
  | 'title'
  | 'wrapper';

export type ModalClassNames = Partial<Record<SemanticName, string>>;

export type ModalStyles = Partial<Record<SemanticName, CSSProperties>>;

export interface ClosableType {
  afterClose?: () => any;
  closeIcon?: VueNode;
  disabled?: boolean;
}

export interface IDialogPropTypes {
  afterClose?: () => any;
  afterOpenChange?: (open: boolean) => void;
  animation?: any;
  bodyProps?: any;
  bodyStyle?: Record<string, any>;
  children?: VueNode;
  className?: string;
  classNames?: ModalClassNames;
  closable?: boolean | (ClosableType & Record<string, any>);
  closeIcon?: VueNode;
  destroyOnHidden?: boolean;
  focusTrap?: boolean;
  focusTriggerAfterClose?: boolean;
  footer?: VueNode;
  forceRender?: boolean;
  getContainer?: false | GetContainer;
  height?: number | string;
  keyboard?: boolean;
  mask?: boolean;
  maskAnimation?: any;
  maskClosable?: boolean;
  maskProps?: any;
  maskStyle?: Record<string, any>;
  maskTransitionName?: string;
  modalRender?: (node: VueNode) => VueNode;
  mousePosition?: null | {
    x: number;
    y: number;
  };
  onClose?: (e: any) => any;
  // Refs
  panelRef?: any;
  prefixCls?: string;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  /** Control whether to lock body scroll when modal opens. Default is true. */
  scrollLock?: boolean;
  style?: CSSProperties;
  styles?: ModalStyles;
  title?: VueNode;
  transitionName?: string;
  visible?: boolean;
  width?: number | string;
  wrapClassName?: string;
  wrapProps?: any;
  wrapStyle?: Record<string, any>;

  zIndex?: number;
}

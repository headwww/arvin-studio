import type { AppContext, CSSProperties } from 'vue';

import type { Key } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';

export type NoticeType = 'error' | 'info' | 'loading' | 'success' | 'warning';

export type MessageSemanticName = keyof MessageSemanticClassNames &
  keyof MessageSemanticStyles;

export interface MessageSemanticClassNames {
  icon?: string;
  list?: string;
  listContent?: string;
  root?: string;
  title?: string;
  wrapper?: string;
}

export interface MessageSemanticStyles {
  icon?: CSSProperties;
  list?: CSSProperties;
  listContent?: CSSProperties;
  root?: CSSProperties;
  title?: CSSProperties;
  wrapper?: CSSProperties;
}

export type ArgsClassNamesType = SemanticClassNamesType<
  ArgsProps,
  MessageSemanticClassNames
>;

export type ArgsStylesType = SemanticStylesType<
  ArgsProps,
  MessageSemanticStyles
>;

export interface ConfigOptions {
  appContext?: AppContext;
  classes?: ArgsClassNamesType;
  duration?: number;
  getContainer?: () => HTMLElement | ShadowRoot;
  maxCount?: number;
  /**
   * @descCN 悬停时是否暂停计时器
   * @descEN keep the timer running or not on hover
   */
  pauseOnHover?: boolean;
  prefixCls?: string;
  rtl?: boolean;
  styles?: ArgsStylesType;
  top?: number | string;
  transitionName?: string;
}

export interface ArgsProps {
  /**
   * @descCN 消息通知的应用上下文
   * @descEN The application context of the message notification
   */
  appContext?: any;
  class?: string;
  classes?: ArgsClassNamesType;
  /**
   * @descCN 消息通知的内容，接收组件或者字符串
   * @descEN The content of the message notification, receiving component or string
   */
  content: VueNode;
  /**
   * @descCN 消息通知持续显示的时间
   * @descEN How long the message notification remains displayed
   */
  duration?: number;
  icon?: VueNode;
  key?: Key;
  /**
   * @descCN 消息通知点击时的回调函数
   * @descEN Callback function when message notification is clicked
   */
  onClick?: (e: MouseEvent) => void;
  /**
   * @descCN 消息通知关闭时进行调用的回调函数
   * @descEN The callback function called when the message notification is closed
   */
  onClose?: () => void;
  /**
   * @descCN 悬停时是否暂停计时器
   * @descEN keep the timer running or not on hover
   */
  pauseOnHover?: boolean;
  style?: CSSProperties;
  styles?: ArgsStylesType;
  /**
   * @descCN 消息通知的类型，可以是 'info'、'success'、'error'、'warning' 或 'loading'
   * @descEN The type of message notification, which can be 'info', 'success', 'error', 'warning' or 'loading'
   */
  type?: NoticeType;
}

export type JointContent = any | ArgsProps | string;

export interface MessageType extends PromiseLike<boolean> {
  (): void;
}

export type TypeOpen = (
  content: JointContent,
  /**
   * @descCN 消息通知持续显示的时间，也可以直接使用 onClose。
   * @descEN You can also use onClose directly to determine how long the message notification continues to be displayed.
   */
  duration?: number | VoidFunction,
  /**
   * @descCN 消息通知关闭时进行调用的回调函数
   * @descEN The callback function called when the message notification is closed
   */
  onClose?: VoidFunction,
) => MessageType;

export interface MessageInstance {
  destroy: (key?: Key) => void;
  error: TypeOpen;
  info: TypeOpen;
  loading: TypeOpen;
  open: (args: ArgsProps) => MessageType;
  success: TypeOpen;
  warning: TypeOpen;
}

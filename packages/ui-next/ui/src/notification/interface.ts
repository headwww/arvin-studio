import type { AppContext, CSSProperties, HTMLAttributes } from 'vue';

import type { Key } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ClosableType } from '../_util/hooks/useClosable';

interface DivProps extends HTMLAttributes {
  'data-testid'?: string;
}

export const NotificationPlacements = [
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
] as const;

export type NotificationPlacement = (typeof NotificationPlacements)[number];

export type IconType = 'error' | 'info' | 'success' | 'warning';

export type NotificationSemanticName = keyof NotificationSemanticClassNames &
  keyof NotificationSemanticStyles;

export interface NotificationSemanticClassNames {
  actions?: string;
  description?: string;
  icon?: string;
  root?: string;
  title?: string;
}

export interface NotificationSemanticStyles {
  actions?: CSSProperties;
  description?: CSSProperties;
  icon?: CSSProperties;
  root?: CSSProperties;
  title?: CSSProperties;
}

export type NotificationClassNamesType = SemanticClassNamesType<
  ArgsProps,
  NotificationSemanticClassNames
>;

export type NotificationStylesType = SemanticStylesType<
  ArgsProps,
  NotificationSemanticStyles
>;

export interface ArgsProps {
  actions?: VueNode;
  class?: string;
  classes?: NotificationClassNamesType;
  closable?:
    | boolean
    | (Exclude<ClosableType, boolean> & {
        onClose?: () => void;
      });
  closeIcon?: VueNode;
  description?: VueNode;
  duration?: false | number;
  icon?: VueNode;
  key?: Key;
  onClick?: () => void;
  onClose?: () => void;
  pauseOnHover?: boolean;
  placement?: NotificationPlacement;
  props?: DivProps;
  role?: 'alert' | 'status';
  showProgress?: boolean;
  style?: CSSProperties;
  styles?: NotificationStylesType;
  title?: VueNode;
  readonly type?: IconType;
}

export interface NotificationConfig {
  bottom?: number;
  classes?: NotificationClassNamesType;
  closeIcon?: VueNode;
  duration?: false | number;
  getContainer?: () => HTMLElement | ShadowRoot;
  maxCount?: number;
  pauseOnHover?: boolean;
  placement?: NotificationPlacement;
  prefixCls?: string;
  rtl?: boolean;
  showProgress?: boolean;
  stack?: boolean | { threshold?: number };
  styles?: NotificationStylesType;
  top?: number;
}

type StaticFn = (args: ArgsProps) => void;
export interface NotificationInstance {
  destroy: (key?: Key) => void;
  error: StaticFn;
  info: StaticFn;
  open: StaticFn;
  success: StaticFn;
  warning: StaticFn;
}

export interface GlobalConfigProps {
  appContext?: AppContext;
  bottom?: number;
  closable?: ClosableType;
  closeIcon?: VueNode;
  duration?: false | number;
  getContainer?: () => HTMLElement | ShadowRoot;
  maxCount?: number;
  pauseOnHover?: boolean;
  placement?: NotificationPlacement;
  prefixCls?: string;
  props?: DivProps;
  rtl?: boolean;
  showProgress?: boolean;
  top?: number;
}

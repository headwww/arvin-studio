import type { CSSProperties } from 'vue';

import type { QRProps } from '@arvin-studio/headless';

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context.ts';
import type { Locale } from '../locale';

export type QRStatus = 'active' | 'expired' | 'loading' | 'scanned';
export interface StatusRenderInfo {
  locale: Locale['QRCode'];
  onRefresh?: () => void;
  status: Exclude<QRStatus, 'active'>;
}

type ImageSettings = QRProps['imageSettings'];

export type { ImageSettings, QRProps };

export type QRPropsCanvas = QRProps;
export type QRPropsSvg = QRProps;

export type QRCodeSemanticName = keyof QRCodeSemanticClassNames &
  keyof QRCodeSemanticStyles;

export interface QRCodeSemanticClassNames {
  cover?: string;
  root?: string;
}

export interface QRCodeSemanticStyles {
  cover?: CSSProperties;
  root?: CSSProperties;
}

export type QRCodeClassNamesType = SemanticClassNamesType<
  QRCodeProps,
  QRCodeSemanticClassNames
>;

export type QRCodeStylesType = SemanticStylesType<
  QRCodeProps,
  QRCodeSemanticStyles
>;

export interface QRCodeProps extends ComponentBaseProps, QRProps {
  bordered?: boolean;
  classes?: QRCodeClassNamesType;
  color?: any;
  errorLevel?: 'H' | 'L' | 'M' | 'Q';
  icon?: string;
  iconSize?: number | { height: number; width: number };
  status?: QRStatus;
  statusRender?: (info: StatusRenderInfo) => any;
  styles?: QRCodeStylesType;
  type?: 'canvas' | 'svg';
}

export interface QRCodeSlots {
  statusRender?: (info: StatusRenderInfo) => any;
}

export interface QRCodeEmits {
  refresh: () => void;
}

import type { CSSProperties } from 'vue';

import type { MouseEventHandler } from '../util';

export type SemanticName = 'rail' | 'root' | 'track';

export interface ProgressProps {
  className?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  gapDegree?: number;
  gapPosition?: GapPositionType;
  id?: string;
  loading?: boolean;
  onClick?: MouseEventHandler;
  percent?: number | number[];
  prefixCls?: string;
  railColor?: string;
  railWidth?: number;
  steps?: number | { count: number; gap: number };
  strokeColor?: StrokeColorType;
  strokeLinecap?: StrokeLinecapType;
  strokeWidth?: number;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  transition?: string;
}

export type StrokeColorObject = Record<string, boolean | string>;

export type BaseStrokeColorType = string | StrokeColorObject;

export type StrokeColorType = BaseStrokeColorType | BaseStrokeColorType[];

export type GapPositionType = 'bottom' | 'left' | 'right' | 'top';

export type StrokeLinecapType = 'butt' | 'round' | 'square';

import type { Color } from './color';

export interface HSB {
  b: number | string;
  h: number | string;
  s: number | string;
}

export interface RGB {
  b: number | string;
  g: number | string;
  r: number | string;
}

export interface HSBA extends HSB {
  a: number;
}

export interface RGBA extends RGB {
  a: number;
}

export type ColorGenInput<T = Color> =
  | HSB
  | HSBA
  | number
  | RGB
  | RGBA
  | string
  | T;

export type ColorValueType<T = Color> = string | T;

export type ColorFormatType = 'hex' | 'hsb' | 'rgb';

export type HsbaColorType = 'alpha' | 'hue';

export interface TransformOffset {
  x: number;
  y: number;
}

export interface BaseColorPickerProps {
  color: Color;
  disabled?: boolean;
  onChange?: (
    color: ColorValueType,
    info?: { type?: HsbaColorType; value?: number },
  ) => void;
  onChangeComplete?: (
    value: ColorValueType,
    info?: { type?: HsbaColorType; value?: number },
  ) => void;
  prefixCls?: string;
}

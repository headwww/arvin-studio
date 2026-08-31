export interface FastRGB {
  a: number;
  b: number;
  g: number;
  r: number;
}

export interface HSL {
  a: number;
  h: number;
  l: number;
  s: number;
}

export interface HSV {
  a: number;
  h: number;
  s: number;
  v: number;
}

export type OptionalA<T extends { a: number }> = Omit<T, 'a'> & { a?: number };

export type ColorInput =
  | OptionalA<FastRGB>
  | OptionalA<HSL>
  | OptionalA<HSV>
  | string;

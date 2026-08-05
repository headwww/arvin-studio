import type { CSSInterpolation, DerivativeFunc } from '@arvin-studio/cssinjs';

import type { AliasToken } from './alias';
import type { MapToken } from './maps';
import type { SeedToken } from './seeds';

export type { ComponentTokenMap } from './components';
export type {
  FullToken,
  GenStyleFn,
  GetDefaultToken,
  GlobalToken,
  OverrideComponent,
  OverrideToken,
} from './cssinjsObj';

export type {
  ColorMapToken,
  ColorNeutralMapToken,
  CommonMapToken,
  FontMapToken,
  HeightMapToken,
  MapToken,
  SizeMapToken,
  StyleMapToken,
} from './maps';
export { PresetColors } from './presetColors';
export type {
  ColorPalettes,
  PresetColorKey,
  PresetColorType,
} from './presetColors';

export type { SeedToken } from './seeds';

export type TokenType = object;

export type GenerateStyle<
  ComponentToken extends Record<string, any> = AliasToken,
  ReturnType = CSSInterpolation,
> = (token: ComponentToken) => ReturnType;

export type { AliasToken, CSSInterpolation, DerivativeFunc };

export type MappingAlgorithm = DerivativeFunc<SeedToken, MapToken>;

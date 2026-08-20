export { defaultConfig } from './context';

export {
  type AliasToken,
  type FullToken,
  type GenerateStyle,
  type GenStyleFn,
  type GetDefaultToken,
  type GlobalToken,
  type OverrideComponent,
  type PresetColorKey,
  PresetColors,
  type PresetColorType,
  type SeedToken,
} from './interface';

export { getLineHeight } from './themes/shared/genFontSizes';

export { default as useToken } from './useToken';
export { default as genPresetColor } from './util/genPresetColor';

export {
  genComponentStyleHook,
  genStyleHooks,
  genSubStyleComponent,
} from './util/genStyleUtils';

export { default as useResetIconStyle } from './util/useResetIconStyle';

export { genCalc as calc, useStyleRegister } from '@arvin-studio/cssinjs';

export type { CSSUtil, TokenWithCommonCls } from '@arvin-studio/cssinjs';

export { mergeToken, statistic, statisticToken } from '@arvin-studio/cssinjs';

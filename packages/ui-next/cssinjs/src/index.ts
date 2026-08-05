import {
  hash,
  supportLogicProps,
  supportWhere,
  token2CSSVar,
  unit,
} from './util';

export { hash, token2CSSVar, unit };

export const _experimental = {
  supportModernCSS: () => supportWhere() && supportLogicProps(),
};

export * from './cssinjs-utils';

export * from './cssinjs-utils';
export {
  getComputedToken,
  default as useCacheToken,
} from './hooks/useCacheToken';
export { default as useCSSVarRegister } from './hooks/useCSSVarRegister';
export {
  type CSSInterpolation,
  type CSSObject,
  default as useStyleRegister,
} from './hooks/useStyleRegister';
export { default as Keyframes } from './Keyframes';
export {
  legacyNotSelectorLinter,
  type Linter,
  logicalPropertiesLinter,
  NaNLinter,
  parentSelectorLinter,
} from './linters';

export { collectStyleText, setStyleCollector } from './ssr/styleCollector';
export {
  createCache,
  provideStyleContext,
  StyleProvider,
  type StyleProviderProps,
  useStyleContext,
  useStyleContextProvide,
} from './StyleContext';
export {
  type AbstractCalculator,
  createTheme,
  type DerivativeFunc,
  genCalc,
  Theme,
  type TokenType,
} from './theme';

export { default as autoPrefixTransformer } from './transformers/autoPrefix';
export { type Transformer } from './transformers/interface';
export { default as legacyLogicalPropertiesTransformer } from './transformers/legacyLogicalProperties';
export { default as px2remTransformer } from './transformers/px2rem';

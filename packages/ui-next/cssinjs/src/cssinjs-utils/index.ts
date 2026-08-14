/**
 * @file cssinjs-utils 模块统一导出
 */

export type {
  ComponentToken,
  ComponentTokenKey,
  GlobalToken,
  GlobalTokenWithComponent,
  OverrideTokenMap,
  TokenMap,
  TokenMapKey,
} from './interface';
export type {
  FullToken,
  GenStyleFn,
  GetDefaultToken,
} from './util/genStyleUtils';
export { default as genStyleUtils } from './util/genStyleUtils';

export type { CSSUtil, TokenWithCommonCls } from './util/genStyleUtils';
export { merge as mergeToken, statistic } from './util/statistic';
export { default as statisticToken } from './util/statistic';

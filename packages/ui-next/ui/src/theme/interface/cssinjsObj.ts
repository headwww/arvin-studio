import type {
  FullToken as FullTokenTypeUtil,
  GenStyleFn as GenStyleFnTypeUtil,
  GetDefaultToken as GetDefaultTokenTypeUtil,
  GlobalToken as GlobalTokenTypeUtil,
  OverrideTokenMap as OverrideTokenTypeUtil,
  TokenMapKey,
} from '@arvin-studio/cssinjs';

import type { AliasToken } from './alias';
import type { ComponentTokenMap } from './components';

/** AliasToken & ComponentTokenMap — 所有设计令牌的完整合集 */
export type GlobalToken = GlobalTokenTypeUtil<ComponentTokenMap, AliasToken>;

/** 用户可对各组件覆盖的 token 类型 */
export type OverrideToken = OverrideTokenTypeUtil<
  ComponentTokenMap,
  AliasToken
>;

/** 合法的组件名，如 'Button' | 'Table' | 'Checkbox' */
export type OverrideComponent = TokenMapKey<ComponentTokenMap>;

/** styleFn(token) 的 token 参数类型：全局 token + 组件专属 token + componentCls/calc 等 */
export type FullToken<C extends TokenMapKey<ComponentTokenMap>> =
  FullTokenTypeUtil<ComponentTokenMap, AliasToken, C>;

/** prepareComponentToken 的函数签名：(aliasToken) => ComponentToken */
export type GetDefaultToken<C extends TokenMapKey<ComponentTokenMap>> =
  GetDefaultTokenTypeUtil<ComponentTokenMap, AliasToken, C>;

/** styleFn 的函数签名：(token, info) => CSSInterpolation */
export type GenStyleFn<C extends TokenMapKey<ComponentTokenMap>> =
  GenStyleFnTypeUtil<ComponentTokenMap, AliasToken, C>;

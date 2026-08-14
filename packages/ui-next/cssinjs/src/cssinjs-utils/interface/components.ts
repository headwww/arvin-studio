/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Token 系统的 TypeScript 类型定义
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 这些类型描述了 Token 系统的层级结构和泛型约束。
 * 核心概念：3 层泛型参数对应 token 的 3 个层级：
 *
 *   CompTokenMap — 所有组件 token 的映射表 { Button: ButtonToken, Table: TableToken, ... }
 *   AliasToken   — 全局语义别名 token（colorPrimary、fontSize 等 200+ 个值）
 *   C            — 当前组件的名称（'Button'、'Table' 等）
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  具体例子（以 Button 为例）：
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   CompTokenMap = ComponentTokenMap           // { Button: ButtonToken, Table: TableToken, ... }
 *   AliasToken   = AliasToken                  // { colorPrimary: string, fontSize: number, ... }
 *   C            = 'Button'                    // 当前组件名
 *
 *   GlobalToken<ComponentTokenMap, AliasToken>     → AliasToken & ComponentTokenMap
 *   GlobalTokenWithComponent<..., 'Button'>        → AliasToken & ComponentTokenMap & ButtonToken
 *   ComponentToken<..., 'Button'>                  → Partial<ButtonToken> & Partial<AliasToken>
 *   ComponentTokenKey<..., 'Button'>               → keyof (Partial<ButtonToken> & Partial<AliasToken>)
 *                                                     如 'fontWeight' | 'iconGap' | 'fontSize' | ...
 */
import type { TokenType } from '../../theme';

/**
 * Token 映射表：组件名 → 组件 token 类型。
 *
 * ```
 * interface ComponentTokenMap {
 *   Button?: { fontWeight?: number; iconGap?: number; ... }
 *   Table?: { cellPaddingBlock?: number; ... }
 * }
 * ```
 */
export type TokenMap = Record<PropertyKey, any>;

/** 从 TokenMap 中提取合法的组件名（字符串 key） */
export type TokenMapKey<CompTokenMap extends TokenMap> = Extract<
  keyof CompTokenMap,
  string
>;

/**
 * 全局 Token = AliasToken（语义别名） + CompTokenMap（所有组件的 token 合集）。
 * 注意：这个类型合并了整个 CompTokenMap，所以任何组件都能访问所有组件的 token key。
 * 这就是为什么 Button 的 styleFn 里能拿到 Table 的 token 值（虽然有前缀防止冲突）。
 */
export type GlobalToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
> = AliasToken & CompTokenMap;

/**
 * 用户覆盖 Token 的类型。
 * 对每个组件，允许部分覆盖其组件 token 和全局 alias token。
 *
 * @example
 *   { Button: { fontWeight: 500, fontSize: 16 } }
 *   //          ↑ ButtonToken 的一部分   ↑ AliasToken 的一部分
 */
export type OverrideTokenMap<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
> = {
  [key in keyof CompTokenMap]: Partial<AliasToken> & Partial<CompTokenMap[key]>;
};

/**
 * 带了组件 Token 的完整 GlobalToken。
 * 这是 styleFn 的 token 参数的实际类型（在 mergeToken 之前）。
 *
 * = GlobalToken + 当前组件的 ComponentToken
 * = AliasToken & CompTokenMap & CompTokenMap[C]
 */
export type GlobalTokenWithComponent<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = CompTokenMap[C] & GlobalToken<CompTokenMap, AliasToken>;

/**
 * 单个组件的可覆盖 Token 类型。
 * 从 OverrideTokenMap 中取出某个组件的具体类型，去掉 undefined。
 *
 * @example
 *   ComponentToken<ComponentTokenMap, AliasToken, 'Button'>
 *   → Partial<ButtonToken> & Partial<AliasToken>
 */
export type ComponentToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = Exclude<OverrideTokenMap<CompTokenMap, AliasToken>[C], undefined>;

/**
 * 组件 Token 的合法 key 集合。
 * 用于 options.unitless、deprecatedTokens 等配置的类型约束。
 *
 * @example
 *   ComponentTokenKey<ComponentTokenMap, AliasToken, 'Button'>
 *   → 'fontWeight' | 'iconGap' | 'fontSize' | 'colorPrimary' | ...
 */
export type ComponentTokenKey<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = keyof ComponentToken<CompTokenMap, AliasToken, C>;

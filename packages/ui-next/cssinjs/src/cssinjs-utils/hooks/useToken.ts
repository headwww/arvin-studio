/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  useToken 类型定义 — genStyleUtils 配置中 useToken 依赖的接口契约
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 这个文件只定义类型，不包含实现。它规定了注入到 genStyleUtils 的
 * useToken 依赖应该返回什么样的数据结构。
 *
 * 内部调用 useCacheToken，返回 token、hashId、cssVar 等 7 项数据。
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  返回值语义：
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   token      — 合并了 CSS 变量引用的 token，样式函数用这个（值已被替换为 var(--xxx)）
 *   realToken  — 原始 token，值是真实的数字/字符串（用于计算派生值）
 *   theme      — Theme 实例，可调用 theme.getDerivativeToken() 派生新 token
 *   hashId     — 样式隔离的 hash 类名（如 "css-abc123"）
 *   cssVar     — CSS 变量配置（prefix: "as", key: "css-var-root"）
 *   zeroRuntime — 是否跳过运行时样式生成（构建工具预生成 CSS 文件时用）
 */
import type { Ref } from 'vue';

import type { Theme, TokenType } from '../../theme';
import type { GlobalToken, OverrideTokenMap, TokenMap } from '../interface';

/**
 * 带主题的 Token 映射表。
 * 用户可对每个组件分别覆盖 token 值并指定独立的 Theme。
 *
 * @example
 *   { Button: { fontWeight: 500, theme: darkTheme } }
 */
export type TokenMapWithTheme<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  DesignToken extends TokenType,
> = {
  [key in keyof OverrideTokenMap<CompTokenMap, AliasToken>]?: OverrideTokenMap<
    CompTokenMap,
    AliasToken
  >[key] & {
    theme?: Theme<DesignToken, AliasToken>;
  };
};

/**
 * useToken Hook 的返回值类型。
 * genStyleUtils 的 config.useToken 必须返回此结构。
 */
export interface UseTokenReturn<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  DesignToken extends TokenType,
> {
  /** 用户对各组件自定义的 token 覆盖 */
  components?: Ref<TokenMapWithTheme<CompTokenMap, DesignToken, AliasToken>>;
  /**
   * CSS 变量配置。
   * prefix: CSS 变量名前缀（如 "as" → --as-color-primary）
   * key: CSS 变量作用域的 key（如 "css-var-root"）
   */
  cssVar?: Ref<{
    key?: string;
    prefix?: string;
  }>;
  /** 用户配置的 hashed 标志 */
  hashed?: Ref<boolean | string>;
  /**
   * 样式隔离的 hash 类名（如 "css-abc123"）。
   * 由 useCacheToken 通过 hash(salt + cssVarPrefix) 计算。
   * 组件将它拼到根元素 class 上实现样式隔离。
   */
  hashId?: Ref<string>;
  /**
   * 原始 token，值为真实的字符串/数字。
   * 例如 { colorPrimary: '#1677ff' }。
   * 用于计算 defaultComponentToken、派生值等需要真实值的场景。
   */
  realToken?: Ref<GlobalToken<CompTokenMap, AliasToken>>;
  /** Theme 实例，包含派生函数链 */
  theme?: Ref<Theme<DesignToken, AliasToken>>;
  /**
   * 合并了 CSS 变量引用的 token。
   * 例如 { colorPrimary: 'var(--as-color-primary)' }。
   * 组件 styleFn 使用这个 token，值已经是 var() 引用。
   */
  token: Ref<GlobalToken<CompTokenMap, AliasToken>>;
  /**
   * 零运行时模式。
   * 为 true 时跳过运行时样式注入，CSS 由构建工具预生成。
   */
  zeroRuntime?: Ref<boolean>;
}

/** genStyleUtils 配置中 useToken 的类型签名 */
export type UseToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  DesignToken extends TokenType,
> = () => UseTokenReturn<CompTokenMap, AliasToken, DesignToken>;

import type { AliasToken, ComponentTokenMap, SeedToken } from '../interface';

import { computed } from 'vue';

import { genStyleUtils } from '@arvin-studio/cssinjs';

import { defaultIconPrefixCls, useConfig } from '../../config-provider/context';
import { genCommonStyle, genIconStyle, genLinkStyle } from '../../style';
import useLocalToken, { unitless } from '../useToken';

/**
 * usePrefix — 提供 CSS 类名前缀
 * 返回 rootPrefixCls（如 "as"）和 iconPrefixCls（如 "asicon"）
 * 从 ConfigProvider 的全局配置中读取
 */
const usePrefix = () => {
  const configCtx = useConfig();
  return computed(() => {
    const { getPrefixCls, iconPrefixCls } = configCtx.value;
    const rootPrefixCls = getPrefixCls();
    return { rootPrefixCls, iconPrefixCls };
  });
};

/**
 * useCSP — 提供内容安全策略 nonce
 * 从 ConfigProvider 的 csp 配置中读取
 */
const useCSP = () => {
  const configCtx = useConfig();
  return computed(() => configCtx.value?.csp ?? {});
};

/**
 * useToken — 提供设计令牌、主题、hashId、CSS 变量
 * 内部调用 useCacheToken（cssinjs 底层 hook），返回 7 项数据
 * [theme, realToken, hashId, token, cssVar, zeroRuntime]
 */
const useToken = () => {
  const [theme, realToken, hashId, token, cssVar, zeroRuntime] =
    useLocalToken();

  return {
    theme,
    realToken,
    hashId: computed(() => hashId?.value ?? ''),
    token,
    cssVar: computed(
      () =>
        cssVar?.value ?? {
          prefix: '',
          key: '',
        },
    ),
    zeroRuntime,
  };
};

/**
 * getResetStyles — 全局重置样式（链接、图标）
 * 每个组件注册样式时会自动注入这些基础重置样式
 */
const getResetStyles = (token: AliasToken, config: any) => {
  const linkStyle = genLinkStyle(token);
  const { prefix } = config ?? {};
  return [
    linkStyle,
    { '&': linkStyle },
    genIconStyle(prefix?.value?.iconPrefixCls ?? defaultIconPrefixCls),
  ];
};

type CssVarName = (name: string) => `--${string}`;
type CssVarRef = (
  name: string,
  fallback?: number | string,
) => `var(--${string})`;

export const { genComponentStyleHook, genStyleHooks, genSubStyleComponent } =
  genStyleUtils<ComponentTokenMap, AliasToken, SeedToken>({
    usePrefix,
    useToken: useToken as any,
    useCSP,
    getResetStyles,
    getCommonStyle: genCommonStyle,
    getCompUnitless: (() => unitless) as any,
  });

/**
 * 生成 CSS 变量名和引用，用于组件内部的样式变量（区别于全局 token 的 CSS 变量）。
 *
 * @param asCls - as 根类名，如 ".as"
 * @param component - 组件名，如 "btn"
 * @returns [varName, varRef]
 *   - varName('text-color') → "--as-btn-text-color"
 *   - varRef('text-color')  → "var(--as-btn-text-color)"
 *
 * @example
 * // button/style/variant.ts
 * const [varName, varRef] = genCssVar(asCls, 'btn')
 * {
 *   [varName('border-width')]: lineWidth,             // --ant-btn-border-width: 1px
 *   border: [varRef('border-width'), ...].join(' '),   // 引用 var(--ant-btn-border-width)
 * }
 */
export function genCssVar(
  asCls: string,
  component: string,
): readonly [varName: CssVarName, varRef: CssVarRef] {
  const cssPrefix =
    `--${asCls.replaceAll('.', '')}-${component}-` satisfies `--${string}`;
  const varName: CssVarName = (name) => {
    return `${cssPrefix}${name}`;
  };
  const varRef: CssVarRef = (name, fallback) => {
    return fallback
      ? `var(${cssPrefix}${name}, ${fallback})`
      : `var(${cssPrefix}${name})`;
  };
  return [varName, varRef] as const;
}

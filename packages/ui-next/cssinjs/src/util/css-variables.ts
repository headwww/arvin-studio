import type { HashPriority } from '../StyleContext';

import { where } from '../util';

/**
 * 将 camelCase 的 token 名转换为 kebab-case 的 CSS 变量名。
 *
 * 转换规则（三条正则依次处理）：
 * 1. 小写/数字 后接 大写    → 插入连字符：colorPrimary   → color-Primary
 * 2. 连续大写 后接 大写+小写 → 插入连字符：HTMLParser     → HTML-Parser
 * 3. 小写 后接 大写/数字    → 插入连字符：fontSize2XL    → font-size-2-x-l
 * 最后统一转小写，并加上 -- 前缀和可选的 prefix
 *
 * @example
 * token2CSSVar('colorPrimary')           // '--color-primary'
 * token2CSSVar('colorPrimary', 'ant')    // '--ant-color-primary'
 * token2CSSVar('fontSize')               // '--font-size'
 */
export function token2CSSVar(token: string, prefix = '') {
  return `--${prefix ? `${prefix}-` : ''}${token}`
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replaceAll(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1-$2')
    .replaceAll(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase();
}

/**
 * 将 CSS 变量键值对序列化为一段完整的 CSS 字符串，包含选择器和变量声明。
 *
 * @param cssVars   CSS 变量对象，key 为变量名（如 --color-primary），value 为变量值
 * @param hashId    当前主题的唯一 hash，作为选择器的一部分实现样式隔离
 * @param options
 *   - scope       额外的作用域类名，用于进一步缩小变量的生效范围
 *   - hashCls     hash 类名，影响 where() 生成的选择器
 *   - hashPriority 选择器优先级，默认 'low'
 *
 * @example
 * serializeCSSVar({ '--color-primary': '#1677ff' }, 'abc123')
 * // → '.abc123{ --color-primary:#1677ff; }'
 *
 * serializeCSSVar({ '--color-primary': '#1677ff' }, 'abc123', { scope: 'dark' })
 * // → '.abc123.dark{ --color-primary:#1677ff; }'
 *
 * serializeCSSVar({ '--color-primary': '#1677ff' }, 'abc123', { scope: ['dark', 'compact'] })
 * // → '.abc123.dark, .abc123.compact{ --color-primary:#1677ff; }'
 */
export function serializeCSSVar<T extends Record<string, any>>(
  cssVars: T,
  hashId: string,
  options?: {
    hashCls?: string;
    hashPriority?: HashPriority;
    scope?: string | string[];
  },
) {
  const { hashCls, hashPriority = 'low', scope } = options || {};
  if (Object.keys(cssVars).length === 0) {
    return '';
  }

  const baseSelector = `${where({ hashCls, hashPriority })}.${hashId}`;
  const scopes = (Array.isArray(scope) ? scope : [scope]).filter(
    Boolean,
  ) as string[];
  const selector =
    scopes.length > 0
      ? scopes.map((scopeName) => `${baseSelector}.${scopeName}`).join(', ')
      : baseSelector;

  return `${selector}{${Object.entries(cssVars)
    .map(([key, value]) => `${key}:${value};`)
    .join('')}}`;
}

/**
 * token 转换后的类型：每个 key 的值变为 CSS 变量引用字符串（如 'var(--color-primary)'）
 * 或保留原始值（preserve 为 true 时）。
 */
export type TokenWithCSSVar<
  V,
  T extends Record<string, V> = Record<string, V>,
> = {
  [key in keyof T]?: string | V;
};

/**
 * 核心转换函数：将整个 token 对象转换为两样东西：
 * 1. 替换后的 token 对象：原始值替换为 var(--xxx) 引用
 * 2. CSS 字符串：包含所有 CSS 变量声明的完整 CSS 规则块
 *
 * 每个 token 属性的处理逻辑：
 * - preserve[key] = true  → 保留原始值，不转换为 CSS 变量（如特殊用途的 token）
 * - ignore[key] = true    → 跳过，既不转换也不保留
 * - 数字类型             → 自动补 px（除非 unitless[key] = true，如 zIndex、opacity 等无单位属性）
 * - 字符串类型           → 直接作为变量值
 * - 其他类型（对象等）   → 跳过，不支持转换
 *
 * @param token     原始 token 对象
 * @param themeKey  主题唯一标识（hashId），用于生成 CSS 选择器
 * @param config    转换配置项
 *   - prefix      CSS 变量名前缀，如 'ant' → '--ant-color-primary'
 *   - ignore      跳过指定 key，不生成 CSS 变量
 *   - unitless    指定哪些数字类型的 key 不自动补 px（如 zIndex: 10 → '10' 而非 '10px'）
 *   - preserve    指定哪些 key 保留原始值，不替换为 var() 引用
 *   - scope       CSS 变量的作用域类名（见 serializeCSSVar）
 *   - hashCls / hashPriority  选择器相关配置
 *
 * @returns [转换后的 token 对象, CSS 变量声明字符串]
 *
 * @example
 * const [result, css] = transformToken(
 *   { colorPrimary: '#1677ff', fontSize: 14, zIndex: 100 },
 *   'abc123',
 *   { prefix: 'ant', unitless: { zIndex: true } }
 * )
 *
 * result
 * // {
 * //   colorPrimary: 'var(--ant-color-primary)',
 * //   fontSize:     'var(--ant-font-size)',
 * //   zIndex:       'var(--ant-z-index)',
 * // }
 *
 * css
 * // '.abc123{ --ant-color-primary:#1677ff; --ant-font-size:14px; --ant-z-index:100; }'
 */
export function transformToken<
  V,
  T extends Record<string, V> = Record<string, V>,
>(
  token: T,
  themeKey: string,
  config?: {
    hashCls?: string;
    hashPriority?: HashPriority;
    ignore?: {
      [key in keyof T]?: boolean;
    };
    prefix?: string;
    preserve?: {
      [key in keyof T]?: boolean;
    };
    scope?: string | string[];
    unitless?: {
      [key in keyof T]?: boolean;
    };
  },
): [TokenWithCSSVar<V, T>, string] {
  const {
    hashCls,
    hashPriority = 'low',
    prefix,
    unitless,
    ignore,
    preserve,
  } = config || {};
  const cssVars: Record<string, string> = {};
  const result: TokenWithCSSVar<V, T> = {};
  Object.entries(token).forEach(([key, value]) => {
    if (preserve?.[key]) {
      result[key as keyof T] = value;
    } else if (
      (typeof value === 'string' || typeof value === 'number') &&
      !ignore?.[key]
    ) {
      const cssVar = token2CSSVar(key, prefix);
      cssVars[cssVar] =
        typeof value === 'number' && !unitless?.[key]
          ? `${value}px`
          : String(value);
      result[key as keyof T] = `var(${cssVar})`;
    }
  });
  return [
    result,
    serializeCSSVar(cssVars, themeKey, {
      scope: config?.scope,
      hashCls,
      hashPriority,
    }),
  ];
}

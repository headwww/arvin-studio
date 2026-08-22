/**
 * @file Token 缓存 Hook，将设计 Token 转换为 CSS 变量并注入 DOM
 */

import type { Ref } from 'vue';

import type Theme from '../theme/Theme';
import type { Nonce } from '../util';
import type { ExtractStyle } from './useGlobalCache';

import { computed } from 'vue';

import { canUseDom, updateCSS } from '@arvin-studio/headless';

import { collectStyleText } from '../ssr/styleCollector';
import {
  ATTR_MARK,
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
  useStyleContext,
} from '../StyleContext';
import {
  flattenToken,
  injectCSPNonce,
  memoResult,
  token2key,
  toStyleStr,
} from '../util';
import { transformToken } from '../util/css-variables';
import hash from '../util/resolveHash';
import { useGlobalCache } from './useGlobalCache';

const EMPTY_OVERRIDE = {};

/**
 * hashId 的 CSS 类名前缀。
 * 生产环境用 `css` 短前缀，开发环境用 `css-dev-only-do-not-override` 长前缀，
 * 用于提醒开发者不要手动覆盖这类样式隔离类名。
 */
const hashPrefix =
  // @ts-expect-error fix this
  // eslint-disable-next-line n/prefer-global/process
  process.env.NODE_ENV === 'production'
    ? 'css'
    : 'css-dev-only-do-not-override';

export interface Option<DerivativeToken, DesignToken> {
  /**
   * CSS 变量配置。
   * @property hashed - 是否对 CSS 变量作用域选择器做 hash，用于样式隔离
   * @property ignore - 不转换为 CSS 变量的 token 属性
   * @property key - 当前主题的 key，也用作 style 标签的 data-token-hash，应全局唯一
   * @property prefix - CSS 变量前缀，如 `as` → `--as-color-primary`
   * @property preserve - 保留原始值不替换为 var() 引用的 token 属性
   * @property unitless - 值不自动加 px 单位的 token 属性
   */
  cssVar: {
    /** 是否对 CSS 变量作用域选择器做 hash */
    hashed?: boolean;
    /** 不转换为 CSS 变量的 token 属性 */
    ignore?: Record<string, boolean>;
    /** 当前主题的 key，需全局唯一，用于 style 标签的 data-token-hash */
    key: string;
    /** CSS 变量名前缀，如 `as` */
    prefix?: string;
    /** 保留原始值不替换为 var() 引用的 token 属性 */
    preserve?: Record<string, boolean>;
    /** 数字值不自动加 px 单位的 token 属性，如 zIndex、opacity、fontWeight */
    unitless?: Record<string, boolean>;
  };
  /**
   * token 格式化函数，可用于重命名、合并或删除 token 属性。
   * 函数引用应保持稳定（定义在模块作用域），否则每次渲染都会重新计算。
   */
  formatToken?: (mergedToken: any) => DerivativeToken;
  /**
   * 自定义计算最终 token 的逻辑。
   * 不传时默认先调 theme.getDerivativeToken() 再合并 overrideToken。
   * @param origin - 原始设计 token
   * @param override - 用户覆盖的 token
   * @param theme - 主题实例，可调 theme.getDerivativeToken() 派生 token
   */
  getComputedToken?: (
    origin: DesignToken,
    override: object,
    theme: Theme<any, any>,
  ) => DerivativeToken;

  /** CSP nonce，用于动态创建的 style 标签 */
  nonce?: Nonce;

  /** 用户覆盖的 token 对象，优先级最高，会覆盖派生 token */
  override?: object;
  /**
   * 版本盐值，用于生成 hashId。
   * 即使派生 token 完全相同，不同 salt 也会产生不同的 hashId，
   * 从而隔离不同版本的样式缓存。
   */
  salt?: string;
}

/**
 * 全局 token key 引用计数表。
 * key → 引用次数，用于追踪哪些 token key 还有组件在使用。
 */
const tokenKeys = new Map<string, number>();

/**
 * 递增 token key 的引用计数。
 * 每调用一次 useCacheToken 就 +1，表示多一个组件在使用该 token key。
 */
function recordCleanToken(tokenKey: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) + 1);
}

/**
 * 从 DOM 中移除指定 token key 对应的 style 标签。
 * 只删除属于当前 cssinjs 实例的 style 标签，避免误删其他应用实例的样式。
 */
function removeStyleTags(key: string, instanceId: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const styles = document.querySelectorAll(
    `style[${CSS.escape(ATTR_TOKEN)}="${CSS.escape(key)}"]`,
  );
  styles.forEach((style) => {
    if ((style as any)[CSS_IN_JS_INSTANCE] === instanceId) {
      style.remove();
    }
  });
}

/** 批量清理阈值：引用计数归零的 key 数量超过此值时，触发实际 DOM 清理 */
const TOKEN_THRESHOLD = -1;

/**
 * 递减 token key 的引用计数，并在满足阈值时批量清理归零的 DOM。
 *
 * 设计为批量清理而非立即清理，是为了避免频繁的 DOM 操作：
 * 多个组件同时卸载时，等引用计数都归零后一次性删除 style 标签。
 */
function cleanTokenStyle(tokenKey: string, instanceId: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) - 1);

  const cleanableKeyList = new Set<string>();
  tokenKeys.forEach((value, key) => {
    if (value <= 0) {
      cleanableKeyList.add(key);
    }
  });

  if (tokenKeys.size - cleanableKeyList.size > TOKEN_THRESHOLD) {
    cleanableKeyList.forEach((key) => {
      removeStyleTags(key, instanceId);
      tokenKeys.delete(key);
    });
  }
}

/**
 * 计算最终 token。
 *
 * 流程：originToken → theme.getDerivativeToken() → 合并 overrideToken → 可选 format。
 *
 * @param originToken - 原始设计 token
 * @param overrideToken - 用户覆盖的 token
 * @param theme - 主题实例
 * @param format - 可选的格式化函数
 */
export function getComputedToken<
  DerivativeToken = object,
  DesignToken = DerivativeToken,
>(
  originToken: DesignToken,
  overrideToken: object,
  theme: Theme<any, any>,
  format?: (token: DesignToken) => DerivativeToken,
) {
  const derivativeToken = theme.getDerivativeToken(originToken);

  // 合并派生 token 与用户覆盖
  let mergedDerivativeToken = {
    ...derivativeToken,
    ...overrideToken,
  };

  if (format) {
    mergedDerivativeToken = format(mergedDerivativeToken);
  }

  return mergedDerivativeToken;
}

/** useGlobalCache 的 prefix，标识 token 轨道 */
export const TOKEN_PREFIX = 'token';

/**
 * Token 缓存条目结构。
 * [token(var()引用), hashId, realToken(真实值), cssVarStr(CSS变量声明), cssVarKey(主题key)]
 */
type TokenCacheValue<DerivativeToken> = [
  token: DerivativeToken,
  hashId: string,
  realToken: DerivativeToken,
  cssVarStr: string,
  cssVarKey: string,
];

/**
 * Token 轨道的 SSR 提取函数。
 * 将 token 缓存条目序列化为 style HTML 字符串。
 */
export const extract: ExtractStyle<TokenCacheValue<any>> = (
  cache,
  _effectStyles,
  options,
) => {
  // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
  const [, , realToken, styleStr, cssVarKey] = cache;
  const { plain } = options || {};

  if (!styleStr) {
    return null;
  }

  const styleId = realToken._tokenKey;
  const order = -999;

  const sharedAttrs = {
    'data-headless-order': 'prependQueue',
    'data-headless-priority': `${order}`,
  };

  const styleText = toStyleStr(
    styleStr,
    cssVarKey,
    styleId,
    sharedAttrs,
    plain,
  );

  return [order, styleId, styleText];
};

/**
 * Token 缓存 Hook，管理设计 Token 到 CSS 变量的完整生命周期。
 *
 * 这是三个缓存轨道的 Token 轨道，负责：
 * 1. 将设计 Token 通过 Theme 派生为 AliasToken
 * 2. 合并用户覆盖的 token
 * 3. 通过 transformToken 将 token 值替换为 CSS 变量引用（var()）
 * 4. 将 CSS 变量声明注入 DOM
 *
 * 缓存的 key 由 salt + themeId + tokenStr + overrideStr + cssVarStr 组成，
 * 任意一项变化都会触发缓存重新计算。
 *
 * @param theme - 主题实例，包含派生函数链
 * @param tokens - Token 参数数组，支持函数（延迟求值）和对象两种形式
 * @param option - 配置项（CSS 变量、salt、override、formatToken 等）
 * @returns useGlobalCache 的返回值，即缓存的 TokenCacheValue
 */
export default function useCacheToken<
  DerivativeToken = Record<string, any>,
  DesignToken = DerivativeToken,
>(
  theme: Ref<Theme<any, any>>,
  tokens: Ref<((() => Partial<DesignToken>) | Partial<DesignToken>)[]>,
  option: Ref<Option<DerivativeToken, DesignToken>>,
) {
  const styleContext = useStyleContext();

  const salt = computed(() => option.value.salt ?? '');
  const override = computed(() => option.value.override ?? EMPTY_OVERRIDE);
  const formatToken = computed(() => option.value.formatToken);
  const compute = computed(() => option.value.getComputedToken);
  const cssVar = computed(() => option.value.cssVar);
  const nonce = computed(() => option.value.nonce);

  // tokens 中的函数项延迟求值（函数在 computed 被访问时才执行）
  const resolvedTokens = computed(() =>
    tokens.value.map((token) =>
      typeof token === 'function' ? token() : token,
    ),
  );

  // memoResult: 仅在 resolvedTokens 中对象引用变化时重新计算
  const mergedToken = computed(() =>
    memoResult(
      () => Object.assign({}, ...resolvedTokens.value),
      resolvedTokens.value,
    ),
  );

  // flattenToken: 将 token 对象递归展平为字符串后哈希，避免缓存 key 过长
  const tokenStr = computed(() => flattenToken(mergedToken.value));
  const overrideTokenStr = computed(() => flattenToken(override.value));
  const cssVarStr = computed(() => flattenToken(cssVar.value));

  return useGlobalCache<TokenCacheValue<DerivativeToken>>(
    computed(() => TOKEN_PREFIX),
    // 缓存 key 路径：salt + themeId + token内容 + override内容 + cssVar配置
    computed(() => [
      salt.value,
      theme.value.id,
      tokenStr.value,
      overrideTokenStr.value,
      cssVarStr.value,
    ]),

    // ── cacheFn: 缓存未命中时创建缓存值 ──
    () => {
      const mergedDerivativeToken = compute.value
        ? compute.value(
            mergedToken.value as DesignToken,
            override.value,
            theme.value,
          )
        : getComputedToken(
            mergedToken.value as DesignToken,
            override.value,
            theme.value,
            formatToken.value,
          );

      const actualToken = { ...mergedDerivativeToken };
      // salt + prefix 组合作为 hash 输入，prefix 变化也会改变 hashId
      const mergedSalt = `${salt.value}_${cssVar.value.prefix || ''}`;
      const hashId = hash(mergedSalt);
      const hashCls = `${hashPrefix}-${hashId}`;
      // _tokenKey 标记 token 身份，token 变化时 key 跟着变，触发 useStyleRegister 更新
      actualToken._tokenKey = token2key(actualToken, mergedSalt);

      // transformToken: 将 token 值替换为 var() 引用 + 生成 CSS 变量声明字符串
      const [tokenWithCssVar, cssVarsStr] = transformToken(
        mergedDerivativeToken,
        cssVar.value.key,
        {
          prefix: cssVar.value.prefix,
          ignore: cssVar.value.ignore,
          unitless: cssVar.value.unitless,
          preserve: cssVar.value.preserve,
          hashPriority: styleContext.value.hashPriority,
          hashCls: cssVar.value.hashed ? hashCls : undefined,
        },
      ) as [any, string];
      tokenWithCssVar._hashId = hashId;

      // 递增 token key 引用计数
      recordCleanToken(cssVar.value.key);

      return [
        tokenWithCssVar,
        hashCls,
        actualToken,
        cssVarsStr,
        cssVar.value.key,
      ];
    },

    // ── onCacheRemove: 缓存删除时清理 ──
    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    ([, , , , themeKey]) => {
      cleanTokenStyle(themeKey, styleContext.value.cache.instanceId);
    },

    // ── onCacheEffect: 缓存激活时注入 CSS 变量到 DOM ──
    (cacheValue) => {
      // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
      const [, , , cssVarsStr, themeKey] = cacheValue;

      // SSR 环境：收集样式文本，不注入 DOM
      if (!canUseDom()) {
        const extracted = extract(cacheValue, {}, { plain: false });
        if (extracted) {
          const styleText = extracted[2];
          collectStyleText(styleText);
        }
        return;
      }

      if (!cssVarsStr) {
        return;
      }

      let mergedCSSConfig: Parameters<typeof updateCSS>[2] = {
        mark: ATTR_MARK,
        prepend: 'queue',
        attachTo: styleContext.value.container,
        priority: -999,
      };

      mergedCSSConfig = injectCSPNonce(mergedCSSConfig, nonce.value);

      const style = updateCSS(
        cssVarsStr,
        hash(`css-var-${themeKey}`),
        mergedCSSConfig,
      );

      // 标记 style 元素归属，避免不同 cssinjs 实例重复处理
      (style as any)[CSS_IN_JS_INSTANCE] = styleContext.value.cache.instanceId;
      // 用 ATTR_TOKEN 标记，cleanTokenStyle 通过此属性查找和批量删除
      style.setAttribute(ATTR_TOKEN, themeKey);
    },
  );
}

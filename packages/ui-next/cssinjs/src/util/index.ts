import type { HashPriority } from '../StyleContext';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  通用工具函数
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 这个文件提供了 cssinjs 内部广泛使用的工具函数，按功能分为 4 组：
 *   1. Token 工具：flattenToken、token2key
 *   2. CSS 字符串工具：unit、where、toStyleStr、hash
 *   3. 浏览器特性检测：supportWhere、supportLayer、supportLogicProps
 *   4. 辅助函数：memoResult、isClientSide、injectCSPNonce 等
 */
import { canUseDom, removeCSS, updateCSS } from '@arvin-studio/headless';

import { ATTR_MARK, ATTR_TOKEN } from '../StyleContext';
import { Theme } from '../theme';
import hash from '../util/resolveHash';

export { token2CSSVar } from './css-variables';

// ═══════════════════════════════════════════════════════════════════════════════
//  memoResult — 基于 WeakMap 的依赖记忆化
// ═══════════════════════════════════════════════════════════════════════════════

type NestWeakMap<T> = WeakMap<object, NestWeakMap<T> | T>;
const resultCache: NestWeakMap<object> = new WeakMap();
const RESULT_VALUE = {};

/**
 * 记忆化函数：当 deps 数组中每个对象的引用都相同时，返回缓存值，否则重新计算。
 *
 * 原理：用嵌套的 WeakMap 构建 dep 链，每个 dep 对象作为一级 key。
 * deps 中所有对象引用都未变 → 命中缓存，不执行 callback。
 *
 * 选择 WeakMap 的好处：dep 对象被垃圾回收时，对应的缓存也会自动清除，无内存泄漏。
 *
 * @param callback - 计算结果的回调，只在缓存未命中时执行
 * @param deps - 依赖对象数组，按 === 引用比较
 * @returns 缓存或新计算的结果
 */
export function memoResult<T extends object, R>(
  callback: () => R,
  deps: T[],
): R {
  let current: WeakMap<any, any> = resultCache;
  for (const dep of deps) {
    if (!current.has(dep)) {
      current.set(dep, new WeakMap());
    }
    current = current.get(dep)!;
  }

  if (!current.has(RESULT_VALUE)) {
    current.set(RESULT_VALUE, callback());
  }

  return current.get(RESULT_VALUE);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Token 工具
// ═══════════════════════════════════════════════════════════════════════════════

const flattenTokenCache = new WeakMap<any, string>();

/**
 * 将 token 对象递归展平为字符串，然后哈希。
 *
 * 为什么需要哈希？
 *   全量 token 对象很大（200+ 个属性），直接拼接成缓存 key 会非常长。
 *   哈希后统一变成固定长度的短字符串，用于缓存 key 的组成部分。
 *
 * 结果缓存在 WeakMap 中，token 对象引用不变时直接返回缓存。
 *
 * @example
 *   flattenToken({ colorPrimary: '#1677ff', fontSize: 14 })
 *   → hash("colorPrimary#1677fffontSize14") → "a3f2c"
 */
export function flattenToken(token: any) {
  let str = flattenTokenCache.get(token) || '';

  if (!str) {
    Object.keys(token).forEach((key) => {
      const value = token[key];
      str += key;
      if (value instanceof Theme) {
        str += value.id; // Theme 对象用唯一 id 代表
      } else if (value && typeof value === 'object') {
        str += flattenToken(value); // 递归展平嵌套对象
      } else {
        str += value; // 原始值直接拼接
      }
    });

    // 哈希避免缓存 key 过长
    str = hash(str);

    flattenTokenCache.set(token, str);
  }
  return str;
}

/**
 * 将 token 转为唯一的 key 字符串。
 * 用于 useCacheToken 中标记 token 身份，当 token 变化时 key 也跟着变。
 *
 * @param token - 设计令牌对象
 * @param salt - 盐值（版本号 + 前缀），确保不同应用版本的 key 不同
 */
export function token2key(token: any, salt: string): string {
  return hash(`${salt}_${flattenToken(token)}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  浏览器 CSS 特性检测
// ═══════════════════════════════════════════════════════════════════════════════

const randomSelectorKey = `random-${Date.now()}-${Math.random()}`.replaceAll(
  '.',
  '',
);
const checkContent = '_bAmBoO_';

/**
 * 通用的 CSS 特性检测函数。
 *
 * 原理：向 DOM 注入一段测试 CSS（含 content: "_bAmBoO_!important"），
 * 创建一个 div 应用该样式，再用 getComputedStyle 读取 content 是否匹配。
 * 如果匹配，说明浏览器支持该 CSS 语法。
 *
 * 每次检测完立即清理注入的 style 和 div，不留痕迹。
 */
function supportSelector(
  styleStr: string,
  handleElement: (ele: HTMLElement) => void,
  supportCheck?: (ele: HTMLElement) => boolean,
): boolean {
  if (canUseDom()) {
    updateCSS(styleStr, randomSelectorKey);

    const ele = document.createElement('div');
    ele.style.position = 'fixed';
    ele.style.left = '0';
    ele.style.top = '0';
    handleElement?.(ele);
    document.body.append(ele);

    // TODO 开发环境加醒目样式方便调试
    // if (process.env.NODE_ENV !== 'production') {
    //   ele.innerHTML = 'Test';
    //   ele.style.zIndex = '9999999';
    // }

    const support = supportCheck
      ? supportCheck(ele)
      : getComputedStyle(ele).content?.includes(checkContent);

    ele.remove();
    removeCSS(randomSelectorKey);

    return support;
  }

  return false;
}

let canLayer: boolean | undefined;
/** 检测浏览器是否支持 @layer 语法（结果缓存，只测一次） */
export function supportLayer(): boolean {
  if (canLayer === undefined) {
    canLayer = supportSelector(
      `@layer ${randomSelectorKey} { .${randomSelectorKey} { content: "${checkContent}"!important; } }`,
      (ele) => {
        ele.className = randomSelectorKey;
      },
    );
  }
  return canLayer!;
}

let canWhere: boolean | undefined;
/** 检测浏览器是否支持 :where() 选择器（结果缓存，只测一次） */
export function supportWhere(): boolean {
  if (canWhere === undefined) {
    canWhere = supportSelector(
      `:where(.${randomSelectorKey}) { content: "${checkContent}"!important; }`,
      (ele) => {
        ele.className = randomSelectorKey;
      },
    );
  }
  return canWhere!;
}

let canLogic: boolean | undefined;
/**
 * 检测浏览器是否支持 CSS 逻辑属性（如 inset-block）。
 * 与上面两个不同，用 getComputedStyle(ele).bottom === '93px' 判断，
 * 因为逻辑属性会被浏览器转换为物理属性。
 */
export function supportLogicProps(): boolean {
  if (canLogic === undefined) {
    canLogic = supportSelector(
      `.${randomSelectorKey} { inset-block: 93px !important; }`,
      (ele) => {
        ele.className = randomSelectorKey;
      },
      (ele) => getComputedStyle(ele).bottom === '93px',
    );
  }
  return canLogic!;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CSS 字符串 / 值工具
// ═══════════════════════════════════════════════════════════════════════════════

/** 是否在浏览器环境（非 SSR） */
export const isClientSide = canUseDom();

/** 判断值是否为合法的数字（排除 NaN） */
export function isNumber(val: any): val is number {
  return typeof val === 'number' && !Number.isNaN(val);
}

/**
 * 数字 → px 字符串。
 * 如果已经是字符串则原样返回。
 *
 * @example unit(16) → "16px"、unit("1em") → "1em"
 */
export function unit(num: number | string) {
  if (isNumber(num)) {
    return `${num}px`;
  }
  return num;
}

/**
 * 将 CSS 文本序列化为 <style> HTML 标签字符串（用于 SSR）。
 *
 * @param style - CSS 文本内容
 * @param tokenKey - data-token-hash 属性值
 * @param styleId - data-css-hash 属性值
 * @param customizeAttrs - 自定义额外属性
 * @param plain - true 则直接返回 CSS 文本，不包装 <style> 标签
 *
 * @example
 *   toStyleStr('.box{color:red}', 'token-1', 'abc123', {}, false)
 *   → '<style data-token-hash="token-1" data-css-hash="abc123">.box{color:red}</style>'
 */
export function toStyleStr(
  style: string,
  tokenKey?: string,
  styleId?: string,
  customizeAttrs: Record<string, string> = {},
  plain = false,
) {
  if (plain) {
    return style;
  }
  const attrs: Record<string, string | undefined> = {
    ...customizeAttrs,
    [ATTR_TOKEN]: tokenKey,
    [ATTR_MARK]: styleId,
  };

  const attrStr = Object.entries(attrs)
    .map(([attr, value]) => {
      const val = value;
      return val ? `${attr}="${val}"` : null;
    })
    .filter(Boolean)
    .join(' ');

  return `<style ${attrStr}>${style}</style>`;
}

/**
 * 根据 hashPriority 生成 hashId 选择器。
 *
 * @param hashPriority - 'low'  → :where(.hashCls) 降低特异性，方便用户覆盖
 *                       'high' → .hashCls 普通优先级
 *
 * @example
 *   where({ hashCls: 'css-abc', hashPriority: 'low' })  → ":where(.css-abc)"
 *   where({ hashCls: 'css-abc', hashPriority: 'high' }) → ".css-abc"
 */
export function where(options?: {
  hashCls?: string;
  hashPriority?: HashPriority;
}) {
  const { hashCls, hashPriority = 'low' } = options || {};
  if (!hashCls) {
    return '';
  }
  const hashSelector = `.${hashCls}`;
  return hashPriority === 'low' ? `:where(${hashSelector})` : hashSelector;
}

/** 类型守卫：排除 null 和 undefined */
export function isNonNullable<T>(val: T): val is NonNullable<T> {
  return val !== undefined && val !== null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CSP 支持
// ═══════════════════════════════════════════════════════════════════════════════

export type Nonce = (() => string) | string;

/**
 * 将 CSP nonce 注入到 updateCSS / removeCSS 的配置对象中。
 * 启用 CSP 时，动态创建的 <style> 标签需要 nonce 属性才能被浏览器执行。
 *
 * @param config - updateCSS 的配置对象
 * @param nonce - nonce 字符串或返回 nonce 的函数
 */
export function injectCSPNonce<T extends { csp?: { nonce?: string } }>(
  config: T,
  nonce: Nonce | undefined,
): T {
  const nonceStr = typeof nonce === 'function' ? nonce() : nonce;

  if (nonceStr) {
    return {
      ...config,
      csp: {
        ...config.csp,
        nonce: nonceStr,
      },
    };
  }

  return config;
}

export { hash };

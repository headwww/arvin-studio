/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  useStyleRegister — 组件样式的生成与注入 Hook
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 这是 cssinjs 最核心的文件，完成了 "CSSObject → CSS 字符串 → DOM <style> 标签" 的完整转换。
 *
 * 整个文件分为两大部分：
 *   Parser（parseStyle + normalizeStyle） — 纯函数，JS 对象转 CSS 字符串
 *   Register（useStyleRegister）         — Vue Hook，对接缓存和 DOM 注入
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Parser：CSSObject → CSS 字符串（纯函数，无副作用）
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   parseStyle()     — 将嵌套的 JS 对象转为巢状 CSS 字符串
 *     ├─ 展平数组
 *     ├─ 注入 hashId（.box → .box.css-abc123）
 *     ├─ 驼峰 → 连字符（backgroundColor → background-color）
 *     ├─ 数值自动加 px（fontSize: 14 → 14px）
 *     └─ Keyframes 提取到 effectStyle
 *
 *   normalizeStyle() — stylis 序列化，将巢状 CSS 编译为扁平 CSS
 *     ├─ compile() → 解析
 *     ├─ prefixer() → 自动浏览器前缀（可选）
 *     └─ stringify() → 扁平化输出
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Register：Vue Hook，对接 useGlobalCache 和 DOM 注入
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   useStyleRegister() — 组件样式 Hook
 *     ├─ 构建 fullPath（缓存 key）
 *     ├─ cacheFn：计算 styleStr + styleId
 *     ├─ onCacheRemove：removeCSS 从 DOM 移除
 *     └─ onCacheEffect：updateCSS 注入到 DOM
 */
import type * as CSS from 'csstype';

import type { Ref } from 'vue';

import type Keyframes from '../Keyframes';
import type { Linter } from '../linters';
import type { HashPriority } from '../StyleContext';
import type Theme from '../theme/Theme';
import type { Transformer } from '../transformers/interface.ts';
import type { Nonce } from '../util';
import type { ExtractStyle } from './useGlobalCache';

import { computed } from 'vue';

import { removeCSS, updateCSS } from '@arvin-studio/headless';

import { compile, middleware, prefixer, serialize, stringify } from 'stylis';

import { contentQuotesLinter, hashedAnimationLinter } from '../linters';
import {
  ATTR_CACHE_PATH,
  ATTR_MARK,
  CSS_IN_JS_INSTANCE,
  useStyleContext,
} from '../StyleContext';
import {
  injectCSPNonce,
  isClientSide,
  isNonNullable,
  toStyleStr,
  where,
} from '../util';
import {
  CSS_FILE_STYLE,
  existPath,
  getStyleAndHash,
} from '../util/cacheMapUtil';
import hash from '../util/resolveHash';
import unitless from '../util/resolveUnitless';
import { useGlobalCache } from './useGlobalCache';

// @ts-expect-error // FIXME:
// eslint-disable-next-line n/prefer-global/process
const isDev = process.env.NODE_ENV !== 'production';

/**
 * 标记对象：用于支持 compound CSS 属性。
 * 如果值对象上存在这个属性，parseStyle 会跳过类型检查，直接信任用户传的值。
 * 用于一些 CSS-in-JS 特有的属性（如 animationName 可以是 Keyframes 对象）。
 */
const SKIP_CHECK = '_skip_check_';

/**
 * 标记对象：一个属性需要生成多条 CSS 声明。
 * 例如 background 属性同时需要 background-color 和 background-image 时，
 * 用 MULTI_VALUE 包裹两个值，生成两条独立的 CSS 声明。
 */
const MULTI_VALUE = '_multi_value_';

/** @layer 配置 */
export interface LayerConfig {
  dependencies?: string[];
  name: string;
}

/** CSS 属性类型扩展：允许 animationName 为 Keyframes 对象 */
export type CSSProperties = Omit<
  CSS.PropertiesFallback<number | string>,
  'animationName'
> & {
  animationName?:
    | CSS.PropertiesFallback<number | string>['animationName']
    | Keyframes;
};

/** 支持多值/跳过检查的 CSS 属性类型 */
export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]:
    | CSSProperties[K]
    | readonly Extract<CSSProperties[K], string>[]
    | {
        [MULTI_VALUE]?: boolean;
        [SKIP_CHECK]?: boolean;
        value: CSSProperties[K] | CSSProperties[K][];
      };
};

/** CSS 伪类和伪元素 */
export type CSSPseudos = { [K in CSS.Pseudos]?: CSSObject };

type ArrayCSSInterpolation = readonly CSSInterpolation[];

/** CSSInterpolation 的基本单元：null/undefined/boolean/数字/字符串/CSSObject */
export type InterpolationPrimitive =
  | boolean
  | CSSObject
  | null
  | number
  | string
  | undefined;

/** CSSInterpolation：单个值 或 数组 或 Keyframes */
export type CSSInterpolation =
  | ArrayCSSInterpolation
  | InterpolationPrimitive
  | Keyframes;

/** 自由键值对：用于 CSS 自定义属性（--custom-prop）等 */
export type CSSOthersObject = Record<string, CSSInterpolation>;

/** CSSObject：属性 + 伪类 + 自由键值对 */
export interface CSSObject
  extends CSSOthersObject, CSSPropertiesWithMultiValues, CSSPseudos {}

// ============================================================================
// ==                                 Parser                                 ==
// ============================================================================

/**
 * 将巢状 CSS 字符串（parseStyle 的输出）编译为浏览器可直接使用的扁平 CSS。
 *
 * 通过 stylis 的三步流水线：
 *   compile()  → 解析巢状 CSS 字符串为 AST
 *   prefixer() → 自动添加浏览器前缀（-webkit-、-ms- 等），可选
 *   stringify() → AST → 扁平化 CSS 字符串
 *
 * stylis 处理的是整段 CSS，能将嵌套选择器展平：
 *   ".box{color:red; &:hover{color:blue}}"  →  ".box{color:red;}\n.box:hover{color:blue;}"
 *
 * @param styleStr - parseStyle 输出的巢状 CSS 字符串（包含 { 嵌套 } 语法）
 * @param autoPrefix - 是否启用 stylis prefixer 中间件
 */
export function normalizeStyle(styleStr: string, autoPrefix: boolean) {
  // eslint-disable-next-line unicorn/prefer-minimal-ternary
  const serialized = autoPrefix
    ? serialize(compile(styleStr), middleware([prefixer, stringify]))
    : serialize(compile(styleStr), stringify);
  // stylis 内部用 {%%%:...} 标记占位符，最后清理掉
  return serialized.replaceAll(/\{%%%:[^;];\}/g, ';');
}

/** 判断值的类型是否为 compound CSS 属性（用 SKIP_CHECK / MULTI_VALUE 标记过的） */
function isCompoundCSSProperty(value: CSSObject[string]) {
  return (
    typeof value === 'object' &&
    value &&
    (SKIP_CHECK in value || MULTI_VALUE in value)
  );
}

/**
 * 将 hashId 注入到选择器中，实现样式隔离。
 *
 * 规则：
 *   - 多选择器用逗号分隔，逐个处理
 *   - 选择器第一个词是 HTML 元素（如 h1、div）→ hash 插在元素名后面
 *   - 选择器第一个词是类/id/属性 → hash 插在最前面
 *
 * @param key - 原始选择器（如 ".as-btn" 或 "h1.class"）
 * @param hashId - hash 类名（如 "css-abc123"）
 * @param hashPriority - 决定用 :where(.css-abc123) 还是 .css-abc123
 *
 * @example
 *   injectSelectorHash('.as-btn', 'css-abc', 'low')
 *   → ":where(.css-abc).as-btn"
 *
 *   injectSelectorHash('h1.title', 'css-abc', 'high')
 *   → "h1.css-abc.title"
 */
function injectSelectorHash(
  key: string,
  hashId: string,
  hashPriority: HashPriority = 'high',
) {
  if (!hashId) {
    return key;
  }

  const hashSelector = where({ hashCls: hashId, hashPriority });

  // 拆分多选择器(.a, .b)，逐个处理
  const keys = key.split(',').map((k) => {
    const fullPath = k.trim().split(/\s+/);

    // 第一个词是 HTML 元素 → 插在元素名后面；否则 → 插在最前面
    let firstPath = fullPath[0] || '';
    const htmlElement = firstPath.match(/^\w+/)?.[0] || '';

    firstPath = `${htmlElement}${hashSelector}${firstPath.slice(
      htmlElement.length,
    )}`;

    return [firstPath, ...fullPath.slice(1)].join(' ');
  });
  return keys.join(',');
}

/** parseStyle 的配置参数 */
export interface ParseConfig {
  /** 样式隔离的 hash 类名（如 "css-abc123"），通过 `injectSelectorHash` 注入到每个根级选择器中 */
  hashId?: string;
  /** 优先级策略：'low' → :where(.hashId) 降低特异性，方便用户覆盖；'high' → .hashId 普通优先级 */
  hashPriority?: HashPriority;
  /** @layer 配置：name 为层名，dependencies 为依赖的其他层，用于控制样式层级顺序 */
  layer?: LayerConfig;
  /** 开发环境的 CSS 代码检查器数组，在 `appendStyle` 中对每个 CSS 属性值执行检查 */
  linters?: Linter[];
  /** 缓存路径字符串（如 "Button-as-btn-asicon"），传给 linter 用于错误定位 */
  path?: string;
  /** CSS 对象预处理器数组（如 px2rem、legacyLogicalProperties），在遍历 key 之前对 CSSObject 执行 `visit()` */
  transformers?: Transformer[];
}

/** parseStyle 的内部递归状态（首次调用无需传入） */
export interface ParseInfo {
  injectHash?: boolean;
  parentSelectors: string[];
  root?: boolean;
}

/**
 * 将 CSS-in-JS 对象转换为 CSS 字符串。
 *
 * 这是整个样式系统的核心转换函数，完成以下转换：
 *
 *   CSSObject（JS 对象）  ──→  CSS 字符串 + effectStyle（keyframes/@layer）
 *
 * 具体处理流程：
 *   1. 展平嵌套数组（flattenList）
 *   2. 遍历每个 style 对象，对每个 key-value：
 *      a. 如果 value 是对象（嵌套选择器/@media/@keyframes）→ 递归调用 parseStyle
 *      b. 如果是叶子值 → appendStyle() 做属性转换
 *   3. appendStyle() 内部：
 *      - 开发模式运行 linter 检查
 *      - 驼峰属性 → 连字符（backgroundColor → background-color）
 *      - 数值自动加 px（fontSize: 14 → 14px），unitless 属性和 0 除外
 *      - animationName 如果是 Keyframes 对象 → 提取到 effectStyle
 *   4. 选择器处理：
 *      - 根级选择器注入 hashId（.box → .box.css-abc123）
 *      - @media/@keyframes/@layer 不注入 hashId，传递给子选择器
 *      - & 替换为 hashId 选择器本身
 *   5. 根层包裹 @layer（如果配置了 layer）
 *
 * @param interpolation - 输入的 CSS-in-JS 对象（或数组），即 styleFn 的返回值
 * @param config - 解析配置（hashId、hashPriority、layer、transformers、linters 等）
 * @param root/injectHash/parentSelectors - 内部递归状态，首次调用无需传入
 * @returns [styleStr, effectStyle]
 *   - styleStr: 主样式字符串（还未经过 stylis 序列化，仍是 { 嵌套 } 形式）
 *   - effectStyle: 需要全局唯一的样式（Keyframes 动画、@layer 声明），
 *     会被提取出来单独注入，避免重复定义导致浏览器闪烁
 */
export function parseStyle(
  interpolation: CSSInterpolation,
  config: ParseConfig = {},
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  { root, injectHash, parentSelectors }: ParseInfo = {
    root: true,
    parentSelectors: [],
  },
): [parsedStr: string, effectStyle: Record<string, string>] {
  const {
    hashId,
    layer,
    path,
    hashPriority,
    transformers = [],
    linters = [],
  } = config;
  let styleStr = '';
  let effectStyle: Record<string, string> = {};

  /**
   * 处理 Keyframes 对象：将其内部的 CSSObject 递归解析为 CSS 字符串，
   * 包装为 `@keyframes <name>-<hashId> {...}` 存入 effectStyle（去重）。
   * Keyframes 必须放到 effectStyle 而非主 styleStr，因为同一个动画名
   * 在多个地方使用时，浏览器端重复定义 @keyframes 会导致闪烁。
   */
  function parseKeyframes(keyframes: Keyframes) {
    const animationName = keyframes.getName(hashId);
    if (!effectStyle[animationName]) {
      const [parsedStr] = parseStyle(keyframes.style, config, {
        root: false,
        parentSelectors,
      });

      effectStyle[animationName] = `@keyframes ${keyframes.getName(
        hashId,
      )}${parsedStr}`;
    }
  }

  /**
   * 递归展平嵌套数组。CSSInterpolation 支持 `CSSObject[]` 嵌套，
   * 比如 `[{ color: 'red' }, [{ fontSize: 14 }]]`，需要展平为一层。
   */
  function flattenList(
    list: ArrayCSSInterpolation,
    fullList: CSSObject[] = [],
  ) {
    list.forEach((item) => {
      if (Array.isArray(item)) {
        flattenList(item, fullList);
      } else if (item) {
        // 过滤掉 null/undefined/boolean/falsy 值
        fullList.push(item as CSSObject);
      }
    });

    return fullList;
  }

  // 展平顶层的数组结构
  const flattenStyleList = flattenList(
    Array.isArray(interpolation) ? interpolation : [interpolation],
  );

  // 遍历展平后的每个 CSSObject（一个 CSSObject 通常对应一个 componentCls 根样式块）
  flattenStyleList.forEach((originStyle) => {
    // 字符串只在根层级有效（raw CSS 直接拼接），嵌套层级忽略字符串
    const style: CSSObject =
      typeof originStyle === 'string' && !root ? {} : originStyle;

    if (typeof style === 'string') {
      // 根层级的字符串直接追加到 styleStr（例如整个 `@import` 或 `@font-face`）
      styleStr += `${style}\n`;
    } else if ((style as any)._keyframe) {
      // Keyframes 对象：提取到 effectStyle，不放入主样式流
      parseKeyframes(style as unknown as Keyframes);
    } else {
      // 运行所有 transformer 的 visit 方法（如 px2rem、legacyLogicalProperties）
      const mergedStyle = transformers.reduce(
        (prev, trans) => trans?.visit?.(prev) || prev,
        style,
      );

      // 遍历 CSSObject 的每个 key
      Object.keys(mergedStyle).forEach((key) => {
        const value = mergedStyle[key];

        // ============================================================
        // 分支 1：value 是对象 → 嵌套选择器（如 '&:hover'、'.child'、'@media'）
        // ============================================================
        if (
          typeof value === 'object' &&
          value &&
          (key !== 'animationName' || !(value as Keyframes)._keyframe) &&
          !isCompoundCSSProperty(value)
        ) {
          let subInjectHash = false;

          let mergedKey = key.trim();
          // 是否将子级视为新的根层级（用于 &/'' 没有 hashId 的特殊场景）
          let nextRoot = false;

          // ---------- 注入 hashId ----------
          if ((root || injectHash) && hashId) {
            if (mergedKey.startsWith('@')) {
              // @media / @supports / @keyframes 本身不加 hashId，
              // 把 injectHash 标记传递给子级，让子选择器自己加
              subInjectHash = true;
            } else if (mergedKey === '&') {
              // `.as-btn` + `&` → `.as-btn.css-abc123`
              mergedKey = injectSelectorHash('', hashId, hashPriority);
            } else {
              // `.child` → `.as-btn.css-abc123 .child`
              mergedKey = injectSelectorHash(key, hashId, hashPriority);
            }
          } else if (
            root &&
            !hashId &&
            (mergedKey === '&' || mergedKey === '')
          ) {
            // 没有 hashId 时，`{ '&': { color: 'red' } }` 会生成 `&{color:red;}`，
            // stylis 无法正确解析。所以抹掉父选择器 key，
            // 把子级提升为 root 直接解析
            mergedKey = '';
            nextRoot = true;
          }

          // 递归解析嵌套的 CSSObject
          const [parsedStr, childEffectStyle] = parseStyle(
            value as any,
            config,
            {
              root: nextRoot,
              injectHash: subInjectHash,
              parentSelectors: [...parentSelectors, mergedKey],
            },
          );

          // 合并子级的 effectStyle（keyframes 等）
          effectStyle = {
            ...effectStyle,
            ...childEffectStyle,
          };

          // 拼接：选择器{子级样式内容}
          styleStr += `${mergedKey}${parsedStr}`;
        }
        // ============================================================
        // 分支 2：value 是叶子值 → 属性声明（如 color: 'red'、fontSize: 14）
        // ============================================================
        else {
          function appendStyle(cssKey: string, cssValue: any) {
            // 开发环境下运行 linter 检查（content 引号、NaN、逻辑属性等）
            if (
              // @ts-expect-error this is a valid check
              // eslint-disable-next-line n/prefer-global/process
              process.env.NODE_ENV !== 'production' &&
              (typeof value !== 'object' || !(value as any)?.[SKIP_CHECK])
            ) {
              [contentQuotesLinter, hashedAnimationLinter, ...linters].forEach(
                (linter) =>
                  linter(cssKey, cssValue, { path, hashId, parentSelectors }),
              );
            }

            // 驼峰 → 连字符：backgroundColor → background-color
            const styleName = cssKey.replaceAll(
              /[A-Z]/g,
              (match) => `-${match.toLowerCase()}`,
            );

            // 数值自动加 px（unitless 属性如 opacity/lineHeight/fontWeight 不加，0 也不加）
            let formatValue = cssValue;
            if (
              !(unitless as any)[cssKey] &&
              typeof formatValue === 'number' &&
              formatValue !== 0
            ) {
              // eslint-disable-next-line unicorn/operator-assignment
              formatValue = `${formatValue}px`;
            }

            // animationName 如果是 Keyframes 对象 → 提取到 effectStyle，替换为动画名
            if (
              cssKey === 'animationName' &&
              (cssValue as Keyframes)?._keyframe
            ) {
              parseKeyframes(cssValue as Keyframes);
              formatValue = (cssValue as Keyframes).getName(hashId);
            }

            styleStr += `${styleName}:${formatValue};`;
          }

          // MULTI_VALUE 包装器：一个属性声明多个值（如 background: ['url(a)', 'url(b)']）
          const actualValue = (value as any)?.value ?? value;
          if (
            typeof value === 'object' &&
            (value as any)?.[MULTI_VALUE] &&
            Array.isArray(actualValue)
          ) {
            actualValue.forEach((item) => {
              appendStyle(key, item);
            });
          } else {
            // 跳过 null/undefined
            if (isNonNullable(actualValue)) {
              appendStyle(key, actualValue);
            }
          }
        }
      });
    }
  });

  // 非根层级（递归调用）：用花括号包裹
  if (!root) {
    styleStr = `{${styleStr}}`;
  }
  // 根层级 + 配置了 layer：用 @layer name { ... } 包裹，提升样式层级隔离
  else if (layer) {
    if (styleStr) {
      styleStr = `@layer ${layer.name} {${styleStr}}`;
    }

    if (layer.dependencies) {
      effectStyle[`@layer ${layer.name}`] = layer.dependencies
        .map((deps) => `@layer ${deps}, ${layer.name};`)
        .join('\n');
    }
  }

  return [styleStr, effectStyle];
}

// ============================================================================
// ==                                Register                                ==
// ═══════════════════════════════════════════════════════════════════════════════
//  useStyleRegister — 组件样式 Hook
//
//  这是 cssinjs 最核心的 Hook，负责：
//    1. 构建缓存 key（fullPath）
//    2. 缓存未命中时：styleFn → parseStyle → normalizeStyle → hash → 生成 styleId
//    3. 缓存激活时：updateCSS 注入 DOM
//    4. 缓存清理时：removeCSS 从 DOM 移除
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 对 path + CSS 内容做哈希，生成唯一的 styleId。
 * 这个 styleId 既是 <style> 标签的 data-css-hash 属性值，
 * 也是 updateCSS/removeCSS 查找标签的依据。
 */
export function uniqueHash(path: (number | string)[], styleStr: string) {
  return hash(`${path.join('%')}${styleStr}`);
}

/** useGlobalCache 的 prefix，标识 style 轨道 */
export const STYLE_PREFIX = 'style';

/** 样式缓存条目结构：[CSS字符串, styleId, 动画/层效果, 是否仅客户端, 优先级] */
type StyleCacheValue = [
  styleStr: string,
  styleId: string,
  effectStyle: Record<string, string>,
  clientOnly: boolean | undefined,
  order: number,
];

/**
 * 组件样式注册 Hook。
 *
 * 这是从 genComponentStyleHook 调用的最底层样式 Hook。
 * 它自己不做样式计算，而是作为"胶水层"：
 *   - 把上层传来的 styleFn 和 config 对接到底层的 useGlobalCache
 *   - 在 cacheFn 回调中调用 parseStyle + normalizeStyle 完成转换
 *   - 在 onCacheEffect 回调中调用 updateCSS 完成 DOM 注入
 *
 * @param info - 包含 theme、token、path、hashId、layer、nonce、clientOnly、order
 * @param styleFn - 返回 CSSInterpolation 的样式生成函数（由 genComponentStyleHook 传入）
 */
export default function useStyleRegister(
  info: Ref<{
    clientOnly?: boolean; // 只在客户端注入（SSR 跳过）
    hashId?: string; // 样式隔离 hash（如 "css-abc123"）
    layer?: LayerConfig;
    nonce?: Nonce;
    order?: number; // 样式插入优先级，默认 -999
    path: string[]; // 缓存路径片段（如 ['Button', 'as-btn', 'asicon']）
    theme: Theme<any, any>;
    token: any;
  }>,
  styleFn: () => CSSInterpolation,
) {
  const styleContext = useStyleContext();

  // 是否开启 @layer（从 StyleProvider 的 layer 配置读取）
  const enableLayer = computed(() => !!styleContext.value.layer);
  const order = computed(() => info.value.order ?? 0);
  const hashId = computed(() => info.value.hashId);

  // 构建完整的缓存 key 路径
  // 最终 key = "style%css-abc%layer%Button%as-btn%asicon"
  const fullPath = computed<string[]>(() => {
    const path: string[] = [hashId.value || ''];
    if (enableLayer.value) {
      path.push('layer');
    }
    path.push(...info.value.path);
    return path;
  });

  // 合并"是否客户端"的判断：生产环境用 isClientSide，测试可 mock
  const isMergedClientSide = computed(() => {
    let merged = isClientSide;
    // eslint-disable-next-line unicorn/prefer-ternary
    if (isDev && styleContext.value.mock !== undefined) {
      merged = styleContext.value.mock === 'client';
    }
    return merged;
  });

  // ═════════════════════════════════════════════════════════════════════════
  //  调用 useGlobalCache，传入 5 个参数
  // ═════════════════════════════════════════════════════════════════════════
  useGlobalCache<StyleCacheValue>(
    computed(() => STYLE_PREFIX), // 1. prefix = "style"
    fullPath, // 2. 缓存 key 路径

    // ══ 3. cacheFn：缓存未命中时创建缓存值 ══
    () => {
      const cachePath = fullPath.value.join('|');
      const context = styleContext.value;
      const infoValue = info.value;

      // SSR 水合：如果 cachePath 已经存在于 SSR 产物中 → 直接用，跳过 parse
      if (existPath(cachePath)) {
        const [inlineCacheStyleStr, styleHash] = getStyleAndHash(cachePath);
        if (inlineCacheStyleStr) {
          return [
            inlineCacheStyleStr,
            styleHash,
            {},
            infoValue.clientOnly,
            order.value,
          ];
        }
      }

      // ① 调用上层传入的 styleFn → 得到 CSSObject
      const styleObj = styleFn();

      // ② parseStyle：CSSObject → 巢状 CSS 字符串 + effectStyle
      const [parsedStyle, effectStyle] = parseStyle(styleObj, {
        hashId: infoValue.hashId,
        hashPriority: context.hashPriority,
        layer: enableLayer.value ? infoValue.layer : undefined,
        path: infoValue.path.join('-'),
        transformers: (context.transformers as any[]) || [],
        linters: context.linters || [],
      });

      // ③ normalizeStyle：stylis 编译（扁平化 + 可选前缀）
      const styleStr = normalizeStyle(
        parsedStyle,
        styleContext.value.autoPrefix || false,
      );

      // ④ uniqueHash：生成唯一的 styleId
      const styleId = uniqueHash(fullPath.value, styleStr);

      return [
        styleStr, // 最终 CSS 字符串
        styleId, // data-css-hash 属性值
        effectStyle, // Keyframes + @layer 声明
        infoValue.clientOnly,
        order.value,
      ];
    },

    // ══ 4. onCacheRemove：缓存被删除时的清理回调 ══
    (cacheValue, fromHMR) => {
      const [, styleId] = cacheValue;
      if (fromHMR && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    },

    // ══ 5. onCacheEffect：缓存激活时的副作用回调（DOM 注入） ══
    (cacheValue) => {
      const [styleStr, styleId, effectStyle, , priority] = cacheValue;

      // 非客户端环境 或 来自 CSS 文件的样式（zeroRuntime 预生成）→ 不注入
      if (!isMergedClientSide.value || styleStr === CSS_FILE_STYLE) {
        return;
      }

      const {
        layer: enableLayer,
        container,
        autoPrefix,
        cache,
      } = styleContext.value;
      const { nonce } = info.value;

      // 配置 updateCSS 的参数
      let mergedCSSConfig: Parameters<typeof updateCSS>[2] = {
        mark: ATTR_MARK,
        prepend: enableLayer ? false : 'queue',
        attachTo: container,
        priority,
      };

      // 注入 CSP nonce（如果配置了）
      mergedCSSConfig = injectCSPNonce(mergedCSSConfig, nonce);

      // 分离 effectStyle：@layer 需要单独注入到最前面
      const effectLayerKeys: string[] = [];
      const effectRestKeys: string[] = [];

      Object.keys(effectStyle).forEach((key) => {
        if (key.startsWith('@layer')) {
          effectLayerKeys.push(key);
        } else {
          effectRestKeys.push(key);
        }
      });

      // 注入 @layer 效果样式 → 插到最前面（prepend: true）
      effectLayerKeys.forEach((effectKey) => {
        updateCSS(
          normalizeStyle(effectStyle[effectKey]!, autoPrefix || false),
          `_layer-${effectKey}`,
          { ...mergedCSSConfig, prepend: true },
        );
      });

      // ═══════════════════════════════════════════════════════════════════
      //  注入主样式 ← 这就是往 DOM 插入 <style> 的那一行！
      // ═══════════════════════════════════════════════════════════════════
      const style = updateCSS(styleStr, styleId, mergedCSSConfig);

      // 标记 style 元素归属（同一个 cssinjs 实例的不重复处理）
      (style as any)[CSS_IN_JS_INSTANCE] = cache.instanceId;

      // 开发环境记录缓存路径（调试用）
      if (isDev) {
        style.setAttribute(ATTR_CACHE_PATH, fullPath.value.join('|'));
      }

      // 注入 keyframes 效果样式
      effectRestKeys.forEach((effectKey) => {
        updateCSS(
          normalizeStyle(effectStyle[effectKey]!, autoPrefix || false),
          `_effect-${effectKey}`,
          mergedCSSConfig,
        );
      });
    },
  );
}

/**
 * style 轨道的 SSR 提取函数。
 * 由 extractStyle 调用，将单条缓存条目序列化为 <style> HTML 字符串。
 *
 * 注意：clientOnly 的样式不提取（只在客户端注入）。
 *
 * @param cache - 缓存条目值（styleStr + effectStyle）
 * @param effectStyles - 跨条目去重的 effect 样式表（keyframes 只生成一次）
 * @param options - { plain, autoPrefix }
 * @returns [order, styleId, styleStr] 或 null
 */
export const extract: ExtractStyle<StyleCacheValue> = (
  cache,
  effectStyles,
  options,
) => {
  const [styleStr, styleId, effectStyle, clientOnly, order]: StyleCacheValue =
    cache;
  const { plain, autoPrefix } = options || {};

  // 仅客户端样式跳过 SSR 提取
  if (clientOnly) {
    return null;
  }

  // 主样式 → <style> 标签 HTML
  let keyStyleText = styleStr;

  const sharedAttrs = {
    'data-headless-order': 'prependQueue',
    'data-headless-priority': `${order}`,
  };

  keyStyleText = toStyleStr(styleStr, undefined, styleId, sharedAttrs, plain);

  // 附加效果样式（keyframes、@layer 声明），跨条目去重
  if (effectStyle) {
    Object.keys(effectStyle).forEach((effectKey) => {
      if (effectStyles[effectKey]) {
        return;
      }

      effectStyles[effectKey] = true;
      const effectStyleStr = normalizeStyle(
        effectStyle[effectKey!]!,
        autoPrefix || false,
      );
      const effectStyleHTML = toStyleStr(
        effectStyleStr,
        undefined,
        `_effect-${effectKey}`,
        sharedAttrs,
        plain,
      );

      // @layer 声明插到最前面（保证层级顺序正确）
      if (effectKey.startsWith('@layer')) {
        keyStyleText = effectStyleHTML + keyStyleText;
      } else {
        keyStyleText += effectStyleHTML;
      }
    });
  }

  return [order, styleId, keyStyleText];
};

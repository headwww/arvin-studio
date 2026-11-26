/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  extractStyle — SSR 样式提取器
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 这是 cssinjs 唯一用于服务端渲染（SSR）的入口函数。
 *
 * 作用：遍历 CacheEntity 中所有已注册的样式条目，按优先级和创建时间排序，
 * 序列化为完整的 HTML 字符串（一串 <style> 标签），直接拼入 SSR 响应的 <head> 中。
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  为什么需要它？
 * ───────────────────────────────────────────────────────────────────────────
 *
 *  普通模式（CSR）：
 *    组件挂载 → useStyleRegister → updateCSS → 创建 <style> 标签插入 DOM
 *
 *  SSR 模式（Node 端没有 DOM）：
 *    组件渲染 → useStyleRegister → 样式写入 CacheEntity（内存中的 Map）
 *    渲染完成后 → extractStyle(cache) → 读出所有样式 → 序列化为 HTML 字符串
 *    → 拼入服务端返回的 HTML → 客户端水合时直接复用，无闪烁
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  处理流程
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   1. 从 cache 中筛选出指定 prefix 的所有 key（默认 style + token + cssVar）
 *   2. 按 key 分组，分别调用各自轨道的 extract 函数：
 *      - style 轨道 → styleExtractStyle：序列化组件样式 + effectStyle
 *      - token 轨道 → tokenExtractStyle：序列化 CSS 变量声明
 *      - cssVar 轨道 → cssVarExtractStyle：序列化组件级 CSS 变量
 *   3. 每个提取结果 = [order, styleId, styleStr, updateTime]
 *   4. 按 [order ASC, updateTime ASC] 排序（CSS 变量先，组件样式后，同优先级按创建顺序）
 *   5. 拼接为一个字符串，末尾附加 cachePathMap（客户端水合用）
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  cachePathMap — 客户端水合的关键
 * ───────────────────────────────────────────────────────────────────────────
 *
 *  最后一行会生成：
 *    <style data-cssinjs-cache-path="">
 *      .data-cssinjs-cache-path { content: "Button|as-btn:abc123;Checkbox|as-checkbox:def456;"; }
 *    </style>
 *
 *  客户端 createCache() 时读取这个 content 属性，重建 cachePathMap。
 *  useStyleRegister 检查 cachePathMap 中是否已有对应路径的样式，
 *  如果有 → 跳过样式生成（复用 SSR 版本），避免客户端重复注入。
 *
 * @param cache - 全局样式缓存实例
 * @param options
 *   - plain: true → 返回纯 CSS 文本（不包裹 <style> 标签）
 *   - types: 要提取的轨道类型，默认全部（['style', 'token', 'cssVar']）
 *   - once: true → 只提取未提取过的条目（重复调用时去重）
 * @returns 完整的 CSS HTML 字符串
 */
import type Cache from './Cache';

import {
  TOKEN_PREFIX,
  extract as tokenExtractStyle,
} from './hooks/useCacheToken';
import {
  CSS_VAR_PREFIX,
  extract as cssVarExtractStyle,
} from './hooks/useCSSVarRegister';
import {
  STYLE_PREFIX,
  extract as styleExtractStyle,
} from './hooks/useStyleRegister';
import { toStyleStr } from './util';
import {
  ATTR_CACHE_MAP,
  serialize as serializeCacheMap,
} from './util/cacheMapUtil';

/** 三个轨道的 extract 函数映射 */
const ExtractStyleFns = {
  [STYLE_PREFIX]: styleExtractStyle, // 组件样式（产物 1）
  [TOKEN_PREFIX]: tokenExtractStyle, // CSS 变量声明（产物 2）
  [CSS_VAR_PREFIX]: cssVarExtractStyle, // 组件级 CSS 变量
};

type ExtractStyleType = keyof typeof ExtractStyleFns;

function isNotNull<T>(value: null | T): value is T {
  return value !== null;
}

export default function extractStyle(
  cache: Cache,
  options?:
    | boolean
    | {
        once?: boolean;
        plain?: boolean;
        types?: ExtractStyleType | ExtractStyleType[];
      },
) {
  const {
    plain = false,
    types = ['style', 'token', 'cssVar'],
    once = false,
  } = typeof options === 'boolean' ? { plain: options } : options || {};

  // 用正则匹配指定前缀的缓存 key：`^(style|token|cssVar)%`
  const matchPrefixRegexp = new RegExp(
    `^(${(typeof types === 'string' ? [types] : types).join('|')})%`,
  );

  // 筛选出所有匹配的缓存 key
  const styleKeys = Array.from(cache.cache.keys()).filter((key) =>
    matchPrefixRegexp.test(key),
  );

  // effectStyles：跨条目去重（如多个组件共享同一个 keyframes 动画名）
  const effectStyles: Record<string, boolean> = {};

  // cachePathMap：记录"缓存路径 → styleId"的映射，最后序列化到 HTML 供客户端水合
  const cachePathMap: Record<string, string> = {};

  let styleText = '';

  styleKeys
    .map<[order: number, style: string, updateTime: number] | null>((key) => {
      // once=true 时，跳过已提取过的条目
      if (once && cache.extracted.has(key)) {
        return null;
      }

      // 将 key 从 "style%css-abc%Button%as-btn" 转为 "css-abc|Button|as-btn"
      const cachePath = key.replace(matchPrefixRegexp, '').replaceAll('%', '|');
      const [prefix] = key.split('%', 1);
      const extractFn = ExtractStyleFns[prefix as keyof typeof ExtractStyleFns];

      // 调用对应轨道的 extract 函数，返回 [order, styleId, styleStr]
      const extractedStyle = extractFn(cache.cache.get(key)![1], effectStyles, {
        plain,
      });
      if (!extractedStyle) {
        return null;
      }

      const updateTime = cache.updateTimes.get(key) || 0;
      const [order, styleId, styleStr] = extractedStyle;

      // 只有 style 轨道的条目需要记录到 cachePathMap（用于客户端跳过重复生成）
      if (key.startsWith('style')) {
        cachePathMap[cachePath] = styleId;
      }

      // 标记已提取（once 模式用）
      cache.extracted.add(key);

      return [order, styleStr, updateTime];
    })
    .filter(isNotNull)
    // 排序：order 越小越靠前（token/CSS 变量 order=-999，组件样式 order 默认 -999）
    // 同 order 按 updateTime（创建时间）排序
    .toSorted(([o1, , u1], [o2, , u2]) => {
      if (o1 !== o2) {
        return o1 - o2;
      }
      return u1 - u2;
    })
    .forEach(([, style]) => {
      styleText += style;
    });

  // 末尾追加 cachePathMap 的 CSS hack：
  // 客户端通过读取 content 属性重建缓存路径映射，跳过 SSR 已有的样式
  styleText += toStyleStr(
    `.${ATTR_CACHE_MAP}{content:"${serializeCacheMap(cachePathMap)}";}`,
    undefined,
    undefined,
    {
      [ATTR_CACHE_MAP]: ATTR_CACHE_MAP,
    },
    plain,
  );

  return styleText;
}

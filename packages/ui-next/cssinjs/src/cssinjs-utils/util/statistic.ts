/**
 * @file Token 使用统计模块，通过 Proxy 追踪组件样式函数访问了哪些 token 属性。
 * 统计数据供构建时 Babel 插件使用，用于生成零运行时（zero-runtime）的 CSS 文件。
 *
 * 核心思路：
 * 1. 用 Proxy 包装 token 对象，拦截所有属性读取
 * 2. 记录被读取的 token key → 知道组件用了哪些全局 token
 * 3. flush 时将统计结果写入全局 `statistic` 对象
 * 4. Babel 插件读取 statistic，预生成 CSS 文件
 *
 * 生产环境 `enableStatistic` 为 false，`statisticToken` 直接返回原始 token，
 * 无任何 Proxy 开销。
 */

import type { TokenMap } from '../interface';

/** 构建时由 Babel 插件注入的全局变量，用于触发统计模式 */
declare const CSSINJS_STATISTIC: any;

/**
 * 是否启用 token 统计。
 * 开发环境默认启用，生产环境仅在 `CSSINJS_STATISTIC` 全局变量存在时启用（构建阶段）。
 */
const enableStatistic =
  // @ts-expect-error this is a global variable which injected by babel plugin
  // eslint-disable-next-line n/prefer-global/process
  process.env.NODE_ENV !== 'production' || CSSINJS_STATISTIC !== undefined;

/**
 * 是否处于"记录中"状态。
 * 仅在传入 `merge()` 的原始 token 对象上启用 Proxy 追踪，
 * merge 返回的合成 token 上的属性访问不记录（避免重复统计）。
 */
let recording = true;

/**
 * 将一个或多个 token 对象合并为一个，同时保留每个属性的 getter 以便 Proxy 追踪。
 *
 * 与 `Object.assign` 的区别：
 * - 统计模式：使用 `Object.defineProperty` 为每个 key 定义 getter，
 *   这样 Proxy 能通过 get 陷阱拦截并记录 token 属性访问
 * - 非统计模式：退化为 `Object.assign`，零额外开销
 */
export function merge<CompTokenMap extends TokenMap>(
  ...objs: Partial<CompTokenMap>[]
): CompTokenMap {
  if (!enableStatistic) {
    return Object.assign({}, ...objs);
  }

  // 合并期间关闭记录，避免中间对象的 getter 触发统计
  recording = false;

  const ret = {} as CompTokenMap;

  objs.forEach((obj) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    Object.keys(obj).forEach((key) => {
      Object.defineProperty(ret, key, {
        configurable: true,
        enumerable: true,
        /** 延迟访问：每次读取都回到原始对象取值，保证值始终是最新的 */
        get: () => (obj as any)[key],
      });
    });
  });

  recording = true;
  return ret;
}

/**
 * 全局统计结果，key 为组件名，value 包含：
 * - `global`：该组件用到的全局 token key 列表（如 ['colorPrimary', 'fontSize']）
 * - `component`：该组件自身的 componentToken
 */
export const statistic: Record<
  string,
  { component: Record<string, number | string>; global: string[] }
> = {};

/** 构建阶段专用的统计副本，与运行时 statistic 隔离 */
export const _statistic_build_: typeof statistic = {};

/** 空函数，非统计模式下 flush 退化为 noop */
function noop() {}

/**
 * 通过 Proxy 包装 token 对象，追踪组件样式函数中访问了哪些 token 属性。
 *
 * 实现原理：
 * 1. `new Proxy(token, { get })` 拦截所有属性读取
 * 2. recording=true 时（仅在 merge 返回的合成 token 上），记录被访问的 key
 * 3. flush 被调用时，将记录写入全局 `statistic` 对象
 * 4. 生产环境或无 Proxy 支持时，返回原始 token，flush 为 noop
 *
 * @param token - genStyleHooks 组装好的 mergedToken
 * @returns { token: 可能是 Proxy 包装后的 token, flush: 将统计结果写入 statistic 的函数 }
 *
 * @example
 * // genComponentStyleHook 中使用
 * const { token: proxyToken, flush } = statisticToken(token.value);
 * // styleFn 执行期间，proxyToken 的每次属性读取都被记录
 * const styleInterpolation = styleFn(mergedToken, info);
 * // styleFn 执行完后，flush 将统计结果持久化
 * flush(component, componentToken);
 * // → statistic['Button'] = { global: ['colorPrimary', 'fontSize'], component: { fontWeight: 400 } }
 */
function statisticToken<CompTokenMap extends TokenMap>(token: CompTokenMap) {
  let tokenKeys: Set<string> | undefined;
  let proxy = token;
  let flush: (
    component: string,
    componentToken: Record<string, number | string>,
  ) => void = noop;

  if (enableStatistic && typeof Proxy !== 'undefined') {
    tokenKeys = new Set<string>();

    proxy = new Proxy(token as any, {
      get(obj, prop) {
        if (recording) {
          tokenKeys?.add(String(prop));
        }
        return obj[prop as keyof typeof obj];
      },
    });

    flush = (componentName, componentToken) => {
      statistic[componentName] = {
        global: Array.from(tokenKeys!),
        component: {
          ...statistic[componentName]?.component,
          ...componentToken,
        },
      };
    };
  }

  return { token: proxy, keys: tokenKeys, flush };
}

export default statisticToken;

import type { App, InjectionKey, PropType, Ref } from 'vue';

import type { Linter } from './linters';

import { computed, defineComponent, inject, markRaw, provide, ref } from 'vue';

import CacheEntity from './Cache';
import { AUTO_PREFIX } from './transformers/autoPrefix';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  StyleContext — 全局样式配置的 Vue 3 provide/inject 系统
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 这个文件做了 3 件事：
 *   1. createCache() — 创建全局唯一的 CacheEntity 实例（引用计数 Map）
 *   2. StyleProvider — Vue 组件，往组件树注入样式配置
 *   3. useStyleContext() — 任何后代组件读取样式配置
 *
 * 配置项（StyleContextProps）控制所有下游行为：
 *   - cache:             共享的样式缓存容器
 *   - hashPriority:      样式隔离的优先级策略
 *   - container:         样式注入的 DOM 目标（默认 <head>）
 *   - autoPrefix:        是否自动加浏览器前缀
 *   - layer:             是否用 @layer 包裹样式
 *   - transformers:      CSS 预处理器（px2rem 等）
 *   - linters:           开发时样式检查
 *   - ssrInline:         SSR 内联样式回退方案
 */

// high：组件样式强势，用户想覆盖就要写得更有针对性。
// low：组件样式弱势，主动用 :where() 把优先级降到最低，方便用户自定义样式。
export type HashPriority = 'high' | 'low';

/** 标记 style 标签属于哪个 token（用于 useCacheToken 批量清理） */
export const ATTR_TOKEN = 'data-token-hash';

/** 标记 style 标签的哈希 ID（用于 updateCSS/removeCSS 查找和去重） */
export const ATTR_MARK = 'data-css-hash';

/** 标记 style 标签的缓存路径（开发环境，用于调试 + SSR 水合） */
export const ATTR_CACHE_PATH = 'data-cache-path';

/**
 * CSS-in-JS 实例 ID，挂在每个 style 元素上。
 * 一个应用可能有多个 cssinjs 实例（多个版本的），用这个区分归属。
 */
export const CSS_IN_JS_INSTANCE = '__cssinjs_instance__';

// ═══════════════════════════════════════════════════════════════════════════════
//  createCache — 创建缓存实例 + SSR 水合处理
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 创建全局唯一的 CacheEntity 实例。
 *
 * 每次调用生成一个随机 instanceId，用于：
 *   1. 标记哪些 <style> 标签属于当前实例
 *   2. SSR 水合时：把 body 中的 style 标签挪到 head，并去重
 *
 * markRaw 的作用：告诉 Vue 不要对这个对象做响应式代理，
 * 因为 CacheEntity 内部的 Map 不需要触发 Vue 的更新。
 */
export function createCache() {
  const cssinjsInstanceId = Math.random().toString(12).slice(2);

  // SSR 水合处理：服务端渲染的样式写在 body 中，客户端启动时需要
  // 把它们挪到 head，并移除重复的（避免闪烁和样式冗余）
  if (typeof document !== 'undefined' && document.head && document.body) {
    const styles =
      document.body.querySelectorAll(`style[${CSS.escape(ATTR_MARK)}]`) || [];
    const { firstChild } = document.head;

    // 第一步：把 body 中的 style 标签移到 head
    Array.from(styles).forEach((style) => {
      (style as any)[CSS_IN_JS_INSTANCE] =
        (style as any)[CSS_IN_JS_INSTANCE] || cssinjsInstanceId;

      if ((style as any)[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
        document.head.insertBefore(style, firstChild);
      }
    });

    // 第二步：去重 — 相同 data-css-hash 的 style 只保留一个
    const styleHash: Record<string, boolean> = {};
    Array.from(
      document.querySelectorAll(`style[${CSS.escape(ATTR_MARK)}]`),
    ).forEach((style) => {
      const hash = style.getAttribute(ATTR_MARK)!;
      if (styleHash[hash]) {
        if ((style as any)[CSS_IN_JS_INSTANCE] === cssinjsInstanceId) {
          style.remove();
        }
      } else {
        styleHash[hash] = true;
      }
    });
  }

  return markRaw(new CacheEntity(cssinjsInstanceId));
}
const defaultStyleContext: StyleContextProps = {
  defaultCache: true,
  cache: createCache(),
  // 默认低优先级，用 :where() 降低特异性
  hashPriority: 'low',
  autoPrefix: false,
};

const StyleContextKey: InjectionKey<Ref<StyleContextProps>> =
  Symbol('StyleContext');

/** 组件内部用：在 StyleProvider 的 setup 中调用，向下 provide */
export function useStyleContextProvide(props: Ref<StyleContextProps>) {
  provide(StyleContextKey, props);
}

/** App 级别用：在 app.provide 中调用 */
export function provideStyleContext(app: App, props: Ref<StyleContextProps>) {
  app.provide(StyleContextKey, props);
}

/**
 * 读取样式上下文。
 * 任意后代组件调用此函数获取全局样式配置。
 * 如果找不到父级提供，返回默认值。
 */
export function useStyleContext() {
  return inject(StyleContextKey, ref<StyleContextProps>(defaultStyleContext));
}

export interface StyleContextProps {
  autoClear?: boolean;
  /** 是否用 stylis prefixer 自动加浏览器前缀（-webkit- 等） */
  autoPrefix?: boolean;
  /**
   * 全局样式缓存容器（引用计数 Map）。
   * 如果不传，StyleProvider 会自动调用 createCache() 创建。
   */
  cache: CacheEntity;
  /** 样式注入的目标容器，默认 <head>。Shadow DOM 场景下传入 shadowRoot */
  container?: Element | ShadowRoot;
  /** 标记这个 context 是否为默认生成的（未显式传 cache） */
  defaultCache: boolean;
  /**
   * 样式隔离策略：
   *   'low'  — 用 :where(.hashId) 降低选择器特异性，方便用户覆盖
   *   'high' — 用 .hashId 普通优先级，样式更难被覆盖
   */
  hashPriority?: HashPriority;
  /** 是否用 @layer 包裹样式，避免全局样式冲突 */
  layer?: boolean;
  /** CSS Linter 数组，开发环境在 parseStyle 后检查样式问题 */
  linters?: Linter[];
  /** @private 仅测试用。生产环境无效。 */
  mock?: 'client' | 'server';
  /** SSR 中是否渲染内联 <style /> 作为回退。不推荐使用 */
  ssrInline?: boolean;
  /** CSS 转换器数组（如 px2rem），在 parseStyle 执行前处理 CSSObject */
  transformers?: Transformer[];
}

/** StyleProvider 组件的 props 声明（Vue 运行时用） */
export const styleContextProps = {
  autoClear: { type: Boolean, default: undefined },
  mock: { type: String as PropType<'client' | 'server'>, default: undefined },
  cache: { type: Object as PropType<CacheEntity> },
  defaultCache: { type: Boolean },
  hashPriority: { type: String as PropType<HashPriority>, default: undefined },
  container: {
    type: [Object] as PropType<Element | ShadowRoot>,
    default: undefined,
  },
  ssrInline: { type: Boolean, default: undefined },
  transformers: { type: Array as PropType<Transformer[]>, default: undefined },
  linters: { type: Array as PropType<Linter[]>, default: undefined },
  layer: { type: Boolean, default: undefined },
  autoPrefix: { type: Boolean, default: undefined },
};

export type StyleProviderProps = StyleContextProps;

/**
 * StyleContext 的 Vue 组件形式，包裹在应用根部，向下传递样式配置。
 *
 * 核心逻辑：
 * 1. 读取父级 context（支持多层 StyleProvider 嵌套）
 * 2. 将父级 context 与当前 props 合并（props 优先级更高）
 * 3. 确保 cache 始终存在（未传则自动创建）
 * 4. 检测 transformers 中是否包含 AUTO_PREFIX，有则开启 autoPrefix
 * 5. 通过 provide 向子树注入合并后的 context
 *
 * @example
 * // 基础用法
 * <StyleProvider :cache="cache" hashPriority="low">
 *   <App />
 * </StyleProvider>
 *
 * // 嵌套用法：内层 Provider 的配置会覆盖外层
 * <StyleProvider hashPriority="low">
 *   <StyleProvider hashPriority="high">
 *     <!-- 这里的组件拿到的是 high -->
 *   </StyleProvider>
 * </StyleProvider>
 */
export const StyleProvider = defineComponent<Partial<StyleContextProps>>(
  (props, { slots }) => {
    const parentContext = useStyleContext();
    // 合并策略：先继承父级配置，再用当前 props 覆盖
    const context = computed(() => {
      const restProps = props;
      const mergedContext: StyleContextProps = {
        ...parentContext.value,
      };

      // 只覆盖显式传入的属性（undefined 表示未传，不覆盖）
      (
        Object.keys(restProps) as (keyof Omit<StyleProviderProps, 'children'>)[]
      ).forEach((key) => {
        const value = restProps[key];
        if (restProps[key] !== undefined) {
          (mergedContext as any)[key] = value;
        }
      });

      // cache：优先用传入的，否则自动创建
      const { cache, transformers = [] } = restProps;
      // eslint-disable-next-line unicorn/logical-assignment-operators
      mergedContext.cache = mergedContext.cache || createCache();
      mergedContext.defaultCache = !cache && parentContext.value?.defaultCache;

      // autoPrefix：如果在 transformers 中检测到 AUTO_PREFIX 标记，自动开启
      if (transformers.includes(AUTO_PREFIX)) {
        mergedContext.autoPrefix = true;
      }

      return mergedContext;
    });

    // 向下 provide 合并后的配置
    useStyleContextProvide(context);
    // 无渲染组件，只透传 slot 内容
    return () => {
      return slots?.default?.();
    };
  },
  {
    props: styleContextProps,
  },
);

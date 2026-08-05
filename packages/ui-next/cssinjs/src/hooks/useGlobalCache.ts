/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  useGlobalCache — 引用计数的全局缓存 Hook，三个缓存轨道的共同底座
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 这是整个 cssinjs 系统最核心的 Hook，useStyleRegister、useCacheToken、
 * useCSSVarRegister 三个上层 Hook 都基于它。
 *
 * 它管理一个引用计数的缓存条目，对应一条完整的样式/CSS变量/keyframes 内容。
 * 多个组件实例共享同一条缓存，全部卸载后延迟 500ms 从 DOM 移除样式。
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  核心概念：引用计数（Reference Counting）
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   缓存条目 = [times, cachedValue]
 *                ↑
 *               引用计数：多少个组件实例在使用这条缓存
 *
 *   组件 A 挂载 → times: 0 → 1   创建缓存 + 注入 DOM（onCacheEffect）
 *   组件 B 挂载 → times: 1 → 2   共享缓存，不重复创建/注入
 *   组件 A 卸载 → times: 2 → 1   减一，缓存仍保留
 *   组件 B 卸载 → times: 1 → 0   归零 → 延迟 500ms 移除（等待 Transition 动画）
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  与 React 版本的关键区别
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   - 不需要 useInsertionEffect — Vue 的 computed + watch(flush:'sync') 处理时机
 *   - 不需要处理 StrictMode 双重挂载 — Vue 没有这个机制
 *   - HMR 更简单 — 依赖 Vue 的响应式系统
 *   - 用 onBeforeUnmount 清理 — 比 watch 的 onCleanup 更可控（Transition 动画需要）
 * ───────────────────────────────────────────────────────────────────────────
 */
import type { Ref } from 'vue';

import type { KeyType } from '../Cache';

import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  shallowRef,
  watch,
} from 'vue';

import { pathKey } from '../Cache';
import { useStyleContext } from '../StyleContext';
import { isClientSide } from '../util';

export type ExtractStyle<CacheValue> = (
  cache: CacheValue,
  effectStyles: Record<string, boolean>,
  options?: {
    autoPrefix?: boolean;
    plain?: boolean;
  },
) => [order: number, styleId: string, style: string] | null;

/** 防止 onCacheEffect 在同一路径被重复触发的去重 Map */
const effectMap = new Map<string, boolean>();

// ═══════════════════════════════════════════════════════════════════════════════
//  延迟移除机制
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 延迟移除样式的时间（毫秒）。
 * 设置为 500ms 是为了让 Vue 的 <Transition> 离开动画有足够时间完成。
 * 动画期间样式必须留在 DOM 中，否则动画过程会出现样式缺失。
 */
const REMOVE_STYLE_DELAY = 500;

/**
 * 延迟移除信息。
 *
 * 用 pendingDecrements（而非简单的布尔标志）是为了处理两个场景：
 *   场景 1：组件 A 卸载（计数 2→1，但 pendingDecrements = 1），
 *           在 500ms 内组件 B 也卸载（pendingDecrements 变为 2），
 *           定时器触发时一次 decrement 2，正确归零并移除。
 *
 *   场景 2：组件 A 卸载（计数 2→1，pendingDecrements = 1），
 *           在 500ms 内组件 C 又挂载了（re-activate，pendingDecrements 减为 0，
 *           取消定时器），样式得以保留。
 *
 *   场景 3（虚拟滚动优化）：组件 A 卸载时，如果当前引用计数 > 1
 *          （还有其他实例在用），直接递减计数，不创建延迟任务。
 *          避免高频挂载/卸载产生大量 setTimeout 抖动。
 */
interface DelayedRemoveInfo {
  pendingDecrements: number;
  timer: ReturnType<typeof setTimeout>;
}

const delayedRemoveInfo = new Map<string, DelayedRemoveInfo>();

// ═══════════════════════════════════════════════════════════════════════════════
//  useGlobalCache — 主 Hook
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 全局缓存 Hook。
 *
 * @param prefix - 缓存命名空间（"style" | "token" | "cssVar"）
 * @param keyPath - 缓存标识路径（如 [hashId, 'Button', 'as-btn']）
 * @param cacheFn - 缓存未命中时创建值的回调
 * @param onCacheRemove - 缓存被删除时的清理回调（如从 DOM 移除 style 标签）
 * @param onCacheEffect - 缓存激活时的副作用回调（如向 DOM 注入 style 标签）
 *
 * @returns 缓存的响应式值
 */
export function useGlobalCache<CacheType>(
  prefix: Ref<string>,
  keyPath: Ref<KeyType[]>,
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
  onCacheEffect?: (cachedValue: CacheType) => void,
): Ref<CacheType> {
  const styleContext = useStyleContext();

  // 缓存 key = "style%css-abc%Button%as-btn"
  const fullPath = computed(() => [prefix.value, ...keyPath.value]);
  const fullPathStr = computed(() => pathKey(fullPath.value));

  // 追踪当前激活的路径（用于卸载时清理）和挂载状态
  const currentPathRef = shallowRef(fullPathStr.value);
  const isMountedRef = shallowRef(false);

  const globalCache = () => styleContext.value.cache;
  const isServerSide = () =>
    styleContext.value.mock === undefined
      ? !isClientSide
      : styleContext.value.mock === 'server';

  // ─────────────────────────────────────────────────────────────────────────
  //  引用计数操作
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 对缓存条目执行引用计数递减。
   *
   * @param pathStr - 缓存 key
   * @param decrementCount - 递减次数（延迟清理场景可能 > 1）
   */
  const applyDecrement = (pathStr: string, decrementCount = 1) => {
    if (decrementCount <= 0) {
      return;
    }

    globalCache().opUpdate(pathStr, (prevCache) => {
      if (!prevCache) {
        return null;
      }

      const [times = 0, cache] = prevCache;
      const nextCount = times - decrementCount;

      if (nextCount <= 0) {
        // 计数归零：触发清理回调，从缓存中删除
        onCacheRemove?.(cache, false);
        effectMap.delete(pathStr);
        return null; // null → CacheEntity 会 delete 这个 key
      }

      return [nextCount, cache];
    });
  };

  /**
   * 创建延迟移除定时器。
   * 500ms 后，一次性执行所有积压的 pendingDecrements。
   */
  const createDelayedRemoveTimer = (pathStr: string) =>
    setTimeout(() => {
      const info = delayedRemoveInfo.get(pathStr);
      if (!info) {
        return;
      }
      delayedRemoveInfo.delete(pathStr);
      applyDecrement(pathStr, info.pendingDecrements);
    }, REMOVE_STYLE_DELAY);

  /**
   * 清理缓存（递减引用计数）。
   *
   * @param pathStr - 缓存 key
   * @param immediate - true = 立即递减；false = 延迟 500ms（等待 Transition 动画）
   */
  const clearCache = (pathStr: string, immediate = false) => {
    if (isServerSide()) {
      return;
    }

    if (immediate || !isClientSide) {
      // 立即清理：
      // 1. path 变化时（主题切换），旧 path 的样式需要立刻移除
      // 2. 非浏览器环境（SSR）不需要延迟
      applyDecrement(pathStr);
    } else {
      // 延迟清理：等待可能的 Transition 动画完成
      const existingInfo = delayedRemoveInfo.get(pathStr);
      const currentCache = globalCache().opGet(pathStr);
      const currentRefCount = currentCache?.[0] ?? 0;

      // 其他实例仍在使用时，直接递减引用计数，不创建延迟任务
      // 避免虚拟滚动场景中高频 setTimeout 抖动
      if (!existingInfo && currentRefCount > 1) {
        applyDecrement(pathStr);
        return;
      }

      if (existingInfo) {
        // 已有延迟清理任务：累加 pendingDecrements，重置定时器
        // 例如 A 卸载后 200ms 内 B 也卸载了 → pendingDecrements 从 1 变 2
        clearTimeout(existingInfo.timer);
        const newPendingDecrements = existingInfo.pendingDecrements + 1;

        const timer = createDelayedRemoveTimer(pathStr);

        delayedRemoveInfo.set(pathStr, {
          timer,
          pendingDecrements: newPendingDecrements,
        });
      } else {
        // 没有延迟清理任务：创建新的
        const timer = createDelayedRemoveTimer(pathStr);

        delayedRemoveInfo.set(pathStr, {
          timer,
          pendingDecrements: 1,
        });
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  缓存值的 computed — 急切求值
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 急切求值的 computed：在 setup 阶段就创建缓存条目（填充 cacheFn 的值），
   * 但此时计数为 0，不触发副作用（不注入 DOM）。
   *
   * 对应 React cssinjs 的 useMemo：先把值算好，副作用在 mount/update 时才触发。
   */
  const cacheContent = computed(() => {
    let entity = globalCache().opGet(fullPathStr.value);

    // 缓存未命中：用 cacheFn 创建新条目，计数 = 0
    if (!entity) {
      globalCache().opUpdate(fullPathStr.value, (prevCache) => {
        const [times = 0, cache] = prevCache || [undefined, undefined];
        const mergedCache = cache || cacheFn();
        return [times, mergedCache];
      });
      entity = globalCache().opGet(fullPathStr.value);
    }

    return entity![1]!;
  });

  // 触发 computed 的 getter，确保 setup 阶段就创建缓存条目
  // oxlint-disable-next-line no-unused-expressions
  cacheContent.value;

  // ─────────────────────────────────────────────────────────────────────────
  //  副作用触发（DOM 注入）
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 触发 onCacheEffect（向 DOM 注入 <style> 标签），并对同一路径去重。
   * Promise.resolve() 确保一个微任务周期内同一路径只触发一次。
   */
  const triggerCacheEffect = (pathStr: string) => {
    if (!onCacheEffect || effectMap.has(pathStr)) {
      return;
    }

    const cachedValue = cacheContent.value;
    effectMap.set(pathStr, true);
    onCacheEffect(cachedValue);
    // eslint-disable-next-line unicorn/prefer-promise-try, unicorn/prefer-await
    Promise.resolve().then(() => {
      effectMap.delete(pathStr);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  路径激活（引用计数 +1 + 触发副作用）
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 激活一个路径。
   *   1. 如果有旧路径且不同 → 立即清理旧路径（主题切换场景）
   *   2. 如果在延迟清理队列中 → 减少 pendingDecrements（取消卸载）
   *   3. 否则 → 引用计数 +1，首次命中时调用 cacheFn 创建值
   *   4. 触发 onCacheEffect（注入 DOM）
   */
  const activatePath = (newPath: string, oldPath?: string) => {
    // 路径变化时，旧路径立即清理
    if (oldPath && oldPath !== newPath) {
      clearCache(oldPath, true);
    }

    currentPathRef.value = newPath;

    const existingInfo = delayedRemoveInfo.get(newPath);

    if (existingInfo) {
      // 正在被"延迟清理"的路径又重新激活了：
      // 减少 pendingDecrements → 抵消一次卸载操作
      const newPendingDecrements = existingInfo.pendingDecrements - 1;

      if (newPendingDecrements <= 0) {
        // 所有卸载都被抵消：取消定时器，删除清理记录，样式保留
        clearTimeout(existingInfo.timer);
        delayedRemoveInfo.delete(newPath);
      } else {
        // 部分抵消：更新 pendingDecrements
        delayedRemoveInfo.set(newPath, {
          timer: existingInfo.timer,
          pendingDecrements: newPendingDecrements,
        });
      }
    } else {
      // 正常路径：引用计数 +1
      globalCache().opUpdate(newPath, (prevCache) => {
        const [times = 0, cache] = prevCache || [undefined, undefined];
        const mergedCache = cache || cacheFn();
        return [times + 1, mergedCache];
      });
    }

    // 通知上层：可以注入 DOM 了
    triggerCacheEffect(newPath);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  Vue 生命周期绑定
  // ─────────────────────────────────────────────────────────────────────────

  // 挂载前：同步追踪 currentPathRef（computed 值变化但组件尚未挂载时）
  watch(
    fullPathStr,
    (newPath) => {
      if (!isMountedRef.value) {
        currentPathRef.value = newPath;
      }
    },
    { flush: 'sync' },
  );

  // 挂载后：fullPath 变化时，激活新路径并清理旧路径
  // flush: 'sync' 确保在 DOM 更新前同步执行，和 React useInsertionEffect 对齐
  watch(
    fullPathStr,
    (newPath, oldPath) => {
      if (!isMountedRef.value) {
        return;
      }
      activatePath(newPath, oldPath);
    },
    { flush: 'sync' },
  );

  // 首次挂载：激活当前路径（引用计数 +1 + 注入 DOM）
  onBeforeMount(() => {
    isMountedRef.value = true;
    activatePath(currentPathRef.value);
  });

  // 卸载：延迟清理缓存
  // 用 onBeforeUnmount 而非 watch 的 onCleanup，是因为前者在组件销毁前同步执行，
  // 后者在 watch 下次触发时才执行，可能导致 Transition 动画期间样式已被移除
  onBeforeUnmount(() => {
    isMountedRef.value = false;
    clearCache(currentPathRef.value);
  });

  // 返回缓存的响应式值（computed，自动跟随 fullPath 变化）
  return cacheContent;
}

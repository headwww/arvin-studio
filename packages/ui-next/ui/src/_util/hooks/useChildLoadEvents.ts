/**
 * useChildLoadEvents：监听容器内资源加载/出错事件
 *
 * 用途：给某个容器（如 Avatar.Group、图片预览等）统一监听内部
 * "可能触发 load/error 的资源元素"（img/iframe/video/audio/script/
 * 样式表/source/embed/object），并把事件归一化后交给回调处理。
 *
 * 特性：
 * - bindEvent 可重复调用：每次绑定前先清理上一次的监听（避免重复绑定/泄漏）；
 * - 可对"已经加载完成的资源"（如缓存命中的图片）立即补触发一次回调；
 * - 组件卸载时自动清理（onBeforeUnmount）。
 */
// useChildLoadEvents.ts
import { onBeforeUnmount, shallowRef } from 'vue';

/** 资源事件类型：加载完成 / 加载出错 */
export type ResourceEventType = 'error' | 'load';

export interface UseChildLoadEventsOptions {
  /**
   * 是否在 bind 时立即触发一次对"已加载完成资源"的回调
   * 默认 true
   */
  triggerForAlreadyLoaded?: boolean;
}

/**
 * 监听某个容器内所有"可能触发 load/error 的元素"，
 * 并把事件统一交给回调处理。
 */
export function useChildLoadEvents(options: UseChildLoadEventsOptions = {}) {
  const { triggerForAlreadyLoaded = true } = options;

  // 当前这一次绑定对应的清理函数
  const cleanupRef = shallowRef<(() => void) | null>(null);

  /** 清理当前绑定的全部监听 */
  const clear = () => {
    if (!cleanupRef.value) {
      return;
    }

    cleanupRef.value();
    cleanupRef.value = null;
  };

  /**
   * 绑定监听
   *
   * @param root 目标容器（可为 null/undefined，此时静默跳过）
   * @param callback 统一回调：(type, el, ev) => void；
   *   对于"已加载完成"的补触发，ev 为 null
   */
  const bindEvent = (
    root: HTMLElement | null | undefined,
    callback: (type: ResourceEventType, el: Element, ev: Event | null) => void,
  ) => {
    // 先把上一次绑定清掉，避免重复绑定
    clear();

    if (!root) return;

    // 按需调整这个选择器
    // 覆盖所有带 load/error 事件的资源元素
    const selector =
      'img, iframe, video, audio, script, link[rel="stylesheet"], source, embed, object';

    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));

    const cleanups: Array<() => void> = [];

    for (const el of elements) {
      const handleLoad = (ev: Event) => {
        callback('load', el, ev);
      };

      const handleError = (ev: Event) => {
        callback('error', el, ev);
      };

      // once: 每个元素只触发一次，避免重复回调
      el.addEventListener('load', handleLoad, { once: true });
      el.addEventListener('error', handleError, { once: true });

      cleanups.push(() => {
        el.removeEventListener('load', handleLoad);
        el.removeEventListener('error', handleError);
      });

      // 处理"已经加载完成"的情况（缓存命中等）
      if (triggerForAlreadyLoaded) {
        // 图片：complete 表示已加载完成（含失败，但这里统一按 load 回调）
        if (el instanceof HTMLImageElement) {
          if (el.complete) {
            callback('load', el, null);
          }
        }
        // 音视频：readyState >= 1 表示已有足够元数据
        else if (
          el instanceof HTMLVideoElement ||
          el instanceof HTMLAudioElement
        ) {
          // readyState >= 1 表示已经有足够的元数据
          if (el.readyState >= 1) {
            callback('load', el, null);
          }
        }
        // 样式表：rel=stylesheet 且 sheet 已就绪
        else if (
          el instanceof HTMLLinkElement &&
          el.rel === 'stylesheet' &&
          el.sheet
        ) {
          callback('load', el, null);
        }
        // 其他类型（script/embed/object）如果有特殊判断需求，可以按需补充
      }
    }

    cleanupRef.value = () => {
      cleanups.forEach((fn) => fn());
    };
  };

  // 组件卸载自动清理
  onBeforeUnmount(clear);

  return {
    bindEvent,
    clear,
  };
}

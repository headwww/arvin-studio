/**
 * @file 尺寸 Hook，从 ConfigProvider 的全局尺寸与组件自身的 size prop 合并出最终尺寸
 */

import type { Ref } from 'vue';

import { computed } from 'vue';

import { useSizeContext } from '../size-context';

/**
 * 合并全局 size 配置与组件自身的 size prop。
 *
 * 三种调用方式，优先级从高到低：
 * 1. 传函数 → 用全局尺寸作为参数调用，组件可基于全局尺寸派生（如 ctxSize === 'large' ? 'small' : 'large'）
 * 2. 传 Ref → 组件自身的 size（Ref 值非 undefined 时优先，否则 fallback 全局）
 * 3. 不传 → 直接使用全局尺寸
 *
 * @param customSize - 组件自身的 size 配置，可以是 Ref 值或函数
 * @returns computed —— 合并后的当前尺寸
 *
 * @example
 * // 不传：完全跟随 ConfigProvider 的全局尺寸
 * const size = useSize();
 *
 * // 传 Ref：组件有 size prop，未传时走全局
 * const size = useSize(toRef(props, 'size'));
 *
 * // 传函数：基于全局尺寸派生（如"全局 large 时我反而用 small"）
 * const size = useSize((ctxSize) => ctxSize === 'large' ? 'small' : ctxSize);
 */
export function useSize<T extends number | object | string | undefined>(
  customSize?: ((ctxSize: T) => T) | Ref<T>,
) {
  const size = useSizeContext();
  return computed<T>(() => {
    if (!customSize) {
      return size.value as T;
    }
    if (typeof customSize === 'object') {
      // Ref 形式：组件自身值为 undefined 时 fallback 到全局
      return (customSize.value ?? size.value) as T;
    }
    if (typeof customSize === 'function') {
      // 函数形式：将全局尺寸作为参数传入，由组件自主决定
      return customSize(size.value! as T);
    }
    return size.value as T;
  });
}

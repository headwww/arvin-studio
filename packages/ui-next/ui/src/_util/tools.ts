/**
 * @file Vue 插槽与 Props 工具函数，提供 slot/prop 统一获取与执行的能力
 */

import type { Ref } from 'vue';

import { getCurrentInstance, toHandlerKey, toRef } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';

/**
 * 从 slots 或 props 中获取指定 key 的值，包装为统一的函数形式。
 *
 * Vue 3 中 slot 可以是插槽函数或 props 中传入的渲染函数（如 `dropdownRender`）。
 * 此函数统一两种来源，确保调用方始终拿到一个函数。
 *
 * @param slots - 组件的 slots 对象
 * @param props - 组件的 props 对象
 * @param key - 要获取的 key 名
 * @returns 始终返回一个函数：值本身是函数则直接返回，否则包装为 `() => [value]`
 *
 * @example
 * // slots 中有 `icon` 插槽 → 返回插槽渲染函数
 * // props 中有 `icon: MyIcon`（组件对象）→ 返回 `() => [MyIcon]`
 * const renderIcon = getSlotPropFn(slots, props, 'icon');
 */
export function getSlotPropFn(slots: any, props: any, key: string) {
  // TODO: 需要考虑 function slot
  const fn = slots[key] || props[key];
  if (typeof fn === 'function') {
    return fn;
  }
  return () => [fn];
}

/**
 * 从 slots 或 props 中获取渲染内容并执行，返回过滤空节点后的 VNode。
 *
 * 这是 `getSlotPropFn` 的执行版，直接拿到渲染结果。内部做了：
 * 1. 执行渲染函数获取 VNode
 * 2. 过滤 null/undefined/空节点
 * 3. 单节点直接返回，多节点返回数组
 *
 * @param slots - 组件的 slots 对象
 * @param props - 组件的 props 对象
 * @param key - 要获取的 key 名
 * @param isNull - 值为 null 时的返回策略：true → 返回 null，false → 返回 undefined
 * @param params - 传给渲染函数的参数
 *
 * @example
 * // 获取 `icon` 的渲染结果
 * const iconNode = getSlotPropsFnRun(slots, props, 'icon');
 * // iconNode 可能是单个 VNode、VNode[]、null 或 undefined
 */
export function getSlotPropsFnRun(
  slots: any,
  props: any,
  key: string,
  isNull = true,
  params?: any,
) {
  const fn = getSlotPropFn(slots, props, key);
  if (typeof fn === 'function') {
    let node = fn?.(params);
    if (!Array.isArray(node)) {
      node = [node];
    }
    // 渲染结果为 [null]（空占位）→ 返回 null
    if (node && node.length === 1 && node[0] === null) {
      return null;
    }
    // 过滤空节点
    const nodes = filterEmpty(node).filter(
      (node) => node !== undefined && node !== null,
    );
    if (nodes.length > 0) {
      if (nodes.length === 1) {
        return nodes[0];
      }
      return nodes;
    }
    return isNull ? null : undefined;
  }
  // 非函数值直接返回（如 undefined 或 VNode）
  return fn;
}

/**
 * 将一个响应式对象的部分属性，批量转换成独立的 ref 并保持响应性连接。
 * @param obj
 * @param args
 * @returns
 */
export function toPropsRefs<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...args: K[]
) {
  const _res: Record<any, any> = {};
  args.forEach((key) => {
    _res[key] = toRef(obj, key);
  });
  return _res as { [key in K]-?: Ref<T[key]> };
}

/**
 * 返回一个「稳定引用」的事件转发器，调用时实时读取组件当前 vnode 上的监听器。
 *
 * 用途：解决「把 emit 事件回调按值捕获进子组件、之后才触发」导致的陈旧闭包问题。
 * 当组件实例被复用且本次更新里只有事件回调发生了变化时（典型场景：无 `rowKey` 的
 * 表格翻页后按位置复用行），Vue 的 `shouldUpdateComponent` 会把它当作「仅 emit 监听器
 * 变化」而跳过该组件的重新渲染，于是渲染期捕获的回调会停留在旧值。
 *
 * 这里通过 `instance.vnode.props` 实时取值，而该字段在跳过更新时仍会被 `updateComponent`
 * 同步为最新 vnode，因此永远拿到最新回调；同时保留处理函数的返回值（`emit` 会丢弃返回值，
 * 故无法直接用 `emit` 替代——`ActionButton` 依赖 confirm 的返回值驱动异步 loading）。
 */
export function useLiveListener<Args extends any[] = any[], R = any>(
  name: string,
): (...args: Args) => R | undefined {
  const instance = getCurrentInstance();
  const handlerKey = toHandlerKey(name);
  return (...args: Args): R | undefined => {
    const handler = (
      instance?.vnode.props as null | Record<string, any> | undefined
    )?.[handlerKey];
    if (Array.isArray(handler)) {
      let result: R | undefined;
      handler.forEach((fn) => {
        if (typeof fn === 'function') {
          result = fn(...args);
        }
      });
      return result;
    }
    return typeof handler === 'function' ? handler(...args) : undefined;
  };
}

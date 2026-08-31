/**
 * usePatchElement：命令式追加/移除渲染元素的钩子
 *
 * 用于需要"额外塞进渲染树的节点"的场景（如 Alert 的关闭动画、
 * Message/Notification 的动态条目），思路类似 React 的 useEffect：
 * - patchElement(element) 把节点追加进 elements 列表，并返回一个清理函数；
 * - 调用清理函数（通常在组件卸载或 effect 重跑时）把该节点移除。
 *
 * 每次增删都创建新数组（不可变更新），保证 shallowRef 能触发响应。
 */
import type { Ref } from 'vue';

import { shallowRef } from 'vue';

/**
 * @returns [elements, patchElement]：
 *  - elements：当前已追加的元素列表（shallowRef，直接渲染到模板即可）
 *  - patchElement：追加元素，返回移除该元素的清理函数
 */
export function usePatchElement(): [Ref<any[]>, (element: any) => () => void] {
  const elements = shallowRef<any[]>([]);

  const patchElement = (element: any) => {
    // append a new element to elements (and create a new ref)
    elements.value = [...elements.value, element];
    // return a function that removes the new element out of elements (and create a new ref)
    // it works a little like useEffect
    return () => {
      const originElements = [...elements.value];
      elements.value = originElements.filter((ele) => ele !== element);
    };
  };
  return [elements, patchElement] as const;
}

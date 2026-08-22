import type { Ref } from 'vue';

import type { SharedConfig } from '../interface';

import { computed } from 'vue';

import Item from '../Item';

/**
 * 计算并渲染当前可视区域内的列表子节点
 *
 * @param list       完整列表数据的响应式引用
 * @param startIndex 可视区域起始索引的响应式引用
 * @param endIndex   可视区域结束索引的响应式引用
 * @param scrollWidth 列表项宽度的响应式引用，通常为滚动容器的宽度
 * @param offsetX    水平偏移量的响应式引用，用于处理横向虚拟滚动
 * @param setNodeRef 用于注册列表项 DOM 元素的回调函数
 * @param renderFunc 渲染列表项内容的函数
 * @param getKey     从配置中解构出的获取列表项 key 的函数
 */
export default function useChildren(
  list: Ref<any[]>,
  startIndex: Ref<number>,
  endIndex: Ref<number>,
  scrollWidth: Ref<number>,
  offsetX: Ref<number>,
  setNodeRef: (item: any, element: HTMLElement | null) => void,
  renderFunc: any,
  { getKey }: SharedConfig<any>,
) {
  // 返回一个 computed，当依赖的响应式数据变化时自动重新计算需要渲染的列表项
  return computed(() => {
    return (
      list.value
        // 只截取可视区域对应的数据片段，endIndex + 1 是为了包含结束索引
        .slice(startIndex.value, endIndex.value + 1)
        .map((item, index) => {
          // 计算当前项在完整列表中的真实索引
          const eleIndex = startIndex.value + index;

          // 调用渲染函数生成列表项内容
          const node = renderFunc(item, eleIndex, {
            style: {
              // 设置列表项宽度
              width: `${scrollWidth.value}px`,
            },
            // 传入水平偏移量，便于定位
            offsetX: offsetX.value,
          });

          // 获取当前列表项的唯一 key，用于 Vue 的列表渲染优化
          const key = getKey(item);

          return (
            <Item
              key={key}
              // 通过 setRef 将生成的 DOM 元素与当前 item 关联起来
              setRef={(ele) => setNodeRef(item, ele)}
            >
              {node}
            </Item>
          );
        })
    );
  });
}

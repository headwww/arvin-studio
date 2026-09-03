/**
 * useMultipleSelect：Shift 连选钩子
 *
 * 为列表类组件（如 Table 行选择）提供"按住 Shift 点选实现连续区间选择"的能力：
 * - 记录上一次点选的索引（prevSelectedIndex）；
 * - 当次点选时，取 [上一次索引, 当前索引] 闭区间作为候选范围；
 * - 若范围内存在未选中的项 → 整段选中；否则 → 整段取消选中（切换语义）。
 *
 * 返回 [multipleSelect, setPrevSelectedIndex]：
 *   multipleSelect 执行区间切换并返回实际变化的 key 列表（供外部触发变更）；
 *   setPrevSelectedIndex 由外部在单选等场景手动刷新锚点。
 */
import type { Ref } from 'vue';

import { ref } from 'vue';

/** 上一次点选的索引；null 表示尚无锚点 */
export type PrevSelectedIndex = null | number;

/**
 * @title multipleSelect hooks
 * @description multipleSelect by hold down shift key
 */
export function useMultipleSelect<T, K>(
  getKey: (item: T, index: number, array: T[]) => K,
) {
  // 上一次点选的索引锚点（组件生命周期内持久）
  const prevSelectedIndex: Ref<PrevSelectedIndex> = ref(null);

  /**
   * 执行一次 Shift 连选
   *
   * @param currentSelectedIndex 当前点选的索引
   * @param data 完整数据列表
   * @param selectedKeys 当前已选中的 key 集合（会被原地修改）
   * @returns 本次实际变化（新增或移除）的 key 列表
   */
  const multipleSelect = (
    currentSelectedIndex: number,
    data: T[],
    selectedKeys: Set<K>,
  ) => {
    // 无锚点时以当前索引为锚点（等价于单选范围）
    const configPrevSelectedIndex =
      prevSelectedIndex.value ?? currentSelectedIndex;

    // add/delete the selected range
    // 计算 [锚点, 当前点] 的闭区间
    const startIndex = Math.min(
      configPrevSelectedIndex || 0,
      currentSelectedIndex,
    );
    const endIndex = Math.max(
      configPrevSelectedIndex || 0,
      currentSelectedIndex,
    );
    const rangeKeys = data.slice(startIndex, endIndex + 1).map<K>(getKey);
    // 区间内存在未选中项 → 本次为"选中"；否则为"取消选中"
    const shouldSelected = rangeKeys.some(
      (rangeKey) => !selectedKeys.has(rangeKey),
    );
    const changedKeys: K[] = [];

    rangeKeys.forEach((item) => {
      if (shouldSelected) {
        // 选中模式：仅把未选中的加入集合并记为变化
        if (!selectedKeys.has(item)) {
          changedKeys.push(item);
        }
        selectedKeys.add(item);
      } else {
        // 取消模式：全部移除并记为变化
        selectedKeys.delete(item);
        changedKeys.push(item);
      }
    });

    // 更新锚点：选中时锚定区间末尾，取消时清空锚点（下次从当前点重新开始）
    prevSelectedIndex.value = shouldSelected ? endIndex : null;

    return changedKeys;
  };

  /** 手动重置锚点（外部在普通点选/清空选择时调用） */
  const setPrevSelectedIndex = (value: PrevSelectedIndex) => {
    prevSelectedIndex.value = value;
  };

  return [multipleSelect, setPrevSelectedIndex] as const;
}

import type { Ref } from 'vue';

import type { Key } from '@arvin-studio/headless';

import { computed } from 'vue';

export type ItemHeightData = [key: Key, height: number, column?: number];

export type ItemPositions = Map<
  Key,
  {
    column: number;
    top: number;
  }
>;

/**
 * Auto arrange the items in the masonry layout.
 * Always get stable positions by order
 * instead of dynamic adjust for next item height.
 */

export default function usePositions(
  itemHeights: Ref<ItemHeightData[]>,
  columnCount: Ref<number>,
  verticalGutter: Ref<number>,
) {
  // ==================== Auto Order ====================
  const autoOrder = computed(() => {
    // eslint-disable-next-line unicorn/no-array-from-fill
    const columnHeights = Array.from({ length: columnCount.value }).fill(
      0,
    ) as number[];
    const itemPositions: ItemPositions = new Map();
    for (let i = 0; i < itemHeights.value.length; i += 1) {
      const [itemKey, itemHeight, itemColumn] = itemHeights.value[i]!;

      let targetColumnIndex =
        itemColumn ?? columnHeights.indexOf(Math.min(...columnHeights));
      targetColumnIndex = Math.min(targetColumnIndex, columnCount.value - 1);

      const top = columnHeights[targetColumnIndex]!;
      itemPositions.set(itemKey, {
        column: targetColumnIndex,
        top,
      });

      columnHeights[targetColumnIndex]! += itemHeight + verticalGutter.value;
    }

    return [
      itemPositions,
      Math.max(0, Math.max(...columnHeights) - verticalGutter.value),
    ] as const;
  });
  // ====================== Return ======================
  const orderItemPositions = computed(() => autoOrder.value[0]!);
  const orderTotalHeight = computed(() => autoOrder.value[1]!);
  return [orderItemPositions, orderTotalHeight] as const;
}

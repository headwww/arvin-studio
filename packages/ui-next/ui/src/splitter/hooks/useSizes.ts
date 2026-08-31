import type { Ref } from 'vue';

import type { PanelProps } from '../interface';

import { computed, shallowRef, unref } from 'vue';

import { autoPtgSizes } from './sizeUtil';

export function getPtg(str: string) {
  return Number(str.slice(0, -1)) / 100;
}

function isPtg(itemSize: number | string | undefined): itemSize is string {
  return typeof itemSize === 'string' && itemSize.endsWith('%');
}

/**
 * Save the size state.
 * Align the size into flex percentage base.
 */

export default function useSizes(
  items: Ref<PanelProps[]>,
  containerSize?: Ref<number>,
) {
  const propSizes = computed(() => items.value.map((item) => item.size));
  const itemsCount = computed(() => items.value.length);

  const mergedContainerSize = computed(() => unref(containerSize) || 0);
  const ptg2px = (ptg: number) => ptg * mergedContainerSize.value;

  // We do not need care the size state match the `items` length in `useState`.
  // It will calculate later.
  const innerSizes = shallowRef<(number | string | undefined)[]>([]);

  // Track the last known items count to detect panel add/remove
  let lastItemsCount = 0;

  const sizes = computed(() => {
    const currentCount = itemsCount.value;

    // Initialize or re-initialize innerSizes when items count changes
    // This happens on first render or when panels are added/removed
    if (currentCount !== lastItemsCount) {
      lastItemsCount = currentCount;
      innerSizes.value = items.value?.map((item) => item.defaultSize);
    }

    // 读取 innerSizes 建立响应式依赖：拖动时 setInnerSizes 更新后本 computed 会重算，
    // 否则 panelSizes 不会刷新，拖动不会生效。
    const inner = innerSizes.value;

    // If any panel has a defined size prop, use all propSizes
    // (let undefined values be handled by autoPtgSizes).
    // Otherwise fall back to innerSizes.
    // size != null 同时排除 null / undefined：Vue 中未传 size 时是 undefined，
    // 原 size !== null 会误判为「已设置 size」，导致拖动写入的 innerSizes 永远被忽略。
    // oxlint-disable-next-line eqeqeq
    return propSizes.value.some((size) => size != null)
      ? propSizes.value
      : inner;
  });

  const postPercentMinSizes = computed(() => {
    return items.value.map((item) => {
      if (isPtg(item.min)) {
        return getPtg(item.min);
      }
      return (item.min || 0) / mergedContainerSize.value;
    });
  });

  const postPercentMaxSizes = computed(() => {
    return items.value.map((item) => {
      if (isPtg(item.max)) {
        return getPtg(item.max);
      }
      return (
        (item.max || mergedContainerSize.value) / mergedContainerSize.value
      );
    });
  });

  // Post handle the size. Will do:
  // 1. Convert all the px into percentage if not empty.
  // 2. Get rest percentage for exist percentage.
  // 3. Fill the rest percentage into empty item.
  const postPercentSizes = computed(() => {
    const ptgList: (number | undefined)[] = [];

    // Fill default percentage
    for (let i = 0; i < itemsCount.value; i += 1) {
      const itemSize = sizes.value[i];

      if (isPtg(itemSize)) {
        ptgList[i] = getPtg(itemSize);
      } else if (itemSize || itemSize === 0) {
        const num = Number(itemSize);
        if (!Number.isNaN(num)) {
          ptgList[i] = num / mergedContainerSize.value;
        }
      } else {
        ptgList[i] = undefined;
      }
    }

    // Use autoPtgSizes to handle the undefined sizes
    return autoPtgSizes(
      ptgList,
      postPercentMinSizes.value,
      postPercentMaxSizes.value,
    );
  });

  const postPxSizes = computed(() => postPercentSizes.value.map(ptg2px));

  // If ssr, we will use the size from developer config first.
  const panelSizes = computed(() =>
    containerSize?.value ? postPxSizes.value : sizes.value,
  );

  const setInnerSizes = (newSizes: number[]) => {
    innerSizes.value = newSizes;
  };

  return [
    panelSizes,
    postPxSizes,
    postPercentSizes,
    postPercentMinSizes,
    postPercentMaxSizes,
    setInnerSizes,
  ] as const;
}

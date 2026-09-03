import type { Ref } from 'vue';

import type { Tab, TabNavListProps } from '../interface';

import { computed, shallowRef, watch } from 'vue';

export interface TabOffsetInfo {
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

export type TabOffsetMap = Map<string, TabOffsetInfo>;

const DEFAULT_SIZE: TabOffsetInfo = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  right: 0,
};

export type ContainerSizeInfo = [
  width: number,
  height: number,
  left: number,
  top: number,
];

export default function useVisibleRange(
  tabOffsets: Ref<TabOffsetMap>,
  visibleTabContentValue: Ref<number>,
  transform: Ref<number>,
  tabContentSizeValue: Ref<number>,
  addNodeSizeValue: Ref<number>,
  operationNodeSizeValue: Ref<number>,
  {
    tabs,
    tabPosition,
    rtl,
  }: { rtl: Ref<boolean>; tabPosition: Ref<TabNavListProps['tabPosition']> } & {
    tabs: Ref<Tab[]>;
  },
): Ref<[visibleStart: number, visibleEnd: number]> {
  const isHorizontal = computed(
    () => tabPosition.value === 'top' || tabPosition.value === 'bottom',
  );
  const charUnit = computed<'height' | 'width'>(() =>
    isHorizontal.value ? 'width' : 'height',
  );
  const position = computed<'left' | 'right' | 'top'>(() =>
    isHorizontal.value ? (rtl.value ? 'right' : 'left') : 'top',
  );
  const transformSize = computed(() =>
    isHorizontal.value ? Math.abs(transform.value) : -transform.value,
  );

  const rangeRef = shallowRef<[number, number]>([0, 0]);

  watch(
    [
      tabOffsets,
      visibleTabContentValue,
      tabContentSizeValue,
      addNodeSizeValue,
      operationNodeSizeValue,
      transformSize,
      tabPosition,
      rtl,
      () => tabs.value.map((tab) => tab.key).join('_'),
    ],
    () => {
      const list = tabs.value;
      if (list.length === 0) {
        rangeRef.value = [0, 0];
        return;
      }

      const len = list.length;
      let endIndex = len;
      for (let i = 0; i < len; i += 1) {
        const offset = tabOffsets.value.get(list[i]!.key) || DEFAULT_SIZE;
        if (
          Math.floor(offset[position.value] + offset[charUnit.value]) >
          Math.floor(transformSize.value + visibleTabContentValue.value)
        ) {
          endIndex = i - 1;
          break;
        }
      }

      let startIndex = 0;
      for (let i = len - 1; i >= 0; i -= 1) {
        const offset = tabOffsets.value.get(list[i]!.key) || DEFAULT_SIZE;
        if (offset[position.value] < transformSize.value) {
          startIndex = i + 1;
          break;
        }
      }

      rangeRef.value = startIndex > endIndex ? [0, -1] : [startIndex, endIndex];
    },
    { immediate: true },
  );

  return rangeRef;
}

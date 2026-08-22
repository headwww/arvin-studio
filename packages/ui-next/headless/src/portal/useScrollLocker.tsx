import type { ComputedRef, Ref, ShallowRef } from 'vue';

import { computed, shallowRef, unref, watch } from 'vue';

import { getTargetScrollBarSize, removeCSS, updateCSS } from '../util';
import { isBodyOverflowing } from './util';

const UNIQUE_ID = `headless-util-locker-${Date.now()}`;

let uuid = 0;
export default function useScrollLocker(
  lock?: boolean | ComputedRef<boolean> | Ref<boolean> | ShallowRef<boolean>,
) {
  const mergedLock = computed(() => unref(lock));
  uuid += 1;
  const id = shallowRef(`${UNIQUE_ID}_${uuid}`);
  watch(
    [id, mergedLock],
    async (_, _o, onCleanup) => {
      if (mergedLock.value) {
        const scrollbarSize = getTargetScrollBarSize(document.body).width;
        const isOverflow = isBodyOverflowing();

        updateCSS(
          `
html body {
  overflow-y: hidden;
  ${isOverflow ? `width: calc(100% - ${scrollbarSize}px);` : ''}
}`,
          id.value,
        );

        onCleanup(() => {
          removeCSS(id.value);
        });
      } else {
        removeCSS(id.value);
      }
    },
    {
      flush: 'post',
      immediate: true,
    },
  );
}

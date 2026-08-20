import { shallowRef } from 'vue';

import { raf } from '@arvin-studio/headless';

/**
 * When click on the label,
 * the event will be stopped to prevent the label from being clicked twice.
 * label click -> input click -> label click again
 */
export default function useBubbleLock(onOriginInputClick?: (e: Event) => void) {
  const labelClickLockRef = shallowRef<null | number>(null);

  const clearLock = () => {
    raf.cancel(labelClickLockRef.value!);
    labelClickLockRef.value = null;
  };

  const onLabelClick = () => {
    clearLock();

    labelClickLockRef.value = raf(() => {
      labelClickLockRef.value = null;
    });
  };

  const onInputClick = (e: Event) => {
    if (labelClickLockRef.value) {
      e.stopPropagation();
      clearLock();
    }

    onOriginInputClick?.(e);
  };

  return [onLabelClick, onInputClick] as const;
}

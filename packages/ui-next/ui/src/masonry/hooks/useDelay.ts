import { onUnmounted, shallowRef } from 'vue';

import { raf } from '@arvin-studio/headless';

export default function useDelay(callback: VoidFunction) {
  const idRef = shallowRef(0);
  const clearRaf = () => {
    raf.cancel(idRef.value);
  };
  onUnmounted(() => {
    clearRaf();
  });
  return () => {
    clearRaf();
    idRef.value = raf(callback);
  };
}

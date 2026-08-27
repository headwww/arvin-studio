import { shallowRef } from 'vue';

/**
 * Callback will only execute last one for each raf
 */
import { raf } from '@arvin-studio/headless';

export default function useRafDebounce(callback: VoidFunction) {
  const executeRef = shallowRef(false);
  const rafRef = shallowRef<null | number>(null);

  const wrapperCallback = callback;
  return () => {
    if (executeRef.value) {
      return;
    }
    executeRef.value = true;
    wrapperCallback();
    rafRef.value = raf(() => {
      executeRef.value = false;
    });
  };
}

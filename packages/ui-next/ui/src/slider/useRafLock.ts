import type { Ref } from 'vue';

import { onBeforeUnmount, shallowRef } from 'vue';

import { raf } from '@arvin-studio/headless';

export default function useRafLock(): [
  state: Ref<boolean>,
  setState: (nextState: boolean) => void,
] {
  const state = shallowRef(false);
  const rafRef = shallowRef<null | number>(null);
  const cleanup = () => {
    raf.cancel(rafRef.value!);
  };
  const setDelayState = (nextState: boolean) => {
    cleanup();
    if (nextState) {
      state.value = nextState;
    } else {
      rafRef.value = raf(() => {
        state.value = nextState;
      });
    }
  };

  onBeforeUnmount(() => {
    cleanup();
  });
  return [state, setDelayState];
}

import type { Ref } from 'vue';

import { ref } from 'vue';

import useEvent from '../../util/hooks/useEvent';
import channelUpdate from './channelUpdate';

type Updater<T> = ((origin: T) => T) | T;

type UpdateCallbackFunc = () => void;

type NotifyEffectUpdate = (callback: UpdateCallbackFunc) => void;

/**
 * Batcher for record any useEffectState need update.
 */
export function useBatcher(): NotifyEffectUpdate {
  // Updater Trigger
  const updateFuncRef = ref<null | UpdateCallbackFunc[]>(null);

  // Notify update
  const notifyEffectUpdate: NotifyEffectUpdate = (callback) => {
    if (!updateFuncRef.value) {
      updateFuncRef.value = [];

      channelUpdate(() => {
        updateFuncRef.value!.forEach((fn) => {
          fn();
        });
        updateFuncRef.value = null;
      });
    }

    updateFuncRef.value.push(callback);
  };

  return notifyEffectUpdate;
}

/**
 * Trigger state update by ref to save perf.
 */
export default function useEffectState<T>(
  notifyEffectUpdate: NotifyEffectUpdate,
  defaultValue?: null | T | undefined,
): [Ref<null | T | undefined>, (nextValue: Updater<T>) => void] {
  // Value
  const stateValue = ref(defaultValue) as Ref<null | T | undefined>;

  // Set State
  const setEffectVal = useEvent((nextValue: Updater<T>) => {
    notifyEffectUpdate(() => {
      if (typeof nextValue === 'function') {
        const updater = nextValue as (origin: null | T | undefined) => T;
        stateValue.value = updater(stateValue.value as T);
      } else {
        stateValue.value = nextValue as any;
      }
    });
  });

  return [stateValue, setEffectVal];
}

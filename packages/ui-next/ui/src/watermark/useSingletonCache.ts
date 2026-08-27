import { ref } from 'vue';

import { isEqual } from '@arvin-studio/kit';

export type GetCache<T, R> = (cacheKeys: T, callback: () => R) => R;

/**
 * Singleton cache will only take latest `cacheParams` as key
 * and return the result for callback matching.
 */
export default function useSingletonCache<T extends any[], R>(): GetCache<
  T,
  R
> {
  const cacheRef = ref<[any[] | null, null | R]>([null, null]);

  const getCache: GetCache<T, R> = (cacheKeys, callback) => {
    const filteredKeys = cacheKeys.map((item) => {
      return item instanceof HTMLElement || Number.isNaN(item) ? '' : item;
    });
    if (!isEqual(cacheRef.value[0], filteredKeys)) {
      cacheRef.value = [filteredKeys, callback()];
    }
    return cacheRef.value[1]! as any;
  };

  return getCache as GetCache<T, R>;
}

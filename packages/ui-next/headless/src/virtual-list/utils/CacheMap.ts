import type { Key } from '../../util';

import { shallowRef } from 'vue';

// Firefox has low performance of map.
class CacheMap {
  diffRecords = new Map<Key, number>();

  // Used for cache key
  // `useMemo` no need to update if `id` not change
  id = shallowRef(0);

  maps: Record<string, number>;

  constructor() {
    this.maps = Object.create(null);
  }

  get(key: Key) {
    return this.maps[key as string];
  }

  getRecord() {
    return this.diffRecords;
  }

  /**
   * CacheMap will record the key changed.
   * To help to know what's update in the next render.
   */
  resetRecord() {
    this.diffRecords.clear();
  }

  set(key: Key, value: number) {
    // Record prev value
    this.diffRecords.set(key, this.maps[key as string]!);

    this.maps[key as string] = value;
    this.id.value += 1;
  }
}

export default CacheMap;

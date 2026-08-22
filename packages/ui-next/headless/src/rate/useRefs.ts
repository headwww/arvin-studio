import type { Ref } from 'vue';

import type { Key } from '../util';

import { onBeforeUpdate, ref } from 'vue';

import { getDOM } from '../util';

export type RefsValue = Map<Key, any>;
type UseRef = [(key: Key) => (el: any) => void, Ref<RefsValue>];
function useRefs(): UseRef {
  const refs = ref<RefsValue>(new Map());

  const setRef = (key: Key) => (el: any) => {
    refs.value.set(key, getDOM(el));
  };
  onBeforeUpdate(() => {
    refs.value = new Map();
  });
  return [setRef, refs];
}

export default useRefs;

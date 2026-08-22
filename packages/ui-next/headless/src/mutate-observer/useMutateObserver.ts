import type { Ref } from 'vue';

import { ref, watchEffect } from 'vue';

import { canUseDom } from '../util';

const defaultOptions: Ref<MutationObserverInit> = ref({
  subtree: true,
  childList: true,
  attributeFilter: ['style', 'class'],
});

export default function useMutateObserver(
  nodeOrList: Ref<Element | Element[] | null | Text>,
  callback: MutationCallback,
  options: Ref<MutationObserverInit | undefined> = defaultOptions,
) {
  watchEffect((onCleanup) => {
    if (!canUseDom()) {
      return;
    }
    if (!nodeOrList.value) {
      return;
    }
    let ins: MutationObserver;

    const nodeList = Array.isArray(nodeOrList.value)
      ? nodeOrList.value
      : [nodeOrList.value];

    if ('MutationObserver' in window) {
      ins = new MutationObserver(callback);
      nodeList.forEach((node) => ins.observe(node, options.value));
    }

    onCleanup(() => {
      ins?.takeRecords();
      ins?.disconnect();
    });
  });
}

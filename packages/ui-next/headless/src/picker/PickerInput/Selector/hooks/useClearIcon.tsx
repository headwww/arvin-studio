import type { ComputedRef, Ref } from 'vue';

import type { VueNode } from '../../../../util';

import { computed } from 'vue';

export function fillClearIcon(
  prefixCls: string,
  allowClear?: boolean | { clearIcon?: VueNode },
  clearIcon?: VueNode,
) {
  if (allowClear === false) {
    return null;
  }

  const config = allowClear && typeof allowClear === 'object' ? allowClear : {};

  return (
    config.clearIcon || clearIcon || <span class={`${prefixCls}-clear-btn`} />
  );
}

export default function useClearIcon(
  prefixCls: Ref<string>,
  allowClear?: Ref<boolean | { clearIcon?: VueNode }>,
  clearIcon?: ComputedRef<VueNode>,
): ComputedRef<VueNode> {
  return computed(() =>
    fillClearIcon(prefixCls.value, allowClear?.value, clearIcon?.value),
  );
}

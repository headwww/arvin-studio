import type { Ref } from 'vue';

import { computed } from 'vue';

import { useToken } from '../../theme/internal';

/**
 * This hook is only for cssVar to add root className for components.
 * If root ClassName is needed, this hook could be refactored with `-root`
 * @param prefixCls
 */
function useCSSVarCls(prefixCls: Ref<string>) {
  const cssVar = useToken()[4];

  return computed(() => (cssVar?.value ? `${prefixCls.value}-css-var` : ''));
}

export default useCSSVarCls;

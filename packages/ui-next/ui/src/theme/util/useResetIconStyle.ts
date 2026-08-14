import type { Ref } from 'vue';

import type { CSPConfig } from '../../config-provider';

import { computed } from 'vue';

import { useStyleRegister } from '@arvin-studio/cssinjs';

import { genIconStyle } from '../../style';
import useToken from '../useToken';

function useResetIconStyle(
  iconPrefixCls: Ref<string>,
  csp?: Ref<CSPConfig | undefined>,
) {
  const [theme, token] = useToken();
  return useStyleRegister(
    computed(
      () =>
        ({
          theme: theme?.value,
          token: token?.value,
          hashId: '',
          path: ['as-icons', iconPrefixCls.value],
          nonce: () => csp?.value?.nonce ?? '',
          layer: {
            name: 'as',
          },
        }) as any,
    ),
    () => genIconStyle(iconPrefixCls.value),
  );
}

export default useResetIconStyle;

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useComponentBaseConfig } from '../config-provider/context';
import useStyle from './style/index';

export const Table = defineComponent(
  (props) => {
    const { prefixCls } = useComponentBaseConfig('table', props);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    console.log(hashId.value, cssVarCls.value);

    return () => {
      return <div class={clsx(prefixCls.value)}></div>;
    };
  },
  {
    name: 'AsTable',
  },
);

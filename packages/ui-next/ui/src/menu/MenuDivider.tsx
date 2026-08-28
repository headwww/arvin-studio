import { defineComponent } from 'vue';

import { Divider } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { pureAttrs } from '../_util/hooks';
import { useBaseConfig } from '../config-provider/context';

export interface MenuDividerProps {
  dashed?: boolean;
  prefixCls?: string;
}

const MenuDivider = defineComponent<MenuDividerProps>(
  (props, { attrs }) => {
    const { prefixCls } = useBaseConfig('menu', props);
    return () => {
      const classString = clsx(
        {
          [`${prefixCls.value}-item-divider-dashed`]: !!props.dashed,
        },
        (attrs as any).class,
      );
      return (
        <Divider
          class={classString}
          style={(attrs as any).style}
          {...pureAttrs(attrs)}
        />
      );
    };
  },
  {
    name: 'AsMenuDivider',
    inheritAttrs: false,
  },
);

export default MenuDivider;

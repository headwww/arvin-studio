import type { MenuDividerType } from './interface';

import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useMenuContext } from './context/MenuContext';
import { useMeasure } from './context/PathContext';

export type DividerProps = Omit<MenuDividerType, 'type'>;

const Divider = defineComponent<DividerProps>(
  (props) => {
    const menuContext = useMenuContext();
    const measure = useMeasure();
    return () => {
      const { prefixCls } = menuContext?.value ?? {};
      if (measure) {
        return null;
      }
      return (
        <li
          class={clsx(`${prefixCls}-item-divider`, props.class)}
          role="separator"
          style={props.style}
        />
      );
    };
  },
  {
    name: 'Divider',
  },
);

export default Divider;

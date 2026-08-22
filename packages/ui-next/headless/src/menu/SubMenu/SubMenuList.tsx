import { defineComponent } from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useMenuContext } from '../context/MenuContext';

const InternalSubMenuList = defineComponent(
  (_, { attrs, slots }) => {
    const menuContext = useMenuContext();
    return () => {
      const { prefixCls, mode, rtl } = menuContext?.value ?? {};
      return (
        <ul
          class={clsx(
            prefixCls,
            !!rtl && `${prefixCls}-rtl`,
            `${prefixCls}-sub`,
            `${prefixCls}-${mode === 'inline' ? 'inline' : 'vertical'}`,
          )}
          role="menu"
          {...attrs}
          data-menu-list
        >
          {slots?.default?.()}
        </ul>
      );
    };
  },
  {
    name: 'InlineSubMenuList',
    inheritAttrs: false,
  },
);

export default InternalSubMenuList;

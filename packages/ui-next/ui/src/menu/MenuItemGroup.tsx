import type { SlotsType } from 'vue';

import type { MenuItemGroupProps as VcMenuItemGroupProps } from '@arvin-studio/headless';

import type { EmptyEmit, VueNode } from '../_util';

import { defineComponent } from 'vue';

import { MenuItemGroup as VcMenuItemGroup } from '@arvin-studio/headless';
import { omit } from '@arvin-studio/kit';

import { pureAttrs } from '../_util/hooks';
import { getSlotPropsFnRun } from '../_util/tools';

export interface MenuItemGroupProps extends Omit<
  VcMenuItemGroupProps,
  'children' | 'title'
> {
  title?: VueNode;
}

export interface MenuItemGroupSlots {
  default?: () => any;
  title?: () => any;
}

const MenuItemGroup = defineComponent<
  MenuItemGroupProps,
  EmptyEmit,
  string,
  SlotsType<MenuItemGroupSlots>
>(
  (props, { slots, attrs }) => {
    return () => {
      const title = getSlotPropsFnRun(slots, props, 'title');
      return (
        <VcMenuItemGroup
          {...pureAttrs(attrs)}
          {...omit(props, ['title'])}
          title={title}
        >
          {slots?.default?.()}
        </VcMenuItemGroup>
      );
    };
  },
  {
    name: 'AsMenuItemGroup',
    inheritAttrs: false,
  },
);

export default MenuItemGroup;

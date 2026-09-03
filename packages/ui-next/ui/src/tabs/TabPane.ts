import type { CSSProperties, SlotsType } from 'vue';

import type { TabPaneProps as VcTabPaneProps } from '@arvin-studio/headless';

import type { EmptyEmit } from '../_util';

import { defineComponent } from 'vue';

export interface TabPaneProps extends VcTabPaneProps {
  class?: string;
  /** @deprecated Please use `destroyOnHidden` instead */
  destroyInactiveTabPane?: boolean;
  style?: CSSProperties;
}

export interface TabPaneSlots {
  closeIcon?: () => any;
  default?: () => any;
  icon?: () => any;
  tab?: () => any;
}

const TabPane = defineComponent<
  TabPaneProps,
  EmptyEmit,
  string,
  SlotsType<TabPaneSlots>
>(
  () => {
    return () => null;
  },
  {
    name: 'AsTabPane',
    inheritAttrs: false,
  },
);

export default TabPane;

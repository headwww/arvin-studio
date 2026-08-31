import type { CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../_util';
import type { Breakpoint } from '../_util/responsiveObserver';
import type { ComponentBaseProps } from '../config-provider/context';
import type {
  CellSemanticClassNames,
  CellSemanticStyles,
} from './DescriptionsContext';

import { defineComponent } from 'vue';

export const DESCRIPTIONS_ITEM_MARK = '_ASDV_NEXT_DESCRIPTIONS_ITEM';

export interface DescriptionsItemProps extends ComponentBaseProps {
  class?: string;
  classes?: CellSemanticClassNames;
  content?: VueNode;
  label?: VueNode;
  span?: 'filled' | number | { [key in Breakpoint]?: number };
  style?: CSSProperties;
  styles?: CellSemanticStyles;
}

export interface DescriptionsItemSlots {
  content?: () => any;
  default?: () => any;
  label?: () => any;
}

const DescriptionsItem = defineComponent<
  DescriptionsItemProps,
  EmptyEmit,
  string,
  SlotsType<DescriptionsItemSlots>
>(
  () => {
    return () => null;
  },
  {
    name: 'AsDescriptionsItem',
    inheritAttrs: false,
  },
);

(DescriptionsItem as any)[DESCRIPTIONS_ITEM_MARK] = true;

export default DescriptionsItem;

import type { CSSProperties, SlotsType } from 'vue';

import type { EmptyEmit, VueNode } from '../_util';
import type {
  CollapseSemanticClassNames,
  CollapseSemanticStyles,
} from './Collapse';

import { defineComponent } from 'vue';

export type CollapsibleType = 'disabled' | 'header' | 'icon';

export const COLLAPSE_PANEL_MARK = '_ASDV_NEXT_COLLAPSE_PANEL';

export interface CollapsePanelProps {
  class?: string;
  classes?: Partial<CollapseSemanticClassNames>;
  collapsible?: CollapsibleType;
  extra?: VueNode;
  forceRender?: boolean;
  header?: VueNode;
  id?: string;
  key: number | string;
  prefixCls?: string;
  showArrow?: boolean;
  style?: CSSProperties;
  styles?: Partial<CollapseSemanticStyles>;
}

export interface CollapsePanelSlots {
  default?: () => any;
  extra?: () => any;
  header?: () => any;
}

const CollapsePanel = defineComponent<
  CollapsePanelProps,
  EmptyEmit,
  string,
  SlotsType<CollapsePanelSlots>
>(
  () => {
    return () => null;
  },
  {
    name: 'AsCollapsePanel',
    inheritAttrs: false,
  },
);

(CollapsePanel as any)[COLLAPSE_PANEL_MARK] = true;

export default CollapsePanel;

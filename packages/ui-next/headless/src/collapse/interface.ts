import type { CSSProperties, Ref, TransitionProps } from 'vue';

import type { Key, VueNode } from '../util';

export type SemanticName = 'body' | 'header' | 'icon' | 'title';

export interface CollapsePanelProps {
  accordion?: boolean;
  children?: string | VueNode;
  class?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  collapsible?: CollapsibleType;
  destroyOnHidden?: boolean;
  expandIcon?: (props: object) => any;
  extra?: VueNode;
  forceRender?: boolean;
  header?: VueNode;
  headerClass?: string;
  id?: string;
  isActive?: boolean;
  onItemClick?: (panelKey: Key) => void;
  openMotion?: TransitionProps;
  panelKey?: Key;
  prefixCls?: string;
  role?: string;
  showArrow?: boolean;
  style?: object;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export type CollapsibleType = 'disabled' | 'header' | 'icon';

export interface ItemType extends Omit<
  CollapsePanelProps,
  | 'accordion'
  | 'expandIcon'
  | 'header' // alias of label
  | 'isActive'
  | 'openMotion'
  | 'panelKey' // alias of key
  | 'prefixCls'
> {
  key?: CollapsePanelProps['panelKey'];
  label?: CollapsePanelProps['header'];
  ref?: Ref<HTMLDivElement>;
}

export interface CollapseProps {
  accordion?: boolean;
  activeKey?: Key | Key[];
  classNames?: Partial<Record<SemanticName, string>>;
  collapsible?: CollapsibleType;
  defaultActiveKey?: Key | Key[];
  destroyOnHidden?: boolean;
  expandIcon?: (props: object) => any;
  items?: ItemType[];
  onChange?: (key: Key[]) => void;
  openMotion?: TransitionProps;
  prefixCls?: string;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
}

export type { Key };

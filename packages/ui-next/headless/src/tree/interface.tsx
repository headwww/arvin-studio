import type { CSSProperties, VNode } from 'vue';

import type { MouseEventHandler, Key as VCKey, VueNode } from '../util';

export type Key = VCKey;
export type SafeKey = Exclude<Key, bigint>;

export interface TreeNodeProps<TreeDataType extends BasicDataNode = DataNode> {
  active?: boolean;
  checkable?: boolean;
  checked?: boolean;
  children?: VueNode;
  className?: string;
  /** New added in Tree for easy data access */
  data?: TreeDataType;

  disableCheckbox?: boolean;
  disabled?: boolean;
  domRef?: HTMLDivElement;
  dragOver?: boolean;
  dragOverGapBottom?: boolean;
  dragOverGapTop?: boolean;

  eventKey?: Key; // Pass by parent
  // By parent
  expanded?: boolean;
  halfChecked?: boolean;
  icon?: IconType;
  id?: Key;
  isEnd?: boolean[];
  // By user
  isLeaf?: boolean;
  isStart?: boolean[];
  loaded?: boolean;
  loading?: boolean;
  onMouseMove?: MouseEventHandler;

  pos?: string;
  prefixCls?: string;
  selectable?: boolean;
  selected?: boolean;
  style?: CSSProperties;
  switcherIcon?: IconType;
  title?: ((data: TreeDataType) => VueNode) | VueNode;
  treeId?: string;
}

export type IconType = ((props: TreeNodeProps) => VueNode) | VueNode;

/** For fieldNames, we provides a abstract interface */
export interface BasicDataNode {
  [key: string]: any;
  checkable?: boolean;
  /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
  className?: string;
  disableCheckbox?: boolean;
  disabled?: boolean;
  icon?: IconType;
  isLeaf?: boolean;

  selectable?: boolean;
  style?: CSSProperties;
  switcherIcon?: IconType;
}

/** Provide a wrap type define for developer to wrap with customize fieldNames data type */
export type FieldDataNode<
  T,
  ChildFieldName extends string = 'children',
> = BasicDataNode &
  Partial<Record<ChildFieldName, FieldDataNode<T, ChildFieldName>[]>> &
  T;

export type DataNode = FieldDataNode<{
  key: Key;
  title?: ((data: DataNode) => VueNode) | VueNode;
}>;

export type EventDataNode<TreeDataType> = BasicDataNode &
  TreeDataType & {
    active: boolean;
    checked: boolean;
    dragOver: boolean;
    dragOverGapBottom: boolean;
    dragOverGapTop: boolean;
    expanded: boolean;
    halfChecked: boolean;
    key: Key;
    loaded: boolean;
    loading: boolean;
    pos: string;
    selected: boolean;
  };

export type NodeElement = VNode & {
  type: any & {
    isTreeNode?: boolean;
  };
};

export interface Entity {
  children?: Entity[];
  index: number;
  key: Key;
  node: NodeElement;
  parent?: Entity;
  pos: string;
}

export interface DataEntity<
  TreeDataType extends BasicDataNode = any,
> extends Omit<Entity, 'children' | 'node' | 'parent'> {
  children?: DataEntity<TreeDataType>[];
  level: number;
  node: TreeDataType;
  nodes: TreeDataType[];
  parent?: DataEntity<TreeDataType>;
}

export type KeyEntities<DateType extends BasicDataNode = any> = Record<
  string,
  DataEntity<DateType>
>;

export interface FlattenNode<TreeDataType extends BasicDataNode = DataNode> {
  children: FlattenNode<TreeDataType>[];
  data: TreeDataType;
  isEnd: boolean[];
  isStart: boolean[];
  key: Key;
  parent: FlattenNode<TreeDataType> | null;
  pos: string;
  title: VueNode;
}

export type GetKey<RecordType> = (record: RecordType, index?: number) => Key;

export type GetCheckDisabled<RecordType> = (record: RecordType) => boolean;

export type Direction = 'ltr' | 'rtl' | undefined;

export interface FieldNames {
  /** @private Internal usage for `vc-tree-select`, safe to remove if no need */
  _title?: string[];
  children?: string;
  key?: string;
  title?: string;
}

import type { CSSProperties, InjectionKey } from 'vue';

import type {
  BasicDataNode,
  DataNode,
  Direction,
  EventDataNode,
  IconType,
  Key,
  KeyEntities,
  TreeNodeProps,
} from './interface';
import type { AllowDropOptions } from './util';

export interface NodeMouseEventParams<
  TreeDataType extends BasicDataNode = DataNode,
> {
  event: MouseEvent;
  node: EventDataNode<TreeDataType>;
}

export interface NodeDragEventParams<
  TreeDataType extends BasicDataNode = DataNode,
> {
  event: DragEvent;
  node: EventDataNode<TreeDataType>;
}

export type NodeMouseEventHandler<
  TreeDataType extends BasicDataNode = DataNode,
> = (e: MouseEvent, node: EventDataNode<TreeDataType>) => void;

export type NodeDragEventHandler<
  TreeDataType extends BasicDataNode = DataNode,
> = (
  e: DragEvent,
  nodeProps: TreeNodeProps<TreeDataType>,
  outsideTree?: boolean,
) => void;

export type DraggableFn = (node: DataNode) => boolean;
export interface DraggableConfig {
  icon?: any | false;
  nodeDraggable?: DraggableFn;
}

export interface DropIndicatorRenderProps {
  direction: Direction;
  dropLevelOffset: number;
  dropPosition: -1 | 0 | 1;
  indent: number;
  prefixCls: string;
}

export type SemanticName = 'item' | 'itemIcon' | 'itemSwitcher' | 'itemTitle';

export interface TreeContextProps<
  TreeDataType extends BasicDataNode = DataNode,
> {
  allowDrop?: (options: AllowDropOptions<TreeDataType>) => boolean;
  checkable: any | boolean;
  checkStrictly: boolean;
  classNames?: Partial<Record<SemanticName, string>>;
  direction: Direction;
  disabled: boolean;
  draggable?: DraggableConfig;
  draggingNodeKey?: Key | null;
  dragOverNodeKey: Key | null;
  dropContainerKey: Key | null;
  dropIndicatorRender: (props: DropIndicatorRenderProps) => any;
  dropLevelOffset?: null | number;
  dropPosition: -1 | 0 | 1 | null;
  dropTargetKey: Key | null;
  filterTreeNode?: (treeNode: EventDataNode<TreeDataType>) => boolean;
  icon?: IconType;
  indent: null | number;
  keyEntities: KeyEntities;
  loadData?: (treeNode: EventDataNode<TreeDataType>) => Promise<void>;
  onNodeCheck: (
    e: MouseEvent,
    treeNode: EventDataNode<TreeDataType>,
    checked: boolean,
  ) => void;
  onNodeClick: NodeMouseEventHandler<TreeDataType>;
  onNodeContextMenu: NodeMouseEventHandler<TreeDataType>;
  onNodeDoubleClick: NodeMouseEventHandler<TreeDataType>;
  onNodeDragEnd: NodeDragEventHandler<TreeDataType>;
  onNodeDragEnter: NodeDragEventHandler<TreeDataType>;
  onNodeDragLeave: NodeDragEventHandler<TreeDataType>;
  onNodeDragOver: NodeDragEventHandler<TreeDataType>;
  onNodeDragStart: NodeDragEventHandler<TreeDataType>;
  onNodeDrop: NodeDragEventHandler<TreeDataType>;
  onNodeExpand: NodeMouseEventHandler<TreeDataType>;
  onNodeLoad: (treeNode: EventDataNode<TreeDataType>) => void;
  onNodeMouseEnter: NodeMouseEventHandler<TreeDataType>;
  onNodeMouseLeave: NodeMouseEventHandler<TreeDataType>;
  onNodeSelect: NodeMouseEventHandler<TreeDataType>;
  prefixCls: string;
  selectable: boolean;
  showIcon: boolean;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  switcherIcon?: IconType;
  titleRender?: (node: TreeDataType) => any;
}

export const TreeContextKey: InjectionKey<TreeContextProps<any>> =
  Symbol('TreeContext');

/** Internal usage, safe to remove. Do not use in prod */
export const UnstableContextKey: InjectionKey<{
  nodeDisabled?: (n: DataNode) => boolean;
}> = Symbol('UnstableTreeContext');

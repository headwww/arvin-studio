import Tree from './Tree';
import TreeNode from './TreeNode';

export { UnstableContextKey } from './contextTypes';

export { TreeNode };
export {
  type BasicDataNode,
  type DataEntity,
  type DataNode,
  type EventDataNode,
  type FieldNames,
  type FlattenNode,
  type IconType,
  type Key,
  type KeyEntities,
  type TreeNodeProps,
} from './interface';
export { type ExpandAction, type TreeProps, type TreeRef } from './Tree';
export {
  arrAdd,
  arrDel,
  calcDropPosition,
  calcSelectedKeys,
  conductExpandParent,
  getDragChildrenKeys,
  isFirstChild,
  isLastChild,
  parseCheckedKeys,
  posToArr,
} from './util';

type TreeType = typeof Tree & {
  TreeNode: typeof TreeNode;
};

const ExportTree = Tree as TreeType;
ExportTree.TreeNode = TreeNode;

export default ExportTree;

export { conductCheck } from './utils/conductUtil';

export {
  convertDataToEntities,
  convertTreeToData,
  fillFieldNames,
  flattenTreeData,
} from './utils/treeUtil';

import Tree from './Tree';
import TreeNode from './TreeNode';

export { TreeNode };
export { UnstableContextKey as UnstableTreeContextKey } from './contextTypes';
export {
  type BasicDataNode,
  type DataEntity,
  type DataNode,
  type EventDataNode,
  type FlattenNode,
  type IconType,
  type KeyEntities,
  type FieldNames as TreeFieldNames,
  type TreeNodeProps,
} from './interface';

export { type ExpandAction, type TreeProps, type TreeRef } from './Tree';

type TreeType = typeof Tree & {
  TreeNode: typeof TreeNode;
};

const ExportTree = Tree as TreeType;
ExportTree.TreeNode = TreeNode;

export default ExportTree;

export { ExportTree };
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

export { conductCheck } from './utils/conductUtil';

export {
  convertDataToEntities,
  convertTreeToData,
  fillFieldNames,
  flattenTreeData,
} from './utils/treeUtil';

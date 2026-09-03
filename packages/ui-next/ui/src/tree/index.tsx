import type { App } from 'vue';

import { TreeNode } from '@arvin-studio/headless';

import DirectoryTree from './DirectoryTree';
import TreePure from './Tree';

export type {
  DirectoryTreeEmits,
  ExpandAction as DirectoryTreeExpandAction,
  DirectoryTreeProps,
  DirectoryTreeSlots,
} from './DirectoryTree';

export type {
  AsdTreeNodeAttribute,
  AsTreeNode,
  AsTreeNodeCheckedEvent,
  AsTreeNodeExpandedEvent,
  AsTreeNodeMouseEvent,
  AsTreeNodeProps,
  AsTreeNodeSelectedEvent,
  TreeEmits,
  TreeProps,
  TreeSlots,
} from './Tree';

export type {
  BasicDataNode,
  DataNode,
  EventDataNode,
} from '@arvin-studio/headless';

const Tree = TreePure as typeof TreePure & {
  DirectoryTree: typeof DirectoryTree;
  TreeNode: typeof TreeNode;
};

Tree.DirectoryTree = DirectoryTree;
Tree.TreeNode = TreeNode;

(Tree as any).install = (app: App) => {
  app.component(Tree.name, Tree);
  app.component(DirectoryTree.name, DirectoryTree);
  app.component('AsTreeOption', TreeNode);
};
export { DirectoryTree };
export default Tree;

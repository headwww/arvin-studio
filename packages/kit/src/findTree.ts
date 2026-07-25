import helperCreateTreeFunc from './helperCreateTreeFunc';

export interface FindTreeResult<T = any> {
  index: number;
  item: T;
  path: string[];
  items: T[];
  parent: T;
  nodes: T[];
}

export interface FindTreeOptions {
  children?: string;
}

function findTreeItem(
  parent: any,
  obj: any,
  iterate: (
    this: any,
    item: any,
    index: number,
    items: any,
    path: string[],
    parent: any,
    nodes: any[],
  ) => boolean,
  context: any,
  path: string[],
  node: any[],
  parseChildren: string,
  // oxlint-disable-next-line oxc/only-used-in-recursion
  opts: any,
): FindTreeResult | undefined {
  if (obj) {
    for (let index = 0, len = obj.length; index < len; index++) {
      const item = obj[index];
      const paths = path.concat([`${index}`]);
      const nodes = node.concat([item]);
      if (iterate.call(context, item, index, obj, paths, parent, nodes)) {
        return { index, item, path: paths, items: obj, parent, nodes };
      }
      if (parseChildren && item) {
        const match = findTreeItem(
          item,
          item[parseChildren],
          iterate,
          context,
          paths.concat([parseChildren]),
          nodes,
          parseChildren,
          opts,
        );
        if (match) {
          return match;
        }
      }
    }
  }
  return undefined;
}

/**
 * 从树结构中查找匹配第一条数据的键、值、路径
 * @param list 数组
 * @param iterate(item, index, items, path, parent, nodes) 回调
 * @param options {children: 'children'}
 * @param context 上下文
 */
function findTree<T, C = any>(
  list: T[] | undefined,
  iterate: (
    this: C,
    item: T,
    index: number,
    items: T[],
    path: string[],
    parent: T,
    nodes: T[],
  ) => boolean,
  options?: FindTreeOptions,
  context?: C,
): FindTreeResult<T> | undefined {
  return helperCreateTreeFunc(findTreeItem)(list, iterate, options, context);
}

export default findTree;

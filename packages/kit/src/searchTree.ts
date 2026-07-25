import helperCreateTreeFunc from './helperCreateTreeFunc';
import arrayEach from './arrayEach';
import assign from './assign';

export interface SearchTreeOptions {
  isEvery?: boolean;
  children?: string;
  mapChildren?: string;
  original?: boolean;
  data?: string;
}

function searchTreeItem(
  matchParent: boolean,
  parent: any,
  obj: any[],
  iterate: (
    item: any,
    index: number,
    items: any[],
    path: string[],
    parent: any,
    nodes: any[],
  ) => boolean,
  context: any,
  path: string[],
  node: any[],
  parseChildren: string,
  opts: SearchTreeOptions,
): any[] {
  const rests: any[] = [];
  const hasOriginal = opts.original;
  const sourceData = opts.data;
  const mapChildren = opts.mapChildren || parseChildren;
  const isEvery = opts.isEvery;

  arrayEach(obj, function (item: any, index: number) {
    const paths = path.concat([`${index}`]);
    const nodes = node.concat([item]);
    const isMatch =
      (matchParent && !isEvery) ||
      iterate.call(context, item, index, obj, paths, parent, nodes);
    const hasChild = parseChildren && item[parseChildren];

    // oxlint-disable-next-line no-dupe-else-if
    if (isMatch || hasChild) {
      let rest: any;
      if (hasOriginal) {
        rest = item;
      } else {
        rest = assign({}, item);
        if (sourceData) {
          rest[sourceData] = item;
        }
      }
      rest[mapChildren] = searchTreeItem(
        isMatch,
        item,
        item[parseChildren],
        iterate,
        context,
        paths,
        nodes,
        parseChildren,
        opts,
      );
      if (isMatch || rest[mapChildren].length) {
        rests.push(rest);
      }
    } else if (isMatch) {
      rests.push(rests);
    }
  });

  return rests;
}

/**
 * 从树结构中根据回调查找数据
 *
 * @param list - 对象/数组
 * @param iterate - 回调函数，参数为 (item, index, items, path, parent, nodes)
 * @param options - 配置项 { children: 'children', mapChildren: 'children', original: false, data: 'data' }
 * @param context - 上下文对象
 * @returns 匹配的数据数组
 */
function searchTree<T>(
  list: T[] | undefined,
  iterate: (
    item: T,
    index: number,
    items: T[],
    path: string[],
    parent: T,
    nodes: T[],
  ) => boolean,
  options?: SearchTreeOptions,
  context?: any,
): T[];
function searchTree(
  list: any[],
  iterate: (
    item: any,
    index: number,
    items: any[],
    path: string[],
    parent: any,
    nodes: any[],
  ) => boolean,
  options?: SearchTreeOptions,
  context?: any,
): any[];
function searchTree(
  list: any,
  iterate: (
    item: any,
    index: number,
    items: any,
    path: string,
    parent: any,
    nodes: any,
  ) => boolean,
  options?: SearchTreeOptions,
  context?: any,
): any[];
function searchTree(
  list: any,
  iterate: (
    item: any,
    index: number,
    items: any,
    path: any,
    parent: any,
    nodes: any,
  ) => boolean,
  options?: SearchTreeOptions,
  context?: any,
): any[] {
  const helper = helperCreateTreeFunc(function (
    parent: any,
    obj: any[],
    iterate: any,
    context: any,
    path: string[],
    nodes: any[],
    parseChildren: string,
    opts: SearchTreeOptions,
  ) {
    return searchTreeItem(
      false,
      parent,
      obj,
      iterate,
      context,
      path,
      nodes,
      parseChildren,
      opts,
    );
  });
  return helper(list, iterate, options, context);
}

export default searchTree;

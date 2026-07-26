import helperCreateTreeFunc from './helperCreateTreeFunc';
import map from './map';

export interface MapTreeOptions {
  children?: string;
  mapChildren?: string;
}

function mapTreeItem(
  parent: any,
  obj: any[],
  iterate: (
    this: any,
    item: any,
    index: number,
    items: any[],
    path: string[],
    parent: any,
    nodes: any[],
  ) => any,
  context: any,
  path: string[],
  node: any[],
  parseChildren: string,
  opts: MapTreeOptions,
): any[] {
  const mapChildren = opts.mapChildren || parseChildren;

  // eslint-disable-next-line prefer-arrow-callback
  return map(obj, function (this: any, item: any, index: number) {
    const paths = path.concat([`${index}`]);
    const nodes = node.concat([item]);
    const rest = iterate.call(context, item, index, obj, paths, parent, nodes);

    if (rest && item && parseChildren && item[parseChildren]) {
      rest[mapChildren] = mapTreeItem(
        item,
        item[parseChildren],
        iterate,
        context,
        paths,
        nodes,
        parseChildren,
        opts,
      );
    }
    return rest;
  });
}

/**
 * 从树结构中指定方法后的返回值组成的新数组
 *
 * @param array - 对象/数组
 * @param iterate - 回调函数，参数为 (item, index, items, path, parent, nodes)
 * @param options - 配置项 { children: 'children', mapChildren: 'children' }
 * @param context - 上下文对象
 * @returns 由回调函数返回值组成的新数组
 */
function mapTree<T, U, C = any>(
  array: T[] | undefined,
  iterate: (
    this: C,
    item: T,
    index: number,
    items: T[],
    path: string[],
    parent: T,
    nodes: T[],
  ) => U,
  options?: MapTreeOptions,
  context?: C,
): U[];
function mapTree<U, C = any>(
  array: any[],
  iterate: (
    this: C,
    item: any,
    index: number,
    items: any[],
    path: string[],
    parent: any,
    nodes: any[],
  ) => U,
  options?: MapTreeOptions,
  context?: C,
): U[];
function mapTree<U, C = any>(
  array: any,
  iterate: (
    this: C,
    item: any,
    index: number,
    items: any,
    path: string[],
    parent: any,
    nodes: any,
  ) => U,
  options?: MapTreeOptions,
  context?: C,
): U[];
function mapTree(
  array: any,
  iterate: (
    this: any,
    item: any,
    index: number,
    items: any,
    path: string[],
    parent: any,
    nodes: any,
  ) => any,
  options?: MapTreeOptions,
  context?: any,
): any[] {
  const helper = helperCreateTreeFunc(mapTreeItem);
  return helper(array, iterate, options, context);
}

export default mapTree;

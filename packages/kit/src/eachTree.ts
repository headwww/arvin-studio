import each from './each';
import helperCreateTreeFunc from './helperCreateTreeFunc';

export interface EachTreeOptions {
  children?: string;
}

function eachTreeItem(
  parent: any,
  obj: any,
  iterate: (
    this: any,
    item: any,
    index: any,
    items: any,
    path: string[],
    parent: any,
    nodes: any[],
  ) => void,
  context: any,
  path: string[],
  node: any[],
  parseChildren: string,
  // oxlint-disable-next-line oxc/only-used-in-recursion
  opts: any,
): void {
  each(obj, (item: any, index: any) => {
    const paths = path.concat([`${index}`]);
    const nodes = node.concat([item]);
    iterate.call(context, item, index, obj, paths, parent, nodes);
    if (item && parseChildren) {
      paths.push(parseChildren);
      eachTreeItem(
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
  });
}

/**
 * 从树结构中遍历数据的键、值、路径
 * @param list 数组
 * @param iterate(item, index, items, path, parent, nodes) 回调
 * @param options {children: 'children'}
 * @param context 上下文
 */
function eachTree<T, C = any>(
  list: T[] | undefined,
  iterate: (
    this: C,
    item: T,
    index: number,
    items: T[],
    path: string[],
    parent: T,
    nodes: T[],
  ) => void,
  options?: EachTreeOptions,
  context?: C,
): void;
function eachTree<C = any>(
  list: any[],
  iterate: (
    this: C,
    item: any,
    index: number,
    items: any[],
    path: string[],
    parent: any,
    nodes: any[],
  ) => void,
  options?: EachTreeOptions,
  context?: C,
): void;
function eachTree<C = any>(
  list: any,
  iterate: (
    this: C,
    item: any,
    index: number,
    items: any,
    path: string[],
    parent: any,
    nodes: any,
  ) => void,
  options?: EachTreeOptions,
  context?: C,
): void;
function eachTree(
  list: any,
  iterate: any,
  options?: EachTreeOptions,
  context?: any,
): void {
  return helperCreateTreeFunc(eachTreeItem)(list, iterate, options, context);
}

export default eachTree;

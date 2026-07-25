import eachTree from './eachTree';

export interface FilterTreeOptions {
  children?: string;
}

function filterTree<T, C = any>(
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
  options?: FilterTreeOptions,
  context?: C,
): T[];

function filterTree(
  list: any,
  iterate: any,
  options?: any,
  context?: any,
): any {
  const result: any = [];
  if (list && iterate) {
    eachTree(
      list,
      function (item, index, items, path, parent, nodes) {
        if (iterate.call(context, item, index, items, path, parent, nodes)) {
          result.push(item);
        }
      },
      options,
    );
  }
  return result;
}

export default filterTree;

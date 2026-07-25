import setupDefaults from './setupDefaults';
import arrayEach from './arrayEach';
import assign from './assign';

export interface ToTreeArrayOptions {
  key?: string;
  parentKey?: string;
  children?: string;
  data?: string;
  updated?: boolean;
  clear?: boolean;
}

function unTreeList(
  result: any[],
  parentItem: any | null,
  array: any[],
  opts: ToTreeArrayOptions,
): any[] {
  const optKey = opts.key;
  const optParentKey = opts.parentKey;
  const optChildren = opts.children;
  const optData = opts.data;
  const optUpdated = opts.updated;
  const optClear = opts.clear;

  arrayEach(array, function (item: any) {
    const childList = item[optChildren as string];
    let dataItem = item;

    if (optData) {
      dataItem = item[optData];
    }

    if (optUpdated !== false) {
      dataItem[optParentKey as string] = parentItem
        ? parentItem[optKey as string]
        : null;
    }

    result.push(dataItem);

    if (childList && childList.length) {
      unTreeList(result, dataItem, childList, opts);
    }

    if (optClear) {
      delete dataItem[optChildren as string];
    }
  });

  return result;
}

/**
 * 将一个树结构转成数组列表
 *
 * @param list - 数组
 * @param options - 配置项 { key: 'id', parentKey: 'parentId', children: 'children', data: 'data', clear: false }
 * @returns 数组列表
 */
function toTreeArray<T>(
  list: T[] | undefined,
  options?: ToTreeArrayOptions,
): T[];
function toTreeArray(list: any, options?: ToTreeArrayOptions): any[];
function toTreeArray(list: any, options?: ToTreeArrayOptions): any[] {
  return unTreeList(
    [],
    null,
    list,
    assign({}, setupDefaults.treeOptions, options),
  );
}

export default toTreeArray;

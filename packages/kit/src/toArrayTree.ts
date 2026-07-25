import setupDefaults from './setupDefaults';
import helperLog from './helperLog';
import orderBy from './orderBy';
import type { OrderByFieldConfs } from './orderBy';
import clone from './clone';
import eqNull from './eqNull';
import each from './each';
import remove from './remove';
import assign from './assign';

export interface ToArrayTreeOptions<T> {
  strict?: boolean;
  key?: string;
  parentKey?: string;
  /** 支持指定根节点的值，优先级最高 */
  rootValues?: (string | number)[];
  /**
   * 支持指定根节点的值。
   * 默认情况下，如果 strict=false，则 parentKey 值不存节点内的算根节点，如果 strict=true，则 parentKey 值等于 null 的算根节点。
   */
  rootParentValue?: string | number | null;
  children?: string;
  mapChildren?: string;
  sortKey?: OrderByFieldConfs<T, any>;
  data?: string;
  /** 已废弃，被 sortKey: { field: 'name', order: 'desc' } 替换 @deprecated */
  reverse?: boolean;
}

function strictTree(array: any[], optChildren: string): void {
  each(array, function (item: any) {
    if (item[optChildren] && !item[optChildren].length) {
      remove(item, optChildren);
    }
  });
}

/**
 * 将一个带层级的数据列表转成树结构
 *
 * @param list - 数组
 * @param options - 配置项 { strict: false, parentKey: 'parentId', key: 'id', children: 'children', mapChildren: '', data: 'data' }
 * @returns 树结构数组
 */
function toArrayTree<T>(
  list: T[] | undefined,
  options?: ToArrayTreeOptions<T>,
): T[];
function toArrayTree(list: any, options?: ToArrayTreeOptions<any>): any[];
function toArrayTree(list: any, options?: any): any[] {
  const opts = assign({}, setupDefaults.treeOptions, options);
  const optStrict = opts.strict;
  const optKey = opts.key;
  const optParentKey = opts.parentKey;
  const optChildren = opts.children;
  const optMapChildren = opts.mapChildren;
  const optRootValues = opts.rootValues;
  const optRootParentVal = opts.rootParentValue;
  const optSortKey = opts.sortKey;
  const optReverse = opts.reverse;
  const optData = opts.data;
  const result: any[] = [];
  const defTreeMaps: Record<string, any[]> = {};
  const empTreeMaps: Record<string, any[]> = {};
  const idDefMaps: Record<string, boolean> = {};
  const idEmpMaps: Record<string, boolean> = {};
  const rootIdMaps: Record<string, number> = {};
  const isDefaultRootParentVal = optRootParentVal === undefined;
  let sortedList = list;

  if (optSortKey) {
    sortedList = orderBy(clone(list), optSortKey);
    if (optReverse) {
      sortedList = sortedList.toReversed();
    }
  }

  if (optRootValues && optRootValues.length) {
    each(optRootValues, function (v: string | number) {
      rootIdMaps[v] = 1;
    });
  }

  each(sortedList, function (item: any) {
    const id = item[optKey];
    const idMaps = eqNull(id) ? idEmpMaps : idDefMaps;
    if (idMaps[id]) {
      helperLog('warn', `Duplicate primary key=${id}`);
    }
    idMaps[id] = true;
  });

  each(sortedList, function (item: any) {
    const id = item[optKey];
    const isIdNull = eqNull(id);
    let treeData: any;

    if (optData) {
      treeData = {};
      treeData[optData] = item;
    } else {
      treeData = item;
    }

    let parentId = item[optParentKey];
    const isPdNull = eqNull(parentId);

    const idTreeMaps = isIdNull ? empTreeMaps : defTreeMaps;

    idTreeMaps[id] = idTreeMaps[id] || [];
    treeData[optKey] = id;
    treeData[optParentKey] = parentId;

    if (id === parentId) {
      parentId = null;
      helperLog('warn', `Error infinite Loop. key=${id} parentKey=${id}`);
    }

    const pdTreeMaps = isPdNull ? empTreeMaps : defTreeMaps;
    const idMaps = isPdNull ? idEmpMaps : idDefMaps;

    pdTreeMaps[parentId] = pdTreeMaps[parentId] || [];
    pdTreeMaps[parentId]?.push(treeData);
    treeData[optChildren] = idTreeMaps[id];
    if (optMapChildren) {
      treeData[optMapChildren] = idTreeMaps[id];
    }

    if (optRootValues && optRootValues.length) {
      if (rootIdMaps[id]) {
        result.push(treeData);
      }
    } else if (isDefaultRootParentVal) {
      if (!optStrict || (optStrict && isPdNull)) {
        if (!idMaps[parentId]) {
          result.push(treeData);
        }
      }
    } else {
      if (parentId === optRootParentVal) {
        result.push(treeData);
      }
    }
  });

  if (optStrict) {
    strictTree(sortedList, optChildren);
  }

  return result;
}

export default toArrayTree;

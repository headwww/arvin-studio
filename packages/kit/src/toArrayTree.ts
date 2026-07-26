import type { OrderByFieldConfs } from './orderBy';

import assign from './assign';
import clone from './clone';
import each from './each';
import eqNull from './eqNull';
import helperLog from './helperLog';
import orderBy from './orderBy';
import remove from './remove';
import setupDefaults from './setupDefaults';

export interface ToArrayTreeOptions<T> {
  children?: string;
  data?: string;
  key?: string;
  mapChildren?: string;
  parentKey?: string;
  /** 已废弃，被 sortKey: { field: 'name', order: 'desc' } 替换 @deprecated */
  reverse?: boolean;
  /**
   * 支持指定根节点的值。
   * 默认情况下，如果 strict=false，则 parentKey 值不存节点内的算根节点，如果 strict=true，则 parentKey 值等于 null 的算根节点。
   */
  rootParentValue?: null | number | string;
  /** 支持指定根节点的值，优先级最高 */
  rootValues?: (number | string)[];
  sortKey?: OrderByFieldConfs<T, any>;
  strict?: boolean;
}

function strictTree(array: any[], optChildren: string): void {
  each(array, (item: any) => {
    if (item[optChildren] && item[optChildren].length === 0) {
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

  if (optRootValues && optRootValues.length > 0) {
    each(optRootValues, (v: number | string) => {
      rootIdMaps[v] = 1;
    });
  }

  each(sortedList, (item: any) => {
    const id = item[optKey];
    const idMaps = eqNull(id) ? idEmpMaps : idDefMaps;
    if (idMaps[id]) {
      helperLog('warn', `Duplicate primary key=${id}`);
    }
    idMaps[id] = true;
  });

  each(sortedList, (item: any) => {
    const id = item[optKey];
    const isIdNull = eqNull(id);
    let treeData: any;

    treeData = optData ? { [optData]: item } : item;

    let parentId = item[optParentKey];
    const isPdNull = eqNull(parentId);

    const idTreeMaps = isIdNull ? empTreeMaps : defTreeMaps;

    idTreeMaps[id] ||= [];
    treeData[optKey] = id;
    treeData[optParentKey] = parentId;

    if (id === parentId) {
      parentId = null;
      helperLog('warn', `Error infinite Loop. key=${id} parentKey=${id}`);
    }

    const pdTreeMaps = isPdNull ? empTreeMaps : defTreeMaps;
    const idMaps = isPdNull ? idEmpMaps : idDefMaps;

    pdTreeMaps[parentId] ||= [];
    pdTreeMaps[parentId]?.push(treeData);
    treeData[optChildren] = idTreeMaps[id];
    if (optMapChildren) {
      treeData[optMapChildren] = idTreeMaps[id];
    }

    if (optRootValues && optRootValues.length > 0) {
      if (rootIdMaps[id]) {
        result.push(treeData);
      }
    } else if (isDefaultRootParentVal) {
      if ((!optStrict || (optStrict && isPdNull)) && !idMaps[parentId]) {
        result.push(treeData);
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

import arrayEach from './arrayEach';
import eqNull from './eqNull';
import get from './get';
import isArray from './isArray';
import isFunction from './isFunction';
import isNull from './isNull';
import isPlainObject from './isPlainObject';
import isUndefined from './isUndefined';
import map from './map';
import property from './property';
import toArray from './toArray';

const ORDER_PROP_AsC = 'asc';
const ORDER_PROP_DESC = 'desc';

interface OrderBySortConfs<T, C> {
  field?: ((this: C, item: T, index: number, list: T[]) => any) | null | string;
  order?: 'asc' | 'desc' | null;
}

export type OrderByFieldConfs<T, C> =
  | (OrderBySortConfs<T, C> | string)[]
  | ((this: C, item: T, index: number, list: T[]) => any)
  | any[][]
  | null
  | OrderBySortConfs<T, C>
  | string;

function handleSort(v1: any, v2: any): number {
  if (isUndefined(v1)) {
    return 1;
  }
  if (isNull(v1)) {
    return isUndefined(v2) ? -1 : 1;
  }
  return v1 && v1.localeCompare ? v1.localeCompare(v2) : v1 > v2 ? 1 : -1;
}

function buildMultiOrders(
  name: number,
  confs: { field: any; order: string },
  compares?: (item1: any, item2: any) => number,
): (item1: any, item2: any) => number {
  return function (item1: any, item2: any) {
    const v1 = item1[name];
    const v2 = item2[name];
    if (v1 === v2) {
      return compares ? compares(item1, item2) : 0;
    }
    return confs.order === ORDER_PROP_DESC
      ? handleSort(v2, v1)
      : handleSort(v1, v2);
  };
}

function getSortConfs(
  arr: any[],
  list: any[],
  fieldConfs: OrderByFieldConfs<any, any>,
  context: any,
): Array<{ field: any; order: string }> {
  const sortConfs: Array<{ field: any; order: string }> = [];
  const confsArray = isArray(fieldConfs) ? fieldConfs : [fieldConfs];

  arrayEach(confsArray, (handle: any) => {
    if (!handle) {
      return;
    }

    let field = handle;
    let order = ORDER_PROP_AsC;

    if (isArray(handle)) {
      field = handle[0];
      order = handle[1] || ORDER_PROP_AsC;
    } else if (isPlainObject(handle)) {
      field = (handle as any).field;
      order = (handle as any).order || ORDER_PROP_AsC;
    }

    sortConfs.push({ field, order });

    arrayEach(
      list,
      isFunction(field)
        ? (item: any) => {
            item[sortConfs.length - 1] = field.call(
              context,
              item.data,
              item.index,
              arr,
            );
          }
        : (item: any) => {
            item[sortConfs.length - 1] = field
              ? get(item.data, field)
              : item.data;
          },
    );
  });

  return sortConfs;
}

/**
 * 将数组进行排序
 *
 * @param array - 数组
 * @param fieldConfs - 排序规则
 * @param context - 上下文对象
 * @returns 排序后的新数组
 */
function orderBy<T, C = any>(
  array: T[],
  fieldConfs: OrderByFieldConfs<T, C>,
  context?: C,
): T[];
function orderBy(array: any, fieldConfs: any, context?: any): any[];
function orderBy(array: any, fieldConfs: any, context?: any): any[] {
  if (array) {
    if (eqNull(fieldConfs)) {
      return toArray(array).toSorted(handleSort);
    }

    let compares: ((item1: any, item2: any) => number) | undefined;
    const list = map(array, (item: any) => {
      return { data: item };
    });

    const sortConfs = getSortConfs(array, list, fieldConfs, context);
    let len = sortConfs.length - 1;

    while (len >= 0) {
      compares = buildMultiOrders(len, sortConfs[len]!, compares);
      len--;
    }

    if (compares) {
      list.sort(compares);
    }

    return map(list, property('data'));
  }

  return [];
}

export default orderBy;

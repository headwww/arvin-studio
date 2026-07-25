import arrayEach from './arrayEach';
import toArray from './toArray';
import map from './map';
import isArray from './isArray';
import isFunction from './isFunction';
import isPlainObject from './isPlainObject';
import isUndefined from './isUndefined';
import isNull from './isNull';
import eqNull from './eqNull';
import get from './get';
import property from './property';

const ORDER_PROP_ASC = 'asc';
const ORDER_PROP_DESC = 'desc';

interface OrderBySortConfs<T, C> {
  field?: string | ((this: C, item: T, index: number, list: T[]) => any) | null;
  order?: 'asc' | 'desc' | null;
}

export type OrderByFieldConfs<T, C> =
  | null
  | string
  | any[][]
  | OrderBySortConfs<T, C>
  | (string | OrderBySortConfs<T, C>)[]
  | ((this: C, item: T, index: number, list: T[]) => any);

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

  arrayEach(confsArray, function (handle: any) {
    if (handle) {
      let field = handle;
      let order = ORDER_PROP_ASC;

      if (isArray(handle)) {
        field = handle[0];
        order = handle[1] || ORDER_PROP_ASC;
      } else if (isPlainObject(handle)) {
        field = (handle as any).field;
        order = (handle as any).order || ORDER_PROP_ASC;
      }

      sortConfs.push({ field, order });

      arrayEach(
        list,
        isFunction(field)
          ? function (item: any) {
              item[sortConfs.length - 1] = field.call(
                context,
                item.data,
                item.index,
                arr,
              );
            }
          : function (item: any) {
              item[sortConfs.length - 1] = field
                ? get(item.data, field)
                : item.data;
            },
      );
    }
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
    const list = map(array, function (item: any) {
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

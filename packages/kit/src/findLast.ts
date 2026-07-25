import isArray from './isArray';
import values from './values';

/**
 * 从右至左遍历，匹配最近的一条数据
 * @param array 数组
 * @param iterate 回调
 * @param context 上下文
 */
function findLast<T, C = any>(
  array: T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => boolean,
  context?: C,
): T | undefined;
/**
 * 从右至左遍历，匹配最近的一条数据
 * @param obj 对象
 * @param iterate 回调
 * @param context 上下文
 */
function findLast<T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: string, obj: T) => boolean,
  context?: C,
): any;
function findLast(
  obj: any,
  iterate: (this: any, item: any, index: any, obj: any) => boolean,
  context?: any,
): any {
  if (obj) {
    const arr: any[] = isArray(obj) ? obj : values(obj);
    for (let len = arr.length - 1; len >= 0; len--) {
      if (iterate.call(context, arr[len], len, arr)) {
        return arr[len];
      }
    }
  }
  return undefined;
}

export default findLast;

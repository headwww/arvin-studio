import helperNumberAdd from './helperNumberAdd';
import isFunction from './isFunction';
import isArray from './isArray';
import each from './each';
import get from './get';

/**
 * 求和函数，将数值相加
 *
 * @param array - 数组
 * @param iterate - 方法或属性
 * @param context - 上下文对象
 * @returns 总和
 */
function sum<T, C = any>(
  array: T[] | undefined,
  iterate?:
    | string
    | number
    | ((this: C, item: T, index: number, list: T[]) => number),
  context?: C,
): number;
function sum(array: any, iterate?: any, context?: any): number;
function sum(array: any, iterate?: any, context?: any): number {
  let result = 0;

  each(
    // oxlint-disable-next-line typescript/require-array-sort-compare
    array && array.length > 2 && isArray(array) ? array.toSorted() : array,
    iterate
      ? isFunction(iterate)
        ? function (this: any, ...args: any[]) {
            result = helperNumberAdd(result, iterate.apply(context, args));
          }
        : function (val: any) {
            result = helperNumberAdd(result, get(val, iterate));
          }
      : function (val: any) {
          result = helperNumberAdd(result, val);
        },
  );

  return result;
}

export default sum;

import each from './each';
import isFunction from './isFunction';
import property from './property';

/**
 * 指定方法后的返回值组成的新对象
 *
 * @param obj - 对象/数组
 * @param iterate - 回调函数，参数为 (item, key, obj)
 * @param context - 上下文对象
 * @returns 由回调函数返回值组成的新对象
 */
function objectMap<T, U>(
  obj: T,
  iterate: (item: any, key: string, obj: T) => U,
  context?: any,
): U;
function objectMap<U>(
  obj: any,
  iterate: (item: any, key: string, obj: any) => U,
  context?: any,
): U;
function objectMap(obj: any, iterate?: any, context?: any): any {
  const result: any = {};

  if (obj) {
    if (iterate === undefined) {
      return obj;
    } else {
      const iterFn = isFunction(iterate) ? iterate : property(iterate);
      // eslint-disable-next-line prefer-arrow-callback
      each(obj, function (this: any, val: any, index: any) {
        result[index] = iterFn.call(context, val, index, obj);
      });
    }
  }

  return result;
}

export default objectMap;

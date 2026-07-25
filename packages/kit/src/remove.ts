import helperDeleteProperty from './helperDeleteProperty';
import isFunction from './isFunction';
import isArray from './isArray';
import each from './each';
import arrayEach from './arrayEach';
import lastEach from './lastEach';
import clear from './clear';
import eqNull from './eqNull';

function pluckProperty(name: string): (obj: any, key: string) => boolean {
  return function (_: any, key: string) {
    return key === name;
  };
}

/**
 * 移除对象属性
 *
 * @param obj - 对象/数组
 * @param iterate - 方法或属性
 * @param context - 上下文对象
 * @returns 被移除的属性值组成的对象/数组
 */
function remove<T, C>(
  list: T[] | undefined,
  iterate:
    | number
    | string
    | ((this: C, item: T, index: number, list: T[]) => boolean),
  context?: C,
): T[];
function remove<C>(
  obj: any,
  iterate:
    | number
    | string
    | ((this: C, item: any, key: string, obj: any) => boolean),
  context?: C,
): any;
function remove(obj: any, iterate: any, context?: any): any {
  if (obj) {
    if (!eqNull(iterate)) {
      const removeKeys: any[] = [];
      let rest: any;

      const iterFn = isFunction(iterate) ? iterate : pluckProperty(iterate);

      each(obj, function (this: any, item: any, index: any) {
        if (iterFn.call(context, item, index, obj)) {
          removeKeys.push(index);
        }
      });

      if (isArray(obj)) {
        rest = [];
        lastEach(removeKeys, function (item: any) {
          rest.push(obj[item]);
          obj.splice(item, 1);
        });
      } else {
        rest = {};
        arrayEach(removeKeys, function (key: string) {
          rest[key] = obj[key];
          helperDeleteProperty(obj, key);
        });
      }

      return rest;
    }
    return clear(obj);
  }
  return obj;
}

export default remove;

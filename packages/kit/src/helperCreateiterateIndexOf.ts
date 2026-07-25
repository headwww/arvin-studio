import isFunction from './isFunction';
import isString from './isString';
import isArray from './isArray';
import hasOwnProp from './hasOwnProp';

/**
 * 创建 iterateIndexOf 迭代查找函数
 */
function helperCreateiterateIndexOf(
  callback: (obj: any, iterate: any, context?: any) => number,
): <T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: any, obj: T) => boolean,
  context?: C,
) => number | string {
  return function <T, C = any>(
    obj: T,
    iterate: (this: C, item: any, key: any, obj: T) => boolean,
    context?: C,
  ): number | string {
    if (obj && isFunction(iterate)) {
      if (isArray(obj) || isString(obj)) {
        return callback(obj, iterate, context);
      }
      for (const key in obj) {
        if (hasOwnProp(obj, key)) {
          if (iterate.call(context!, (obj as any)[key], key, obj)) {
            return key;
          }
        }
      }
    }
    return -1;
  };
}

export default helperCreateiterateIndexOf;

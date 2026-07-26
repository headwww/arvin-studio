import hasOwnProp from './hasOwnProp';
import isArray from './isArray';
import isString from './isString';

/**
 * 创建 indexOf 查找函数
 */
function helperCreateIndexOf(
  name: string,
  callback: (obj: any, val: any) => number,
): (obj: any, val: any) => number | string {
  return function (obj: any, val: any): number | string {
    if (obj) {
      if (obj[name]) {
        return obj[name](val);
      }
      if (isString(obj) || isArray(obj)) {
        return callback(obj, val);
      }
      for (const key in obj) {
        if (hasOwnProp(obj, key) && val === obj[key]) {
          return key;
        }
      }
    }
    return -1;
  };
}

export default helperCreateIndexOf;

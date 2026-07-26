import assign from './assign';
import helperDeleteProperty from './helperDeleteProperty';
import isArray from './isArray';
import isNull from './isNull';
import isObject from './isObject';
import isPlainObject from './isPlainObject';
import objectEach from './objectEach';

/**
 * 清空对象; defs如果不传（清空所有属性）、如果传对象（清空并继承)、如果传值(给所有赋值)
 * @param obj 对象
 */
function clear<T>(obj: T): T;
/**
 * 清空对象; defs如果不传（清空所有属性）、如果传对象（清空并继承)、如果传值(给所有赋值)
 * @param obj 对象
 * @param defs 默认值
 */
function clear<T>(obj: T, defs: any): T;
/**
 * 清空对象; defs如果不传（清空所有属性）、如果传对象（清空并继承)、如果传值(给所有赋值)
 * @param obj 对象
 * @param defs 默认值
 * @param assigns 值
 */
function clear<T, U>(obj: T, defs: any, assigns: U): T & U;
function clear<T>(obj: T, defs?: any, assigns?: any): any {
  if (obj) {
    const isDefs = arguments.length > 1 && (isNull(defs) || !isObject(defs));
    const extds = isDefs ? assigns : defs;
    if (isPlainObject(obj)) {
      objectEach(
        obj,
        isDefs
          ? (_: any, key: string) => {
              (obj as any)[key] = defs;
            }
          : (_: any, key: string) => {
              helperDeleteProperty(obj, key);
            },
      );
      if (extds) {
        assign(obj, extds);
      }
    } else if (isArray(obj)) {
      const arr = obj as any[];
      if (isDefs) {
        let len = arr.length;
        while (len > 0) {
          len--;
          arr[len] = defs;
        }
      } else {
        arr.length = 0;
      }
      if (extds) {
        arr.push(...extds);
      }
    }
  }
  return obj;
}

export default clear;

import helperDefaultCompare from './helperDefaultCompare';
import helperEqualCompare from './helperEqualCompare';
import isFunction from './isFunction';
import isUndefined from './isUndefined';

/**
 * 深度比较两个对象之间的值是否相等，使用自定义比较函数
 *
 * @param obj1 - 第一个值
 * @param obj2 - 第二个值
 * @param func - 自定义比较函数，返回 undefined 时使用默认比较逻辑
 * @returns 如果两个值深度相等则返回 true，否则返回 false
 */
function isEqualWith(obj1: any, obj2: any): boolean;
function isEqualWith<T, U>(
  obj1: T,
  obj2: U,
  func: (val1: any, val2: any, key: any, obj1: T, obj2: U) => any,
): boolean;
function isEqualWith(
  obj1: any,
  obj2: any,
  func?: (val1: any, val2: any, key: any, obj1: any, obj2: any) => any,
): boolean;
function isEqualWith(
  obj1: any,
  obj2: any,
  func?: (val1: any, val2: any, key: any, obj1: any, obj2: any) => any,
): boolean {
  if (isFunction(func)) {
    return helperEqualCompare(
      obj1,
      obj2,
      (v1: any, v2: any, key: any, obj1: any, obj2: any) => {
        const result = func(v1, v2, key, obj1, obj2);
        return isUndefined(result) ? helperDefaultCompare(v1, v2) : !!result;
      },
      func,
    );
  }
  return helperEqualCompare(obj1, obj2, helperDefaultCompare);
}

export default isEqualWith;

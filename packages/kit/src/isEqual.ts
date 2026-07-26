import helperDefaultCompare from './helperDefaultCompare';
import helperEqualCompare from './helperEqualCompare';

/**
 * 深度比较两个对象之间的值是否相等
 *
 * @param obj1 - 第一个值
 * @param obj2 - 第二个值
 * @returns 如果两个值深度相等则返回 true，否则返回 false
 */
function isEqual(obj1: any, obj2: any): boolean;
function isEqual(obj1: any, obj2: any): boolean {
  return helperEqualCompare(obj1, obj2, helperDefaultCompare);
}

export default isEqual;

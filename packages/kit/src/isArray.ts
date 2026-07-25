import helperCreateInInObjectString from './helperCreateInInObjectString';

/**
 * 判断是否数组
 *
 * @param val - 要检查的值
 * @returns 如果是数组则返回 true，否则返回 false
 */
function isArray(val: any): val is any[];
function isArray(val: any): boolean {
  return (Array.isArray || helperCreateInInObjectString('Array'))(val);
}

export default isArray;

import helperCreatePickOmit from './helperCreatePickOmit';

/**
 * 根据 keys 排除指定的属性值，返回一个新的对象
 *
 * @param obj - 对象
 * @param array - 数组或字符串或方法
 * @returns 排除指定属性后的新对象
 */
function omit(obj: any, array: string[]): any;
function omit(obj: any, array: any): any {
  const helper = helperCreatePickOmit(false, true);
  return helper(obj, array);
}

export default omit;

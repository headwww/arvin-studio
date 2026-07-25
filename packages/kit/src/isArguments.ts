import helperCreateInInObjectString from './helperCreateInInObjectString';

/**
 * 判断是否 Arguments 对象
 *
 * @param val - 要检查的值
 * @returns 如果是 Arguments 对象则返回 true，否则返回 false
 */
function isArguments(val: any): val is IArguments;
function isArguments(val: any): boolean {
  return helperCreateInInObjectString('Arguments')(val);
}

export default isArguments;

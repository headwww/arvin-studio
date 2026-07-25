import helperCreateGetObjects from './helperCreateGetObjects';
/**
 * 获取对象所有属性
 *
 * @param {Object} obj 对象/数组
 * @return {Array}
 */
function keys(obj: any): string[] {
  return helperCreateGetObjects('keys', 1)(obj);
}

export default keys;

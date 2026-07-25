import helperCreateInInObjectString from './helperCreateInInObjectString';

/**
 * 判断是否 Date 对象
 *
 * @param val - 要检查的值
 * @returns 如果是 Date 对象则返回 true，否则返回 false
 */
function isDate(val: any): val is Date;
function isDate(val: any): boolean {
  return helperCreateInInObjectString('Date')(val);
}

export default isDate;

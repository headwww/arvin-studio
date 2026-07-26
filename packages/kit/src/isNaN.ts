import isNumber from './isNumber';

/**
 * 判断是否非数值
 * @param val 值
 */
function isNaN(val: any): boolean {
  return isNumber(val) && isNaN(val);
}

export default isNaN;

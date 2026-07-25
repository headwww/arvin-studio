import isNumber from './isNumber';

/**
 * 判断是否为有限数值
 * @param val 值
 */
function isFinite(val: any): val is number {
  return isNumber(val) && isFinite(val);
}

export default isFinite;

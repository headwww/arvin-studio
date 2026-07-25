import isArray from './isArray';
import isInteger from './isInteger';
import isNull from './isNull';

/**
 * 判断是否小数
 * @param val 值
 */
function isFloat(val: any): val is number {
  return !isNull(val) && !isNaN(val) && !isArray(val) && !isInteger(val);
}

export default isFloat;

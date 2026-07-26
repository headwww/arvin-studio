import isArray from './isArray';
import isNull from './isNull';

/**
 * 判断是否整数
 * @param val 值
 */
function isInteger(val: any): val is number {
  return (
    !isNull(val) && !isNaN(val) && !isArray(val) && Number.isSafeInteger(val)
  );
}

export default isInteger;

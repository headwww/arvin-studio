import helperGetDateTime from './helperGetDateTime';
import isDate from './isDate';

/**
 * 判断是否有效的Date对象
 * @param val 值
 */
function isValidDate(val: any): val is Date {
  return isDate(val) && !isNaN(helperGetDateTime(val));
}

export default isValidDate;

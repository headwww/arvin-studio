import isSymbol from './isSymbol';
import isDate from './isDate';
import isArray from './isArray';
import isRegExp from './isRegExp';
import isError from './isError';
import isNull from './isNull';

/**
 * 获取对象类型
 * @param obj 对象
 */
function getType(obj: any): string {
  if (isNull(obj)) {
    return 'null';
  }
  if (isSymbol(obj)) {
    return 'symbol';
  }
  if (isDate(obj)) {
    return 'date';
  }
  if (isArray(obj)) {
    return 'array';
  }
  if (isRegExp(obj)) {
    return 'regexp';
  }
  if (isError(obj)) {
    return 'error';
  }
  return typeof obj;
}

export default getType;

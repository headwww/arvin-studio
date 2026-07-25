import isString from './isString';
import isNumber from './isNumber';

/**
 * 判断是否 Element 对象
 *
 * @param val - 要检查的值
 * @returns 如果是 Element 对象则返回 true，否则返回 false
 */
function isElement(val: any): val is Element;
function isElement(val: any): boolean {
  return !!(val && isString(val.nodeName) && isNumber(val.nodeType));
}

export default isElement;

import isNull from './isNull';
import isUndefined from './isUndefined';

/**
 * 判断是否 undefined 和 null
 * @param obj 对象
 */
function eqNull(obj: any): obj is null | undefined {
  return isNull(obj) || isUndefined(obj);
}

export default eqNull;

import values from './values';
/**
 * 获取对象最后一个值
 *
 * @param {Object} obj 对象/数组
 * @return {Object}
 */
function last<T>(list: T[] | ArrayLike<T> | undefined): T;
function last(obj: any): any {
  const list = values(obj);
  return list[list.length - 1];
}

export default last;

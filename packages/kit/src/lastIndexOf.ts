import arrayLastIndexOf from './arrayLastIndexOf';
import helperCreateIndexOf from './helperCreateIndexOf';

/**
 * 从最后开始的索引值,返回对象第一个索引值
 *
 * @param {Object} array 对象
 * @param {Object} val 值
 * @return {Number}
 */
function lastIndexOf(obj: any, val: any): number {
  return helperCreateIndexOf('lastIndexOf', arrayLastIndexOf)(
    obj,
    val,
  ) as number;
}

export default lastIndexOf;

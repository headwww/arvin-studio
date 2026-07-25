import helperCreateIndexOf from './helperCreateIndexOf';
import arrayIndexOf from './arrayIndexOf';

/**
 * 返回对象第一个索引值
 *
 * @param obj - 要搜索的对象
 * @param val - 要查找的值
 * @returns 值在对象中首次出现的索引，未找到则返回 -1
 */
function indexOf(obj: any, val: any): number;
function indexOf(obj: any, val: any): number {
  return helperCreateIndexOf('indexOf', arrayIndexOf)(obj, val) as number;
}

export default indexOf;

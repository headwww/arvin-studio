import helperCreateiterateIndexOf from './helperCreateiterateIndexOf';

/**
 * 返回对象第一个索引值
 * @param list 数组
 * @param iterate 迭代器
 * @param context 上下文
 */
function findIndexOf<T, C = any>(
  list: T[] | undefined,
  iterate: (this: C, item: T, index: any, obj: T[]) => boolean,
  context?: C,
): number;
/**
 * 返回对象第一个索引值
 * @param obj 对象
 * @param iterate 迭代器
 * @param context 上下文
 */
function findIndexOf<T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: string, obj: T) => boolean,
  context?: C,
): number;
function findIndexOf(obj: any, iterate: any, context?: any): number {
  return helperCreateiterateIndexOf(function (
    obj: any,
    iterate: any,
    context: any,
  ) {
    for (let index = 0, len = obj.length; index < len; index++) {
      if (iterate.call(context, obj[index], index, obj)) {
        return index;
      }
    }
    return -1;
  })(obj, iterate, context) as number;
}

export default findIndexOf;

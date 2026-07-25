import helperCreateiterateIndexOf from './helperCreateiterateIndexOf';

/**
 * 从最后开始遍历，返回第一个匹配的索引值
 * @param list 数组
 * @param iterate 迭代器
 * @param context 上下文
 */
function findLastIndexOf<T, C = any>(
  list: T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => boolean,
  context?: C,
): number;
/**
 * 从最后开始遍历，返回第一个匹配的索引值
 * @param obj 对象
 * @param iterate 迭代器
 * @param context 上下文
 */
function findLastIndexOf<C = any>(
  obj: any,
  iterate: (this: C, item: any, key: string, obj: any) => boolean,
  context?: C,
): number;
function findLastIndexOf(obj: any, iterate: any, context?: any): number {
  return helperCreateiterateIndexOf(function (
    obj: any,
    iterate: any,
    context: any,
  ) {
    for (let len = obj.length - 1; len >= 0; len--) {
      if (iterate.call(context, obj[len], len, obj)) {
        return len;
      }
    }
    return -1;
  })(obj, iterate, context) as number;
}

export default findLastIndexOf;

/**
 * 数组迭代器,从最后开始迭代
 * @param list 对象
 * @param iterate 回调
 * @param context 上下文
 */
function lastArrayEach<T, C = any>(
  list: T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => void,
  context?: C,
): void;
function lastArrayEach(list: any, iterate: any, context?: any): void {
  if (list) {
    for (let index = list.length - 1; index >= 0; index--) {
      iterate.call(context, list[index], index, list);
    }
  }
}

export default lastArrayEach;

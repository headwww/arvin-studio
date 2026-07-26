/**
 * 数组迭代器，对数组或类数组对象中的每一项执行回调
 * 优先使用原生 forEach，否则退回到普通 for 循环遍历
 *
 * @param list 数组或类数组对象
 * @param iterate 回调函数
 * @param context 回调函数的上下文（this 指向）
 */
function arrayEach<T, C = any>(
  list: ArrayLike<T> | T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => void,
  context?: C,
): void;
function arrayEach<C = any>(
  list: any[] | undefined,
  iterate: (this: C, item: any, index: number, list: any[]) => void,
  context?: C,
): void;
function arrayEach(list: any, iterate: any, context?: any): void {
  if (list) {
    if (list.forEach) {
      list.forEach(iterate, context);
    } else {
      for (let index = 0, len = list.length; index < len; index++) {
        iterate.call(context, list[index], index, list);
      }
    }
  }
}

export default arrayEach;

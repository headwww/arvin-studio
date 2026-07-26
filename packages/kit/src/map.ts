import each from './each';

/**
 * 指定方法后的返回值组成的新数组
 *
 * @param list - 数组/对象
 * @param iterate - 回调函数，参数为 (item, index, list)
 * @param context - 上下文对象，作为回调函数的 this
 * @returns 由回调函数返回值组成的新数组
 */
function map<T, U, C = any>(
  list: T[],
  iterate: (this: C, item: T, index: number, list: T[]) => U,
  context?: C,
): U[];
function map(
  list: any,
  iterate: (this: any, item: any, index: any, list: any) => any,
  context?: any,
): any[];
function map(
  list: any,
  iterate: (this: any, item: any, index: any, list: any) => any,
  context?: any,
): any[] {
  const result: any[] = [];

  if (list && iterate !== undefined) {
    if (list.map) {
      return list.map(iterate, context);
    } else {
      // eslint-disable-next-line prefer-arrow-callback
      each(list, function (this: any, ...args: any[]) {
        result.push(iterate.apply(context, args as any));
      });
    }
  }

  return result;
}

export default map;

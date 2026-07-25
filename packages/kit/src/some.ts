import helperCreateIterateHandle from './helperCreateIterateHandle';

/**
 * 对象中的值中的每一项运行给定函数，如果函数对任一项返回 true，则返回 true，否则返回 false
 *
 * @param list - 数组
 * @param iterate - 回调函数
 * @param context - 上下文对象
 * @returns 如果任一元素满足条件则返回 true，否则返回 false
 */
function some<T>(
  list: T[] | undefined,
  iterate: (item: T, index: number, list: T[]) => boolean,
  context?: any,
): boolean;
function some(list: any, iterate: any, context?: any): boolean;
function some(list: any, iterate: any, context?: any): boolean {
  const helper = helperCreateIterateHandle('some', true, 0, true, false);
  return helper(list, iterate, context);
}

export default some;

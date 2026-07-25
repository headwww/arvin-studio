import helperNumberDivide from './helperNumberDivide';

import getSize from './getSize';

import sum from './sum';

/**
 * 求平均值函数
 * @param obj 对象/数组
 * @param iterate 回调
 * @param context 上下文
 */
function mean<T>(
  obj: T[] | undefined,
  iterate?: string | number | ((item: T, index: number, list: T[]) => any),
  context?: any,
): number {
  return helperNumberDivide(sum(obj, iterate, context), getSize(obj));
}

export default mean;

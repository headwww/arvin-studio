import helperCreateMinMax from './helperCreateMinMax';

/**
 * 获取最小值
 *
 * @param list - 数组
 * @param iterate - 回调/属性
 * @returns 最小值，如果数组为空则返回 null 或 undefined
 */
function min<T>(
  list: T[] | undefined,
  iterate?:
    | string
    | number
    | ((item: T, index: number, list: T[]) => number | string),
): T | null | undefined;
function min(list: any, iterate?: any): any {
  const helper = helperCreateMinMax(function (rest: any, itemVal: any) {
    return rest > itemVal;
  });
  return helper(list, iterate);
}

export default min;

import helperCreateMinMax from './helperCreateMinMax';

/**
 * 获取最大值
 * @param list 数组
 * @param iterate 回调/属性
 */
function max<T>(
  list: T[] | undefined,
  iterate?:
    | string
    | number
    | ((item: T, index: number, list: T[]) => number | string),
): T | null | undefined {
  const fn = helperCreateMinMax(function (
    rest: number,
    itemVal: number,
  ): boolean {
    return rest < itemVal;
  });
  return fn(list as any, iterate as any);
}

export default max;

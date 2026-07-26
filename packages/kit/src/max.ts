import helperCreateMinMax from './helperCreateMinMax';

/**
 * 获取最大值
 * @param list 数组
 * @param iterate 回调/属性
 */
function max<T>(
  list: T[] | undefined,
  iterate?:
    | ((item: T, index: number, list: T[]) => number | string)
    | number
    | string,
): null | T | undefined {
  const fn = helperCreateMinMax((rest: number, itemVal: number): boolean => {
    return rest < itemVal;
  });
  return fn(list as any, iterate as any);
}

export default max;

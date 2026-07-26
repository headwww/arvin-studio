import arrayEach from './arrayEach';
import get from './get';
import isFunction from './isFunction';

/**
 * 集合统计，默认使用键值统计，如果有 iterate 则使用结果进行统计
 */
function countBy<T, C = any>(
  list: T[] | undefined,
  iterate:
    | ((this: C, item: T, index: number, obj: T[]) => number | string)
    | number
    | string,
  context?: C,
): Record<string, number>;

function countBy<T, C = any>(
  obj: T,
  iterate:
    | ((this: C, item: any, key: string, obj: T) => number | string)
    | number
    | string,
  context?: C,
): Record<string, number>;

function countBy(
  arr: any,
  iterate: any,
  context?: any,
): Record<string, number> {
  const result: Record<string, number> = {};
  arrayEach(arr, (item: any) => {
    const key = isFunction(iterate)
      ? (iterate as Function).call(context, item)
      : get(item, iterate as string);
    result[key] = (result[key] || 0) + 1;
  });
  return result;
}

export default countBy;

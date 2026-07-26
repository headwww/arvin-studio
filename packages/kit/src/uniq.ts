import each from './each';
import includes from './includes';
import isFunction from './isFunction';
import property from './property';

/**
 * 数组去重
 *
 * @param list - 数组
 * @param iterate - 回调/对象属性
 * @param context - 上下文对象
 * @returns 去重后的数组
 */
function uniq<T, C = any>(
  list: T[] | undefined,
  iterate?:
    | ((this: C, item: T, index: number, obj: T[]) => number | string)
    | number
    | string,
  context?: C,
): T[];
function uniq<C = any>(
  list: any,
  iterate?:
    | ((this: C, item: any, index: number, obj: any) => number | string)
    | number
    | string,
  context?: C,
): any[];
function uniq(list: any, iterate?: any, context?: any): any[] {
  const result: any[] = [];

  if (iterate === undefined) {
    each(list, (value: any) => {
      if (!includes(result, value)) {
        result.push(value);
      }
    });
  } else {
    const iterFn = isFunction(iterate) ? iterate : property(iterate);
    const valMap: Record<string, number> = {};

    each(list, (item: any, key: any) => {
      const val = iterFn.call(context, item, key, list);
      if (!valMap[val]) {
        valMap[val] = 1;
        result.push(item);
      }
    });
  }

  return result;
}

export default uniq;

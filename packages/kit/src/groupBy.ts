import isEmpty from './isEmpty';
import isObject from './isObject';
import isFunction from './isFunction';
import property from './property';
import each from './each';

type IterateFn<T> = (this: any, item: T, key: any, obj: any) => string | number;
type Iterate<T> = string | number | IterateFn<T>;

function createiterateEmpty(iterate: any): () => boolean {
  return function () {
    return isEmpty(iterate);
  };
}

/**
 * 集合分组，默认使用键值分组，如果有 iterate 则使用结果进行分组
 * @param list 数组
 * @param iterate 回调/对象属性
 * @param context 上下文
 */
function groupBy<T, C = any>(
  list: T[] | undefined,
  iterate:
    | string
    | number
    | ((this: C, item: T, index: number, obj: T[]) => string | number),
  context?: C,
): { [key: string]: T[] };
/**
 * 集合分组，默认使用键值分组，如果有 iterate 则使用结果进行分组
 * @param obj 对象
 * @param iterate 回调/对象属性
 * @param context 上下文
 */
function groupBy<T, C = any>(
  obj: T,
  iterate:
    | string
    | number
    | ((this: C, item: any, key: string, obj: T) => string | number),
  context?: C,
): { [key: string]: any[] };
function groupBy(
  obj: any,
  iterate: Iterate<any>,
  context?: any,
): { [key: string]: any[] } {
  const result: { [key: string]: any[] } = {};
  if (obj) {
    let iterateFn: any;
    if (iterate && isObject(iterate)) {
      iterateFn = createiterateEmpty(iterate);
    } else if (!isFunction(iterate)) {
      iterateFn = property(iterate as any);
    } else {
      iterateFn = iterate;
    }
    each(obj, function (val: any, key: any) {
      const groupKey = iterateFn ? iterateFn.call(context, val, key, obj) : val;
      if (result[groupKey]) {
        result[groupKey].push(val);
      } else {
        result[groupKey] = [val];
      }
    });
  }
  return result;
}

export default groupBy;

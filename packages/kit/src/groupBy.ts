import each from './each';
import isEmpty from './isEmpty';
import isFunction from './isFunction';
import isObject from './isObject';
import property from './property';

type IterateFn<T> = (this: any, item: T, key: any, obj: any) => number | string;
type Iterate<T> = IterateFn<T> | number | string;

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
    | ((this: C, item: T, index: number, obj: T[]) => number | string)
    | number
    | string,
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
    | ((this: C, item: any, key: string, obj: T) => number | string)
    | number
    | string,
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
    } else if (isFunction(iterate)) {
      iterateFn = iterate;
    } else {
      iterateFn = property(iterate as any);
    }
    each(obj, (val: any, key: any) => {
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

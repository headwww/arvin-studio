import each from './each';

/**
 * 查找匹配第一条数据
 * @param array 数组
 * @param iterate 回调
 * @param context 上下文
 */
function filter<T, C = any>(
  array: T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => boolean,
  context?: C,
): T[];

/**
 * 查找匹配第一条数据
 * @param obj 对象
 * @param iterate 回调
 * @param context 上下文
 */
function filter<T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: string, list: T) => boolean,
  context?: C,
): any[];

function filter(obj: any, iterate: any, context?: any): any {
  const result: any = [];
  if (obj && iterate) {
    if (obj.filter) {
      return obj.filter(iterate, context);
    }
    each(obj, (val, key) => {
      if (iterate.call(context, val, key, obj)) {
        result.push(val);
      }
    });
  }
  return result;
}

export default filter;

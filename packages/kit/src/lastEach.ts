import isArray from './isArray';
import lastArrayEach from './lastArrayEach';
import lastObjectEach from './lastObjectEach';

/**
 * 迭代器,从最后开始迭代
 *
 * @param {Object} obj 对象/数组
 * @param {Function} iterate(item, index, obj) 回调
 * @param {Object} context 上下文
 * @return {Object}
 */
function lastEach<T, C = any>(
  list: T[] | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => void,
  context?: C,
): void;
function lastEach<T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: string, obj: T) => void,
  context?: C,
): void;
function lastEach(obj: any, iterate: any, context?: any): any {
  if (obj) {
    const fn = isArray(obj) ? lastArrayEach : lastObjectEach;
    return (fn as any)(obj, iterate, context);
  }
  return obj;
}

export default lastEach;

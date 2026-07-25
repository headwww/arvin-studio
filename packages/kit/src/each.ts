import isArray from './isArray';
import arrayEach from './arrayEach';
import objectEach from './objectEach';

/**
 * 通用迭代器，支持数组和对象
 */
function each<T, C = any>(
  list: T[] | ArrayLike<T> | undefined,
  iterate: (this: C, item: T, index: number, list: T[]) => void,
  context?: C,
): void;

/**
 * 通用迭代器，支持数组和对象
 */
function each<T, C = any>(
  obj: T,
  iterate: (this: C, item: any, key: string, obj: T) => void,
  context?: C,
): void;

function each(obj: any, iterate: any, context?: any): any {
  if (obj) {
    const fn = isArray(obj) ? arrayEach : objectEach;
    return (fn as any)(obj, iterate, context);
  }
  return obj;
}

export default each;

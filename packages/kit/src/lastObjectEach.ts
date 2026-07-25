import lastArrayEach from './lastArrayEach';
import keys from './keys';

/**
 * 对象迭代器，从最后开始迭代
 *
 * @param obj - 要迭代的对象
 * @param iterate - 回调函数，参数为 (item, key, obj)
 * @param context - 上下文对象，作为回调函数的 this
 */
function lastObjectEach<T, C = any>(
  obj: T | undefined,
  iterate: (this: C, item: any, key: string, obj: T) => void,
  context?: C,
): void;
function lastObjectEach<C = any>(
  obj: any,
  iterate: (this: C, item: any, key: string, obj: any) => void,
  context?: C,
): void;
function lastObjectEach(
  obj: any,
  iterate: (this: any, item: any, key: string, obj: any) => void,
  context?: any,
): void {
  lastArrayEach(keys(obj), function (this: any, key: string) {
    iterate.call(context, obj[key], key, obj);
  });
}

export default lastObjectEach;

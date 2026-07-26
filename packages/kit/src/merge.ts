import clone from './clone';
import each from './each';
import helperCheckCopyKey from './helperCheckCopyKey';
import isArray from './isArray';
import isFunction from './isFunction';
import isPlainObject from './isPlainObject';

function handleMerge(target: any, source: any): any {
  if (
    (isPlainObject(target) && isPlainObject(source)) ||
    (isArray(target) && isArray(source))
  ) {
    each(source, (val: any, key: string) => {
      if (helperCheckCopyKey(key)) {
        (target as any)[key] = isFunction(source)
          ? val
          : handleMerge((target as any)[key], val);
      }
    });
    return target;
  }
  return clone(source, true);
}

/**
 * 将一个或多个源对象合并到目标对象中
 *
 * @param target - 目标对象
 * @param sources - 要从中复制属性的多个源对象
 * @returns 合并后的目标对象
 */
function merge<T, U>(target: T, source1: U): T & U;
function merge<T, U, V>(target: T, source1: U, source2: V): T & U & V;
function merge<T, U, V, W>(
  target: T,
  source1: U,
  source2: V,
  source3: W,
): T & U & V & W;
function merge(target: any, ...sources: any[]): any;
function merge(target: any, ...sources: any[]): any {
  if (!target) {
    target = {};
  }

  const result = target;

  for (const source of sources) {
    if (source) {
      handleMerge(result, source);
    }
  }

  return result;
}

export default merge;

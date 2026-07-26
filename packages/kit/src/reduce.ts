import keys from './keys';

/**
 * 接收一个函数作为累加器，数组中的每个值（从左到右）开始合并，最终为一个值
 *
 * @param array - 数组
 * @param callback - 回调函数
 * @param initialValue - 初始值
 * @returns 累加后的值
 */
function reduce<T, U>(
  array: T[] | undefined,
  callback: (previous: U, item: T, index: number, list: T[]) => U,
  initialValue?: U,
): U;
function reduce(array: any, callback?: any, initialValue?: any): any;
function reduce(array: any, callback?: any, initialValue?: any): any {
  if (array) {
    let index = 0;
    const context = null;
    let previous = initialValue;
    const hasInitialValue = initialValue !== undefined;
    const keyList = keys(array);

    if (array.length > 0 && array.reduce) {
      const reduceMethod = function (this: any, ...args: any[]) {
        return callback.apply(context, args);
      };
      if (hasInitialValue) {
        return array.reduce(reduceMethod, previous);
      }
      return array.reduce(reduceMethod);
    }

    if (hasInitialValue) {
      index = 1;
      previous = array[keyList[0]!];
    }

    const len = keyList.length;
    for (; index < len; index++) {
      previous = callback.call(
        context,
        previous,
        array[keyList[index]!],
        index,
        array,
      );
    }

    return previous;
  }
  return undefined;
}

export default reduce;

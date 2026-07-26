import arrayEach from './arrayEach';
import eqNull from './eqNull';
import get from './get';
import isFunction from './isFunction';

/**
 * 创建 min/max 函数
 */
function helperCreateMinMax(
  handle: (rest: any, itemVal: any) => boolean,
): <T>(
  arr: T[],
  iterate?: ((item: T, index: number, list: T[]) => any) | number | string,
) => T | undefined {
  return function <T>(
    arr: T[],
    iterate?: ((item: T, index: number, list: T[]) => any) | number | string,
  ): T | undefined {
    let rest: any;
    let itemIndex: number | undefined;
    if (arr && arr.length > 0) {
      arrayEach(arr, (itemVal: any, index: number) => {
        if (iterate) {
          itemVal = isFunction(iterate)
            ? iterate(itemVal, index, arr)
            : get(itemVal, iterate);
        }
        if (!eqNull(itemVal) && (eqNull(rest) || handle(rest, itemVal))) {
          itemIndex = index;
          rest = itemVal;
        }
      });
      return arr[itemIndex!];
    }
    return rest;
  };
}

export default helperCreateMinMax;

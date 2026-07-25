import isNumber from './isNumber';
import isArray from './isArray';
import isString from './isString';
import isRegExp from './isRegExp';
import isDate from './isDate';
import isBoolean from './isBoolean';
import isUndefined from './isUndefined';
import keys from './keys';
import every from './every';

/**
 * 深度比较两个值是否相等
 */
function helperEqualCompare(
  val1: any,
  val2: any,
  compare: (v1: any, v2: any, key?: any, obj1?: any, obj2?: any) => boolean,
  func?:
    | ((val1: any, val2: any, key: any, obj1?: any, obj2?: any) => any)
    | null,
  key?: any,
  obj1?: any,
  obj2?: any,
): boolean {
  if (val1 === val2) {
    return true;
  }
  if (
    val1 &&
    val2 &&
    !isNumber(val1) &&
    !isNumber(val2) &&
    !isString(val1) &&
    !isString(val2)
  ) {
    if (isRegExp(val1)) {
      return compare(`${val1}`, `${val2}`, key, obj1, obj2);
    }
    if (isDate(val1) || isBoolean(val1)) {
      return compare(+val1, +val2, key, obj1, obj2);
    } else {
      let result: any;
      let val1Keys: string[];
      let val2Keys: string[];
      const isObj1Arr = isArray(val1);
      const isObj2Arr = isArray(val2);
      if (
        isObj1Arr || isObj2Arr
          ? isObj1Arr && isObj2Arr
          : val1.constructor === val2.constructor
      ) {
        val1Keys = keys(val1);
        val2Keys = keys(val2);
        if (func) {
          result = func(val1, val2, key);
        }
        if (val1Keys.length === val2Keys.length) {
          return isUndefined(result)
            ? every(val1Keys, function (key: string, index: number) {
                return (
                  key === val2Keys[index] &&
                  helperEqualCompare(
                    val1[key],
                    val2[val2Keys[index]],
                    compare,
                    func,
                    isObj1Arr || isObj2Arr ? index : key,
                    val1,
                    val2,
                  )
                );
              })
            : !!result;
        }
        return false;
      }
    }
  }
  return compare(val1, val2, key, obj1, obj2);
}

export default helperEqualCompare;

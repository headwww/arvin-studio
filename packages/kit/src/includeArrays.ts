import isArray from './isArray';
import includes from './includes';

/**
 * 判断数组是否包含另一数组
 *
 * @param array1 - 数组
 * @param array2 - 被包含数组
 * @returns 如果 array1 包含 array2 中的所有元素则返回 true，否则返回 false
 */
function includeArrays(array1: any[] | undefined, array2: any[]): boolean;
function includeArrays(array1: any, array2: any): boolean;
function includeArrays(array1: any, array2: any): boolean {
  let len: number;
  let index = 0;

  if (isArray(array1) && isArray(array2)) {
    for (len = array2.length; index < len; index++) {
      if (!includes(array1, array2[index])) {
        return false;
      }
    }
    return true;
  }
  return includes(array1, array2);
}

export default includeArrays;

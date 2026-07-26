import arrayEach from './arrayEach';
import isArray from './isArray';

function flattenDeep(arr: any[], deep?: boolean) {
  let result: any = [];
  arrayEach(arr, (vals) => {
    result = result.concat(
      isArray(vals) ? (deep ? flattenDeep(vals, deep) : vals) : [vals],
    );
  });
  return result;
}

/**
 * 将一个多维数组铺平
 * @param {Array} array 数组
 * @param {Boolean} deep 是否深层
 * @return {Array}
 */
function flatten(arr: any[], deep?: boolean): any[] {
  if (isArray(arr)) {
    return flattenDeep(arr, deep);
  }
  return [];
}

export default flatten;

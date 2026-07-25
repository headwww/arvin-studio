import pluck from './pluck';
import max from './max';

/**
 * 与 zip 相反
 *
 * @param arrays - 数组集合
 * @returns 解压后的数组
 */
function unzip(arrays: any[]): any[];
function unzip(arrays: any): any[];
function unzip(arrays: any): any[] {
  const result: any[] = [];

  if (arrays && arrays.length) {
    const maxItem = max(arrays, function (item: any) {
      return item ? item.length : 0;
    });
    const len = maxItem ? maxItem.length : 0;

    for (let index = 0; index < len; index++) {
      result.push(pluck(arrays, index));
    }
  }

  return result;
}

export default unzip;

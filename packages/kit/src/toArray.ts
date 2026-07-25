import map from './map';

/**
 * 将对象或者伪数组转为新数组
 *
 * @param list - 对象/数组
 * @returns 转换后的数组
 */
function toArray<T>(list: T[] | undefined): T[];
function toArray(list: any): any[];
function toArray(list: any): any[] {
  return map(list, function (item: any) {
    return item;
  });
}

export default toArray;

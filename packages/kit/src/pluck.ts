import map from './map';
import property from './property';

/**
 * 获取数组对象中某属性值，返回一个数组
 *
 * @param array - 数组
 * @param key - 键值
 * @returns 属性值组成的数组
 */
function pluck(array: any[], key: string | number): any[];
function pluck(array: any, key: any): any[];
function pluck(array: any, key: any): any[] {
  return map(array, property(key));
}

export default pluck;

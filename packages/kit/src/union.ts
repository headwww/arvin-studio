import uniq from './uniq';
import toArray from './toArray';

/**
 * 将多个数的值返回唯一的并集数组
 *
 * @param arrays - 多个数组
 * @returns 并集去重后的数组
 */
function union(...arrays: any[]): any[];
function union(...arrays: any[]): any[] {
  let result: any[] = [];

  for (let index = 0; index < arrays.length; index++) {
    result = result.concat(toArray(arrays[index]));
  }

  return uniq(result);
}

export default union;

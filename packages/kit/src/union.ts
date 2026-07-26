import toArray from './toArray';
import uniq from './uniq';

/**
 * 将多个数的值返回唯一的并集数组
 *
 * @param arrays - 多个数组
 * @returns 并集去重后的数组
 */
function union(...arrays: any[]): any[];
function union(...arrays: any[]): any[] {
  let result: any[] = [];

  for (const array of arrays) {
    // eslint-disable-next-line unicorn/no-array-concat-in-loop
    result = result.concat(toArray(array));
  }

  return uniq(result);
}

export default union;

import unzip from './unzip';

/**
 * 将每个数组中相应位置的值合并在一起
 *
 * @param arrays - 多个数组
 * @returns 合并后的数组
 */
function zip(...arrays: any[]): any[];
function zip(...arrays: any[]): any[] {
  return unzip(arrays);
}

export default zip;

import eqNull from './eqNull';
import setupDefaults from './setupDefaults';

/**
 * 获取一个全局唯一标识
 *
 * @param prefix - 自定义前缀
 * @returns 唯一标识字符串
 */
function uniqueId(prefix?: null | number | string | undefined): string;
function uniqueId(prefix?: any): string;
function uniqueId(prefix?: any): string {
  return `${eqNull(prefix) ? '' : prefix}${(setupDefaults.keyId as number)++}`;
}

export default uniqueId;

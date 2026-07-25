import setupDefaults from './setupDefaults';
import eqNull from './eqNull';

/**
 * 获取一个全局唯一标识
 *
 * @param prefix - 自定义前缀
 * @returns 唯一标识字符串
 */
function uniqueId(prefix?: string | number | null | undefined): string;
function uniqueId(prefix?: any): string;
function uniqueId(prefix?: any): string {
  return `${eqNull(prefix) ? '' : prefix}${(setupDefaults.keyId as number)++}`;
}

export default uniqueId;

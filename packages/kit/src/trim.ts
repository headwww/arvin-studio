import trimLeft from './trimLeft';
import trimRight from './trimRight';

/**
 * 去除字符串左右两边的空格
 *
 * @param str - 字符串
 * @returns 去除空格后的字符串
 */
function trim(str: null | string | undefined): string;
function trim(str: any): string;
function trim(str: any): string {
  return str && str.trim ? str.trim() : trimRight(trimLeft(str));
}

export default trim;

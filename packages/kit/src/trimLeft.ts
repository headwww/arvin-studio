import toValueString from './toValueString';

/**
 * 去除字符串左边的空格
 *
 * @param str - 字符串
 * @returns 去除左边空格后的字符串
 */
function trimLeft(str: string | null | undefined): string;
function trimLeft(str: any): string;
function trimLeft(str: any): string {
  return str && str.trimLeft
    ? str.trimLeft()
    : toValueString(str).replace(/^[\s\uFEFF\xA0]+/g, '');
}

export default trimLeft;

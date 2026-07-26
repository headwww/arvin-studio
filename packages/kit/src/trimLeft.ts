import toValueString from './toValueString';

/**
 * 去除字符串左边的空格
 *
 * @param str - 字符串
 * @returns 去除左边空格后的字符串
 */
function trimLeft(str: null | string | undefined): string;
function trimLeft(str: any): string;
function trimLeft(str: any): string {
  return str && str.trimLeft
    ? str.trimStart()
    : toValueString(str).replaceAll(/^[\s\u{FEFF}\u{A0}]+/gu, '');
}

export default trimLeft;

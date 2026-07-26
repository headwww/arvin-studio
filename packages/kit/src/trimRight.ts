import toValueString from './toValueString';

/**
 * 去除字符串右边的空格
 *
 * @param str - 字符串
 * @returns 去除右边空格后的字符串
 */
function trimRight(str: null | string | undefined): string;
function trimRight(str: any): string;
function trimRight(str: any): string {
  return str && str.trimRight
    ? str.trimEnd()
    : toValueString(str).replaceAll(/[\s\u{FEFF}\u{A0}]+$/gu, '');
}

export default trimRight;

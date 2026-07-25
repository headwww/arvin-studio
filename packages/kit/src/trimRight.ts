import toValueString from './toValueString';

/**
 * 去除字符串右边的空格
 *
 * @param str - 字符串
 * @returns 去除右边空格后的字符串
 */
function trimRight(str: string | null | undefined): string;
function trimRight(str: any): string;
function trimRight(str: any): string {
  return str && str.trimRight
    ? str.trimRight()
    : toValueString(str).replace(/[\s\uFEFF\xA0]+$/g, '');
}

export default trimRight;

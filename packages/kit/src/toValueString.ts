import eqNull from './eqNull';
import isNumber from './isNumber';
import toNumberString from './toNumberString';

/**
 * 转字符串
 *
 * @param obj - 值
 * @returns 转换后的字符串
 */
function toValueString(obj: number | string | any[] | null | undefined): string;
function toValueString(obj: any): string;
function toValueString(obj: any): string {
  if (isNumber(obj)) {
    return toNumberString(obj);
  }
  return `${eqNull(obj) ? '' : obj}`;
}

export default toValueString;

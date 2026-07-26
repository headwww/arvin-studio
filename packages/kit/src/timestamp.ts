import helperGetDateTime from './helperGetDateTime';
import isDate from './isDate';
import now from './now';
import toStringDate from './toStringDate';

/**
 * 将日期转为时间戳
 *
 * @param date - 字符串/日期/时间戳
 * @param format - 解析格式 yyyy MM dd HH mm ss SSS
 * @returns 时间戳
 */
function timestamp(
  date: Date | null | number | string | undefined,
  format?: null | string | undefined,
): number;
function timestamp(date: any, format?: null | string | undefined): number;
function timestamp(date: any, format?: any): number {
  if (date) {
    const result = toStringDate(date, format);
    return isDate(result) ? helperGetDateTime(result) : result;
  }
  return now();
}

export default timestamp;

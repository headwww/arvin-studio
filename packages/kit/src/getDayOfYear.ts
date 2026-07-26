import getWhatYear from './getWhatYear';
import isLeapYear from './isLeapYear';
import isValidDate from './isValidDate';
import toStringDate from './toStringDate';

/**
 * 返回某个年份的天数，可以指定前几个年或后几个年，默认当前
 * @param date 字符串/日期/时间戳
 * @param offsetNum 年偏移量(默认0)、前几个年、后几个年
 */
function getDayOfYear(
  date: Date | null | number | string | undefined,
  offsetNum?: number,
): number {
  const d = toStringDate(date);
  if (isValidDate(d)) {
    return isLeapYear(getWhatYear(d, offsetNum!)) ? 366 : 365;
  }
  return NaN;
}

export default getDayOfYear;

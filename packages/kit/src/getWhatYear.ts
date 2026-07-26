import getWhatMonth from './getWhatMonth';
import helperGetDateFullYear from './helperGetDateFullYear';
import isValidDate from './isValidDate';
import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import toStringDate from './toStringDate';

/**
 * 返回前几年或后几年的日期
 * @param date 字符串/日期/时间戳
 * @param offset 年(默认当前年)、前几个年、后几个年
 */
function getWhatYear(
  date: Date | null | number | string | undefined,
  offset: number,
): Date;
/**
 * 返回前几年或后几年的日期，可以指定年初(first)、年末(last)、月份(0~11)，默认当前
 * @param date 字符串/日期/时间戳
 * @param offset 年(默认当前年)、前几个年、后几个年
 * @param month 获取哪月：年初(first)、年末(last)、指定月份(0~11)
 */
function getWhatYear(
  date: Date | null | number | string | undefined,
  offset: number,
  month: 'first' | 'last' | number,
): Date;
function getWhatYear(
  date: Date | null | number | string | undefined,
  offset: number,
  month?: 'first' | 'last' | number,
): Date {
  const d = toStringDate(date);
  if (isValidDate(d)) {
    if (offset) {
      const number = offset && !isNaN(offset) ? offset : 0;
      d.setFullYear(helperGetDateFullYear(d) + number);
    }
    if (month !== undefined || !isNaN(month as any)) {
      if (month === staticStrFirst) {
        return new Date(helperGetDateFullYear(d), 0, 1);
      }
      if (month === staticStrLast) {
        d.setMonth(11);
        return getWhatMonth(d, 0, staticStrLast);
      }
      d.setMonth(month as number);
    }
  }
  return d;
}

export default getWhatYear;

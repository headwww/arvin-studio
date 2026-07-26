import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';
import helperGetDateTime from './helperGetDateTime';
import isNumber from './isNumber';
import isValidDate from './isValidDate';
import staticDayTime from './staticDayTime';
import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import toStringDate from './toStringDate';

/**
 * 返回前几月或后几月的日期
 * @param date 字符串/日期/时间戳
 * @param offset 月偏移量(默认0)、前几个月、后几个月
 */
function getWhatMonth(
  date: Date | null | number | string | undefined,
  offset: number,
): Date;
/**
 * 返回前几月或后几月的日期，可以指定月初(first)、月末(last)、天数，默认当前
 * @param date 字符串/日期/时间戳
 * @param offset 月偏移量(默认当前月)、前几个月、后几个月
 * @param day 获取哪天：月初(first)、月末(last)、指定天数(数值)
 */
function getWhatMonth(
  date: Date | null | number | string | undefined,
  offset: number,
  day: 'first' | 'last' | number,
): Date;
function getWhatMonth(
  date: Date | null | number | string | undefined,
  offset: number,
  day?: 'first' | 'last' | number,
): Date {
  const monthNum = offset && !isNaN(offset) ? offset : 0;
  const d = toStringDate(date);
  if (isValidDate(d)) {
    if (day === staticStrFirst) {
      return new Date(
        helperGetDateFullYear(d),
        helperGetDateMonth(d) + monthNum,
        1,
      );
    }
    if (day === staticStrLast) {
      return new Date(
        helperGetDateTime(
          getWhatMonth(d, monthNum + 1, staticStrFirst as any),
        ) - 1,
      );
    }
    if (isNumber(day)) {
      d.setDate(day as number);
    }
    if (monthNum) {
      const currDate = d.getDate();
      d.setMonth(helperGetDateMonth(d) + monthNum);
      if (currDate !== d.getDate()) {
        // 当为指定天数，且被跨月了，则默认单月最后一天
        d.setDate(1);
        return new Date(helperGetDateTime(d) - staticDayTime);
      }
    }
  }
  return d;
}

export default getWhatMonth;

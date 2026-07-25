import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import staticParseInt from './staticParseInt';
import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';
import helperGetDateTime from './helperGetDateTime';
import toStringDate from './toStringDate';
import isValidDate from './isValidDate';

/**
 * 返回前几天或后几天的日期
 * @param date 字符串/日期/时间戳
 * @param offset 天偏移量(默认0)、前几天、后几天
 */
function getWhatDay(
  date: string | Date | number | null | undefined,
  offset: number,
): Date;
/**
 * 返回前几天或后几天的日期
 * @param date 字符串/日期/时间戳
 * @param offset 天偏移量(默认0)、前几天、后几天
 * @param mode 指定小时(null默认当前时)、0时(first)、23时(last)
 */
function getWhatDay(
  date: string | Date | number | null | undefined,
  offset: number,
  mode: 'first' | 'last',
): Date;
function getWhatDay(
  date: string | Date | number | null | undefined,
  offset: number,
  mode?: 'first' | 'last',
): Date {
  const d = toStringDate(date);
  if (isValidDate(d) && !isNaN(offset)) {
    d.setDate(d.getDate() + staticParseInt(offset));
    if (mode === staticStrFirst) {
      return new Date(
        helperGetDateFullYear(d),
        helperGetDateMonth(d),
        d.getDate(),
      );
    } else if (mode === staticStrLast) {
      return new Date(helperGetDateTime(getWhatDay(d, 1, staticStrFirst)) - 1);
    }
  }
  return d;
}

export default getWhatDay;

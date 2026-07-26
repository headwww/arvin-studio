import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';
import helperGetDateTime from './helperGetDateTime';
import isValidDate from './isValidDate';
import staticParseInt from './staticParseInt';
import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import toStringDate from './toStringDate';

/**
 * 返回前几天或后几天的日期
 * @param date 字符串/日期/时间戳
 * @param offset 天偏移量(默认0)、前几天、后几天
 */
function getWhatDay(
  date: Date | null | number | string | undefined,
  offset: number,
): Date;
/**
 * 返回前几天或后几天的日期
 * @param date 字符串/日期/时间戳
 * @param offset 天偏移量(默认0)、前几天、后几天
 * @param mode 指定小时(null默认当前时)、0时(first)、23时(last)
 */
function getWhatDay(
  date: Date | null | number | string | undefined,
  offset: number,
  mode: 'first' | 'last',
): Date;
function getWhatDay(
  date: Date | null | number | string | undefined,
  offset: number,
  mode?: 'first' | 'last',
): Date {
  const d = toStringDate(date);
  if (isValidDate(d) && !isNaN(offset)) {
    d.setDate(d.getDate() + staticParseInt(offset as any));
    if (mode === staticStrFirst) {
      return new Date(
        helperGetDateFullYear(d),
        helperGetDateMonth(d),
        d.getDate(),
      );
    }
    if (mode === staticStrLast) {
      return new Date(
        helperGetDateTime(getWhatDay(d, 1, staticStrFirst as any)) - 1,
      );
    }
  }
  return d;
}

export default getWhatDay;

import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';
import helperGetDateTime from './helperGetDateTime';
import isValidDate from './isValidDate';
import staticParseInt from './staticParseInt';
import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import toStringDate from './toStringDate';

/**
 * 返回前几秒或后几秒的日期
 * @param date 字符串/日期/时间戳
 * @param offset 秒偏移量(默认0)、前几秒、后几秒
 */
function getWhatSeconds(
  date: Date | null | number | string | undefined,
  offset: number,
): Date;
/**
 * 返回前几秒或后几秒的日期
 * @param date 字符串/日期/时间戳
 * @param offset 秒偏移量(默认0)、前几秒、后几秒
 * @param mode 指定毫秒(null默认当前毫秒)、0毫秒(first)、999毫秒(last)
 */
function getWhatSeconds(
  date: Date | null | number | string | undefined,
  offset: number,
  mode: 'first' | 'last',
): Date;
function getWhatSeconds(
  date: Date | null | number | string | undefined,
  offset: number,
  mode?: 'first' | 'last',
): Date {
  const d = toStringDate(date);
  if (isValidDate(d) && !isNaN(offset)) {
    d.setSeconds(d.getSeconds() + staticParseInt(offset as any));
    if (mode === staticStrFirst) {
      return new Date(
        helperGetDateFullYear(d),
        helperGetDateMonth(d),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
      );
    }
    if (mode === staticStrLast) {
      return new Date(
        helperGetDateTime(getWhatSeconds(d, 1, staticStrFirst as any)) - 1,
      );
    }
  }
  return d;
}

export default getWhatSeconds;

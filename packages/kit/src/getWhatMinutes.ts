import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import staticParseInt from './staticParseInt';
import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';
import helperGetDateTime from './helperGetDateTime';
import toStringDate from './toStringDate';
import isValidDate from './isValidDate';

/**
 * 返回前几分钟或后几分钟的日期
 * @param date 字符串/日期/时间戳
 * @param offset 分钟偏移量(默认0)、前几分钟、后几分钟
 */
function getWhatMinutes(
  date: string | Date | number | null | undefined,
  offset: number,
): Date;
/**
 * 返回前几分钟或后几分钟的日期
 * @param date 字符串/日期/时间戳
 * @param offset 分钟偏移量(默认0)、前几分钟、后几分钟
 * @param mode 指定秒(null默认当前秒)、0秒(first)、59秒(last)
 */
function getWhatMinutes(
  date: string | Date | number | null | undefined,
  offset: number,
  mode: 'first' | 'last',
): Date;
function getWhatMinutes(
  date: string | Date | number | null | undefined,
  offset: number,
  mode?: 'first' | 'last',
): Date {
  const d = toStringDate(date);
  if (isValidDate(d) && !isNaN(offset)) {
    d.setMinutes(d.getMinutes() + staticParseInt(offset as any));
    if (mode === staticStrFirst) {
      return new Date(
        helperGetDateFullYear(d),
        helperGetDateMonth(d),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
      );
    } else if (mode === staticStrLast) {
      return new Date(
        helperGetDateTime(getWhatMinutes(d, 1, staticStrFirst as any)) - 1,
      );
    }
  }
  return d;
}

export default getWhatMinutes;

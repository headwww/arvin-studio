import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import staticParseInt from './staticParseInt';
import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';
import helperGetDateTime from './helperGetDateTime';
import toStringDate from './toStringDate';
import isValidDate from './isValidDate';

/**
 * 返回前几小时或后几小时的日期
 * @param date 字符串/日期/时间戳
 * @param offset 小时偏移量(默认0)、前几小时、后几小时
 */
function getWhatHours(
  date: string | Date | number | null | undefined,
  offset: number,
): Date;
/**
 * 返回前几小时或后几小时的日期
 * @param date 字符串/日期/时间戳
 * @param offset 小时偏移量(默认0)、前几小时、后几小时
 * @param mode 指定分钟(null默认当前分)、0分(first)、59分(last)
 */
function getWhatHours(
  date: string | Date | number | null | undefined,
  offset: number,
  mode: 'first' | 'last',
): Date;
function getWhatHours(
  date: string | Date | number | null | undefined,
  offset: number,
  mode?: 'first' | 'last',
): Date {
  const d = toStringDate(date);
  if (isValidDate(d) && !isNaN(offset)) {
    d.setHours(d.getHours() + staticParseInt(offset as any));
    if (mode === staticStrFirst) {
      return new Date(
        helperGetDateFullYear(d),
        helperGetDateMonth(d),
        d.getDate(),
        d.getHours(),
      );
    } else if (mode === staticStrLast) {
      return new Date(
        helperGetDateTime(getWhatHours(d, 1, staticStrFirst as any)) - 1,
      );
    }
  }
  return d;
}

export default getWhatHours;

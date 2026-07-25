import staticDayTime from './staticDayTime';
import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import helperGetDateTime from './helperGetDateTime';
import getWhatMonth from './getWhatMonth';
import toStringDate from './toStringDate';
import isValidDate from './isValidDate';

/**
 * 返回某个月份的天数，可以指定前几个月或后几个月，默认当前
 * @param date 字符串/日期/时间戳
 * @param offsetNum 月偏移量(默认0)、前几个月、后几个月
 */
function getDayOfMonth(
  date: string | Date | number | null | undefined,
  offsetNum?: number,
): number {
  const d = toStringDate(date);
  if (isValidDate(d)) {
    return (
      Math.floor(
        (helperGetDateTime(getWhatMonth(d, offsetNum!, staticStrLast as any)) -
          helperGetDateTime(
            getWhatMonth(d, offsetNum!, staticStrFirst as any),
          )) /
          staticDayTime,
      ) + 1
    );
  }
  return NaN;
}

export default getDayOfMonth;

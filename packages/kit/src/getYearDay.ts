import getWhatYear from './getWhatYear';
import helperGetYMDTime from './helperGetYMDTime';
import isValidDate from './isValidDate';
import staticDayTime from './staticDayTime';
import staticStrFirst from './staticStrFirst';
import toStringDate from './toStringDate';

/**
 * 返回某个年份的第几天
 * @param date 字符串/日期/时间戳
 */
function getYearDay(date: Date | null | number | string | undefined): number {
  const d = toStringDate(date);
  if (isValidDate(d)) {
    return (
      Math.floor(
        (helperGetYMDTime(d) -
          helperGetYMDTime(getWhatYear(d, 0, staticStrFirst as any))) /
          staticDayTime,
      ) + 1
    );
  }
  return NaN;
}

export default getYearDay;

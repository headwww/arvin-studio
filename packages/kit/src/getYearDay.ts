import staticDayTime from './staticDayTime';
import staticStrFirst from './staticStrFirst';
import helperGetYMDTime from './helperGetYMDTime';
import getWhatYear from './getWhatYear';
import toStringDate from './toStringDate';
import isValidDate from './isValidDate';

/**
 * 返回某个年份的第几天
 * @param date 字符串/日期/时间戳
 */
function getYearDay(date: string | Date | number | null | undefined): number {
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

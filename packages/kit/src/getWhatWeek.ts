import helperGetDateTime from './helperGetDateTime';
import isNumber from './isNumber';
import isValidDate from './isValidDate';
import setupDefaults from './setupDefaults';
import staticDayTime from './staticDayTime';
import staticWeekTime from './staticWeekTime';
import toStringDate from './toStringDate';

export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 返回前几周或后几周的日期
 * @param date 字符串/日期/时间戳
 * @param offsetWeek 周偏移量(默认当前周)、前几周、后几周
 */
function getWhatWeek(
  date: Date | null | number | string | undefined,
  offsetWeek?: FirstDayOfWeek,
): Date;
/**
 * 返回前几周或后几周的日期，可以指定星期几(0~6)，默认当前
 * @param date 字符串/日期/时间戳
 * @param offsetWeek 周偏移量(默认0当前周)、前几周、后几周
 * @param offsetDay 获取星期几(0~6)或 first/last
 * @param firstDay 周视图的起始天，默认星期一
 */
function getWhatWeek(
  date: Date | null | number | string | undefined,
  offsetWeek?: number,
  offsetDay?: 'first' | 'last' | FirstDayOfWeek,
  firstDay?: FirstDayOfWeek,
): Date;
function getWhatWeek(
  date: Date | null | number | string | undefined,
  offsetWeek?: number,
  offsetDay?: 'first' | 'last' | FirstDayOfWeek,
  firstDay?: FirstDayOfWeek,
): Date {
  const d = toStringDate(date);
  if (isValidDate(d)) {
    const hasStartDay = isNumber(firstDay);
    let whatDayTime = helperGetDateTime(d);
    const viewStartDay: number = hasStartDay
      ? (firstDay as number)
      : setupDefaults.firstDayOfWeek!;
    const currentDay = d.getDay();
    let customDay: number;

    if (offsetDay === 'first') {
      customDay = viewStartDay;
    } else if (offsetDay === 'last') {
      customDay = (viewStartDay + 6) % 7;
    } else {
      customDay = isNumber(offsetDay) ? (offsetDay as number) : currentDay;
    }

    if (currentDay !== customDay) {
      let offsetNum = 0;
      if (viewStartDay > currentDay) {
        offsetNum = -(7 - viewStartDay + currentDay);
      } else if (viewStartDay < currentDay) {
        offsetNum = viewStartDay - currentDay;
      }
      if (customDay > viewStartDay) {
        whatDayTime +=
          ((customDay === 0 ? 7 : customDay) - viewStartDay + offsetNum) *
          staticDayTime;
      } else if (customDay < viewStartDay) {
        whatDayTime +=
          (7 - viewStartDay + customDay + offsetNum) * staticDayTime;
      } else {
        whatDayTime += offsetNum * staticDayTime;
      }
    }

    if (offsetWeek && !isNaN(offsetWeek)) {
      whatDayTime += offsetWeek * staticWeekTime;
    }
    return new Date(whatDayTime);
  }
  return d;
}

export default getWhatWeek;

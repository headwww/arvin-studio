import type { FirstDayOfWeek } from './getWhatWeek';

import helperCreateGetDateWeek from './helperCreateGetDateWeek';

/**
 * 返回某个月份的第几周
 * @param date 字符串/日期/时间戳
 * @param firstDay 周视图的起始天，默认星期一
 */
function getMonthWeek(
  date: Date | null | number | string | undefined,
  firstDay?: FirstDayOfWeek,
): number {
  return helperCreateGetDateWeek(
    (targetDate: Date) => {
      return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    },
    (date1: Date, date2: Date) => {
      return date1.getMonth() !== date2.getMonth();
    },
  )(date, firstDay);
}

export default getMonthWeek;

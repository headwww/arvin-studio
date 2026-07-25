import helperCreateGetDateWeek from './helperCreateGetDateWeek';
import type { FirstDayOfWeek } from './getWhatWeek';

/**
 * 返回某个月份的第几周
 * @param date 字符串/日期/时间戳
 * @param firstDay 周视图的起始天，默认星期一
 */
function getMonthWeek(
  date: string | Date | number | null | undefined,
  firstDay?: FirstDayOfWeek,
): number {
  return helperCreateGetDateWeek(
    function (targetDate: Date) {
      return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    },
    function (date1: Date, date2: Date) {
      return date1.getMonth() !== date2.getMonth();
    },
  )(date, firstDay);
}

export default getMonthWeek;

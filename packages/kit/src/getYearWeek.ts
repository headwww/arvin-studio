import helperCreateGetDateWeek from './helperCreateGetDateWeek';
import type { FirstDayOfWeek } from './getWhatWeek';

/**
 * 返回某个年份的第几周
 * @param date 字符串/日期/时间戳
 * @param firstDay 从年初的星期几为起始开始周开始算，默认星期一
 */
function getYearWeek(
  date: string | Date | number | null | undefined,
  firstDay?: FirstDayOfWeek,
): number {
  return helperCreateGetDateWeek(
    function (targetDate: Date) {
      return new Date(targetDate.getFullYear(), 0, 1);
    },
    function (date1: Date, date2: Date) {
      return date1.getFullYear() !== date2.getFullYear();
    },
  )(date, firstDay);
}

export default getYearWeek;

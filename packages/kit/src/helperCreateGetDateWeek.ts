import getWhatWeek from './getWhatWeek';
import helperGetDateTime from './helperGetDateTime';
import includes from './includes';
import isNumber from './isNumber';
import isValidDate from './isValidDate';
import map from './map';
import range from './range';
import setupDefaults from './setupDefaults';
import staticDayTime from './staticDayTime';
import staticWeekTime from './staticWeekTime';
import toStringDate from './toStringDate';

const nextStartMaps = map(range(0, 7), (day: number) => {
  return [(day + 1) % 7, (day + 2) % 7, (day + 3) % 7];
});

function matchWeekStartDay(time: number, viewStartDay: number): boolean {
  const day = new Date(time).getDay();
  return includes(nextStartMaps[viewStartDay], day);
}

function helperCreateGetDateWeek(
  getStartDate: (targetWeekStartDate: Date) => Date,
  checkCrossDate: (
    targetWeekStartDate: Date,
    targetWeekEndDate: Date,
  ) => boolean,
) {
  return function (date: any, firstDay?: any): number {
    const viewStartDay: number = isNumber(firstDay)
      ? firstDay
      : setupDefaults.firstDayOfWeek!;
    const targetDate = toStringDate(date);
    if (isValidDate(targetDate)) {
      const targetWeekStartDate = getWhatWeek(
        targetDate,
        0,
        viewStartDay as any,
        viewStartDay as any,
      );
      const firstDate = getStartDate(targetWeekStartDate);
      const firstTime = helperGetDateTime(firstDate);
      const targetWeekStartTime = helperGetDateTime(targetWeekStartDate);
      const targetWeekEndTime = targetWeekStartTime + staticDayTime * 6;
      const targetWeekEndDate = new Date(targetWeekEndTime);
      const firstWeekStartDate = getWhatWeek(
        firstDate,
        0,
        viewStartDay as any,
        viewStartDay as any,
      );
      const firstWeekStartTime = helperGetDateTime(firstWeekStartDate);
      let tempTime: number;
      if (targetWeekStartTime === firstWeekStartTime) {
        return 1;
      }
      if (checkCrossDate(targetWeekStartDate, targetWeekEndDate)) {
        tempTime = helperGetDateTime(getStartDate(targetWeekEndDate));
        for (; tempTime < targetWeekEndTime; tempTime += staticDayTime) {
          if (matchWeekStartDay(tempTime, viewStartDay)) {
            return 1;
          }
        }
      }
      const firstWeekEndTime = firstWeekStartTime + staticDayTime * 6;
      const firstWeekEndDate = new Date(firstWeekEndTime);
      let offsetNum = 1;
      if (checkCrossDate(firstWeekStartDate as any, firstWeekEndDate as any)) {
        offsetNum = 0;
        tempTime = firstTime;
        for (; tempTime < firstWeekEndTime; tempTime += staticDayTime) {
          if (matchWeekStartDay(tempTime, viewStartDay)) {
            offsetNum++;
            break;
          }
        }
      }
      return (
        Math.floor(
          (targetWeekStartTime - firstWeekStartTime) / staticWeekTime,
        ) + offsetNum
      );
    }
    return NaN;
  };
}

export default helperCreateGetDateWeek;

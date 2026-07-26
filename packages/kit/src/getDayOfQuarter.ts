import getWhatQuarter from './getWhatQuarter';
import helperGetDateTime from './helperGetDateTime';
import isValidDate from './isValidDate';
import staticDayTime from './staticDayTime';
import staticStrFirst from './staticStrFirst';
import staticStrLast from './staticStrLast';
import toStringDate from './toStringDate';

/**
 * 返回某个季度的天数，可以指定前几个季度或后几个季度，默认当前
 * @param date 字符串/日期/时间戳
 * @param offsetNum 季度偏移量(默认0)、前几个季度、后几个季度
 */
function getDayOfQuarter(
  date: Date | null | number | string | undefined,
  offsetNum?: number,
): number {
  const d = toStringDate(date);
  if (isValidDate(d)) {
    return (
      Math.floor(
        (helperGetDateTime(
          getWhatQuarter(d, offsetNum!, staticStrLast as any),
        ) -
          helperGetDateTime(
            getWhatQuarter(d, offsetNum!, staticStrFirst as any),
          )) /
          staticDayTime,
      ) + 1
    );
  }
  return NaN;
}

export default getDayOfQuarter;

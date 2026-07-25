import helperGetDateTime from './helperGetDateTime';
import helperNewDate from './helperNewDate';
import toStringDate from './toStringDate';
import isValidDate from './isValidDate';

type DateInput = string | Date | number | null | undefined;

export interface DateDiffResult {
  /**
   * 是否计算完成（如果结束日期小于开始日期 status 为 false）
   */
  status: boolean;
  /**
   * 已废弃，请使用 status
   * @deprecated
   */
  done: boolean;
  /**
   * 相差多少毫秒
   */
  time: number;
  /** 年 */
  yyyy: number;
  /** 月 */
  MM: number;
  /** 日 */
  dd: number;
  /** 时 */
  HH: number;
  /** 分 */
  mm: number;
  /** 秒 */
  ss: number;
  /** 毫秒 */
  S: number;
}

type DateDiffNumericKey = 'yyyy' | 'MM' | 'dd' | 'HH' | 'mm' | 'ss' | 'S';
type DateDiffRule = [DateDiffNumericKey, number];

const dateDiffRules: DateDiffRule[] = [
  ['yyyy', 31536000000],
  ['MM', 2592000000],
  ['dd', 86400000],
  ['HH', 3600000],
  ['mm', 60000],
  ['ss', 1000],
  ['S', 0],
];

/**
 * 返回两个日期之间差距，如果结束日期小于开始日期 status 为 false
 * @param startDate 开始日期
 * @param endDate 结束日期，不传则使用当前日期
 */
function getDateDiff(
  startDate: DateInput,
  endDate?: DateInput,
): DateDiffResult {
  const result: DateDiffResult = {
    done: false,
    status: false,
    time: 0,
    yyyy: 0,
    MM: 0,
    dd: 0,
    HH: 0,
    mm: 0,
    ss: 0,
    S: 0,
  };
  const start = toStringDate(startDate);
  const end = endDate ? toStringDate(endDate) : helperNewDate();
  if (isValidDate(start) && isValidDate(end)) {
    const startTime = helperGetDateTime(start);
    const endTime = helperGetDateTime(end);
    if (startTime < endTime) {
      let diffTime = endTime - startTime;
      result.time = diffTime;
      result.done = true;
      result.status = true;
      const lastIndex = dateDiffRules.length - 1;
      dateDiffRules.forEach(([key, unit], index) => {
        if (diffTime >= unit) {
          if (index === lastIndex) {
            result[key] = diffTime || 0;
          } else {
            result[key] = Math.floor(diffTime / unit);
            diffTime -= result[key] * unit;
          }
        } else {
          result[key] = 0;
        }
      });
    }
  }
  return result;
}

export default getDateDiff;

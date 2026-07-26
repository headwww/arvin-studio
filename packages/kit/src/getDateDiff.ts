import helperGetDateTime from './helperGetDateTime';
import helperNewDate from './helperNewDate';
import isValidDate from './isValidDate';
import toStringDate from './toStringDate';

type DateInput = Date | null | number | string | undefined;

export interface DateDiffResult {
  /** 日 */
  dd: number;
  /**
   * 已废弃，请使用 status
   * @deprecated
   */
  done: boolean;
  /** 时 */
  HH: number;
  /** 月 */
  MM: number;
  /** 分 */
  mm: number;
  /** 毫秒 */
  S: number;
  /** 秒 */
  ss: number;
  /**
   * 是否计算完成（如果结束日期小于开始日期 status 为 false）
   */
  status: boolean;
  /**
   * 相差多少毫秒
   */
  time: number;
  /** 年 */
  yyyy: number;
}

type DateDiffNumericKey = 'dd' | 'HH' | 'MM' | 'mm' | 'S' | 'ss' | 'yyyy';
type DateDiffRule = [DateDiffNumericKey, number];

const dateDiffRules: DateDiffRule[] = [
  ['yyyy', 31_536_000_000],
  ['MM', 2_592_000_000],
  ['dd', 86_400_000],
  ['HH', 3_600_000],
  ['mm', 60_000],
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

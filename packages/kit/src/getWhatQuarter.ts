import getWhatMonth from './getWhatMonth';
import isValidDate from './isValidDate';
import toStringDate from './toStringDate';

/**
 * 返回前几季度或后几季度的日期
 * @param date 字符串/日期/时间戳
 * @param offset 季度偏移量(默认0)、前几个季度、后几个季度
 */
function getWhatQuarter(
  date: Date | null | number | string | undefined,
  offset: number,
): Date;
/**
 * 返回前几季度或后几季度的日期，可以指定月初(first)、月末(last)、天数，默认当前
 * @param date 字符串/日期/时间戳
 * @param offset 季度偏移量(默认当前季度)、前几个季度、后几个季度
 * @param day 获取哪天：月初(first)、月末(last)、指定天数(数值)
 */
function getWhatQuarter(
  date: Date | null | number | string | undefined,
  offset: number,
  day: 'first' | 'last' | number,
): Date;
function getWhatQuarter(
  date: Date | null | number | string | undefined,
  offset: number,
  day?: 'first' | 'last' | number,
): Date {
  const monthOffset = offset && !isNaN(offset) ? offset * 3 : 0;
  const d = toStringDate(date);
  if (isValidDate(d)) {
    const currMonth = (getQuarterNumber(d) - 1) * 3 + (day === 'last' ? 2 : 0);
    d.setMonth(currMonth);
    return getWhatMonth(d, monthOffset, day as any);
  }
  return d;
}

function getQuarterNumber(date: Date): number {
  const month = date.getMonth();
  if (month < 3) return 1;
  if (month < 6) return 2;
  if (month < 9) return 3;
  return 4;
}

export default getWhatQuarter;

import helperNewDate from './helperNewDate';
import isDate from './isDate';
import toStringDate from './toStringDate';

/**
 * 判断是否闰年
 * @param date 日期
 */
function isLeapYear(date: Date | number | string): boolean;
function isLeapYear(date: any): boolean;
function isLeapYear(date?: any): boolean {
  let year: number;
  const currentDate: Date = date ? toStringDate(date) : helperNewDate();
  if (isDate(currentDate)) {
    year = currentDate.getFullYear();
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  return false;
}

export default isLeapYear;

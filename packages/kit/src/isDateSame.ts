import toDateString from './toDateString'

/**
 * 判断两个日期是否相同
 * @param date1 日期
 * @param date2 日期
 * @param format 对比格式
 */
function isDateSame(date1: Date | number | string, date2: Date | number | string, format?: string | null): boolean
function isDateSame(date1: any, date2: any, format?: string | null): boolean
function isDateSame(date1: any, date2: any, format?: string | null): boolean {
  if (date1 && date2) {
    const d1 = toDateString(date1, format)
    return d1 !== 'Invalid Date' && d1 === toDateString(date2, format)
  }
  return false
}

export default isDateSame

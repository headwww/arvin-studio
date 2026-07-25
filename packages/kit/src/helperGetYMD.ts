import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';

/**
 * 获取时间年月日
 */
function helperGetYMD(date: Date): Date {
  return new Date(
    helperGetDateFullYear(date),
    helperGetDateMonth(date),
    date.getDate(),
  );
}

export default helperGetYMD;

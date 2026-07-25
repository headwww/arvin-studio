import helperGetDateTime from './helperGetDateTime';
import helperGetYMD from './helperGetYMD';

/**
 * 获取时间年月日时间戳
 */
function helperGetYMDTime(date: Date): number {
  return helperGetDateTime(helperGetYMD(date));
}

export default helperGetYMDTime;

import helperCreateGetObjects from './helperCreateGetObjects';

/**
 * 获取对象所有值
 *
 * @param obj - 对象/数组
 * @returns 值的数组
 */
function values<T>(obj: { [s: string]: T } | T[]): T[];
function values(obj: any): any[];
function values(obj: any): any[] {
  const helper = helperCreateGetObjects('values', 0);
  return helper(obj);
}

export default values;

import helperCreateToNumber from './helperCreateToNumber';
import staticParseInt from './staticParseInt';

/**
 * 转整数
 *
 * @param num - 数值/字符串
 * @returns 整数
 */
function toInteger(num: null | number | string | undefined): number;
function toInteger(num: any): number;
function toInteger(num: any): number {
  const helper = helperCreateToNumber(staticParseInt);
  return helper(num);
}

export default toInteger;

import helperCreateToNumber from './helperCreateToNumber';

/**
 * 转数值
 * @param num 数值/字符串
 */
function toNumber(num: null | number | string | undefined): number;
function toNumber(num: any): number;
function toNumber(num: any): number {
  const fn = helperCreateToNumber(parseFloat);
  return fn(num);
}

export default toNumber;

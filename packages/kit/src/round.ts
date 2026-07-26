import helperCreateMathNumber from './helperCreateMathNumber';

/**
 * 对数字进行四舍五入
 * @param num 数值/字符串
 * @param decimalPlaces 小数保留位数
 * @param awayZero 是否远离零四舍五入
 */
function round(
  num: null | number | undefined,
  decimalPlaces?: number,
  awayZero?: boolean,
): number {
  const fn = helperCreateMathNumber('round', true);
  return fn(num as any, decimalPlaces as any, awayZero);
}

export default round;

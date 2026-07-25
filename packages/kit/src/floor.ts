import helperCreateMathNumber from './helperCreateMathNumber';

/**
 * 将数值向下舍入
 * @param num 数值/字符串
 * @param digits 小数保留位数
 */
function floor(
  num: string | number | null | undefined,
  digits?: number,
): number {
  const fn = helperCreateMathNumber('floor');
  return fn(num as any, digits as any);
}

export default floor;

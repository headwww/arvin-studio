import helperCreateMathNumber from './helperCreateMathNumber';

/**
 * 将数值向上舍入
 * @param num 数值/字符串
 */
function ceil(num: string | number | null | undefined): number;
/**
 * 将数值向上舍入
 * @param num 数值/字符串
 * @param digits 小数保留位数
 */
function ceil(num: string | number | null | undefined, digits: number): number;
function ceil(num: any, digits?: number): number {
  const fn = helperCreateMathNumber('ceil');
  return fn(num, digits as number);
}

export default ceil;

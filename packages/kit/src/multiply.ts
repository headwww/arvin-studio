import helperMultiply from './helperMultiply';
import toNumber from './toNumber';

/**
 * 乘法运算
 * @param num1 数值1
 * @param num2 数值2
 */
function multiply(
  num1: number | null | undefined,
  num2: number | null | undefined,
): number;
function multiply(num1: any, num2: any): number;
function multiply(num1: any, num2: any): number {
  return helperMultiply(toNumber(num1), toNumber(num2));
}

export default multiply;

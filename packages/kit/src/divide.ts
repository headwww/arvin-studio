import helperNumberDivide from './helperNumberDivide';
import toNumber from './toNumber';

/**
 * 除法运算
 *
 * @param num1 数值1
 * @param num2 数值2
 */
function divide(
  num1: null | number | undefined,
  num2: null | number | undefined,
): number {
  return helperNumberDivide(toNumber(num1), toNumber(num2));
}

export default divide;

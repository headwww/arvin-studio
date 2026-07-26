import helperNumberAdd from './helperNumberAdd';
import toNumber from './toNumber';

/**
 * 加法运算
 *
 * @param num1 数值1
 * @param num2 数值2
 */
function add(
  num1: null | number | undefined,
  num2: null | number | undefined,
): number {
  return helperNumberAdd(toNumber(num1), toNumber(num2));
}

export default add;

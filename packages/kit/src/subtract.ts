import helperNumberDecimal from './helperNumberDecimal';
import toNumberString from './toNumberString';
import toNumber from './toNumber';
import toFixed from './toFixed';

/**
 * 减法运算
 *
 * @param num1 - 被减数
 * @param num2 - 减数
 * @returns 差值
 */
function subtract(
  num1: number | null | undefined,
  num2: number | null | undefined,
): number;
function subtract(num1: any, num2: any): number;
function subtract(num1: any, num2: any): number {
  const subtrahend = toNumber(num1);
  const minuend = toNumber(num2);
  const str1 = toNumberString(subtrahend);
  const str2 = toNumberString(minuend);
  const digit1 = helperNumberDecimal(str1);
  const digit2 = helperNumberDecimal(str2);
  const ratio = 10 ** Math.max(digit1, digit2);
  const precision = digit1 >= digit2 ? digit1 : digit2;
  return parseFloat(
    toFixed((subtrahend * ratio - minuend * ratio) / ratio, precision),
  );
}

export default subtract;

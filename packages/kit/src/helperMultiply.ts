import helperNumberDecimal from './helperNumberDecimal';
import toNumberString from './toNumberString';

/**
 * 高精度乘法
 */
function helperMultiply(multiplier: number, multiplicand: number): number {
  const str1 = toNumberString(multiplier);
  const str2 = toNumberString(multiplicand);
  return (
    (parseInt(str1.replace('.', '')) * parseInt(str2.replace('.', ''))) /
    10 ** (helperNumberDecimal(str1) + helperNumberDecimal(str2))
  );
}

export default helperMultiply;

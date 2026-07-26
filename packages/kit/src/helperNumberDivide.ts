import helperNumberDecimal from './helperNumberDecimal';
import multiply from './multiply';
import toNumberString from './toNumberString';

/**
 * 高精度除法
 */
function helperNumberDivide(divisor: number, dividend: number): number {
  const str1 = toNumberString(divisor);
  const str2 = toNumberString(dividend);
  const divisorDecimal = helperNumberDecimal(str1);
  const dividendDecimal = helperNumberDecimal(str2);
  const powY = dividendDecimal - divisorDecimal;
  const isMinus = powY < 0;
  const multiplicand = 10 ** (isMinus ? Math.abs(powY) : powY);
  return multiply(
    +str1.replace('.', '') / +str2.replace('.', ''),
    isMinus ? 1 / multiplicand : multiplicand,
  );
}

export default helperNumberDivide;

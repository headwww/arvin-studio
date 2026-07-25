import helperMultiply from './helperMultiply';
import toNumber from './toNumber';
import toNumberString from './toNumberString';

type MathMethod = 'round' | 'ceil' | 'floor';
/**
 * 创建数值运算函数
 */
function helperCreateMathNumber(
  name: MathMethod,
  isRoundFn?: boolean,
): (num: number, decimalPlaces: number, awayZero?: boolean) => number {
  return function (
    num: number,
    decimalPlaces: number,
    awayZero?: boolean,
  ): number {
    const numRest = toNumber(num);
    let rest = numRest;
    if (numRest) {
      decimalPlaces = decimalPlaces >> 0;
      const numStr = toNumberString(numRest);
      const nums = numStr.split('.');
      const intStr = nums[0];
      const floatStr = nums[1] || '';
      const fStr = floatStr.substring(0, decimalPlaces + 1);
      const subRest = intStr + (fStr ? '.' + fStr : '');
      if (decimalPlaces >= floatStr.length) {
        return toNumber(subRest);
      }
      const subRestNum = numRest;
      if (decimalPlaces > 0) {
        const ratio = 10 ** decimalPlaces;
        const tmplNum = helperMultiply(subRestNum, ratio);
        rest =
          isRoundFn && subRestNum < 0 && awayZero !== false
            ? -(Math[name](Math.abs(tmplNum)) / ratio)
            : Math[name](tmplNum) / ratio;
      } else {
        rest = Math[name](subRestNum);
      }
    }
    return rest;
  };
}

export default helperCreateMathNumber;

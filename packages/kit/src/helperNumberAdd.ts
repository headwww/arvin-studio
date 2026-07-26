import helperNumberDecimal from './helperNumberDecimal';
import multiply from './multiply';
import toNumberString from './toNumberString';

/**
 * 高精度加法
 */
function helperNumberAdd(addend: number, augend: number): number {
  const str1 = toNumberString(addend);
  const str2 = toNumberString(augend);
  const ratio =
    10 ** Math.max(helperNumberDecimal(str1), helperNumberDecimal(str2));
  return (multiply(addend, ratio) + multiply(augend, ratio)) / ratio;
}

export default helperNumberAdd;

import { num2str, trimNumber } from '../../util';

/**
 * 获取 step 的十倍值（Shift+点击/Shift+方向键时使用）
 * 规则：把 step 的小数点右移一位——"1.5" → "15"、"0.01" → "0.1"、"2" → "20"
 */
export function getDecupleSteps(step: number | string) {
  const stepStr =
    typeof step === 'number' ? num2str(step) : trimNumber(step).fullStr;
  const hasPoint = stepStr.includes('.');
  // 整数：直接补 0
  if (!hasPoint) {
    return `${step}0`;
  }
  // 小数：把小数点的前一位数字移下来（小数点右移一位）
  return trimNumber(stepStr.replaceAll(/(\d)\.(\d)/g, '$1$2.')).fullStr;
}

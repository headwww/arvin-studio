import round from './round';
import toValueString from './toValueString';
import helperStringRepeat from './helperStringRepeat';
import helperNumberOffsetPoint from './helperNumberOffsetPoint';

/**
 * 将数值四舍五入并格式化为固定小数位的字符串
 *
 * @param num - 数值/字符串
 * @param digits - 小数保留位数
 * @param awayZero - 是否远离零四舍五入
 * @returns 格式化后的字符串
 */
function toFixed(num: any, digits?: number, awayZero?: boolean): string;
function toFixed(num: any, digits?: any, awayZero?: any): string {
  const digitsNum = digits >> 0;
  const str = toValueString(round(num, digitsNum, awayZero));
  const nums = str.split('.');
  const intStr = nums[0];
  const floatStr = nums[1] || '';
  const digitOffsetIndex = digitsNum - floatStr.length;

  if (digitsNum) {
    if (digitOffsetIndex > 0) {
      return `${intStr}.${floatStr}${helperStringRepeat('0', digitOffsetIndex)}`;
    }
    return (
      intStr + helperNumberOffsetPoint(floatStr, Math.abs(digitOffsetIndex))
    );
  }
  return intStr!;
}

export default toFixed;

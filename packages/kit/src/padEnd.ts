import helperStringRepeat from './helperStringRepeat';
import isUndefined from './isUndefined';
import toValueString from './toValueString';

/**
 * 用指定字符从后面开始补全字符串
 *
 * @param str - 字符串
 * @param targetLength - 结果长度
 * @param padString - 补全字符
 * @returns 补全后的字符串
 */
function padEnd(str: string, targetLength: number, padString?: string): string;
function padEnd(str: any, targetLength: number, padString?: any): string;
function padEnd(str: any, targetLength: number, padString?: any): string {
  const rest = toValueString(str);
  targetLength = Math.trunc(targetLength);
  let pad = isUndefined(padString) ? ' ' : `${padString}`;

  if (rest.padEnd) {
    return rest.padEnd(targetLength, pad);
  }

  if (targetLength > rest.length) {
    targetLength -= rest.length;
    if (targetLength > pad.length) {
      pad += helperStringRepeat(pad, targetLength / pad.length);
    }
    return rest + pad.slice(0, targetLength);
  }

  return rest;
}

export default padEnd;

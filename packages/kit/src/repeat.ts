import toValueString from './toValueString';
import helperStringRepeat from './helperStringRepeat';

/**
 * 将字符串重复 n 次
 * @param str 字符串
 * @param count 次数
 */
function repeat(str: string, count: number): string;
function repeat(str: any, count: number): string;
function repeat(str: any, count: number): string {
  return helperStringRepeat(toValueString(str), count);
}

export default repeat;

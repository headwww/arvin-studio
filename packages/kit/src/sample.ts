import shuffle from './shuffle';

/**
 * 从一个数组中随机返回几个元素
 *
 * @param array - 数组
 * @param number - 返回个数，不传则返回一个随机元素
 * @returns 如果 number 未传则返回单个元素，否则返回元素数组
 */
function sample<T>(array: T[]): T;
function sample<T>(array: T[], number: number): T[];
function sample<T>(array: T[], number?: number): T | T[] {
  const result = shuffle(array);

  if (number === undefined) {
    return result[0]!;
  }

  if (number < result.length) {
    result.length = number || 0;
  }
  return result;
}

export default sample;

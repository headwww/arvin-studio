import random from './random';
import values from './values';

/**
 * 将一个数组随机打乱，返回一个新的数组
 *
 * @param list - 数组
 * @returns 打乱后的新数组
 */
function shuffle<T>(list: T[] | undefined): T[];
function shuffle(list: any): any[];
function shuffle(list: any): any[] {
  const result: any[] = [];
  const arr = values(list);
  let len = arr.length - 1;

  for (; len >= 0; len--) {
    const index = len > 0 ? random(0, len) : 0;
    result.push(arr[index]);
    arr.splice(index, 1);
  }

  return result;
}

export default shuffle;

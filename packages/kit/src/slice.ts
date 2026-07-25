import toNumber from './toNumber';

/**
 * 裁剪 Arguments 或数组 array，从 start 位置开始到 end 结束，但不包括 end 本身的位置
 *
 * @param array - 数组或 Arguments
 * @param start - 开始索引
 * @param end - 结束索引（不包含）
 * @returns 裁剪后的数组
 */
function slice<T>(array: T[] | undefined, start: number, end?: number): T[];
function slice(array: any, start?: any, end?: any): any[];
function slice(array: any, start?: any, end?: any): any[] {
  const result: any[] = [];
  const argsSize = arguments.length;

  if (array) {
    const startIndex = argsSize >= 2 ? toNumber(start) : 0;
    const endIndex = argsSize >= 3 ? toNumber(end) : array.length;

    if (array.slice) {
      return array.slice(startIndex, endIndex);
    }

    for (let i = startIndex; i < endIndex; i++) {
      result.push(array[i]);
    }
  }

  return result;
}

export default slice;

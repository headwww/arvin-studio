/**
 * 从最后开始的索引值,返回数组第一个索引值
 * @param list 数组
 * @param val 值
 */
function arrayLastIndexOf<T>(arr: T[], val: T): number;
function arrayLastIndexOf(arr: any, val: any): number {
  for (let index = arr.length - 1; index >= 0; index--) {
    if (val === arr[index]) {
      return index;
    }
  }
  return -1;
}

export default arrayLastIndexOf;

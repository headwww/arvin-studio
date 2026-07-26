/**
 * 返回数组第一个索引值
 * @param list 数组
 * @param val 值
 */
function arrayIndexOf<T>(arr: T[], val: T): number;
function arrayIndexOf(arr: any[], val: any): number {
  for (const [index, element] of arr.entries()) {
    if (val === element) {
      return index;
    }
  }
  return -1;
}

export default arrayIndexOf;

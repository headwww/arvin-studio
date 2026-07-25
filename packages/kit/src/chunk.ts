/**
 * 将一个数组分割成大小的组。如果数组不能被平均分配，那么最后一块将是剩下的元素
 *
 * @param {Array} array 数组
 * @param {Number} size 每组大小
 * @return {Array}
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0, len = arr.length; index < len; index += size) {
    result.push(arr.slice(index, index + size));
  }
  return result;
}

export default chunk;

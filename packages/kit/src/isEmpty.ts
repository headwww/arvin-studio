/**
 * 判断是否为空对象
 *
 * @param val - 要检查的值
 * @returns 如果是空对象则返回 true，否则返回 false
 */
function isEmpty(val: any): boolean {
  // eslint-disable-next-line no-unreachable-loop
  for (const _ in val) {
    return false;
  }
  return true;
}

export default isEmpty;

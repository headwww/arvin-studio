/**
 * 判断是否为 Null
 * @param val 值
 */
function isNull(obj: any): obj is null {
  return obj === null;
}

export default isNull;

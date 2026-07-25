/**
 * 判断是否是一个对象
 * @param val 值
 */
function isPlainObject(val: any): val is object {
  return val ? val.constructor === Object : false;
}

export default isPlainObject;

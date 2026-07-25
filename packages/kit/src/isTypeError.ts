/**
 * 判断是否 TypeError 对象
 * @param val 值
 */
function isTypeError(val: any): val is TypeError {
  return val ? val.constructor === TypeError : false;
}

export default isTypeError;

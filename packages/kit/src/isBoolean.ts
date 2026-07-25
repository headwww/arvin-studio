import helperCreateInTypeof from './helperCreateInTypeof';

/**
 * 判断是否 Boolean 对象
 *
 * @param val - 要检查的值
 * @returns 如果是布尔值则返回 true，否则返回 false
 */
function isBoolean(val: any): val is boolean;
function isBoolean(val: any): boolean {
  return helperCreateInTypeof('boolean')(val);
}

export default isBoolean;

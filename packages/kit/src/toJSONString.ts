import eqNull from './eqNull';

/**
 * JSON 转字符串
 *
 * @param obj - 对象
 * @returns JSON 字符串
 */
function toJSONString(obj: any): string;
function toJSONString(obj: any): string {
  return eqNull(obj) ? '' : JSON.stringify(obj);
}

export default toJSONString;

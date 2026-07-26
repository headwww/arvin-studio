import isPlainObject from './isPlainObject';
import isString from './isString';

/**
 * 字符串转 JSON
 *
 * @param str - 字符串
 * @returns 转换后的对象，失败返回空对象
 */
function toStringJSON(str: null | string | undefined): any;
function toStringJSON(str: any): any;
function toStringJSON(str: any): any {
  if (isPlainObject(str)) {
    return str;
  } else if (isString(str)) {
    try {
      return JSON.parse(str);
    } catch {
      // 解析失败返回空对象
    }
  }
  return {};
}

export default toStringJSON;

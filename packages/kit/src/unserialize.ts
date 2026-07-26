import arrayEach from './arrayEach';
import isString from './isString';
import staticDecodeURIComponent from './staticDecodeURIComponent';

/**
 * 反序列化查询参数
 *
 * @param str - 查询字符串
 * @returns 解析后的参数对象
 */
function unserialize(str: null | string | undefined): any;
function unserialize(str: any): any;
function unserialize(str: any): any {
  const result: Record<string, string> = {};

  if (str && isString(str)) {
    arrayEach(str.split('&'), (param: string) => {
      const items = param.split('=');
      result[staticDecodeURIComponent(items[0]!)] = staticDecodeURIComponent(
        items[1] || '',
      );
    });
  }

  return result;
}

export default unserialize;

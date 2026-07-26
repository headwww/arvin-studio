import each from './each';
import isArray from './isArray';
import isNull from './isNull';
import isPlainObject from './isPlainObject';
import isUndefined from './isUndefined';
import staticEncodeURIComponent from './staticEncodeURIComponent';

function stringifyParams(
  resultVal: any,
  resultKey: string,
  isArr: boolean,
): string[] {
  let result: string[] = [];
  each(resultVal, (item: any, key: string) => {
    const isArrayItem = isArray(item);
    if (isPlainObject(item) || isArrayItem) {
      result = result.concat(
        stringifyParams(item, `${resultKey}[${key}]`, isArrayItem),
      );
    } else {
      result.push(
        `${staticEncodeURIComponent(
          `${resultKey}[${isArr ? '' : key}]`,
        )}=${staticEncodeURIComponent(isNull(item) ? '' : item)}`,
      );
    }
  });
  return result;
}

/**
 * 序列化查询参数
 *
 * @param query - 查询参数对象
 * @returns 序列化后的查询字符串
 */
function serialize(query: any): string;
function serialize(query: any): string {
  let params: string[] = [];
  each(query, (item: any, key: string) => {
    if (isUndefined(item)) {
      return;
    }

    const isArrayItem = isArray(item);
    if (isPlainObject(item) || isArrayItem) {
      params = params.concat(stringifyParams(item, key, isArrayItem));
    } else {
      params.push(
        `${staticEncodeURIComponent(key)}=${staticEncodeURIComponent(
          isNull(item) ? '' : item,
        )}`,
      );
    }
  });
  return params.join('&').replaceAll('%20', '+');
}

export default serialize;

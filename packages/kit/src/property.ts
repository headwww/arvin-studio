import isNull from './isNull';

/**
 * 返回一个获取对象属性的函数
 * @param key 键值
 */
function property(key: string): (obj: any) => any {
  return function (obj: any): any {
    return isNull(obj) ? undefined : obj[key];
  };
}

export default property;

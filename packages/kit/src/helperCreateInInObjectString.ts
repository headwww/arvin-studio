import objectToString from './staticObjectToString';

/**
 * 创建 Object.prototype.toString 类型判断函数
 */
function helperCreateInInObjectString(type: string): (obj: any) => boolean {
  return function (obj: any): boolean {
    return `[object ${type}]` === objectToString.call(obj);
  };
}

export default helperCreateInInObjectString;

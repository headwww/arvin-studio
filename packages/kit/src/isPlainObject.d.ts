/**
 * 判断是否是一个对象
 * @param val 值
 */
export declare function isPlainObject(val: any): val is object;

declare module './ctor' {
  interface AsKitMethods {
    isPlainObject: typeof isPlainObject;
  }
}

export default isPlainObject

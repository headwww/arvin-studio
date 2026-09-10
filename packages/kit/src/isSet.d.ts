/**
 * 判断是否 Set 对象
 * @param val 值
 */
export declare function isSet(val: any): val is Set<any>;

declare module './ctor' {
  interface AsKitMethods {
    isSet: typeof isSet;
  }
}

export default isSet

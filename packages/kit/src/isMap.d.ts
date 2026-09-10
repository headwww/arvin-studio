/**
 * 判断是否 Map 对象
 * @param val 值
 */
export declare function isMap(val: any): val is Map<any, any>;

declare module './ctor' {
  interface AsKitMethods {
    isMap: typeof isMap;
  }
}

export default isMap

/**
 * 判断是否非数值
 * @param val 值
 */
export declare function isNaN(val: any): boolean;

declare module './ctor' {
  interface AsKitMethods {
    isNaN: typeof isNaN;
  }
}

export default isNaN

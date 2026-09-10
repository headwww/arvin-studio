/**
 * 判断是否有效的Date对象
 * @param val 值
 */
export declare function isValidDate(val: any): val is Date;

declare module './ctor' {
  interface AsKitMethods {
    isValidDate: typeof isValidDate;
  }
}

export default isValidDate

/**
 * 判断是否 FormData 对象
 * @param val 值
 */
export declare function isFormData(val: any): val is FormData;

declare module './ctor' {
  interface AsKitMethods {
    isFormData: typeof isFormData;
  }
}

export default isFormData

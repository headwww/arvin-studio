/**
 * 获取对象所有属性
 * @param obj 对象
 */
export declare function keys(obj: any): string[];

declare module './ctor' {
  interface AsKitMethods {
    keys: typeof keys;
  }
}

export default keys

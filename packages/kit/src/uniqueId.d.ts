/**
 * 获取一个全局唯一标识
 * @param prefix 自定义前缀
 */
export declare function uniqueId(prefix?: string | number | null | undefined): string;

declare module './ctor' {
  interface AsKitMethods {
    uniqueId: typeof uniqueId;
  }
}

export default uniqueId

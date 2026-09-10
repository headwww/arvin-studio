/**
 * 获取上下文路径
 */
export declare function getBaseURL(): string;

declare module './ctor' {
  interface AsKitMethods {
    getBaseURL: typeof getBaseURL;
  }
}

export default getBaseURL

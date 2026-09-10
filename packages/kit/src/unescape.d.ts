/**
 * 反转 escape
 * @param str 字符串
 */
export declare function unescape(str: string | null | undefined): string;
export declare function unescape(str: any): string;

declare module './ctor' {
  interface AsKitMethods {
    unescape: typeof unescape;
  }
}

export default unescape

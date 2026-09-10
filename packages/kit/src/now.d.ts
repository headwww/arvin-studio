/**
 * 返回当前时间戳
 */
export declare function now(): number;

declare module './ctor' {
  interface AsKitMethods {
    now: typeof now;
  }
}

export default now

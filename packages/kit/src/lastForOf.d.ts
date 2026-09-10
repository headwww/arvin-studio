/**
 * 已废弃
 * @deprecated
 */
export declare function lastForOf<C = any>(obj: any, iterate: (this: C, item: any, index: any, obj: any) => boolean, context?: C): void;

declare module './ctor' {
  interface AsKitMethods {
    lastForOf: typeof lastForOf;
  }
}

export default lastForOf

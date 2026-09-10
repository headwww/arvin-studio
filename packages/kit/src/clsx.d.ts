export type ClassDictionary = Record<string, any>;
export type ClassArray = ClassValue[];
export type ClassValue =
  | bigint
  | boolean
  | ClassArray
  | ClassDictionary
  | null
  | number
  | string
  | undefined;

/**
 * 将多个类名合并成一个字符串
 * @param inputs 类名, 支持字符串、数字、数组、对象
 */
export declare function clsx(...inputs: ClassValue[]): string;

declare module './ctor' {
  interface AsKitMethods {
    clsx: typeof clsx;
  }
}

export default clsx

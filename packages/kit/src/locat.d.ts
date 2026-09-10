import { AsUrl } from './url'

/**
 * 获取地址栏信息
 */
export declare function locat(): AsUrl;

declare module './ctor' {
  interface AsKitMethods {
    locat: typeof locat;
  }
}

export default locat

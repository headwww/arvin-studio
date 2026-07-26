import type { getConfig, setConfig } from './config';
import type { setI18n, getI18n } from './i18n';

export interface AsExport {
  /**
   * 获取组件语言值
   */
  getI18n: typeof getI18n;
  /**
   * 设置组件语言数据
   */
  setI18n: typeof setI18n;
  /**
   * 设置全局参数
   */
  setConfig: typeof setConfig;
  /**
   * 获取全局参数
   */
  getConfig: typeof getConfig;
}

export const AsCore = {} as AsExport;

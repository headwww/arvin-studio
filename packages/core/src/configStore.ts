import type { SizeType } from './types';

/**
 * 全局参数对象
 */
export interface GlobalConfig {
  /**
   * 全局默认 z-index
   */
  zIndex?: number;
  /**
   * 全局组件尺寸
   */
  size?: SizeType;
  /**
   * 支持对组件中特定的字段进行翻译
   * @param key
   * @param args
   * @returns string
   */
  translate?: (key: string, args?: any) => string;
  /**
   * 自定义方式对组件内置的语言进行翻译
   * @param key
   * @param args
   * @returns string
   */
  i18n?: (key: string, args?: any) => string | number;
}

export const globalConfigStore: GlobalConfig = {
  size: '',
  zIndex: 999,
};

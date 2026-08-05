import { get, merge } from '@arvin-studio/kit';

import DomZIndex from 'dom-zindex';

import { AsCore } from './core';

/**
 * 组件尺寸类型
 */
export type SizeType = '' | 'large' | 'middle' | 'small' | null;

/**
 * 全局参数对象
 */
export interface GlobalConfig {
  /**
   * 自定义方式对组件内置的语言进行翻译
   * @param key
   * @param args
   * @returns string
   */
  i18n?: (key: string, args?: any) => number | string;
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
   * 全局默认 z-index
   */
  zIndex?: number;
}

export const globalConfigStore: GlobalConfig = {
  size: '',
  zIndex: 999,
};

/**
 * TODO 准备废弃 用 ConfigProvider全局参数设置
 */
export function setConfig(options?: GlobalConfig) {
  if (options) {
    if (options.zIndex) {
      DomZIndex.setCurrent(options.zIndex);
    }
    merge(globalConfigStore, options);
  }
  return AsCore;
}

/**
 * 获取全局参数
 */
export function getConfig(key: keyof GlobalConfig, defaultValue?: any) {
  return arguments.length > 0
    ? get(globalConfigStore, key, defaultValue)
    : globalConfigStore;
}

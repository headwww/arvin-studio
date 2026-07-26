import { reactive } from 'vue';

/**
 * @file 国际化模块，提供 Vue 3 响应式多语言翻译能力。
 * 支持语言包动态注册、切换语言、模板插值翻译和查询缓存。
 * @packageDocumentation
 */
import { get, toFormatString } from '@arvin-studio/kit';

import { globalConfigStore } from './config';

/** 支持的语言列表 */
export type Locale =
  | ''
  | 'ar-EG' // 阿拉伯语(埃及)
  | 'de-DE' // 德语(德国)
  | 'en-US' // 英语(美国)
  | 'es-ES' // 西班牙语(国际)
  | 'fr-FR' // 法语(法国)
  | 'hu-HU' // 匈牙利语
  | 'hy-AM' // 亚美尼亚语
  | 'id-ID' // 印度尼西亚语
  | 'it-IT' // 意大利语(意大利)
  | 'ja-JP' // 日语
  | 'ko-KR' // 朝鲜语
  | 'ms-MY' // 马来语(马来西亚)
  | 'nb-NO' // 挪威语(伯克梅尔)(挪威)
  | 'pt-BR' // 葡萄牙语
  | 'ru-RU' // 俄语
  | 'th-TH' // 泰语
  | 'ug-CN' // 维吾尔语
  | 'uk-UA' // 乌克兰语
  | 'uz-UZ' // 乌兹别克语(西里尔文)
  | 'vi-VN' // 越南语
  | 'zh-CHT' // 中文(繁体)
  | 'zh-CN' // 中文(简体)
  | 'zh-HK' // 中文(香港)
  | 'zh-MO' // 中文(澳门)
  | 'zh-TW'; // 中文(繁体)

/**
 * 国际化响应式配置存储。
 * 修改 `language` 或 `langMaps` 会自动触发依赖组件重新渲染。
 */
export const i18nConfigStore: {
  /** 已注册的语言包映射表，key 为语言标识，value 为文案对象 */
  langMaps: Partial<Record<Locale, any>>;
  /** 当前语言 */
  language: Locale;
} = reactive({
  language: '',
  langMaps: {},
});

/** 是否已完成首次语言包安装检查 */
let isCheckInstall = false;

/** 翻译结果缓存，避免同一 key 重复解析 */
let cacheMaps: Record<string, string> = {};

/**
 * 处理 ESM 模块的默认导出。
 * 兼容 CJS/ESM 混合场景下 `import()` 返回的 `module.default`。
 * @param mod - 导入的模块对象
 * @returns 模块的实际导出值
 */
function getDefaultExport(mod: any) {
  if (mod && mod.__esModule) {
    return mod.default;
  }
  return mod;
}

/**
 * 获取当前语言标识。
 * @returns 当前设置的 `Locale` 值
 */
export function getLanguage() {
  const { language } = i18nConfigStore;
  return language;
}

/**
 * 判断指定语言的语言包是否已注册。
 * @param language - 语言标识
 * @returns 已注册返回 `true`，否则返回 `false`
 */
export function hasLanguage(language: Locale) {
  const { langMaps } = i18nConfigStore;
  return !!langMaps[language];
}

/**
 * 注册语言包数据。
 * 多次调用同一语言会合并覆盖之前的数据。
 * @param locale - 语言标识
 * @param data - 语言包 JSON 对象或 `{ default: {...} }` 的 ESM 模块
 */
export function setI18n(locale: Locale, data: Record<string, any>) {
  i18nConfigStore.langMaps[locale] = Object.assign({}, getDefaultExport(data));
}

/**
 * 切换到指定语言，切换后自动清空翻译缓存。
 * 如果传入的语言与当前相同则不做任何操作。
 * @param locale - 目标语言，空值默认回退到 `zh-CN`
 */
export function setLanguage(locale: Locale) {
  const { language } = i18nConfigStore;
  const targetlang = locale || 'zh-CN';
  if (language !== targetlang) {
    i18nConfigStore.language = targetlang;
    cacheMaps = {};
  }
}

/**
 * 根据 key 获取国际化文案，支持命名空间路径和插值参数。
 * 翻译失败时返回 key 本身。
 * @param key - 翻译 key，格式为 `namespace.path`
 * @param args - 可选的插值参数，key 为占位符名，value 为替换值
 * @returns 翻译后的文案字符串
 * @example
 * getI18n('common.submit') // => '提交'
 * getI18n('user.greeting', { name: 'Tom' }) // => '你好，Tom'
 */
export function getI18n(key: string, args?: any) {
  const { langMaps, language } = i18nConfigStore;
  const { i18n } = globalConfigStore;
  // 优先使用全局配置的自定义翻译函数
  if (i18n) {
    return `${i18n(key, args) || ''}`;
  }
  // 首次调用时检查语言包是否已安装
  if (!isCheckInstall) {
    if (!langMaps[language]) {
      console.error(`[arivin core] 语言包未安装。`);
    }
    isCheckInstall = true;
  }
  // 无参数时优先从缓存读取
  if (!args && cacheMaps[key]) {
    return cacheMaps[key];
  }
  // 从语言包中取值，然后进行模板插值
  const i18nLabel = toFormatString(get(langMaps[language], key, key), args);
  if (!args) {
    cacheMaps[key] = i18nLabel;
  }
  return i18nLabel;
}

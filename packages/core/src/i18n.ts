import { get, toFormatString } from '@arvin-studio/kit';
import { reactive } from 'vue';
import { globalConfigStore } from './configStore';

export type Locale =
  | ''
  | 'zh-CN' // 中文(简体)
  | 'zh-CHT' // 中文(繁体)
  | 'zh-HK' // 中文(香港)
  | 'zh-MO' // 中文(澳门)
  | 'zh-TW' // 中文(繁体)
  | 'en-US' // 英语(美国)
  | 'ja-JP' // 日语
  | 'es-ES' // 西班牙语(国际)
  | 'pt-BR' // 葡萄牙语
  | 'vi-VN' // 越南语
  | 'ru-RU' // 俄语
  | 'ko-KR' // 朝鲜语
  | 'hu-HU' // 匈牙利语
  | 'ug-CN' // 维吾尔语
  | 'uz-UZ' // 乌兹别克语(西里尔文)
  | 'nb-NO' // 挪威语(伯克梅尔)(挪威)
  | 'hy-AM' // 亚美尼亚语
  | 'fr-FR' // 法语(法国)
  | 'de-DE' // 德语(德国)
  | 'ar-EG' // 阿拉伯语(埃及)
  | 'uk-UA' // 乌克兰语
  | 'th-TH' // 泰语
  | 'it-IT' // 意大利语(意大利)
  | 'id-ID' // 印度尼西亚语
  | 'ms-MY'; // 马来语(马来西亚)

export const i18nConfigStore: {
  language: Locale;
  langMaps: Partial<Record<Locale, any>>;
} = reactive({
  language: '',
  langMaps: {},
});

let checkInstall = false;
let cacheMaps: Record<string, string> = {};

function getDefaultExport(mod: any) {
  if (mod && mod.__esModule) {
    return mod.default;
  }
  return mod;
}

export function getLanguage() {
  const { language } = i18nConfigStore;
  return language;
}

export function hasLanguage(language: Locale) {
  const { langMaps } = i18nConfigStore;
  return !!langMaps[language];
}

export function setI18n(locale: Locale, data: Record<string, any>) {
  i18nConfigStore.langMaps[locale] = Object.assign({}, getDefaultExport(data));
}

export function setLanguage(locale: Locale) {
  const { language } = i18nConfigStore;
  const targetlang = locale || 'zh-CN';
  if (language !== targetlang) {
    i18nConfigStore.language = targetlang;
    cacheMaps = {};
  }
}

export function getI18n(key: string, args?: any) {
  const { langMaps, language } = i18nConfigStore;
  const { i18n } = globalConfigStore;
  if (i18n) {
    return `${i18n(key, args) || ''}`;
  }
  if (!checkInstall) {
    if (!langMaps[language]) {
      console.error(`[arivin core] 语言包未安装。`);
    }
    checkInstall = true;
  }
  if (!args && cacheMaps[key]) {
    return cacheMaps[key];
  }
  const i18nLabel = toFormatString(get(langMaps[language], key, key), args);
  if (!args) {
    cacheMaps[key] = i18nLabel;
  }
  return i18nLabel;
}

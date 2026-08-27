/**
 * @file 国际化上下文模块，提供 Vue 3 provide/inject 的多语言支持和地区设置能力
 * @packageDocumentation
 */

import type { InjectionKey, Ref } from 'vue';

import type { TransferLocale as TransferLocaleForEmpty } from '../empty';
import type { PopconfirmLocale } from '../popconfirm/PurePanel';

import { computed, defineComponent, inject, provide, ref } from 'vue';

/** 国际化上下文属性，合并了 Locale 和存在标记 */
export type LocaleContextProps = Locale & { exist?: boolean };

/** 国际化上下文接口 */
export interface LocaleContext {
  /** 当前语言的响应式引用 */
  locale: Ref<LocaleContextProps>;
}

/** Provide/Inject 的 Key，用于跨组件传递国际化上下文 */
const LocaleContextKey: InjectionKey<LocaleContext> = Symbol('LocaleContext');

/** 内部标记，用于标识 Provider 组件 */
export const AS_MARK = 'internalMark';

/** TODO 语言包接口 */
export interface Locale {
  Empty?: TransferLocaleForEmpty;
  global?: {
    close?: string;
    placeholder?: string;
    sortable?: string;
  };
  /** 语言标识符，如 `zh-CN`、`en-US` */
  locale: string;
  Popconfirm?: PopconfirmLocale;
}

/** LocaleProvider 组件 Props */
export interface LocaleProviderProps {
  /** 内部标记，供外部判断是否为 Provider 组件 */
  /** @internal */
  _AS_MARK__?: string;
  /** 当前语言包 */
  locale: Locale;
}

/**
 * 向子组件树提供国际化上下文。
 * @param props - 国际化上下文
 */
export function useLocaleProvider(props: LocaleContext) {
  provide(LocaleContextKey, props);
}

/**
 * 国际化提供者组件，接收 locale 并将其注入到子孙组件中。
 * @param props - 语言包属性
 * @param slots - 默认插槽，承载子组件
 * @returns VNode 渲染函数
 * @example
 * <LocaleProvider :locale="{ locale: 'zh-CN' }">
 *   <App />
 * </LocaleProvider>
 */
export const LocaleProvider = defineComponent<LocaleProviderProps>(
  (props, { slots }) => {
    const locale = computed<LocaleContextProps>(() => ({
      ...props.locale,
      /** 标记当前上下文已存在，用于判断是否嵌套 */
      exist: true,
    }));
    useLocaleProvider({ locale });
    return () => {
      return slots?.default?.();
    };
  },
  {
    name: 'LocaleProvider',
  },
);

/**
 * 获取当前国际化上下文，如果未找到 Provider，返回空上下文。
 * @returns 国际化上下文对象，包含响应式的 `locale`
 * @example
 * const { locale } = useLocaleContext();
 * console.log(locale.value.locale); // => 'zh-CN'
 */
export function useLocaleContext() {
  return inject(LocaleContextKey, {
    locale: ref(undefined),
  } as unknown as LocaleContext);
}

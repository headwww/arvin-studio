import type { App, SlotsType } from 'vue';

import type { Locale } from '../locale';
import type { ConfigConsumerProps } from './context';
import type {
  ConfigProviderProps as BaseConfigProviderProps,
  ConfigProviderEmits,
  ConfigProviderSlots,
} from './define';

import { computed, defineComponent } from 'vue';

import { AS_MARK, LocaleProvider, useLocaleContext } from '../locale';
import { useConfig, useConfigProvider } from './context';
import { DisabledContextProvider } from './disabled-context';
import { SizeProvider } from './size-context';

interface ConfigProviderEmitsProps {
  [key: string]: ConfigProviderEmits[string];
}

export interface InternalConfigProviderProps
  extends BaseConfigProviderProps, ConfigProviderEmitsProps {}

interface ProviderChildrenProps
  extends BaseConfigProviderProps, ConfigProviderEmitsProps {
  legacyLocale?: Locale;
  parentContext: ConfigConsumerProps;
}

const PASSED_PROPS: Exclude<
  keyof ConfigConsumerProps,
  'getPrefixCls' | 'rootPrefixCls' | 'warning'
>[] = ['button'];

type WrappedLocale = Locale & { default?: Locale };

// 兼容 ES Module 的 default 导出包装。
// 用户通过 `import * as zhCN from 'xxx'` 引入语言包时，拿到的是 `{ default: locale对象 }`，
// 检测到这种 wrapper 后自动解包取出 default，否则原样返回。
function unwrapLocale(locale?: Locale): Locale | undefined {
  const wrappedLocale = locale as undefined | WrappedLocale;
  if (
    wrappedLocale &&
    typeof wrappedLocale === 'object' &&
    Object.prototype.hasOwnProperty.call(wrappedLocale, 'default') &&
    wrappedLocale.default?.locale
  ) {
    return wrappedLocale.default;
  }
  return locale;
}

const providerDefaultProps: any = {
  componentDisabled: undefined,
};

const ProviderChildren = defineComponent<
  ProviderChildrenProps,
  ConfigProviderEmits,
  string,
  SlotsType<ConfigProviderSlots>
>(
  (props = providerDefaultProps, { slots }) => {
    const locale = computed(() => unwrapLocale(props.locale));

    /**
     * 合并父级 context 与当前 props，产出最终配置。
     * 先全盘继承父级，再用当前层传了值的字段覆盖，未传的保留父级。
     */
    const memoedConfig = computed(() => {
      // 所有祖先传下来的配置
      const parentConfig = {
        ...props.parentContext,
      };

      //  当前这层要设的值
      const baseConfig = {
        direction: props.direction,
        locale: locale.value || props.legacyLocale,
      } as ConfigConsumerProps;

      //  先全盘继承父级
      const config: ConfigConsumerProps = {
        ...parentConfig,
      };

      // 当前有值的 key → 覆盖继承来的
      (Object.keys(baseConfig) as (keyof typeof baseConfig)[]).forEach(
        (key) => {
          if (baseConfig[key] !== undefined) {
            (config as any)[key] = baseConfig[key];
          }
        },
      );

      // 组件级配置同样：有就覆盖
      PASSED_PROPS.forEach((propName) => {
        const propValue = (props as any)[propName];
        if (propValue) {
          (config as any)[propName] = propValue;
        }
      });
      return config;
    });

    useConfigProvider(memoedConfig);

    // TODO 控制开发环境下废弃 API 的警告策略。

    return () => {
      let childNode = slots?.default?.();
      if (locale.value) {
        childNode = (
          <LocaleProvider _AS_MARK__={AS_MARK} locale={locale.value}>
            {childNode}
          </LocaleProvider>
        );
      }
      if (props.componentSize) {
        childNode = (
          <SizeProvider size={props.componentSize}>{childNode}</SizeProvider>
        );
      }
      // TODO Tooltip Unique

      if (props?.componentDisabled !== undefined) {
        childNode = (
          <DisabledContextProvider disabled={props.componentDisabled}>
            {childNode}
          </DisabledContextProvider>
        );
      }

      return childNode;
    };
  },
  {
    inheritAttrs: false,
  },
);

const ConfigProvider = defineComponent<
  InternalConfigProviderProps,
  ConfigProviderEmits,
  string,
  SlotsType<ConfigProviderSlots>
>(
  (props = providerDefaultProps, { slots }) => {
    const context = useConfig();
    const { locale } = useLocaleContext() ?? {};
    return () => {
      const renderEmpty = slots?.renderEmpty ?? props?.renderEmpty;
      return (
        <ProviderChildren
          parentContext={context.value}
          {...props}
          legacyLocale={locale?.value}
          renderEmpty={renderEmpty}
          v-slots={slots}
        />
      );
    };
  },
  {
    name: 'AConfigProvider',
    inheritAttrs: false,
  },
);

(ConfigProvider as any).install = (app: App) => {
  app.component(ConfigProvider.name, ConfigProvider);
};

export default ConfigProvider as typeof ConfigProvider;

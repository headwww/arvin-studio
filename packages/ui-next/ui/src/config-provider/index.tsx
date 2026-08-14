import type { App, SlotsType } from 'vue';

import type { Locale } from '../locale';
import type { ConfigConsumerProps, ThemeConfig } from './context';
import type {
  ConfigProviderProps as BaseConfigProviderProps,
  ConfigProviderEmits,
  ConfigProviderSlots,
} from './define';

import { computed, defineComponent } from 'vue';

import { createTheme } from '@arvin-studio/cssinjs';

import { AS_MARK, LocaleProvider, useLocaleContext } from '../locale';
import { defaultTheme, DesignTokenProvider } from '../theme/context';
import defaultSeedToken from '../theme/themes/seed';
import { defaultIconPrefixCls, useConfig, useConfigProvider } from './context';
import { DisabledContextProvider } from './disabled-context';
import { useTheme } from './hooks/useTheme';
import { SizeProvider } from './size-context';
import useStyle from './style';

export type { CSPConfig } from './context';

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
    const theme = computed(() => props.theme);
    const parentTheme = computed(() => props.parentContext?.theme);
    const locale = computed(() => unwrapLocale(props.locale));
    // =================================== Context ===================================
    const getPrefixCls = (suffixCls: string, customizePrefixCls?: string) => {
      const { prefixCls, parentContext } = props;

      if (customizePrefixCls) {
        return customizePrefixCls;
      }

      const mergedPrefixCls = prefixCls || parentContext.getPrefixCls('');

      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    };

    const iconPrefixCls = computed(
      () =>
        props.iconPrefixCls ??
        props?.parentContext?.iconPrefixCls ??
        defaultIconPrefixCls,
    );
    const csp = computed(() => props.csp ?? props?.parentContext?.csp);

    useStyle(iconPrefixCls, csp);

    const mergedTheme = useTheme(
      theme,
      parentTheme,
      computed(() => {
        return {
          prefixCls: getPrefixCls(''),
        };
      }),
    );

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
        csp: csp.value,
        getPrefixCls,
        theme: mergedTheme.value,
        direction: props.direction,
        locale: locale.value || props.legacyLocale,
        // TODO space: props.space,
        variant: props.variant,
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

    // const styleContext = useStyleContext();
    // const layer = computed(() => styleContext.value.layer);

    // const memoIconContextValue = computed(() => ({
    //   prefixCls: iconPrefixCls.value,
    //   csp: csp.value,
    //   layer: layer.value ? 'as' : undefined,
    //   zeroRuntime: !!layer.value || mergedTheme.value?.zeroRuntime,
    // }));

    // ================================ Dynamic theme ================================
    const memoTheme = computed(() => {
      const { algorithm, token, components, cssVar, ...rest } =
        mergedTheme.value ?? {};
      const themeObj =
        algorithm && (!Array.isArray(algorithm) || algorithm.length > 0)
          ? createTheme(algorithm)
          : defaultTheme;
      const parsedComponents: any = {};
      Object.entries(components || {}).forEach(
        ([componentName, componentToken]) => {
          const parsedToken: typeof componentToken & {
            theme?: typeof defaultTheme;
          } = {
            ...componentToken,
          };
          if ('algorithm' in parsedToken) {
            if (parsedToken.algorithm === true) {
              parsedToken.theme = themeObj;
            } else if (
              Array.isArray(parsedToken.algorithm) ||
              typeof parsedToken.algorithm === 'function'
            ) {
              parsedToken.theme = createTheme(parsedToken.algorithm);
            }
            delete parsedToken.algorithm;
          }
          parsedComponents[componentName] = parsedToken;
        },
      );

      const mergedToken = {
        ...defaultSeedToken,
        ...token,
      };
      return {
        ...rest,
        theme: themeObj,

        token: mergedToken,
        components: parsedComponents,
        override: {
          override: mergedToken,
          ...parsedComponents,
        },
        cssVar: cssVar as Exclude<ThemeConfig['cssVar'], true>,
      };
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

      if (iconPrefixCls.value || csp.value) {
        // TODO childNode = (
        //   <IconContextProvider {...memoIconContextValue.value}>
        //     {childNode}
        //   </IconContextProvider>
        // );
      }

      if (props.componentSize) {
        childNode = (
          <SizeProvider size={props.componentSize}>{childNode}</SizeProvider>
        );
      }
      // TODO Tooltip Unique

      if (props.theme) {
        childNode = (
          <DesignTokenProvider value={memoTheme.value}>
            {childNode}
          </DesignTokenProvider>
        );
      }

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

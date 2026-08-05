import type { InjectionKey, Ref } from 'vue';

import type { Theme } from '@arvin-studio/cssinjs';

import type { AliasToken } from './interface/alias';
import type { OverrideToken } from './interface/cssinjsObj';
import type { MapToken } from './interface/maps';
import type { SeedToken } from './interface/seeds';

import { computed, defineComponent, inject, provide } from 'vue';

import defaultSeedToken from './themes/seed';
export { default as defaultTheme } from './themes/default/theme';

export const defaultConfig = {
  token: defaultSeedToken,
  override: { override: defaultSeedToken },
  hashed: false,
};

export type ComponentsToken = {
  [key in keyof OverrideToken]?: OverrideToken[key] & {
    theme?: Theme<SeedToken, MapToken>;
  };
};

export interface DesignTokenProviderProps {
  //  用户对各组件的 token 覆盖
  components?: ComponentsToken;
  //  { prefix: 'as', key: 'css-var-root' },
  cssVar?: { key?: string; prefix?: string };
  // 是否开启 hashId
  hashed?: boolean | string;
  // 合并后的覆盖
  override: ComponentsToken & { override: Partial<AliasToken> };
  // 用户选择的主题算法（默认/暗色/紧凑）
  theme?: Theme<SeedToken, MapToken>;
  // 用户通过 ConfigProvider.theme.token覆盖的值
  token: Partial<AliasToken>;
  /**
   * @descCN 开启零运行时模式，不会在运行时产生样式，需要手动引入 CSS 文件。
   * ```tsx
   * import { ConfigProvider } from 'antd';
   * import 'antd/dist/antd.css';
   *
   * const Demo = () => (
   *   <ConfigProvider theme={{ zeroRuntime: true }}>
   *     <App />
   *   </ConfigProvider>
   *);
   * ```
   */
  zeroRuntime?: boolean;
}

export const DesignTokenProvider = defineComponent(
  (props, { slots }) => {
    const designToken = computed(() => props.value);
    useDesignTokenProvide(designToken);
    return () => {
      return slots?.default?.();
    };
  },
  {
    // eslint-disable-next-line vue/require-prop-types
    props: ['value'],
  },
);

export function useDesignTokenProvide(props: Ref<DesignTokenProviderProps>) {
  provide(DesignTokenContextKey, props);
}

export const DesignTokenContextKey: InjectionKey<
  Ref<DesignTokenProviderProps>
> = Symbol('DesignTokenContext');

export function useDesignToken() {
  return inject(
    DesignTokenContextKey,
    computed(() => defaultConfig),
  );
}

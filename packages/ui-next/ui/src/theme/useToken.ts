import type { Theme } from '@arvin-studio/cssinjs';

import type { DesignTokenProviderProps } from './context';
import type { AliasToken } from './interface/alias';
import type { GlobalToken } from './interface/cssinjsObj';
import type { SeedToken } from './interface/seeds';

import { computed } from 'vue';

import { useCacheToken } from '@arvin-studio/cssinjs';

import { useConfig } from '../config-provider/context';
import version from '../version';
import { defaultTheme, useDesignToken } from './context';
import defaultSeedToken from './themes/seed';
import formatToken from './util/alias';

export const unitless: {
  [key in keyof AliasToken]?: boolean;
} = {
  lineHeight: true,
  lineHeightSM: true,
  lineHeightLG: true,
  lineHeightHeading1: true,
  lineHeightHeading2: true,
  lineHeightHeading3: true,
  lineHeightHeading4: true,
  lineHeightHeading5: true,
  opacityLoading: true,
  fontWeightStrong: true,
  zIndexPopupBase: true,
  zIndexBase: true,
  opacityImage: true,
};

export const ignore: {
  [key in keyof AliasToken]?: boolean;
} = {
  motionBase: true,
  motionUnit: true,
};

const preserve: {
  [key in keyof AliasToken]?: boolean;
} = {
  screenXS: true,
  screenXSMin: true,
  screenXSMax: true,
  screenSM: true,
  screenSMMin: true,
  screenSMMax: true,
  screenMD: true,
  screenMDMin: true,
  screenMDMax: true,
  screenLG: true,
  screenLGMin: true,
  screenLGMax: true,
  screenXL: true,
  screenXLMin: true,
  screenXLMax: true,
  screenXXL: true,
  screenXXLMin: true,
  screenXXLMax: true,
  screenXXXL: true,
  screenXXXLMin: true,
};

export function getComputedToken(
  originToken: SeedToken,
  overrideToken: DesignTokenProviderProps['components'] & {
    override?: Partial<AliasToken>;
  },
  theme: Theme<any, any>,
) {
  // 第一步：SeedToken → MapToken
  const derivativeToken = theme.getDerivativeToken(originToken);

  const { override, ...components } = overrideToken;

  // 第二步：合并用户覆盖的 token 值
  let mergedDerivativeToken = { ...derivativeToken, override };

  // 第三步：MapToken → AliasToken（加语义别名）
  mergedDerivativeToken = formatToken(mergedDerivativeToken);

  // 第四步：递归处理各组件自己的 token 覆盖
  if (components) {
    Object.entries(components).forEach(([key, value]) => {
      const { theme: componentTheme, ...componentTokens } = value as any;
      const mergedComponentToken = componentTheme
        ? getComputedToken(
            {
              ...mergedDerivativeToken,
              ...componentTokens,
            },
            {
              override: componentTokens,
            },
            componentTheme,
          )
        : componentTokens;
      mergedDerivativeToken[key] = mergedComponentToken;
    });
  }

  return mergedDerivativeToken;
}

export default function useToken() {
  const designContext = useDesignToken();
  const config = useConfig();
  const salt = computed(() => `${version}-${designContext.value.hashed || ''}`);
  const mergedTheme = computed(
    () => designContext.value?.theme || defaultTheme,
  );
  const cssVar = computed(() => {
    const cssVar = designContext.value.cssVar;
    return {
      prefix: cssVar?.prefix ?? config.value?.getPrefixCls?.() ?? 'as',
      key: cssVar?.key ?? 'css-var-root',
    };
  });
  const cachedToken = useCacheToken<GlobalToken, SeedToken>(
    mergedTheme,
    computed(() => [defaultSeedToken, designContext.value.token]),
    computed(() => {
      return {
        salt: salt.value,
        override: designContext.value.override,
        getComputedToken,
        cssVar: {
          ...cssVar.value,
          unitless,
          ignore,
          preserve,
        },
        nonce:
          (designContext.value as { csp?: { nonce?: string } }).csp?.nonce ??
          config.value?.csp?.nonce,
      } as any;
    }),
  );
  const realToken = computed(() => cachedToken.value[2]);
  const hashId = computed(() =>
    designContext.value.hashed ? cachedToken.value[1] : '',
  );
  const token = computed(() => cachedToken.value[0]);
  return [
    mergedTheme,
    realToken,
    hashId,
    token,
    cssVar,
    computed(() => !!designContext.value?.zeroRuntime),
  ];
}

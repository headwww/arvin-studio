import type { Ref, UnwrapRef } from 'vue';

import type {
  AbstractCalculator,
  CSSInterpolation,
  CSSObject,
  TokenType,
} from '../../index';
import type { UseCSP } from '../hooks/useCSP';
import type { UsePrefix } from '../hooks/usePrefix';
import type { UseToken } from '../hooks/useToken';
import type {
  ComponentTokenKey,
  GlobalTokenWithComponent,
  TokenMap,
  TokenMapKey,
} from '../interface';

import { computed, defineComponent } from 'vue';

import {
  genCalc,
  token2CSSVar,
  useCSSVarRegister,
  useStyleRegister,
} from '../../index';
import useDefaultCSP from '../hooks/useCSP';
import useUniqueMemo from '../hooks/useUniqueMemo';
import getComponentToken from './getComponentToken';
import getCompVarPrefix from './getCompVarPrefix';
import getDefaultComponentToken from './getDefaultComponentToken';
import genMaxMin from './maxmin';
import statisticToken, { merge as mergeToken } from './statistic';

type LayerConfig = UnwrapRef<Parameters<typeof useStyleRegister>[0]>['layer'];

export interface StyleInfo {
  hashId: string;
  iconPrefixCls: string;
  prefixCls: string;
  rootPrefixCls: string;
}

export interface CSSUtil {
  calc: (number: any) => AbstractCalculator;
  max: (...values: (number | string)[]) => number | string;
  min: (...values: (number | string)[]) => number | string;
}

export type TokenWithCommonCls<T> = CSSUtil &
  T & {
    /** Wrap as prefixCls class with `.` prefix */
    asCls: string;
    /** Wrap component class with `.` prefix */
    componentCls: string;
    /** Wrap icon class with `.` prefix */
    iconCls: string;
    /** Origin prefix which do not have `.` prefix */
    prefixCls: string;
  };

export type FullToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = TokenWithCommonCls<GlobalTokenWithComponent<CompTokenMap, AliasToken, C>>;

export type GenStyleFn<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = (
  token: FullToken<CompTokenMap, AliasToken, C>,
  info: StyleInfo,
) => CSSInterpolation;

export type GetDefaultTokenFn<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = (token: AliasToken & Partial<CompTokenMap[C]>) => CompTokenMap[C];

export type GetDefaultToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = CompTokenMap[C] | GetDefaultTokenFn<CompTokenMap, AliasToken, C> | null;

export interface SubStyleComponentProps {
  prefixCls: string;
  rootCls?: string;
}

export interface CSSVarRegisterProps {
  component: string;
  cssVar: {
    key?: string;
    prefix?: string;
  };
  rootCls: string;
}

interface GetResetStylesConfig {
  csp: ReturnType<UseCSP>;
  prefix: ReturnType<UsePrefix>;
}

export type GetResetStyles<AliasToken extends TokenType> = (
  token: AliasToken,
  config?: GetResetStylesConfig,
) => CSSInterpolation;

export type GetCompUnitless<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
> = <C extends TokenMapKey<CompTokenMap>>(
  component: [C, string] | C,
) => Partial<Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>>;

function genStyleUtils<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  DesignToken extends TokenType,
>(config: {
  getCommonStyle?: (
    token: AliasToken,
    componentPrefixCls: string,
    rootCls?: string,
    resetFont?: boolean,
  ) => CSSObject;
  getCompUnitless?: GetCompUnitless<CompTokenMap, AliasToken>;
  getResetStyles?: GetResetStyles<AliasToken>;
  layer?: LayerConfig;
  useCSP?: UseCSP;
  usePrefix: UsePrefix;
  useToken: UseToken<CompTokenMap, AliasToken, DesignToken>;
}) {
  // Dependency inversion for preparing basic config.
  const {
    useCSP = useDefaultCSP,
    useToken,
    usePrefix,
    getResetStyles,
    getCommonStyle,
    getCompUnitless,
  } = config;

  /**
   * 为组件创建完整的样式 Hook，组合了 style 注册和 CSS 变量注册两个能力。
   *
   * 这是组件开发者日常使用的入口——调用一次，返回一个 useStyle hook，
   * 组件在 setup 中调用 useStyle(prefixCls) 即可获得 [hashId, cssVarCls]。
   *
   * 内部流程：
   *   1. 合并 unitless 配置（组件级别 + 全局级别，自动给 token 加组件名前缀）
   *   2. 调用 genComponentStyleHook → 底层用 useStyleRegister 注入组件样式到 DOM
   *   3. 调用 genCSSVarRegister → 底层用 useCSSVarRegister 注入组件级 CSS 变量
   *   4. 返回组合 hook：(prefixCls, rootCls?) => [hashId, cssVarCls]
   *
   * @param component - 组件名（如 'Button'）或 [组件名, 后缀]（如 ['Button', 'compact']）
   * @param styleFn - 样式生成函数，接收 FullToken，返回 CSSInterpolation（CSSObject 或数组）
   * @param getDefaultToken - （可选）从全局 token 计算组件默认 token 值
   * @param options - （可选）配置项
   *   - unitless: 不需要自动加 px 单位的 token 属性
   *   - clientOnly: 只在客户端注入样式，SSR 跳过
   *   - order: 样式插入优先级，默认 -999（as 样式始终在最前面）
   *   - injectStyle: 是否注入样式，默认 true。设为 false 可跳过运行时注入（zeroRuntime 模式）
   *   - resetStyle: 是否注入全局重置样式
   *   - deprecatedTokens: 废弃 token 映射 [[旧key, 新key]]
   *
   * @returns useStyle 函数，组件在 setup 中调用，返回 [hashId, cssVarCls]
   *
   * @example
   * // style/index.ts — 定义样式并导出
   * export default genStyleHooks('Button', (token) => {
   *   return { [token.componentCls]: { color: token.colorPrimary } }
   * }, prepareComponentToken, { unitless: { fontWeight: true } })
   *
   * // Button.tsx — 在组件中使用
   * import useStyle from './style'
   * const [hashId, cssVarCls] = useStyle(prefixCls)
   * // hashId → 样式隔离类名 "css-abc123"，拼到根元素 class 上
   * // cssVarCls → CSS 变量作用域类名 "css-var-root"
   */
  function genStyleHooks<C extends TokenMapKey<CompTokenMap>>(
    component: [C, string] | C,
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options?: {
      /**
       * Only use component style in client side. Ignore in SSR.
       */
      clientOnly?: boolean;
      deprecatedTokens?: [
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
      ][];
      /**
       * Whether generate styles
       * @default true
       */
      injectStyle?: boolean;
      /**
       * Set order of component style.
       * @default -999
       */
      order?: number;
      resetFont?: boolean;
      resetStyle?: boolean;
      /**
       * Component tokens that do not need unit.
       */
      unitless?: Partial<
        Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>
      >;
    },
  ) {
    // 解析组件名：支持 ['Button', 'compact'] 数组形式，
    // 取第一个元素作为组件名用于 token 前缀和 CSS 变量 key
    const componentName = Array.isArray(component) ? component[0] : component;

    // 给 token key 加组件名前缀，如 fontWeight → ButtonFontWeight
    // 因为 ComponentToken 的 key 会被合并到全局 token 中，需要前缀防止冲突
    function prefixToken(key: string) {
      // oxlint-disable-next-line typescript/no-unnecessary-type-conversion
      return `${String(componentName)}${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
    }

    // 合并各级 unitless 配置：组件自定义 + 全局 getCompUnitless
    const originUnitless = options?.unitless || {};

    const originCompUnitless =
      typeof getCompUnitless === 'function' ? getCompUnitless(component) : {};

    // unitless 的 key 需要加组件名前缀（因为 token 合并时也被加了前缀）
    const compUnitless: any = {
      ...originCompUnitless,
      [prefixToken('zIndexPopup')]: true, // zIndex 始终不需要单位
    };
    Object.keys(originUnitless).forEach((key) => {
      compUnitless[prefixToken(key)] =
        originUnitless[
          key as keyof ComponentTokenKey<CompTokenMap, AliasToken, C>
        ];
    });

    const mergedOptions = {
      ...options,
      unitless: compUnitless,
      prefixToken,
    };

    // 创建样式注册 hook：底层调用 useStyleRegister → useGlobalCache
    // → parseStyle → normalizeStyle → updateCSS
    const useStyle = genComponentStyleHook(
      component,
      styleFn,
      getDefaultToken,
      mergedOptions,
    );

    // 创建 CSS 变量注册 hook：底层调用 useCSSVarRegister → useGlobalCache
    // 将组件 token 的值写入 CSS 变量并注入 DOM
    const useCSSVar = genCSSVarRegister(
      componentName,
      getDefaultToken,
      mergedOptions,
    );

    // 返回组合 hook，组件在 setup 中调用
    // prefixCls: 组件 CSS 类名前缀，如 as-btn"
    // rootCls: 根节点附加类名（用于 CSS 变量作用域），默认等于 prefixCls
    return (
      prefixCls: Ref<string>,
      rootCls: Ref<string | undefined> = prefixCls,
    ) => {
      const hashId = useStyle(prefixCls, rootCls);
      const cssVarCls = useCSSVar(rootCls);

      return [hashId, cssVarCls] as const;
    };
  }

  function genCSSVarRegister<C extends TokenMapKey<CompTokenMap>>(
    component: C,
    getDefaultToken: GetDefaultToken<CompTokenMap, AliasToken, C> | undefined,
    options: {
      deprecatedTokens?: [
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
      ][];
      ignore?: Partial<Record<keyof AliasToken, boolean>>;
      injectStyle?: boolean;
      prefixToken: (key: string) => string;
      unitless?: Partial<
        Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>
      >;
    },
  ) {
    const { unitless: compUnitless, prefixToken, ignore } = options;
    return (rootCls: Ref<string | undefined>) => {
      const { cssVar, realToken } = useToken();
      useCSSVarRegister(
        computed(() => {
          const _cssVar = cssVar!.value!;
          return {
            path: [component],
            prefix: _cssVar?.prefix,
            key: _cssVar.key,
            unitless: compUnitless,
            ignore,
            token: realToken?.value,
            scope: rootCls.value,
          } as any;
        }),
        () => {
          const defaultToken = getDefaultComponentToken<
            CompTokenMap,
            AliasToken,
            C
          >(component, realToken!.value!, getDefaultToken as any);
          const componentToken = getComponentToken<CompTokenMap, AliasToken, C>(
            component,
            realToken!.value!,
            defaultToken as any,
            {
              deprecatedTokens: options?.deprecatedTokens,
            },
          );
          if (defaultToken) {
            Object.keys(defaultToken).forEach((key) => {
              componentToken[prefixToken(key)] = componentToken[key];
              delete componentToken[key];
            });
          }
          return componentToken;
        },
      );

      return computed(() => cssVar?.value?.key);
    };
  }

  /**
   * 创建组件的样式注册 hook。
   *
   * 这是整个样式系统的真正调度中心——它不直接生成 CSS，而是：
   *   1. 从 useToken / usePrefix / useCSP 收集所有依赖
   *   2. 计算 defaultComponentToken + 合并用户自定义的 componentToken
   *   3. 用 mergeToken 构造 styleFn 需要的完整 token（componentCls、iconCls、calc 等）
   *   4. 调用底层 useStyleRegister 完成 CSSObject → CSS 字符串 → DOM 注入
   *
   * ─────────────────────────────────────────────────────────────────────────
   *  返回的 hook 在组件 setup 中被调用，内部做了：
   * ─────────────────────────────────────────────────────────────────────────
   *
   *   a. zeroRuntime 短路：如果开启了零运行时模式，
   *      只返回 hashId（CSS 文件由构建工具预生成），不调用 useStyleRegister
   *
   *   b. 创建 calc 计算器：根据 type('css') 和 component.unitless 配置，
   *      生成 calc.add().mul().equal() 等链式 API
   *
   *   c. 注入全局重置样式（getResetStyles）：链接样式、图标样式
   *
   *   d. 注入组件样式：styleFn(mergedToken) → CSSObject → useStyleRegister
   *
   *   e. 注入公共样式（getCommonStyle）：滚动条、body 等
   *
   * ─────────────────────────────────────────────────────────────────────────
   *  mergedToken 的组装过程（styleFn 收到的 token 参数）：
   * ─────────────────────────────────────────────────────────────────────────
   *
   *   AliasToken (200+ 全局值: colorPrimary, fontSize, borderRadius...)
   *     + componentCls (".as-btn")
   *     + iconCls (".asicon")
   *     + asCls (".as")
   *     + calc / max / min (CSS 计算辅助)
   *     + defaultComponentToken (组件默认值: fontWeight, iconGap...)
   *     + 用户 ConfigProvider 覆盖的 component token
   *   ─────────────────────────────────────────────────────────
   *   = FullToken<'Button'>
   *
   * @param componentName - 组件名或 [组件名, 后缀]
   * @param styleFn - 样式生成函数
   * @param getDefaultToken - 从全局 token 计算默认组件 token
   * @param options - unitless、clientOnly、order、injectStyle 等
   */
  function genComponentStyleHook<C extends TokenMapKey<CompTokenMap>>(
    componentName: [C, string] | C,
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options: {
      /**
       * Only use component style in client side. Ignore in SSR.
       */
      clientOnly?: boolean;
      deprecatedTokens?: [
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
      ][];
      injectStyle?: boolean;
      /**
       * Set order of component style. Default is -999.
       */
      order?: number;
      resetFont?: boolean;
      resetStyle?: boolean;
      unitless?: Partial<
        Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>
      >;
    } = {},
  ) {
    // 规范化组件名：支持 'Button' → ['Button', 'Button']  或  ['Button', 'compact'] → ['Button', 'compact']
    const cells = (
      Array.isArray(componentName)
        ? componentName
        : [componentName, componentName]
    ) as [C, string];

    // component: 'Button' — 用于查 ComponentTokenMap 的 token 类型
    const [component] = cells;
    // concatComponent: 'Button' 或 'Button-compact' — 拼入缓存 key
    const concatComponent = cells.join('-');

    // @layer 配置，默认包在 'as' 层中
    const mergedLayer = config.layer || {
      name: 'as',
    };

    // 返回 Vue Hook，组件 setup 中调用：useStyle(prefixCls, rootCls?)
    return (prefixCls: Ref<string>, rootCls?: Ref<string | undefined>) => {
      // ── 第一步：收集依赖 ─ ─
      const { theme, hashId, token, realToken, cssVar, zeroRuntime } =
        useToken();

      // zeroRuntime 模式：不生成运行时样式，只返回 hashId 用在 class 上
      const mergedZeroRuntime = computed(() => {
        return zeroRuntime?.value;
      });
      if (mergedZeroRuntime.value) {
        return hashId!;
      }

      const prefix = usePrefix();
      const csp = useCSP();

      // ── 第二步：创建 calc 计算器 ──
      // useUniqueMemo 跨组件实例共享同一个 calc 实例，性能和一致性
      const type = 'css';
      const calc = computed(() => {
        return useUniqueMemo(() => {
          // 收集 unitless 的 CSS 变量名，calc 中这些变量不需要单位
          const unitlessCssVar = new Set<string>();
          Object.keys(options.unitless || {}).forEach((key) => {
            unitlessCssVar.add(token2CSSVar(key, cssVar?.value?.prefix));
            unitlessCssVar.add(
              token2CSSVar(
                key,
                getCompVarPrefix(component, cssVar?.value?.prefix),
              ),
            );
          });

          return genCalc(type, unitlessCssVar);
        }, [type, component, cssVar?.value?.prefix]);
      });

      const { max, min } = genMaxMin(type);

      // ── 第三步：构造 sharedConfig（传给 useStyleRegister 的第一个参数） ──
      const sharedConfig = computed(() => {
        return {
          theme: theme?.value,
          token: token.value,
          hashId: hashId?.value,
          nonce: () => csp.value.nonce!,
          clientOnly: options.clientOnly,
          layer: mergedLayer,
          order: options.order || -999, // as 样式始终在最前面
        };
      });

      // ── 第四步：A — 注入全局重置样式（每个组件只注入一次，缓存共享） ──
      if (typeof getResetStyles === 'function') {
        useStyleRegister(
          computed(
            () =>
              ({
                ...sharedConfig.value,
                clientOnly: false,
                path: ['Shared', prefix.value?.rootPrefixCls],
              }) as any,
          ),
          () =>
            getResetStyles(token.value, {
              prefix: computed(() => ({
                rootPrefixCls: prefix.value.rootPrefixCls,
                iconPrefixCls: prefix.value.iconPrefixCls,
              })),
              csp,
            }),
        );
      }

      // ── 第四步：B — 注入组件自身样式 ──
      useStyleRegister(
        computed(() => {
          return {
            ...sharedConfig.value,
            path: [
              concatComponent,
              prefixCls.value,
              prefix.value.iconPrefixCls,
            ],
          } as any;
        }),
        // styleFn 回调：组装 mergedToken + 调用组件的样式函数
        () => {
          // injectStyle=false → 不生成样式（用于不产生样式的组件）
          if (options.injectStyle === false) {
            return [];
          }

          // 用 Proxy 包装 token，追踪哪些 token 属性被访问了（构建时优化）
          const { token: proxyToken, flush } = statisticToken(token.value);
          const tokenForCalc = realToken?.value || proxyToken;

          // 计算默认组件 token：getDefaultToken(globalToken) → { fontWeight: 400, iconGap: 8, ... }
          const defaultComponentToken = getDefaultComponentToken<
            CompTokenMap,
            AliasToken,
            C
          >(component, tokenForCalc, getDefaultToken as any);

          const componentCls = `.${prefixCls.value}`;

          // 合并用户通过 ConfigProvider 自定义的 componentToken
          const componentToken = getComponentToken<CompTokenMap, AliasToken, C>(
            component,
            tokenForCalc,
            defaultComponentToken as any,
            { deprecatedTokens: options.deprecatedTokens },
          );

          // 将 defaultComponentToken 的值替换为 CSS 变量引用
          // 如 { fontWeight: 400 } → { fontWeight: 'var(--as-btn-font-weight)' }
          if (
            defaultComponentToken &&
            typeof defaultComponentToken === 'object'
          ) {
            Object.keys(defaultComponentToken).forEach((key) => {
              (defaultComponentToken as any)[key] = `var(${token2CSSVar(
                key,
                getCompVarPrefix(component, cssVar?.value?.prefix),
              )})`;
            });
          }

          // 组装最终的 mergedToken → 传给 styleFn
          const mergedToken = mergeToken<any>(
            proxyToken, // 全局 aliasToken（被 Proxy 追踪的版本）
            {
              componentCls, // ".as-btn"
              prefixCls: prefixCls.value,
              iconCls: `.${prefix.value.iconPrefixCls}`,
              asCls: `.${prefix.value.rootPrefixCls}`,
              calc: calc.value, // CSS calc() 计算器
              max,
              min,
            },
            defaultComponentToken, // 插在最后，优先级最高
          );

          // ═════════════════════════════════════════════════════════════
          //  调用组件开发者写的样式函数！
          //  这里的 styleFn 就是 genStyleHooks('Button', (token) => {...}) 的第二个参数
          // ═════════════════════════════════════════════════════════════
          const styleInterpolation = styleFn(mergedToken, {
            hashId: hashId!.value!,
            prefixCls: prefixCls.value,
            rootPrefixCls: prefix.value.rootPrefixCls,
            iconPrefixCls: prefix.value.iconPrefixCls,
          });

          // 记录 token 统计信息（构建时工具用，生产环境 noop）
          flush(component, componentToken);

          // 注入公共样式（滚动条、body 等）
          const commonStyle =
            typeof getCommonStyle === 'function'
              ? getCommonStyle(
                  mergedToken,
                  prefixCls.value,
                  rootCls?.value,
                  options.resetFont,
                )
              : null;

          // 返回数组：useStyleRegister 会将其展平
          // [commonStyle, styleInterpolation] → parseStyle 遍历
          return [
            options.resetStyle === false ? null : commonStyle,
            styleInterpolation,
          ];
        },
      );

      // 返回 hashId，组件用它拼 class
      return hashId!;
    };
  }

  function genSubStyleComponent<C extends TokenMapKey<CompTokenMap>>(
    componentName: [C, string] | C,
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options: {
      /**
       * Only use component style in client side. Ignore in SSR.
       */
      clientOnly?: boolean;
      // Deprecated token key map [["oldTokenKey", "newTokenKey"], ["oldTokenKey", "newTokenKey"]]
      deprecatedTokens?: [
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
        ComponentTokenKey<CompTokenMap, AliasToken, C>,
      ][];
      injectStyle?: boolean;
      /**
       * Set order of component style. Default is -999.
       */
      order?: number;
      resetFont?: boolean;
      resetStyle?: boolean;
      unitless?: Partial<
        Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>
      >;
    } = {},
  ) {
    const useStyle = genComponentStyleHook(
      componentName,
      styleFn,
      getDefaultToken,
      {
        resetStyle: false,

        // Sub Style should default after root one
        order: -998,
        ...options,
      },
    );

    return defineComponent({
      props: {
        prefixCls: String,
        rootCls: String,
      },
      setup(props) {
        useStyle(
          computed(() => props.prefixCls!),
          computed(() => props.rootCls ?? props.prefixCls),
        );
        return () => {
          return null;
        };
      },
      // eslint-disable-next-line vue/order-in-components
      name: `SubStyle_${(Array.isArray(componentName) ? componentName.join('.') : componentName) satisfies string}`,
    });
  }

  return { genStyleHooks, genSubStyleComponent, genComponentStyleHook };
}

export default genStyleUtils;

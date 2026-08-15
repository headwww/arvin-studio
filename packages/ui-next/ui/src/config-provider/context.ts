import type { CSSProperties, InjectionKey, Ref } from 'vue';

import type { VueNode } from '../_util';
import type { ShowWaveEffect } from '../_util/wave/interface';
import type { ButtonProps } from '../button';
import type { Locale } from '../locale';
import type { SpaceProps } from '../space';
import type {
  AliasToken,
  MappingAlgorithm,
  OverrideToken,
} from '../theme/interface';
import type { RenderEmptyHandler } from './default-render-empty';

import { computed, inject, provide, ref } from 'vue';

export const defaultPrefixCls = 'as';
export const defaultIconPrefixCls = 'asicon';

const EMPTY_OBJECT = {};

export type DirectionType = 'ltr' | 'rtl' | undefined;

export const Variants = [
  'outlined',
  'borderless',
  'filled',
  'underlined',
] as const;

export type Variant = (typeof Variants)[number];

export type PopupOverflow = 'scroll' | 'viewport';

export interface ComponentStyleConfig {
  class?: string;
  classes?: unknown;
  style?: CSSProperties;
  styles?: unknown;
}

export interface ComponentBaseProps {
  prefixCls?: string;
  rootClass?: string;
}

type ComponentsConfig = {
  [key in keyof OverrideToken]?: OverrideToken[key] & {
    algorithm?: boolean | MappingAlgorithm | MappingAlgorithm[];
  };
};

export interface ThemeConfig {
  /**
   * @descCN 用于修改 Seed Token 到 Map Token 的算法。
   * @descEN Modify the algorithms of theme.
   * @default defaultAlgorithm
   */
  algorithm?: MappingAlgorithm | MappingAlgorithm[];
  /**
   * @descCN 用于修改各个组件的 Component Token 以及覆盖该组件消费的 Alias Token。
   * @descEN Modify Component Token and Alias Token applied to components.
   */
  components?: ComponentsConfig;
  /**
   * @descCN 通过 `cssVar` 配置来开启 CSS 变量模式，这个配置会被继承。
   * @descEN Enable CSS variable mode through `cssVar` configuration, This configuration will be inherited.
   * @default false
   * @since 5.12.0
   */
  /*
   * `true` only (not `boolean`): CSS variables are always on in v6 —
   * `useToken` unconditionally builds the cssVar config, so `false` would
   * silently behave as enabled.
   */
  cssVar?:
    | true
    // eslint-disable-next-line perfectionist/sort-union-types
    | {
        /**
         * @descCN 主题的唯一 key，版本低于 react@18 时需要手动设置。
         * @descEN Unique key for theme, should be set manually < react@18.
         */
        key?: string;
        /**
         * @descCN css 变量的前缀
         * @descEN Prefix for css variable.
         * @default ant
         */
        prefix?: string;
      };
  /**
   * @descCN 是否开启 `hashed` 属性。如果你的应用中只存在一个版本的 as，你可以设置为 `false` 来进一步减小样式体积。
   * @descEN Whether to enable the `hashed` attribute. If there is only one version of as in your application, you can set `false` to reduce the bundle size.
   * @default true
   * @since 5.0.0
   */
  hashed?: boolean;
  /**
   * @descCN 是否继承外层 `ConfigProvider` 中配置的主题。
   * @descEN Whether to inherit the theme configured in the outer layer `ConfigProvider`.
   * @default true
   */
  inherit?: boolean;
  /**
   * @descCN 用于修改 Design Token。
   * @descEN Modify Design Token.
   */
  token?: Partial<AliasToken>;
  /**
   * @descCN 开启零运行时模式，不会在运行时产生样式，需要手动引入 CSS 文件。
   * @descEN Enable zero-runtime mode, which will not generate style at runtime, need to import additional CSS file.
   * @default true
   * @since 6.0.0
   * @example
   * ```tsx
   * import { ConfigProvider } from 'as';
   * import 'asv-next/dist/as.css';
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

export type ButtonConfig = ComponentStyleConfig &
  Pick<
    ButtonProps,
    'autoInsertSpace' | 'classes' | 'color' | 'shape' | 'styles' | 'variant'
  > & {
    loadingIcon?: VueNode;
  };

export type SpaceConfig = ComponentStyleConfig &
  Pick<SpaceProps, 'classes' | 'size' | 'styles'>;

export interface ConfigComponentProps {
  button?: ButtonConfig;
  space?: SpaceConfig;
  theme?: ThemeConfig;
}

export interface CSPConfig {
  nonce?: string;
}

export type TriggerType =
  | 'click'
  | 'mousedown'
  | 'mouseup'
  | 'pointerdown'
  | 'pointerup';

export interface WaveConfig {
  /**
   * @descCN 是否禁用水波纹效果。
   * @descEN Whether to disable wave effect.
   * @default false
   */
  disabled?: boolean;
  /**
   * @descCN 自定义水波纹效果。
   * @descEN Customized wave effect.
   */
  showEffect?: ShowWaveEffect;
  /**
   * @descCN 触发水波纹效果的事件。
   * @descEN The event that triggers the wave effect.
   * @default 'click'
   */
  triggerType?: TriggerType;
}

export interface ConfigConsumerProps extends ConfigComponentProps {
  csp?: CSPConfig;
  direction?: DirectionType;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => string;
  getTargetContainer?: () => HTMLElement;
  iconPrefixCls: string;
  locale?: Locale;
  // 下拉菜单和选择器同宽。默认将设置 min-width，当值小于选择框宽度时会被忽略。false 时会关闭虚拟滚动
  popupMatchSelectWidth?: boolean;
  popupOverflow?: PopupOverflow;
  renderEmpty?: RenderEmptyHandler;
  rootPrefixCls?: string;
  space?: SpaceConfig;
  variant?: Variant;
  virtual?: boolean;
  wave?: WaveConfig;
}

const ConfigConsumerKey: InjectionKey<Ref<ConfigConsumerProps>> = Symbol(
  'ConfigConsumerContext',
);

export function useConfigProvider(props: Ref<ConfigConsumerProps>) {
  provide(ConfigConsumerKey, props);
}

function defaultGetPrefixCls(suffixCls?: string, customizePrefixCls?: string) {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls;
}

export function useConfig() {
  return inject(
    ConfigConsumerKey,
    ref({
      getPrefixCls: defaultGetPrefixCls,
      iconPrefixCls: defaultIconPrefixCls,
    }) as Ref<ConfigConsumerProps>,
  );
}

export function useBaseConfig<K extends string>(
  suffixCls?: K,
  props?: ComponentBaseProps,
) {
  const config = useConfig();
  return {
    // TODO
    // result: computed(() => config.value?.result),
    // modal: computed(() => config.value?.modal),
    // timeline: computed(() => config.value?.timeline),
    // notification: computed(() => config.value?.notification),
    getPrefixCls: (suffixCls?: string, prefixCls?: string) =>
      config.value?.getPrefixCls(suffixCls, prefixCls),
    prefixCls: computed(() => {
      return config.value?.getPrefixCls(suffixCls, props?.prefixCls);
    }),
    direction: computed(() => {
      return config.value?.direction;
    }),
    getPopupContainer: config?.value.getPopupContainer,
  };
}

/**
 * 组件入口的标准 hook，一行调用拿到该组件需要的所有配置。
 *
 * @param propName  组件名，对应 ConfigComponentProps 的 key，如 'button'
 * @param props     组件自身的 props，用于 prefixCls 个性化覆盖
 * @param keys      额外确保兜底的字段名列表
 *
 * 返回值 = 组件专属配置（拆分为独立 computed refs）+ 通用上下文字段（direction、prefixCls、getPopupContainer 等）。
 */
export function useComponentBaseConfig<
  T extends keyof ConfigComponentProps,
  K extends keyof NonNullable<ConfigComponentProps[T]> = keyof NonNullable<
    ConfigComponentProps[T]
  >,
>(
  propName: T,
  props?: ComponentBaseProps,
  keys?: readonly K[],
  suffixCls?: string,
) {
  const context = useConfig();
  // 从 context 中取出当前组件的专属配置（如 context.value.button）
  const propValue = computed(() => {
    return (context.value as any)[propName] as ConfigComponentProps[T] & {
      classes?: any;
      styles?: any;
    };
  });

  // 将配置对象拆分为独立的 computed refs，避免组件因无关字段变更而重渲染
  const toRefs = <TValue>(propValues: Ref<TValue>) => {
    const result: any = {
      classes: computed(
        () => (propValues.value as any)?.classes ?? EMPTY_OBJECT,
      ),
      styles: computed(() => (propValues.value as any)?.styles ?? EMPTY_OBJECT),
      class: computed(() => (propValues.value as any)?.class),
      style: computed(() => (propValues.value as any)?.style),
    };

    // 遍历配置对象，其余字段逐一转为独立的 computed
    const __keys = Object.keys(result);
    for (const key in propValues.value) {
      if (!__keys.includes(key)) {
        result[key] = computed(() => propValues.value[key]);
      }
    }

    // 确保 keys 中指定的字段一定存在（兜底 undefined）
    if (keys && keys.length > 0) {
      (keys as ReadonlyArray<keyof TValue>).forEach((key) => {
        if (!result[key]) {
          result[key] = computed(() => propValues.value?.[key]);
        }
      });
    }

    return result as { [Key in keyof TValue]-?: Ref<TValue[Key]> };
  };

  const refsData = toRefs(propValue);

  return {
    ...refsData,
    direction: computed(() => context.value.direction),
    prefixCls: computed(() => {
      return context.value?.getPrefixCls(
        suffixCls ?? propName,
        props?.prefixCls,
      );
    }),
    rootPrefixCls: computed(() => context.value?.getPrefixCls()),
    getPopupContainer: context.value.getPopupContainer,
    getPrefixCls: context.value.getPrefixCls,
    getTargetContainer: context.value.getTargetContainer,
    virtual: computed(() => context.value.virtual),
    renderEmpty: computed(() => context.value.renderEmpty),
    popupMatchSelectWidth: computed(() => context.value.popupMatchSelectWidth),
    popupOverflow: computed(() => context.value.popupOverflow),
  };
}

import type { InjectionKey, Ref } from 'vue';

import type { ShowWaveEffect } from '../_util/wave/interface';
import type { Locale } from '../locale';
import type { ConfigComponentProps, SpaceConfig } from './component-config';
import type { RenderEmptyHandler } from './default-render-empty';

import { computed, inject, provide, ref } from 'vue';

export const defaultPrefixCls = 'as';
export const defaultIconPrefixCls = 'asicon';

type GetClassNamesOrEmptyObject<Config extends { classes?: any }> =
  Config extends {
    classes?: infer ClassNames;
  }
    ? ClassNames
    : object;

type GetStylesOrEmptyObject<Config extends { styles?: any }> = Config extends {
  styles?: infer Styles;
}
  ? Styles
  : object;

type ComponentReturnType<T extends keyof ConfigComponentProps> = Omit<
  NonNullable<ConfigComponentProps[T]>,
  'classes' | 'styles'
> & {
  classes: GetClassNamesOrEmptyObject<NonNullable<ConfigComponentProps[T]>>;
  direction: ConfigConsumerProps['direction'];
  getPopupContainer: ConfigConsumerProps['getPopupContainer'];
  getPrefixCls: ConfigConsumerProps['getPrefixCls'];
  styles: GetStylesOrEmptyObject<NonNullable<ConfigComponentProps[T]>>;
};

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

export interface ComponentBaseProps {
  prefixCls?: string;
  rootClass?: string;
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

export function useComponentConfig<T extends keyof ConfigComponentProps>(
  propName: T,
) {
  const context = useConfig();
  return computed(() => {
    const { getPrefixCls, direction, getPopupContainer } = context.value;
    const propValue: ConfigConsumerProps[T] = context.value[propName];

    return {
      classes: EMPTY_OBJECT,
      styles: EMPTY_OBJECT,
      ...propValue,
      getPrefixCls,
      direction,
      getPopupContainer,
    } as ComponentReturnType<T>;
  });
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

import type { CSSProperties, InjectionKey, Ref } from 'vue';

import type { Locale } from '../locale';
import type { RenderEmptyHandler } from './default-render-empty';

import { computed, inject, provide, ref } from 'vue';

export const defaultPrefixCls = 'as';
export const defaultIconPrefixCls = 'asicon';

const EMPTY_OBJECT = {};

export type DirectionType = 'ltr' | 'rtl' | undefined;

export interface ComponentStyleConfig {
  class?: string;
  classes?: unknown;
  style?: CSSProperties;
  styles?: unknown;
}

export interface ComponentBaseProps {
  rootClass?: string;
}

export type ButtonConfig = ComponentStyleConfig;
// &
// Pick<
//   ButtonProps,
//   'autoInsertSpace' | 'classes' | 'color' | 'shape' | 'styles' | 'variant'
// > & {
//   loadingIcon?: VueNode;
// };

export interface ConfigComponentProps {
  button?: ButtonConfig;
}

export interface ConfigConsumerProps extends ConfigComponentProps {
  direction?: DirectionType;
  iconPrefixCls: string;
  locale?: Locale;
  renderEmpty?: RenderEmptyHandler;
  rootPrefixCls?: string;
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
>(propName: T, props?: ComponentBaseProps, keys?: readonly K[]) {
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

  // TODO 组装最终返回值：组件专属配置 + 通用上下文
  return {
    ...refsData,
    direction: computed(() => context.value.direction),
    renderEmpty: computed(() => context.value.renderEmpty),
  };
}

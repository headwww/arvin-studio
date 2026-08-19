/**
 * useVariant 组件变体（variant）解析 hook
 *
 * 用途：把表单类控件最终生效的 variant 按优先级链合并出来——
 * 1. 组件自身的 variant prop（显式传入，优先级最高）；
 * 2. 已废弃的 bordered={false} 兼容映射为 'borderless'；
 * 3. Form 上下文中下发的 variant（useVariantContext）；
 * 4. ConfigProvider 中该组件的专属配置 variant（config.value[component]?.variant）；
 * 5. ConfigProvider 全局 variant；
 * 6. 兜底默认值 'outlined'。
 *
 * 返回值 = [mergedVariant, enableVariantCls]：
 * - mergedVariant：最终生效的 variant 值；
 * - enableVariantCls：是否为官方内置变体（Variants），为 true 时样式层
 *   才会拼接 -variant-xxx 语义类；自定义变体走样式覆盖，不加类名。
 */
import type { Ref } from 'vue';

import type { Variant } from '../../config-provider/context';
import type { ConfigProviderProps } from '../../config-provider/define.ts';

import { computed } from 'vue';

import { useConfig, Variants } from '../../config-provider/context';
import { useVariantContext } from '../context';

/** TODO 支持 variant 配置的表单类组件（对应 ConfigProviderProps 上的专属配置 key） */
type VariantComponents = keyof Pick<
  ConfigProviderProps,
  | 'input'
  | 'inputNumber'

  // | 'card'
  // | 'cascader'
  // | 'datePicker'
  | 'textArea'
  // | 'mentions'
  // | 'rangePicker'
  // | 'select'
  // | 'textArea'
  // | 'timePicker'
  // | 'treeSelect'
>;

/**
 * @param component      组件名，用于读取 ConfigProvider 的组件级 variant 配置
 * @param variant        组件自身传入的 variant prop
 * @param legacyBordered 已废弃的 bordered prop（false 时等价于 variant="borderless"）
 */
export default function useVariant(
  component: VariantComponents,
  variant?: Ref<undefined | Variant>,
  legacyBordered?: boolean | Ref<boolean | undefined>,
) {
  const config = useConfig();
  const formVariant = useVariantContext();

  const mergedVariant = computed<Variant>(() => {
    // 优先级 1：组件 prop 显式传入的 variant 直接生效
    if (variant?.value !== undefined) {
      return variant.value;
    }

    // 兼容旧 API：bordered={false} 等价于 variant="borderless"
    const borderedValue =
      typeof legacyBordered === 'object'
        ? legacyBordered.value
        : legacyBordered;

    if (borderedValue === false) {
      return 'borderless';
    }

    const componentConfigVariant = (config.value as any)?.[component]?.variant;
    const globalVariant = config.value?.variant;

    // 优先级 2~5：Form 上下文 > 组件级配置 > 全局配置 > 默认 outlined
    return (
      formVariant.value ?? componentConfigVariant ?? globalVariant ?? 'outlined'
    );
  });

  // 是否为官方内置变体：决定样式层是否拼接 -variant-xxx 类名
  const enableVariantCls = computed(() =>
    Variants.includes(mergedVariant.value),
  );

  return [mergedVariant, enableVariantCls] as const;
}

// 别名导出，与 useVariant 等价（兼容旧命名）
export const useVariants = useVariant;

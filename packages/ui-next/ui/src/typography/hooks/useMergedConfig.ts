/**
 * useMergedConfig：布尔/对象双形态配置归一化钩子
 *
 * Typography 的 editable/copyable/ellipsis 都支持"布尔简写 或 配置对象"两种写法，
 * 本钩子统一处理：
 * - support：prop 是否为真（决定能力是否启用）；
 * - config：合并后的配置对象（布尔 true 时为空对象，对象时展开，
 *   可再叠加一层默认配置 templateConfig）。
 */
import { computed, unref } from 'vue';

export default function useMergedConfig<Target>(
  propConfig: any,
  templateConfig?: Target,
) {
  // 是否启用（prop 为真值）
  const support = computed(() => !!unref(propConfig));

  // 合并配置：templateConfig 打底，对象形态的 prop 展开覆盖
  const config = computed<Target>(() => {
    const current = unref(propConfig);
    return {
      ...templateConfig,
      ...(support.value && typeof current === 'object' && current),
    } as Target;
  });

  return [support, config] as const;
}

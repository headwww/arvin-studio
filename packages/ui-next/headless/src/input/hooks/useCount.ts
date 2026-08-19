/**
 * useCount：字数统计配置归一化钩子
 *
 * 把两处来源的配置合并为一份强制结构：
 * - showCount（旧接口）：boolean 或 { formatter }
 * - count（新接口）：CountConfig
 *
 * 输出统一为：
 * - show：是否显示计数（布尔）
 * - showFormatter：展示格式化器（show 为函数时）
 * - strategy：计数策略（缺省按 value.length，即 UTF-16 码元数）
 * - max / exceedFormatter 原样透传
 */
import type { Ref } from 'vue';

import type { CountConfig, InputProps, ShowCountFormatter } from '../interface';

import { computed } from 'vue';

/** 归一化后的强制配置结构（strategy 必填、show 收窄为布尔 + 可选 formatter） */
type ForcedCountConfig = Omit<CountConfig, 'show'> &
  Pick<Required<CountConfig>, 'strategy'> & {
    show: boolean;
    showFormatter?: ShowCountFormatter;
  };

/**
 * Cut `value` by the `count.max` prop.
 * 判断 value 是否在 count.max 限制范围内（按 strategy 计数）
 */
export function inCountRange(value: string, countConfig: ForcedCountConfig) {
  if (!countConfig.max) {
    return true;
  }

  const count = countConfig.strategy(value);
  return count <= countConfig.max;
}

export default function useCount(
  count?: Ref<CountConfig>,
  showCount?: Ref<InputProps['showCount']>,
) {
  return computed(() => {
    let mergedConfig: CountConfig = {};

    // 旧接口 showCount：boolean → 直接作为 show；{ formatter } → 作为 show 函数
    if (showCount?.value) {
      mergedConfig.show =
        typeof showCount.value === 'object' && showCount.value?.formatter
          ? showCount.value?.formatter
          : !!showCount.value;
    }

    // 新接口 count 覆盖旧接口
    mergedConfig = {
      ...mergedConfig,
      ...count?.value,
    };

    const { show, ...rest } = mergedConfig!;

    return {
      ...rest,
      show: !!show,
      // show 为函数时即展示格式化器
      showFormatter: typeof show === 'function' ? show : undefined,
      // 缺省策略：字符串长度（UTF-16 码元）
      strategy: rest.strategy || ((value) => value.length),
    } as const;
  });
}

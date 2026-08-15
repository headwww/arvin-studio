import type { Ref } from 'vue';

import { computed } from 'vue';

/** 方向枚举：水平 / 垂直 */
export type Orientation = 'horizontal' | 'vertical';

/** 校验取值是否合法（只接受两种方向，其他值视为未提供） */
function isValidOrientation(orientation?: Orientation) {
  return orientation === 'horizontal' || orientation === 'vertical';
}

/**
 * 合并两套方向接口，输出 [mergedOrientation, isVertical] 元组
 *
 * 合并规则（依次尝试，命中即止）：
 * - orientation 合法 → 直接用 orientation
 * - vertical 是布尔 → vertical ? 'vertical' : 'horizontal'
 * - 都不合法 → 默认 'horizontal'
 *
 * @param orientation 新接口方向 ref
 * @param vertical 布尔写法 ref
 * @returns [合并后的方向, 是否为垂直]（均为响应式 ref）
 */
export function useOrientation(
  orientation?: Ref<Orientation | undefined>,
  vertical?: Ref<boolean | undefined>,
) {
  const _orientation = computed(() => {
    const validOrientation = isValidOrientation(orientation?.value);
    let mergedOrientation: Orientation;
    if (validOrientation) {
      mergedOrientation = orientation!.value!;
    } else if (typeof vertical?.value === 'boolean') {
      mergedOrientation = vertical?.value ? 'vertical' : 'horizontal';
    } else {
      mergedOrientation = 'horizontal';
    }
    // 同时算出「是否垂直」布尔值，避免调用方再比较一次字符串
    return [mergedOrientation, mergedOrientation === 'vertical'] as [
      Orientation,
      boolean,
    ];
  });
  const mergedOrientation = computed(() => _orientation.value[0]);
  const isVertical = computed(() => _orientation.value[1]);
  return [mergedOrientation, isVertical] as [Ref<Orientation>, Ref<boolean>];
}

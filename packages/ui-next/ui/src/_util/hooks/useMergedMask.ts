/**
 * useMergedMask：遮罩（mask）配置归一化与合并钩子
 *
 * 供 Drawer/Modal 等弹层组件使用，把三处来源的遮罩配置合并成最终配置：
 * - 局部 props 的 mask（boolean 或对象）
 * - 全局/上下文（ConfigProvider）的 mask
 * - 独立的 maskClosable（点击遮罩是否可关闭，旧接口）
 *
 * 合并结果包含三个可独立消费的 ref：
 *   enabled（是否显示遮罩）、classNames（blur 模糊类）、closable（点击关闭）
 */
import type { Ref } from 'vue';

import { computed, unref } from 'vue';

/** 遮罩配置对象 */
export interface MaskConfig {
  /** 是否启用模糊背景（生成 `-mask-blur` 类） */
  blur?: boolean;
  /** 点击遮罩是否可关闭 */
  closable?: boolean;
  /** 是否启用遮罩 */
  enabled?: boolean;
}
/** 遮罩配置的对外形态：布尔简写 或 配置对象 */
export type MaskType = boolean | MaskConfig;

/**
 * 把 mask（boolean/对象）归一化为配置对象，并兜底 maskClosable
 * - boolean true/false → { enabled: true/false }
 * - 对象 → 原样使用
 * - 未显式指定 closable 时，用独立的 maskClosable 参数补上（旧接口兼容）
 */
export function normalizeMaskConfig(
  mask?: MaskType,
  maskClosable?: boolean,
): MaskConfig {
  let maskConfig: MaskConfig = {};

  // eslint-disable-next-line unicorn/prefer-ternary
  if (mask && typeof mask === 'object') {
    maskConfig = mask;
  }
  if (typeof mask === 'boolean') {
    maskConfig = {
      enabled: mask,
    };
  }

  if (maskConfig.closable === undefined && maskClosable !== undefined) {
    maskConfig.closable = maskClosable;
  }

  return maskConfig;
}

/**
 * 合并局部与上下文的遮罩配置
 *
 * 合并优先级（后者覆盖前者）：
 *   blur 默认 false ← contextMask ← mask（局部优先）
 *   closable 链：mask.closable ?? maskClosable ?? context.closable ?? true
 *
 * @param mask 局部 props 的 mask ref
 * @param contextMask 上下文 mask ref（ConfigProvider 下发）
 * @param prefixCls 组件前缀（拼 blur 类名用）
 * @param maskClosable 独立的 maskClosable ref（旧接口）
 * @returns [enabled, classNames, closable] 三个只读 ref
 */
export function useMergedMask(
  mask: Ref<MaskType | undefined>,
  contextMask: Ref<MaskType | undefined>,
  prefixCls: Ref<string | undefined>,
  maskClosable?: Ref<boolean | undefined>,
) {
  const context = computed(() => {
    const maskConfig = normalizeMaskConfig(mask.value, unref(maskClosable));
    const contextMaskConfig = normalizeMaskConfig(contextMask.value);
    // 合并：局部 mask 覆盖上下文；closable 走完整兜底链
    const mergedConfig: MaskConfig = {
      blur: false,
      ...contextMaskConfig,
      ...maskConfig,
      closable:
        maskConfig.closable ??
        unref(maskClosable) ??
        contextMaskConfig.closable ??
        true,
    };

    // blur 启用时挂模糊类
    const className = mergedConfig.blur
      ? `${prefixCls.value}-mask-blur`
      : undefined;
    return {
      // enabled !== false 才显示遮罩（undefined 视为启用）
      enabled: mergedConfig.enabled !== false,
      classNames: { mask: className },
      closable: !!mergedConfig.closable,
    };
  });

  return [
    computed(() => context.value.enabled),
    computed(() => context.value.classNames),
    computed(() => context.value.closable),
  ] as const;
}

/**
 * useClosable：closable / closeIcon 配置解析钩子
 *
 * 供 Tag/Alert/Modal/Drawer 等"可关闭"组件复用，统一解析关闭能力：
 * - closable 支持布尔或对象（{ closeIcon, disabled, aria-* }）；
 * - 关闭图标（closeIcon）支持插槽/函数/静态节点多种形态；
 * - 三处来源按优先级合并：props（组件属性）> context（ConfigProvider）> fallback（默认值）；
 * - 最终产出：[是否可关闭, 关闭图标节点, 关闭按钮是否禁用, aria/data 属性]，
 *   关闭图标会自动补 aria-label（本地化文案）与 aria 属性，保证无障碍。
 *
 * 文件同时提供响应式（useClosable）与非响应式（computeClosable）两套实现。
 */
import type { AriaAttributes, Ref, VNodeChild } from 'vue';

import type { RenderNodeFn, VueNode } from '../types';

import { computed, createVNode, isVNode, ref, unref } from 'vue';

import { filterEmpty, pickAttrs } from '@arvin-studio/headless';
import { CloseOutlined } from '@arvin-studio/icons';

import defaultLocale from '../../locale/en_US';
import useLocale from '../../locale/useLocale';
import extendsObject from '../extendsObject';
import isNonNullable from '../isNonNullable';
import { getSlotPropsFnRun } from '../tools';
import { getVNode } from '../vueNode';

/** data-* 自定义属性集合 */
interface DataAttributes {
  [key: `data-${string}`]: string;
}
/** closable 的对外形态：布尔简写 或 配置对象（关闭图标/禁用/无障碍属性） */
export type ClosableType =
  | (AriaAttributes & {
      closeIcon?: VueNode;
      disabled?: boolean;
    })
  | boolean;

/** 上下文可提供的 closable 相关字段（基础形态） */
export interface BaseContextClosable {
  closable?: ClosableType;
  closeIcon?: VueNode;
}

/** 从上下文类型中抽取 closable/closeIcon 字段 */
export type ContextClosable<T extends BaseContextClosable = any> = Partial<
  Pick<T, 'closable' | 'closeIcon'>
>;

/** 从上下文中挑出 closable/closeIcon 两个字段（只保留与本组件相关的部分） */
export function pickClosable<T extends BaseContextClosable>(
  context: Ref<ContextClosable<T>>,
): Ref<ContextClosable<T> | undefined> {
  return computed(() => {
    if (!context.value) {
      return undefined;
    }
    const { closable, closeIcon } = context.value;
    return { closable, closeIcon };
  });
}

/** Collection contains the all the props related with closable. e.g. `closable`, `closeIcon` */
/** 与 closable 相关的字段集合（closable / closeIcon） */
interface ClosableCollection {
  closable?: ClosableType;
  closeIcon?: VueNode;
}

/** fallback 集合：在 ClosableCollection 基础上可附加 closeIconRender */
interface FallbackCloseCollection extends ClosableCollection {
  /**
   * Some components need to wrap CloseIcon twice,
   * this method will be executed once after the final CloseIcon is calculated
   */
  /**
   * 部分组件需要把关闭图标再包一层，
   * 该函数会在最终关闭图标计算完成后执行一次（如 Tag 的图标包装）
   */
  closeIconRender?: (closeIcon: VNodeChild) => VNodeChild;
}

/** useClosable 的入参集合 */
export interface UseClosableParams {
  closable?: ClosableType;
  closeIcon?: RenderNodeFn;
  context?: ContextClosable;
  customCloseIconRender?: (closeIcon: VNodeChild) => VNodeChild;
  defaultClosable?: boolean;
  defaultCloseIcon?: RenderNodeFn;
}

/**
 * Convert `closable` and `closeIcon` to config object
 * 把 closable/closeIcon 归一化为配置对象：
 * - closable === false 或 closeIcon === false/null → false（明确关闭）
 * - 两者都未定义 → null（未知，交给上层合并逻辑决定）
 * - 其余 → 配置对象（closeIcon 非布尔非 null 时带上）
 */
function useClosableConfig(
  closableCollection?: Ref<ClosableCollection | null>,
) {
  return computed(() => {
    const { closable, closeIcon } = closableCollection?.value ?? {};
    if (
      !closable &&
      (closable === false || closeIcon === false || closeIcon === null)
    ) {
      // TODO
      return false;
    }
    if (closable === undefined && closeIcon === undefined) {
      return null;
    }
    let closableConfig: ClosableType = {
      closeIcon:
        typeof closeIcon !== 'boolean' && closeIcon !== null
          ? closeIcon
          : undefined,
    };
    // closable 是对象 → 与 closeIcon 合并（对象里的字段覆盖）
    if (closable && typeof closable === 'object') {
      closableConfig = {
        ...closableConfig,
        ...closable,
      };
    }
    return closableConfig;
  });
}

/** Use same object to support `useMemo` optimization */
/** 共享同一个空对象，保证多次调用拿到同一引用（利于 memo 优化） */
const EmptyFallbackCloseCollection: FallbackCloseCollection = {};

/**
 * 响应式 closable 解析（组件 setup 内使用）
 *
 * 优先级（按顺序尝试，命中即止）：
 *   1. props：closable 为 false → 关闭；有值 → props 覆盖 context/fallback
 *   2. context：closable 为 false → 关闭；有值 → context 覆盖 fallback
 *   3. fallback：取默认值（默认无 closeIcon 时不可关闭）
 *
 * @returns computed：[closable, closeIcon, closeBtnIsDisabled, ariaOrDataProps]
 *   - closable：布尔，是否可关闭
 *   - closeIcon：最终关闭图标节点（已补 aria-label 与 aria/data 属性）
 *   - closeBtnIsDisabled：关闭按钮是否禁用
 *   - ariaOrDataProps：从配置对象中抽取的无障碍/数据属性
 */
export default function useClosable(
  propCloseCollection?: Ref<ClosableCollection>,
  contextCloseCollection?: Ref<ClosableCollection | null>,
  fallbackCloseCollection: Ref<FallbackCloseCollection> = ref(
    EmptyFallbackCloseCollection,
  ),
) {
  // Align the `props`, `context` `fallback` to config object first
  // 先把三处来源都归一化为配置对象
  const propCloseConfig = useClosableConfig(propCloseCollection);
  const contextCloseConfig = useClosableConfig(contextCloseCollection);
  // 预留的多语言的部分
  // 取本地化文案（关闭按钮的 aria-label 用）
  const [contextLocale] = useLocale('global', defaultLocale.global);
  // 关闭按钮是否禁用：仅当配置为对象时读取 disabled 字段
  const closeBtnIsDisabled = computed(() => {
    return typeof propCloseConfig.value === 'boolean'
      ? false
      : !!propCloseConfig.value?.disabled;
  });
  // fallback 默认集：默认关闭图标为 CloseOutlined，可被调用方覆盖
  const mergedFallbackCloseCollection = computed(() => {
    return {
      closeIcon: <CloseOutlined />,
      ...fallbackCloseCollection.value,
    };
  });

  // Use fallback logic to fill the config
  // 按 props > context > fallback 的优先级合并出最终配置
  const mergedClosableConfig = computed(() => {
    // ================ Props First ================
    // Skip if prop is disabled
    // props 明确关闭 → 直接不可关闭
    if (propCloseConfig.value === false) {
      return false;
    }
    if (propCloseConfig.value) {
      // props 有值：fallback 打底，context 次之，props 覆盖
      return extendsObject(
        mergedFallbackCloseCollection.value,
        contextCloseConfig.value,
        propCloseConfig.value,
      );
    }

    // =============== Context Second ==============
    // Skip if context is disabled
    // context 明确关闭 → 不可关闭
    if (contextCloseConfig.value === false) {
      return false;
    }
    if (contextCloseConfig.value) {
      // context 有值：fallback 打底，context 覆盖
      return extendsObject(
        mergedFallbackCloseCollection.value,
        contextCloseConfig.value,
      );
    }
    // ============= Fallback Default ==============
    // 都未提供：默认配置里未声明 closable → 不可关闭；否则用默认配置
    return mergedFallbackCloseCollection.value.closable
      ? mergedFallbackCloseCollection.value
      : false;
  });

  // Calculate the final closeIcon
  // 计算最终关闭图标（补 aria-label / aria 属性，必要时再包一层）
  // eslint-disable-next-line vue/return-in-computed-property
  return computed(() => {
    if (mergedClosableConfig.value === false) {
      return [false, null, closeBtnIsDisabled.value, {}];
    }
    const { closeIconRender } = mergedFallbackCloseCollection.value;
    const { closeIcon } = mergedClosableConfig.value;
    let mergedCloseIcon: VNodeChild = getVNode(closeIcon);
    // Wrap the closeIcon with aria props
    // 从配置对象中抽取 aria/data 属性（排除 closeIcon 本身）
    const ariaOrDataProps = pickAttrs(mergedClosableConfig.value, true);
    if (mergedCloseIcon !== null && mergedCloseIcon !== undefined) {
      // Wrap the closeIcon if needed
      // 需要额外包装时执行 closeIconRender（并清理空节点）
      if (closeIconRender) {
        mergedCloseIcon = closeIconRender(mergedCloseIcon);
        mergedCloseIcon = Array.isArray(mergedCloseIcon)
          ? filterEmpty(mergedCloseIcon)?.[0]
          : filterEmpty([mergedCloseIcon])?.[0];
      }
      // VNode → 复制并注入 aria-label/aria 属性；否则包 span 兜底
      mergedCloseIcon = isVNode(mergedCloseIcon) ? (
        createVNode(mergedCloseIcon, {
          ...mergedCloseIcon.props,
          'aria-label':
            mergedCloseIcon.props?.['aria-label'] ??
            contextLocale?.value?.close,
          ...ariaOrDataProps,
        })
      ) : (
        <span aria-label={contextLocale?.value?.close} {...ariaOrDataProps}>
          {mergedCloseIcon}
        </span>
      );
      return [
        true,
        mergedCloseIcon,
        closeBtnIsDisabled.value,
        ariaOrDataProps,
      ] as const;
    }
  });
}

/**
 * 非响应式版：closable/closeIcon → 配置对象
 * （与 useClosableConfig 逻辑一致，仅输入为普通值）
 */
function computeClosableConfig(
  closable?: ClosableType,
  closeIcon?: VueNode,
): boolean | ClosableType | null {
  if (
    !closable &&
    (closable === false || closeIcon === false || closeIcon === null)
  ) {
    return false;
  }

  if (closable === undefined && closeIcon === undefined) {
    return null;
  }

  let closableConfig: ClosableType = {
    closeIcon:
      typeof closeIcon !== 'boolean' && closeIcon !== null
        ? closeIcon
        : undefined,
  };

  if (closable && typeof closable === 'object') {
    closableConfig = {
      ...closableConfig,
      ...closable,
    };
  }
  return closableConfig;
}

/**
 * 非响应式版：根据最终合并配置计算关闭图标节点与 aria 属性
 * 逻辑与 useClosable 的尾部一致：插槽优先取 closeIcon、补 aria-label、
 * 必要时 closeIconRender 包装、VNode 复制属性 / span 兜底
 */
function computeCloseIcon(
  mergedConfig: ClosableCollection,
  fallbackCloseCollection: FallbackCloseCollection,
  closeLabel: string,
): [VueNode, AriaAttributes & DataAttributes] {
  const { closeIconRender } = fallbackCloseCollection;
  const { closeIcon, ...restConfig } = mergedConfig;

  let finalCloseIcon = getSlotPropsFnRun({}, { closeIcon }, 'closeIcon');
  const ariaOrDataProps = pickAttrs(restConfig, true);

  if (isNonNullable(finalCloseIcon)) {
    if (closeIconRender) {
      finalCloseIcon = closeIconRender(finalCloseIcon);
    }

    finalCloseIcon = isVNode(finalCloseIcon) ? (
      createVNode(finalCloseIcon, {
        'aria-label': closeLabel,
        ...ariaOrDataProps,
      })
    ) : (
      <span aria-label={closeLabel} {...ariaOrDataProps}>
        {finalCloseIcon}
      </span>
    );
  }

  return [finalCloseIcon, ariaOrDataProps];
}

/**
 * 非响应式版：合并三处配置（props > context > fallback）
 * - props 为 false → 关闭；props 有值 → props 覆盖 context/fallback
 * - context 为 false → 关闭；context 有值 → context 覆盖 fallback
 * - 兜底：fallback.closable 为真才可关闭
 */
function mergeClosableConfigs(
  propConfig: ReturnType<typeof computeClosableConfig>,
  contextConfig: ReturnType<typeof computeClosableConfig>,
  fallbackConfig: ClosableCollection & {
    closeIconRender?: (icon: VNodeChild) => VNodeChild;
  },
) {
  if (propConfig === false) {
    return false;
  }
  if (propConfig) {
    return extendsObject(fallbackConfig, contextConfig, propConfig);
  }

  if (contextConfig === false) {
    return false;
  }
  if (contextConfig) {
    return extendsObject(fallbackConfig, contextConfig);
  }

  return fallbackConfig.closable ? fallbackConfig : false;
}

/**
 * 非响应式 closable 解析（一次性计算，不依赖 ref）
 *
 * 与 useClosable 逻辑一致，适合非响应式上下文（如纯函数调用）；
 * closeLabel 可直接传入（默认 'Close'）。
 *
 * @returns [closable, closeIcon, closeBtnIsDisabled, ariaOrDataProps]
 */
export function computeClosable(
  propCloseCollection?: Ref<ClosableCollection>,
  contextCloseCollection?: Ref<ClosableCollection | null>,
  fallbackCloseCollection: Ref<FallbackCloseCollection> = ref(
    EmptyFallbackCloseCollection,
  ),
  closeLabel = 'Close',
): [
  closable: boolean,
  closeIcon: VueNode,
  closeBtnIsDisabled: boolean,
  ariaOrDataProps: AriaAttributes & DataAttributes,
] {
  const propConfig = computeClosableConfig(
    unref(propCloseCollection)?.closable,
    unref(propCloseCollection)?.closeIcon,
  );
  const contextConfig = computeClosableConfig(
    unref(contextCloseCollection)?.closable,
    unref(contextCloseCollection)?.closeIcon,
  );

  const mergedFallback = {
    closeIcon: <CloseOutlined />,
    ...fallbackCloseCollection.value,
  };

  const mergedConfig = mergeClosableConfigs(
    propConfig,
    contextConfig,
    mergedFallback,
  );

  const closeBtnIsDisabled =
    typeof mergedConfig === 'boolean'
      ? false
      : !!(mergedConfig as any)?.disabled;
  if (mergedConfig === false) {
    return [false, null, closeBtnIsDisabled, {}];
  }

  const [closeIcon, ariaProps] = computeCloseIcon(
    mergedConfig,
    mergedFallback,
    closeLabel,
  );
  return [true, closeIcon, closeBtnIsDisabled, ariaProps];
}

/**
 * Space.Compact 紧凑拼接组
 *
 * 用途：把相邻的控件（Input/Select/Button 等）拼接成一体——
 * 中间元素直角相连、只保留两端的圆角（视觉上像一个整体控件），
 *
 * 核心机制（依赖注入而非 prop 层层传递）：
 * - Compact 遍历子节点，每个用 <CompactItem> 包裹，
 *   通过 provide 注入 isFirstItem / isLastItem / compactSize / compactDirection；
 * - 各业务组件（如 Input）通过本文件导出的 useCompactItemContext(prefixCls, direction)
 *   消费上下文，拼出 `-compact-item` / `-compact-first-item` / `-compact-last-item` 等类名，
 *   配合样式层的 genCompactItemStyle 完成圆角削减与边框合并；
 * - 嵌套 Compact 时通过「外层 isFirst/isLast 传递」合并边界，
 *   保证多级嵌套时圆角只削最外层两端。
 *
 * 另导出 NoCompactStyle：注入 null 上下文，让子树显式退出紧凑样式。
 */
import type { InjectionKey, Ref } from 'vue';

import type {
  ComponentBaseProps,
  DirectionType,
} from '../config-provider/context.ts';
import type { SizeType } from '../config-provider/size-context';

import { computed, defineComponent, inject, provide, ref, toRefs } from 'vue';

import { filterEmpty } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useOrientation } from '../_util/hooks'; // 方向归一化（orientation > vertical > direction）
import { useConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize'; // 尺寸上下文（全局 size 兜底）
import useStyle from './style/compact';

export interface SpaceCompactProps extends ComponentBaseProps {
  /** 是否撑满父容器宽度（display: flex + width: 100%） */
  block?: boolean;
  /** @deprecated 请使用 `orientation` 代替 */
  direction?: 'horizontal' | 'vertical';
  /** 排列方向：horizontal（默认）| vertical */
  orientation?: 'horizontal' | 'vertical';
  /** 紧凑组整体尺寸（small/middle/large），下发给每个子项；缺省取 ConfigProvider 全局 size */
  size?: SizeType;
  /** 垂直排列的布尔写法（等价 orientation="vertical"） */
  vertical?: boolean;
}
/** 注入给每个紧凑子项的上下文内容 */
export interface SpaceCompactItemContextType {
  /** 紧凑组方向 */
  compactDirection?: 'horizontal' | 'vertical';
  /** 紧凑组尺寸 */
  compactSize?: SizeType;
  /** 是否整个紧凑组的首项（决定左侧/顶部圆角是否保留） */
  isFirstItem?: boolean;
  /** 是否整个紧凑组的末项（决定右侧/底部圆角是否保留） */
  isLastItem?: boolean;
}

/** 紧凑项上下文的注入键（provide/inject 使用） */
const SpaceCompactItemContext: InjectionKey<
  Ref<null | SpaceCompactItemContextType>
> = Symbol('SpaceCompactItemContext');

/** 读取紧凑项上下文（无祖先 Compact 时返回 null 引用） */
export function useSpaceCompactItemContext() {
  return inject(SpaceCompactItemContext, ref(null));
}
/**
 * 业务组件消费紧凑上下文的统一入口（Input/Select/Button/SpaceAddon 等调用）
 *
 * 根据上下文拼出紧凑类名：
 * - 基础：`{prefixCls}-compact-item`（垂直方向为 `-compact-vertical-item`）
 * - 首/末项：`-compact(-vertical)-first-item` / `-compact(-vertical)-last-item`
 * - RTL：`-compact(-vertical)-item-rtl`
 * 样式层对这些类做「相邻项边框合并 + 圆角削减」。
 *
 * @param prefixCls 业务组件自己的 prefixCls ref（如 as-input）
 * @param direction 全局方向 ref（rtl/ltr）
 */
export function useCompactItemContext(
  prefixCls: Ref<string>,
  direction: Ref<DirectionType>,
) {
  const compactItemContext = useSpaceCompactItemContext();

  const compactItemClassnames = computed<string>(() => {
    // 不在任何 Compact 内 → 无紧凑类名
    if (!compactItemContext.value) {
      return '';
    }
    const { compactDirection, isFirstItem, isLastItem } =
      compactItemContext.value;
    // 垂直方向用 -vertical- 分隔符，水平方向用 -
    const separator = compactDirection === 'vertical' ? '-vertical-' : '-';

    return clsx(`${prefixCls.value}-compact${separator}item`, {
      [`${prefixCls.value}-compact${separator}first-item`]: isFirstItem,
      [`${prefixCls.value}-compact${separator}last-item`]: isLastItem,
      [`${prefixCls.value}-compact${separator}item-rtl`]:
        direction.value === 'rtl',
    });
  });

  return {
    compactSize: computed(() => compactItemContext.value?.compactSize),
    compactDirection: computed(
      () => compactItemContext.value?.compactDirection,
    ),
    compactItemClassnames,
  };
}

/**
 * 显式退出紧凑样式的包装器：
 * 把上下文覆盖为 null，其子树内的组件（即便处于 Compact 内）不再拼接紧凑类名。
 */
export const NoCompactStyle = defineComponent(
  (_, { slots }) => {
    provide(SpaceCompactItemContext, ref(null));
    return () => {
      return slots?.default?.();
    };
  },
  {
    name: 'AsSpaceNoCompactStyle',
    inheritAttrs: false,
  },
);

/**
 * CompactItem：无渲染包装器
 * 仅为每个子节点 provide 一个紧凑上下文（首/末项标记、尺寸、方向），
 * 自身不产出任何 DOM，直接渲染插槽内容。
 */
const CompactItem = defineComponent<SpaceCompactItemContextType>(
  (props, { slots }) => {
    provide(
      SpaceCompactItemContext,
      computed(() => props),
    );
    return () => {
      return slots?.default?.();
    };
  },
);

const Compact = defineComponent<SpaceCompactProps>(
  (props, { slots, attrs }) => {
    // 合并尺寸：局部 size > 全局 SizeContext
    const mergedSize = useSize<SizeType>(
      (ctx) => (props?.size ?? ctx) as SizeType,
    );
    const configContext = useConfig();
    // prefixCls：默认 as-space-compact，可用 props.prefixCls 覆盖
    const prefixCls = computed(() =>
      configContext.value?.getPrefixCls?.('space-compact', props.prefixCls),
    );
    // 注册样式，返回 hashId（CSS-in-JS 作用域类）与 cssVarCls
    const [hashId, cssVarCls] = useStyle(prefixCls);
    // 读取外层 Compact 的上下文（用于嵌套时首/末项边界合并）
    const compactItemContext = useSpaceCompactItemContext();

    const { vertical, orientation } = toRefs(props);

    // 方向归一化：orientation > vertical > direction
    const [mergedOrientation, mergedVertical] = useOrientation(
      orientation,
      vertical,
    );

    return () => {
      const { rootClass, block } = props;

      const directionConfig = configContext.value?.direction;
      // 根容器类名：基础类 + hashId + cssVarCls + rtl/block/vertical + rootClass
      const clx = clsx(
        prefixCls.value,
        hashId.value,
        cssVarCls.value,
        {
          [`${prefixCls.value}-rtl`]: directionConfig === 'rtl',
          [`${prefixCls.value}-block`]: block,
          [`${prefixCls.value}-vertical`]: mergedVertical.value,
        },
        rootClass,
      );

      const childNodes = filterEmpty(slots?.default?.());
      const nodes = childNodes.map((child, i) => {
        // 优先用用户 key，无 key 时用前缀+索引兜底
        const key = child?.key || `${prefixCls.value}-item-${i}`;
        return (
          <CompactItem
            compactDirection={mergedOrientation.value}
            compactSize={mergedSize.value}
            // 首项：是本层第一个，且（无外层 Compact 或 外层也把它当首项）——嵌套时圆角只削最外层
            isFirstItem={
              i === 0 &&
              (!compactItemContext.value ||
                compactItemContext.value?.isFirstItem)
            }
            // 末项：同理，需要本层最后一个且外层也认可
            isLastItem={
              i === childNodes.length - 1 &&
              (!compactItemContext.value ||
                compactItemContext.value?.isLastItem)
            }
            key={key}
          >
            {child}
          </CompactItem>
        );
      });

      // =========================== Render ===========================
      // 无子项 → 不渲染
      if (childNodes.length === 0) {
        return null;
      }

      return (
        <div class={clx} {...attrs}>
          {nodes}
        </div>
      );
    };
  },
  {
    name: 'AsSpaceCompact',
    inheritAttrs: false,
  },
);

export default Compact;

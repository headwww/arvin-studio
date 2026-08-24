/**
 * useZIndex：z-index 分层控制钩子
 *
 * 为浮层类组件提供统一的 z-index 计算与分层管理：
 * - 组件分两类：容器（Modal/Drawer/Popover/Popconfirm/Tooltip/Tour/FloatButton，
 *   会撑起一层基础 z-index）与消费者（SelectLike/Dropdown/DatePicker/Menu/ImagePreview，
 *   挂载在容器之上）；
 * - 支持 zIndexContext 嵌套传递：子容器在父容器基础上累加 offset（避免无限堆叠）；
 * - 支持 customZIndex 完全接管；
 * - dev 模式下对超出设计上限的 z-index 给出警告。
 *
 * 分层范围：容器 base 1000 + 偏移 100（最多 10 层 = 2000）；
 * Popover 等 offset 50；Notification 用 容器最大值 + componentOffset。
 */
import type { Ref } from 'vue';

import { computed } from 'vue';

import useToken from '../../theme/useToken';
import { devUseWarning, isDev } from '../warning';
import { useZIndexContext } from '../zindexContext';

/** 容器类组件：会建立一层独立的 z-index 层级 */
export type ZIndexContainer =
  | 'Drawer'
  | 'FloatButton'
  | 'Modal'
  | 'Popconfirm'
  | 'Popover'
  | 'Tooltip'
  | 'Tour';

/** 消费者类组件：叠加在最近的容器层级之上 */
export type ZIndexConsumer =
  | 'DatePicker'
  | 'Dropdown'
  | 'ImagePreview'
  | 'Menu'
  | 'SelectLike';

// Z-Index control range
// Container: 1000 + offset 100 (max base + 10 * offset = 2000)
// Popover: offset 50
// Notification: Container Max zIndex + componentOffset

/** 每层容器的 z-index 增量 */
const CONTAINER_OFFSET = 100;
/** 允许的最大嵌套容器层数 */
const CONTAINER_OFFSET_MAX_COUNT = 10;

/** 容器可叠加的最大偏移（100 * 10 = 1000） */
export const CONTAINER_MAX_OFFSET =
  CONTAINER_OFFSET * CONTAINER_OFFSET_MAX_COUNT;

/**
 * 静态函数默认会取到 CONTAINER_MAX_OFFSET，
 * 但它下面仍可能有子组件（如 Select、Dropdown），
 * 因此警告阈值需要超过 CONTAINER_MAX_OFFSET（+100 预留子组件空间）。
 */
const CONTAINER_MAX_OFFSET_WITH_CHILDREN =
  CONTAINER_MAX_OFFSET + CONTAINER_OFFSET;

/** 各容器组件的基础 z-index 偏移 */
export const containerBaseZIndexOffset: Record<ZIndexContainer, number> = {
  Modal: CONTAINER_OFFSET,
  Drawer: CONTAINER_OFFSET,
  Popover: CONTAINER_OFFSET,
  Popconfirm: CONTAINER_OFFSET,
  Tooltip: CONTAINER_OFFSET,
  Tour: CONTAINER_OFFSET,
  FloatButton: CONTAINER_OFFSET,
};

/** 各消费者组件的 z-index 偏移（相对所在容器层级） */
export const consumerBaseZIndexOffset: Record<ZIndexConsumer, number> = {
  SelectLike: 50,
  Dropdown: 50,
  DatePicker: 50,
  Menu: 50,
  ImagePreview: 1,
};

/** 类型守卫：是否容器类组件 */
function isContainerType(
  type: ZIndexConsumer | ZIndexContainer,
): type is ZIndexContainer {
  return type in containerBaseZIndexOffset;
}

/** 返回值：[zIndex（实际使用的值）, contextZIndex（写入 zIndexContext 供子级参考的值）] */
type ReturnResult = [
  zIndex: Ref<number | undefined>,
  contextZIndex: Ref<number>,
];

/**
 * 计算组件的 z-index
 *
 * 计算逻辑：
 * - customZIndex 已提供 → 直接透传（完全接管）；
 * - 否则：
 *   - 容器类：父容器存在 → 只加容器偏移（不重复加 base，避免堆叠）；
 *     父容器不存在 → base（token.zIndexPopupBase）+ 容器偏移；
 *   - 消费者类：父容器 z-index + 消费者偏移。
 *
 * @param componentType 组件类型（容器或消费者）
 * @param customZIndex 用户自定义 z-index ref（可选，优先于一切计算）
 * @returns [zIndex, contextZIndex]：zIndex 供本组件使用；
 *   contextZIndex 应提供给子级（经 zIndexContext），子级在其上继续累加
 */
export function useZIndex(
  componentType: ZIndexConsumer | ZIndexContainer,
  customZIndex?: Ref<number | undefined>,
): ReturnResult {
  const [, token] = useToken();
  const parentZIndex = useZIndexContext();
  const isContainer = isContainerType(componentType);
  let result: ReturnResult;

  if (customZIndex?.value === undefined) {
    const resIndex = computed(() => {
      let zIndex = parentZIndex.value ?? 0;

      // eslint-disable-next-line unicorn/prefer-ternary
      if (isContainer) {
        zIndex +=
          // Use preset token zIndex by default but not stack when has parent container
          // 无父容器时叠加设计 token 的基础 z-index；有父容器时只加偏移（防无限堆叠）

          (parentZIndex.value ? 0 : token.value.zIndexPopupBase) +
          // Container offset
          // 容器自身偏移
          containerBaseZIndexOffset[componentType];
      } else {
        // 消费者：在父层级之上叠加固定偏移
        zIndex += consumerBaseZIndexOffset[componentType];
      }
      // [对外值, 上下文值]：无父容器时对外值回退为 customZIndex
      return [
        parentZIndex.value === undefined ? customZIndex?.value : zIndex,
        zIndex,
      ];
    });
    result = [
      computed(() => resIndex.value[0]),
      computed(() => resIndex.value[1]) as any,
    ];
  } else {
    // 用户自定义：两个值都返回自定义值（子级不再继续累加）
    result = [customZIndex, customZIndex as any];
  }

  // dev 模式：z-index 超过设计上限时告警（可能导致意外覆盖）
  if (isDev) {
    const warning = devUseWarning(componentType);

    const maxZIndex =
      token.value.zIndexPopupBase + CONTAINER_MAX_OFFSET_WITH_CHILDREN;
    const currentZIndex = computed(() => result[0]?.value ?? 0);

    warning(
      customZIndex?.value !== undefined || currentZIndex!.value! <= maxZIndex,
      'usage',
      '`zIndex` is over design token `zIndexPopupBase` too much. It may cause unexpected override.',
    );
  }

  return result;
}

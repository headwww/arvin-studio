import type { App, CSSProperties, SlotsType } from 'vue';

import type { BuildInPlacements, TriggerRef } from '@arvin-studio/headless';

import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  shallowRef,
  Teleport,
  watch,
} from 'vue';

import { canUseDom, Trigger } from '@arvin-studio/headless';
import { clsx } from '@arvin-studio/kit';

import { useConfig } from '../config-provider/context';
import useStyle from './style';

// 贴边平移留 8px，垂直空间不够时上下翻转
const overflow = {
  adjustX: false,
  adjustY: true,
  shiftX: 8,
  shiftY: 8,
};

// points: [弹层锚点, 目标锚点]；第一项是 popup，第二项是 target
const builtinPlacements: BuildInPlacements = {
  bottom: { points: ['tc', 'bc'], offset: [0, 4], overflow },
  bottomLeft: { points: ['tl', 'bl'], offset: [0, 4], overflow },
  bottomRight: { points: ['tr', 'br'], offset: [0, 4], overflow },
  top: { points: ['bc', 'tc'], offset: [0, -4], overflow },
  topLeft: { points: ['bl', 'tl'], offset: [0, -4], overflow },
  topRight: { points: ['br', 'tr'], offset: [0, -4], overflow },
};

export interface PositionPopupProps {
  arrow?: boolean;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  /**
   * Teleport 挂载点，支持选择器、DOM 节点或返回节点的函数；默认 body。
   * 选择器找不到时回退 body；自定义容器不能有偏移，否则 x/y 会相对它计算。
   */
  getContainer?: (() => HTMLElement | null) | HTMLElement | string;
  height?: number;
  open?: boolean;
  placement?: string;
  prefixCls?: string;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  width?: number;
  /** 文档坐标：getBoundingClientRect() + scrollX */
  x?: number;
  /** 文档坐标：getBoundingClientRect() + scrollY */
  y?: number;
  zIndex?: number;
}

export interface PositionPopupEmits {
  openChange: (open: boolean) => void;
}

export interface PositionPopupSlots {
  default: () => any;
}

const InternalPositionPopup = defineComponent<
  PositionPopupProps,
  PositionPopupEmits,
  string,
  SlotsType<PositionPopupSlots>
>(
  (props, { attrs, slots, emit, expose }) => {
    const config = useConfig();
    const prefixCls = computed(() =>
      config.value.getPrefixCls('position-popup', props.prefixCls),
    );
    // 对应 style 里的 `${prefixCls}-zoom` 动画类名
    const popupMotion = computed(() => ({ name: `${prefixCls.value}-zoom` }));
    // Teleport 目标：函数形式在每次渲染时解析；选择器找不到时回退 body，
    // 避免目标节点晚于组件挂载时 Teleport 永久失去 target
    const teleportTo = computed(() => {
      const { getContainer } = props;
      const target =
        typeof getContainer === 'function' ? getContainer() : getContainer;
      if (!target) {
        return 'body';
      }
      if (typeof target === 'string') {
        return target === 'body'
          ? target
          : (document.querySelector(target) ?? 'body');
      }
      return target;
    });
    useStyle(prefixCls);

    const triggerRef = shallowRef<null | TriggerRef>(null);
    const contentRef = shallowRef<HTMLElement | null>(null);

    const forceAlign = () => triggerRef.value?.forceAlign?.();
    expose({ forceAlign });

    const align = async () => {
      if (!props.open) {
        return;
      }
      // 首次打开时 popup 还没挂上，等两帧再对一次
      await nextTick();
      await nextTick();
      forceAlign();
    };

    watch(
      () => props.open,
      (open) => {
        if (open) {
          void align();
        }
      },
    );

    watch(
      [() => props.x, () => props.y, () => props.width, () => props.height],
      () => {
        if (props.open) {
          void align();
        }
      },
    );

    // Trigger 的 useWinClick 依赖真实 trigger，这里 action=[] 不会注册，自己关
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) {
        return;
      }
      const popup = contentRef.value?.parentElement;
      if (popup?.contains(target)) {
        return;
      }
      emit('openChange', false);
    };

    watch(
      () => props.open,
      (open) => {
        if (!canUseDom()) {
          return;
        }
        if (open) {
          document.addEventListener('click', onDocClick);
        } else {
          document.removeEventListener('click', onDocClick);
        }
      },
      { immediate: true },
    );

    // 内容尺寸变化后重新对齐，避免翻转/箭头位置还停在旧尺寸
    let ro: ResizeObserver | undefined;
    watch(contentRef, (el) => {
      ro?.disconnect();
      if (!el || typeof ResizeObserver === 'undefined') {
        return;
      }
      ro = new ResizeObserver(() => forceAlign());
      ro.observe(el);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', onDocClick);
      ro?.disconnect();
    });

    // Trigger 会给弹层根节点带上 prefixCls，这里只补业务自己的类名
    const mergedPopupClassName = computed(() =>
      clsx(props.rootClassName, attrs.class as any),
    );

    const mergedPopupStyle = computed<CSSProperties>(() => {
      const attrStyle = attrs.style;
      const styleObject =
        attrStyle && !Array.isArray(attrStyle) && typeof attrStyle === 'object'
          ? (attrStyle as CSSProperties)
          : {};

      return {
        ...props.rootStyle,
        ...styleObject,
      };
    });

    return () => {
      if (!canUseDom()) {
        return null;
      }

      return (
        <Teleport to={teleportTo.value}>
          <Trigger
            action={[]}
            arrow={false}
            builtinPlacements={builtinPlacements}
            onOpenChange={(open: boolean) => emit('openChange', open)}
            popup={() => (
              <>
                {props.arrow && <div class={`${prefixCls.value}-arrow`} />}
                <div
                  class={clsx(
                    `${prefixCls.value}-content`,
                    props.contentClassName,
                  )}
                  ref={contentRef}
                  style={props.contentStyle}
                >
                  {slots.default?.()}
                </div>
              </>
            )}
            popupClassName={mergedPopupClassName.value}
            popupMotion={popupMotion.value}
            popupPlacement={props.placement}
            popupStyle={mergedPopupStyle.value}
            popupVisible={props.open}
            prefixCls={prefixCls.value}
            ref={triggerRef}
            zIndex={props.zIndex}
          >
            {/* 业务方不用传子组件，这个透明盒子就是 Trigger 的锚点 */}
            <span
              class={`${prefixCls.value}-anchor`}
              style={{
                left: `${props.x}px`,
                top: `${props.y}px`,
                width: `${props.width}px`,
                height: `${props.height}px`,
              }}
            />
          </Trigger>
        </Teleport>
      );
    };
  },
  {
    name: 'AsPositionPopup',
    inheritAttrs: false,
  },
);

const PositionPopup = InternalPositionPopup;

(PositionPopup as any).install = (app: App) => {
  app.component('AsPositionPopup', PositionPopup);
};

export default PositionPopup;

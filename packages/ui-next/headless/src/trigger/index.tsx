import type { CSSProperties } from 'vue';

import type { PortalProps } from '../portal';
import type { CSSMotionProps, VueNode } from '../util';
import type { TriggerContextProps } from './context';
import type {
  ActionType,
  AlignType,
  AnimationType,
  ArrowPos,
  ArrowTypeOuter,
  BuildInPlacements,
} from './interface';
import type { MobileConfig } from './Popup';

import {
  computed,
  createVNode,
  defineComponent,
  nextTick,
  reactive,
  ref,
  shallowRef,
  useId,
  watch,
  watchEffect,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import Portal from '../portal';
import { useResizeObserver } from '../resize-observer';
import { filterEmpty, getShadowRoot } from '../util';
import { createElementRef } from '../util/vnode';
import {
  TriggerContextProvider,
  useTriggerContext,
  useUniqueContext,
} from './context';
import useAction from './hooks/useAction';
import useAlign from './hooks/useAlign';
import useDelay from './hooks/useDelay';
import useWatch from './hooks/useWatch';
import useWinClick from './hooks/useWinClick';
import Popup from './Popup';
import { getAlignPopupClassName } from './util';

export type {
  ActionType,
  AlignType,
  AnimationType,
  ArrowTypeOuter as ArrowType,
  BuildInPlacements,
};

export interface TriggerRef {
  forceAlign: VoidFunction;
  nativeElement: HTMLElement;
  popupElement: HTMLDivElement;
}

/**
 * Trigger 组件的全部 props（无样式浮层引擎的对外契约）
 *
 * 按职责分组：
 * - 触发行为：action/showAction/hideAction + 各类延迟；
 * - 显隐控制：受控（popupVisible）/非受控（defaultPopupVisible）+ 回调；
 * - 定位：popupPlacement/builtinPlacements/popupAlign/alignPoint；
 * - 挂载：getPopupContainer/forceRender/autoDestroy；
 * - 弹层：popup 内容/类名/样式/动画/遮罩/箭头/宽度拉伸；
 * - 扩展：unique（共享弹层）/fresh（内容缓存）/mobile（移动端覆盖）。
 */
export interface TriggerProps {
  /** 触发动作（可组合）：hover | click | focus | contextmenu | touch 等 */
  action?: ActionType | ActionType[];
  /** 动画结束后的显隐回调（open 真正落定后触发） */
  afterOpenChange?: (visible: boolean) => void;
  /** @deprecated Use `afterOpenChange` instead */
  /** @deprecated 请使用 `afterOpenChange` */
  afterPopupVisibleChange?: (visible: boolean) => void;
  alignPoint?: boolean; // Maybe we can support user pass position in the future

  // ==================== Arrow ====================
  /** 是否显示箭头：布尔或箭头配置对象（类名/内容/样式） */
  arrow?: ArrowTypeOuter | boolean;

  /** 关闭后是否自动销毁弹层 DOM（默认 false） */
  autoDestroy?: boolean;

  /** 失焦后延迟关闭 */
  blurDelay?: number;

  /** 各方位锚点配置表（points/offset/overflow 等，定位算法消费） */
  builtinPlacements?: BuildInPlacements;

  /** 非受控模式的初始显隐 */
  defaultPopupVisible?: boolean;
  /** Temporarily suppress popup visibility without resetting the current open state. */
  /** 临时压制弹层显示：不重置底层开合状态（disabled 期间状态流转照常） */
  disabled?: boolean;
  /** 聚焦后延迟打开 */
  focusDelay?: number;
  /** 首次渲染即挂载弹层 DOM（否则首次打开才挂载） */
  forceRender?: boolean;
  /**
   * Trigger will memo content when close.
   * This may affect the case if want to keep content update.
   * Set `fresh` to `false` will always keep update.
   */
  /**
   * 关闭时是否缓存弹层内容（默认 true 缓存）。
   * 需要弹层内容持续更新时设为 false。
   */
  fresh?: boolean;
  /** 根据最终 align 信息追加类名（如 placement 相关样式） */
  getPopupClassNameFromAlign?: (align: AlignType) => string;

  // =================== Portal ====================
  /** 弹层挂载容器（默认 body）；false 表示挂到触发元素旁 */
  getPopupContainer?: ((node: HTMLElement) => HTMLElement) | false;
  /** 关闭动作白名单 */
  hideAction?: ActionType[];
  // ==================== Mask =====================
  /** 是否显示遮罩 */
  mask?: boolean;

  /** 点击遮罩是否关闭弹层 */
  maskClosable?: boolean;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  /** 遮罩过渡动画配置 */
  maskMotion?: CSSMotionProps;

  // // ========================== Mobile ==========================

  /**
   * @private 移动端配置覆盖：直接替换根配置为移动端形态
   * （全屏/底部弹层等），目前仅内部使用，生产环境勿用。
   */
  mobile?: MobileConfig;
  // ==================== Delay ====================
  /** 鼠标移入后延迟打开（秒） */
  mouseEnterDelay?: number;

  /** 鼠标移出后延迟关闭（秒） */
  mouseLeaveDelay?: number;
  /** 显隐变化回调（受控/非受控都会触发） */
  onOpenChange?: (visible: boolean) => void;

  /** 每次对齐完成后回调（可拿到最终 align 信息） */
  onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
  /** 弹层内点击回调 */
  onPopupClick?: (e: MouseEvent) => void;

  /** @deprecated Use `onOpenChange` instead */
  /** @deprecated 请使用 `onOpenChange` */
  onPopupVisibleChange?: (visible: boolean) => void;
  // ==================== Popup ====================
  /** 弹层内容：VNode 或 返回 VNode 的函数（函数形式每次打开重新求值） */
  popup: (() => VueNode) | VueNode;
  /** 单次对齐覆盖（优先级高于 builtinPlacements 对应项） */
  popupAlign?: AlignType;
  /** 弹层自定义类名 */
  popupClassName?: string;
  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  /** 弹层过渡动画配置（Vue Transition，name 对应消费方定义的动画类） */
  popupMotion?: CSSMotionProps;
  /** 当前方位名（对应 builtinPlacements 的键，如 'bottomLeft'） */
  popupPlacement?: string;
  /** 弹层内联样式（定位样式由 Trigger 自己注入，这里的会叠加） */
  popupStyle?: CSSProperties;
  // ==================== Open =====================
  /** 受控显隐（传了则组件进入受控模式，开合由外部驱动） */
  popupVisible?: boolean;
  /** 弹层类名前缀 */
  prefixCls?: string;
  /** 打开动作白名单（与 action 二选一细化） */
  showAction?: ActionType[];

  /** 弹层宽度拉伸策略：'width'（同宽）/ 'minWidth'（至少同宽）/ 'height' 等 */
  stretch?: string;
  /** 对齐点模式：弹层跟随鼠标位置（contextmenu 场景）而非触发元素 */

  /**
   * Config with UniqueProvider to shared the floating popup.
   */
  /**
   * 配合 UniqueProvider：多个 Trigger 共享同一个弹层（同时只显示一个）。
   */
  unique?: boolean;

  /** Pass to `UniqueProvider` UniqueContainer */
  /** 共享弹层容器（UniqueProvider）的类名 */
  uniqueContainerClassName?: string;

  /** Pass to `UniqueProvider` UniqueContainer */
  /** 共享弹层容器的样式 */
  uniqueContainerStyle?: CSSProperties;

  /** 弹层 z-index */
  zIndex?: number;
}

const defaults = {
  prefixCls: 'headless-trigger-popup',
  action: 'hover',
  disabled: false,
  mouseLeaveDelay: 0.1,
  maskClosable: true,
  builtinPlacements: {},
  popupVisible: undefined,
  defaultPopupVisible: undefined,
} as any;
export function generateTrigger(PortalComponent: any = Portal) {
  return defineComponent<TriggerProps>(
    (props = defaults, { expose, slots, attrs }) => {
      const mergedAutoDestroy = computed(() => props.autoDestroy ?? false);
      const openUncontrolled = computed(() => props.popupVisible === undefined);
      // =========================== Mobile ===========================
      const isMobile = computed(() => !!props.mobile);
      // ========================== Context ===========================
      const subPopupElements = ref<Record<string, HTMLElement | null>>({});
      const parentContext = useTriggerContext();
      const context = computed<TriggerContextProps>(() => {
        return {
          registerSubPopup(id, subPopupEle) {
            if (subPopupEle) {
              subPopupElements.value[id] = subPopupEle;
            } else {
              delete subPopupElements.value[id];
            }
            parentContext?.value.registerSubPopup(id, subPopupEle);
          },
        };
      });
      // ======================== UniqueContext =========================
      const uniqueContext = useUniqueContext();
      // =========================== Popup ============================
      const id = useId();
      const popupEle = shallowRef<HTMLDivElement | null>(null);
      // Used for forwardRef popup. Not use internal
      const externalPopupRef = shallowRef<HTMLDivElement | null>(null);
      const setPopupRef = createElementRef<HTMLDivElement>((element) => {
        externalPopupRef.value = element;
        if (popupEle.value !== element) {
          popupEle.value = element;
        }
        parentContext?.value?.registerSubPopup(id, element ?? null);
      });

      // =========================== Target ===========================
      // Use state to control here since `useRef` update not trigger render
      const targetEle = shallowRef<HTMLElement>();
      // Used for forwardRef target. Not use internal
      const externalForwardRef = shallowRef<HTMLElement | null>(null);
      const setTargetRef = createElementRef((element) => {
        if (element && targetEle.value !== element) {
          targetEle.value = element;
          externalForwardRef.value = element;
        } else if (!element) {
          targetEle.value = undefined;
          externalForwardRef.value = null;
        }
      });

      const originChildProps = reactive<Record<string, any>>({});
      const baseActionProps = shallowRef<Record<string, any>>({});
      const hoverActionProps = shallowRef<Record<string, any>>({});
      const cloneProps = computed<Record<string, any>>(() => ({
        ...baseActionProps.value,
        ...hoverActionProps.value,
      }));

      const inPopupOrChild = (ele: EventTarget) => {
        const childDOM = targetEle.value;
        return (
          childDOM?.contains(ele as HTMLElement) ||
          (childDOM && getShadowRoot(childDOM)?.host === ele) ||
          ele === childDOM ||
          popupEle.value?.contains(ele as HTMLElement) ||
          (popupEle.value && getShadowRoot(popupEle.value)?.host === ele) ||
          ele === popupEle.value ||
          Object.values(subPopupElements.value).some(
            (subPopupEle) =>
              subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle,
          )
        );
      };

      // =========================== Arrow ============================
      const innerArrow = computed<ArrowTypeOuter | null>(() => {
        return props.arrow
          ? {
              ...(props?.arrow !== true && props?.arrow),
            }
          : null;
      });

      // ============================ Open ============================
      const internalOpen = shallowRef(props?.defaultPopupVisible ?? false);

      if (props.popupVisible !== undefined) {
        internalOpen.value = props.popupVisible;
      }

      // Render still use props as first priority
      // `rawOpen` is the open state the trigger actually tracks; `disabled` only
      // suppresses the popup's visibility, so state transitions must keep flowing
      // through while it is set (see `internalTriggerOpen`).
      const rawOpen = computed(() => {
        return props?.popupVisible ?? internalOpen.value;
      });

      const mergedOpen = computed(() => rawOpen.value && !props.disabled);

      const isOpen = () => mergedOpen.value;

      watch(
        () => props.popupVisible,
        async (nextVisible) => {
          if (nextVisible === undefined) {
            return;
          }

          await nextTick();
          internalOpen.value = nextVisible;
        },
      );
      // Extract common options for UniqueProvider
      const getUniqueOptions = (delay: number = 0) => {
        return {
          popup: props.popup,
          target: targetEle.value,
          delay,
          prefixCls: props.prefixCls,
          popupClassName: props.popupClassName,
          uniqueContainerClassName: props.uniqueContainerClassName,
          uniqueContainerStyle: props.uniqueContainerStyle,
          popupStyle: props.popupStyle,
          popupPlacement: props.popupPlacement,
          builtinPlacements: props.builtinPlacements,
          popupAlign: props.popupAlign,
          zIndex: props.zIndex,
          mask: props.mask,
          maskClosable: props.maskClosable,
          popupMotion: props.popupMotion,
          maskMotion: props.maskMotion,
          arrow: innerArrow.value,
          getPopupContainer: props.getPopupContainer,
          getPopupClassNameFromAlign: props.getPopupClassNameFromAlign,
          id,
          onEsc,
        };
      };

      // Handle controlled state changes for UniqueProvider
      // Only sync to UniqueProvider when it's controlled mode
      // If there is a parentContext, don't call uniqueContext methods

      watch([mergedOpen, targetEle], () => {
        if (
          uniqueContext &&
          props.unique &&
          targetEle.value &&
          !openUncontrolled.value &&
          !parentContext?.value
        ) {
          if (mergedOpen.value) {
            const enterDelay = props.mouseEnterDelay ?? 0;
            uniqueContext?.show(getUniqueOptions(enterDelay) as any, isOpen);
          } else {
            uniqueContext?.hide(props.mouseLeaveDelay || 0);
          }
        }
      });

      const openRef = shallowRef(mergedOpen.value);
      watch(mergedOpen, () => {
        openRef.value = mergedOpen.value;
      });

      const internalTriggerOpen = (nextOpen: boolean) => {
        // Compare against `rawOpen`, not `mergedOpen`: while `disabled` forces
        // `mergedOpen` to false, the underlying open state must still be able to
        // change so it is correct once `disabled` is lifted again.
        if (rawOpen.value === nextOpen) {
          return;
        }

        internalOpen.value = nextOpen;
        props?.onOpenChange?.(nextOpen);
        props?.onPopupVisibleChange?.(nextOpen);
      };

      // Trigger for delay
      const delayInvoke = useDelay();

      const triggerOpen = (nextOpen: boolean, delay: number = 0) => {
        // If it's controlled mode, always use internal trigger logic
        // UniqueProvider will be synced through useLayoutEffect
        if (props.popupVisible !== undefined) {
          delayInvoke(() => {
            internalTriggerOpen(nextOpen);
          }, delay);
          return;
        }

        // If UniqueContext exists and not controlled, pass delay to Provider instead of handling it internally
        // If there is a parentContext, don't call uniqueContext methods
        if (
          uniqueContext &&
          props.unique &&
          openUncontrolled.value &&
          !parentContext?.value
        ) {
          if (nextOpen) {
            uniqueContext?.show(getUniqueOptions(delay) as any, isOpen);
          } else {
            uniqueContext.hide(delay);
          }
          return;
        }

        delayInvoke(() => {
          internalTriggerOpen(nextOpen);
        }, delay);
      };

      function onEsc({
        top,
      }: Parameters<NonNullable<PortalProps['onEsc']>>[0]) {
        if (top) {
          triggerOpen(false);
        }
      }

      // ========================== Motion ============================
      const inMotion = shallowRef(false);
      watch(mergedOpen, () => {
        if (mergedOpen.value) {
          inMotion.value = true;
        }
      });

      const motionPrepareResolve = shallowRef<VoidFunction>();
      // =========================== Align ============================
      const mousePos = ref<[x: number, y: number] | null>(null);
      const setMousePosByEvent = (event: any) => {
        mousePos.value = [event.clientX, event.clientY];
      };

      const [
        ready,
        offsetX,
        offsetY,
        offsetR,
        offsetB,
        arrowX,
        arrowY,
        scaleX,
        scaleY,
        alignInfo,
        onAlign,
      ] = useAlign(
        mergedOpen,
        popupEle as any,
        computed(() =>
          props?.alignPoint && mousePos.value !== null
            ? mousePos.value
            : targetEle.value,
        ) as any,
        computed(() => props?.popupPlacement) as any,
        computed(() => props?.builtinPlacements) as any,
        computed(() => props?.popupAlign) as any,
        props?.onPopupAlign,
        isMobile,
      );

      const [showActions, hideActions] = useAction(
        computed(() => props.action!),
        computed(() => props.showAction!),
        computed(() => props.hideAction!),
      );
      const clickToShow = computed(() => showActions.value?.has('click'));
      const clickToHide = computed(
        () =>
          hideActions.value?.has('click') ||
          hideActions.value?.has('contextmenu'),
      );
      const triggerAlign = () => {
        if (inMotion.value) {
          onAlign(true);
        } else {
          onAlign();
        }
      };

      const onScroll = () => {
        if (openRef.value && props?.alignPoint && clickToHide.value) {
          triggerOpen(false);
        }
      };

      useWatch(
        mergedOpen,
        targetEle as any,
        popupEle as any,
        triggerAlign,
        onScroll,
      );
      watch([mousePos, () => props.popupPlacement], async () => {
        await nextTick();
        triggerAlign();
      });
      watch(
        () => JSON.stringify(props.popupAlign),
        async () => {
          await nextTick();
          const { builtinPlacements, popupPlacement } = props;
          if (mergedOpen.value && !builtinPlacements?.[popupPlacement!]) {
            triggerAlign();
          }
        },
      );
      const alignedClassName = computed(() => {
        const baseClassName = getAlignPopupClassName(
          props.builtinPlacements!,
          props.prefixCls!,
          alignInfo.value,
          props.alignPoint!,
        );
        return clsx(
          baseClassName,
          props?.getPopupClassNameFromAlign?.(alignInfo.value),
        );
      });
      expose({
        nativeElement: externalForwardRef,
        popupElement: externalPopupRef,
        forceAlign: triggerAlign,
      });

      // ========================== Stretch ===========================
      const targetWidth = shallowRef(0);
      const targetHeight = shallowRef(0);

      const syncTargetSize = () => {
        if (!(props.stretch && targetEle.value)) {
          return;
        }

        const rect = targetEle.value.getBoundingClientRect();
        targetWidth.value = rect.width;
        targetHeight.value = rect.height;
      };

      const onTargetResize = () => {
        syncTargetSize();
        triggerAlign();
      };

      // ========================== Motion ============================
      const onVisibleChanged = (visible: boolean) => {
        inMotion.value = false;
        onAlign();
        props?.afterOpenChange?.(visible);
        props?.afterPopupVisibleChange?.(visible);
      };

      // We will trigger align when motion is in prepare
      const onPrepare = (element?: Element) => {
        // On the first open the motion runs as an *appear*, whose before-hook
        // fires during the popup's beforeMount — before the popup's function ref
        // (`setPopupRef`) has assigned `popupEle`. On vue 3.5.39 the post-flush
        // prepare align then runs while `popupEle` is still empty, so `_onAlign`
        // bails and the enter animation starts off-screen (first animation is
        // "lost" and the popup flashes). The transition hook hands us the popup
        // element, so seed `popupEle` from it to keep the prepare-time align
        // working. `setPopupRef` still runs post-mount for full registration.
        if (element && !popupEle.value) {
          popupEle.value = element as HTMLDivElement;
        }
        syncTargetSize();
        return new Promise<void>((resolve) => {
          motionPrepareResolve.value = resolve;
          inMotion.value = true;
        });
      };

      watch(
        [motionPrepareResolve],
        () => {
          if (!motionPrepareResolve.value) {
            return;
          }

          onAlign();
          motionPrepareResolve.value();
          motionPrepareResolve.value = undefined;
        },
        {
          flush: 'post',
        },
      );

      // =========================== Action ===========================
      /**
       * Util wrapper for trigger action
       * @param target
       * @param eventName  Listen event name
       * @param nextOpen  Next open state after trigger
       * @param delay Delay to trigger open change
       * @param callback Callback if current event need additional action
       * @param ignoreCheck  Ignore current event if check return true
       */
      function wrapperAction(
        target: Record<string, any>,
        eventName: string,
        nextOpen: boolean,
        delay?: number,
        callback?: (event: Event) => void,
        ignoreCheck?: () => boolean,
      ) {
        target[eventName] = (event: any, ...args: any[]) => {
          if (!ignoreCheck || !ignoreCheck()) {
            callback?.(event);
            triggerOpen(nextOpen, delay);
          }

          // Pass to origin
          originChildProps[eventName]?.(event, ...args);
        };
      }

      // ======================= Action: Touch ========================
      const touchToShow = computed(() => showActions.value?.has('touch'));
      const touchToHide = computed(() => hideActions.value?.has('touch'));
      /** Used for prevent `hover` event conflict with mobile env */
      const touchedRef = shallowRef(false);
      watchEffect(() => {
        const nextCloneProps: Record<string, any> = {};
        if (touchToShow.value || touchToHide.value) {
          nextCloneProps.onTouchstart = (...args: any[]) => {
            touchedRef.value = true;

            if (openRef.value && touchToHide.value) {
              triggerOpen(false);
            } else if (!openRef.value && touchToShow.value) {
              triggerOpen(true);
            }

            // Pass to origin
            originChildProps.onTouchstart?.(...args);
          };
        }

        // ======================= Action: Click ========================
        if (clickToShow.value || clickToHide.value) {
          nextCloneProps.onClick = (event: MouseEvent, ...args: any[]) => {
            if (openRef.value && clickToHide.value) {
              triggerOpen(false);
            } else if (!openRef.value && clickToShow.value) {
              setMousePosByEvent(event);

              triggerOpen(true);
            }

            // Pass to origin
            originChildProps?.onClick?.(event, ...args);
            touchedRef.value = false;
          };
        }
        baseActionProps.value = nextCloneProps;
      });

      // Click to hide is special action since click popup element should not hide
      const onPopupPointerDown = useWinClick(
        mergedOpen,
        computed(() => clickToHide.value || touchToHide.value),
        targetEle as any,
        popupEle as any,
        computed(() => props.mask) as any,
        computed(() => props.maskClosable) as any,
        inPopupOrChild,
        triggerOpen,
      );

      // ======================= Action: Hover ========================
      const hoverToShow = computed(() => showActions.value?.has('hover'));
      const hoverToHide = computed(() => hideActions.value?.has('hover'));

      let onPopupMouseEnter: any;
      let onPopupMouseLeave: ((event: MouseEvent) => void) | undefined;

      const ignoreMouseTrigger = () => {
        return touchedRef.value;
      };

      watchEffect(() => {
        const {
          mouseEnterDelay,
          mouseLeaveDelay,
          alignPoint,
          focusDelay,
          blurDelay,
        } = props;
        const nextHoverProps: Record<string, any> = {};
        if (hoverToShow.value) {
          const onMouseEnterCallback = (event: any) => {
            setMousePosByEvent(event);
          };

          // Compatible with old browser which not support pointer event
          wrapperAction(
            nextHoverProps,
            'onMouseenter',
            true,
            mouseEnterDelay,
            onMouseEnterCallback,
            ignoreMouseTrigger,
          );
          wrapperAction(
            nextHoverProps,
            'onPointerenter',
            true,
            mouseEnterDelay,
            onMouseEnterCallback,
            ignoreMouseTrigger,
          );

          onPopupMouseEnter = (event: any) => {
            // Only trigger re-open when popup is visible
            if (
              (mergedOpen.value || inMotion.value) &&
              popupEle?.value?.contains(event.target as HTMLElement)
            ) {
              triggerOpen(true, mouseEnterDelay);
            }
          };

          // Align Point
          if (alignPoint) {
            nextHoverProps.onMouseMove = (event: any) => {
              originChildProps.onMousemove?.(event);
            };
          }
        } else {
          onPopupMouseEnter = undefined;
        }

        if (hoverToHide.value) {
          wrapperAction(
            nextHoverProps,
            'onMouseleave',
            false,
            mouseLeaveDelay,
            undefined,
            ignoreMouseTrigger,
          );
          wrapperAction(
            nextHoverProps,
            'onPointerleave',
            false,
            mouseLeaveDelay,
            undefined,
            ignoreMouseTrigger,
          );

          onPopupMouseLeave = (event: MouseEvent) => {
            const { relatedTarget } = event;
            if (relatedTarget && inPopupOrChild(relatedTarget)) {
              return;
            }
            triggerOpen(false, mouseLeaveDelay);
          };
        } else {
          onPopupMouseLeave = undefined;
        }

        // ======================= Action: Focus ========================
        if (showActions.value.has('focus')) {
          wrapperAction(nextHoverProps, 'onFocus', true, focusDelay);
        }

        if (hideActions.value.has('focus')) {
          wrapperAction(nextHoverProps, 'onBlur', false, blurDelay);
        }

        // ==================== Action: ContextMenu =====================
        if (showActions.value.has('contextmenu')) {
          nextHoverProps.onContextmenu = (event: any, ...args: any[]) => {
            if (openRef.value && hideActions.value.has('contextmenu')) {
              triggerOpen(false);
            } else {
              setMousePosByEvent(event);
              triggerOpen(true);
            }

            event.preventDefault();

            // Pass to origin
            originChildProps.onContextmenu?.(event, ...args);
          };
        }
        hoverActionProps.value = nextHoverProps;
      });

      // ============================ Perf ============================
      const rendedRef = shallowRef(false);
      watchEffect(() => {
        rendedRef.value ||=
          props.forceRender || mergedOpen.value || inMotion.value;
      });
      // =================== Resize Observer ===================
      // Use hook to observe target element resize
      // Pass targetEle directly instead of a function so the hook will re-observe when target changes
      useResizeObserver(mergedOpen, targetEle, onTargetResize);
      return () => {
        // ========================== Children ==========================
        const child = filterEmpty(
          slots?.default?.({ open: mergedOpen.value }) ?? [],
        )?.[0];
        // =========================== Render ===========================
        const mergedChildrenProps = {
          ...originChildProps,
          ...cloneProps.value,
        };
        // Pass props into cloneProps for nest usage
        const passedProps: Record<string, any> = {};
        const passedEventList = [
          'onContextmenu',
          'onClick',
          'onMousedown',
          'onTouchstart',
          'onMouseenter',
          'onMouseleave',
          'onFocus',
          'onBlur',
        ];
        passedEventList.forEach((eventName) => {
          if (attrs[eventName]) {
            passedProps[eventName] = (...args: any[]) => {
              mergedChildrenProps[eventName]?.(...args);
              (attrs as any)[eventName](...args);
            };
          }
        });

        const arrowPos: ArrowPos = {
          x: arrowX.value,
          y: arrowY.value,
        };
        // Child Node
        const triggerNode = createVNode(child as any, {
          ...mergedChildrenProps,
          ...passedProps,
          ref: setTargetRef,
        });
        const {
          unique,
          prefixCls,
          popup,
          popupClassName,
          popupStyle,
          zIndex,
          fresh,
          onPopupClick,
          mask,
          popupMotion,
          maskMotion,
          forceRender,
          getPopupContainer,
          stretch,
          mobile,
        } = props;
        return (
          <>
            {triggerNode}
            {rendedRef.value &&
              targetEle.value &&
              (!uniqueContext || !unique) && (
                <TriggerContextProvider {...context.value}>
                  <Popup
                    // Arrow
                    align={alignInfo.value}
                    arrow={innerArrow.value!}
                    arrowPos={arrowPos}
                    autoDestroy={mergedAutoDestroy.value}
                    className={clsx(
                      popupClassName,
                      !isMobile.value && alignedClassName.value,
                    )}
                    // Portal
                    forceRender={forceRender}
                    fresh={fresh}
                    getPopupContainer={getPopupContainer}
                    keepDom={inMotion.value}
                    // Mask
                    mask={mask}
                    maskMotion={maskMotion}
                    // Mobile
                    mobile={mobile}
                    // Motion
                    motion={popupMotion}
                    offsetB={offsetB.value}
                    offsetR={offsetR.value}
                    offsetX={offsetX.value}
                    offsetY={offsetY.value}
                    onAlign={triggerAlign}
                    // Click
                    onClick={onPopupClick}
                    onEsc={onEsc}
                    onMouseEnter={onPopupMouseEnter}
                    onMouseLeave={onPopupMouseLeave}
                    onPointerDownCapture={onPopupPointerDown}
                    onPointerEnter={onPopupMouseEnter}
                    onPrepare={onPrepare}
                    onVisibleChanged={onVisibleChanged}
                    // Open
                    open={mergedOpen.value}
                    popup={popup!}
                    portal={PortalComponent}
                    prefixCls={prefixCls!}
                    // Align
                    ready={ready.value}
                    ref={setPopupRef}
                    // Stretch
                    stretch={stretch}
                    style={popupStyle}
                    target={targetEle.value as any}
                    targetHeight={targetHeight.value / scaleY.value}
                    targetWidth={targetWidth.value / scaleX.value}
                    zIndex={zIndex}
                  />
                </TriggerContextProvider>
              )}
          </>
        );
      };
    },
  );
}

const Trigger = generateTrigger(Portal);

export { Trigger };
export default Trigger;
export { default as UniqueProvider } from './UniqueProvider';
export type { UniqueProviderProps } from './UniqueProvider';

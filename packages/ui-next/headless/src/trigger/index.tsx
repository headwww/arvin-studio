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

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

export interface TriggerProps {
  action?: ActionType | ActionType[];
  afterOpenChange?: (visible: boolean) => void;
  /** @deprecated Use `afterOpenChange` instead */
  afterPopupVisibleChange?: (visible: boolean) => void;
  alignPoint?: boolean; // Maybe we can support user pass position in the future

  // ==================== Arrow ====================
  arrow?: ArrowTypeOuter | boolean;

  autoDestroy?: boolean;

  blurDelay?: number;

  builtinPlacements?: BuildInPlacements;

  defaultPopupVisible?: boolean;
  /** Temporarily suppress popup visibility without resetting the current open state. */
  disabled?: boolean;
  focusDelay?: number;
  forceRender?: boolean;
  /**
   * Trigger will memo content when close.
   * This may affect the case if want to keep content update.
   * Set `fresh` to `false` will always keep update.
   */
  fresh?: boolean;
  getPopupClassNameFromAlign?: (align: AlignType) => string;

  // =================== Portal ====================
  getPopupContainer?: ((node: HTMLElement) => HTMLElement) | false;
  hideAction?: ActionType[];
  // ==================== Mask =====================
  mask?: boolean;

  maskClosable?: boolean;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;

  // // ========================== Mobile ==========================
  /**
   * @private
   * Will replace the config of root props.
   * This will directly trade as mobile view which will not check what real is.
   * This is internal usage currently, do not use in your prod.
   */
  mobile?: MobileConfig;
  // ==================== Delay ====================
  mouseEnterDelay?: number;

  mouseLeaveDelay?: number;
  onOpenChange?: (visible: boolean) => void;

  onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
  onPopupClick?: (e: MouseEvent) => void;

  /** @deprecated Use `onOpenChange` instead */
  onPopupVisibleChange?: (visible: boolean) => void;
  // ==================== Popup ====================
  popup: (() => VueNode) | VueNode;
  popupAlign?: AlignType;
  popupClassName?: string;
  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps;
  popupPlacement?: string;
  popupStyle?: CSSProperties;
  // ==================== Open =====================
  popupVisible?: boolean;
  prefixCls?: string;
  showAction?: ActionType[];

  stretch?: string;

  /**
   * Config with UniqueProvider to shared the floating popup.
   */
  unique?: boolean;

  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerClassName?: string;

  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerStyle?: CSSProperties;

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

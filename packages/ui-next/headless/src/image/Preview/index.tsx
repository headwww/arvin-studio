import type { CSSProperties } from 'vue';

import type { PortalProps } from '../../portal';
import type { VueNode } from '../../util';
import type {
  TransformAction,
  TransformType,
} from '../hooks/useImageTransform';
import type { ImgInfo } from '../Image';
import type { FooterSemanticName } from './Footer';

import {
  computed,
  defineComponent,
  nextTick,
  shallowRef,
  Transition,
  watch,
  watchEffect,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import Portal from '../../portal';
import {
  canUseDom,
  getTransitionProps,
  KeyCodeStr,
  useLockFocus,
} from '../../util';
import { usePreviewGroupContext } from '../context';
import useImageTransform from '../hooks/useImageTransform';
import useMouseEvent from '../hooks/useMouseEvent';
import useStatus from '../hooks/useStatus';
import useTouchEvent from '../hooks/useTouchEvent';
import { BASE_SCALE_RATIO } from '../previewConfig';
import CloseBtn from './CloseBtn';
import Footer from './Footer';
import PrevNext from './PrevNext';

// Note: if you want to add `action`,
// pls contact @zombieJ or @thinkasany first.
export type PreviewSemanticName =
  | 'body'
  | 'close'
  | 'mask'
  | 'root'
  | FooterSemanticName;

export interface OperationIcons {
  close?: VueNode;
  flipX?: VueNode;
  flipY?: VueNode;
  /** @deprecated Please use `prev` instead */
  left?: VueNode;
  next?: VueNode;
  prev?: VueNode;
  /** @deprecated Please use `next` instead */
  right?: VueNode;
  rotateLeft?: VueNode;
  rotateRight?: VueNode;
  zoomIn?: VueNode;
  zoomOut?: VueNode;
}

export interface Actions {
  onActive: (offset: number) => void;
  onClose: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onReset: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export interface ToolbarRenderInfoType {
  actions: Actions;
  current: number;
  icons: {
    flipXIcon: VueNode;
    flipYIcon: VueNode;
    nextIcon?: VueNode;
    prevIcon?: VueNode;
    rotateLeftIcon: VueNode;
    rotateRightIcon: VueNode;
    zoomInIcon: VueNode;
    zoomOutIcon: VueNode;
  };
  image: ImgInfo;
  total: number;
  transform: TransformType;
}

export interface InternalPreviewConfig {
  actionsRender?: (
    originalNode: VueNode,
    info: ToolbarRenderInfoType,
  ) => VueNode;

  afterOpenChange?: (open: boolean) => void;
  alt?: string;

  closeIcon?: boolean | null | VueNode;
  // Render
  countRender?: (current: number, total: number) => VueNode;
  // Focus
  focusTrap?: boolean;

  getContainer?: PortalProps['getContainer'];
  icons?: OperationIcons;
  imageRender?: (
    originalNode: VueNode,
    info: { current?: number; image: ImgInfo; transform: TransformType },
  ) => VueNode;
  maskClosable?: boolean;
  maxScale?: number;
  minScale?: number;

  // Display
  motionName?: string;

  // Operation
  movable?: boolean;
  onTransform?: (info: {
    action: TransformAction;
    transform: TransformType;
  }) => void;
  open?: boolean;

  // Semantic
  /** Better to use `classNames.root` instead */
  rootClassName?: string;

  // Scale
  scaleStep?: number;
  // Image
  src?: string;
  zIndex?: number;
}

export interface PreviewProps extends InternalPreviewConfig {
  classNames?: Partial<Record<PreviewSemanticName, string>>;

  count?: number;
  // Pagination
  current?: number;

  fallback?: string;
  height?: number | string;

  // Origin image Info
  imageInfo?: {
    height: number | string;
    width: number | string;
  };
  // Preview image
  imgCommonProps?: Record<string, any>;
  // Display
  mousePosition: null | { x: number; y: number };

  onChange?: (current: number, prev: number) => void;
  // Events
  onClose?: () => void;
  // Misc
  prefixCls: string;

  styles?: Partial<Record<PreviewSemanticName, CSSProperties>>;

  width?: number | string;
}

const defaults = {
  movable: true,
  scaleStep: 0.5,
  minScale: 1,
  maxScale: 50,
  motionName: 'fade',
  current: 0,
  count: 1,
  icons: {},
} as any;

const Preview = defineComponent<PreviewProps>(
  (props = defaults, { attrs, slots }) => {
    const imgEl = shallowRef<HTMLImageElement>();
    const wrapperRef = shallowRef<HTMLDivElement | null>(null);
    const triggerRef = shallowRef<HTMLElement | null>(null);
    const groupContext = usePreviewGroupContext();

    const showLeftOrRightSwitches = computed(
      () => !!groupContext && (props.count ?? 1) > 1,
    );
    const showOperationsProgress = computed(
      () => !!groupContext && (props.count ?? 1) >= 1,
    );

    // ======================== Transform =========================
    const enableTransition = shallowRef(true);
    watch(enableTransition, async (val) => {
      if (val) {
        return;
      }

      await nextTick();
      enableTransition.value = true;
    });

    const { transform, resetTransform, updateTransform, dispatchZoomChange } =
      useImageTransform(
        imgEl as any,
        computed(() => props.minScale ?? 1),
        computed(() => props.maxScale ?? 50),
        (info) => props.onTransform?.(info),
      );

    const { isMoving, onMouseDown, onWheel } = useMouseEvent(
      imgEl as any,
      computed(() => props.movable ?? true),
      computed(() => !!props.open),
      computed(() => props.scaleStep ?? 0.5),
      transform as any,
      updateTransform,
      dispatchZoomChange,
    );

    const { isTouching, onTouchStart, onTouchMove, onTouchEnd } = useTouchEvent(
      imgEl as any,
      computed(() => props.movable ?? true),
      computed(() => !!props.open),
      computed(() => props.minScale ?? 1),
      transform as any,
      updateTransform,
      dispatchZoomChange,
    );

    // Attach wheel/touch listeners with `passive: true` so the browser does not
    // emit `[Violation] Added non-passive event listener to a scroll-blocking ...`.
    // None of these handlers call `preventDefault()`, so passive is safe.
    watch(imgEl, (el, _old, onCleanup) => {
      if (!el) return;
      const opts = { passive: true } as AddEventListenerOptions;
      el.addEventListener('wheel', onWheel, opts);
      el.addEventListener('touchstart', onTouchStart as EventListener, opts);
      el.addEventListener('touchmove', onTouchMove as EventListener, opts);
      el.addEventListener('touchend', onTouchEnd as EventListener, opts);
      el.addEventListener('touchcancel', onTouchEnd as EventListener, opts);
      onCleanup(() => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('touchstart', onTouchStart as EventListener);
        el.removeEventListener('touchmove', onTouchMove as EventListener);
        el.removeEventListener('touchend', onTouchEnd as EventListener);
        el.removeEventListener('touchcancel', onTouchEnd as EventListener);
      });
    });

    watch(
      () => props.open,
      (open) => {
        if (!open) {
          resetTransform('close');
        }
      },
    );

    watch(
      () => props.open,
      (open) => {
        if (open && canUseDom()) {
          triggerRef.value = document.activeElement as HTMLElement | null;
        }
      },
    );

    // ========================== Image ===========================
    const onDoubleClick = (event: MouseEvent) => {
      if (!props.open) {
        return;
      }

      if (transform.value.scale === 1) {
        dispatchZoomChange(
          BASE_SCALE_RATIO + (props.scaleStep ?? 0.5),
          'doubleClick',
          (event as any).clientX,
          (event as any).clientY,
        );
      } else {
        updateTransform({ x: 0, y: 0, scale: 1 }, 'doubleClick');
      }
    };

    // ======================== Operation =========================
    const onZoomIn = () => {
      dispatchZoomChange(BASE_SCALE_RATIO + (props.scaleStep ?? 0.5), 'zoomIn');
    };

    const onZoomOut = () => {
      dispatchZoomChange(
        BASE_SCALE_RATIO / (BASE_SCALE_RATIO + (props.scaleStep ?? 0.5)),
        'zoomOut',
      );
    };

    const onRotateRight = () => {
      updateTransform({ rotate: transform.value.rotate + 90 }, 'rotateRight');
    };

    const onRotateLeft = () => {
      updateTransform({ rotate: transform.value.rotate - 90 }, 'rotateLeft');
    };

    const onFlipX = () => {
      updateTransform({ flipX: !transform.value.flipX }, 'flipX');
    };

    const onFlipY = () => {
      updateTransform({ flipY: !transform.value.flipY }, 'flipY');
    };

    const onReset = () => {
      resetTransform('reset');
    };

    const onActive = (offset: number) => {
      const current = props.current ?? 0;
      const count = props.count ?? 1;
      const nextCurrent = current + offset;

      if (nextCurrent >= 0 && nextCurrent <= count - 1) {
        enableTransition.value = false;
        resetTransform(offset < 0 ? 'prev' : 'next');
        props.onChange?.(nextCurrent, current);
      }
    };

    // >>>>> Effect: Keyboard
    const onKeyDown = (event: KeyboardEvent) => {
      if (!props.open) {
        return;
      }

      const { key } = event;

      if (showLeftOrRightSwitches.value) {
        if (key === KeyCodeStr.ArrowLeft) {
          onActive(-1);
        } else if (key === KeyCodeStr.ArrowRight) {
          onActive(1);
        }
      }
    };

    watchEffect((onCleanup) => {
      if (!canUseDom()) {
        return;
      }
      if (props.open) {
        window.addEventListener('keydown', onKeyDown);
      }

      onCleanup(() => {
        window.removeEventListener('keydown', onKeyDown);
      });
    });

    // ======================= Lock Scroll ========================
    const animatedVisible = shallowRef(props?.open ?? false);
    watch(
      () => props.open,
      (open) => {
        if (open) {
          animatedVisible.value = true;
        }
      },
    );

    // ========================== Portal ==========================
    const portalRender = shallowRef(props?.open ?? false);
    watch(
      () => props.open,
      (open) => {
        if (open) {
          portalRender.value = true;
        }
      },
    );

    const onVisibleChanged = (nextVisible: boolean) => {
      if (!nextVisible) {
        animatedVisible.value = false;
        portalRender.value = false;
        triggerRef.value?.focus?.();
        triggerRef.value = null;
      }
      props.afterOpenChange?.(nextVisible);
    };

    const setImgRef = (el?: HTMLImageElement) => {
      imgEl.value = el;
    };
    const [getImgRef, srcAndOnload] = useStatus({
      src: computed(() => props.src),
      fallback: computed(() => props.fallback),
    });
    // =========================== Focus ============================
    const focusTrap = computed(() => props.focusTrap ?? true);
    useLockFocus(
      computed(() => !!(focusTrap.value && props.open && portalRender.value)),
      () => wrapperRef.value,
    );

    // ========================== Render ==========================
    return () => {
      const {
        prefixCls,
        rootClassName,
        src,
        alt,
        imageInfo,
        open,
        closeIcon,
        getContainer,
        current = 0,
        count = 1,
        countRender,
        motionName = 'fade',
        imageRender,
        imgCommonProps,
        actionsRender = slots?.actionsRender,
        classNames = {},
        styles = {},
        mousePosition,
        zIndex,
        icons = {},
        movable = true,
        maskClosable = true,
      } = props;

      const mergedAlt = alt ?? (imgCommonProps as any)?.alt;

      const bodyStyle: CSSProperties = {
        ...styles.body,
      };
      if (mousePosition) {
        bodyStyle.transformOrigin = `${mousePosition.x}px ${mousePosition.y}px`;
      }

      const image: ImgInfo = {
        url: src || '',
        alt: mergedAlt || '',
        ...(imageInfo as any),
      };

      const imgNode = (
        <img
          {...imgCommonProps}
          alt={mergedAlt}
          class={`${prefixCls}-img`}
          height={props.height}
          onDblclick={onDoubleClick}
          onLoad={(srcAndOnload.value as any).onLoad}
          onMousedown={onMouseDown}
          ref={(el) => {
            setImgRef(el as any);
            getImgRef(el as any);
          }}
          src={(srcAndOnload.value as any).src}

          style={{
            transform: `translate3d(${transform.value.x}px, ${transform.value.y}px, 0) scale3d(${
              transform.value.flipX ? '-' : ''
            }${transform.value.scale}, ${transform.value.flipY ? '-' : ''}${transform.value.scale}, 1) rotate(${transform.value.rotate}deg)`,
            transitionDuration:
              !enableTransition.value || isTouching.value ? '0s' : undefined,
          }}
          width={props.width}
        />
      );

      const mergedRootStyle: CSSProperties = {
        ...styles.root,
        ...(attrs as any).style,
      };
      if (zIndex) {
        mergedRootStyle.zIndex = zIndex;
      }

      const mergedRootCls = clsx(prefixCls, rootClassName, classNames.root, {
        [`${prefixCls}-movable`]: movable,
        [`${prefixCls}-moving`]: isMoving.value,
      });

      const transitionProps = getTransitionProps(motionName);

      return (
        <Portal
          autoLock={open || animatedVisible.value}
          getContainer={getContainer}
          onEsc={({ top }) => {
            if (top) {
              props.onClose?.();
            }
          }}
          open={open || animatedVisible.value || portalRender.value}
        >
          <Transition
            {...transitionProps}
            onAfterEnter={() => onVisibleChanged(true)}
            onAfterLeave={() => onVisibleChanged(false)}
          >
            {() => {
              if (!(portalRender.value && open)) {
                return null;
              }

              return (
                <div
                  aria-label={mergedAlt}
                  aria-modal="true"
                  class={mergedRootCls}
                  ref={wrapperRef}
                  role="dialog"
                  style={mergedRootStyle}
                  tabindex={-1}
                >
                  {/* Mask */}
                  <div
                    class={clsx(`${prefixCls}-mask`, classNames.mask)}
                    onClick={maskClosable ? () => props.onClose?.() : undefined}
                    style={styles.mask}
                  />

                  {/* Body */}
                  <div
                    class={clsx(`${prefixCls}-body`, classNames.body)}
                    style={bodyStyle}
                  >
                    {imageRender
                      ? imageRender(imgNode, {
                          transform: transform.value,
                          image,
                          ...(groupContext && { current }),
                        })
                      : imgNode}
                  </div>

                  {/* Close Button */}
                  {closeIcon !== false && closeIcon !== null && (
                    <CloseBtn
                      className={classNames.close}
                      icon={
                        (closeIcon === true
                          ? icons.close
                          : closeIcon || icons.close) as any
                      }
                      onClick={() => props.onClose?.()}
                      prefixCls={prefixCls}
                      style={styles.close}
                    />
                  )}

                  {/* Switch prev or next */}
                  {showLeftOrRightSwitches.value && (
                    <PrevNext
                      count={count}
                      current={current}
                      icons={icons}
                      onActive={onActive}
                      prefixCls={prefixCls}
                    />
                  )}

                  {/* Footer */}
                  <Footer
                    actionsRender={actionsRender}
                    classNames={classNames as any}
                    count={count}
                    countRender={countRender}
                    current={current}
                    icons={icons}
                    image={image}
                    maxScale={props.maxScale ?? 50}
                    minScale={props.minScale ?? 1}
                    onActive={onActive}
                    onClose={() => props.onClose?.()}
                    onFlipX={onFlipX}
                    onFlipY={onFlipY}
                    onReset={onReset}
                    onRotateLeft={onRotateLeft}
                    onRotateRight={onRotateRight}
                    onZoomIn={onZoomIn}
                    onZoomOut={onZoomOut}
                    prefixCls={prefixCls}
                    scale={transform.value.scale}
                    showProgress={showOperationsProgress.value}
                    showSwitch={showLeftOrRightSwitches.value}
                    styles={styles as any}
                    transform={transform.value}
                  />
                </div>
              );
            }}
          </Transition>
        </Portal>
      );
    };
  },
  {
    name: 'ImagePreview',
    inheritAttrs: false,
  },
);

export default Preview;

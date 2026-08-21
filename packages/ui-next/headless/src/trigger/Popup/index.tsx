import type { CSSProperties } from 'vue';

import type { PortalProps } from '../../portal';
import type { ResizeObserverProps } from '../../resize-observer';
import type { CSSMotionProps } from '../../util';
import type { TriggerProps } from '../index';
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface';

import {
  computed,
  defineComponent,
  nextTick,
  shallowRef,
  Transition,
  watchEffect,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import { useResizeObserver } from '../../resize-observer';
import { getTransitionProps, toPropsRefs, useFocusBoundary } from '../../util';
import useOffsetStyle from '../hooks/useOffsetStyle';
import { Arrow } from './Arrow';
import Mask from './Mask';

export interface MobileConfig {
  mask?: boolean;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;
  /** Set popup motion. You can ref `rc-motion` for more info. */
  motion?: CSSMotionProps;
}

export interface PopupProps {
  // Arrow
  align?: AlignType;
  arrow?: ArrowTypeOuter | boolean;
  arrowPos: ArrowPos;
  autoDestroy?: boolean;
  className?: string;
  // Portal
  forceRender?: boolean;
  fresh?: boolean;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: boolean;
  mask?: boolean;
  maskMotion?: CSSMotionProps;

  // Mobile
  mobile?: MobileConfig;
  // Motion
  motion?: CSSMotionProps;

  offsetB: number;
  offsetR: number;
  offsetX: number;

  offsetY: number;
  onAlign: VoidFunction;
  // Click
  onClick?: (e: MouseEvent) => void;

  onEsc?: PortalProps['onEsc'];

  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;

  onPointerDownCapture?: (e: PointerEvent) => void;
  onPointerEnter?: (e: PointerEvent) => void;
  onPrepare: (element?: Element) => Promise<void>;
  // Resize
  onResize?: ResizeObserverProps['onResize'];

  // children?: React.ReactElement

  onVisibleChanged: (visible: boolean) => void;
  // Open
  open: boolean;
  popup?: TriggerProps['popup'];
  portal: any;
  prefixCls: string;
  // Align
  ready: boolean;
  // stretch
  stretch?: string;

  style?: CSSProperties;
  target: HTMLElement;
  targetHeight?: number;

  targetWidth?: number;

  zIndex?: number;
}

const defaults = {
  autoDestroy: true,
} as any;

const Popup = defineComponent<PopupProps>(
  (props = defaults, { attrs, slots, expose }) => {
    const focusBoundary = useFocusBoundary();
    const { offsetX, offsetR, offsetY, offsetB, open, ready, align } =
      toPropsRefs(
        props,
        'offsetX',
        'offsetB',
        'offsetY',
        'offsetR',
        'ready',
        'open',
        'align',
      );
    // We can not remove holder only when motion finished.
    const isNodeVisible = computed(() => props.open || props.keepDom);

    // ========================= Mobile =========================
    const isMobile = computed(() => !!props.mobile);

    // ======================= Container ========================
    const getPopupContainerNeedParams =
      (props as any)?.getPopupContainer?.length > 0;

    const mergedProps = computed(() => {
      const { mobile, mask, maskMotion, motion } = props;
      if (mobile) {
        return [mobile.mask, mobile.maskMotion, mobile.motion] as const;
      }

      return [mask, maskMotion, motion] as const;
    });

    const show = shallowRef(
      !props.getPopupContainer || !getPopupContainerNeedParams,
    );

    // Delay to show since `getPopupContainer` need target element
    watchEffect(async () => {
      await nextTick();
      const getPopupContainerNeedParams =
        (props as any)?.getPopupContainer?.length > 0;
      const target = props.target;
      if (!show.value && getPopupContainerNeedParams && target) {
        show.value = true;
      }
    });

    // ========================= Resize =========================
    const onInternalResize: ResizeObserverProps['onResize'] = (
      size,
      element,
    ) => {
      props?.onResize?.(size, element);
      props?.onAlign?.();
    };

    // ========================= Styles =========================
    const offsetStyle = useOffsetStyle(
      isMobile,
      ready,
      open,
      align,
      offsetR,
      offsetB,
      offsetX,
      offsetY,
    );
    const popupElementRef = shallowRef<HTMLDivElement>();
    watchEffect((onCleanup: any) => {
      if (
        props.open &&
        popupElementRef.value &&
        focusBoundary?.registerAllowedElement
      ) {
        onCleanup(focusBoundary.registerAllowedElement(popupElementRef.value));
      }
    });
    expose({
      getElement: () => popupElementRef.value,
      nativeElement: popupElementRef,
    });
    useResizeObserver(open, popupElementRef, onInternalResize);
    return () => {
      // ========================= Render =========================
      if (!show.value) {
        return null;
      }
      const {
        onEsc,
        stretch,
        targetHeight,
        targetWidth,
        portal: Portal,
        forceRender,
        getPopupContainer,
        target,
        autoDestroy,
        zIndex,
        prefixCls,

        // Arrow
        arrow,
        arrowPos,
        align,

        onMouseEnter,
        onMouseLeave,
        onPointerEnter,
        onPointerDownCapture,
        onClick,

        onPrepare,
        onVisibleChanged,
      } = props;

      // >>>>> Misc
      const miscStyle: CSSProperties = {};
      if (stretch) {
        if (stretch.includes('height') && targetHeight) {
          miscStyle.height = `${targetHeight}px`;
        } else if (stretch.includes('minHeight') && targetHeight) {
          miscStyle.minHeight = `${targetHeight}px`;
        }
        if (stretch.includes('width') && targetWidth) {
          miscStyle.width = `${targetWidth}px`;
        } else if (stretch.includes('minWidth') && targetWidth) {
          miscStyle.minWidth = `${targetWidth}px`;
        }
      }
      if (!open.value) {
        miscStyle.pointerEvents = 'none';
      }
      const [mergedMask, mergedMaskMotion, mergedPopupMotion] =
        mergedProps.value;
      const popupMotionName =
        (mergedPopupMotion as any)?.name ??
        (mergedPopupMotion as any)?.motionName;
      const baseTransitionProps: any = popupMotionName
        ? getTransitionProps(popupMotionName, mergedPopupMotion)
        : {
            appear: true,
            ...mergedPopupMotion,
          };
      const mergedTransitionProps = {
        appear: true,
        ...baseTransitionProps,
        onBeforeEnter: (element: Element) => {
          onPrepare?.(element);
          baseTransitionProps?.onBeforeEnter?.(element);
        },
        onBeforeAppear: (element: Element) => {
          onPrepare?.(element);
          (
            baseTransitionProps?.onBeforeAppear ??
            baseTransitionProps?.onBeforeEnter
          )?.(element);
        },
        onAfterEnter: (element: Element) => {
          baseTransitionProps?.onAfterEnter?.(element);

          requestAnimationFrame(() => {
            // The popup may already be toggling closed again (rapid open/close).
            // Let the pending leave motion own the bookkeeping — clearing
            // `inMotion` here would make re-align measure the mid-leave
            // transform.
            if (props.open) {
              onVisibleChanged?.(true);
            }
          });
        },
        onAfterAppear: (element: Element) => {
          (
            baseTransitionProps?.onAfterAppear ??
            baseTransitionProps?.onAfterEnter
          )?.(element);
          requestAnimationFrame(() => {
            if (props.open) {
              onVisibleChanged?.(true);
            }
          });
        },
        onAfterLeave: (element: Element) => {
          baseTransitionProps.onAfterLeave?.(element);
          onVisibleChanged?.(false);
        },
      };
      const cls = clsx(prefixCls, (attrs as any).class, props.className, {
        [`${prefixCls}-mobile`]: isMobile.value,
      });
      return (
        <Portal
          autoDestroy={autoDestroy}
          getContainer={getPopupContainer && (() => getPopupContainer!(target))}
          onEsc={onEsc}
          open={forceRender || isNodeVisible.value}
        >
          <Mask
            mask={mergedMask!}
            mobile={isMobile.value!}
            motion={mergedMaskMotion!}
            open={open.value}
            prefixCls={prefixCls}
            zIndex={zIndex}
          />

          <Transition {...mergedTransitionProps}>
            <div
              class={cls}
              onClick={onClick}
              onMouseenter={onMouseEnter}
              onMouseleave={onMouseLeave}
              onPointerenter={onPointerEnter}
              ref={popupElementRef}
              style={[
                {
                  '--arrow-x': `${arrowPos.x || 0}px`,
                  '--arrow-y': `${arrowPos.y || 0}px`,
                },
                offsetStyle.value,
                miscStyle,
                {
                  boxSizing: 'border-box',
                  zIndex,
                },
                props.style,
              ]}
              v-show={open.value}
              {...{
                onPointerdownCapture: onPointerDownCapture,
              }}
            >
              {!!arrow && (
                <Arrow
                  align={align!}
                  arrow={arrow === true ? {} : arrow}
                  arrowPos={arrowPos}
                  prefixCls={prefixCls}
                />
              )}

              {typeof props?.popup === 'function'
                ? (props as any).popup()
                : props.popup}
            </div>
          </Transition>
          {slots?.default?.()}
        </Portal>
      );
    };
  },
);

export default Popup;

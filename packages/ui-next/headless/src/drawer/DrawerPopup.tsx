import type { CSSProperties } from 'vue';

import type { CSSMotionProps } from '../util';
import type { DrawerPanelEvents } from './DrawerPanel';
import type { DrawerClassNames, DrawerStyles } from './inter';

import {
  computed,
  defineComponent,
  onBeforeUnmount,
  shallowRef,
  Transition,
  watch,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import {
  getAttrStyleAndClass,
  getTransitionProps,
  pickAttrs,
  toPropsRefs,
} from '../util';
import { useDrawerContext, useDrawerProvide } from './context';
import DrawerPanel from './DrawerPanel';
import useDrag from './hooks/useDrag';
import useFocusable from './hooks/useFocusable';
import { parseWidthHeight } from './util';

export type Placement = 'bottom' | 'left' | 'right' | 'top';

export interface PushConfig {
  distance?: number | string;
}

// export type DrawerPopupProps = Partial<ExtractPropTypes<ReturnType<typeof drawerPopupProps>>>
export interface DrawerPopupProps extends DrawerPanelEvents {
  // Events
  afterOpenChange?: (open: boolean) => void;
  autoFocus?: boolean;
  // classNames
  classNames?: DrawerClassNames;
  // resizable
  /** Default size for uncontrolled resizable drawer */
  defaultSize?: number | string;
  drawerRender?: (node: any) => any;
  focusTrap?: boolean;
  forceRender?: boolean;
  height?: number | string;

  id?: string;
  inline?: boolean;
  keyboard?: boolean;

  // Mask
  mask?: boolean;
  maskClassName?: string;

  maskClosable?: boolean;
  maskMotion?: CSSMotionProps;
  maskStyle?: CSSProperties;
  /** Maximum size of the drawer */
  maxSize?: number;

  motion?:
    | ((placement: Placement | undefined) => CSSMotionProps)
    | CSSMotionProps;
  onClose?: (e: KeyboardEvent | MouseEvent) => void;
  open?: boolean;
  // Drawer
  placement?: Placement;

  prefixCls: string;
  push?: boolean | PushConfig;

  resizable?:
    | boolean
    | {
        onResize?: (size: number) => void;
        onResizeEnd?: () => void;
        onResizeStart?: () => void;
      };
  // Root
  rootClassName?: string;

  rootStyle?: CSSProperties;

  /** Size of the drawer (width for left/right placement, height for top/bottom placement) */
  size?: number | string;
  // styles
  styles?: DrawerStyles;

  width?: number | string;
  zIndex?: number;
}

const DrawerPopup = defineComponent<DrawerPopupProps>(
  (props, { expose, attrs, slots }) => {
    // ================================ Refs ================================
    const panelRef = shallowRef<HTMLDivElement>();

    const { open, autoFocus, placement, push, maxSize, focusTrap, mask } =
      toPropsRefs(
        props,
        'open',
        'autoFocus',
        'push',
        'placement',
        'maxSize',
        'focusTrap',
        'mask',
      );

    expose({
      panelRef,
    });

    // ========================= Focusable ==========================
    useFocusable(() => panelRef.value as any, open, autoFocus, focusTrap, mask);
    // ============================ Push ============================
    const pushed = shallowRef(false);

    const parentContext = useDrawerContext();

    // Merge push distance
    const pushConfig = computed(() => {
      if (typeof push.value === 'boolean') {
        return push.value ? {} : { distance: 0 };
      } else {
        return push.value || {};
      }
    });

    const pushDistance = computed(
      () =>
        pushConfig.value?.distance ?? parentContext.value?.pushDistance ?? 180,
    );
    const mergedContext = computed(() => {
      return {
        pushDistance: pushDistance.value,
        push: () => {
          pushed.value = true;
        },
        pull: () => {
          pushed.value = false;
        },
      };
    });
    useDrawerProvide(mergedContext);

    // ========================= ScrollLock =========================
    // Tell parent to push
    watch(
      open,
      () => {
        if (open.value) {
          parentContext?.value?.push?.();
        } else {
          parentContext.value?.pull?.();
        }
      },
      {
        immediate: true,
      },
    );

    onBeforeUnmount(() => {
      parentContext.value?.pull?.();
    });

    // ============================ Size ============================
    const currentSize = shallowRef<number>();

    const isHorizontal = computed(
      () => placement.value === 'left' || placement.value === 'right',
    );

    // Aggregate size logic with backward compatibility using useMemo
    const mergedSize = computed(() => {
      const legacySize = isHorizontal.value ? props.width : props.height;
      const nextMergedSize =
        props?.size ??
        legacySize ??
        currentSize.value ??
        props?.defaultSize ??
        (isHorizontal.value ? 378 : undefined);
      return parseWidthHeight(nextMergedSize);
    });

    // >>> Style
    const wrapperStyle = computed<CSSProperties>(() => {
      const nextWrapperStyle: CSSProperties = {};
      if (pushed.value && pushDistance.value) {
        switch (placement.value) {
          case 'bottom': {
            // oxlint-disable-next-line typescript/no-unsafe-unary-minus
            nextWrapperStyle.transform = `translateY(${-pushDistance.value}px)`;
            break;
          }
          case 'left': {
            // oxlint-disable-next-line typescript/no-unsafe-unary-minus
            nextWrapperStyle.transform = `translateX(${pushDistance.value}px)`;
            break;
          }
          case 'top': {
            nextWrapperStyle.transform = `translateY(${pushDistance.value}px)`;
            break;
          }
          default: {
            // oxlint-disable-next-line typescript/no-unsafe-unary-minus
            nextWrapperStyle.transform = `translateX(${-pushDistance.value}px)`;
            break;
          }
        }
      }
      if (isHorizontal.value) {
        const parseWidth = parseWidthHeight(mergedSize.value);
        nextWrapperStyle.width =
          typeof parseWidth === 'number' ? `${parseWidth}px` : parseWidth;
      } else {
        const parseHeight = parseWidthHeight(mergedSize.value);
        nextWrapperStyle.height =
          typeof parseHeight === 'number' ? `${parseHeight}px` : parseHeight;
      }
      return nextWrapperStyle;
    });

    // =========================== Resize ===========================
    const wrapperRef = shallowRef<HTMLDivElement>();
    const isResizeable = computed(() => !!props.resizable);
    const resizeConfig = computed(() =>
      typeof props?.resizable === 'object' ? props?.resizable : {},
    );

    const onInternalResize = (size: number) => {
      currentSize.value = size;
      resizeConfig?.value?.onResize?.(size);
    };
    const { dragElementProps, isDragging } = useDrag({
      prefixCls: computed(() => `${props.prefixCls}-resizable`),
      direction: placement as any,
      className: computed(() => props?.classNames?.dragger),
      style: computed(() => props?.styles?.dragger),
      maxSize,
      containerRef: wrapperRef,
      currentSize: mergedSize,
      onResize: onInternalResize,
      onResizeStart: () => resizeConfig?.value?.onResizeStart?.(),
      onResizeEnd: () => resizeConfig?.value?.onResizeEnd?.(),
    });
    return () => {
      const {
        onMouseEnter,
        onMouseOver,
        onMouseLeave,
        onClick,
        onKeyDown,
        onKeyUp,
        maskMotion,
        maskStyle,
        styles,
        prefixCls,
        classNames: drawerClassNames,
        maskClassName,
        maskClosable,
        onClose,
        id,
        drawerRender,
        motion,
        rootStyle,
        rootClassName,
        zIndex,
        inline,
        mask,
      } = props;
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs);

      const maskMotionProps = getTransitionProps(maskMotion?.name, maskMotion);
      const onMaskClose = (e: MouseEvent) => {
        if (maskClosable && open.value) {
          onClose?.(e);
        }
      };

      // ============================ Mask ============================
      const maskNode = (
        <Transition key="mask" {...maskMotionProps}>
          <div
            class={clsx(
              `${prefixCls}-mask`,
              drawerClassNames?.mask,
              maskClassName,
            )}
            onClick={onMaskClose}
            style={[maskStyle, styles?.mask]}
            v-show={open.value}
          />
        </Transition>
      );

      // =========================== Events ===========================
      const eventHandlers = {
        onMouseEnter,
        onMouseOver,
        onMouseLeave,
        onClick,
        onKeyDown,
        onKeyUp,
      };

      // =========================== Render ==========================
      // >>>>> Panel
      const content = (
        <DrawerPanel
          class={clsx(className, drawerClassNames?.section)}
          id={id}
          prefixCls={prefixCls}
          style={[style, styles?.section]}
          {...restAttrs}
          {...eventHandlers}
        >
          {slots?.default?.()}
        </DrawerPanel>
      );

      // =========================== Panel ============================
      const motionProps =
        typeof motion === 'function' ? motion(placement.value) : motion;
      const panelMotionProps = getTransitionProps(
        motionProps?.name,
        motionProps,
      );
      const panelNode = (
        <Transition
          {...panelMotionProps}
          onAfterEnter={() => {
            props?.afterOpenChange?.(true);
          }}
          onAfterLeave={() => {
            props?.afterOpenChange?.(false);
          }}
        >
          <div
            class={clsx(
              `${prefixCls}-content-wrapper`,
              isDragging.value && `${prefixCls}-content-wrapper-dragging`,
              drawerClassNames?.wrapper,
            )}
            ref={wrapperRef}
            style={[wrapperStyle.value, styles?.wrapper]}
            v-show={open.value}
            {...pickAttrs(restAttrs, { data: true })}
          >
            {isResizeable.value && <div {...dragElementProps.value} />}
            {drawerRender ? drawerRender(content) : content}
          </div>
        </Transition>
      );

      // >>>>> Container
      const containerStyle: CSSProperties = {
        ...rootStyle,
      };
      if (zIndex) {
        containerStyle.zIndex = zIndex;
      }

      return (
        <div
          class={clsx(
            prefixCls,
            `${prefixCls}-${placement.value}`,
            rootClassName,
            {
              [`${prefixCls}-open`]: open.value,
              [`${prefixCls}-inline`]: inline,
            },
          )}
          ref={panelRef}
          style={containerStyle}
          tabindex={-1}
        >
          {mask && maskNode}
          {panelNode}
        </div>
      );
    };
  },
  {
    name: 'DrawerPopup',
    inheritAttrs: false,
  },
);

export default DrawerPopup;

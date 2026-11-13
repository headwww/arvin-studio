import type { App, CSSProperties, SlotsType } from 'vue';

import type {
  AsScrollbarConstructor,
  AsScrollbarDefines,
  AsScrollbarEventProps,
  AsScrollbarMethods,
  AsScrollbarProps,
  AsScrollbarSlots,
  ScrollbarInternalData,
  ScrollbarReactData,
} from './scrollbar';

import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRef,
  watch,
} from 'vue';

import { ArvinStudio } from '@arvin-studio/core';
import { clsx, uniqueId } from '@arvin-studio/kit';

import { getAttrStyleAndClass } from '../_util/hooks';
import { useComponentBaseConfig } from '../config-provider/context';
import useCSSVarCls from '../config-provider/hooks/useCSSVarCls';
import { useSize } from '../config-provider/hooks/useSize';
import Spin from '../spin';
import useStyle from './style';

const { createEvent, globalEvents } = ArvinStudio;

interface InternalScrollbarProps /* @vue-ignore */
  extends AsScrollbarEventProps, AsScrollbarProps {}

interface ScrollbarEmits {
  scroll: (params: AsScrollbarDefines.ScrollEventParams) => void;
  'scroll-boundary': (
    params: AsScrollbarDefines.ScrollBoundaryEventParams,
  ) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toNumber = (value?: number | string) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const toCssUnit = (value?: number | string) => {
  if (!value) {
    return '';
  }
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(value)
    ? `${value}px`
    : value;
};

const getThumbSize = (
  viewportSize: number,
  contentSize: number,
  trackSize: number,
) => {
  if (contentSize <= viewportSize) {
    return 0;
  }
  const ratio = viewportSize / contentSize;
  const thumbSize = trackSize * ratio;
  return Math.max(20, Math.min(thumbSize, trackSize));
};

const getThumbOffsetSize = (
  offsetSize: number,
  viewportSize: number,
  contentSize: number,
  trackSize: number,
  thumbSize: number,
) => {
  const maxScrollSize = contentSize - viewportSize;
  const maxThumbOffsetSize = trackSize - thumbSize;
  if (maxScrollSize <= 0 || maxThumbOffsetSize <= 0) {
    return 0;
  }
  const clampedOffsetSize = clamp(offsetSize, 0, maxScrollSize);
  return (clampedOffsetSize / maxScrollSize) * maxThumbOffsetSize;
};

const getScrollFromClick = (
  clickPosition: number,
  viewportSize: number,
  contentSize: number,
  trackSize: number,
  thumbSize: number,
) => {
  const maxScrollSize = contentSize - viewportSize;
  const maxThumbOffsetSize = trackSize - thumbSize;
  if (maxScrollSize <= 0 || maxThumbOffsetSize <= 0) {
    return 0;
  }
  const thumbOffsetSize = clamp(
    clickPosition - thumbSize / 2,
    0,
    maxThumbOffsetSize,
  );
  return (thumbOffsetSize / maxThumbOffsetSize) * maxScrollSize;
};

const getScrollFromDrag = (
  pointerPosition: number,
  dragOffset: number,
  viewportSize: number,
  contentSize: number,
  trackSize: number,
  thumbSize: number,
) => {
  const maxScrollSize = contentSize - viewportSize;
  const maxThumbOffsetSize = trackSize - thumbSize;
  if (maxScrollSize <= 0 || maxThumbOffsetSize <= 0) {
    return 0;
  }
  const thumbOffsetSize = clamp(
    pointerPosition - dragOffset,
    0,
    maxThumbOffsetSize,
  );
  return (thumbOffsetSize / maxThumbOffsetSize) * maxScrollSize;
};

const Scrollbar = defineComponent<
  InternalScrollbarProps,
  ScrollbarEmits,
  string,
  SlotsType<AsScrollbarSlots>
>(
  (props, { slots, attrs, emit, expose }) => {
    const {
      prefixCls,
      rootPrefixCls,
      class: contextClassName,
      style: contextStyle,
    } = useComponentBaseConfig('scrollbar', props);

    const [hashId, cssVarCls] = useStyle(prefixCls);
    const rootCls = useCSSVarCls(prefixCls);

    const mergedSize = useSize(toRef(props, 'size'));
    const xID = uniqueId();

    const refElem = ref<HTMLDivElement>();
    const refViewElem = ref<HTMLDivElement>();
    const refViewInnerElem = ref<HTMLDivElement>();
    const refTrackXElem = ref<HTMLDivElement>();
    const refTrackYElem = ref<HTMLDivElement>();
    const refThumbXElem = ref<HTMLDivElement>();
    const refThumbYElem = ref<HTMLDivElement>();

    const reactData = reactive<ScrollbarReactData>({
      xThumbWidth: 0,
      yThumbHeight: 0,
    });

    const internalData = reactive<ScrollbarInternalData>({
      isThumbDrag: false,
      lastScrollLeft: 0,
      lastScrollTop: 0,
      thumbDragOffset: 0,
      xThumbLeft: 0,
      yThumbTop: 0,
    });

    const xOpts = computed(() => ({ ...props.xConfig }));
    const yOpts = computed(() => ({ ...props.yConfig }));

    const computeXVisible = computed(
      () => xOpts.value.visible ?? props.visible,
    );
    const computeYVisible = computed(
      () => yOpts.value.visible ?? props.visible,
    );
    const computeXAutoHide = computed(
      () => xOpts.value.autoHide ?? props.autoHide,
    );
    const computeYAutoHide = computed(
      () => yOpts.value.autoHide ?? props.autoHide,
    );
    const computeXHeight = computed(() => xOpts.value.height);
    const computeYWidth = computed(() => yOpts.value.width);

    const xToTop = computed(() => xOpts.value.position === 'top');
    const yToLeft = computed(() => yOpts.value.position === 'left');

    const scrollbar = { xID, props } as AsScrollbarConstructor;

    const wrapperStyle = computed<Record<string, any>>(() => {
      const style: Record<string, any> = {};
      const { width, height, minWidth, minHeight, maxWidth, maxHeight } = props;
      if (width) {
        style.width = toCssUnit(width);
      }
      if (height) {
        style.height = toCssUnit(height);
      }
      if (minWidth) {
        style.minWidth = toCssUnit(minWidth);
      }
      if (minHeight) {
        style.minHeight = toCssUnit(minHeight);
      }
      if (maxWidth) {
        style.maxWidth = toCssUnit(maxWidth);
      }
      if (maxHeight) {
        style.maxHeight = toCssUnit(maxHeight);
      }
      const barWidth = computeYWidth.value;
      const barHeight = computeXHeight.value;
      if (barWidth || barHeight) {
        style[`--${rootPrefixCls.value}-scrollbar-y-width`] = toCssUnit(
          barWidth || barHeight,
        );
        style[`--${rootPrefixCls.value}-scrollbar-x-height`] = toCssUnit(
          barHeight || barWidth,
        );
      }
      return style;
    });

    const wrapperCls = computed(() =>
      clsx(
        prefixCls.value,
        mergedSize.value === 'large'
          ? `${prefixCls.value}-lg`
          : mergedSize.value === 'small'
            ? `${prefixCls.value}-sm`
            : '',
        props.fluentOverlay
          ? `${prefixCls.value}-fluent-overlay`
          : `${prefixCls.value}-default-mode`,
        computeXVisible.value === false
          ? `${prefixCls.value}-x-hidden`
          : `${prefixCls.value}-x-visible`,
        computeYVisible.value === false
          ? `${prefixCls.value}-y-hidden`
          : `${prefixCls.value}-y-visible`,
        xToTop.value
          ? `${prefixCls.value}-x-top`
          : `${prefixCls.value}-x-bottom`,
        yToLeft.value
          ? `${prefixCls.value}-y-left`
          : `${prefixCls.value}-y-right`,
        props.native
          ? `${prefixCls.value}-native`
          : `${prefixCls.value}-virtual`,
        props.className,
        {
          [`${prefixCls.value}-padding`]: props.padding,
          [`${prefixCls.value}-x-auto-hide`]: computeXAutoHide.value,
          [`${prefixCls.value}-y-auto-hide`]: computeYAutoHide.value,
          [`${prefixCls.value}-overflow-x`]: reactData.xThumbWidth > 0,
          [`${prefixCls.value}-overflow-y`]: reactData.yThumbHeight > 0,
        },
      ),
    );

    const spinSize = computed(() => {
      if (mergedSize.value === 'small') {
        return 'small' as const;
      }
      if (mergedSize.value === 'large') {
        return 'large' as const;
      }
      return 'default' as const;
    });

    const dispatchEvent = (
      type: 'scroll' | 'scroll-boundary',
      params: Record<string, any>,
      evnt: Event | null,
    ) => {
      (emit as any)(type, createEvent(evnt, { $scrollbar: scrollbar }, params));
    };

    const updateThumbSize = () => {
      const viewEl = refViewElem.value;
      if (!viewEl) {
        return;
      }
      if (!viewEl.clientHeight || !viewEl.clientWidth) {
        return;
      }
      const trackXEl = refTrackXElem.value;
      const trackYEl = refTrackYElem.value;
      reactData.xThumbWidth = trackXEl
        ? getThumbSize(
            viewEl.clientWidth,
            viewEl.scrollWidth,
            trackXEl.clientWidth,
          )
        : 0;
      if (refThumbXElem.value) {
        refThumbXElem.value.style.width = `${reactData.xThumbWidth}px`;
      }
      reactData.yThumbHeight = trackYEl
        ? getThumbSize(
            viewEl.clientHeight,
            viewEl.scrollHeight,
            trackYEl.clientHeight,
          )
        : 0;
      if (refThumbYElem.value) {
        refThumbYElem.value.style.height = `${reactData.yThumbHeight}px`;
      }
    };

    const updateThumbOffset = () => {
      const viewEl = refViewElem.value;
      if (!viewEl) {
        return;
      }
      if (!viewEl.clientHeight || !viewEl.clientWidth) {
        return;
      }
      const trackXEl = refTrackXElem.value;
      const trackYEl = refTrackYElem.value;
      const { xThumbWidth, yThumbHeight } = reactData;
      const xThumbLeft =
        trackXEl && xThumbWidth
          ? getThumbOffsetSize(
              viewEl.scrollLeft,
              viewEl.clientWidth,
              viewEl.scrollWidth,
              trackXEl.clientWidth,
              xThumbWidth,
            )
          : 0;
      internalData.xThumbLeft = xThumbLeft;
      const thumbXEl = refThumbXElem.value;
      if (thumbXEl && xThumbWidth) {
        thumbXEl.style.width = `${xThumbWidth}px`;
        thumbXEl.style.transform = `translateX(${xThumbLeft}px)`;
      }
      const yThumbTop =
        trackYEl && yThumbHeight
          ? getThumbOffsetSize(
              viewEl.scrollTop,
              viewEl.clientHeight,
              viewEl.scrollHeight,
              trackYEl.clientHeight,
              yThumbHeight,
            )
          : 0;
      internalData.yThumbTop = yThumbTop;
      const thumbYEl = refThumbYElem.value;
      if (thumbYEl && yThumbHeight) {
        thumbYEl.style.height = `${yThumbHeight}px`;
        thumbYEl.style.transform = `translateY(${yThumbTop}px)`;
      }
    };

    const recalculate = () => {
      updateThumbSize();
      updateThumbOffset();
      return nextTick();
    };

    const scrollEvent = (evnt: Event) => {
      const viewEl = evnt.currentTarget as HTMLDivElement;
      const {
        scrollTop,
        scrollLeft,
        clientHeight,
        clientWidth,
        scrollHeight,
        scrollWidth,
      } = viewEl;
      let eventDirection: AsScrollbarDefines.ScrollEventParams['direction'] =
        '';
      let isTopBoundary = false;
      let isBottomBoundary = false;
      let isLeftBoundary = false;
      let isRightBoundary = false;
      if (internalData.lastScrollTop !== scrollTop) {
        const yThreshold = toNumber(yOpts.value.threshold) || 1;
        if (internalData.lastScrollTop < scrollTop) {
          eventDirection = 'bottom';
          if (
            reactData.yThumbHeight > 0 &&
            scrollTop + clientHeight >= scrollHeight - yThreshold
          ) {
            isBottomBoundary = true;
          }
        } else {
          eventDirection = 'top';
          if (reactData.yThumbHeight > 0 && scrollTop <= yThreshold) {
            isTopBoundary = true;
          }
        }
      }
      if (internalData.lastScrollLeft !== scrollLeft) {
        const xThreshold = toNumber(xOpts.value.threshold) || 1;
        if (internalData.lastScrollLeft < scrollLeft) {
          eventDirection = 'right';
          if (
            reactData.xThumbWidth > 0 &&
            scrollLeft + clientWidth >= scrollWidth - xThreshold
          ) {
            isRightBoundary = true;
          }
        } else {
          eventDirection = 'left';
          if (reactData.xThumbWidth > 0 && scrollLeft <= xThreshold) {
            isLeftBoundary = true;
          }
        }
      }
      updateThumbOffset();
      internalData.lastScrollTop = scrollTop;
      internalData.lastScrollLeft = scrollLeft;
      if (
        isBottomBoundary ||
        isTopBoundary ||
        isRightBoundary ||
        isLeftBoundary
      ) {
        dispatchEvent(
          'scroll-boundary',
          {
            direction: eventDirection,
            isBottom: isBottomBoundary,
            isLeft: isLeftBoundary,
            isRight: isRightBoundary,
            isTop: isTopBoundary,
            scrollTop,
            scrollLeft,
            clientHeight,
            clientWidth,
            scrollHeight,
            scrollWidth,
          },
          evnt,
        );
      }
      dispatchEvent(
        'scroll',
        {
          direction: eventDirection,
          isBottom:
            reactData.yThumbHeight > 0 &&
            scrollTop + clientHeight >= scrollHeight,
          isLeft: reactData.xThumbWidth > 0 && scrollLeft <= 0,
          isRight:
            reactData.xThumbWidth > 0 &&
            scrollLeft + clientWidth >= scrollWidth,
          isTop: reactData.yThumbHeight > 0 && scrollTop <= 0,
          scrollTop,
          scrollLeft,
          clientHeight,
          clientWidth,
          scrollHeight,
          scrollWidth,
        },
        evnt,
      );
    };

    const clickTrackXEvent = (evnt: MouseEvent) => {
      const trackEl = evnt.currentTarget as HTMLDivElement;
      if (trackEl !== evnt.target) {
        return;
      }
      const viewEl = refViewElem.value;
      if (!viewEl) {
        return;
      }
      const trackRect = trackEl.getBoundingClientRect();
      viewEl.scrollTo({
        left: getScrollFromClick(
          evnt.clientX - trackRect.left,
          viewEl.clientWidth,
          viewEl.scrollWidth,
          trackEl.clientWidth,
          reactData.xThumbWidth,
        ),
        behavior: 'auto',
      });
    };

    const clickTrackYEvent = (evnt: MouseEvent) => {
      const trackEl = evnt.currentTarget as HTMLDivElement;
      if (trackEl !== evnt.target) {
        return;
      }
      const viewEl = refViewElem.value;
      if (!viewEl) {
        return;
      }
      const trackRect = trackEl.getBoundingClientRect();
      viewEl.scrollTo({
        top: getScrollFromClick(
          evnt.clientY - trackRect.top,
          viewEl.clientHeight,
          viewEl.scrollHeight,
          trackEl.clientHeight,
          reactData.yThumbHeight,
        ),
        behavior: 'auto',
      });
    };

    const pointerdownThumbXEvent = (evnt: PointerEvent) => {
      const thumbEl = evnt.currentTarget as HTMLDivElement;
      internalData.isThumbDrag = true;
      thumbEl.setPointerCapture(evnt.pointerId);
      const viewEl = refViewElem.value;
      if (!viewEl) {
        return;
      }
      const trackEl = thumbEl.parentElement as HTMLDivElement;
      const trackRect = trackEl.getBoundingClientRect();
      const pointerPosition = evnt.clientX - trackRect.left;
      internalData.thumbDragOffset =
        pointerPosition -
        getThumbOffsetSize(
          viewEl.scrollLeft,
          viewEl.clientWidth,
          viewEl.scrollWidth,
          trackEl.clientWidth,
          reactData.xThumbWidth,
        );
    };

    const pointermoveThumbXEvent = (evnt: PointerEvent) => {
      const thumbEl = evnt.currentTarget as HTMLDivElement;
      if (!thumbEl.hasPointerCapture(evnt.pointerId)) {
        return;
      }
      if (internalData.isThumbDrag) {
        const viewEl = refViewElem.value;
        if (!viewEl) {
          return;
        }
        const trackEl = thumbEl.parentElement as HTMLDivElement;
        const trackRect = trackEl.getBoundingClientRect();
        viewEl.scrollLeft = getScrollFromDrag(
          evnt.clientX - trackRect.left,
          internalData.thumbDragOffset,
          viewEl.clientWidth,
          viewEl.scrollWidth,
          trackEl.clientWidth,
          reactData.xThumbWidth,
        );
      }
    };

    const pointerdownThumbYEvent = (evnt: PointerEvent) => {
      const thumbEl = evnt.currentTarget as HTMLDivElement;
      internalData.isThumbDrag = true;
      thumbEl.setPointerCapture(evnt.pointerId);
      const viewEl = refViewElem.value;
      if (!viewEl) {
        return;
      }
      const trackEl = thumbEl.parentElement as HTMLDivElement;
      const trackRect = trackEl.getBoundingClientRect();
      const pointerPosition = evnt.clientY - trackRect.top;
      internalData.thumbDragOffset =
        pointerPosition -
        getThumbOffsetSize(
          viewEl.scrollTop,
          viewEl.clientHeight,
          viewEl.scrollHeight,
          trackEl.clientHeight,
          reactData.yThumbHeight,
        );
    };

    const pointermoveThumbYEvent = (evnt: PointerEvent) => {
      const thumbEl = evnt.currentTarget as HTMLDivElement;
      if (!thumbEl.hasPointerCapture(evnt.pointerId)) {
        return;
      }
      if (internalData.isThumbDrag) {
        const viewEl = refViewElem.value;
        if (!viewEl) {
          return;
        }
        const trackEl = thumbEl.parentElement as HTMLDivElement;
        const trackRect = trackEl.getBoundingClientRect();
        viewEl.scrollTop = getScrollFromDrag(
          evnt.clientY - trackRect.top,
          internalData.thumbDragOffset,
          viewEl.clientHeight,
          viewEl.scrollHeight,
          trackEl.clientHeight,
          reactData.yThumbHeight,
        );
      }
    };

    const clearPointerThumbEvent = (evnt: PointerEvent) => {
      const thumbEl = evnt.currentTarget as HTMLDivElement;
      if (thumbEl.hasPointerCapture(evnt.pointerId)) {
        thumbEl.releasePointerCapture(evnt.pointerId);
      }
      internalData.isThumbDrag = false;
    };

    const scrollbarMethods: AsScrollbarMethods = {
      clearScroll() {
        const viewEl = refViewElem.value;
        if (viewEl) {
          viewEl.scrollTop = 0;
          viewEl.scrollLeft = 0;
        }
      },
      dispatchEvent(type, params, evnt) {
        dispatchEvent(type as 'scroll' | 'scroll-boundary', params, evnt);
      },
      getScrollLeft() {
        return refViewElem.value ? refViewElem.value.scrollLeft : 0;
      },
      getScrollTop() {
        return refViewElem.value ? refViewElem.value.scrollTop : 0;
      },
      getScrollViewElem() {
        return refViewElem.value;
      },
      getScrollViewInnerElem() {
        return refViewInnerElem.value;
      },
      recalculate,
      scrollIntoView() {
        refViewElem.value?.scrollIntoView();
      },
      scrollTo(left: number | ScrollToOptions, top?: number) {
        const viewEl = refViewElem.value;
        if (viewEl) {
          if (typeof left === 'number') {
            viewEl.scrollTo(left, top || 0);
          } else {
            viewEl.scrollTo(left);
          }
        }
      },
      setScrollLeft(left: number) {
        if (refViewElem.value) {
          refViewElem.value.scrollLeft = left;
        }
      },
      setScrollTop(top: number) {
        if (refViewElem.value) {
          refViewElem.value.scrollTop = top;
        }
      },
    };

    Object.assign(scrollbar, scrollbarMethods);
    expose(scrollbarMethods);

    const reFlag = ref(0);

    watch(
      [
        () => props.height,
        () => props.width,
        () => props.minHeight,
        () => props.minWidth,
        () => props.maxHeight,
        () => props.maxWidth,
        () => props.native,
        computeYWidth,
        computeXHeight,
      ],
      () => {
        reFlag.value++;
      },
    );

    watch([computeXVisible, computeYVisible], () => {
      nextTick(() => {
        reFlag.value++;
      });
    });

    watch(reFlag, () => {
      recalculate().then(() => recalculate());
    });

    onMounted(() => {
      reFlag.value++;
      globalEvents.on(scrollbar, 'resize', () => {
        reFlag.value++;
      });
    });

    onBeforeUnmount(() => {
      globalEvents.off(scrollbar, 'resize');
    });

    return () => {
      const {
        className: attrsClassName,
        style: attrsStyle,
        restAttrs,
      } = getAttrStyleAndClass(attrs);
      return (
        <div
          {...restAttrs}
          class={clsx(
            wrapperCls.value,
            contextClassName.value,
            props.rootClass,
            hashId.value,
            cssVarCls.value,
            rootCls.value,
            attrsClassName,
          )}
          id={props.id as string}
          ref={refElem}
          style={[wrapperStyle.value, contextStyle.value, attrsStyle]}
        >
          <div
            class={clsx(`${prefixCls.value}-view`, props.viewClassName)}
            id={props.viewId as string}
            onScroll={scrollEvent}
            ref={refViewElem}
            style={props.viewStyle as CSSProperties}
            {...props.viewAttrs}
          >
            <div
              class={clsx(
                `${prefixCls.value}-view-inner`,
                props.viewInnerClassName,
              )}
              ref={refViewInnerElem}
            >
              {slots.default?.({})}
            </div>
          </div>
          {!props.native && computeXVisible.value !== false && (
            <div
              class={`${prefixCls.value}-track-x`}
              onClick={clickTrackXEvent}
              ref={refTrackXElem}
            >
              <div
                class={`${prefixCls.value}-thumb-x`}
                onLostpointercapture={clearPointerThumbEvent}
                onPointercancel={clearPointerThumbEvent}
                onPointerdown={pointerdownThumbXEvent}
                onPointermove={pointermoveThumbXEvent}
                onPointerup={clearPointerThumbEvent}
                ref={refThumbXElem}
              />
            </div>
          )}
          {!props.native && computeYVisible.value !== false && (
            <div
              class={`${prefixCls.value}-track-y`}
              onClick={clickTrackYEvent}
              ref={refTrackYElem}
            >
              <div
                class={`${prefixCls.value}-thumb-y`}
                onLostpointercapture={clearPointerThumbEvent}
                onPointercancel={clearPointerThumbEvent}
                onPointerdown={pointerdownThumbYEvent}
                onPointermove={pointermoveThumbYEvent}
                onPointerup={clearPointerThumbEvent}
                ref={refThumbYElem}
              />
            </div>
          )}
          {props.loading && (
            <div class={`${prefixCls.value}-loading`}>
              <Spin size={spinSize.value} />
            </div>
          )}
        </div>
      );
    };
  },
  {
    name: 'AsScrollbar',
    inheritAttrs: false,
    emits: ['scroll', 'scroll-boundary'],
  },
);

(Scrollbar as any).install = (app: App) => {
  app.component(Scrollbar.name, Scrollbar);
};

export default Scrollbar;

export type {
  AsScrollbarComponent,
  AsScrollbarConstructor,
  AsScrollbarDefines,
  AsScrollbarEmits,
  AsScrollbarEventProps,
  AsScrollbarEvents,
  AsScrollbarInstance,
  AsScrollbarMethods,
  AsScrollbarProps,
  AsScrollbarPropTypes,
  AsScrollbarSlots,
} from './scrollbar';

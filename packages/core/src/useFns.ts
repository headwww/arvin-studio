import type { ComputedRef, Ref } from 'vue';

// oxlint-disable oxc/const-comparisons
import { computed, inject, provide, ref } from 'vue';

import { isBoolean } from '@arvin-studio/kit';

import { scrollbarUtils } from './scrollbar-utils';

/**
 * 组件虚拟滚动条
 */
export type AsComponentIsVScrollbar = boolean | null;

export interface AsUseVScrollbarResult {
  computeIsVScrollbar: ComputedRef<AsComponentIsVScrollbar>;
}
export type AsUseVScrollbar = (props: {
  useScrollbar?: AsComponentIsVScrollbar;
}) => AsUseVScrollbarResult;

export interface AsUseInitVScrollbarReactData {
  xThumbWidth: number;
  yThumbHeight: number;
}
export interface AsUseInitVScrollbarInternalData {
  isThumbDrag?: boolean;
  lastScrollLeft: number;
  lastScrollTop: number;
  scrollObserver?: ResizeObserver;
  thumbDragOffset: number;
  xThumbLeft: number;
  yThumbTop: number;
}
export interface AsUseInitVScrollbarResult {
  /**
   * 内部方法
   * @private
   */
  cleatPointerThumbEvent(evnt: PointerEvent): void;
  /**
   * 内部方法
   * @private
   */
  clickTrackXEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  clickTrackYEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  pointerdownThumbXEvent(evnt: PointerEvent): void;
  /**
   * 内部方法
   * @private
   */
  pointerdownThumbYEvent(evnt: PointerEvent): void;
  /**
   * 内部方法
   * @private
   */
  pointermoveThumbXEvent(evnt: PointerEvent): void;
  /**
   * 内部方法
   * @private
   */
  pointermoveThumbYEvent(evnt: PointerEvent): void;
  /**
   * 内部方法
   * @private
   */
  updateThumbOffset(): void;
  /**
   * 内部方法
   * @private
   */
  updateThumbSize(): void;
}

export type AsUseInitVScrollbar = ($xeVM: {
  getScrollViewElem(): HTMLElement | null | undefined;
  internalData: AsUseInitVScrollbarInternalData;
  reactData: AsUseInitVScrollbarReactData;
  xID: string;
}) => AsUseInitVScrollbarResult & {
  refThumbXElem: Ref<HTMLDivElement | undefined>;
  refThumbYElem: Ref<HTMLDivElement | undefined>;
  refTrackXElem: Ref<HTMLDivElement | undefined>;
  refTrackYElem: Ref<HTMLDivElement | undefined>;
};

/**
 * 通用方法
 */
export interface AsGlobalUseFns {
  useInitVScrollbar: AsUseInitVScrollbar;
  useVScrollbar: AsUseVScrollbar;
}

const {
  getThumbOffsetSize,
  getThumbSize,
  getScrollFromClick,
  getScrollFromDrag,
} = scrollbarUtils;

/**
 * 虚拟滚动条是否启用
 * @param props
 * @returns
 */
export function useVScrollbar(props: {
  useScrollbar?: AsComponentIsVScrollbar;
}): AsUseVScrollbarResult {
  const xeScrollbarInfo = inject(
    'xeScrollbarInfo',
    null as ComputedRef<AsComponentIsVScrollbar> | null,
  );
  const computeIsVScrollbar = computed(() => {
    const { useScrollbar } = props;
    return isBoolean(useScrollbar)
      ? useScrollbar
      : xeScrollbarInfo
        ? xeScrollbarInfo.value
        : null;
  });
  provide('xeScrollbarInfo', computeIsVScrollbar);

  return { computeIsVScrollbar };
}

/**
 * 初始化虚拟滚动条
 * @param reactData
 * @param internalData
 * @param refViewElem
 * @returns
 */
export const useInitVScrollbar: AsUseInitVScrollbar = (
  $asVM,
): AsUseInitVScrollbarResult & {
  refThumbXElem: Ref<HTMLDivElement | undefined>;
  refThumbYElem: Ref<HTMLDivElement | undefined>;
  refTrackXElem: Ref<HTMLDivElement | undefined>;
  refTrackYElem: Ref<HTMLDivElement | undefined>;
} => {
  const { reactData, internalData } = $asVM;

  const refTrackXElem = ref<HTMLDivElement>();
  const refTrackYElem = ref<HTMLDivElement>();
  const refThumbXElem = ref<HTMLDivElement>();
  const refThumbYElem = ref<HTMLDivElement>();

  const updateThumbSize = () => {
    const viewEl = $asVM.getScrollViewElem();
    if (!viewEl) {
      return;
    }
    if (!viewEl.clientHeight || !viewEl.clientHeight) {
      return;
    }
    const trackXEl = refTrackXElem.value;
    const xThumbWidth = trackXEl
      ? getThumbSize(
          viewEl.clientWidth,
          viewEl.scrollWidth,
          trackXEl.clientWidth,
        )
      : 0;
    const thumbXElem = refThumbXElem.value;
    if (thumbXElem) {
      thumbXElem.style.width = `${xThumbWidth}px`;
    }
    reactData.xThumbWidth = xThumbWidth;

    const trackYEl = refTrackYElem.value;

    const yThumbHeight = trackYEl
      ? getThumbSize(
          viewEl.clientHeight,
          viewEl.scrollHeight,
          trackYEl.clientHeight,
        )
      : 0;
    const thumbYElem = refThumbYElem.value;
    if (thumbYElem) {
      thumbYElem.style.height = `${yThumbHeight}px`;
    }
    reactData.yThumbHeight = yThumbHeight;
  };

  const updateThumbOffset = () => {
    const viewEl = $asVM.getScrollViewElem();
    if (!viewEl) {
      return;
    }
    if (!viewEl.clientHeight || !viewEl.clientHeight) {
      return;
    }
    const { xThumbWidth, yThumbHeight } = reactData;
    const trackXEl = refTrackXElem.value;
    const thumbXElem = refThumbXElem.value;
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
    if (thumbXElem && xThumbWidth) {
      thumbXElem.style.width = `${xThumbWidth}px`;
      thumbXElem.style.transform = `translateX(${xThumbLeft}px)`;
    }

    const trackYEl = refTrackYElem.value;
    const thumbYElem = refThumbYElem.value;
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
    if (thumbYElem && yThumbHeight) {
      thumbYElem.style.height = `${yThumbHeight}px`;
      thumbYElem.style.transform = `translateY(${yThumbTop}px)`;
    }
  };

  const clickTrackXEvent = (evnt: MouseEvent) => {
    const trackEl = evnt.currentTarget as HTMLDivElement;
    if (trackEl !== evnt.target) {
      return;
    }
    const viewEl = $asVM.getScrollViewElem();
    if (!viewEl) {
      return;
    }
    const { xThumbWidth } = reactData;
    const trackRect = trackEl.getBoundingClientRect();
    viewEl.scrollTo({
      left: getScrollFromClick(
        evnt.clientX - trackRect.left,
        viewEl.clientWidth,
        viewEl.scrollWidth,
        trackEl.clientWidth,
        xThumbWidth,
      ),
      behavior: 'auto',
    });
  };

  const clickTrackYEvent = (evnt: MouseEvent) => {
    const trackEl = evnt.currentTarget as HTMLDivElement;
    if (trackEl !== evnt.target) {
      return;
    }
    const viewEl = $asVM.getScrollViewElem();
    if (!viewEl) {
      return;
    }
    const { yThumbHeight } = reactData;
    const trackRect = trackEl.getBoundingClientRect();
    viewEl.scrollTo({
      top: getScrollFromClick(
        evnt.clientY - trackRect.top,
        viewEl.clientHeight,
        viewEl.scrollHeight,
        trackEl.clientHeight,
        yThumbHeight,
      ),
      behavior: 'auto',
    });
  };

  const pointerdownThumbXEvent = (evnt: PointerEvent) => {
    const thumbEl = evnt.currentTarget as HTMLDivElement;
    internalData.isThumbDrag = true;
    thumbEl.setPointerCapture(evnt.pointerId);

    const viewEl = $asVM.getScrollViewElem();
    if (!viewEl) {
      return;
    }
    const { xThumbWidth } = reactData;
    const trackEl = thumbEl.parentElement as HTMLDivElement;
    const trackRect = trackEl.getBoundingClientRect();
    const pointerPosition = evnt.clientX - trackRect.left;
    // 记录 thumb 的偏移
    const thumbOffset = getThumbOffsetSize(
      viewEl.scrollLeft,
      viewEl.clientWidth,
      viewEl.scrollWidth,
      trackEl.clientWidth,
      xThumbWidth,
    );
    internalData.thumbDragOffset = pointerPosition - thumbOffset;
  };

  const pointermoveThumbXEvent = (evnt: PointerEvent) => {
    const thumbEl = evnt.currentTarget as HTMLDivElement;
    if (!thumbEl.hasPointerCapture(evnt.pointerId)) {
      return;
    }
    const { isThumbDrag, thumbDragOffset } = internalData;
    if (isThumbDrag) {
      const viewEl = $asVM.getScrollViewElem();
      if (!viewEl) {
        return;
      }
      const { xThumbWidth } = reactData;
      const thumbEl = evnt.currentTarget as HTMLDivElement;
      const trackEl = thumbEl.parentElement as HTMLDivElement;
      const trackRect = trackEl.getBoundingClientRect();
      // 更新偏移
      viewEl.scrollLeft = getScrollFromDrag(
        evnt.clientX - trackRect.left,
        thumbDragOffset,
        viewEl.clientWidth,
        viewEl.scrollWidth,
        trackEl.clientWidth,
        xThumbWidth,
      );
    }
  };

  const cleatPointerThumbEvent = (evnt: PointerEvent) => {
    const thumbEl = evnt.currentTarget as HTMLDivElement;
    thumbEl.releasePointerCapture(evnt.pointerId);
    internalData.isThumbDrag = false;
  };

  const pointerdownThumbYEvent = (evnt: PointerEvent) => {
    const thumbEl = evnt.currentTarget as HTMLDivElement;
    internalData.isThumbDrag = true;
    thumbEl.setPointerCapture(evnt.pointerId);

    const viewEl = $asVM.getScrollViewElem();
    if (!viewEl) {
      return;
    }
    const { yThumbHeight } = reactData;
    const trackEl = thumbEl.parentElement as HTMLDivElement;
    const trackRect = trackEl.getBoundingClientRect();
    const pointerPosition = evnt.clientY - trackRect.top;
    // 记录 thumb 的偏移
    const thumbOffset = getThumbOffsetSize(
      viewEl.scrollTop,
      viewEl.clientHeight,
      viewEl.scrollHeight,
      trackEl.clientHeight,
      yThumbHeight,
    );
    internalData.thumbDragOffset = pointerPosition - thumbOffset;
  };

  const pointermoveThumbYEvent = (evnt: PointerEvent) => {
    const thumbEl = evnt.currentTarget as HTMLDivElement;
    if (!thumbEl.hasPointerCapture(evnt.pointerId)) {
      return;
    }
    const { isThumbDrag, thumbDragOffset } = internalData;
    if (isThumbDrag) {
      const viewEl = $asVM.getScrollViewElem();
      if (!viewEl) {
        return;
      }
      const { yThumbHeight } = reactData;
      const thumbEl = evnt.currentTarget as HTMLDivElement;
      const trackEl = thumbEl.parentElement as HTMLDivElement;
      const trackRect = trackEl.getBoundingClientRect();
      // 更新偏移
      viewEl.scrollTop = getScrollFromDrag(
        evnt.clientY - trackRect.top,
        thumbDragOffset,
        viewEl.clientHeight,
        viewEl.scrollHeight,
        trackEl.clientHeight,
        yThumbHeight,
      );
    }
  };

  return {
    refTrackXElem,
    refTrackYElem,
    refThumbXElem,
    refThumbYElem,
    updateThumbSize,
    updateThumbOffset,
    clickTrackXEvent,
    clickTrackYEvent,
    pointerdownThumbXEvent,
    pointermoveThumbXEvent,
    cleatPointerThumbEvent,
    pointerdownThumbYEvent,
    pointermoveThumbYEvent,
  };
};

export const useFns = {
  useVScrollbar,
  useInitVScrollbar,
};

export interface AsScrollbarUtils {
  /**
   * 根据点击轨道的位置，计算滑块的偏移位置
   * @param clickPosition
   * @param viewportSize
   * @param contentSize
   * @param trackSize
   * @param thumbSize
   */
  getScrollFromClick(
    clickPosition: number,
    viewportSize: number,
    contentSize: number,
    trackSize: number,
    thumbSize: number,
  ): number;
  /**
   * 拖拽 thumb 时，根据鼠标位置计算滑块的偏移位置
   * @param pointerPosition
   * @param dragOffset
   * @param viewportSize
   * @param contentSize
   * @param trackSize
   * @param thumbSize
   */
  getScrollFromDrag(
    pointerPosition: number,
    dragOffset: number,
    viewportSize: number,
    contentSize: number,
    trackSize: number,
    thumbSize: number,
  ): number;
  /**
   * 计算滚动条滑块的偏移位置
   * @param offsetSize
   * @param viewportSize
   * @param contentSize
   * @param trackSize
   * @param thumbSize
   */
  getThumbOffsetSize(
    offsetSize: number,
    viewportSize: number,
    contentSize: number,
    trackSize: number,
    thumbSize: number,
  ): number;
  /**
   * 计算滚动条滑块的长度
   * @param viewportSize
   * @param contentSize
   * @param trackSize
   */
  getThumbSize(
    viewportSize: number,
    contentSize: number,
    trackSize: number,
  ): number;
}

export const scrollbarUtils: AsScrollbarUtils = {
  /**
   * 计算滚动条滑块的长度
   */
  getThumbSize(viewportSize: number, contentSize: number, trackSize: number) {
    if (contentSize <= viewportSize) {
      return 0;
    }
    const ratio = viewportSize / contentSize;
    const ideal = trackSize * ratio;
    return Math.max(20, Math.min(ideal, trackSize));
  },
  /**
   * 计算滚动条滑块的偏移位置
   */
  getThumbOffsetSize(
    offsetSize: number,
    viewportSize: number,
    contentSize: number,
    trackSize: number,
    thumbSize: number,
  ) {
    const maxScroll = contentSize - viewportSize;
    if (maxScroll <= 0) {
      return 0;
    }
    const maxThumbOffset = trackSize - thumbSize;
    if (maxThumbOffset <= 0) {
      return 0;
    }
    const clamped = Math.min(Math.max(offsetSize, 0), maxScroll);
    const ratio = clamped / maxScroll;
    return ratio * maxThumbOffset;
  },
  /**
   * 根据点击轨道的位置，计算滑块的偏移位置
   */
  getScrollFromClick(
    clickPosition: number,
    viewportSize: number,
    contentSize: number,
    trackSize: number,
    thumbSize: number,
  ) {
    const maxThumbOffset = trackSize - thumbSize;
    const maxScroll = contentSize - viewportSize;
    if (maxScroll <= 0 || maxThumbOffset <= 0) {
      return 0;
    }
    let thumbOffset = clickPosition - thumbSize / 2;
    thumbOffset = Math.min(Math.max(thumbOffset, 0), maxThumbOffset);
    const scrollOffset = (thumbOffset / maxThumbOffset) * maxScroll;
    return scrollOffset;
  },
  /**
   * 拖拽 thumb 时，根据鼠标位置计算滑块的偏移位置
   */
  getScrollFromDrag(
    pointerPosition: number,
    dragOffset: number,
    viewportSize: number,
    contentSize: number,
    trackSize: number,
    thumbSize: number,
  ) {
    const maxScroll = contentSize - viewportSize;
    const maxThumbOffset = trackSize - thumbSize;
    if (maxScroll <= 0 || maxThumbOffset <= 0) {
      return 0;
    }
    let thumbOffset = pointerPosition - dragOffset;
    thumbOffset = Math.min(Math.max(thumbOffset, 0), maxThumbOffset);
    return (thumbOffset / maxThumbOffset) * maxScroll;
  },
};

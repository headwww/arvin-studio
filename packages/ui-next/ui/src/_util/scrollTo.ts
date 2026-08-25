import { raf } from '@arvin-studio/headless';

import { easeInOutCubic } from './easings';
import getScroll, { isWindow } from './getScroll';

interface ScrollToOptions {
  /** Scroll end callback */
  callback?: () => void;
  /** Animation duration, default as 450 */
  duration?: number;
  /** Scroll container, default as window */
  getContainer?: () => Document | HTMLElement | Window;
}

export default function scrollTo(y: number, options: ScrollToOptions = {}) {
  const { getContainer = () => window, callback, duration = 450 } = options;
  const container = getContainer();
  const scrollTop = getScroll(container);
  const startTime = Date.now();

  const frameFunc = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScrollTop = easeInOutCubic(
      Math.min(time, duration),
      scrollTop,
      y,
      duration,
    );
    if (isWindow(container)) {
      (container as Window).scrollTo(window.pageXOffset, nextScrollTop);
    } else if (
      container instanceof Document ||
      container.constructor.name === 'HTMLDocument'
    ) {
      (container as Document).documentElement.scrollTop = nextScrollTop;
    } else {
      (container as HTMLElement).scrollTop = nextScrollTop;
    }
    if (time < duration) {
      raf(frameFunc);
    } else if (typeof callback === 'function') {
      callback();
    }
  };
  raf(frameFunc);
}

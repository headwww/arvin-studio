import { remove } from '@arvin-studio/kit';

export interface AsGlobalResize {
  create(callback: (...args: any[]) => void): ResizeObserver;
}

/**
 * 监听 resize 事件
 * 如果项目中已使用了 resize-observer-polyfill，那么只需要将方法定义全局，该组件就会自动使用
 */
let resizeTimeout: any;

const eventStore: ASResizeObserver[] = [];
const defaultInterval = 500;

function eventHandle() {
  if (eventStore.length === 0) {
    return;
  }

  eventStore.forEach((item) => {
    item.tarList.forEach((observer) => {
      const { target, width, heighe } = observer;
      const clientWidth = target.clientWidth;
      const clientHeight = target.clientHeight;
      const rWidth = clientWidth && width !== clientWidth;
      const rHeight = clientHeight && heighe !== clientHeight;
      if (rWidth || rHeight) {
        observer.width = clientWidth;
        observer.heighe = clientHeight;
        setTimeout(item.callback, 0);
      }
    });
  });

  eventListener();
}

function eventListener() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(eventHandle, defaultInterval);
}

class ASResizeObserver {
  callback: (...args: any[]) => void;

  tarList: {
    heighe: number;
    target: Element;
    width: number;
  }[] = [];

  constructor(callback: (...args: any[]) => void) {
    this.callback = callback;
  }

  disconnect(): void {
    remove(eventStore, (item) => item === this);
  }

  observe(target: Element): void {
    if (!target) {
      return;
    }

    const { tarList } = this;
    if (tarList.every((observer) => observer.target !== target)) {
      tarList.push({
        target,
        width: target.clientWidth,
        heighe: target.clientHeight,
      });
    }
    if (eventStore.length === 0) {
      eventListener();
    }
    if (eventStore.every((item) => item !== this)) {
      eventStore.push(this);
    }
  }

  unobserve(target: Element): void {
    remove(eventStore, (item) =>
      item.tarList.some((observer) => observer.target === target),
    );
  }
}

export const globalResize: AsGlobalResize = {
  create(callback: (...args: any[]) => void) {
    if (window.ResizeObserver) {
      return new window.ResizeObserver(callback);
    }
    return new ASResizeObserver(callback);
  },
};

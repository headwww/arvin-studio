import { arrayEach } from '@arvin-studio/kit';

import { addClass, removeClass } from './dom';

const rowMoveCls = 'row--drag-move';
const colMoveClass = 'col--drag-move';

/**
 * 上下拖拽
 */
export function moveRowAnimateToTb(
  elemList: HTMLDivElement[] | NodeListOf<HTMLElement>,
  offsetTop: number,
) {
  arrayEach(elemList, (trEl) => {
    trEl.style.transform = `translateY(${offsetTop}px)`;
  });
  requestAnimationFrame(() => {
    arrayEach(elemList, (trEl) => {
      addClass(trEl, rowMoveCls);
      trEl.style.transform = '';
    });
  });
}

export function clearRowAnimate(elem: HTMLElement | undefined, clss: string[]) {
  setTimeout(() => {
    if (elem) {
      arrayEach(
        elem.querySelectorAll(
          clss.map((cls) => `${cls}.${rowMoveCls}`).join(','),
        ),
        (elem) => removeClass(elem, rowMoveCls),
      );
    }
  }, 500);
}

/**
 * 左右拖拽
 */
export function moveColAnimateToLr(
  elemList: HTMLDivElement[] | NodeListOf<HTMLElement>,
  offsetLeft: number,
) {
  arrayEach(elemList, (trEl) => {
    trEl.style.transform = `translateX(${offsetLeft}px)`;
  });
  requestAnimationFrame(() => {
    arrayEach(elemList, (trEl) => {
      addClass(trEl, colMoveClass);
      trEl.style.transform = '';
    });
  });
}

export function clearColAnimate(elem: HTMLElement | undefined, clss: string[]) {
  setTimeout(() => {
    if (elem) {
      arrayEach(
        elem.querySelectorAll(
          clss.map((cls) => `${cls}.${colMoveClass}`).join(','),
        ),
        (elem) => removeClass(elem, colMoveClass),
      );
    }
  }, 500);
}

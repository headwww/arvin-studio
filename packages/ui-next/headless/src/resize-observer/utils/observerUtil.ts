import ResizeObserver from 'resize-observer-polyfill';

export type ResizeListener = (element: Element) => void;

// =============================== Const ===============================
const elementListeners = new Map<Element, Set<ResizeListener>>();

function onResize(entities: ResizeObserverEntry[]) {
  entities.forEach((entity) => {
    const { target } = entity;
    elementListeners.get(target)?.forEach((listener) => listener(target));
  });
}

// Note: ResizeObserver polyfill not support option to measure border-box resize
const resizeObserver = new ResizeObserver(onResize);

// Dev env only

export const _el =
  // @ts-expect-error this is a global variable which injected by babel plugin
  // eslint-disable-next-line n/prefer-global/process
  process.env.NODE_ENV === 'production' ? null : elementListeners;
// @ts-expect-error this is a global variable which injected by babel plugin
// eslint-disable-next-line n/prefer-global/process
export const _rs = process.env.NODE_ENV === 'production' ? null : onResize;

// ============================== Observe ==============================
export function observe(element: Element, callback: ResizeListener) {
  if (!elementListeners.has(element)) {
    elementListeners.set(element, new Set());
    resizeObserver.observe(element);
  }
  elementListeners?.get?.(element)?.add?.(callback);
}

export function unobserve(element: Element, callback: ResizeListener) {
  if (!elementListeners.has(element)) {
    return;
  }

  elementListeners?.get?.(element)?.delete?.(callback);
  if (!elementListeners?.get?.(element)?.size) {
    resizeObserver.unobserve(element);
    elementListeners.delete(element);
  }
}

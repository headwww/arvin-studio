import type { CSSProperties, VNode } from 'vue';

import type { Key } from '../util';

export type RenderFunc<T> = (
  item: T,
  index: number,
  props: { offsetX: number; style: CSSProperties },
) => VNode;

export interface SharedConfig<T> {
  getKey: (item: T) => Key;
}

export type GetKey<T> = (item: T) => Key;

export type GetSize = (
  startKey: Key,
  endKey?: Key,
) => { bottom: number; top: number };

export interface ExtraRenderInfo {
  /** Virtual list end line */
  end: number;
  getSize: GetSize;
  /** Used for `scrollWidth` tell the horizontal offset */
  offsetX: number;
  offsetY: number;
  rtl: boolean;
  /**
   * Current vertical scrollTop of the holder element.
   * holder 元素当前真实的纵向 `scrollTop`，表示视口滚动到了哪里。
   */
  scrollTop: number;

  /** Virtual list start line */
  start: number;

  /** Is current in virtual render */
  virtual: boolean;
}

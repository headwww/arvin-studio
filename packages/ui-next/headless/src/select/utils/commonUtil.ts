import type { VueNode } from '../../util';
import type { DisplayValueType } from '../interface';

export function toArray<T>(value: null | T | T[] | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function isTitleType(title: any) {
  return ['number', 'string'].includes(typeof title);
}

export function injectPropsWithOption(option: any): any {
  return { ...option };
}

export function toVueNode(value: VueNode | VueNode[]): VueNode[] {
  return toArray(value);
}

export function getTitle(item: DisplayValueType): string | undefined {
  let title: string | undefined;
  if (item) {
    if (isTitleType(item.title)) {
      title = (item as any).title.toString();
    } else if (isTitleType(item.label)) {
      title = (item as any).label.toString();
    }
  }

  return title;
}

export const isClient =
  typeof window !== 'undefined' &&
  window.document &&
  window.document.documentElement;

/** Is client side and not jsdom */
export const isBrowserClient =
  // @ts-expect-error fix this
  // eslint-disable-next-line n/prefer-global/process
  typeof process !== 'undefined' &&
  // @ts-expect-error fix this
  // eslint-disable-next-line n/prefer-global/process
  process.env?.NODE_ENV !== 'test' &&
  isClient;

export function hasValue(value: any): boolean {
  return value !== undefined && value !== null;
}

/** combo mode no value judgment function */
export function isComboNoValue(value: any): boolean {
  return !value && value !== 0;
}

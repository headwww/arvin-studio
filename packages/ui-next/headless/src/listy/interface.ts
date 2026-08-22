import type { CSSProperties } from 'vue';

import type { Key, VueNode } from '../util';

export type RowKey<T> = ((item: T) => Key) | keyof T;

export type ScrollAlign = 'auto' | 'bottom' | 'top';

export type ListySemanticName = 'groupHeader' | 'item' | 'root';

export type ListyClassNames = Partial<Record<ListySemanticName, string>>;

export type ListyStyles = Partial<Record<ListySemanticName, CSSProperties>>;

export interface GroupScrollToConfig {
  align?: ScrollAlign;
  groupKey: string;
  offset?: number;
}

export interface KeyScrollToConfig {
  align?: ScrollAlign;
  key: string;
  offset?: number;
}

export interface PositionScrollToConfig {
  left?: number;
  top?: number;
}

export type ListyScrollToConfig =
  | GroupScrollToConfig
  | KeyScrollToConfig
  | null
  | number
  | PositionScrollToConfig;

export interface ListyRef {
  scrollTo: (config?: ListyScrollToConfig) => void;
}

export interface Group {
  key: ((item: any) => Key) | Key;
  title: (groupKey: Key, items: any[]) => VueNode;
}

export interface ListyProps {
  classNames?: ListyClassNames;
  direction?: 'ltr' | 'rtl';
  group?: Group;
  height?: number;
  itemHeight?: number;
  itemRender?: (item: any, index: number) => VueNode;
  items?: any[];
  onScroll?: (e: Event) => void;
  prefixCls?: string;
  rowKey: RowKey<any>;
  sticky?: boolean;
  styles?: ListyStyles;
  virtual?: boolean;
}

export interface ListComponentProps {
  classNames?: ListyClassNames;
  data: any[];
  direction?: 'ltr' | 'rtl';
  group?: Group;
  height?: number;
  itemHeight?: number;
  itemRender: (item: any, index: number) => VueNode;
  onScroll?: (e: Event) => void;
  prefixCls: string;
  rowKey: RowKey<any>;
  sticky?: boolean;
  styles?: ListyStyles;
}

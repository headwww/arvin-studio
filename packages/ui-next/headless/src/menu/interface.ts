import type { CSSProperties } from 'vue';

import type { Key, VueNode } from '../util';
import type { SubMenuProps } from './SubMenu';

// ========================= Options =========================
interface ItemSharedProps {
  class?: string;
  // ref?: React.Ref<HTMLLIElement | null>
  style?: CSSProperties;
}

export interface SubMenuType extends ItemSharedProps {
  children: ItemType[];

  disabled?: boolean;

  expandIcon?: RenderIconType;

  // >>>>> Icon
  itemIcon?: RenderIconType;

  key: string;

  label?: VueNode;

  // >>>>> Events
  onClick?: MenuClickEventHandler;

  // >>>>> Active
  onMouseEnter?: MenuHoverEventHandler;
  onMouseLeave?: MenuHoverEventHandler;

  onTitleClick?: (info: MenuTitleInfo) => void;
  onTitleMouseEnter?: MenuHoverEventHandler;

  onTitleMouseLeave?: MenuHoverEventHandler;
  // >>>>> Popup
  popupClassName?: string;
  popupOffset?: number[];
  popupRender?: PopupRender;

  popupStyle?: CSSProperties;
  rootClass?: string;
  title?: string;
  type?: 'submenu';
}

export interface MenuItemType extends ItemSharedProps {
  disabled?: boolean;

  extra?: VueNode;

  itemIcon?: RenderIconType;

  key: Key;

  label?: VueNode;

  // >>>>> Events
  onClick?: MenuClickEventHandler;

  // >>>>> Active
  onMouseEnter?: MenuHoverEventHandler;
  onMouseLeave?: MenuHoverEventHandler;

  type?: 'item';
}

/** Info item type passed to onSelect/onClick callbacks, excluding event handlers */
export interface ItemData {
  extra?: VueNode;
  itemIcon?: RenderIconType;
  key: Key;
  label?: VueNode;
  title?: string;
}

export interface MenuItemGroupType extends ItemSharedProps {
  children?: ItemType[];

  label?: VueNode;

  type: 'group';
}

export interface MenuDividerType extends ItemSharedProps {
  type: 'divider';
}

export type ItemType =
  | MenuDividerType
  | MenuItemGroupType
  | MenuItemType
  | null
  | SubMenuType;

// ========================== Basic ==========================
export type MenuMode = 'horizontal' | 'inline' | 'vertical';

export type BuiltinPlacements = Record<string, any>;

export type TriggerSubMenuAction = 'click' | 'hover';

export interface RenderIconInfo {
  disabled?: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  isSubMenu?: boolean;
}

export type RenderIconType =
  | ((props: RenderIconInfo) => VueNode)
  | boolean
  | VueNode;

export interface MenuInfo {
  domEvent: MouseEvent;
  /** @deprecated This will not support in future. You should avoid to use this */
  item: VueNode;
  itemData: ItemData;
  key: string;
  keyPath: string[];
}

export interface MenuTitleInfo {
  domEvent: MouseEvent;
  key: string;
}

// ========================== Hover ==========================
export type MenuHoverEventHandler = (info: {
  domEvent: MouseEvent;
  key: string;
}) => void;

// ======================== Selection ========================
export interface SelectInfo extends MenuInfo {
  selectedKeys: string[];
}

export type SelectEventHandler = (info: SelectInfo) => void;

// ========================== Click ==========================
export type MenuClickEventHandler = (info: MenuInfo) => void;

export interface MenuRef {
  findItem: (params: { key: string }) => HTMLElement | null;
  /**
   * Focus active child if any, or the first child which is not disabled will be focused.
   * @param options
   */
  focus: (options?: FocusOptions) => void;
  list: HTMLUListElement;
}

// ======================== Component ========================
export type ComponentType = 'divider' | 'group' | 'item' | 'submenu';

export type Components = Partial<Record<ComponentType, any>>;

export type PopupRender = (
  node: any,
  info: { item: SubMenuProps & { key?: any }; keys: string[] },
) => VueNode;

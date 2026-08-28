import type {
  Key,
  MenuDividerType as VcMenuDividerType,
  MenuItemGroupType as VcMenuItemGroupType,
  MenuItemType as VcMenuItemType,
  SubMenuType as VcSubMenuType,
} from '@arvin-studio/headless';

export type DataAttributes = {
  [Key in `data-${string}`]: unknown;
};

export interface MenuItemType extends DataAttributes, VcMenuItemType {
  [key: string]: any;
  danger?: boolean;
  icon?: any;
  title?: string;
}

export interface SubMenuType<
  T extends MenuItemType = MenuItemType,
> extends Omit<VcSubMenuType, 'children'> {
  [key: string]: any;
  children: ItemType<T>[];
  icon?: any;
  theme?: 'dark' | 'light';
}

export interface MenuItemGroupType<
  T extends MenuItemType = MenuItemType,
> extends Omit<VcMenuItemGroupType, 'children'> {
  [key: string]: any;
  children?: ItemType<T>[];
  key?: Key;
}

export interface MenuDividerType extends VcMenuDividerType {
  dashed?: boolean;
  key?: Key;
}

export type ItemType<T extends MenuItemType = MenuItemType> =
  | MenuDividerType
  | MenuItemGroupType<T>
  | null
  | SubMenuType<T>
  | T;

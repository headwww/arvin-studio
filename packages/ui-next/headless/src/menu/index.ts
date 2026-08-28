import Divider from './Divider';
import Menu from './Menu';
import MenuItem from './MenuItem';
import MenuItemGroup from './MenuItemGroup';
import SubMenu from './SubMenu';

export {
  Divider,
  MenuItem as Item,
  MenuItemGroup as ItemGroup,
  MenuItem,
  MenuItemGroup,
  SubMenu,
  /** @private Only used for antd internal. Do not use in your production. */
};

type MenuType = typeof Menu & {
  Divider: typeof Divider;
  Item: typeof MenuItem;
  ItemGroup: typeof MenuItemGroup;
  SubMenu: typeof SubMenu;
};

const ExportMenu = Menu as MenuType;

ExportMenu.Item = MenuItem;
ExportMenu.SubMenu = SubMenu;
ExportMenu.ItemGroup = MenuItemGroup;
ExportMenu.Divider = Divider;

export default ExportMenu;

export { ExportMenu };

export { useFullPath } from './context/PathContext';
export {
  type MenuClickEventHandler,
  type MenuDividerType,
  type MenuInfo,
  type MenuItemGroupType,
  type MenuItemType,
  type MenuRef,
  type RenderIconInfo,
  type SelectEventHandler,
  type SelectInfo,
  type SubMenuType,
} from './interface';
export { type MenuProps } from './Menu';
export { type MenuItemProps } from './MenuItem';
export { type MenuItemGroupProps } from './MenuItemGroup';
export { type SubMenuProps } from './SubMenu';

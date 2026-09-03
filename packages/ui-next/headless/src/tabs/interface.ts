import type { CSSProperties } from 'vue';

import type { DropdownProps } from '../dropdown';
import type {
  CSSMotionProps,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  VueNode,
} from '../util';

export type SizeInfo = [width: number, height: number];

export interface EditableConfig {
  addIcon?: VueNode;
  onEdit: (
    type: 'add' | 'remove',
    info: { event: KeyboardEvent | MouseEvent; key?: string },
  ) => void;
  removeIcon?: VueNode;
  showAdd?: boolean;
}

export interface AnimatedConfig {
  inkBar?: boolean;
  tabPane?: boolean;
  tabPaneMotion?: CSSMotionProps;
}

export interface TabsLocale {
  addAriaLabel?: string;
  dropdownAriaLabel?: string;
  removeAriaLabel?: string;
}

export interface AddButtonProps {
  editable?: EditableConfig;
  locale?: TabsLocale;
  prefixCls: string;
  style?: CSSProperties;
}

export type OnTabScroll = (info: {
  direction: 'bottom' | 'left' | 'right' | 'top';
}) => void;

export type TabBarExtraPosition = 'left' | 'right';

export type TabBarExtraMap = Partial<Record<TabBarExtraPosition, VueNode>>;

export type TabBarExtraContent = TabBarExtraMap | VueNode;

export interface ExtraContentProps {
  extra?: TabBarExtraContent;
  position: TabBarExtraPosition;
  prefixCls: string;
}

export interface TabPaneProps {
  active?: boolean;
  animated?: boolean;
  children?: VueNode;
  className?: unknown;
  closable?: boolean;
  closeIcon?: VueNode;
  destroyOnHidden?: boolean;
  disabled?: boolean;
  forceRender?: boolean;

  icon?: VueNode;
  id?: null | string;
  // Pass by TabPaneList
  prefixCls?: string;
  style?: CSSProperties;
  tab?: VueNode;
  tabKey?: string;
}

export interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string;
  label: VueNode;
}

export type moreIcon = VueNode;

export type PopupRender = (
  menu: VueNode,
  info: {
    onClose: () => void;
    restTabs: Tab[];
  },
) => VueNode;

export type MoreProps = Omit<DropdownProps, 'children'> & {
  icon?: moreIcon;
  popupRender?: PopupRender;
};

export interface OperationNodeProps {
  activeKey: string;
  className?: unknown;
  classNames?: Partial<Record<'remove', string>>;
  editable?: EditableConfig;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  id: null | string;
  locale?: TabsLocale;
  mobile: boolean;
  more?: MoreProps;
  onTabClick: (key: string, e: KeyboardEvent | MouseEvent) => void;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  prefixCls: string;
  removeAriaLabel?: string;
  rtl: boolean;
  style?: CSSProperties;
  styles?: Partial<Record<'remove', CSSProperties>>;
  tabBarGutter?: number;
  tabMoving?: boolean;
  tabs: Tab[];
}

export interface TabNodeProps {
  active: boolean;
  className?: string;
  classNames?: Partial<Record<'item' | 'remove', string>>;
  closable?: boolean;
  currentPosition: number;
  editable?: EditableConfig;
  focus: boolean;
  id: null | string;
  onBlur: FocusEventHandler;
  onClick?: (e: KeyboardEvent | MouseEvent) => void;
  onFocus: FocusEventHandler;
  onKeyDown: KeyboardEventHandler;
  onMouseDown: MouseEventHandler;
  onMouseUp: MouseEventHandler;
  onResize?: (width: number, height: number, left: number, top: number) => void;
  prefixCls: string;
  removeAriaLabel?: string;
  removeIcon?: VueNode;
  renderWrapper?: (node: VueNode) => VueNode;
  style?: CSSProperties;
  styles?: Partial<Record<'item' | 'remove', CSSProperties>>;
  tab: Tab;
  tabCount: number;
}

export type TabPosition = 'bottom' | 'left' | 'right' | 'top';

export type GetIndicatorSize = ((origin: number) => number) | number;

export type SemanticName =
  | 'body'
  | 'content'
  | 'header'
  | 'indicator'
  | 'item'
  | 'popup'
  | 'remove';

export type RenderTabBar = (
  props: Record<string, any>,
  TabNavListComponent: any,
) => VueNode;

export interface IndicatorConfig {
  align?: 'center' | 'end' | 'start';
  size?: GetIndicatorSize;
}

export interface TabNavListProps {
  activeKey: string;
  animated?: AnimatedConfig;
  children?: (node: VueNode) => VueNode;
  className?: unknown;
  classNames?: Partial<Record<SemanticName, string>>;
  editable?: EditableConfig;
  extra?: TabBarExtraContent;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  id: null | string;
  indicator?: IndicatorConfig;
  locale?: TabsLocale;
  mobile: boolean;
  more?: MoreProps;
  onTabClick: (activeKey: string, e: KeyboardEvent | MouseEvent) => void;
  onTabScroll?: OnTabScroll;
  popupClassName?: string;
  renderTabBar?: RenderTabBar;
  rtl: boolean;
  style?: CSSProperties;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  tabBarGutter?: number;
  tabPosition: TabPosition;
}

export type TabNavListWrapperProps = Omit<
  TabNavListProps,
  'children' | 'className'
> &
  TabNavListProps;

export interface TabPaneProps {
  active?: boolean;
  animated?: boolean;
  children?: VueNode;
  className?: unknown;
  closable?: boolean;
  closeIcon?: VueNode;
  destroyOnHidden?: boolean;
  disabled?: boolean;
  forceRender?: boolean;

  icon?: VueNode;
  id?: null | string;
  // Pass by TabPaneList
  prefixCls?: string;
  style?: CSSProperties;
  tab?: VueNode;
  tabKey?: string;
}

export interface TabsProps {
  activeKey?: string;
  animated?: AnimatedConfig | boolean;
  className?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  defaultActiveKey?: string;
  destroyOnHidden?: boolean;

  direction?: 'ltr' | 'rtl';

  editable?: EditableConfig;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  id?: null | string;
  indicator?: {
    align?: 'center' | 'end' | 'start';
    size?: GetIndicatorSize;
  };
  items?: Tab[];
  // Accessibility
  locale?: TabsLocale;
  // Icons
  more?: MoreProps;
  onChange?: (activeKey: string) => void;
  onTabClick?: (activeKey: string, e: KeyboardEvent | MouseEvent) => void;
  onTabScroll?: OnTabScroll;

  /** @private Internal usage. Not promise will rename in future */
  popupClassName?: string;
  prefixCls?: string;
  renderTabBar?: RenderTabBar;

  style?: CSSProperties;
  styles?: Partial<Record<SemanticName, CSSProperties>>;

  tabBarExtraContent?: TabBarExtraContent;

  tabBarGutter?: number;
  tabBarStyle?: CSSProperties;
  tabPosition?: TabPosition;
}

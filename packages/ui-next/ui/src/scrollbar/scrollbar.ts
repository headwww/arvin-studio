import type { ComponentPublicInstance, CSSProperties, Ref } from 'vue';

import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';

export type AsScrollbarComponent = ComponentPublicInstance<
  AsScrollbarProps,
  AsScrollbarEventProps
>;

export type AsScrollbarInstance = ComponentPublicInstance<
  AsScrollbarProps,
  AsScrollbarConstructor
>;

export interface AsScrollbarConstructor extends AsScrollbarMethods {
  props: AsScrollbarProps;
  xID: string;
}

export interface ScrollbarPrivateRef {
  refElem: Ref<HTMLDivElement | undefined>;
}
export interface AsScrollbarPrivateRef extends ScrollbarPrivateRef {}

export namespace AsScrollbarPropTypes {
  export type Size = SizeType;
  export type Id = number | string;
  export type ViewId = number | string;
  export type Width = number | string;
  export type Height = number | string;
  export type MinWidth = number | string;
  export type MinHeight = number | string;
  export type MaxWidth = number | string;
  export type MaxHeight = number | string;
  export type Loading = boolean;
  export type Native = boolean;
  export type Padding = boolean;
  export type AutoHide = boolean;
  export type FluentOverlay = boolean;
  export type Visible = boolean;
  export interface XConfig {
    // showArrows?: boolean
    /**
     * 是否自动隐藏滚动条
     */
    autoHide?: boolean;
    height?: number | string;
    /**
     * 滚动条显示位置
     */
    position?: '' | 'bottom' | 'top';
    /**
     * 滚动到边界触发的阈值会触发 scroll-boundary 事件
     */
    threshold?: number | string;
    visible?: boolean;
  }
  export interface YConfig {
    // showArrows?: boolean
    /**
     * 是否自动隐藏滚动条
     */
    autoHide?: boolean;
    /**
     * 滚动条显示位置
     */
    position?: '' | 'left' | 'right';
    /**
     * 滚动到边界触发的阈值会触发 scroll-boundary 事件
     */
    threshold?: number | string;
    visible?: boolean;
    width?: number | string;
  }
  export type ClassName = string;
  export type ViewAttrs = Record<string, any>;
  export type ViewStyle = CSSProperties;
  export type ViewClassName = string;
  export type ViewInnerClassName = string;
}

export interface AsScrollbarProps extends ComponentBaseProps {
  /**
   * 是否自动隐藏滚动条
   */
  autoHide?: AsScrollbarPropTypes.AutoHide;
  /**
   * 给容器附加 class
   */
  className?: AsScrollbarPropTypes.ClassName;
  /**
   * 是否悬浮叠加滚动条，默认细线，鼠标悬浮上去滑块变宽
   */
  fluentOverlay?: AsScrollbarPropTypes.FluentOverlay;
  /**
   * 容器高度
   */
  height?: AsScrollbarPropTypes.Height;
  /**
   * 容器 ID
   */
  id?: AsScrollbarPropTypes.Id;
  /**
   * 是否加载中
   */
  loading?: AsScrollbarPropTypes.Loading;
  /**
   * 容器最大高度
   */
  maxHeight?: AsScrollbarPropTypes.MaxHeight;
  /**
   * 容器最大宽度
   */
  maxWidth?: AsScrollbarPropTypes.MaxWidth;
  /**
   * 容器最小高度
   */
  minHeight?: AsScrollbarPropTypes.MinHeight;
  /**
   * 容器最小宽度
   */
  minWidth?: AsScrollbarPropTypes.MinWidth;
  /**
   * 是否使用原生滚动条
   */
  native?: AsScrollbarPropTypes.Native;
  /**
   * 滚动条是否需要边距
   */
  padding?: AsScrollbarPropTypes.Padding;
  /**
   * 尺寸
   */
  size?: AsScrollbarPropTypes.Size;
  /**
   * 给视图元素附加属性
   */
  viewAttrs?: AsScrollbarPropTypes.ViewAttrs;
  /**
   * 给视图元素附加 class
   */
  viewClassName?: AsScrollbarPropTypes.ViewClassName;
  /**
   * 视图元素 ID
   */
  viewId?: AsScrollbarPropTypes.ViewId;
  /**
   * 给视图内元素附加 class
   */
  viewInnerClassName?: AsScrollbarPropTypes.ViewInnerClassName;
  /**
   * 给视图元素附加样式
   */
  viewStyle?: AsScrollbarPropTypes.ViewStyle;
  /**
   * 是否显示滚动条
   */
  visible?: AsScrollbarPropTypes.Visible;
  /**
   * 容器宽度
   */
  width?: AsScrollbarPropTypes.Width;
  /**
   * 横向滚动条配置
   */
  xConfig?: AsScrollbarPropTypes.XConfig;
  /**
   * 纵向滚动条配置
   */
  yConfig?: AsScrollbarPropTypes.YConfig;
}

export interface ScrollbarPrivateComputed {}
export interface AsScrollbarPrivateComputed extends ScrollbarPrivateComputed {}

export interface ScrollbarReactData {
  xThumbWidth: number;
  yThumbHeight: number;
}
export interface ScrollbarInternalData {
  isThumbDrag?: boolean;
  lastScrollLeft: number;
  lastScrollTop: number;
  thumbDragOffset: number;
  xThumbLeft: number;
  yThumbTop: number;
}
type ValueOf<T> = T extends any[] ? T[number] : T[keyof T];

export interface ScrollbarMethods {
  /**
   * 清除滚动条距离
   */
  clearScroll(): void;
  dispatchEvent(
    type: ValueOf<AsScrollbarEmits>,
    params: Record<string, any>,
    evnt: Event | null,
  ): void;
  /**
   * 获取左侧滚动距离
   */
  getScrollLeft(): number;
  /**
   * 获取顶部滚动距离
   */
  getScrollTop(): number;
  /**
   * 获取滚动视图元素
   */
  getScrollViewElem(): HTMLElement | null | undefined;
  /**
   * 获取滚动视图内容包裹元素
   */
  getScrollViewInnerElem(): HTMLElement | null | undefined;
  /**
   * 重新计算样式
   * 对于某些特殊场景可能会用到，比如更新内容
   */
  recalculate(): Promise<void>;
  /**
   * 滚动元素到可见位置
   */
  scrollIntoView(): void;
  /**
   * 滚动到指定位置
   */
  scrollTo(options: ScrollToOptions): void;
  scrollTo(left: number, top: number): void;
  /**
   * 设置左侧滚动距离
   */
  setScrollLeft(left: number): void;
  /**
   * 设置顶部滚动距离
   */
  setScrollTop(top: number): void;
}
export interface AsScrollbarMethods extends ScrollbarMethods {}

export interface ScrollbarPrivateMethods {}
export interface AsScrollbarPrivateMethods extends ScrollbarPrivateMethods {}

export type AsScrollbarEmits = ['scroll', 'scroll-boundary'];

export namespace AsScrollbarDefines {
  export interface ScrollbarEventParams {
    $event: Event;
    $scrollbar: AsScrollbarConstructor;
  }

  export interface ScrollEventParams extends ScrollbarEventParams {
    clientHeight: number;
    clientWidth: number;
    direction: '' | 'bottom' | 'left' | 'right' | 'top';
    isBottom: boolean;
    isLeft: boolean;
    isRight: boolean;
    isTop: boolean;
    scrollHeight: number;
    scrollLeft: number;
    scrollTop: number;
    scrollWidth: number;
  }
  export interface ScrollBoundaryEventParams extends ScrollEventParams {}
}

export type AsScrollbarEventProps = {
  onScroll?: AsScrollbarEvents.Scroll;
  onScrollBoundary?: AsScrollbarEvents.ScrollBoundary;
};

export interface AsScrollbarListeners {
  scroll?: AsScrollbarEvents.Scroll;
  scrollBoundary?: AsScrollbarEvents.ScrollBoundary;
}

export namespace AsScrollbarEvents {
  export type Scroll = (params: AsScrollbarDefines.ScrollEventParams) => void;
  export type ScrollBoundary = (
    params: AsScrollbarDefines.ScrollBoundaryEventParams,
  ) => void;
}

export namespace AsScrollbarSlotTypes {
  export interface DefaultSlotParams {}
}

export interface AsScrollbarSlots {
  default?: (params: AsScrollbarSlotTypes.DefaultSlotParams) => any;
}

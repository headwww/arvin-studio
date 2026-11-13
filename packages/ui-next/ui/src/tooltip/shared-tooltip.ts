import type {
  ComponentPublicInstance,
  Ref,
  RenderFunction,
  SetupContext,
} from 'vue';

import type { VueNode } from '../_util';
import type { ComponentBaseProps } from '../config-provider/context';
import type { SizeType } from '../config-provider/size-context';
import type { AsScrollbarProps } from '../scrollbar/scrollbar';

export type AsSharedTooltipComponent = ComponentPublicInstance<
  AsSharedTooltipProps,
  AsSharedTooltipEventProps
>;

export type AsSharedTooltipInstance = ComponentPublicInstance<
  AsSharedTooltipProps,
  AsSharedTooltipConstructor
>;

export interface AsSharedTooltipConstructor extends AsSharedTooltipMethods {
  context: SetupContext<AsSharedTooltipEmits>;
  getComputeMaps(): TooltipPrivateComputed;
  getRefMaps(): TooltipPrivateRef;
  props: AsSharedTooltipProps;
  reactData: TooltipReactData;
  renderVN: RenderFunction;
  xID: string;
}

export interface TooltipPrivateRef {
  refElem: Ref<HTMLDivElement | undefined>;
}
export interface AsSharedTooltipPrivateRef extends TooltipPrivateRef {}

export namespace AsSharedTooltipPropTypes {
  export type Size = SizeType;
  export type ModelValue = boolean;
  export type Selector = HTMLElement | string;
  export type Trigger = '' | 'click' | 'hover' | 'manual' | null;
  export type Content = number | string;
  export type UseHtml = boolean;
  export type ZIndex = number | string;
  export type PopupClassName =
    | ((params: { $tooltip: AsSharedTooltipConstructor }) => string)
    | string;
  export type Width = number | string;
  export type Height = number | string;
  export type MinWidth = number | string;
  export type MinHeight = number | string;
  export type MaxWidth = number | string;
  export type MaxHeight = number | string;
  export type Placement = '' | 'bottom' | 'top';
  export type DefaultPlacement = '' | 'bottom' | 'top';
  export type IsArrow = boolean;
  export type Enterable = boolean;
  export type EnterDelay = number;
  export type LeaveDelay = number;
  export type LeaveMethod = (params: { $event: MouseEvent }) => boolean;
  export type UseScrollbar = boolean;
  export interface ScrollbarConfig
    extends Pick<
      AsScrollbarProps,
      | 'autoHide'
      | 'className'
      | 'fluentOverlay'
      | 'padding'
      | 'viewAttrs'
      | 'viewClassName'
      | 'viewInnerClassName'
      | 'visible'
      | 'xConfig'
      | 'yConfig'
    > {
    /**
     * 滚动条容器高度
     */
    height?: number | string;
    /**
     * 滚动条容器宽度
     */
    width?: number | string;
  }
}

export interface AsSharedTooltipProps extends ComponentBaseProps {
  content?: AsSharedTooltipPropTypes.Content;
  defaultPlacement?: AsSharedTooltipPropTypes.DefaultPlacement;
  enterable?: AsSharedTooltipPropTypes.Enterable;
  enterDelay?: AsSharedTooltipPropTypes.EnterDelay;
  height?: AsSharedTooltipPropTypes.Height;
  isArrow?: AsSharedTooltipPropTypes.IsArrow;
  leaveDelay?: AsSharedTooltipPropTypes.LeaveDelay;
  leaveMethod?: AsSharedTooltipPropTypes.LeaveMethod;
  maxHeight?: AsSharedTooltipPropTypes.MaxHeight;
  maxWidth?: AsSharedTooltipPropTypes.MaxWidth;
  minHeight?: AsSharedTooltipPropTypes.MinHeight;
  minWidth?: AsSharedTooltipPropTypes.MinWidth;
  modelValue?: AsSharedTooltipPropTypes.ModelValue;
  placement?: AsSharedTooltipPropTypes.Placement;
  popupClassName?: AsSharedTooltipPropTypes.PopupClassName;
  scrollbarConfig?: AsSharedTooltipPropTypes.ScrollbarConfig;
  selector?: AsSharedTooltipPropTypes.Selector;
  size?: AsSharedTooltipPropTypes.Size;
  trigger?: AsSharedTooltipPropTypes.Trigger;
  useHtml?: AsSharedTooltipPropTypes.UseHtml;
  useScrollbar?: AsSharedTooltipPropTypes.UseScrollbar;
  width?: AsSharedTooltipPropTypes.Width;
  /**
   * @deprecated 请使用 width
   */
  Width?: AsSharedTooltipPropTypes.Width;
  zIndex?: AsSharedTooltipPropTypes.ZIndex;
}

export interface TooltipPrivateComputed {}
export interface AsSharedTooltipPrivateComputed extends TooltipPrivateComputed {}

export interface TooltipReactData {
  isUpdate: boolean;
  target: HTMLElement | null;
  tipActive: boolean;
  tipContent: number | string | undefined;
  tipPos: null | {
    oLeft: number;
    oTop: number;
    x: number;
    y: number;
  };
  tipStore: {
    arrowStyle: Record<string, number | string>;
    placement: any;
    style: Record<string, number | string>;
  };
  tipTarget: HTMLElement | null;
  tipZindex: number;
  visible: boolean;
}

export interface TooltipInternalData {
  scrollbarViewEl?: HTMLElement;
  showDelayTip?(): void;
}
/**
 * 取出对象值类型
 */
type ValueOf<T> = T extends any[] ? T[number] : T[keyof T];

export interface TooltipMethods {
  /**
   * 隐藏
   */
  close(): Promise<any>;
  dispatchEvent(
    type: ValueOf<AsSharedTooltipEmits>,
    params: Record<string, any>,
    evnt: Event | null,
  ): void;
  isActived(): boolean;
  /**
   * 显示
   */
  open(target?: any, content?: AsSharedTooltipPropTypes.Content): Promise<void>;
  /**
   * 显示
   */
  openByEvent(
    evnt: Event,
    target?: any,
    content?: AsSharedTooltipPropTypes.Content,
  ): Promise<void>;
  setActived(actived: boolean): void;
  /**
   * 已废弃，请使用 open
   * @deprecated
   */
  toVisible(
    target?: HTMLElement,
    content?: AsSharedTooltipPropTypes.Content,
  ): Promise<void>;
  updatePlacement(): Promise<any>;
}
export interface AsSharedTooltipMethods extends TooltipMethods {}

export interface TooltipPrivateMethods {}
export interface AsSharedTooltipPrivateMethods extends TooltipPrivateMethods {}

export type AsSharedTooltipEmits = ['update:modelValue'];

export namespace AsSharedTooltipDefines {
  export interface TooltipEventParams {
    $event: Event;
    $tooltip: AsSharedTooltipConstructor;
  }

  export interface TooltipHelperOption {
    content?: AsSharedTooltipPropTypes.Content;
    enterable?: AsSharedTooltipPropTypes.Enterable;
    icon?: VueNode;
    iconStatus?: string;
    useHtml?: AsSharedTooltipPropTypes.UseHtml;
  }
}

export type AsSharedTooltipEventProps = {
  'onUpdate:modelValue'?: AsSharedTooltipEvents.UpdateModelValue;
};

export interface AsSharedTooltipListeners {
  'update:modelValue'?: AsSharedTooltipEvents.UpdateModelValue;
}

export namespace AsSharedTooltipEvents {
  export type UpdateModelValue = (
    modelValue: AsSharedTooltipPropTypes.ModelValue,
  ) => void;
}

export namespace AsSharedTooltipSlotTypes {
  export interface DefaultSlotParams {}
}

export interface AsSharedTooltipSlots {
  content?: (params: AsSharedTooltipSlotTypes.DefaultSlotParams) => any;
  default?: (params: AsSharedTooltipSlotTypes.DefaultSlotParams) => any;
}

import type { Ref, RenderFunction, SetupContext } from 'vue';

import type {
  AsComponentBaseOptions,
  DefineAsComponentInstance,
} from '../../types/common';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTableMethods,
  AsTablePrivateMethods,
} from '../../types/table';

export interface AsTableCustomPanelConstructor
  extends AsComponentBaseOptions, AsTableCustomPanelMethods {
  context: SetupContext<AsTableCustomPanelEmits>;
  getComputeMaps(): TableCustomPanelPrivateComputed;
  getRefMaps(): TableCustomPanelPrivateRef;
  internalData: TableCustomPanelInternalData;
  props: AsTableCustomPanelProps;
  reactData: TableCustomPanelReactData;
  renderVN: RenderFunction;

  xeTable: AsTableConstructor & AsTableMethods & AsTablePrivateMethods;
}
export type AsTableCustomPanelInstance = DefineAsComponentInstance<
  AsTableCustomPanelProps,
  AsTableCustomPanelConstructor
>;

interface AsTableCustomPanelProps {
  customStore?: AsTableDefines.AsTableCustomStoreObj;
}

export interface TableCustomPanelReactData {
  dragAggFnCol: AsTableDefines.ColumnInfo | null;
  dragCol: AsTableDefines.ColumnInfo | null;
  dragGroupField: null | string | undefined;
  dragTipText: string;
}

export interface TableCustomPanelInternalData {
  customDragTime?: number;
  prevDragAggFnColid?: null | string | undefined;
  prevDragCol?: AsTableDefines.ColumnInfo | null | undefined;
  prevDragGroupField?: null | string | undefined;
  prevDragPos?: any;

  prevDragToChild?: boolean;
}

export interface TableCustomPanelPrivateRef {
  refBodyWrapperElem: Ref<HTMLDivElement | undefined>;
  refCustomBodyElem: Ref<HTMLDivElement | undefined>;
  refDragLineElem: Ref<HTMLDivElement | undefined>;
  refDragTipElem: Ref<HTMLDivElement | undefined>;
  refElem: Ref<HTMLDivElement | undefined>;
}

export interface TableCustomPanelPrivateComputed {}

export interface AsTableCustomPanelMethods {}

type AsTableCustomPanelEmits = [];

export interface AsCustomPanel {}

export interface TableCustomMethods {
  /**
   * 取消个性化列操作
   */
  cancelCustom(): Promise<void>;
  /**
   * 关闭个性化列面板
   */
  closeCustom(): Promise<void>;
  /**
   * 获取个性化列面板显示状态
   */
  getCustomVisible(): boolean;
  /**
   * 打开个性化列面板
   */
  openCustom(): Promise<void>;
  /**
   * 重置个性化列操作
   * 支持只重置指定的操作（列可视、列宽、冻结列、列顺序）
   */
  resetCustom(
    options?:
      | boolean
      | {
          fixed?: boolean;
          order?: boolean;
          resizable?: boolean;
          visible?: boolean;
        },
  ): Promise<void>;
  /**
   * 保存个性化列操作
   */
  saveCustom(isDirectly?: boolean): Promise<void>;
  /**
   * 设置个性化列全选状态
   */
  setCustomAllCheckbox(checked: boolean): Promise<void>;
  /**
   * 切换个性化列面板打开与关闭
   */
  toggleCustom(): Promise<void>;
  /**
   * 切换个性化列全选状态
   */
  toggleCustomAllCheckbox(): Promise<void>;
}

export interface TableCustomPrivateMethods {
  checkCustomStatus(): void;
  customCloseEvent(evnt: Event): void;
  customOpenEvent(evnt: Event): void;
  emitCustomEvent(type: string, evnt: Event): void;
  handleCustomStyle(): Promise<any>;
  handleUpdateCustomColumn(): void;
  triggerCustomEvent(evnt: MouseEvent): void;
}

declare module '../../types/table' {
  export interface AsTableMethods<D = any> extends TableCustomMethods {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends TableCustomPrivateMethods {}
}

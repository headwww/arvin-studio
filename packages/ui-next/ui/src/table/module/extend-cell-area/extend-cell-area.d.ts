import type { AsColumnPropTypes } from '../../types/column';
import type { AsComponentEventParams } from '../../types/common';
import type { AsTableConstructor, AsTableDefines } from '../../types/table';

export interface AsTableExtendCellAreaMethods<D = any> {
  /**
   * 用于 mouse-config.area，用于清除鼠标选择的区域，可以指定清除的区域
   */
  clearCellAreas(
    area?: AsTableExtendCellAreaDefines.MouseCellArea | number,
  ): Promise<any>;
  /**
   * 用于 mouse-config.area，手动清除标记为复制粘贴的区域
   */
  clearCopyCellArea(): Promise<any>;
  /**
   * 手动关闭查找与替换窗口
   */
  closeFNR(): Promise<any>;
  /**
   * 用于 mouse-config.area，复制指定区域，返回转换后的文本
   */
  copyCellArea(): { html: string; text: string };
  /**
   * 用于 mouse-config.area，剪贴指定区域，返回转换后的文本
   */
  cutCellArea(): { html: string; text: string };
  /**
   * 用于 mouse-config.area，用于获取区域中的活动单元格
   */
  getActiveCellArea(): AsTableExtendCellAreaDefines.MouseActiveCellArea | null;
  /**
   * 用于 mouse-config.area，用于获取鼠标选择的区域
   */
  getCellAreas(): AsTableExtendCellAreaDefines.MouseCellArea[];
  /**
   * 被 getCopyCellAreas 替换
   * @deprecated
   */
  getCopyCellArea(): AsTableExtendCellAreaDefines.MouseCellArea | null;
  /**
   * 用于 mouse-config.area，复制指定区域，返回转换后的文本
   */
  getCopyCellAreas(): AsTableExtendCellAreaDefines.MouseCellArea[];
  /**
   * 打开单元格查找窗口
   */
  openFind(): Promise<any>;
  /**
   * 手动打开查找与替换窗口
   */
  openFNR(options: { type?: '' | 'find' | 'replace' | null }): Promise<any>;
  /**
   * 打开单元格替换窗口
   */
  openReplace(): Promise<any>;
  /**
   * 用于 mouse-config.area，粘贴从表格中被复制的数据，如果不是从表格中操作，则无法粘贴
   */
  pasteCellArea(): Promise<any>;
  /**
   * 用于 mouse-config.area，设置活动的区域的单元格
   * @param activeArea
   */
  setActiveCellArea(
    activeArea: AsTableExtendCellAreaDefines.ActiveCellAreaConfig,
  ): Promise<any>;
  /**
   * 用于 mouse-config.area，选取指定区域的单元格
   * @param areaConfigs 指定区域
   */
  setCellAreas(
    areaConfigs: AsTableExtendCellAreaDefines.CellAreaConfig[],
    activeArea?: {
      area?: AsTableExtendCellAreaDefines.CellAreaConfig<D> | number;
      column?: AsTableDefines.ColumnInfo | number;
      row?: D | number;
    },
  ): Promise<any>;
}

export interface AsTableExtendCellAreaPrivateMethods<D = any> {
  /**
   * 内部方法
   * @private
   */
  getCellAreaPushStackObj(
    stackObj: AsTableDefines.HistoryStackObj,
  ): AsTableDefines.HistoryStackObj;
  /**
   * 内部方法
   * @private
   */
  handleCellAreaSnapshotStackData(
    stackObj: AsTableDefines.HistoryStackObj,
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleColResizeCellAreaEvent(evnt: MouseEvent, params: any): void;
  /**
   * 内部方法
   * @private
   */
  handleColResizeDblclickCellAreaEvent(evnt: MouseEvent, params: any): void;
  /**
   * 内部方法
   * @private
   */
  handleCutCellAreaEvent(evnt: ClipboardEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleCyClAreaEvent(evnt: ClipboardEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleFilterEvent(
    evnt: Event,
    params: AsTableDefines.FilterChangeEventParams<D>,
  ): any;
  /**
   * 内部方法
   * @private
   */
  handleHeaderCellAreaMouseDnEvent(
    evnt: MouseEvent,
    params: AsTableDefines.HeaderCellClickEventParams<D>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleKdClAreaEvent(evnt: KeyboardEvent): void;
  /**
   * 内部方法
   * @private
   */
  handlePeClAreaEvent(evnt: ClipboardEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleRecalculateCellAreaEvent(): any;
  /**
   * 内部方法
   * @private
   */
  handleRowResizeCellAreaEvent(evnt: MouseEvent, params: any): void;
  /**
   * 内部方法
   * @private
   */
  handleRowResizeDblclickCellAreaEvent(evnt: MouseEvent, params: any): void;
  /**
   * 内部方法
   * @private
   */
  handleSortEvent(
    evnt: Event,
    params: AsTableDefines.SortChangeEventParams<D>,
  ): any;
  /**
   * 内部方法
   * @private
   */
  triggerCellAreaExtendMousedownEvent(evnt: MouseEvent, params: any): void;
  /**
   * 内部方法
   * @private
   */
  triggerClAreaMnEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellClickEventParams<D>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerCopyCellAreaEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  triggerCutCellAreaEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  triggerFnrOpenEvent(evnt: MouseEvent, tab: 'find' | 'replace'): void;
  /**
   * 内部方法
   * @private
   */
  triggerPasteCellAreaEvent(evnt: MouseEvent): void;
}

declare module '../../types/table' {
  export interface TableInternalData<D = any> {
    _isCAEd?: boolean;
    _msTout?: any;
    activeCellArea?: AsTableExtendCellAreaDefines.MouseActiveCellArea | null;
    azIndex?: number;
    cellAreas?: AsTableExtendCellAreaDefines.MouseCellArea<D>[] | null;

    copyAreaMpas?: null | {
      _c?: boolean;
      _r?: boolean;
      cellAreas: AsTableExtendCellAreaDefines.MouseCellArea[];
      cut: boolean;
    };

    // TODO fnrActiveModal?: (AsModalConstructor & AsModalMethods) | null;

    fnrSearchList?: AsTableExtendCellAreaDefines.FNRSearch[];
    fnrStore?: {
      activeTab: string;
      findCellRE: null | RegExp;
      findCount: number;
      findValue: string;
      isRE: boolean;
      isSensitive: boolean;
      isWhole: boolean;
      replaceValue: string;
      showCount: boolean;
      showREErr: boolean;
      visible: boolean;
    };

    fnrTabs?: AsTableExtendCellAreaDefines.FNRTab[];
    isDragcellArea?: boolean;

    isDragcellExtend?: boolean;
    trialElem?: HTMLElement | null;
  }
  export interface AsTableMethods<
    D = any,
  > extends AsTableExtendCellAreaMethods<D> {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends AsTableExtendCellAreaPrivateMethods<D> {}
}

export namespace AsTableExtendCellAreaDefines {
  export interface CellAreaParams<D = any> {
    /**
     * 对应的列数组
     */
    cols: AsTableDefines.ColumnInfo[];
    /**
     * 对应的行数组
     */
    rows: D[];
  }

  export interface FNRTab {
    label: string;
    value: string;
  }

  export interface FNRSearch {
    col: number;
    isActived: boolean;
    row: number;
    seq: number;
    value: string;
  }

  export interface MouseActiveCellArea<D = any> {
    area: MouseCellArea<D>;
    column: AsTableDefines.ColumnInfo;
    el?: HTMLElement | null;
    height: number;
    left: number;
    row: any;
    top: number;
    type: CELL_AREA_TYPE;
    width: number;
  }

  export interface MouseCellArea<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    el?: HTMLElement | null;
    height: number;
    left: number;
    leftEl?: HTMLElement | null;
    rightEl?: HTMLElement | null;
    rows: D[];
    top: number;
    type: CELL_AREA_TYPE;
    width: number;
  }

  export type CELL_AREA_TYPE = 'active' | 'copy' | 'extend' | 'main' | 'multi';

  export interface CellAreaConfig<D = any> {
    endColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | number;
    endRow: D | number;
    startColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | number;
    startRow: D | number;
    type?: CELL_AREA_TYPE;
  }

  export interface ActiveCellAreaConfig<D = any> {
    area: AsTableExtendCellAreaDefines.MouseCellArea<D> | number;
    column: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | number;
    row: D | number;
  }

  export type ExtendCellAreaDirection = 'down' | 'left' | 'right' | 'up';

  export interface ExtendCellAreaCalcBaseParams<D = any> {
    // TODO $grid: AsGridConstructor<D> | null | undefined;
    $table: AsTableConstructor<D>;
    cols: AsTableDefines.ColumnInfo[];
    direction: ExtendCellAreaDirection;
    extendCols: AsTableDefines.ColumnInfo[];
    extendRows: any[];
    rows: D[];
    targetCols: AsTableDefines.ColumnInfo[];
    targetRows: any[];
    targetValues: any[][];
  }

  interface EventParams<D = any> extends AsComponentEventParams {
    // TODO $grid: AsGridConstructor<D> | null | undefined;
    $table: AsTableConstructor<D>;
  }

  type FnrTab = 'find' | 'replace';

  export interface OpenFnrParams<D = any> {
    [key: symbol]: D;

    tab: FnrTab;
  }
  export interface OpenFnrEventParams<D = any>
    extends EventParams<D>, OpenFnrParams {}

  export type FnrChangeParams<D = any> = OpenFnrParams<D>;
  export interface FnrChangeEventParams<D = any>
    extends EventParams<D>, FnrChangeParams {}

  export interface FnrFindParams<D = any> {
    column: AsTableDefines.ColumnInfo;
    findValue: string;
    row: D;
  }
  export type FnrFindEventParams<D = any> = FnrFindParams<D>;

  export interface FindAndReplaceResult<D = any> {
    _columnIndex: number;
    _rowIndex: number;
    column: AsTableDefines.ColumnInfo;
    row: D;
  }

  export interface FnrFindAllParams<D = any> {
    findValue: string;
    result: FindAndReplaceResult<D>[];
  }
  export type FnrFindAllEventParams<D = any> = FnrFindAllParams<D>;

  export interface FnrReplaceParams<D = any> {
    [key: symbol]: D;

    column: AsTableDefines.ColumnInfo;
    findValue: string;
    replaceValue: string;
    row: any;
  }
  export type FnrReplaceEventParams<D = any> = FnrReplaceParams<D>;

  export interface FnrReplaceAllParams<D = any> {
    findValue: string;
    replaceValue: string;
    result: FindAndReplaceResult<D>[];
  }
  export type FnrReplaceAllEventParams<D = any> = FnrReplaceAllParams<D>;

  export interface CellAreaCopyParams<D = any> {
    cellValues: string[][];
    invalid: boolean;
    status: boolean;
    targetAreas: AsTableExtendCellAreaDefines.CellAreaParams<D>[];
  }
  export interface CellAreaCopyEventParams<D = any>
    extends CellAreaCopyParams<D>, EventParams<D> {}

  export interface CellAreaCutParams<D = any> {
    cellValues: string[][];
    invalid: boolean;
    status: boolean;
    targetAreas: AsTableExtendCellAreaDefines.CellAreaParams<D>[];
  }
  export interface CellAreaCutEventParams<D = any>
    extends CellAreaCutParams<D>, EventParams<D> {}

  export interface CellAreaPasteParams<D = any> {
    invalid: boolean;
    status: boolean;
    targetAreas: AsTableExtendCellAreaDefines.CellAreaParams<D>[];
  }
  export interface CellAreaPasteEventParams<D = any>
    extends CellAreaPasteParams<D>, EventParams<D> {}

  export interface CellAreaMergeParams<D = any> {
    status: boolean;
    targetAreas: AsTableExtendCellAreaDefines.CellAreaParams<D>[];
  }
  export interface CellAreaMergeEventParams<D = any>
    extends CellAreaMergeParams<D>, EventParams<D> {}

  export interface ClearCellAreaMergeParams<D = any> {
    [key: symbol]: D;

    mergeCells: AsTableDefines.MergeInfo[];
  }
  export interface ClearCellAreaMergeEventParams<D = any>
    extends ClearCellAreaMergeParams<D>, EventParams<D> {}

  export interface ClearCellAreaSelectionParams<D = any> {
    cellAreas: AsTableExtendCellAreaDefines.MouseCellArea<D>[];
  }
  export interface ClearCellAreaSelectionEventParams<D = any>
    extends ClearCellAreaSelectionParams<D>, EventParams<D> {}

  export interface HeaderCellAreaSelectionParams<D = any> {
    _columnIndex: number;
    column: AsTableDefines.ColumnInfo;
    targetCols: AsTableDefines.ColumnInfo[];
    targetRows: D[];
  }
  export interface HeaderCellAreaSelectionEventParams<D = any>
    extends EventParams<D>, HeaderCellAreaSelectionParams<D> {}

  export interface CellAreaSelectionInvalidParams<D = any> {
    column: AsTableDefines.ColumnInfo;
    row: D;
  }
  export interface CellAreaSelectionInvalidEventParams<D = any>
    extends CellAreaSelectionInvalidParams<D>, EventParams<D> {}

  export interface CellAreaSelectionStartParams<D = any> {
    $columnIndex: number;
    $rowIndex: number;
    _columnIndex: number;
    _rowIndex: number;
    cell: HTMLElement;
    column: AsTableDefines.ColumnInfo;
    row: D;
  }
  export interface CellAreaSelectionStartEventParams<D = any>
    extends CellAreaSelectionStartParams<D>, EventParams<D> {}

  export interface CellAreaSelectionDragParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    rows: D[];
  }
  export interface CellAreaSelectionDragEventParams<D = any>
    extends CellAreaSelectionDragParams<D>, EventParams<D> {}

  export interface CellAreaSelectionEndParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    rows: D[];
  }
  export interface CellAreaSelectionEndEventParams<D = any>
    extends CellAreaSelectionEndParams<D>, EventParams<D> {}

  export interface CellAreaExtensionStartParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    fixed: AsColumnPropTypes.Fixed;
    rows: D[];
  }
  export interface CellAreaExtensionStartEventParams<D = any>
    extends CellAreaExtensionStartParams<D>, EventParams<D> {
    targetCols: AsTableDefines.ColumnInfo[];
    targetRows: D[];
  }

  export interface CellAreaExtensionDragParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    fixed: AsColumnPropTypes.Fixed;
    rows: D[];
    targetCols: AsTableDefines.ColumnInfo[];
    targetRows: D[];
  }
  export interface CellAreaExtensionDragEventParams<D = any>
    extends CellAreaExtensionDragParams<D>, EventParams<D> {}

  export interface CellAreaExtensionEndParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    fixed: AsColumnPropTypes.Fixed;
    rows: D[];
    targetCols: AsTableDefines.ColumnInfo[];
    targetRows: D[];
  }
  export interface CellAreaExtensionEndEventParams<D = any>
    extends CellAreaExtensionEndParams<D>, EventParams<D> {}

  export interface CellAreaExtensionFillEventParams<
    D = any,
  > extends EventParams<D> {
    cols: AsTableDefines.ColumnInfo[];
    direction: 'down' | 'left' | 'right' | 'up';
    extendCols: AsTableDefines.ColumnInfo[];
    extendRows: D[];
    rows: D[];
    targetCols: AsTableDefines.ColumnInfo[];
    targetRows: D[];
    targetValues: any[][];
  }

  export interface CellAreaSelectionAllStartParams {}
  export interface CellAreaSelectionAllStartEventParams<D = any>
    extends CellAreaSelectionAllStartParams, EventParams<D> {}

  export interface CellAreaSelectionAllEndParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    rows: D[];
  }
  export interface CellAreaSelectionAllEndEventParams<D = any>
    extends CellAreaSelectionAllEndParams<D>, EventParams<D> {}

  export interface CellAreaArrowsStartParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    isDown: boolean;
    isLeft: boolean;
    isRight: boolean;
    isUp: boolean;
    rows: D[];
  }
  export interface CellAreaArrowsStartEventParams<D = any>
    extends CellAreaArrowsStartParams<D>, EventParams<D> {}

  export interface CellAreaArrowsEndParams<
    D = any,
  > extends CellAreaArrowsStartParams<D> {
    targetCols: AsTableDefines.ColumnInfo[];
    targetRows: D[];
  }
  export interface CellAreaArrowsEndEventParams<D = any>
    extends CellAreaArrowsEndParams<D>, EventParams<D> {}

  export interface CellAreaFillCopyEventParams<D = any> extends EventParams<D> {
    cellAreas: AsTableExtendCellAreaDefines.MouseCellArea<D>[];
  }

  export interface ActiveCellChangeStartParams<D = any> {
    activeArea: AsTableExtendCellAreaDefines.MouseActiveCellArea;
    column: AsTableDefines.ColumnInfo;
    isDown: boolean;
    isEnter: boolean;
    isLeft: boolean;
    isRight: boolean;
    isTab: boolean;
    isUp: boolean;
    row: D;
  }
  export interface ActiveCellChangeStartEventParams<D = any>
    extends ActiveCellChangeStartParams<D>, EventParams<D> {}

  export interface ActiveCellChangeEndParams<
    D = any,
  > extends ActiveCellChangeStartParams<D> {
    beforeActiveArea: AsTableExtendCellAreaDefines.MouseActiveCellArea;
  }
  export interface ActiveCellChangeEndEventParams<D = any>
    extends ActiveCellChangeEndParams<D>, EventParams<D> {}
}
export type AsTableExtendCellAreaEmits = [
  'openFnr',
  'showFnr',
  'hideFnr',
  'fnrChange',
  'fnrFind',
  'fnrFindAll',
  'fnrReplace',
  'fnrReplaceAll',
  'cellAreaCopy',
  'cellAreaCut',
  'cellAreaPaste',
  'cellAreaMerge',
  'clearCellAreaSelection',
  'clearCellAreaMerge',
  'headerCellAreaSelection',
  'cellAreaSelectionInvalid',
  'cellAreaSelectionStart',
  'cellAreaSelectionDrag',
  'cellAreaSelectionEnd',
  'cellAreaExtensionStart',
  'cellAreaExtensionDrag',
  'cellAreaExtensionEnd',
  'cellAreaExtensionFill',
  'cellAreaSelectionAllStart',
  'cellAreaSelectionAllEnd',
  'cellAreaArrowsStart',
  'cellAreaArrowsEnd',
  'cellAreaFillCopy',
  'activeCellChangeStart',
  'activeCellChangeEnd',
];

declare module '../../types/table' {
  export interface AsTableEventProps<D = any> {
    onActiveCellChangeEnd?: AsTableEvents.ActiveCellChangeEnd<D>;
    onActiveCellChangeStart?: AsTableEvents.ActiveCellChangeStart<D>;
    onCellAreaArrowsEnd?: AsTableEvents.CellAreaArrowsEnd<D>;
    onCellAreaArrowsStart?: AsTableEvents.CellAreaArrowsStart<D>;
    onCellAreaCopy?: AsTableEvents.CellAreaCopy<D>;
    onCellAreaCut?: AsTableEvents.CellAreaCut<D>;
    onCellAreaExtensionDrag?: AsTableEvents.CellAreaExtensionDrag<D>;
    onCellAreaExtensionEnd?: AsTableEvents.CellAreaExtensionEnd<D>;
    onCellAreaExtensionFill?: AsTableEvents.CellAreaExtensionFill<D>;
    onCellAreaExtensionStart?: AsTableEvents.CellAreaExtensionStart<D>;
    onCellAreaFillCopy?: AsTableEvents.CellAreaFillCopy<D>;
    onCellAreaMerge?: AsTableEvents.CellAreaMerge<D>;
    onCellAreaPaste?: AsTableEvents.CellAreaPaste<D>;
    onCellAreaSelectionAllEnd?: AsTableEvents.CellAreaSelectionAllEnd<D>;
    onCellAreaSelectionAllStart?: AsTableEvents.CellAreaSelectionAllStart<D>;
    onCellAreaSelectionDrag?: AsTableEvents.CellAreaSelectionDrag<D>;
    onCellAreaSelectionEnd?: AsTableEvents.CellAreaSelectionEnd<D>;
    onCellAreaSelectionInvalid?: AsTableEvents.CellAreaSelectionInvalid<D>;
    onCellAreaSelectionStart?: AsTableEvents.CellAreaSelectionStart<D>;
    onClearCellAreaMerge?: AsTableEvents.ClearCellAreaMerge<D>;
    onClearCellAreaSelection?: AsTableEvents.ClearCellAreaSelection<D>;
    onFnrChange?: AsTableEvents.FnrChange<D>;
    onFnrFind?: AsTableEvents.FnrFind<D>;
    onFnrFindAll?: AsTableEvents.FnrFindAll<D>;
    onFnrReplace?: AsTableEvents.FnrReplace<D>;
    onFnrReplaceAll?: AsTableEvents.FnrReplaceAll<D>;
    onHeaderCellAreaSelection?: AsTableEvents.HeaderCellAreaSelection<D>;
    onOpenFnr?: AsTableEvents.OpenFnr<D>;
  }
  export interface AsTableListeners<D = any> {
    activeCellChangeEnd?: AsTableEvents.ActiveCellChangeEnd<D>;
    activeCellChangeStart?: AsTableEvents.ActiveCellChangeStart<D>;
    cellAreaArrowsEnd?: AsTableEvents.CellAreaArrowsEnd<D>;
    cellAreaArrowsStart?: AsTableEvents.CellAreaArrowsStart<D>;
    cellAreaCopy?: AsTableEvents.CellAreaCopy<D>;
    cellAreaCut?: AsTableEvents.CellAreaCut<D>;
    cellAreaExtensionDrag?: AsTableEvents.CellAreaExtensionDrag<D>;
    cellAreaExtensionEnd?: AsTableEvents.CellAreaExtensionEnd<D>;
    cellAreaExtensionFill?: AsTableEvents.CellAreaExtensionFill<D>;
    cellAreaExtensionStart?: AsTableEvents.CellAreaExtensionStart<D>;
    cellAreaFillCopy?: AsTableEvents.CellAreaFillCopy<D>;
    cellAreaMerge?: AsTableEvents.CellAreaMerge<D>;
    cellAreaPaste?: AsTableEvents.CellAreaPaste<D>;
    cellAreaSelectionAllEnd?: AsTableEvents.CellAreaSelectionAllEnd<D>;
    cellAreaSelectionAllStart?: AsTableEvents.CellAreaSelectionAllStart<D>;
    cellAreaSelectionDrag?: AsTableEvents.CellAreaSelectionDrag<D>;
    cellAreaSelectionEnd?: AsTableEvents.CellAreaSelectionEnd<D>;
    cellAreaSelectionInvalidtart?: AsTableEvents.CellAreaSelectionInvalid<D>;
    cellAreaSelectionStart?: AsTableEvents.CellAreaSelectionStart<D>;
    clearCellAreaMerge?: AsTableEvents.ClearCellAreaMerge<D>;
    clearCellAreaSelection?: AsTableEvents.ClearCellAreaSelection<D>;
    /**
     * 只对 keyboard-config.isFNR 配置时有效，在查找与替换弹框的 Tab 页被切换时会触发该事件
     */
    fnrChange?: AsTableEvents.FnrChange<D>;
    /**
     * 只对 keyboard-config.isFNR 配置时有效，在点击查找时会触发该事件
     */
    fnrFind?: AsTableEvents.FnrFind<D>;
    /**
     * 只对 keyboard-config.isFNR 配置时有效，在点击查找所有时会触发该事件
     */
    fnrFindAll?: AsTableEvents.FnrFindAll<D>;
    /**
     * 只对 keyboard-config.isFNR 配置时有效，在点击替换时会触发该事件
     */
    fnrReplace?: AsTableEvents.FnrReplace<D>;
    /**
     * 只对 keyboard-config.isFNR 配置时有效，在点击替换所有时会触发该事件
     */
    fnrReplaceAll?: AsTableEvents.FnrReplaceAll<D>;
    headerCellAreaSelection?: AsTableEvents.HeaderCellAreaSelection<D>;
    /**
     * 只对 keyboard-config.isFNR 配置时有效，在查找与替换弹框被打开时会触发该事件
     */
    openFnr?: AsTableEvents.OpenFnr<D>;
  }
  export namespace AsTableEvents {
    export type OpenFnr<D = any> = (
      params: AsTableExtendCellAreaDefines.OpenFnrParams<D>,
    ) => void;
    export type FnrChange<D = any> = (
      params: AsTableExtendCellAreaDefines.FnrChangeParams<D>,
    ) => void;
    export type FnrFind<D = any> = (
      params: AsTableExtendCellAreaDefines.FnrFindParams<D>,
    ) => void;
    export type FnrFindAll<D = any> = (
      params: AsTableExtendCellAreaDefines.FnrFindAllParams<D>,
    ) => void;
    export type FnrReplace<D = any> = (
      params: AsTableExtendCellAreaDefines.FnrReplaceParams<D>,
    ) => void;
    export type FnrReplaceAll<D = any> = (
      params: AsTableExtendCellAreaDefines.FnrReplaceAllParams<D>,
    ) => void;
    export type CellAreaCopy<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaCopyParams<D>,
    ) => void;
    export type CellAreaCut<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaCutParams<D>,
    ) => void;
    export type CellAreaPaste<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaPasteParams<D>,
    ) => void;
    export type CellAreaMerge<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaMergeEventParams<D>,
    ) => void;
    export type ClearCellAreaMerge<D = any> = (
      params: AsTableExtendCellAreaDefines.ClearCellAreaMergeEventParams<D>,
    ) => void;
    export type ClearCellAreaSelection<D = any> = (
      params: AsTableExtendCellAreaDefines.ClearCellAreaSelectionEventParams<D>,
    ) => void;
    export type HeaderCellAreaSelection<D = any> = (
      params: AsTableExtendCellAreaDefines.HeaderCellAreaSelectionEventParams<D>,
    ) => void;
    export type CellAreaSelectionInvalid<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaSelectionInvalidEventParams<D>,
    ) => void;
    export type CellAreaSelectionStart<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaSelectionStartEventParams<D>,
    ) => void;
    export type CellAreaSelectionDrag<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaSelectionDragEventParams<D>,
    ) => void;
    export type CellAreaSelectionEnd<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaSelectionEndEventParams<D>,
    ) => void;
    export type CellAreaExtensionStart<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaExtensionStartEventParams<D>,
    ) => void;
    export type CellAreaExtensionDrag<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaExtensionDragEventParams<D>,
    ) => void;
    export type CellAreaExtensionEnd<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaExtensionEndEventParams<D>,
    ) => void;
    export type CellAreaExtensionFill<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaExtensionFillEventParams<D>,
    ) => void;
    export type CellAreaSelectionAllStart<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaSelectionAllStartEventParams<D>,
    ) => void;
    export type CellAreaSelectionAllEnd<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaSelectionAllEndEventParams<D>,
    ) => void;
    export type CellAreaArrowsStart<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaArrowsStartEventParams<D>,
    ) => void;
    export type CellAreaArrowsEnd<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaArrowsEndEventParams<D>,
    ) => void;
    export type CellAreaFillCopy<D = any> = (
      params: AsTableExtendCellAreaDefines.CellAreaFillCopyEventParams<D>,
    ) => void;
    export type ActiveCellChangeStart<D = any> = (
      params: AsTableExtendCellAreaDefines.ActiveCellChangeStartEventParams<D>,
    ) => void;
    export type ActiveCellChangeEnd<D = any> = (
      params: AsTableExtendCellAreaDefines.ActiveCellChangeEndEventParams<D>,
    ) => void;
  }
}

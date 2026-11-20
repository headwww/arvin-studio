import type {
  ComponentPublicInstance,
  ComputedRef,
  Ref,
  RenderFunction,
  SetupContext,
  VNode,
} from 'vue';

import type { AsGlobalRendererOptions } from '@arvin-studio/core';

import type { ComponentBaseProps } from '../../config-provider/context';
import type { SizeType } from '../../config-provider/size-context';
import type {
  AsSharedTooltipInstance,
  AsSharedTooltipPropTypes,
} from '../../tooltip/shared-tooltip';
import type {
  AsColumnProps,
  AsColumnPropTypes,
  AsColumnSlotTypes,
} from './column';
import type {
  AsComponentAlignType,
  AsComponentEventParams,
  AsComponentSlotType,
  AsComponentStyleType,
} from './common';
import type { AsTableExtendCellAreaDefines } from './extend-cell-area';

export interface AsTableConstructor<D = any> extends AsTableMethods {
  // TODO 类型
  asGantt: any;
  // TODO 类型
  asGrid: any;
  context: SetupContext<AsTableEmits>;
  getComputeMaps(): TablePrivateComputed;
  getRefMaps(): TablePrivateRef;
  internalData: TableInternalData<D>;
  prefixCls: ComputedRef<string>;
  props: AsTableProps;
  reactData: TableReactData;
  renderVN: RenderFunction;
  xID: string;
}

export interface TableReactData<D = any> {
  aggHandleAggColumns: AsTableDefines.ColumnInfo[];
  aggHandleFields: string[];
  calcCellHeightFlag: number;
  checkboxColumn: AsTableDefines.ColumnInfo<D> | null | undefined;
  // 存放列相关的信息
  columnStore: {
    autoList: AsTableDefines.ColumnInfo<D>[];
    autoMinList: AsTableDefines.ColumnInfo<D>[];
    centerList: AsTableDefines.ColumnInfo<D>[];
    leftList: AsTableDefines.ColumnInfo<D>[];
    pxList: AsTableDefines.ColumnInfo<D>[];
    pxMinList: AsTableDefines.ColumnInfo<D>[];
    remainList: AsTableDefines.ColumnInfo<D>[];
    resizeList: AsTableDefines.ColumnInfo<D>[];
    rightList: AsTableDefines.ColumnInfo<D>[];
    scaleList: AsTableDefines.ColumnInfo<D>[];
    scaleMinList: AsTableDefines.ColumnInfo<D>[];
  };
  // 存放快捷菜单的信息
  ctxMenuStore: {
    [key: string]: any;
    list: AsTableDefines.MenuFirstOption[][];
    selectChild:
      | AsTableDefines.MenuChildOption
      | AsTableDefines.MenuFirstOption
      | null;
    selected: any;
    showChild: boolean;
    style: any;
    visible: boolean;
  };
  currColFlag: number;
  // 个性化设置相关的信息
  customStore: AsTableDefines.AsTableCustomStoreObj;
  dragCol: AsTableDefines.ColumnInfo | null;
  dragRow: any;
  dragTipText: string;
  // 存放可编辑相关信息
  editStore: {
    // 激活
    actived: {
      [key: string]: any;
      column: AsTableDefines.ColumnInfo | null;
      row: D | null;
    };
    // 已复制源
    copyed: {
      [key: string]: any;
      columns: AsTableDefines.ColumnInfo[];
      cut: boolean;
      rows: D[];
    };
    // 当前被强制聚焦单元格，只会在鼠标点击后算聚焦
    focused: {
      [key: string]: any;
      column: AsTableDefines.ColumnInfo | null;
      row: D | null;
    };
    indexs: {
      columns: AsTableDefines.ColumnInfo[];
    };
    // 选中源
    selected: {
      [key: string]: any;
      column: AsTableDefines.ColumnInfo | null;
      row: D | null;
    };
    titles: {
      columns: AsTableDefines.ColumnInfo[];
    };
  };
  // 展开列信息
  expandColumn: AsTableDefines.ColumnInfo<D> | null | undefined;
  // 当前选中的筛选列
  filterStore: AsTableDefines.FilterStoreObj;
  // 表尾合计数据
  footerTableData: any[][];
  hasFixedColumn: boolean;
  insertRowFlag: number;
  isAllOverflow: boolean;
  // 复选框属性，是否全选
  isAllSelected: boolean;
  isColLoading: boolean;
  isCrossDragRow: boolean;
  isCustomStatus: boolean;
  isDragResize: boolean;
  // 是否使用分组表头
  isGroup: boolean;
  // 复选框属性，有选中且非全选状态
  isIndeterminate: boolean;
  isRowGroupStatus: boolean;
  isRowLoading: boolean;
  isScrollXBig: boolean;
  isScrollYBig: boolean;
  lazScrollLoading: boolean;
  // 已合并单元格数据集合
  mergeBodyCellMaps: Record<string, AsTableDefines.MergeCacheItem>;
  mergeBodyFlag: number;
  mergeFootFlag: number;
  mergeHeadFlag: number;
  // 是否存在横向滚动条
  overflowX: boolean;
  // 是否存在纵向滚动条
  overflowY: boolean;
  // 表格父容器的高度
  parentHeight: number;
  pendingRowFlag: number;
  radioColumn: AsTableDefines.ColumnInfo<D> | null | undefined;
  // 刷新列标识，当列的特定属性被改变时，触发表格刷新列
  reColumnFlag: number;
  removeRowFlag: number;
  resizeHeightFlag: number;
  resizeWidthFlag: number;
  rowExpandedFlag: number;
  rowExpandHeightFlag: number;
  // 行分组列信息
  rowGroupColumn: AsTableDefines.ColumnInfo<D> | null | undefined;
  rowGroupExpandedFlag: number;
  rowGroupList: AsTableDefines.RowGroupItem[];
  rowHeightStore: {
    large: number;
    medium: number;
    small: number;
  };
  // 横向滚动条的高度
  scrollbarHeight: number;
  // 纵向滚动条的宽度
  scrollbarWidth: number;
  scrollVMLoading: boolean;
  scrollXLeft: number;
  // 是否启用了横向 X 可视渲染方式加载
  scrollXLoad: boolean;
  scrollXWidth: number;
  scrollYHeight: number;
  // 是否启用了纵向 Y 可视渲染方式加载
  scrollYLoad: boolean;
  scrollYTop: number;
  // 单选框属性，选中行
  selectRadioRow: D | null;
  // 低性能的静态列
  staticColumns: any[];
  // 可视区渲染的列
  tableColumn: AsTableDefines.ColumnInfo[];
  // 渲染中的数据
  tableData: D[];
  // 渲染的列分组
  tableGroupColumn: AsTableDefines.ColumnInfo[];
  // 存放 tooltip 相关信息
  tooltipStore: {
    column: AsTableDefines.ColumnInfo | null;
    content: string;
    currOpts: {
      enterable?: AsSharedTooltipPropTypes.Enterable;
      useHtml?: AsSharedTooltipPropTypes.UseHtml;
    };
    row: D | null;
    type: 'body' | 'footer' | 'header' | null;
    visible: boolean;
  };

  treeExpandedFlag: number;
  // 树节点列信息
  treeNodeColumn: any;
  // 刷新列标识，当列筛选被改变时，触发表格刷新数据
  upDataFlag: number;
  updateCheckboxFlag: number;
  updateColFlag: number;
  validErrorMaps: {
    [key: string]: {
      column: AsTableDefines.ColumnInfo;
      content: string;
      row: D;
      rule: any;
    };
  };
  // 存放数据校验相关信息
  validStore: {
    visible: boolean;
  };
}

export interface TableInternalData<D = any> {
  _keyCtx?: any;
  _lastCallTime?: any;
  _lastResizeTime?: any;
  _sToTime?: any;
  afterFullData: D[];
  // 列表条件处理后数据集合
  afterFullRowMaps: Record<string, D>;

  afterGroupFullData: D[];
  afterTreeFullData: D[];
  // 复选框属性，已选中保留的行
  checkboxReserveRowMap: any;
  // 收集的列配置（带分组）
  collectColumn: AsTableDefines.ColumnInfo<D>[];
  currentCol: AsTableDefines.ColumnInfo | null;
  // 当前行
  currentRow: D | null;
  /**
   * 行主键的【字段名】，仅表示"用哪个字段作为行 id"，不是 id 本身
   * 优先级：props.rowId > rowConfig.keyField > '_X_ROW_KEY'
   * 写入见 handleKeyField()，字段变更会触发 reloadData（watch(computeRowField)）
   */
  currKeyField: string;
  customHeight: number;
  customMaxHeight: number;
  customMinHeight: number;

  // 单元格值缓存
  cvCacheMaps: Record<string, any>;
  elemStore: {
    [key: string]: null | Ref<ComponentPublicInstance> | Ref<HTMLElement>;
  }; // 内部属性
  footerFullDataRowData: Record<string, AsTableDefines.FooterRowCacheItem>;
  // 全量数据集（包括当前和已删除）
  fullAllDataRowIdData: Record<string, AsTableDefines.RowCacheItem<D>>;

  fullCellHeightMaps: Record<string, Record<string, number>>;
  fullCellStoreMaps: Record<
    string,
    Record<
      string,
      {
        result: Record<string, any>;
        value: any;
      }
    >
  >;
  fullColumnFieldData: Record<string, AsTableDefines.ColumnCacheItem<D>>;
  fullColumnIdData: Record<string, AsTableDefines.ColumnCacheItem<D>>;
  // 数据集（仅当前）
  fullDataRowIdData: Record<string, AsTableDefines.RowCacheItem<D>>;
  headerFullDataColData: Record<string, AsTableDefines.HeaderColCacheItem>;
  // 当前 hover 行
  hoverRow: D | null;
  inBodyScroll?: boolean;
  inFooterScroll?: boolean;
  inHeaderScroll?: boolean;
  // 特殊标识
  inited: boolean;
  initStatus: boolean;

  // 已新增的临时行
  insertRowMaps: Record<string, D | null>;
  // 滚动属性
  intoRunScroll?: boolean;
  inVirtualScroll?: boolean;
  inWheelScroll?: boolean;

  isActivated: boolean;

  isCurrDeepKey: boolean;
  isResizeCellHeight?: boolean;
  keepUpdateFieldMaps: Record<string, number>;
  keyCtxTimeout?: number | undefined;
  // 最后滚动位置
  lastScrollLeft: number;

  lastScrollTop: number;

  // 最后滚动时间戳
  lastSTime: number;
  lcsRunTime?: number | undefined;
  // 同步滚动
  lcsTimeout?: number | undefined;
  // 横向虚拟
  lxRunTime?: number | undefined;
  lxTimeout?: number | undefined;
  // 纵向虚拟
  lyRunTime?: number | undefined;
  lyTimeout?: number | undefined;
  // 已合并单元格数据集合
  mergeBodyCellMaps: Record<string, AsTableDefines.MergeCacheItem>;

  mergeBodyColMaps: Record<string, AsTableDefines.MergeCacheCol>;
  // 合并单元格的数据
  mergeBodyList: AsTableDefines.MergeItem<D>[];

  mergeBodyMaps: Record<string, AsTableDefines.MergeItem>;
  mergeBodyRowMaps: Record<string, AsTableDefines.MergeCacheRow>;
  // 已合并表尾数据集合
  mergeFooterCellMaps: Record<string, AsTableDefines.MergeCacheItem>;
  mergeFooterColMaps: Record<string, AsTableDefines.MergeCacheCol>;
  // 合并表尾单元格的数据
  mergeFooterList: AsTableDefines.MergeItem<D>[];
  mergeFooterMaps: Record<string, AsTableDefines.MergeItem>;
  mergeFooterRowMaps: Record<string, AsTableDefines.MergeCacheRow>;

  // 已合并单元格数据集合
  mergeHeaderCellMaps: Record<string, AsTableDefines.MergeCacheItem>;
  mergeHeaderColMaps: Record<string, AsTableDefines.MergeCacheCol>;
  // 合并表头单元格的数据
  mergeHeaderList: AsTableDefines.MergeItem<D>[];
  mergeHeaderMaps: Record<string, AsTableDefines.MergeItem>;
  mergeHeaderRowMaps: Record<string, AsTableDefines.MergeCacheRow>;

  // 已标记的对象集
  pendingRowMaps: Record<string, D | null>;

  // 上一个拖动的列
  prevDragCol?: AsTableDefines.ColumnInfo | null;
  prevDragPos?: '' | 'bottom' | 'left' | 'right' | 'top';
  // 上一个拖动的行
  prevDragRow?: any;
  prevDragToChild?: boolean;
  // 单选框属性，已选中保留的行
  radioReserveRow: any;
  // 刷新布局
  rceDelay: number;
  // 上一次 handleRecalculateStyle 跑完的时间戳
  rceRunTime?: number | undefined;
  rceTimeout?: number | undefined;
  // 已删除行
  removeRowMaps: Record<string, D | null>;
  // 已展开的行
  rowExpandedMaps: Record<string, D | null>;

  // 行数据，已展开保留的行集合
  rowExpandedReserveRowMap: Record<string, D>;
  // 懒加载中的展开行
  rowExpandLazyLoadedMaps: Record<string, D | null>;
  // 已展开的分组行
  rowGroupExpandedMaps: Record<string, D | null>;
  rsePending?: boolean;
  scrollRenderType?: '' | 'left' | 'right';
  // 存放横向 X 虚拟滚动相关的信息
  scrollXStore: {
    endIndex: number;
    offsetSize: number;
    preloadSize: number;
    startIndex: number;
    visibleEndIndex: number;
    visibleSize: number;
    visibleStartIndex: number;
  };
  // 存放纵向 Y 虚拟滚动相关信息
  scrollYStore: {
    adaptive?: boolean;
    endIndex: number;
    offsetSize: number;
    preloadSize: number;
    startIndex: number;
    visibleEndIndex: number;
    visibleSize: number;
    visibleStartIndex: number;
  };
  // 复选框属性，已选中的行集合
  selectCheckboxMaps: Record<string, D>;
  sourceDataRowIdData: Record<string, D>;
  stackHistoryStore: {
    redoStacks: AsTableDefines.HistoryStackObj<D>[];
    undoStacks: AsTableDefines.HistoryStackObj<D>[];
  };
  // 完整所有列（不带分组）
  tableFullColumn: AsTableDefines.ColumnInfo<D>[];
  // 列表完整数据、条件处理后
  tableFullData: D[];
  // 行分组全量数据、条件处理后
  tableFullGroupData: D[];
  // 树的全量数据、条件处理后
  tableFullTreeData: D[];

  // 表格高度
  tableHeight: number;
  tableSourceData: [];
  tableSynchData: D[];
  // 表格宽度
  tableWidth: number;

  // 表体高度
  tBodyHeight: number;
  teleportToWrapperElem: HTMLElement | null;

  // 表尾高度
  tFooterHeight: number;
  // 表头高度
  tHeaderHeight: number;
  tooltipTimeout: any;
  // 展开手风琴
  treeEATime?: number | undefined;
  // 已展开树节点
  treeExpandedMaps: Record<string, D | null>;
  // 树结构数据，已展开保留的行集合
  treeExpandedReserveRowMap: Record<string, D>;
  // 懒加载中的树节点的集合
  treeExpandLazyLoadedMaps: Record<string, D | null>;
  // 树结构数据，不确定状态的集合
  treeIndeterminateRowMaps: Record<string, D>;
  tZindex: number;
  // 渲染所有列
  visibleColumn: AsTableDefines.ColumnInfo<D>[];
  // 数据集（仅可视）
  visibleDataRowIdData: Record<string, D>;
}

export interface TablePrivateComputed<D = any> {
  computeAggFuncColumns: ComputedRef<AsTableDefines.ColumnInfo[]>;
  computeAggregateAccuracyOpts: ComputedRef<AsTablePropTypes.AggregateAccuracyConfig>;
  computeAggregateOpts: ComputedRef<AsTablePropTypes.AggregateConfig>;
  computeAreaOpts: ComputedRef<AsTablePropTypes.AreaOpts>;
  computeBodyMenu: ComputedRef<AsTableDefines.MenuFirstOption>;
  computeBodyMergeCoverFixed: ComputedRef<boolean>;
  computeCellOffsetWidth: ComputedRef<number>;
  computeCellOpts: ComputedRef<AsTablePropTypes.CellConfig>;
  computeCheckboxOpts: ComputedRef<AsTablePropTypes.CheckboxOpts<D>>;
  computeClipOpts: ComputedRef<AsTablePropTypes.ClipOpts<D>>;
  computeColumnDragOpts: ComputedRef<AsTablePropTypes.ColumnDragConfig>;
  computeColumnOpts: ComputedRef<AsTablePropTypes.ColumnOpts>;
  computeCurrentColumnOpts: ComputedRef<AsTablePropTypes.CurrentColumnConfig>;
  computeCurrentRowOpts: ComputedRef<AsTablePropTypes.CurrentRowConfig>;
  computeCustomOpts: ComputedRef<AsTablePropTypes.CustomOpts<D>>;
  computeCustomSimpleMode: ComputedRef<
    '' | 'auto' | 'inside' | 'outside' | null
  >;
  computeDefaultRowHeight: ComputedRef<number>;
  computeEditDirtyOpts: ComputedRef<AsTablePropTypes.EditDirtyConfig>;
  computeEditOpts: ComputedRef<AsTablePropTypes.EditOpts<D>>;
  computeEmptyOpts: ComputedRef<AsTablePropTypes.EmptyOpts>;
  computeExpandOpts: ComputedRef<AsTablePropTypes.ExpandOpts<D>>;
  computeExportOpts: ComputedRef<AsTablePropTypes.ExportOpts>;
  computeFilterOpts: ComputedRef<AsTablePropTypes.FilterOpts<D>>;
  computeFixedColumnSize: ComputedRef<number>;
  computeFloatingFilterOpts: ComputedRef<
    AsTablePropTypes.FloatingFilterConfig<D>
  >;
  computeFnrOpts: ComputedRef<AsTablePropTypes.FNROpts<D>>;
  computeFooterCellOpts: ComputedRef<AsTablePropTypes.FooterCellConfig>;
  computeFooterMenu: ComputedRef<AsTableDefines.MenuFirstOption>;
  computeFooterTooltipOpts: ComputedRef<
    AsTablePropTypes.FooterTooltipConfig<D>
  >;
  computeHeaderCellOpts: ComputedRef<AsTablePropTypes.HeaderCellConfig>;
  computeHeaderMenu: ComputedRef<AsTableDefines.MenuFirstOption>;
  computeHeaderTooltipOpts: ComputedRef<
    AsTablePropTypes.HeaderTooltipConfig<D>
  >;
  computeImportOpts: ComputedRef<AsTablePropTypes.ImportOpts>;
  computeIsAllCheckboxDisabled: ComputedRef<boolean>;
  computeIsBodyRenderOptimize: ComputedRef<boolean>;
  computeIsContentMenu: ComputedRef<boolean>;
  computeIsFooterRenderOptimize: ComputedRef<boolean>;
  computeIsHeaderRenderOptimize: ComputedRef<boolean>;
  computeIsMaxFixedColumn: ComputedRef<boolean>;
  computeKeepFields: ComputedRef<string[]>;
  computeKeyboardOpts: ComputedRef<AsTablePropTypes.KeyboardOpts>;
  computeLeftFixedWidth: ComputedRef<number>;
  computeLoadingOpts: ComputedRef<AsTablePropTypes.LoadingOpts>;
  computeMenuList: ComputedRef<any[]>;
  computeMenuOpts: ComputedRef<AsTablePropTypes.MenuOpts<D>>;
  computeMouseOpts: ComputedRef<AsTablePropTypes.MouseOpts>;
  computePrintOpts: ComputedRef<AsTablePropTypes.PrintOpts>;
  computeRadioOpts: ComputedRef<AsTablePropTypes.RadioOpts<D>>;
  computeRendererOpts: ComputedRef<AsTablePropTypes.RendererConfig>;
  computeResizableOpts: ComputedRef<AsTablePropTypes.ResizableOpts<D>>;
  computeResizeOpts: ComputedRef<AsTablePropTypes.ResizeOpts>;
  computeRightFixedWidth: ComputedRef<number>;
  computeRowDragOpts: ComputedRef<AsTablePropTypes.RowDragConfig>;
  computeRowField: ComputedRef<string>;
  computeRowGroupColumns: ComputedRef<AsTableDefines.ColumnInfo[]>;
  computeRowGroupFields: ComputedRef<null | string[] | undefined>;
  computeRowHeightMaps: ComputedRef<{
    large: number;
    medium: number;
    small: number;
  }>;
  computeRowOpts: ComputedRef<AsTablePropTypes.RowOpts>;
  computeScrollbarOpts: ComputedRef<AsTablePropTypes.ScrollbarConfig>;
  computeScrollbarXOpts: ComputedRef<AsTablePropTypes.ScrollbarXConfig>;
  computeScrollbarXToTop: ComputedRef<boolean>;
  computeScrollbarYOpts: ComputedRef<AsTablePropTypes.ScrollbarYConfig>;
  computeScrollbarYToLeft: ComputedRef<boolean>;
  computeScrollXThreshold: ComputedRef<number>;
  computeScrollYThreshold: ComputedRef<number>;
  computeSeqOpts: ComputedRef<AsTablePropTypes.SeqOpts<D>>;
  computeSize: ComputedRef<AsTablePropTypes.Size>;
  computeSortOpts: ComputedRef<AsTablePropTypes.SortConfig<D>>;
  computeTableId: ComputedRef<string>;
  computeTooltipOpts: ComputedRef<AsTablePropTypes.TooltipConfig<D>>;
  computeTreeOpts: ComputedRef<AsTablePropTypes.TreeOpts<D>>;

  computeUndoRedoHistoryOpts: ComputedRef<AsTablePropTypes.UndoRedoHistoryConfig>;
  computeValidOpts: ComputedRef<AsTablePropTypes.ValidOpts<D>>;
  computeVirtualScrollBars: ComputedRef<{
    x: boolean;
    y: boolean;
  }>;
  computeVirtualXOpts: ComputedRef<
    AsTablePropTypes.VirtualXConfig & { gt: number }
  >;
  computeVirtualYOpts: ComputedRef<
    AsTablePropTypes.VirtualYConfig & { gt: number }
  >;
}

export interface AsTablePrivateComputed extends TablePrivateComputed {}

/**
 * 取出对象值类型
 */
export type ValueOf<T> = T extends any[] ? T[number] : T[keyof T];

export interface AsTableExtendCellAreaMethods<D = any> {
  /**
   * @private
   */
  checkFilterOptions(): void;

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
   * 手动清空筛选条件；如果需要同时触发对应的事件，请使用 clearFilterByEvent
   */
  clearFilter(
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<void>;

  /**
   * 手动清除校验
   */
  clearValidate(
    rows?: any,
    fieldOrColumn?:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
  ): Promise<void>;

  /**
   * 手动关闭快捷菜单
   */
  closeMenu(): Promise<any>;

  /**
   * 内部方法
   * @private
   */
  getCellAreaPushStackObj(
    stackObj: AsTableDefines.HistoryStackObj,
  ): AsTableDefines.HistoryStackObj;
  /**
   * 获取当前筛选的所有列信息
   */
  getCheckedFilters(): AsTableDefines.FilterCheckedParams<D>[];
  /**
   * 内部方法
   * @private
   */
  getPivotTableAggregateCellAggValue(params: {
    $table: AsTableConstructor<D> & AsTablePrivateMethods<D>;
    column: AsTableDefines.ColumnInfo;
    row: any;
  }): string;
  /**
   * 内部方法
   * @private
   */
  handleCellAreaSnapshotStackData(
    stackObj: AsTableDefines.HistoryStackObj,
  ): void;
  /**
   * @private
   */
  handleClearFilter(column: AsTableDefines.ColumnInfo): void;
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
   * @private
   */
  handleColumnConfirmFilter(
    column: AsTableDefines.ColumnInfo,
    evnt: Event | null,
  ): Promise<any>;
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
   * @private
   */
  handleFilterStyle(): Promise<any>;
  /**
   * @private
   */
  handleGlobalContextmenuEvent(evnt: Event): void;

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
  handlePivotTableAggData(aggList: AsTableDefines.AggregateRowInfo[]): void;

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
  handleUpdateCustomColumn(): void;
  hasCellRules(type: any, row: any, column: AsTableDefines.ColumnInfo): boolean;
  /**
   * @private
   */
  moveCtxMenu(
    evnt: KeyboardEvent,
    ctxMenuStore: any,
    property: 'selectChild' | 'selected',
    hasOper: boolean,
    operRest: any,
    menuList: any[],
  ): void;
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
  showValidTooltip(params: any): void;
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

  triggerValidate(type: any): Promise<any>;
  validCellRules(
    type: any,
    row: any,
    column: AsTableDefines.ColumnInfo,
    val?: any,
  ): Promise<any>;
}

export interface TableMethods<
  DT = any,
> extends AsTableExtendCellAreaMethods<DT> {
  /**
   * 使表格失去焦点
   */
  blur(): Promise<void>;
  /**
   * 手动清除表格所有条件，还原到初始状态
   * 对于增删改查的场景中可能会用到，比如在数据保存之后清除表格缓存
   */
  clearAll(): Promise<void>;
  /**
   * 用于 checkbox-config.reserve，手动清空用户保留选中的行数据
   */
  clearCheckboxReserve(): Promise<any>;
  /**
   * 用于 type=checkbox，手动清空用户的选择
   */
  clearCheckboxRow(): Promise<any>;
  /**
   * 取消指定的固定列
   * @param fieldOrColumns 列对象或字段名,支持传多个
   */
  clearColumnFixed(
    fieldOrColumns:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
  ): Promise<void>;
  /**
   * 用于 column-config.isCurrent，手动清空当前高亮的状态
   */
  clearCurrentColumn(): Promise<void>;
  /**
   * 用于 row-config.isCurrent，手动清空当前高亮的状态
   */
  clearCurrentRow(): Promise<any>;
  /**
   * 手动清空单元格内容，如果不传参数，则清空整个表格内容，如果传了行则清空指定行内容，如果传了指定字段，则清空该字段内容
   * @param rows 指定行
   * @param field 字段名
   */
  clearData(rows?: any | any[], field?: string): Promise<any>;
  /**
   * 区别就是会触发对应的事件
   */
  clearFilterByEvent(
    event: Event,
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<void>;
  /**
   * 清除表尾单元格格式化缓存
   */
  clearFooterFormatterCache(isUpdate?: boolean): Promise<void>;
  /**
   * 清除单元格格式化缓存
   */
  clearFormatterCache(isUpdate?: boolean): Promise<void>;
  /**
   * 清除表头单元格格式化缓存
   */
  clearHeaderFormatterCache(isUpdate?: boolean): Promise<void>;
  /**
   * 清除历史记录，清除后不可撤销和重做
   */
  clearHistory(): Promise<void>;
  /**
   * 手动清除临时合并的单元格
   */
  clearMergeCells(): Promise<any>;
  /**
   * 手动清除临时合并的表尾单元格
   */
  clearMergeFooterCells(): Promise<any>;
  clearMergeFooterItems(): Promise<any>;
  /**
   * 手动清除临时合并的表头单元格
   */
  clearMergeHeaderCells(): Promise<any>;
  /**
   * 清除所有标记状态
   */
  clearPendingRow(): Promise<any>;
  /**
   * 用于 radio-config.reserve，手动清空用户保留选中的行数据
   */
  clearRadioReserve(): Promise<any>;
  /**
   * 用于 type=radio，手动清空用户的选择
   */
  clearRadioRow(): Promise<any>;
  /**
   * 用于 type=expand，手动清空展开行状态，数据会恢复成未展开的状态
   */
  clearRowExpand(): Promise<void>;
  /**
   * 用于 expand-config.lazy，手动清空懒加载展开行的状态，数据会恢复成未展开的状态，当再次展开时会重新加载
   */
  clearRowExpandLoaded(row: any): Promise<void>;
  /**
   * 用于 type=expand，手动清空用户保留行的展开状态
   */
  clearRowExpandReserve(): Promise<void>;
  /**
   * 用于行分组，手动清空所有行分组展开状态
   */
  clearRowGroupExpand(): Promise<void>;
  /**
   * 清除行分组
   */
  clearRowGroups(): Promise<void>;
  /**
   * 手动清除滚动相关信息，还原到初始状态
   */
  clearScroll(): Promise<any>;
  /**
   * 手动清空排序条件，数据会恢复成未排序的状态；如果需要同时触发对应的事件，请使用 clearSortByEvent
   */
  clearSort(
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<void>;
  /**
   * 区别就是会触发对应的事件
   */
  clearSortByEvent(
    event: Event,
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<void>;
  /**
   * 用于 tree-config，手动清空树形节点的展开状态，数据会恢复成未展开的状态
   */
  clearTreeExpand(): Promise<void>;
  /**
   * 用于 tree-config.lazy，手动清空懒加载树节点的状态，数据会恢复成未展开的状态，当再次展开时会重新加载
   */
  clearTreeExpandLoaded(rows: any | any[]): Promise<any>;
  /**
   * 用于 tree-config.reserve，手动清空用户保留树节点的展开状态
   */
  clearTreeExpandReserve(): Promise<void>;
  /**
   * 手动关闭筛选面板
   */
  closeFilter(): Promise<any>;
  /**
   * 关闭 tooltip 提示
   */
  closeTooltip(): Promise<any>;
  /**
   * 创建 data 对象
   * 对于某些特殊场景可能会用到，会自动对数据的字段名进行检测，如果不存在就自动定义
   * @param records 数据
   */
  createData(records: any[]): Promise<any[]>;
  /**
   * 创建 Row|Rows 对象
   * 对于某些特殊场景需要对数据进行手动插入时可能会用到
   * @param records 数据
   */
  createRow(records: any | any[]): Promise<any | any[]>;
  dispatchEvent(
    type: ValueOf<AsTableEmits>,
    params: Record<string, any>,
    evnt: Event | null,
  ): void;
  /**
   * 处理单元格数据，会自动在值发生改变时执行（当需要对运算量较大的数据进行缓存时可能会用到）
   */
  effectCellData(
    row: any,
    column: AsTableDefines.ColumnInfo,
    options: AsTableDefines.CellCacheHandleOptions,
  ): AsTableDefines.CellCacheResultObj;
  /**
   * 使表格获取焦点
   */
  focus(): Promise<void>;
  /**
   * 用于数据聚合，获取分组行的内容
   */
  getAggregateContentByRow(row: any): string;
  /**
   * 用于数据聚合，获取分组行的子行
   */
  getAggregateRowChildren(row: any): DT[];
  /**
   * 获取单元格 td 元素
   */
  getCellElement(
    row: any,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): HTMLElement | null;
  /**
   * 获取单元格显示值
   */
  getCellLabel(
    row: any,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): null | number | string;
  /**
   * 用于 type=checkbox，获取半选状态的行数据；如果 isFull=true 则包含完整当前列表（包含筛选）；否则返回当前列表
   */
  getCheckboxIndeterminateRecords(isFull?: boolean): any[];
  /**
   * 用于 type=checkbox，获取已选中的行数据；如果 isFull=true 则包含完整当前列表（包含筛选）；否则返回当前列表
   */
  getCheckboxRecords(isFull?: boolean): DT[];
  /**
   * 用于 checkbox-config.reserve，获取已保留选中的行数据；如果 isFull=true 则包含完整当前列表（包含筛选）；否则返回当前列表
   */
  getCheckboxReserveRecords(isFull?: boolean): any[];
  /**
   * 根据列获取列的唯一主键
   * @param fieldOrColumn
   */
  getColid(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): null | string;
  /**
   * 根据列的字段名获取列
   * @param field 字段名
   */
  getColumnByField(
    field: AsColumnPropTypes.Field | null,
  ): AsTableDefines.ColumnInfo | null;
  /**
   * 根据列的唯一主键获取列
   * @param colid 列主键
   */
  getColumnById(colid: null | string): AsTableDefines.ColumnInfo | null;
  /**
   * 根据 column 获取相对于 columns 中的索引
   * @param column 列对象
   */
  getColumnIndex(column: AsTableDefines.ColumnInfo | null): number;
  /**
   * 根据 th/td 元素获取对应的 column 信息
   * @param cell 单元格节点元素
   */
  getColumnNode(cellElem: HTMLElement): null | {
    colid: string;
    index: number;
    item: AsTableDefines.ColumnInfo;
    items: AsTableDefines.ColumnInfo[];
    parent: AsTableDefines.ColumnInfo | null;
  };
  /**
   * 获取表格的可视列，也可以指定索引获取列
   * @param columnIndex 列索引
   */
  getColumns(): AsTableDefines.ColumnInfo[];
  getColumns(columnIndex?: number): AsTableDefines.ColumnInfo;
  /**
   * 获取列宽
   * @param fieldOrColumn 列对象或字段名
   */
  getColumnWidth(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
  ): number;
  /**
   * 用于 column-config.isCurrent，获取当前列
   */
  getCurrentColumn(): AsTableDefines.ColumnInfo | null;
  /**
   * 用于 row-config.isCurrent，获取当前行的行数据
   */
  getCurrentRecord(isFull?: boolean): DT | null;
  /**
   * 用于 custom-config，用于获取个性化设置，用于自定义保持
   */
  getCustomStoreData(): AsTableDefines.CustomStoreData;
  /**
   * 获取数据，和 data 的行为一致，也可以指定索引获取数据
   */
  getData(): DT[];
  getData(rowIndex: number): DT;
  /**
   * 获取根元素
   */
  getEl(): HTMLDivElement;
  /**
   * 获取表尾单元格显示值
   */
  getFooterCellLabel(
    row: any,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): null | number | string;
  /**
   * 获取表格的全量列
   */
  getFullColumns(): AsTableDefines.ColumnInfo[];
  /**
   * 获取表格的全量数据，如果是 tree-config 则返回带层级的树结构
   */
  getFullData(): DT[];
  /**
   * 获取表头单元格显示值
   */
  getHeaderCellLabel(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): string;
  /**
   * 获取临时合并的单元格
   */
  getMergeCells(): AsTableDefines.MergeInfo[];
  /**
   * 获取临时合并的表尾单元格
   */
  getMergeFooterCells(): AsTableDefines.MergeInfo[];
  getMergeFooterItems(): AsTableDefines.MergeInfo[];
  /**
   * 获取临时合并的表头单元格
   */
  getMergeHeaderCells(): AsTableDefines.MergeInfo[];
  /**
   * 获取自定义的 params 属性
   */
  getParams(): any;
  /**
   * 根据列获取列的唯一主键
   * @param fieldOrColumn
   */
  getParentColumn(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): AsTableDefines.ColumnInfo | null;
  /**
   * 已废弃，请使用 getTreeParentRow
   * @deprecated
   */
  getParentRow(rowOrRowid: any): DT | null;
  /**
   * 获取待删除状态的数据
   */
  getPendingRecords(): DT[];
  /**
   * 用于 type=radio，获取当已选中的行数据
   */
  getRadioRecord(isFull?: boolean): DT | null;
  /**
   * 用于 radio-config.reserve，获取已保留选中的行数据
   */
  getRadioReserveRecord(isFull?: boolean): DT | null;
  /**
   * 根据行的唯一主键获取行
   * @param rowid 行主键
   */
  getRowById(rowid: null | number | string): DT | null;
  /**
   * 用于 expand-config，用于展开行，获取已展开的行数据
   */
  getRowExpandRecords(): DT[];
  /**
   * 获取行分组列字段
   */
  getRowGroupFields(): AsColumnPropTypes.Field[];
  /**
   * 获取行分组列信息
   */
  getRowGroups(): (
    | AsTableDefines.ColumnInfo
    | {
        field: AsColumnPropTypes.Field;
      }
  )[];
  /**
   * 获取指定行的高度
   * @param rowOrId
   */
  getRowHeight(rowOrId: any): number;
  /**
   * 批量获取行高
   */
  getRowHeightConf(isFull?: boolean): Record<string, number>;
  /**
   * 根据行获取行的唯一主键
   * @param row 行对象
   */
  getRowid(row: any | null): string;
  /**
   * 根据 row 获取相对于 data 中的索引
   * @param row 行对象
   */
  getRowIndex(row: any): number;
  /**
   * 根据 tr 元素获取对应的 row 信息
   * @param tr 行节点元素
   */
  getRowNode(trElem: HTMLElement): null | {
    index: number;
    item: any;
    items: any[];
    parent?: any;
    rowid: string;
  };
  /**
   * 根据 row 获取表格内置的序号
   * @param row 行对象
   */
  getRowSeq(row: any): number | string;
  /**
   * 获取表格的滚动状态
   * @deprecated
   */
  getScroll(): {
    scrollLeft: number;
    scrollTop: number;
    virtualX: boolean;
    virtualY: boolean;
  };
  /**
   * 获取表格的滚动数据
   */
  getScrollData(): {
    clientHeight: number;
    clientWidth: number;
    isBottom: boolean;
    isLeft: boolean;
    isRight: boolean;
    isTop: boolean;
    scrollbarHeight: number;
    scrollbarWidth: number;
    scrollHeight: number;
    scrollLeft: number;
    scrollTop: number;
    scrollWidth: number;
    virtualX: boolean;
    virtualY: boolean;
  };
  /**
   * 获取当前排序的列信息
   */
  getSortColumns(): AsTableDefines.SortCheckedParams[];
  /**
   * 获取当前表格的列
   * 收集到的全量列、全量表头列、处理条件之后的全量表头列、当前渲染中的表头列
   */
  getTableColumn(): {
    collectColumn: AsTableDefines.ColumnInfo[];
    fullColumn: AsTableDefines.ColumnInfo[];
    tableColumn: AsTableDefines.ColumnInfo[];
    visibleColumn: AsTableDefines.ColumnInfo[];
  };
  /**
   * 获取当前表格的数据
   * 完整的全量表体数据、处理条件之后的全量表体数据、当前渲染中的表体数据、当前渲染中的表尾数据
   */
  getTableData(): {
    footerData: DT[];
    fullData: DT[];
    tableData: DT[];
    visibleData: DT[];
  };
  /**
   * 用于 tree-config，用于树表格，获取已展开的节点
   * 注意，即使父节点被收起，只要该节点还处于展开状态都能获取到
   */
  getTreeExpandRecords(): DT[];
  /**
   * 只对 tree-config 有效，用于树形结构，获取指定行的父级
   */
  getTreeParentRow(rowOrRowid: any): DT | null;
  /**
   * 只对 tree-config 有效，用于树形结构，获取指定行的子级
   */
  getTreeRowChildren(rowOrRowid: any): DT[];
  /**
   * 只对 tree-config 有效，用于树形结构，获取指定行的层级
   */
  getTreeRowLevel(rowOrRowid: any): number;
  /**
   * 用于 edit-config，获取已修改的单元格数据
   */
  getUpdateCells(): AsTableDefines.UpdateCellObj<DT>[];
  /**
   * 根据 column 获取渲染中的虚拟索引
   * @param column 列对象
   */
  getVMColumnIndex(column: AsTableDefines.ColumnInfo | null): number;
  /**
   * 根据 row 获取渲染中的虚拟索引
   * @param row 行对象
   */
  getVMRowIndex(row: any): number;
  /**
   * 根据 column 获取相对于当前表格列中的索引
   * @param column 列对象
   */
  getVTColumnIndex(column: AsTableDefines.ColumnInfo | null): number;
  /**
   * 根据 row 获取相对于当前数据中的索引
   * @param row 行对象
   */
  getVTRowIndex(row: any): number;
  /**
   * 请使用 isPendingByRow
   * @deprecated
   */
  hasPendingByRow(row: any): boolean;
  /**
   * 隐藏指定列
   * @param fieldOrColumns 列对象或字段名,支持传多个
   */
  hideColumn(
    fieldOrColumns:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
  ): Promise<void>;
  /**
   * 判断指定列是否为筛选状态，如果为空则判断所有列
   * @param columnOrField 列对象或字段名
   */
  isActiveFilterByColumn(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): boolean;
  /**
   * 用于数据聚合，判断是否展开
   */
  isAggregateExpandByRow(row: any): boolean;
  /**
   * 用于数据聚合，判断是否展开
   */
  isAggregateExpandByRow(row: any): boolean;
  /**
   * 用于数据聚合，判断是为否为聚合的行数据
   */
  isAggregateRecord(row: any): boolean;
  /**
   * 用于 type=checkbox，判断列头复选框是否被选中
   */
  isAllCheckboxChecked(): boolean;
  /**
   * 用于 type=checkbox，判断列头复选框是否被半选
   */
  isAllCheckboxIndeterminate(): boolean;
  /**
   * 用于 type=checkbox，判断复选行数据是否勾选
   * @param row 指定行
   */
  isCheckedByCheckboxRow(row: any): boolean;
  /**
   * 用于 type=checkbox，判断复选行数据是否勾选
   * @param key 指定主键
   */
  isCheckedByCheckboxRowKey(key: null | number | string | undefined): boolean;
  /**
   * 用于 type=radio，判断单选行数据是否勾选
   * @param row 指定行
   */
  isCheckedByRadioRow(row: any | null): boolean;
  /**
   * 用于 type=radio，判断单选行数据是否勾选
   * @param key 指定主键
   */
  isCheckedByRadioRowKey(key: null | number | string | undefined): boolean;
  /**
   * @deprecated 已废弃，请使用 isRowExpandByRow
   */
  isExpandByRow(row: any | null): boolean;
  /**
   * 已废弃，请使用 isActiveFilterByColumn
   * @deprecated
   */
  isFilter(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): boolean;
  /**
   * 用于 type=checkbox，判断复选行数据是否半选
   * @param row 指定行
   */
  isIndeterminateByCheckboxRow(row: any): boolean;
  /**
   * 用于 type=checkbox，判断复选行数据是否半选
   * @param key 指定主键
   */
  isIndeterminateByCheckboxRowKey(
    key: null | number | string | undefined,
  ): boolean;
  /**
   * 用于 edit-config，判断行是否为新增的临时数据
   * @param row 指定行
   */
  isInsertByRow(row: any | null): boolean;
  /**
   * 判断行是否为待删除状态
   * @param row 指定行
   */
  isPendingByRow(row: any): boolean;
  /**
   * 判断行是否被删除
   * @param row 指定行
   */
  isRemoveByRow(row: any | null): boolean;
  /**
   * 用于 expand-config，判断行是否为展开状态
   * @param row 指定行
   */
  isRowExpandByRow(row: any | null): boolean;
  /**
   * 用于 expand-config.lazy，用于懒加载展开行，判断展开行是否懒加载完成
   * @param row 指定行
   */
  isRowExpandLoaded(row: any | null): boolean;
  /**
   * 已废弃，请使用 isAggregateExpandByRow
   * @deprecated
   */
  isRowGroupExpandByRow(row: any): boolean;
  /**
   * 已废弃，请使用 isAggregateRecord
   * @deprecated
   */
  isRowGroupRecord(row: any): boolean;
  /**
   * 判断指定列是否为排序状态，如果为空则判断所有列
   * @param columnOrField 列对象或字段名
   */
  isSort(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
  ): boolean;
  /**
   * 用于 tree-config，判断行是否为树形节点展开状态
   * @param row 指定行
   */
  isTreeExpandByRow(row: any | null): boolean;
  /**
   * 用于 tree-config.lazy，用于懒加载树表格，判断树节点是否懒加载完成
   */
  isTreeExpandLoaded(row: any | null): boolean;
  /**
   * 只对 keep-source 开启有效，判断行数据是否发生改变
   * @param row 指定行
   * @param field 指定字段
   */
  isUpdateByRow(row: any, field?: null | string): boolean;
  /**
   * 加载列配置
   * @param columns 列对象
   */
  loadColumn(
    columns: (AsTableDefines.ColumnInfo | AsTableDefines.ColumnOptions)[],
  ): Promise<any>;
  /**
   * 加载数据
   * @param data 数据
   */
  loadData(data: any[]): Promise<any>;

  /**
   * 用于树结构，给行数据加载子节点
   * @param row 行对象
   * @param children 子节点
   */
  loadTreeChildren(row: any, children: any[]): Promise<any[]>;
  /**
   * 移动列到指定列的位置
   * @param fieldOrColumn
   * @param targetFieldOrColumn 列对象、列字段、移动偏移量
   * @param options
   */
  moveColumnTo(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
    targetFieldOrColumn:
      | AsColumnPropTypes.Field
      | AsTableDefines.ColumnInfo
      | number,
    options?: {
      /**
       * 移动到目标列的左边或右边位置
       */
      dragPos?: '' | 'left' | 'right' | null;
      /**
       * 只对 column-drag-config.isToChildDrag 有效，移动成子级
       */
      dragToChild?: boolean;
      /**
       * 只对 row-drag-config.isCrossDrag 有效，允许跨层级移动
       */
      isCrossDrag?: boolean;
    },
  ): Promise<{
    status: boolean;
  }>;
  /**
   * 移动行到指定行的位置
   * @param rowidOrRow
   * @param targetRowidOrRow 行对象、行主键、移动偏移量
   * @param options
   */
  moveRowTo(
    rowidOrRow: any,
    targetRowidOrRow: any,
    options?: {
      /**
       * 移动到目标行的上方或下方位置
       */
      dragPos?: '' | 'bottom' | 'top' | null;
      /**
       * 只对 row-drag-config.isToChildDrag 有效，移动成子级
       */
      dragToChild?: boolean;
      /**
       * 只对 row-drag-config.isCrossDrag 有效，允许跨层级移动
       */
      isCrossDrag?: boolean;
    },
  ): Promise<{
    status: boolean;
  }>;
  /**
   * 打开 tooltip 提示
   * @param target 目标元素
   * @param content 内容
   */
  openTooltip(target: HTMLElement, content: number | string): Promise<any>;
  /**
   * 手动计算单元格高度，只对自定义行高时有效
   * @param rowOrId 指定单行或多行
   */
  recalcRowHeight(rowOrId: any | any[]): Promise<any>;
  /**
   * 重新计算表格，如果传 true 则进行完整计算
   * 对于某些特殊场景可能会用到，比如隐藏的表格、重新计算列宽...等
   */
  recalculate(refull?: boolean): Promise<void>;
  /**
   * 重做
   */
  redo(): Promise<{ status: boolean }>;
  /**
   * 用于数据聚合，刷新聚合函数计算值
   */
  refreshAggregateCalcValues(): Promise<void>;
  /**
   * 刷新列配置
   * 对于动态修改属性、显示/隐藏列等场景下可能会用到
   * 如果传 true 则会检查列顺序并排序
   */
  refreshColumn(resiveOrder?: boolean): Promise<void>;
  /**
   * 刷新滚动操作，手动同步滚动相关位置
   * 对于某些特殊的操作，比如滚动条错位、固定列不同步
   */
  refreshScroll(): Promise<void>;
  /**
   * 加载列配置并恢复到初始状态
   * @param columns 列对象
   */
  reloadColumn(
    columns: (AsTableDefines.ColumnInfo | AsTableDefines.ColumnOptions)[],
  ): Promise<any>;
  /**
   * 加载数据并恢复到初始状态
   * @param data 数据
   */
  reloadData(data: any[]): Promise<void>;
  /**
   * @deprecated 已废弃，请使用 reloadRowExpand
   */
  reloadExpandContent(row: any): Promise<void>;
  /**
   * 修改行数据并恢复到初始状态，比如编辑之后需要修改成未编辑状态
   * @param rows 行对象
   * @param record 新数据
   * @param field 指定字段名
   */
  reloadRow(rows: any | any[], record?: any, field?: string): Promise<void>;
  /**
   * 重新懒加载展开行，并展开内容
   * @param row 指定行
   */
  reloadRowExpand(row: any): Promise<void>;
  /**
   * @deprecated 已废弃，请使用 reloadTreeExpand
   */
  reloadTreeChilds(row: any): Promise<any>;
  /**
   * 重新懒加载树节点，并展开该节点
   * @param rows 指定行
   */
  reloadTreeExpand(row: any): Promise<any>;
  /**
   * 删除所有新增的临时数据
   */
  removeInsertRow(): Promise<{ row: any; rows: any[] }>;
  /**
   * 取消单元格的临时合并状态，如果为数组，则取消多个合并
   */
  removeMergeCells(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<AsTableDefines.MergeInfo[]>;
  /**
   * 取消表尾单元格的临时合并状态，如果为数组，则取消多个合并
   */
  removeMergeFooterCells(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<AsTableDefines.MergeInfo[]>;
  removeMergeFooterItems(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<AsTableDefines.MergeInfo[]>;
  /**
   * 取消表头单元格的临时合并状态，如果为数组，则取消多个合并
   */
  removeMergeHeaderCells(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<AsTableDefines.MergeInfo[]>;
  /**
   * 已废弃，被 resetCustom 替换
   * @deprecated
   */
  resetColumn(
    options?:
      | boolean
      | {
          fixed?: boolean;
          order?: boolean;
          resizable?: boolean;
          visible?: boolean;
        },
  ): Promise<void>;
  // /**
  //  * 将表格数据转成原始数据
  //  * 会自动去掉主键等内部属性
  //  * @param rows
  //  */
  // toOriginalRecords(rows: any[]): DT[]
  /**
   * 只对 keep-source 开启有效，还原指定行 row 或者整个表格的数据
   * @param rows 指定行
   * @param field 字段名
   */
  revertData(rows?: any | any[], field?: string): Promise<any>;
  /**
   * 如果有滚动条，则滚动到对应的位置
   */
  scrollTo(
    x:
      | null
      | number
      | undefined
      | {
          left?: null | number;
          top?: null | number;
        },
    y?: null | number,
  ): Promise<void>;
  /**
   * 如果有滚动条，则滚动到对应的列
   */
  scrollToColumn(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
    options?: AsTableDefines.ScrollToColumnConfig,
  ): Promise<any>;
  /**
   * 如果有滚动条，则滚动到最后一列
   */
  scrollToEndColumn(
    options?: AsTableDefines.ScrollToColumnConfig,
  ): Promise<any>;
  /**
   * 如果有滚动条，则滚动到最后一行
   */
  scrollToEndRow(
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
    options?: AsTableDefines.ScrollToRowConfig,
  ): Promise<any>;
  /**
   * 如果有滚动条，则滚动到对应的行
   */
  scrollToRow(
    rowOrRowid: any,
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
    options?: AsTableDefines.ScrollToRowConfig,
  ): Promise<any>;
  /**
   * 如果有滚动条，则滚动到第一列
   */
  scrollToStartColumn(
    options?: AsTableDefines.ScrollToColumnConfig,
  ): Promise<any>;
  /**
   * 如果有滚动条，则滚动到第一行
   */
  scrollToStartRow(
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
    options?: AsTableDefines.ScrollToRowConfig,
  ): Promise<any>;
  /**
   * 用于 type=checkbox，设置所有行的选中状态
   * @param checked 是否选中
   */
  setAllCheckboxRow(checked: boolean): Promise<any>;
  /**
   * 用于 expand-config，设置所有行的展开与否
   * 如果是关闭所有行，可以使用 clearRowExpand 快速清除
   * @param checked 是否选中
   */
  setAllRowExpand(checked: boolean): Promise<void>;
  /**
   * 用于行分组，设置所有行分组的展开状态
   * @param expanded 是否展开
   */
  setAllRowGroupExpand(expanded: boolean): Promise<void>;
  /**
   * 用于 tree-config，设置所有树节点的展开与否
   * 如果是关闭所有树节点，可以使用 clearTreeExpand 快速清除
   * @param checked 是否选中
   */
  setAllTreeExpand(checked: boolean): Promise<void>;
  /**
   * 用于 type=checkbox，设置行为选中状态，第二个参数为选中与否
   * @param rows 指定行
   * @param checked 是否选中
   */
  setCheckboxRow(rows: any | any[], checked: boolean): Promise<any>;
  /**
   * 用于 type=checkbox，设置行为选中状态，第二个参数为选中与否
   * @param keys 指定主键
   * @param checked 是否选中
   */
  setCheckboxRowByKey(
    keys: (number | string)[] | null | number | string | undefined,
    checked: boolean,
  ): Promise<any>;
  // 后续可能废弃
  setCheckboxRowKey(
    keys: (number | string)[] | null | number | string | undefined,
    checked: boolean,
  ): Promise<any>;
  /**
   * 设置指定列为固定列
   * @param fieldOrColumns 列对象或字段名,支持传多个
   */
  setColumnFixed(
    fieldOrColumns:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
    fixed: AsColumnPropTypes.Fixed,
  ): Promise<void>;
  /**
   * 设置列宽
   * @param fieldOrColumns 列对象或字段名,支持传多个
   * @param width 宽度 %，px
   */
  setColumnWidth(
    fieldOrColumns:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
    width: number | string,
  ): Promise<{ status: boolean }>;
  /**
   * 用于 column-config.isCurrent，设置某列行为高亮状态
   * @param columnOrField 列对象或字段名
   */
  setCurrentColumn(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
  ): Promise<void>;
  /**
   * 用于 row-config.isCurrent，设置某一行为高亮状态
   * @param row 指定行
   */
  setCurrentRow(row: any): Promise<any>;
  /**
   * 用于 custom-config，用于手动恢复个性化设置，恢复为初始状态
   */
  setCustomStoreData(
    storeData: AsTableDefines.CustomStoreData | null,
  ): Promise<void>;
  /**
   * 区别就是会触发对应的事件
   */
  setFilterByEvent(
    event: Event,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
    options: AsColumnPropTypes.Filters,
  ): Promise<void>;
  /**
   * 临时合并单元格，如果为数组则合并多个
   */
  setMergeCells(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<any>;
  /**
   * 临时合并表尾单元格，如果为数组则合并多个
   */
  setMergeFooterCells(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<any>;
  setMergeFooterItems(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<any>;
  /**
   * 临时合并表头单元格，如果为数组则合并多个
   */
  setMergeHeaderCells(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<any>;
  /**
   * 将指定行设置为取消/标记待删除状态
   */
  setPendingRow(rows: any | any[], status: boolean): Promise<any>;
  /**
   * 用于 type=radio，设置某一行为选中状态
   * @param key 指定主键
   */
  setRadioByRowKey(key: null | number | string | undefined): Promise<any>;
  /**
   * 用于 type=radio，设置某一行为选中状态
   * @param row 指定行
   */
  setRadioRow(row: any): Promise<any>;
  setRadioRowKey(key: null | number | string | undefined): Promise<any>;
  /**
   * 修改行数据
   * @param rows 行对象
   * @param record 新数据
   */
  setRow(rows: any | any[], record?: any): Promise<void>;
  /**
   * 用于 expand-config，设置展开行，二个参数设置这一行展开与否
   * @param rows 指定行
   * @param expanded 是否展开
   */
  setRowExpand(rows: any | any[], expanded: boolean): Promise<void>;
  /**
   * 用于行分组，设置行分组的展开状态，二个参数设置这一行展开与否
   * @param rows 指定行
   * @param expanded 是否展开
   */
  setRowGroupExpand(rows: any | any[], expanded: boolean): Promise<void>;
  /**
   * 用于行分组，根据行分组字段设置分组的展开状态，二个参数设置这一行展开与否
   * @param groupFields 行分组字段
   * @param expanded 是否展开
   */
  setRowGroupExpandByField(
    groupFields: string | string[],
    expanded: boolean,
  ): Promise<void>;
  /**
   * 设置行分组
   */
  setRowGroups(
    fieldOrColumns:
      | (AsColumnPropTypes.Field | AsTableDefines.ColumnInfo)[]
      | AsColumnPropTypes.Field
      | AsTableDefines.ColumnInfo
      | null,
  ): Promise<void>;
  /**
   * 设置行高
   * @param rowOrId 指定单行或多行
   * @param height 高度
   */
  setRowHeight(
    rowOrId: any | any[],
    height: number | string,
  ): Promise<{ status: boolean }>;
  /**
   * 批量设置行高
   * @param heightConf
   */
  setRowHeightConf(
    heightConf: Record<string, number>,
  ): Promise<{ status: boolean }>;
  /**
   * 手动对表格进行排序，update 是否同时更新数据，如果不传，则可以手动调用 updateData() 更新数据；如果需要同时触发对应的事件，请使用 setSortByEvent
   */
  setSort(
    sortConfs: AsTableDefines.SortConfs | AsTableDefines.SortConfs[],
    update?: boolean,
  ): Promise<void>;
  /**
   * 区别就是会触发对应的事件
   */
  setSortByEvent(
    event: Event,
    sortConfs: AsTableDefines.SortConfs | AsTableDefines.SortConfs[],
  ): Promise<void>;
  /**
   * 用于 tree-config，设置展开树形节点，二个参数设置这一行展开与否
   * @param rows 指定行
   * @param checked 是否选中
   */
  setTreeExpand(rows: any | any[], checked: boolean): Promise<void>;
  /**
   * 显示指定列
   * @param fieldOrColumns 列对象或字段名,支持传多个
   */
  showColumn(
    fieldOrColumn:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
  ): Promise<void>;
  /**
   * 手动对表格进行排序，建议使用 setSort 方法
   * @param sortConfs 字段名、多列排序
   * @param order 排序方式
   */
  sort(field: string, order?: AsTablePropTypes.SortOrder): Promise<void>;
  sort(
    sortConfs: AsTableDefines.SortConfs,
    order?: AsTablePropTypes.SortOrder,
  ): Promise<void>;
  sort(
    sortConfs: AsTableDefines.SortConfs[],
    order?: AsTablePropTypes.SortOrder,
  ): Promise<void>;
  /**
   * 该方法已废弃！！！
   * 同步 data 数据；如果用了该方法，那么组件将不再记录增删改的状态，只能自行实现对应逻辑
   * 对于某些特殊的场景，比如深层树节点元素发生变动时可能会用到
   * @deprecated
   */
  syncData(): Promise<void>;
  /**
   * 用于 type=checkbox，切换所有行的选中状态
   */
  toggleAllCheckboxRow(): Promise<any>;
  /**
   * 用于 type=checkbox，切换某一行的选中状态
   * @param row 指定行
   */
  toggleCheckboxRow(row: any): Promise<any>;
  /**
   * 切换指定行的取消/标记待删除状态
   */
  togglePendingRow(rows: any | any[]): Promise<any>;
  /**
   * 用于 type=expand，切换展开行的状态
   * @param row 指定行
   */
  toggleRowExpand(row: any): Promise<void>;
  /**
   * 用于 tree-config，切换展开树形节点的状态
   * @param row 指定行
   */
  toggleTreeExpand(row: any): Promise<any>;
  /**
   * 撤销
   */
  undo(): Promise<{ status: boolean }>;
  /**
   * 用于 mouse-config.area，更新已选区域的单元格样式
   */
  updateCellAreas(): Promise<void>;
  /**
   * 更新单元格显示值
   */
  updateCellLabel(
    row: any,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): null | number | string;
  /**
   * 手动处理数据，用于手动排序与筛选
   * 对于手动更改了排序、筛选...等条件后需要重新处理数据时可能会用到
   */
  updateData(): Promise<void>;
  /**
   * 手动更新表尾
   */
  updateFooter(): Promise<any>;
  /**
   * 更新表尾单元格显示值
   */
  updateFooterCellLabel(
    row: any,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): null | number | string;
  /**
   * 更新表头单元格显示值
   */
  updateHeaderCellLabel(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): string;
  /**
   * 更新单元格状态
   * @param params 插槽对象
   */
  updateStatus(
    params: {
      column: AsTableDefines.ColumnInfo;
      row: DT;
    },
    cellValue?: any,
  ): Promise<any>;
}
export interface AsTableMethods<D = any> extends TableMethods<D> {}

export interface TablePrivateMethods<D = any> {
  /**
   * 内部方法
   * @private
   */
  analyColumnWidth(): void;
  /**
   * 内部方法
   * @private
   */
  cacheRowMap(isReset: boolean): void;
  /**
   * 内部方法
   * @private
   */
  cacheSourceMap(fullData: any[]): void;

  /**
   * 内部方法
   * @private
   */
  callSlot<T>(
    slotFunc:
      | ((params: T) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string,
    params: T,
  ): AsComponentSlotType[];
  /**
   * 内部方法
   * @private
   */
  checkScrolling(): void;
  /**
   * 内部方法
   * @private
   */
  checkSelectionStatus(): void;
  /**
   * 内部方法
   * @private
   */
  clearHoverRow(): void;
  /**
   * 内部方法
   * @private
   */
  defineField(records: any[]): any[];
  /**
   * 内部方法
   * @private
   */
  eqRow(row1: any, row2: any): boolean;
  /**
   * 内部方法
   * @private
   */
  findRowIndexOf(list: any[], row: any): number;
  /**
   * 已废弃，被 getCellElement 替换
   * @deprecated
   */
  getCell(
    row: any,
    column: AsTableDefines.ColumnInfo,
  ): HTMLElement | HTMLTableCellElement | null;
  /**
   * @private
   */
  getExcludeHeight(): number;
  /**
   * 内部方法
   * @private
   */
  getParentElem(): Element | null;
  /**
   * 内部方法
   * @private
   */
  getParentHeight(): number;
  /**
   * 内部方法
   * @private
   */
  handleAggregateSummaryData(): void;
  /**
   * 内部方法
   * @private
   */
  handleBatchSelectRows(rows: any[], value: any, isForce?: boolean): void;
  /**
   * 内部方法
   * @private
   */
  handleCellDragMousedownEvent(
    evnt: MouseEvent,
    params: {
      column: AsTableDefines.ColumnInfo;
      row: any;
    },
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleCellDragMouseupEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleCellRuleUpdateStatus(
    type: 'blur' | 'change',
    cellParams: {
      column: AsTableDefines.ColumnInfo;
      row: any;
    },
    cellValue?: any,
  ): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  handleCheckedCheckboxRow(
    rows: any,
    value: boolean,
    isForce?: boolean,
  ): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  handleClearStack(): Promise<void>;
  /**
   * 内部方法
   * @private
   */
  handleColDragSwapColumn(): void;
  /**
   * 内部方法
   * @private
   */
  handleColDragSwapEvent(
    evnt: DragEvent | null,
    isSyncColumn: boolean | undefined,
    dragCol: AsTableDefines.ColumnInfo | null | undefined,
    prevDragCol: AsTableDefines.ColumnInfo | null | undefined,
    prevDragPos: '' | 'bottom' | 'left' | 'right' | 'top' | undefined,
    prevDragToChild: boolean | undefined,
  ): Promise<{ status: boolean }>;
  /**
   * 内部方法
   * @private
   */
  handleColResizeDblclickEvent(
    evnt: MouseEvent,
    params:
      | AsTableDefines.CellRenderBodyParams
      | AsTableDefines.CellRenderFooterParams
      | AsTableDefines.CellRenderHeaderParams,
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleColResizeMousedownEvent(
    evnt: MouseEvent,
    fixedType: '' | 'left' | 'right',
    params:
      | AsTableDefines.CellRenderBodyParams
      | AsTableDefines.CellRenderFooterParams
      | AsTableDefines.CellRenderHeaderParams,
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleColumnSortEvent(evnt: Event, column: AsTableDefines.ColumnInfo): void;
  /**
   * 内部方法
   * @private
   */
  handleCrossTableRowDragCancelEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleCrossTableRowDragFinishEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleCrossTableRowDragInsertEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleCrossTableRowDragoverEmptyEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleCustom(): Promise<void>;
  /**
   * 内部方法
   * @private
   */
  handleFilterOptions(column: AsTableDefines.ColumnInfo): void;
  /**
   * 内部方法
   * @private
   */
  handleHeaderCellDragDragendEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleHeaderCellDragDragoverEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleHeaderCellDragDragstartEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleHeaderCellDragMousedownEvent(
    evnt: MouseEvent,
    params: {
      column: AsTableDefines.ColumnInfo;
    },
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleHeaderCellDragMouseupEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  handlePushStack(): void;
  /**
   * 内部方法
   * @private
   */
  handleRedoStackEvent(
    evnt: KeyboardEvent | null,
  ): Promise<{ status: boolean }>;
  /**
   * 内部方法
   * @private
   */
  handleRefreshColumnQueue(): void;
  /**
   * 内部方法
   * @private
   */
  handleRowDragDragendEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleRowDragDragoverEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleRowDragDragstartEvent(evnt: DragEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleRowDragSwapEvent(
    evnt: DragEvent | null,
    isSyncRow: boolean | undefined,
    dragRow: any,
    prevDragRow: any,
    prevDragPos: '' | 'bottom' | 'left' | 'right' | 'top' | undefined,
    prevDragToChild: boolean | undefined,
  ): Promise<{ status: boolean }>;
  /**
   * 内部方法
   * @private
   */
  handleRowResizeDblclickEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams,
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleRowResizeMousedownEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams,
  ): void;
  /**
   * 内部方法
   * @private
   */
  handleScrollEvent(
    evnt: Event,
    isRollY: boolean,
    isRollX: boolean,
    scrollTop: number,
    scrollLeft: number,
    params: {
      fixed: AsColumnPropTypes.Fixed;
      type: string;
    },
  ): void;
  /**
   * 内部方法
   * use handleBatchSelectRows
   * @deprecated
   */
  handleSelectRow(params: any, value: any, isForce?: boolean): void;
  /**
   * 内部方法
   * @private
   */
  handleTableData(force?: boolean): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  handleTargetLeaveEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  handleToggleCheckRowEvent(evnt: Event | null, params: { row: any }): void;
  /**
   * 内部方法
   * @private
   */
  handleUndoStackEvent(
    evnt: KeyboardEvent | null,
  ): Promise<{ status: boolean }>;
  /**
   * 内部方法
   * @private
   */
  handleUpdateAggData(): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  handleUpdateBodyMerge(): void;
  /**
   * 内部方法
   * @private
   */
  handleUpdateDataQueue(): void;
  /**
   * 内部方法
   * @private
   */
  handleUpdateFooterMerge(): void;
  /**
   * 内部方法
   * @private
   */
  handleUpdateHeaderMerge(): void;
  /**
   * 内部方法
   * @private
   */
  hideCrossTableRowDropClearStatus(): void;
  /**
   * 内部方法
   * @private
   */
  preventEvent(evnt: any, type: any, args?: any, next?: any, end?: any): any;
  /**
   * 内部方法
   * @private
   */
  saveCustomStore(type: AsTableDefines.CustomEventType): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  scrollToTreeRow(row: any): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  setHoverRow(row: any): void;
  /**
   * 内部方法
   * @private
   */
  triggerBodyScrollEvent(evnt: Event, fixedType: '' | 'left' | 'right'): void;
  /**
   * 内部方法
   * @private
   */
  triggerBodyTooltipEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerBodyWheelEvent(evnt: WheelEvent): void;
  /**
   * 内部方法
   * @private
   */
  triggerCellClickEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerCellDblclickEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerCellMousedownEvent(evnt: MouseEvent, params: any): void;
  /**
   * 内部方法
   * @private
   */
  triggerCellMouseupEvent(evnt: MouseEvent): void;
  /**
   * 内部方法
   * @private
   */
  triggerCheckAllEvent(evnt: MouseEvent | null, value: boolean): void;
  /**
   * 内部方法
   * @private
   */
  triggerCheckRowEvent(evnt: Event, params: { row: any }, value: boolean): void;
  /**
   * 内部方法
   * @private
   */
  triggerCurrentColumnEvent(
    evnt: Event,
    params: {
      column: AsTableDefines.ColumnInfo;
    },
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerCurrentRowEvent(
    evnt: Event,
    params: {
      $rowIndex: number;
      $table: AsTableConstructor<any>;
      row: any;
      rowIndex: number;
    },
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerFooterCellClickEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderFooterParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerFooterCellDblclickEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderFooterParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerFooterScrollEvent(evnt: Event, fixedType: '' | 'left' | 'right'): void;
  /**
   * 内部方法
   * @private
   */
  triggerFooterTooltipEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderFooterParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerHeaderCellClickEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderHeaderParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerHeaderCellDblclickEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderHeaderParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerHeaderCellMousedownEvent(evnt: any, params: any): void;
  /**
   * 内部方法
   * @private
   */
  triggerHeaderScrollEvent(evnt: Event, fixedType: '' | 'left' | 'right'): void;
  /**
   * 内部方法
   * @private
   */
  triggerHeaderTitleEvent(
    evnt: MouseEvent,
    iconParams: AsColumnPropTypes.TitlePrefix | AsColumnPropTypes.TitleSuffix,
    params: AsTableDefines.CellRenderHeaderParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerHeaderTooltipEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderHeaderParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerHoverEvent(evnt: any, params: any): void;
  /**
   * 内部方法
   * @private
   */
  triggerRadioRowEvent(evnt: Event, params: { row: any }): void;
  /**
   * 内部方法
   * @private
   */
  triggerRowExpandEvent(
    evnt: Event,
    params: AsTableDefines.CellRenderBodyParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerRowGroupExpandEvent(
    evnt: Event,
    params: AsTableDefines.CellRenderBodyParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerScrollXEvent(evnt: Event): void;
  /**
   * 内部方法
   * @private
   */
  triggerScrollYEvent(evnt: Event): void;
  /**
   * 内部方法
   * @private
   */
  triggerSortEvent(
    evnt: Event,
    column: AsTableDefines.ColumnInfo,
    order: AsTablePropTypes.SortOrder,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerTreeExpandEvent(
    evnt: Event,
    params: AsTableDefines.CellRenderBodyParams<any>,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerVirtualScrollXEvent(evnt: Event): void;
  /**
   * 内部方法
   * @private
   */
  triggerVirtualScrollYEvent(evnt: Event): void;
  /**
   * 内部方法
   * @private
   */
  updateAfterDataIndex(): void;
  /**
   * 内部方法
   * @private
   */
  updateAllCheckboxStatus(): void;
  /**
   * 内部方法
   * @private
   */
  updateCheckboxStatus(): void;
  /**
   * 内部方法
   * @private
   */
  updateScrollXData(): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  updateScrollXSpace(): void;
  /**
   * 内部方法
   * @private
   */
  updateScrollYData(): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  updateScrollYSpace(): void;
  /**
   * 内部方法
   * @private
   */
  updateScrollYStatus(fullData?: any[]): boolean;
  /**
   * 内部方法
   * @private
   */
  updateZindex(): void;
}

export interface AsTablePrivateMethods<
  D = any,
> extends TablePrivateMethods<D> {}

export interface TablePrivateRef {
  refColResizeBar: Ref<HTMLDivElement>;
  refElem: Ref<HTMLDivElement>;
  refLeftContainer: Ref<HTMLDivElement>;
  refRightContainer: Ref<HTMLDivElement>;
  refRowResizeBar: Ref<HTMLDivElement>;
  refScrollXHandleElem: Ref<HTMLDivElement | undefined>;
  refScrollXSpaceElem: Ref<HTMLDivElement | undefined>;
  refScrollXVirtualElem: Ref<HTMLDivElement | undefined>;
  refScrollYHandleElem: Ref<HTMLDivElement | undefined>;
  refScrollYSpaceElem: Ref<HTMLDivElement | undefined>;
  refScrollYVirtualElem: Ref<HTMLDivElement | undefined>;
  refTableBody: Ref<ComponentPublicInstance>;
  refTableFooter: Ref<ComponentPublicInstance>;
  refTableHeader: Ref<ComponentPublicInstance>;
  refTableLeftBody: Ref<ComponentPublicInstance>;
  refTableLeftFooter: Ref<ComponentPublicInstance>;
  refTableLeftHeader: Ref<ComponentPublicInstance>;
  refTableRightBody: Ref<ComponentPublicInstance>;
  refTableRightFooter: Ref<ComponentPublicInstance>;
  refTableRightHeader: Ref<ComponentPublicInstance>;
  refTooltip: Ref<AsSharedTooltipInstance>;
  refValidTooltip: Ref<AsSharedTooltipInstance>;
}

export interface AsTablePrivateRef extends TablePrivateRef {}

export namespace AsTablePropTypes {
  export type AutoResize = boolean;
  export type SyncResize = boolean | number | string;
  export type ZIndex = number;
  export type Params = any;
  export type Round = boolean;
  export type Loading = boolean;
  export interface LoadingConfig {
    /** 加载图标（Spin 的 indicator，VNode 或返回 VNode 的函数） */
    icon?: (() => VNode) | VNode;
    /** 加载提示文字 */
    text?: string;
  }
  export interface LoadingOpts extends LoadingConfig {}

  export type EmptyText = string;
  export type Stripe = boolean;
  export type Align = AsComponentAlignType;
  export type HeaderAlign = Align;
  export type FooterAlign = Align;
  export type Height = number | string;
  export type MinHeight = number | string;
  export type MaxHeight = number | string;

  export type Border =
    | ''
    | 'default'
    | 'full'
    | 'inner'
    | 'none'
    | 'outer'
    | boolean;

  export type Size = SizeType;

  export type ShowOverflow =
    | ''
    | 'ellipsis'
    | 'title'
    | 'tooltip'
    | boolean
    | null;
  export type ShowHeaderOverflow = ShowOverflow;
  export type ShowFooterOverflow = ShowOverflow;

  export type ShowCustomHeader = boolean;

  export type MergeHeaderCells = AsTableDefines.MergeOptions[];
  export type MergeCells<D = AsTablePropTypes.Row> =
    AsTableDefines.MergeOptions<D>[];
  export type MergeFooterCells<D = any> = AsTableDefines.MergeOptions<D>[];

  /**
   * 渲染器配置项
   */
  export type RendererConfig = Record<string, AsGlobalRendererOptions>;

  export type ID<D = any> =
    | ((params: {
        // TODO $gantt: null | undefined | AsGanttConstructor;
        // TODO $grid: null | undefined | AsGridConstructor<D>;
        $table: AsTableConstructor<D>;
      }) => null | number | string)
    | string;

  export interface Row {
    [key: string]: any;
  }
  export type KeepSource = boolean;

  export type ShowHeader = boolean;
  export type ShowFooter = boolean;
  export type Data<T = Row> = T[];
  export type FooterData = Record<string, any>[];

  export type FooterMethod<D = any> = (params: {
    // TODO $gantt: null | undefined | AsGanttConstructor<D>;
    // $grid: null | undefined | AsGridConstructor<D>;
    $table: AsTableConstructor<D>;
    columns: AsTableDefines.ColumnInfo[];
    data: D[];
  }) => any[] | Array<null | number | string>[];

  export interface FloatingFilterConfig<D = AsTablePropTypes.Row> {
    cellClassName?: string;
    /**
     * 是否启用
     */
    enabled?: boolean;
    /**
     * 是否启用浮动筛选
     */
    floatingFilters?: AsColumnPropTypes.FloatingFilters;
    rowClassName?: string;
  }

  /**
   * 提示信息配置项
   */
  export interface TooltipConfig<D = AsTablePropTypes.Row> {
    /**
     * 该方法可以通过返回值来重写默认的提示内容，可以返回 null 使用默认的提示内容，可以返回空内容去掉指定单元格的提示内容
     */
    contentMethod?(params: {
      $columnIndex: number;
      $event: any;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      cell: HTMLElement;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      items: any[];
      row: D;
      rowIndex: number;
      type: 'body';
    }): boolean | null | string | void;
    /**
     * 默认方向
     */
    defaultPlacement?: AsSharedTooltipPropTypes.DefaultPlacement;
    /**
     * 鼠标是否可进入到工具提示中
     */
    enterable?: AsSharedTooltipPropTypes.Enterable;
    enterDelay?: AsSharedTooltipPropTypes.EnterDelay;
    height?: AsSharedTooltipPropTypes.Height;
    leaveDelay?: AsSharedTooltipPropTypes.LeaveDelay;
    maxHeight?: AsSharedTooltipPropTypes.MaxHeight;
    maxWidth?: AsSharedTooltipPropTypes.MaxWidth;
    minHeight?: AsSharedTooltipPropTypes.MinHeight;
    minWidth?: AsSharedTooltipPropTypes.MinWidth;
    /**
     * 当 show-overflow=true 时，默认使用指定提示类型
     */
    mode?: '' | 'ellipsis' | 'title' | 'tooltip' | null;
    /**
     * 固定方向
     */
    placement?: AsSharedTooltipPropTypes.Placement;
    popupClassName?: AsSharedTooltipPropTypes.PopupClassName;
    /**
     * 所有单元格开启工具提示
     */
    showAll?: boolean;
    /**
     * 显示为 HTML 标签
     */
    useHtml?: AsSharedTooltipPropTypes.UseHtml;
    width?: AsSharedTooltipPropTypes.Width;
  }

  export interface HeaderTooltipConfig<D = AsTablePropTypes.Row> extends Omit<
    TooltipConfig<D>,
    'contentMethod'
  > {
    /**
     * 该方法可以通过返回值来重写默认的提示内容，可以返回 null 使用默认的提示内容，可以返回空内容去掉指定单元格的提示内容
     */
    contentMethod?(params: {
      $columnIndex: number;
      $event: any;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      cell: HTMLElement;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      type: 'header';
    }): boolean | null | string | void;
  }

  export interface FooterTooltipConfig<D = AsTablePropTypes.Row> extends Omit<
    TooltipConfig<D>,
    'contentMethod'
  > {
    /**
     * 该方法可以通过返回值来重写默认的提示内容，可以返回 null 使用默认的提示内容，可以返回空内容去掉指定单元格的提示内容
     */
    contentMethod?(params: {
      $columnIndex: number;
      $event: any;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      cell: HTMLElement;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      items: any[];
      row: D;
      rowIndex: number;
      type: 'footer';
    }): boolean | null | string | void;
  }

  export type RowStyle<D = AsTablePropTypes.Row> =
    | ((params: {
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _rowIndex: number;
        row: D;
        rowIndex: number;
      }) => AsComponentStyleType | null | Partial<CSSStyleDeclaration> | void)
    | Partial<CSSStyleDeclaration>;

  export type RowClassName<D = AsTablePropTypes.Row> =
    | ((params: {
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _rowIndex: number;
        row: D;
        rowIndex: number;
      }) =>
        | null
        | string
        | void
        | { [key: string]: boolean | null | undefined })
    | string;
  export type HeaderRowClassName<D = AsTablePropTypes.Row> =
    | ((params: {
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        fixed: AsColumnPropTypes.Fixed;
        type: string;
      }) =>
        | null
        | string
        | void
        | { [key: string]: boolean | null | undefined })
    | string;

  export type HeaderCellStyle<D = AsTablePropTypes.Row> =
    | ((params: {
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _columnIndex: number;
        column: AsTableDefines.ColumnInfo;
        columnIndex: number;
      }) => AsComponentStyleType | null | Partial<CSSStyleDeclaration> | void)
    | Partial<CSSStyleDeclaration>;

  export type HeaderCellClassName<D = AsTablePropTypes.Row> =
    | ((params: {
        $columnIndex: number;
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _columnIndex: number;
        column: AsTableDefines.ColumnInfo;
        columnIndex: number;
        fixed: AsColumnPropTypes.Fixed;
        type: string;
      }) =>
        | null
        | string
        | void
        | { [key: string]: boolean | null | undefined })
    | string;

  export type FooterCellStyle<D = any> =
    | ((params: {
        $columnIndex: number;
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _columnIndex: number;
        column: AsTableDefines.ColumnInfo;
        columnIndex: number;
        row: D;
      }) => AsComponentStyleType | null | Partial<CSSStyleDeclaration> | void)
    | AsComponentStyleType;

  export type FooterRowClassName<D = AsTablePropTypes.Row> =
    | ((params: {
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _rowIndex: number;
        fixed: AsColumnPropTypes.Fixed;
        row: D;
        type: string;
      }) =>
        | null
        | string
        | void
        | { [key: string]: boolean | null | undefined })
    | string;

  export type FooterCellClassName<D = AsTablePropTypes.Row> =
    | ((params: {
        $columnIndex: number;
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _columnIndex: number;
        _rowIndex: number;
        column: AsTableDefines.ColumnInfo;
        columnIndex: number;
        row: D;
      }) =>
        | null
        | string
        | void
        | { [key: string]: boolean | null | undefined })
    | string;

  export type CellClassName<D = AsTablePropTypes.Row> =
    | ((params: {
        $columnIndex: number;
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _columnIndex: number;
        _rowIndex: number;
        column: AsTableDefines.ColumnInfo;
        columnIndex: number;
        row: D;
        rowIndex: number;
      }) =>
        | null
        | string
        | void
        | { [key: string]: boolean | null | undefined })
    | string;

  export type CellStyle<D = AsTablePropTypes.Row> =
    | ((params: {
        $columnIndex: number;
        $rowIndex: number;
        _columnIndex: number;
        _rowIndex: number;
        column: AsTableDefines.ColumnInfo;
        columnIndex: number;
        row: D;
        rowIndex: number;
      }) => AsComponentStyleType | null | Partial<CSSStyleDeclaration> | void)
    | Partial<CSSStyleDeclaration>;

  export type HeaderRowStyle<D = AsTablePropTypes.Row> =
    | ((params: {
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        fixed: AsColumnPropTypes.Fixed;
        type: string;
      }) => AsComponentStyleType | null | Partial<CSSStyleDeclaration> | void)
    | Partial<CSSStyleDeclaration>;

  export type FooterRowStyle<D = any> =
    | ((params: {
        $rowIndex: number;
        $table: AsTableConstructor<D>;
        _rowIndex: number;
        fixed: AsColumnPropTypes.Fixed;
        row: D;
        type: string;
      }) => AsComponentStyleType | null | Partial<CSSStyleDeclaration> | void)
    | Partial<CSSStyleDeclaration>;

  export interface VirtualXConfig {
    /**
     * 是否启用，支持局部/全局启用
     */
    enabled?: boolean;
    /**
     * 指定大于指定列时自动启动横向虚拟滚动，如果为 0 则总是启用；如果需要关闭，可以设置 enabled 为 false
     */
    gt?: number;
    /**
     * 是否开启实时渲染，当单元格渲染量太大时应该关闭，避免卡顿
     */
    immediate?: boolean;
    /**
     * 指定每次渲染的数据额外数据，额外数据越大渲染次数就越少，但每次渲染耗时就越久
     */
    oSize?: number;
    /**
     * 预加载数量
     */
    preSize?: number;
    /**
     * 当数据源被更改时，自动将横向滚动条滚动到左侧
     */
    scrollToLeftOnChange?: boolean;
    /**
     * 滚动到边界触发的阈值会触发 scroll-boundary 事件
     */
    threshold?: number | string;
  }

  export interface VirtualYConfig {
    /**
     * 是否启用，支持局部/全局启用
     */
    enabled?: boolean;
    /**
     * 指定大于指定行时自动启动纵向虚拟滚动，如果为 0 则总是启用；如果需要关闭，可以设置 enabled 为 false（注：启用纵向虚拟滚动之后将不能支持动态行高）
     */
    gt?: number;
    /**
     * 是否开启实时渲染，当单元格渲染量太大时应该关闭，避免卡顿
     */
    immediate?: boolean;
    /**
     * 滚动模式，会在受支持的场景中使用该模式，不建议修改
     */
    mode?: '' | 'default' | 'scroll' | 'wheel';
    /**
     * 指定每次渲染的数据额外数据，额外数据越大渲染次数就越少，但每次渲染耗时就越久
     */
    oSize?: number;
    /**
     * 预加载数量
     */
    preSize?: number;
    /**
     * 当数据源被更改时，自动将纵向滚动条复原到顶部
     */
    scrollToTopOnChange?: boolean;
    /**
     * 滚动到边界触发的阈值会触发 scroll-boundary 事件
     */
    threshold?: number | string;
  }

  /**
   * 校验配置项
   */
  export interface ValidConfig<D = any> {
    /**
     * 当点击表格之外或者其他列之后，是否自动清除单元格的校验消息
     */
    autoClear?: boolean;
    /**
     * 是否自动定位到校验不通过的单元格
     */
    autoPos?: boolean;
    /**
     * 给校验提示框附加 class
     */
    className?:
      | ((params: AsColumnSlotTypes.ValidSlotParams<D>) => string)
      | string;
    /**
     * 校验提示框的最大宽度
     */
    maxWidth?: number;
    /**
     * 校验消息提示方式
     * - default 使用内置提示（表格高度不足时以 tooltip 展示）
     * - inline 行内提示
     * - tooltip 使用 tooltip 展示
     */
    message?: '' | 'default' | 'inline' | 'tooltip' | null;
    /**
     * 校验消息提示方式
     * - single 单个提示
     * - full - 全量提示
     */
    msgMode?: '' | 'full' | 'single' | null;
    /**
     * 是否显示错误单元格背景色
     */
    showErrorBackground?: boolean;
    /**
     * 是否显示错误提示内容
     */
    showErrorMessage?: boolean;
    /**
     * 提示消息主题样式
     */
    theme?: '' | 'beautify' | 'normal';
  }
  export interface ValidOpts<D = any> extends ValidConfig<D> {}

  /**
   * 校验规则配置项
   */
  export interface EditRules<D = any> {
    [field: string]: AsTableDefines.ValidatorRule<D>[];
  }

  /**
   * 响应式布局配置项
   */
  export interface ResizeConfig {
    refreshDelay?: number;
  }
  export interface ResizeOpts extends ResizeConfig {}

  /**
   * 列配置信息
   */
  export interface ColumnConfig<D = any> {
    /**
     * 用于 column.width=auto | column.min-width=auto 自适应单元格宽度参数
     */
    autoOptions?: {
      /**
       * 是否启用自适应表体单元格宽度
       */
      isCalcBody?: boolean;
      /**
       * 是否启用自适应表尾单元格宽度
       */
      isCalcFooter?: boolean;
      /**
       * 是否启用自适应表头单元格宽度
       */
      isCalcHeader?: boolean;
    };
    /**
     * 是否启用列拖拽排序
     */
    drag?: boolean;
    /**
     * 当鼠标点击列头时，是否要高亮当前列
     */
    isCurrent?: boolean;
    /**
     * 当鼠标移到列头时，是否要高亮当前头
     */
    isHover?: boolean;
    /**
     * 固定列允许设置的最大数量（如果是分组，则一个分组算一个）
     */
    maxFixedSize?: number;
    /**
     * 每一列的最大宽度
     */
    maxWidth?: AsColumnPropTypes.MaxWidth;
    /**
     * 每一列的最小宽度
     */
    minWidth?: AsColumnPropTypes.MinWidth;
    /**
     * 每一列是否启用列宽调整
     */
    resizable?: AsColumnPropTypes.Resizable;
    /**
     * 是否需要为每一列的 VNode 设置 key 属性
     */
    useKey?: boolean;
    /**
     * 每一列的宽度
     */
    width?: AsColumnPropTypes.Width;
  }
  export interface ColumnOpts<D = any> extends ColumnConfig<D> {}

  /**
   * 个性化设置配置项
   */
  export interface CustomConfig<D = AsTablePropTypes.Row> {
    /**
     * 是否允许自定义对齐方式
     */
    allowAlign?: boolean;
    /**
     * 是否允许自定义冻结列
     */
    allowFixed?: boolean;
    /**
     * 是否允许自定义表尾对齐方式
     */
    allowFooterAlign?: boolean;
    /**
     * 允许自定义聚合分组配置
     */
    allowGroup?: boolean;
    /**
     * 是否允许自定义表头对齐方式
     */
    allowHeaderAlign?: boolean;
    /**
     * 是否允许设置分页设置
     */
    allowPager?: boolean;
    /**
     * 是否允许自定义调整列宽
     */
    allowResizable?: boolean;
    /**
     * 是否允许自定义排序
     */
    allowSort?: boolean;
    /**
     * 允许自定义聚合函数小数精度配置
     */
    allowValueDigits?: boolean;
    /**
     * 允许自定义聚合函数格式化配置
     */
    allowValueFormat?: boolean;
    /**
     * 允许自定义聚合函数配置
     */
    allowValues?: boolean;
    /**
     * 是否允许设置列的显示与隐藏
     */
    allowVisible?: boolean;
    /**
     * 当拖拽数据分组或聚合列时，自动更新列可视状态
     */
    autoAggGroupValues?: boolean;
    cancelButtonText?: string;
    /**
     * 个性化设置是否允许列选中的方法，该方法的返回值用来决定这一列的 checkbox 是否可以选中
     */
    checkMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
    closeButtonText?: string;
    confirmButtonText?: string;
    // TODO /**
    //  * 抽屉模式配置项，用于 mode='drawer'
    //  */
    // drawerOptions?: {
    //   className?: AsDrawerPropTypes.ClassName;
    //   escClosable?: AsDrawerPropTypes.EscClosable;
    //   lockView?: AsDrawerPropTypes.LockView;
    //   mask?: AsDrawerPropTypes.Mask;
    //   maskClosable?: AsDrawerPropTypes.MaskClosable;
    //   position?: AsDrawerPropTypes.Position;
    //   resize?: AsDrawerPropTypes.Resize;
    //   title?: AsDrawerPropTypes.Title;
    //   /**
    //    * 是否启用元素挂载
    //    */
    //   transfer?: boolean;
    //   width?: AsDrawerPropTypes.Width;
    // };
    /**
     * 是否启用，支持局部/全局启用
     */
    enabled?: boolean;
    icon?: string;
    /**
     * 是否实时同步操作
     */
    immediate?: boolean;
    // TODO /**
    //  * 窗口模式配置项，用于 mode='modal'
    //  */
    // modalOptions?: {
    //   className?: AsModalPropTypes.ClassName;
    //   escClosable?: AsModalPropTypes.EscClosable;
    //   height?: AsModalPropTypes.Height;
    //   lockView?: AsModalPropTypes.LockView;
    //   mask?: AsModalPropTypes.Mask;
    //   maskClosable?: AsModalPropTypes.MaskClosable;
    //   minHeight?: AsModalPropTypes.MinHeight;
    //   minWidth?: AsModalPropTypes.MinWidth;
    //   resize?: AsModalPropTypes.Resize;
    //   showMaximize?: AsModalPropTypes.ShowMaximize;
    //   showMinimize?: AsModalPropTypes.ShowMinimize;
    //   showZoom?: AsModalPropTypes.ShowZoom;
    //   title?: AsModalPropTypes.Title;
    //   /**
    //    * 是否启用元素挂载
    //    */
    //   transfer?: boolean;
    //   width?: AsModalPropTypes.Width;
    // };
    mode?: '' | 'default' | 'drawer' | 'modal' | 'popup' | 'simple' | null;
    placement?:
      | 'bottom-left'
      | 'bottom-right'
      | 'left'
      | 'right'
      | 'top-left'
      | 'top-right';
    /**
     * 默认模式配置项
     */
    popupOptions?: {
      maxHeight?: number | string;
      maxWidth?: number | string;
      minWidth?: number | string;
      mode?: '' | 'auto' | 'inside' | 'outside' | null;
      /**
       * 是否启用元素挂载
       */
      transfer?: boolean;
      width?: number | string;
    };
    resetButtonText?: string;
    /**
     * 只对 storage 有效，用于重写默认的恢复自定义配置逻辑，用于实现服务端保存
     */
    restoreStore?(params: {
      $table: AsTableConstructor<D>;
      id: string;
      storeData: AsTableDefines.CustomStoreData;
      type: 'restore';
    }):
      | AsTableDefines.CustomStoreData
      | Promise<AsTableDefines.CustomStoreData>;
    showFooter?: boolean;
    /**
     * 显示排序拖拽按钮
     */
    showSortDragButton?: boolean;
    /**
     * 显示上移/下移排序按钮
     */
    showSortMoveButton?: boolean;
    /**
     * 显示置顶/置尾排序按钮
     */
    showSortPutButton?: boolean;
    /**
     * 个性化设置的插槽模板
     */
    slots?: {
      bottom?:
        | ((
            params: AsTableDefines.CustomSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
      default?:
        | ((
            params: AsTableDefines.CustomSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
      footer?:
        | ((
            params: AsTableDefines.CustomSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
      header?:
        | ((
            params: AsTableDefines.CustomSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
      top?:
        | ((
            params: AsTableDefines.CustomSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
    };
    /**
     * 是否启用 localStorage 本地保存，会将列操作状态保留在本地（需要有 id）
     */
    storage?: AsTableDefines.AsTableCustomStorageObj | boolean;
    /**
     * 只对 storage 有效，缓存项的配置
     */
    storeOptions?: AsTableDefines.AsTableCustomStorageObj;
    trigger?: '' | 'click' | 'hover' | 'manual' | null;
    /**
     * 只对 storage 有效，重写默认的保存方法，用于实现服务端保存
     */
    updateStore?(params: {
      $table: AsTableConstructor<D>;
      id: string;
      storeData: AsTableDefines.CustomStoreData;
      type: AsTableDefines.CustomEventType;
    }): Promise<any>;

    /**
     * 个性化设置是否的方法，该方法的返回值用来决定这一列是否显示
     */
    visibleMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
  }

  export interface CustomOpts<
    D = AsTablePropTypes.Row,
  > extends CustomConfig<D> {}

  /**
   * 鼠标配置项
   */
  export interface MouseConfig {
    /**
     * 如果功能被支持，则开启单元格区域选取功能，非连续的区域，按住 Ctrl 键，用鼠标逐一选取
     */
    area?: boolean;
    /**
     * 只对 area 启用后有效，是否开启区域扩展选取功能，开启后可以通过鼠标左键按住区域内右下角扩展按钮，将区域横向或纵向扩大（支持扩大区域并复制值）
     */
    extension?: boolean;
    /**
     * 开启单元格选中功能（只对 edit-config.mode=cell 有效）
     */
    selected?: boolean;
  }
  export interface MouseOpts extends MouseConfig {}

  /**
   * 区域配置项
   */
  export interface AreaConfig<D = any> {
    /**
     * 只对 mouse-config.extension 启用后有效，扩展区域之后的方法
     * @param params
     */
    afterExtendMethod?(
      params: AsTableExtendCellAreaDefines.CellAreaExtensionEndParams<D>,
    ): void;
    /**
     * 只对 extendByCopy | extendByCalc 启用后有效，自定义单元格扩展区域赋值之后的方法
     * @param params
     */
    afterExtendSetMethod?(
      params: AsTableExtendCellAreaDefines.ExtendCellAreaCalcBaseParams<D> & {
        $table: AsTableConstructor<D>;
        extendValues: any[][];
      },
    ): void;
    /**
     * 当点击表格之外，是否自动清除单元格的选取状态
     */
    autoClear?: boolean;
    /**
     * 只对 mouse-config.extension 启用后有效，扩展区域之前的方法，可以通过返回 false 阻止扩展行为
     * @param params
     */
    beforeExtendMethod?(
      params: AsTableExtendCellAreaDefines.CellAreaExtensionStartParams<D>,
    ): boolean;
    /**
     * 只对 extendByCopy | extendByCalc 启用后有效，自定义单元格扩展区域赋值之前的方法，可以通过返回 false 阻止扩展赋值行为
     * @param params
     */
    beforeExtendSetMethod?(
      params: AsTableExtendCellAreaDefines.ExtendCellAreaCalcBaseParams<D>,
    ): boolean;
    /**
     * 自定义操作提示消息
     */
    customModalMsg?: (params: {
      $table: AsTableConstructor<D>;
      message: string;
      status: 'error' | 'info' | 'loading' | 'question' | 'success' | 'warning';
      type: 'clip' | 'fnr' | 'merge' | 'selected';
    }) => void;
    /**
     * 用于排除指定列允许不允许被选取
     */
    excludeFields?: string[];
    /**
     * 只对 mouse-config.extension 启用后有效，扩展区域时将自动识别数字规则进行计算
     */
    extendByCalc?: boolean;
    /**
     * 只对 mouse-config.extension 启用后有效，将被选取区域的值复制到扩展区域中
     */
    extendByCopy?: boolean;
    /**
     * 只对 extendByCalc 启用后有效，重写单元格扩展区域计算值的方法
     * @param params
     */
    extendCalcMethod?(
      params: AsTableExtendCellAreaDefines.ExtendCellAreaCalcBaseParams<D>,
    ): any[][];
    /**
     * 只对 mouse-config.extension 启用后有效，扩展区域的方向控制
     */
    extendDirection?:
      | boolean
      // eslint-disable-next-line perfectionist/sort-union-types
      | {
          /**
           * 是否允许向下扩展
           */
          bottom?: boolean;
          /**
           * 是否允许向左扩展
           */
          left?: boolean;
          /**
           * 是否允许向右扩展
           */
          right?: boolean;
          /**
           * 是否允许向上扩展
           */
          top?: boolean;
        };
    /**
     * 只对 extendByCopy | extendByCalc 启用后有效，重写单元格扩展区域赋值的方法
     * @param params
     */
    extendSetMethod?(
      params: AsTableExtendCellAreaDefines.ExtendCellAreaCalcBaseParams<D> & {
        $table: AsTableConstructor<D>;
        cellValue: any;
        column: AsTableDefines.ColumnInfo;
        row: D;
      },
    ): void;
    /**
     * 用于指定哪些列允许被选取
     */
    includeFields?: string[];
    /**
     * 是否启用选中复制填充功能，自动把上面的单元格内容填到下面
     */
    isFillByCopy?: boolean;
    /**
     * 只对 mouse-config.area 启用后有效，启用多区域选取功能
     */
    multiple?: boolean;
    /**
     * 只对 mouse-config.area 启用后有效，表格单元格选取功能
     */
    selectCellByBody?: boolean;
    /**
     * 只对 mouse-config.area 启用后有效，表格头部选取功能
     */
    selectCellByHeader?: boolean;
    /**
     * 只对 mouse-config.area 启用后有效，点击单元格后自动选取当前行的单元格;如果为 true，当选中第一列时联动选择当前行的单元格
     */
    selectCellToRow?: boolean;
    /**
     * 单元格选取的方法，返回是否允许被选取
     */
    selectedMethod?(params: {
      // TODO $grid: AsGridConstructor<D> | null | undefined;
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      row: D;
    }): boolean;
    /**
     * 是否显示操作提示消息
     */
    showActionMsg?: boolean;
    /**
     * 只对 mouse-config.area 启用后有效，选择单元格后显示列状态
     */
    showColumnStatus?: boolean;
    /**
     * 只对 mouse-config.area 启用后有效，选择单元格后显示行状态
     */
    showRowStatus?: boolean;
  }
  export interface AreaOpts<D = any> extends AreaConfig<D> {}

  /**
   * 按键配置项
   */
  export interface KeyboardConfig<D = any> {
    /**
     * 用于 mouse-config.area，方向键光标锁，开启后将支持两种状态
     * 非聚焦式输入状态：默认情况下，可以按方向键移动单元格。
     * 聚焦式输入状态：如果需要移动光标，可以按 F2 键或者鼠标左键点击输入框，切换为聚焦输入状态，就可以用方向键左右移动光标
     */
    arrowCursorLock?: boolean;
    /**
     * 只对 isDel=true 有效，用于重写回退键清空单元格内容并激活为编辑状态方法
     */
    backMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): void;
    /**
     * 只对 isEnter=true 有效，用于回车键执行之前的方法，返回 false 可以阻止默认行为
     */
    beforeEnterMethod?(params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): boolean;
    /**
     * 只对 isEnter=true 有效，用于Tab键执行之前的方法，返回 false 可以阻止默认行为
     */
    beforeTabMethod?(params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): boolean;
    /**
     * 只对 isDel=true 有效，用于重写删除键的方法
     */
    delMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): void;
    /**
     * 只对 isEdit=true 有效，用于重写编辑单元格方法
     */
    editMethod?(params: {
      // TODO $grid: AsGridConstructor<D> | null | undefined;
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): void;
    /**
     * 只有 isEdit 有效，编辑模式，支持覆盖式和末端插入式编辑
     */
    editMode?: '' | 'coverage' | 'insert' | null;
    /**
     * 只对 isEnter=true 有效，用于重写回车键的方法
     */
    enterMethod?(params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): void;
    /**
     * 用于 mouse-config.area，是否将回车键行为改成 Tab 键行为
     */
    enterToTab?: boolean;
    /**
     * 是否启用全选
     * Window/Linux对应按键: Ctrl+A
     * MacOS对应按键: Command+A
     */
    isAll?: boolean;
    /**
     * 是否开启非编辑状态下，上下左右移动功能
     */
    isArrow?: boolean;
    /**
     * 是否开启回退键功能
     */
    isBack?: boolean;
    /**
     * 用于 mouse-config.area & column.type=checkbox|radio，开启空格键切换复选框或单选框状态功能
     */
    isChecked?: boolean;
    /**
     * 用于 mouse-config.area，开启复制/剪贴/粘贴功能
     * Window/Linux对应按键: Ctrl+X, Ctrl+C, Ctrl+V
     * MacOS对应按键: Command+C Command+C, Command+V
     */
    isClip?: boolean;
    /**
     * 是否开启删除键功能
     */
    isDel?: boolean;
    /**
     * 是否开启单元格选择编辑
     */
    isEdit?: boolean;
    /**
     * 是否开启回车移动上下行移动
     */
    isEnter?: boolean;
    /**
     * 是否开启Esc键退出编辑功能
     */
    isEsc?: boolean;
    /**
     * 如果功能被支持，用于 mouse-config.area，开启查找和替换功能
     * Window/Linux对应按键: Ctrl+F, Ctrl+H
     * MacOS对应按键: Command+F, Command+H
     */
    isFNR?: boolean;
    /**
     * 当在最后一行按下回车键时，自动插入新行
     */
    isLastEnterAppendRow?: boolean;
    /**
     * 当在最后一行的最后一列按下Tab键时，自动插入新行
     */
    isLastTabAppendRow?: boolean;
    /**
     * 用于 mouse-config.area，开启合并和取消合并功能
     */
    isMerge?: boolean;
    /**
     * 如果功能被支持，用于 mouse-config.area，开启同时按住方向键以活动区域为起始，向指定方向延伸单元格区域
     */
    isShift?: boolean;
    /**
     * 是否开启TAB键左右移动功能
     */
    isTab?: boolean;
    /**
     * 是否开启撤销功能
     * Window/Linux对应按键: Ctrl+Z
     * MacOS对应按键: Command+Z
     * 恢复/重做功能
     * Window/Linux对应按键: Ctrl+Y, Ctrl+Shift+Y
     * MacOS对应按键: Command+Shift+Y
     */
    isUndoRedo?: boolean;
    /**
     * 只对 isEnter=true 有效，用于重写Tab键的方法
     */
    tabMethod?(params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): void;
  }
  export interface KeyboardOpts<D = any> extends KeyboardConfig<D> {}

  /**
   * 展开行配置项
   */
  export interface ExpandConfig<D = any> {
    accordion?: boolean;
    /**
     * 默认展开所有行（只会在初始化时被触发一次）
     */
    expandAll?: boolean;
    /**
     * 默认展开指定行（只会在初始化时被触发一次，需要有 row-config.keyField）
     */
    expandRowKeys?: number[] | string[];
    height?: number;
    iconClose?: AsComponentSlotType | AsComponentSlotType[];
    iconLoaded?: AsComponentSlotType | AsComponentSlotType[];
    iconOpen?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 当存在树结构时，展开内容的缩进，默认继承树配置
     */
    indent?: number;
    labelField?: string;
    lazy?: boolean;
    loadMethod?(params: {
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      row: D;
      rowIndex: number;
    }): Promise<void>;
    /**
     * 展开内容的显示模式
     */
    mode?: '' | 'fixed' | 'inside' | null;
    padding?: boolean;
    reserve?: boolean;
    showIcon?: boolean;
    toggleMethod?(params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      expanded: boolean;
      row: D;
      rowIndex: number;
    }): boolean;
    trigger?: '' | 'cell' | 'default' | 'manual' | 'row' | null;
    visibleMethod?(params: AsTableDefines.CellRenderBodyParams<D>): boolean;
  }

  export interface EmptyRender {
    /**
     * 目标组件渲染的属性
     */
    attrs?: { [key: string]: any };
    /**
     * 目标组件渲染的事件
     */
    events?: { [key: string]: (...args: any[]) => any };
    /**
     * 渲染器名称
     */
    name?: string;
    /**
     * 目标组件渲染的参数
     */
    props?: { [key: string]: any };
  }
  export interface EmptyOpts extends EmptyRender {}

  /**
   * 调整列宽和行高整配置项
   */
  export interface ResizableConfig<D = AsTablePropTypes.Row> {
    /**
     * 拖拽模式，如果是列拖拽，则支持自适应和固定模式
     */
    dragMode?: '' | 'auto' | 'fixed';
    /**
     * 所有单元格默认允许拖拽调整列宽
     */
    isAllColumnDrag?: boolean;
    /**
     * 所有单元格默认允许拖拽调整行高
     */
    isAllRowDrag?: boolean;
    /**
     * 双击自适应行高，启用后双击拖拽线，自动根据整列的内容自适应调整行高
     */
    isDblclickAutoHeight?: boolean;
    /**
     * 双击自适应列宽，启用后双击拖拽线，自动根据整列的内容自适应调整列宽
     */
    isDblclickAutoWidth?: boolean;
    /**
     * 当拖拽调整行高时，是否自动同步更新所选区域的所有行高
     */
    isSyncAutoHeight?: boolean;
    /**
     * 当拖拽调整列宽时，是否自动同步更新所选区域的所有列宽
     */
    isSyncAutoWidth?: boolean;
    /**
     * 行高拖动的最大高度
     */
    maxHeight?:
      | ((params: {
          $columnIndex: number;
          $rowIndex: number;
          $table: AsTableConstructor<D>;
          _columnIndex: number;
          _rowIndex: number;
          column: AsTableDefines.ColumnInfo;
          columnIndex: number;
          row: any;
          rowIndex: number;
        }) => number | string)
      | number
      | string;
    /**
     * 列宽拖动的最大宽度
     */
    maxWidth?:
      | ((params: {
          $columnIndex: number;
          $rowIndex: number;
          $table: AsTableConstructor<D>;
          _columnIndex: number;
          _rowIndex: number;
          cell?: HTMLElement;
          column: AsTableDefines.ColumnInfo;
          columnIndex: number;
          rowIndex: number;
        }) => number | string)
      | number
      | string;
    /**
     * 行高拖动的最小高度
     */
    minHeight?:
      | ((params: {
          $columnIndex: number;
          $rowIndex: number;
          $table: AsTableConstructor<D>;
          _columnIndex: number;
          _rowIndex: number;
          column: AsTableDefines.ColumnInfo;
          columnIndex: number;
          row: any;
          rowIndex: number;
        }) => number | string)
      | number
      | string;
    /**
     * 列宽拖动的最小宽度
     */
    minWidth?:
      | ((params: {
          $columnIndex: number;
          $rowIndex: number;
          $table: AsTableConstructor<D>;
          _columnIndex: number;
          _rowIndex: number;
          cell?: HTMLElement;
          column: AsTableDefines.ColumnInfo;
          columnIndex: number;
          rowIndex: number;
        }) => number | string)
      | number
      | string;
    /**
     * 显示列宽拖拽提示，拖拽过程中实时显示列宽
     */
    showDragTip?: boolean;
  }
  export interface ResizableOpts<
    D = AsTablePropTypes.Row,
  > extends ResizableConfig<D> {}

  /**
   * 行拖拽排序配置项
   */
  export interface RowDragConfig<D = any> {
    /**
     * 是否显示拖拽动画，启用后由数据量的大小来影响渲染性能
     */
    animation?: boolean;
    /**
     * 是否禁用拖拽按钮
     */
    disabledMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      row: D;
    }): boolean;
    /**
     * 拖拽结束时是否允许行拖拽调整顺序的方法，该方法的返回值用来决定是否允许被拖拽调整顺序
     */
    dragEndMethod?(
      params: Omit<AsTableDefines.RowDragendEventParams<D>, '_index'>,
    ): boolean | Promise<boolean>;
    /**
     * 拖拽开始时是否允许行拖拽调整顺序的方法，该方法的返回值用来决定是否允许被拖拽
     */
    dragStartMethod?(
      params: AsTableDefines.RowDragstartEventParams<D>,
    ): boolean;
    /**
     * 用于 isToChildDrag，在拖拽完成后，该方法的返回值用于决定是否拖拽成子级
     */
    dragToChildMethod?(
      params: Omit<AsTableDefines.RowDragToChildMethod<D>, '_index'>,
    ): boolean;
    /**
     * 自定义图标
     */
    icon?: string;
    /**
     * 只对 tree-config 启用有效，是否允许同级/跨层行拖拽，用于树结构，启用后允许跨层级拖拽（除了上级拖到子级）
     */
    isCrossDrag?: boolean;
    /**
     * 是否允许在不同表格之间进行拖拽
     */
    isCrossTableDrag?: boolean;
    /**
     * 只对 tree-config 启用有效，是否允许同级行拖拽，用于树结构，启用后允许同层级之间进行拖拽
     */
    isPeerDrag?: boolean;
    /**
     * 需要 isCrossDrag，只对 tree-config 启用有效，是否允许将自己拖拽到子级行中
     */
    isSelfToChildDrag?: boolean;
    /**
     * 需要 isCrossDrag，只对 tree-config 启用有效，是否允许拖拽成目标行的子级
     */
    isToChildDrag?: boolean;
    /**
     * 显示拖拽提示，拖拽过程中显示信息
     */
    showDragTip?: boolean;
    /**
     * 是否显示拖拽辅助状态显示
     */
    showGuidesStatus?: boolean;
    /**
     * 是否显示拖拽按钮图标
     */
    showIcon?: boolean;
    /**
     * 自定义插槽模板
     */
    slots?: {
      tip?:
        | ((
            params: AsTableDefines.RowDragSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
    };
    /**
     * 自定义提示内容
     */
    tooltipMethod?(params: {
      $table: AsTableConstructor<D>;
      row: D;
    }): null | number | string;
    /**
     * 触发拖拽方式
     */
    trigger?: '' | 'cell' | 'default' | 'row' | null;
    /**
     * 是否显示拖拽按钮
     */
    visibleMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      row: D;
    }): boolean;
  }

  export interface ExportOrPrintColumnOption {
    children?: ExportOrPrintColumnOption[];
    colid?: number;
    field?: string;
    type?: string;
    width?: number | string;
  }

  interface ExportAndPrintConfig<D = any> {
    /**
     * 是否允许列选中的方法，该方法的返回值用来决定这一列的 checkbox 是否可以选中
     */
    checkMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo<D>;
    }): boolean;
    /**
     * 列过滤方法
     */
    columnFilterMethod?(params: {
      $columnIndex: number;
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $table: AsTableConstructor;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
    /**
     * 自定义列
     */
    columns?: AsTableDefines.ColumnInfo[] | ExportOrPrintColumnOption[];
    /**
     * 自定义数据
     */
    data?: any[];
    /**
     * 数据过滤方法
     */
    dataFilterMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $rowIndex: number;
      $table: AsTableConstructor;
      row: any;
    }): boolean;
    /**
     * 是否马上下载，如果设置为 false 则通过返回结果为内容的 Promise
     */
    download?: boolean;
    /**
     * 排除列
     */
    excludeFields?: string[];
    /**
     * 额外的列，
     */
    extraFields?: string[];
    /**
     * 文件名
     */
    filename?:
      | ((params: {
          // TODO $gantt: AsGanttConstructor | null | undefined;
          // TODO $grid: AsGridConstructor | null | undefined;
          $table: AsTableConstructor;
          options: ExportOpts;
        }) => string)
      | string;
    /**
     * 表尾过滤方法
     */
    footerFilterMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $rowIndex: number;
      $table: AsTableConstructor;
      items: any[];
    }): boolean;
    /**
     * 指定列
     */
    includeFields?: string[];
    isColgroup?: boolean;
    /**
     * 是否需要表尾
     */
    isFooter?: boolean;
    /**
     * 是否需要表头
     */
    isHeader?: boolean;
    isMerge?: boolean;
    /**
     * 是否展开所有分组层级
     */
    isRowGroupAllExpanded?: boolean;
    /**
     * 是否导出标题，如果为 false 则导出字段名
     */
    isTitle?: boolean;
    /**
     * 是否展开所有树层级
     */
    isTreeAllExpanded?: boolean;
    /**
     * 是否显示内置的消息提示
     */
    message?: boolean;
    /**
     * 导出数据的方式
     */
    mode?: string;
    /**
     * TODO 面板参数配置项
     */
    // modelOptions?: {
    //   fullscreen?: AsModalPropTypes.Fullscreen;
    //   height?: AsModalPropTypes.Height;
    //   lockView?: AsModalPropTypes.LockView;
    //   mask?: AsModalPropTypes.Mask;
    //   minHeight?: AsModalPropTypes.MinHeight;
    //   minWidth?: AsModalPropTypes.MinWidth;
    //   position?: AsModalPropTypes.Position;
    //   remember?: AsModalPropTypes.Remember;
    //   resize?: AsModalPropTypes.Resize;
    //   showMaximize?: AsModalPropTypes.ShowMaximize;
    //   showMinimize?: AsModalPropTypes.ShowMinimize;
    //   title?: AsModalPropTypes.Title;
    //   width?: AsModalPropTypes.Width;
    // };
    /**
     * 导出数据的方式列表
     */
    modes?: (
      | string
      | {
          label?: number | string;
          value: number | string;
        }
    )[];
    /**
     * 是否为源数据
     */
    original?: boolean;
    /**
     * 自定义参数
     */
    params?: Record<string, any>;

    /**
     * 面板选项配置项
     */
    settingOptions?: {
      /**
       * 是否显示自定义列
       */
      showColumn?: boolean;
      /**
       * 是否显示文件名
       */
      showFileName?: boolean;
      /**
       * 是否显示选择数据
       */
      showMode?: boolean;
      /**
       * 是否显示参数设置
       */
      showParameter?: boolean;
      /**
       * 是否显示标题
       */
      showSheet?: boolean;
      /**
       * 是否显示文件类型
       */
      showType?: boolean;
      /**
       * 是否显示列宽模式
       */
      showWidthMode?: boolean;
    };

    /**
     * 表名
     */
    sheetName?:
      | ((params: {
          // TODO $gantt: AsGanttConstructor | null | undefined;
          // TODO $grid: AsGridConstructor | null | undefined;
          $table: AsTableConstructor;
          options: ExportOpts;
        }) => string)
      | string;
  }

  /**
   * 当前行配置项
   */
  export interface CurrentRowConfig<D = any> {
    /**
     * 用于选中当前行执行之前的方法，返回 false 可以阻止默认行为
     */
    beforeSelectMethod?(params: {
      $table: AsTableConstructor<D>;
      row: D;
      selected?: boolean;
    }): boolean;
    /**
     * 只对 mouse-config.selected 启用有效，是否跟随单元格选中而移动高亮行
     */
    isFollowSelected?: boolean;
    /**
     * 严格模式，选中后不能取消
     */
    strict?: boolean;
    /**
     * 触发方式
     */
    trigger?: '' | 'default' | 'manual' | 'row' | null;
  }

  /**
   * 当前列配置项
   */
  export interface CurrentColumnConfig<D = any> {
    /**
     * 用于选中当前列执行之前的方法，返回 false 可以阻止默认行为
     */
    beforeSelectMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      selected?: boolean;
    }): boolean;
    /**
     * 只对 mouse-config.selected 启用有效，是否跟随单元格选中而移动高亮列
     */
    isFollowSelected?: boolean;
    /**
     * 严格模式，选中后不能取消
     */
    strict?: boolean;
    /**
     * 触发方式
     */
    trigger?: '' | 'cell' | 'default' | 'header' | 'manual' | null;
  }

  /**
   * 单元格配置项
   */
  export interface CellConfig<D = any> {
    /**
     * 单元格默认高度
     */
    height?: number;
    /**
     * 单元格最大高度
     */
    maxHeight?: number;
    /**
     * 单元格最小高度
     */
    minHeight?: number;
    /**
     * 是否显示间距
     */
    padding?: AsColumnPropTypes.Padding | AsTableDefines.PaddingConfig;
    /**
     * 垂直对齐方式
     */
    verticalAlign?: AsColumnPropTypes.VerticalAlign;
  }

  /**
   * 表头单元格配置项
   */
  export interface HeaderCellConfig<D = any> {
    /**
     * 单元格默认高度
     */
    height?: 'unset' | number;
    /**
     * 是否显示间距
     */
    padding?: AsTableDefines.PaddingConfig | boolean;
  }

  /**
   * 表尾单元格配置项
   */
  export interface FooterCellConfig<D = any> {
    /**
     * 单元格默认高度
     */
    height?: 'unset' | number;
    /**
     * 是否显示间距
     */
    padding?: AsTableDefines.PaddingConfig | boolean;
  }

  /**
   * 导出参数
   */
  export interface ExportConfig<D = any> extends ExportAndPrintConfig<D> {
    // 内置属性
    _typeMaps?: Record<string, number>;
    /**
     * 导出之后的方法
     */
    afterExportMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $table: AsTableConstructor;
      options: ExportHandleOptions;
      status: boolean;
    }): void;
    /**
     * 导出之前的方法，可以返回false阻止导出行为
     */
    beforeExportMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $table: AsTableConstructor;
      options: ExportHandleOptions;
    }): boolean;
    /**
     * 自定义导出方法
     */
    exportMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $table: AsTableConstructor;
      options: ExportHandleOptions;
    }): Promise<any>;
    /**
     * 是否服务端导出
     */
    remote?: boolean;
    /**
     * 用于特定的文件类型，例如 xlsx，自定义文件处理逻辑
     */
    // TODO sheetMethod?(params: AsTableDefines.ExtortSheetMethodParams): void;
    /**
     * 文件类型
     */
    type?: string;
    /**
     * 可选文件类型列表
     */
    types?: string[];
    /**
     * 只对 remote=html,xlsx 有效，是否使用样式
     */
    useStyle?: boolean;
  }
  export interface ExportOpts extends ExportConfig {}

  export interface ExpandOpts<D = any> extends ExpandConfig<D> {}
  export interface ExportHandleOptions
    extends Exclude<ExportConfig, 'filename' | 'sheetName'>, PrintConfig {
    /**
     * @private
     */
    _columnConfs?: AsTableDefines.ColumnInfo[] | ExportOrPrintColumnOption[];
    /**
     * @private
     */
    _isCustomColumn?: boolean;
    /**
     * @private
     */
    _isCustomData?: boolean;
    colgroups: AsTableDefines.ColumnInfo[][];
    columns: AsTableDefines.ColumnInfo[];
    data: any[];
    filename: string;
    /**
     * @private
     */
    print?: boolean;
    sheetName: string;
  }

  /**
   * 打印参数
   */
  export interface PrintConfig<D = any> extends ExportAndPrintConfig<D> {
    /**
     * 打印之后的方法
     */
    afterPrintMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $table: AsTableConstructor;
      html: string;
      options: PrintHandleOptions;
    }): string;
    /**
     * 打印之前的方法，可以通过返回自false阻止打印
     */
    beforePrintMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $table: AsTableConstructor;
      html: string;

      options: PrintHandleOptions;
    }): boolean | string;
    /**
     * 自定义打印内容
     */
    html?: string;
    /**
     * 自定义打印方法，可以通过返回自定义打印的内容
     */
    printMethod?(params: {
      // TODO $gantt: AsGanttConstructor | null | undefined;
      // TODO $grid: AsGridConstructor | null | undefined;
      $table: AsTableConstructor;
      html: string;

      options: PrintHandleOptions;
    }): string;
    /**
     * 打印样式
     */
    style?: string;

    /**
     * 列宽计算模式，支持默认default，等比例scale，自适应auto
     */
    widthMode?: '' | 'auto' | 'default' | 'scale' | null;
  }
  export interface PrintOpts extends PrintConfig {}
  export interface PrintHandleOptions extends PrintConfig {}

  /**
   * 编辑配置项
   */
  export interface EditConfig<DT = any> {
    /**
     * 自定义编辑之后逻辑
     */
    afterEditMethod?(params: {
      // TODO $gantt: AsGanttConstructor<DT> | null | undefined;
      // $grid: AsGridConstructor<DT> | null | undefined;
      $table: AsTableConstructor<DT> & AsTablePrivateMethods;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: DT;
      rowIndex: number;
    }): void;
    /**
     * 当点击表格之外或者非编辑列之后，是否自动清除单元格的激活状态
     */
    autoClear?: boolean;
    /**
     * 当单元格被激活为编辑状态时，是否自动聚焦，默认 input，可以通过 item-render.autoFocus 指定
     */
    autoFocus?: boolean;
    /**
     * 当单元格被激活为编辑状态时，是否自动定位
     */
    autoPos?: boolean;
    /**
     * 自定义编辑之前逻辑，该方法的返回值用来决定该单元格是否允许编辑
     */
    beforeEditMethod?(params: {
      // TODO $gantt: AsGanttConstructor<DT> | null | undefined;
      // $grid: AsGridConstructor<DT> | null | undefined;
      $table: AsTableConstructor<DT> & AsTablePrivateMethods;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: DT;
      rowIndex: number;
    }): boolean;
    /**
     * 是否启用缓存，启用后渲染性能的大幅提升，数据越大提升越好
     */
    cache?: boolean;
    /**
     * 是否启用
     */
    enabled?: boolean;
    /**
     * 自定义可编辑列的状态图标
     */
    icon?:
      | ((params: {}) => AsComponentSlotType | AsComponentSlotType[])
      | string;
    /**
     * 启用可复用渲染模式，对于全键盘方式编辑单元格时对中文输入法兼容性较好
     */
    isReuseKeep?: boolean;
    /**
     * 编辑模式
     * - cell（单元格编辑模式）
     * - row（行编辑模式）
     */
    mode?: '' | 'cell' | 'row' | null;
    /**
     * 是否显示必填字段的红色星号
     */
    showAsterisk?: boolean;
    /**
     * 是否显示列头编辑图标
     */
    showIcon?: boolean;
    /**
     * 只对 keep-source 开启有效，是否显示单元格新增状态
     */
    showInsertStatus?: boolean;
    /**
     * 只对 keep-source 开启有效，是否显示单元格新增与修改状态
     */
    showStatus?: boolean;
    /**
     * 只对 keep-source 开启有效，是否显示单元格修改状态
     */
    showUpdateStatus?: boolean;

    /**
     * 触发方式
     * - manual（手动触发方式，只能用于 mode=row）
     * - click（点击触发编辑）
     * - dblclick（双击触发编辑）
     */
    trigger?: '' | 'click' | 'dblclick' | 'manual' | null;
  }

  export interface EditOpts<D = any> extends EditConfig<D> {}

  /**
   * 数据状态监听配置项
   */
  export interface EditDirtyConfig {
    /**
     * 排除监听数据指定列字段
     */
    excludeFields?: string[];
    /**
     * 监听数据额外的列的字段，如果同时指定 includeFields 则无效
     */
    extraFields?: string[];
    /**
     * 监听数据指定列字段
     */
    includeFields?: string[];
  }

  /**
   * 单选框配置
   */
  export interface RadioConfig<D = AsTablePropTypes.Row> {
    checkMethod?(params: { $table: AsTableConstructor<D>; row: D }): boolean;
    checkRowKey?: number | string;
    highlight?: boolean;
    labelField?: string;
    reserve?: boolean;
    /**
     * 严格模式，选中后不能取消
     */
    strict?: boolean;
    trigger?: '' | 'cell' | 'default' | 'manual' | 'row' | null;
    visibleMethod?(params: { $table: AsTableConstructor<D>; row: D }): boolean;
  }
  export interface RadioOpts<D = AsTablePropTypes.Row> extends RadioConfig<D> {}

  /**
   * 复选框配置项
   */
  export interface CheckboxConfig<D = AsTablePropTypes.Row> {
    /**
     * 默认勾选所有，只会在初始化时被触发一次
     */
    checkAll?: boolean;
    /**
     * 绑定选中属性，支持读写，行数据中必须存在该字段，否则无效
     */
    checkField?: string;
    /**
     * 是否允许勾选的方法，该方法，的返回值用来决定这一行的 checkbox 是否可以勾选
     */
    checkMethod?(params: { $table: AsTableConstructor<D>; row: D }): boolean;
    /**
     * 默认勾选指定行，只会在初始化时被触发一次，需要有 row-config.keyField
     */
    checkRowKeys?: number[] | string[];
    /**
     * 是否严格的遵循父子不互相关联的做法
     */
    checkStrictly?: boolean;
    /**
     * 自定义列头复选框的 title 提示语
     */
    headerTitle?: number | string;
    /**
     * 是否高亮勾选行
     */
    highlight?: boolean;
    /**
     * 绑定半选只读属性，仅有只读权限，不支持修改，行数据中必须存在该字段，否则无效
     */
    indeterminateField?: string;
    /**
     * 开启复选框指定行选择功能，启用后通过鼠标点击和 shift 键选取指定范围的行
     */
    isShiftKey?: boolean;
    /**
     * 复选框显示的字段名，可以直接显示在复选框中
     */
    labelField?: string;
    /**
     * 开启复选框范围选择功能，启用后通过鼠标在复选框的列内滑动选中或取消指定行
     */
    range?: boolean;
    /**
     * 是否保留勾选状态，对于某些场景可能会用到，比如数据被刷新之后还保留之前选中的状态
     */
    reserve?: boolean;
    /**
     * 是否显示全选按钮，如果 checkStrictly=true 则默认为 false
     */
    showHeader?: boolean;
    /**
     * 是否显示保留勾选状态，启用后如果存在保留记录，则未勾选当前页数据也会显示未半选状态
     */
    showReserveStatus?: boolean;
    /**
     * 严格模式，当数据为空或全部禁用时，列头的复选框为禁用状态
     */
    strict?: boolean;
    /**
     * 触发方式
     */
    trigger?: '' | 'cell' | 'default' | 'manual' | 'row' | null;

    /**
     * 是否允许勾选的方法，该方法，的返回值用来决定这一行的 checkbox 是否显示
     */
    visibleMethod?(params: { $table: AsTableConstructor<D>; row: D }): boolean;
  }

  export interface CheckboxOpts<
    D = AsTablePropTypes.Row,
  > extends CheckboxConfig<D> {}

  /**
   * 树形结构配置项
   */
  export interface TreeConfig<D = any> {
    /**
     * 对于同一级的节点，每次只能展开一个
     */
    accordion?: boolean;
    /**
     * 树子节点的字段名
     */
    childrenField?: string;
    /**
     * 默认展开所有子孙树节点（只会在初始化时被触发一次）
     */
    expandAll?: boolean;
    /**
     * 默认展开指定树节点（只会在初始化时被触发一次，需要有 row-config.keyField）
     */
    expandRowKeys?: number[] | string[];
    /**
     * 只对 lazy 启用后有效，标识是否存在子节点，从而控制是否允许被点击
     */
    hasChildField?: string;
    /**
     * 自定义收起后显示的图标
     */
    iconClose?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 自定义懒加载中显示的图标
     */
    iconLoaded?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 自定义展开后显示的图标
     */
    iconOpen?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 树节点的缩进
     */
    indent?: number;
    /**
     * 是否使用懒加载（启用后只有指定 hasChildField 字段的节点才允许被点击）
     */
    lazy?: boolean;
    /**
     * 该方法用于异步加载子节点
     */
    loadMethod?(params: {
      $table: AsTableConstructor<D>;
      row: D;
    }): Promise<any[]>;
    /**
     * 用于 tree-config.transform，树子节点映射的字段名
     */
    mapChildrenField?: string;
    /**
     * 是否显示边距
     */
    padding?: boolean;
    /**
     * 用于 tree-config.transform，树父节点的字段名
     */
    parentField?: string;
    /**
     * 是否保留展开状态，对于某些场景可能会用到，比如数据被刷新之后还保留之前展开的状态（需要有 row-config.keyField）
     */
    reserve?: boolean;
    /**
     * 用于 tree-config.transform，树节点的字段名
     */
    rowField?: string;
    /**
     * 树结构序号显示模式，支持层级序号和自增序号（仅支持 transform）个固定序号
     */
    seqMode?: '' | 'default' | 'fixed' | 'increasing' | null;
    /**
     * 是否显示图标按钮
     */
    showIcon?: boolean;
    /**
     * 树节点的连接线（启用连接线会降低渲染性能）
     */
    showLine?: boolean;
    /**
     * 只对 showLine 有效，显示树的根节点连接线
     */
    showRootLine?: boolean;
    /**
     * 该方法在展开或关闭触发之前调用，可以通过返回值来决定是否允许继续执行
     */
    toggleMethod?(params: {
      $columnIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      expanded: boolean;
      row: D;
    }): boolean;

    /**
     * 自动将列表转为树结构
     */
    transform?: boolean;
    /**
     * 触发方式（注：当多种功能重叠时，会同时触发）
     */
    trigger?: '' | 'cell' | 'default' | 'manual' | 'row' | null;
    /**
     * 该方法返回值用来决定该行是否显示树展开按钮
     */
    visibleMethod?(params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): boolean;
  }

  export type TreeOpts<D = any> = Required<TreeConfig<D>>;

  /**
   * 数据聚合配置项
   */
  export interface AggregateConfig<D = any> {
    /**
     * 对于同一级的节点，每次只能展开一个
     */
    accordion?: boolean;
    /**
     * 个性化设置聚合数据的计算方法
     */
    calcValuesMethod?: (params: {
      $table: AsTableConstructor<D>;
      aggValue: number;
      childCount: number;
      children: D[];
      column: AsTableDefines.ColumnInfo;
      groupColumn: AsTableDefines.ColumnInfo;
      groupField: AsColumnPropTypes.Field;
      groupValue: any;
    }) => number;
    /**
     * 分组子节点的字段名
     */
    childrenField?: string;
    /**
     * 自定义分组单元格展示内容
     */
    contentMethod?: (params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      groupColumn: AsTableDefines.ColumnInfo;
      groupField: AsColumnPropTypes.Field;
      groupValue: any;
    }) => number | string;
    /**
     * 排除哪些列允许拖拽到分组
     */
    excludeGroupFields?: string[];
    /**
     * 排除哪些列允许拖拽到值
     */
    excludeValuesFields?: string[];
    /**
     * 默认展开所有分组行（只会在初始化时被触发一次）
     */
    expandAll?: boolean;
    /**
     * 默认展开指定分组行的字段（只会在初始化时被触发一次）
     */
    expandGroupFields?: string[];
    /**
     * 个性化设置聚合数据的显示值
     */
    formatValuesMethod?: (params: {
      $table: AsTableConstructor<D>;
      aggValue: number;
      childCount: number;
      column: AsTableDefines.ColumnInfo;
      groupColumn: AsTableDefines.ColumnInfo;
      groupField: AsColumnPropTypes.Field;
      groupValue: any;
    }) => number | string;
    /**
     * 按指定字段对数据进行分组
     */
    groupFields?: string[];
    /**
     * 自定义收起后显示的图标
     */
    iconClose?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 自定义展开后显示的图标
     */
    iconOpen?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 指定哪些列允许拖拽到分组
     */
    includeGroupFields?: string[];
    /**
     * 指定哪些列允许拖拽到值
     */
    includeValuesFields?: string[];
    /**
     * 分组节点的缩进
     */
    indent?: number;
    /**
     * 聚合函数默认值初始化的方法，当聚合列被创建时会执行一次
     */
    initialAggFuncMethod?: (params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }) => AsTableDefines.AggFuncType;
    /**
     * 分组子节点映射的字段名
     */
    mapChildrenField?: string;
    /**
     * 数据分组允许设置的最大数量
     */
    maxGroupSize?: number;
    /**
     * 分组列展示方式，column独立列展示，combined 将多个分组字段合并为一组进行展示
     */
    mode?: '' | 'column' | 'combined' | 'default' | null;
    /**
     * 是否显示边距
     */
    padding?: boolean;
    /**
     * 分组父节点的字段名
     */
    parentField?: string;
    /**
     * 显示位置
     */
    placement?: '' | 'bottom' | 'default' | 'left' | 'right' | 'top' | null;
    /**
     * 分组节点的字段名
     */
    rowField?: string;
    /**
     * 用于 mode=combined 有效，分组字段合并内容的分隔符
     */
    separator?: string;
    /**
     * 是否显示聚合函数的列标题
     */
    showAggFuncTitle?: boolean;
    /**
     * 是否显示图标按钮
     */
    showIcon?: boolean;
    /**
     * 是否显示分组的统计
     */
    showTotal?: boolean;
    /**
     * 自定义分组统计的方法
     */
    totalMethod?: (params: {
      $table: AsTableConstructor<D>;
      childCount: number;
      column: AsTableDefines.ColumnInfo;
      groupColumn: AsTableDefines.ColumnInfo;
      groupField: AsColumnPropTypes.Field;
      groupValue: any;
    }) => number | string;
    /**
     * 触发方式
     */
    trigger?: '' | 'cell' | 'default' | 'manual' | 'row' | null;
  }
  /**
   * 聚合函数计算精度配置项
   */
  export interface AggregateAccuracyConfig<D = any> {
    [key: string]: AggregateAccuracyObj<D>;
  }
  export interface AggregateAccuracyObj<D = any> {
    /**
     * 小数保留位数
     */
    digits?: null | number;
    /**
     * 小数处理方式，支持：四舍五入，向下取整，向上取整
     */
    format?:
      | ''
      | 'ceil'
      | 'floor'
      | 'round'
      | ((params: {
          $table: AsTableConstructor<D>;
          aggValue: number;
          childCount: number;
          children: D[];
          column: AsTableDefines.ColumnInfo;
          groupColumn: AsTableDefines.ColumnInfo;
          groupField: AsColumnPropTypes.Field;
          groupValue: any;
        }) => number)
      | null;
  }
  /**
   * 右键菜单配置项
   */
  export interface MenuConfig<D = any> {
    /**
     * 内容的右键菜单
     */
    body?: AsTableDefines.MenuOptions;
    /**
     * 菜单面板的 className
     */
    className?: string;
    destroyOnClose?: boolean;
    /**
     * 是否启用
     */
    enabled?: boolean;
    /**
     * 表尾的右键菜单
     */
    footer?: AsTableDefines.MenuOptions;
    /**
     * 表头的右键菜单
     */
    header?: AsTableDefines.MenuOptions;
    /**
     * 是否启用元素挂载
     */
    transfer?: boolean;
    /**
     * 触发方式
     * default（默认右键表格触发）, cell（右键单元格触发）
     */
    trigger?: '' | 'cell' | 'default' | null;
    /**
     * 该函数的返回值用来决定是否允许显示右键菜单
     */
    visibleMethod?(params: {
      $table: AsTableConstructor<D>;
      column?: AsTableDefines.ColumnInfo;
      columnIndex?: number;
      columns: AsTableDefines.ColumnInfo[];
      options: AsTableDefines.MenuFirstOption[][];
      row?: D;
      rowIndex?: number;
      type: string;
    }): boolean;
    /**
     * 菜单宽度
     */
    width?: number | string;
    zIndex?: number;
  }
  export type MenuOpts<D = any> = Required<MenuConfig<D>>;
  /**
   * 复制粘贴配置项
   */
  export interface ClipConfig<DT = any> {
    /**
     * 自定义单元格复制到剪贴板之后的方法
     */
    afterCopyMethod?(params: {
      $table: AsTableConstructor<DT>;
      isCut: boolean;
      targetAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): void;
    /**
     * 自定义单元格剪贴值清除之后的方法
     */
    afterCutMethod?(params: {
      $table: AsTableConstructor<DT>;
      currentAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      cutAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): void;
    /**
     * 自定义单元格粘贴赋值之后的方法
     */
    afterPasteMethod?(params: {
      $table: AsTableConstructor<DT>;
      cellValues: any[][];
      currentAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      cutAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      insertColumns: AsTableDefines.ColumnInfo[];
      insertRows: DT[];
      isCut: boolean;
      pasteCells: string[][];
      targetAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): void;
    /**
     * 自定义单元格复制取值之前的方法，可以通过返回 false 阻止复制行为
     */
    beforeCopyMethod?(params: {
      $table: AsTableConstructor<DT>;
      activeArea: AsTableExtendCellAreaDefines.MouseCellArea<DT>;
      isCut: boolean;
      targetAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): boolean;
    /**
     * 自定义单元格剪贴值清除之前的方法，可以通过返回 false 阻止清除行为
     */
    beforeCutMethod?(params: {
      $table: AsTableConstructor<DT>;
      activeArea: AsTableExtendCellAreaDefines.MouseCellArea<DT>;
      clipData: {
        html?: string;
        text?: string;
      };
      currentAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      cutAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): boolean;
    /**
     * 自定义单元格粘贴赋值之前的方法，可以通过返回 false 阻止粘贴行为
     */
    beforePasteMethod?(params: {
      $table: AsTableConstructor<DT>;
      activeArea: AsTableExtendCellAreaDefines.MouseCellArea<DT>;
      cellValues: string[][];
      clipData: {
        html?: string;
        text?: string;
      };
      currentAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      cutAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      isCut: boolean;
      pasteCells: string[][];
      targetAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): boolean;
    /**
     * 重写表头单元格复制取值的方法
     */
    copyHeaderMethod?(params: {
      $table: AsTableConstructor<DT>;
      cellTitle: string;
      column: AsTableDefines.ColumnInfo;
      isCut: boolean;
    }): string;
    /**
     * 重写单元格复制取值的方法
     */
    copyMethod?: AsColumnPropTypes.CopyMethod<DT>;
    /**
     * @deprecated 请使用 isCopyToContent
     */
    copyToLabel?: boolean;
    /**
     * 只对 isColumnIncrement 有效，自定义创建自增列配置的方法
     */
    createColumnsMethod?(params: {
      $table: AsTableConstructor<DT>;
      cellValues: any[][];
      currentAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      insertColumns: AsTableDefines.ColumnOptions[];
      pasteCells: string[][];
      targetAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): AsTableDefines.ColumnOptions<DT>[];
    /**
     * 只对 isRowIncrement 有效，自定义创建自增行数据的方法
     */
    createRowsMethod?(params: {
      $table: AsTableConstructor<DT>;
      cellValues: any[][];
      currentAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
      insertRows: DT[];
      pasteCells: string[][];
      targetAreas: AsTableExtendCellAreaDefines.MouseCellArea<DT>[];
    }): DT[];
    /**
     * 重写单元格剪贴值清除的方法
     */
    cutMethod?: AsColumnPropTypes.CutMethod<DT>;
    /**
     * 用于排除指定列允许不允许被复制粘贴
     */
    excludeFields?: string[];
    /**
     * 用于指定哪些列允许被复制粘贴
     */
    includeFields?: string[];
    /**
     * 只对 area-config.multiple 有效，对相同行数的跨列选取多区域进行复制粘贴
     */
    isAcrossColumn?: boolean;
    /**
     * 只对 area-config.multiple 有效，对相同列数的跨行选取多区域进行复制粘贴
     */
    isAcrossRow?: boolean;
    /**
     * 只对 isCopyHeader 有效，是否支持分组列头
     */
    isColgroup?: boolean;
    /**
     * 是否启用列自增
     */
    isColumnIncrement?: boolean;
    /**
     * 是否启用复制功能
     */
    isCopy?: boolean;
    /**
     * 是否同时复制列头
     */
    isCopyHeader?: boolean;
    /**
     * 用于 isCopy，当复制单元格时，是否为对应格式化后的值
     */
    isCopyToContent?: boolean;
    /**
     * 是否启用剪贴功能
     */
    isCut?: boolean;
    /**
     * 只对 tree-config 启用有效，是否深层粘贴
     */
    isDeepPaste?: boolean;
    /**
     * 是否填充粘贴
     */
    isFillPaste?: boolean;
    /**
     * 是否启用粘贴功能
     */
    isPaste?: boolean;
    /**
     * 是否启用行自增
     */
    isRowIncrement?: boolean;
    /**
     * @deprecated 请使用 trailingNewline
     */
    isTrimCopyContent?: boolean;
    /**
     * 重写单元格粘贴赋值的方法
     */
    pasteMethod?: AsColumnPropTypes.PasteMethod<DT>;
    /**
     * 用于 isCopy，是否给复制到剪贴板文本的末尾带一个换行符
     */
    trailingNewline?: boolean;
  }
  export interface ClipOpts<D = any> extends ClipConfig<D> {}
  /**
   * 查找与替换配置项
   */
  export interface FnrConfig<DT = any> {
    /**
     * 自定义单元格查找之后的方法
     */
    afterFindMethod?(params: {
      $table: AsTableConstructor<DT>;
      findValue: null | string;
      isAll: boolean;
      result: any[];
    }): void;
    /**
     * 自定义单元格替换之后的方法
     */
    afterReplaceMethod?(params: {
      $table: AsTableConstructor<DT>;
      findValue: string;
      isAll: boolean;
      replaceValue: string;
      result: any[];
    }): void;
    /**
     * 自定义单元格查找之前的方法，可以通过返回 false 阻止查找行为
     */
    beforeFindMethod?(params: {
      $table: AsTableConstructor<DT>;
      findValue: null | string;
      isAll: boolean;
    }): boolean;
    /**
     * 自定义单元格替换之前的方法，可以通过返回 false 阻止替换行为
     */
    beforeReplaceMethod?(params: {
      $table: AsTableConstructor<DT>;
      findValue: string;
      isAll: boolean;
      replaceValue: string;
    }): boolean;
    /**
     * 自定义单元格查找方法
     */
    findMethod?(params: {
      $table: AsTableConstructor<DT>;
      cellValue: any;
      column: AsTableDefines.ColumnInfo;
      findRE: null | RegExp;
      findValue: null | string;
      isRE: boolean;
      isSensitive: boolean;
      isWhole: boolean;
      row: DT;
    }): boolean;
    /**
     * 是否启用查找功能
     */
    isFind?: boolean;
    /**
     * 是否启用替换功能
     */
    isReplace?: boolean;
    /**
     * 列表配置项
     */
    listOptions?: {
      /**
       * 格式化列表的显示值
       */
      formatCellValue?(params: { cellValue: any; item: any }): number | string;
    };
    /**
     * 匹配选项配置
     */
    matchOptions?: {
      /**
       * 是否启用正则表达式
       */
      isRE?: boolean;
      /**
       * 是否启用区分大小写
       */
      isSensitive?: boolean;
      /**
       * 是否启用全词匹配
       */
      isWhole?: boolean;
    };
    /**
     * 弹窗配置项
     */
    modalOptions?: {
      className?: string;
      escClosable?: boolean;
      height?: number | string;
      lockView?: boolean;
      mask?: boolean;
      maskClosable?: boolean;
      minHeight?: number | string;
      minWidth?: number | string;
      resize?: boolean;
      showMaximize?: boolean;
      showMinimize?: boolean;
      showZoom?: boolean;
      title?: string;
      width?: number | string;
    };
    /**
     * 自定义单元格替换方法
     */
    replaceMethod?(params: {
      $table: AsTableConstructor<DT>;
      cellValue: any;
      column: AsTableDefines.ColumnInfo;
      findValue: string;
      replaceValue: string;
      row: DT;
    }): void;
  }
  export interface FNROpts<DT = any> extends FnrConfig<DT> {}
  /**
   * 撤销重做历史配置项
   */
  export interface UndoRedoHistoryConfig {
    /**
     * 撤销栈的最大步数
     */
    stackSize?: number;
  }
  /**
   * 导入配置项
   */
  export interface ImportConfig<D = any> {
    /**
     * 内置属性
     */
    _typeMaps?: Record<string, number>;
    /**
     * 导入之后的方法
     */
    afterImportMethod?(params: {
      $table: AsTableConstructor<D>;
      options: any;
      status: boolean;
    }): void;
    /**
     * 导入之前的方法，可以返回 false 阻止导入行为
     */
    beforeImportMethod?(params: {
      $table: AsTableConstructor<D>;
      options: any;
    }): boolean;
    /**
     * 是否启用
     */
    enabled?: boolean;
    encoding?: string;
    /**
     * 自定义导入方法
     */
    importMethod?(params: {
      $table: AsTableConstructor<D>;
      file: File;
      options: any;
    }): Promise<any>;
    /**
     * 是否显示内置的消息提示
     */
    message?: boolean;
    /**
     * 导入数据的方式
     */
    mode?: string;
    /**
     * 导入数据的方式列表
     */
    modes?: (
      | string
      | {
          label?: number | string;
          value: number | string;
        }
    )[];
    /**
     * 自定义参数
     */
    params?: Record<string, any>;
    /**
     * 是否服务端导入
     */
    remote?: boolean;
    /**
     * 可选文件类型列表
     */
    types?: string[];
  }
  export interface ImportOpts<D = any> extends ImportConfig<D> {}
  /**
   * 行配置信息
   */
  export interface RowConfig<D = any> {
    /**
     * 树子节点的字段名
     */
    childrenField?: string;
    /**
     * 自定义行主键生成的方法
     */
    createKeyMethod?(params: { keyField: string; row: D }): number | string;
    /**
     * 是否启用行拖拽排序
     */
    drag?: boolean;
    /**
     * 当鼠标点击行时，是否要高亮当前行
     */
    isCurrent?: boolean;
    /**
     * 当鼠标移到行时，是否要高亮当前行
     */
    isHover?: boolean;
    /**
     * 自定义行数据唯一主键的字段名（默认自动生成）
     */
    keyField?: string;
    /**
     * 用于 tree-config.transform，树子节点映射的字段名
     */
    mapChildrenField?: string;
    /**
     * 用于 tree-config.transform，树父节点的字段名
     */
    parentField?: string;
    /**
     * 每一行开启调整行高度
     */
    resizable?: boolean;
    /**
     * 用于 tree-config.transform，树节点的字段名
     */
    rowField?: string;
    /**
     * 自动将列表转为树结构
     */
    transform?: boolean;
    /**
     * 是否需要为每一行的 VNode 设置 key 属性
     */
    useKey?: boolean;
  }

  export interface RowOpts<D = any> extends RowConfig<D> {}

  export interface FilterOpts<
    D = AsTablePropTypes.Row,
  > extends FilterConfig<D> {}

  /**
   * 筛选配置项
   */
  export interface FilterConfig<D = AsTablePropTypes.Row> {
    className?: string;
    /**
     * 自定义确认按钮内容
     */
    confirmButtonText?: string;
    /**
     * 弹出层在关闭时是否销毁
     */
    destroyOnClose?: boolean;
    filterMethod?: (params: {
      $table: AsTableConstructor<D>;
      cellValue: any;
      column: AsTableDefines.ColumnInfo;
      options: AsTableDefines.FilterOption[];
      row: D;
      values: any[];
    }) => any;
    iconMatch?: string;
    iconNone?: string;
    /**
     * 筛选按钮图标的显示方法，该方法的返回值用于决定该列是否显示筛选按钮图标
     * @param params
     */
    iconVisibleMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
    /**
     * 只对 tree-config.transform 有效，是否允许同时筛选子孙层级
     */
    isDeep?: boolean;
    /**
     * 是否精确筛选到每一行，默认情况下是父级被匹配到则所有子级也被匹配；如果传 true 则会对每一行进行筛选
     */
    isEvery?: boolean;
    /**
     * 筛选面板最大高度
     */
    maxHeight?: number;
    /**
     * 是否允许多列筛选
     */
    multiple?: boolean;
    /**
     * 是否使用服务端筛选，如果设置为 true 则不会对数据进行处理
     */
    remote?: boolean;
    /**
     * 自定义重置按钮内容
     */
    resetButtonText?: string;
    /**
     * 是否显示底部按钮
     */
    showFooter?: boolean;
    /**
     * 是否显示筛选按钮图标
     */
    showIcon?: boolean;
    /**
     * 是否启用元素挂载
     */
    transfer?: boolean;
    zIndex?: number;
  }

  /**
   * 序号配置项
   */
  export interface SeqConfig<D = AsTablePropTypes.Row> {
    seqMethod?(params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    }): number | string;
    startIndex?: number;
  }
  export interface SeqOpts<D = AsTablePropTypes.Row> extends SeqConfig<D> {}

  interface SortConfigDefaultSort {
    field: string;
    order: SortOrder;
  }

  /**
   * 排序配置项
   */
  export interface SortConfig<D = AsTablePropTypes.Row> {
    /**
     * 是否允许点击排序图标进行操作
     */
    allowBtn?: boolean;
    /**
     * 只对 allowBtn 有效，是否启用当点击排序图标时，如果与当前一致，则取消排序
     */
    allowClear?: boolean;
    /**
     * 自定义列头升序按钮的 title 提示语
     */
    ascTitle?: number | string;
    /**
     * 只对 multiple 有效，是否按照先后触发顺序进行排序
     */
    chronological?: boolean;
    defaultSort?: SortConfigDefaultSort | SortConfigDefaultSort[];
    /**
     * 自定义列头倒序按钮的 title 提示语
     */
    descTitle?: number | string;
    iconAsc?: AsComponentSlotType | AsComponentSlotType[];
    iconDesc?: AsComponentSlotType | AsComponentSlotType[];
    iconLayout?: 'horizontal' | 'vertical';
    /**
     * 排序按钮图标的显示方法，该方法的返回值用于决定该列是否显示排序按钮图标
     * @param params
     */
    iconVisibleMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
    /**
     * 只对 tree-config.transform 有效，是否允许同时排序子孙层级
     */
    isDeep?: boolean;
    /**
     * 是否允许多列排序
     */
    multiple?: boolean;
    orders?: SortOrder[];
    /**
     * 是否使用服务端排序，如果设置为 true 则不会对数据进行处理
     */
    remote?: boolean;
    /**
     * 是否显示排序按钮图标
     */
    showIcon?: boolean;
    sortMethod?(params: {
      $table: AsTableConstructor<D>;
      data: D[];
      sortList: AsTableDefines.SortCheckedParams[];
    }): any[];
    trigger?: 'cell' | 'default';
  }
  export type SortOrder = '' | 'asc' | 'desc' | null;
  export interface SortOpts<D = AsTablePropTypes.Row> extends SortConfig<D> {
    /**
     * 只对 multiple 有效，是否按照先后触发顺序进行排序
     */
    chronological?: boolean;
    /**
     * 只对 tree-config.transform 有效，是否允许同时排序子孙层级
     */
    isDeep?: boolean;
    /**
     * 是否允许多列排序
     */
    multiple?: boolean;

    /**
     * 是否使用服务端排序，如果设置为 true 则不会对数据进行处理
     */
    remote?: boolean;

    sortMethod?(params: {
      $table: AsTableConstructor<D>;
      data: D[];
      sortList: AsTableDefines.SortCheckedParams[];
    }): any[];
  }

  export interface ScrollbarXConfig {
    /**
     * 滚动行为
     */
    overscrollBehavior?: '' | 'contain' | 'none';
    /**
     * 滚动条显示位置
     */
    position?: '' | 'bottom' | 'top';
    /**
     * 滚动条显示方式
     */
    visible?: 'auto' | 'hidden' | 'visible' | boolean;
  }
  export interface ScrollbarYConfig {
    /**
     * 滚动行为
     */
    overscrollBehavior?: '' | 'contain' | 'none';
    /**
     * 滚动条显示位置
     */
    position?: '' | 'left' | 'right';
    /**
     * 滚动条显示方式
     */
    visible?: 'auto' | 'hidden' | 'visible' | boolean;
  }

  /**
   * 滚动条配置项
   */
  export interface ScrollbarConfig {
    /**
     * 滚动条高度
     */
    height?: number;
    /**
     * 滚动行为
     */
    overscrollBehavior?: '' | 'contain' | 'none';
    /**
     * 滚动条宽度
     */
    width?: number;
    /**
     * 横向滚动条
     */
    x?: ScrollbarXConfig;
    /**
     * 纵向滚动条
     */
    y?: ScrollbarYConfig;
  }

  /**
   * 列拖拽排序配置项
   */
  export interface ColumnDragConfig<D = any> {
    /**
     * 是否显示拖拽动画，启用后由数据量的大小来影响渲染性能
     */
    animation?: boolean;
    /**
     * 是否禁用拖拽按钮
     */
    disabledMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
    /**
     * 拖拽结束时是否允许行拖拽调整顺序的方法，该方法的返回值用来决定是否允许被拖拽调整顺序
     */
    dragEndMethod?(
      params: Omit<AsTableDefines.ColumnDragendEventParams<D>, '_index'>,
    ): boolean | Promise<boolean>;
    /**
     * 拖拽开始时是否允许行拖拽调整顺序的方法，该方法的返回值用来决定是否允许被拖拽
     */
    dragStartMethod?(
      params: AsTableDefines.ColumnDragstartEventParams<D>,
    ): boolean;
    /**
     * 用于 isToChildDrag，在拖拽完成后，该方法的返回值用于决定是否拖拽成子级
     */
    dragToChildMethod?(
      params: Omit<AsTableDefines.ColumnDragToChildMethod<D>, '_index'>,
    ): boolean;
    /**
     * 自定义图标
     */
    icon?: string;
    /**
     * 需要 isCrossDrag，用于分组表头，是否同级/跨层列拖拽，启用后允许跨拖拽列拖拽（除了上级拖到子级）
     */
    isCrossDrag?: boolean;
    /**
     * 用于分组表头，是否允许同级列拖拽，启用后允许同层级列之间进行拖拽
     */
    isPeerDrag?: boolean;
    /**
     * 用于分组表头，是否允许将自己拖拽到子孙列中
     */
    isSelfToChildDrag?: boolean;
    /**
     * 需要 isCrossDrag，是否允许拖拽成目标列的子级
     */
    isToChildDrag?: boolean;
    /**
     * 显示拖拽提示，拖拽过程中显示信息
     */
    showDragTip?: boolean;
    /**
     * 是否显示拖拽辅助状态显示
     */
    showGuidesStatus?: boolean;
    /**
     * 是否显示拖拽按钮图标
     */
    showIcon?: boolean;
    /**
     * 自定义插槽模板
     */
    slots?: {
      tip?:
        | ((
            params: AsTableDefines.ColumnDragSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
    };
    /**
     * 自定义提示内容
     */
    tooltipMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): null | number | string;
    /**
     * 触发拖拽方式
     */
    trigger?: '' | 'cell' | 'default' | null;
    /**
     * 是否显示拖拽按钮
     */
    visibleMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
  }

  export type SpanMethod<D = AsTablePropTypes.Row> = (params: {
    $columnIndex: number;
    $rowIndex: number;
    $table: AsTableConstructor<D>;
    _rowIndex: number;
    column: AsTableDefines.ColumnInfo<D>;
    columnIndex: number;
    fixed: AsColumnPropTypes.Fixed;
    isHidden: boolean;
    row: D;
    rowIndex: number;
    type: string;
    visibleData: D[];
  }) => void | { colspan: number; rowspan: number };

  export type FooterSpanMethod<D = any> = (params: {
    $columnIndex: number;
    $rowIndex: number;
    $table: AsTableConstructor<D>;
    _columnIndex: number;
    _rowIndex: number;
    column: AsTableDefines.ColumnInfo<D>;
    columnIndex: number;
    items: any[];
    row: D;
  }) => void | { colspan: number; rowspan: number };
}

export interface AsTableProps<D = any> extends ComponentBaseProps {
  /**
   * 聚合函数计算精度配置项
   */
  aggregateAccuracyConfig?: AsTablePropTypes.AggregateAccuracyConfig<D>;
  /**
   * 数据聚合配置项
   */
  aggregateConfig?: AsTablePropTypes.AggregateConfig<D>;

  /**
   * 所有的列对齐方式
   */
  align?: AsTablePropTypes.Align;

  /**
   * 区域选取配置项
   */
  areaConfig?: AsTablePropTypes.AreaConfig<D>;
  /**
   * 自动监听父元素的变化去重新计算表格（对于父元素可能存在动态变化、显示隐藏的容器中、列宽异常等场景中的可能会用到）
   */
  autoResize?: AsTablePropTypes.AutoResize;
  /**
   * 是否带有边框
   */
  border?: AsTablePropTypes.Border;
  /**
   * 给单元格附加 className
   */
  cellClassName?: AsTablePropTypes.CellClassName<D>;
  /**
   * 单元格配置信息
   */
  cellConfig?: AsTablePropTypes.CellConfig<D>;
  /**
   * 给单元格附加样式
   */
  cellStyle?: AsTablePropTypes.CellStyle<D>;
  /**
   * 复选框配置项
   */
  checkboxConfig?: AsTablePropTypes.CheckboxConfig<D>;
  /**
   * 复制粘贴配置项
   */
  clipConfig?: AsTablePropTypes.ClipConfig<D>;
  /**
   * 列配置信息
   */
  columnConfig?: AsTablePropTypes.ColumnConfig<D>;
  /**
   * 列拖拽排序配置项
   */
  columnDragConfig?: AsTablePropTypes.ColumnDragConfig<D>;
  /**
   * 当前列配置项
   */
  currentColumnConfig?: AsTablePropTypes.CurrentColumnConfig<D>;
  /**
   * 当前行配置项
   */
  currentRowConfig?: AsTablePropTypes.CurrentRowConfig<D>;
  /**
   * 个性化信息配置项
   */
  customConfig?: AsTablePropTypes.CustomConfig<D>;
  /**
   * 表格数据
   * 与 loadData 行为一致，更新数据是不会重置状态
   */
  data?: AsTablePropTypes.Data<D>;
  /**
   * 可编辑配置项
   */
  editConfig?: AsTablePropTypes.EditConfig<D>;
  /**
   * 数据状态监听配置项
   */
  editDirtyConfig?: AsTablePropTypes.EditDirtyConfig;
  /**
   * 校验规则配置项
   */
  editRules?: AsTablePropTypes.EditRules<D>;
  /**
   * 空内容渲染配置项，empty-render 的优先级大于 empty-text
   */
  emptyRender?: AsTablePropTypes.EmptyRender;
  /**
   * 空数据时显示的内容
   */
  emptyText?: AsTablePropTypes.EmptyText;
  /**
   * 展开行配置项
   */
  expandConfig?: AsTablePropTypes.ExpandConfig<D>;
  /**
   * 导出配置项
   */
  exportConfig?: AsTablePropTypes.ExportConfig<D>;
  /**
   * 筛选配置项
   */
  filterConfig?: AsTablePropTypes.FilterConfig<D>;
  /**
   * 浮动筛选配置项
   */
  floatingFilterConfig?: AsTablePropTypes.FloatingFilterConfig<D>;
  /**
   * 查找与替换配置项
   */
  fnrConfig?: AsTablePropTypes.FnrConfig<D>;
  /**
   * 所有的表尾列的对齐方式
   */
  footerAlign?: AsTablePropTypes.FooterAlign;
  /**
   * 给表尾的单元格附加 className
   */
  footerCellClassName?: AsTablePropTypes.FooterCellClassName<D>;
  /**
   * 表尾单元格配置信息
   */
  footerCellConfig?: AsTablePropTypes.FooterCellConfig<D>;
  /**
   * 给表尾单元格附加样式
   */
  footerCellStyle?: AsTablePropTypes.FooterCellStyle<D>;
  /**
   * 表尾数据
   */
  footerData?: AsTablePropTypes.FooterData;
  /**
   * 表尾的数据获取方法，返回一个二维数组
   */
  footerMethod?: AsTablePropTypes.FooterMethod<D>;
  /**
   * 给表尾的行附加 className
   */
  footerRowClassName?: AsTablePropTypes.FooterRowClassName<D>;
  /**
   * 给表尾行附加样式
   */
  footerRowStyle?: AsTablePropTypes.FooterRowStyle<D>;
  /**
   * 表尾合并行或列，返回计算后的值（如果是虚拟滚动、展开行，不建议用于固定列、树形结构的场景，不能同时跨行与跨列）
   */
  footerSpanMethod?: AsTablePropTypes.FooterSpanMethod<D>;
  /**
   * 表尾工具提示配置项
   */
  footerTooltipConfig?: AsTablePropTypes.FooterTooltipConfig<D>;
  /**
   * 所有的表头列的对齐方式
   */
  headerAlign?: AsTablePropTypes.HeaderAlign;
  /**
   * 给表头的单元格附加 className
   */
  headerCellClassName?: AsTablePropTypes.HeaderCellClassName<D>;
  /**
   * 表头单元格配置信息
   */
  headerCellConfig?: AsTablePropTypes.HeaderCellConfig<D>;
  /**
   * 给表头单元格附加样式
   */
  headerCellStyle?: AsTablePropTypes.HeaderCellStyle<D>;
  /**
   * 给表头的行附加 className
   */
  headerRowClassName?: AsTablePropTypes.HeaderRowClassName<D>;
  /**
   * 给表头行附加样式
   */
  headerRowStyle?: AsTablePropTypes.HeaderRowStyle<D>;
  /**
   * 表头工具提示配置项
   */
  headerTooltipConfig?: AsTablePropTypes.HeaderTooltipConfig<D>;
  /**
   * 表格的高度；支持铺满父容器或者固定高度，如果设置 auto 为铺满父容器（如果设置为 auto，则必须确保存在父节点且不允许存在相邻元素）
   */
  height?: AsTablePropTypes.Height;
  /**
   * 唯一标识
   * 当使用某个特定功能时，需要设置才能生效
   */
  id?: AsTablePropTypes.ID<D>;
  /**
   * 导入配置项
   */
  importConfig?: AsTablePropTypes.ImportConfig<D>;
  /**
   * 保持原始值的状态，被某些功能所依赖，比如编辑状态、还原数据等
   */
  keepSource?: AsTablePropTypes.KeepSource;
  /**
   * 按键配置项
   */
  keyboardConfig?: AsTablePropTypes.KeyboardConfig<D>;
  /**
   * 表格是否显示加载中
   */
  loading?: AsTablePropTypes.Loading;
  /**
   * 加载中配置项
   */
  loadingConfig?: AsTablePropTypes.LoadingConfig;
  /**
   * max-height
   */
  maxHeight?: AsTablePropTypes.MaxHeight;
  /**
   * 右键菜单配置项
   */
  menuConfig?: AsTablePropTypes.MenuConfig<D>;
  /**
   * 临时合并指定的单元格 (不能用于展开行)
   */
  mergeCells?: AsTablePropTypes.MergeCells<D>;
  /**
   * 临时合并指定的表尾单元格
   */
  mergeFooterCells?: AsTablePropTypes.MergeFooterCells<D>;
  /**
   * 临时合并指定的表头单元格
   */
  mergeHeaderCells?: AsTablePropTypes.MergeHeaderCells;
  /**
   * 表格最小高度
   */
  minHeight?: AsTablePropTypes.MinHeight;
  /**
   * 鼠标配置项
   */
  mouseConfig?: AsTablePropTypes.MouseConfig;
  /**
   * 自定义参数（可以用来存放一些自定义的数据）
   */
  params?: AsTablePropTypes.Params;
  /**
   * 打印配置项
   */
  printConfig?: AsTablePropTypes.PrintConfig<D>;
  /**
   * 单选框配置项
   */
  radioConfig?: AsTablePropTypes.RadioConfig<D>;
  /**
   * 渲染器配置项
   */
  rendererConfig?: AsTablePropTypes.RendererConfig;
  /**
   * 调整列宽和行高整配置项
   */
  resizableConfig?: AsTablePropTypes.ResizableConfig<D>;
  /**
   * 响应式布局配置项
   */
  resizeConfig?: AsTablePropTypes.ResizeConfig;
  /**
   * 是否为圆角边框
   */
  round?: AsTablePropTypes.Round;
  /**
   * 给行附加 className
   */
  rowClassName?: AsTablePropTypes.RowClassName<D>;
  /**
   * 行配置信息
   */
  rowConfig?: AsTablePropTypes.RowConfig<D>;
  /**
   * 行拖拽排序配置项
   */
  rowDragConfig?: AsTablePropTypes.RowDragConfig<D>;
  /**
   * 给行附加样式，也可以是函数
   */
  rowStyle?: AsTablePropTypes.RowStyle<D>;
  /**
   * 滚动条配置项
   */
  scrollbarConfig?: AsTablePropTypes.ScrollbarConfig;
  /**
   * 序号配置项
   */
  seqConfig?: AsTablePropTypes.SeqConfig<D>;
  /**
   * 用于分组表头，显示为自定义列头，配合 mergeHeaderCells 灵活实现自定义合并
   */
  showCustomHeader?: AsTablePropTypes.ShowCustomHeader;
  /**
   * 是否显示表尾
   */
  showFooter?: AsTablePropTypes.ShowFooter;
  /**
   * 设置表尾所有内容过长时显示为省略号
   */
  showFooterOverflow?: AsTablePropTypes.ShowFooterOverflow;
  /**
   * 是否显示表头
   */
  showHeader?: AsTablePropTypes.ShowHeader;
  /**
   * 设置表头所有内容过长时显示为省略号
   */
  showHeaderOverflow?: AsTablePropTypes.ShowHeaderOverflow;
  /**
   * 设置所有内容过长时显示为省略号（如果是固定列建议设置该值，提升渲染速度）
   */
  showOverflow?: AsTablePropTypes.ShowOverflow;
  size?: AsTablePropTypes.Size;
  /**
   * 排序配置项
   */
  sortConfig?: AsTablePropTypes.SortConfig<D>;
  /**
   * 自定义合并函数，返回计算后的值（如果是虚拟滚动、展开行，不建议用于固定列、树形结构的场景，不能同时跨行与跨列）
   */
  spanMethod?: AsTablePropTypes.SpanMethod<D>;
  /**
   * 是否带有斑马纹（需要注意的是，在可编辑表格场景下，临时插入的数据不会有斑马纹样式）
   */
  stripe?: AsTablePropTypes.Stripe;
  /**
   * 自动跟随某个属性的变化去重新计算表格，和手动调用 recalculate 方法是一样的效果（对于通过某个属性来控制显示/隐藏切换时可能会用到）
   */
  syncResize?: AsTablePropTypes.SyncResize;
  /**
   * 工具提示配置项
   */
  tooltipConfig?: AsTablePropTypes.TooltipConfig<D>;
  /**
   * 树形结构配置项
   */
  treeConfig?: AsTablePropTypes.TreeConfig<D>;
  /**
   * 撤销重做历史配置项
   */
  undoRedoHistoryConfig?: AsTablePropTypes.UndoRedoHistoryConfig;
  /**
   * 校验配置项
   */
  validConfig?: AsTablePropTypes.ValidConfig<D>;
  /**
   * 横向虚拟滚动配置
   */
  virtualXConfig?: AsTablePropTypes.VirtualXConfig;
  /**
   * 纵向虚拟滚动配置
   */
  virtualYConfig?: AsTablePropTypes.VirtualYConfig;

  zIndex?: AsTablePropTypes.ZIndex;
}

export namespace AsTableDefines {
  export interface ValidatorErrorParams<D = any> {
    $table: AsTableConstructor<D>;
    cellValue: any;
    column: AsTableDefines.ColumnInfo;
    columnIndex: number;
    field: string;
    row: D;
    rowIndex: number;
    rule: ValidatorRule<D>;
    rules: ValidatorRule<D>[];
  }
  export interface ValidatorErrorMapParams<D = any> {
    [key: string]: AsTableDefines.ValidatorErrorParams<D>[];
  }

  interface TableBaseCellParams<D = any> {
    $columnIndex: number;
    $rowIndex: number;
    cell: any;
    column: ColumnInfo;
    columnIndex: number;
    row: D;
    rowIndex: number;
    source: string;
    type: string;
  }
  export interface CellClickParams<D = any> extends TableBaseCellParams<D> {
    triggerCheckbox: boolean;
    triggerExpandNode: boolean;
    triggerRadio: boolean;
    triggerTreeNode: boolean;
  }
  export interface CellClickEventParams<D = any>
    extends CellClickParams<D>, TableEventParams<D> {}

  export interface AsTableCustomStoreObj {
    activeBtn: boolean;
    activeWrapper: boolean;
    btnEl: HTMLDivElement | null;
    defPopupStyle: AsComponentStyleType;
    isAll: boolean;
    isIndeterminate: boolean;
    maxHeight: null | number | string;
    oldFixedMaps: Record<string, AsColumnPropTypes.Fixed>;
    oldSortMaps: Record<string, number>;
    oldVisibleMaps: Record<string, boolean>;
    panePopupStyle: AsComponentStyleType;
    visible: boolean;
  }

  export interface CustomSlotParams {
    $table: AsTableConstructor;
    // TODO $grid: AsGridConstructor | null | undefined
    columns: AsTableDefines.ColumnInfo[];
    isAllChecked: boolean;
    isAllIndeterminate: boolean;
    isCustomStatus: boolean;
  }

  export interface CellCacheHandleOptions {
    getResult?(params: CellCacheHandleParams): any;
    isChanged?(params: CellCacheHandleParams): boolean;
    key: string;
    setValue?(params: CellCacheHandleParams): any;
  }

  export interface UpdateCellObj<D = any> {
    column: AsTableDefines.ColumnInfo | null;
    field: string;
    newValue: any;
    oldValue: any;
    row: D;
    rowid: string;
  }
  export interface CellCacheHandleParams {
    $table: AsTableConstructor;
    cellValue: any;
    colid: string;
    column: AsTableDefines.ColumnInfo;
    oldValue: any;
    row: any;
    rowid: string;
  }

  export interface CellCacheResultObj extends CellCacheHandleParams {
    cellResult: any;
  }

  export interface MenuSlotParams {}
  export interface ScrollToRowConfig extends ScrollToColumnConfig {
    /**
     * 是否强制定位到行
     */
    rowAlign?: boolean;
  }
  export interface ScrollToColumnConfig {
    /**
     * 是否强制定位到列
     */
    colAlign?: boolean;
  }
  export type CustomEventType =
    | 'confirm'
    | 'reset'
    | 'update:aggFunc'
    | 'update:aggGroup'
    | 'update:align'
    | 'update:fixed'
    | 'update:footerAlign'
    | 'update:headerAlign'
    | 'update:sort'
    | 'update:visible'
    | 'update:width';

  export interface PaddingConfig {
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    top?: boolean;
  }
  export type AggFuncType =
    | 'avg'
    | 'count'
    | 'first'
    | 'last'
    | 'max'
    | 'min'
    | 'sum';

  export interface SortConfs {
    field: string;
    order?: AsTablePropTypes.SortOrder;
  }
  export interface ColumnOptions<D = any> extends AsColumnProps<D> {
    children?: ColumnOptions<D>[];
    slots?: AsColumnPropTypes.Slots<D>;
  }

  export class PrivateColumnInfo<D = any> {
    /**
     * @private
     */
    colSpan: number;
    /**
     * @private
     */
    defaultAggFunc: AsColumnPropTypes.AggFunc | undefined;
    /**
     * @private
     */
    defaultAlign: AsColumnPropTypes.Align | undefined;
    /**
     * @private
     */
    defaultFixed: AsColumnPropTypes.Fixed | undefined;
    /**
     * @private
     */
    defaultFooterAlign: AsColumnPropTypes.FooterAlign | undefined;
    /**
     * @private
     */
    defaultHeaderAlign: AsColumnPropTypes.HeaderAlign | undefined;
    /**
     * @private
     */
    defaultVisible: boolean;
    /**
     * @private
     */
    id: string;
    /**
     * @private
     */
    level: number;
    /**
     * @private
     * 编辑模型
     */
    model!: {
      update?: boolean;
      value?: any;
    };
    /**
     * @private
     */
    order: AsTablePropTypes.SortOrder;
    /**
     * @private
     */
    parentId: null | string;
    /**
     * @private
     */
    renderAggFn: AsColumnPropTypes.AggFunc;
    /**
     * @private
     */
    renderAutoWidth: number;
    /**
     * @private
     */
    renderHeight!: number;
    /**
     * @private
     */
    renderResizeWidth: number;
    /**
     * @private
     */
    renderSortNumber: number;
    /**
     * @private
     */
    renderWidth: number;

    /**
     * @private
     */
    resizeWidth: number;
    /**
     * @private
     */
    rowSpan: number;
    /**
     * @private
     */
    sortTime: number;
    /**
     * @private
     */
    renderCell(params: CellRenderCellParams<D>): VNode[];
    /**
     * @private
     */
    renderData(params: CellRenderDataParams<D>): VNode[];
    /**
     * @private
     */
    renderFooter(params: CellRenderFooterParams<D>): VNode[];

    /**
     * @private
     */
    renderHeader(params: CellRenderHeaderParams<D>): VNode[];
  }

  /**
   * 列对象
   */
  export class ColumnInfo<D = any> extends PrivateColumnInfo<D> {
    aggFunc: AsColumnPropTypes.AggFunc;
    align: AsColumnPropTypes.Align;
    /**
     * 是否带有边框
     */
    border?: AsColumnPropTypes.Border;

    cellRender: AsColumnPropTypes.CellRender<D>;
    children: ColumnInfo<D>[];

    className: AsColumnPropTypes.ClassName;

    contentRender: AsColumnPropTypes.ContentRender;
    /**
     * @private
     */
    defaultParentId: null | string;
    dragSort: AsColumnPropTypes.DragSort;

    editRender: AsColumnPropTypes.EditRender;
    field: AsColumnPropTypes.Field;
    filterMethod: AsColumnPropTypes.FilterMethod<D>;
    filterRecoverMethod: AsColumnPropTypes.FilterRecoverMethod<D>;
    filterRender: AsColumnPropTypes.FilterRender;
    filters: AsColumnPropTypes.FilterItem[];
    fixed: AsColumnPropTypes.Fixed;

    floatingFilters: AsColumnPropTypes.FloatingFilters;
    footerAlign: AsColumnPropTypes.FooterAlign;
    footerClassName: AsColumnPropTypes.FooterClassName;
    footerFormatter: AsColumnPropTypes.FooterFormatter<D>;
    formatter: AsColumnPropTypes.Formatter<D>;
    headerAlign: AsColumnPropTypes.HeaderAlign;
    headerClassName: AsColumnPropTypes.HeaderClassName;
    headerFormatter: AsColumnPropTypes.HeaderFormatter;
    maxWidth: AsColumnPropTypes.MaxWidth;

    minWidth: AsColumnPropTypes.MinWidth;
    padding: AsColumnPropTypes.Padding;

    /**
     * @private
     */
    renderFixed: AsColumnPropTypes.Fixed;
    /**
     * @private
     */
    renderVisible: AsColumnPropTypes.Visible;
    resizable: AsColumnPropTypes.Resizable;
    rowGroupNode: AsColumnPropTypes.RowGroupNode;
    rowResize: AsColumnPropTypes.RowResize;

    /**
     * 单元格校验规则
     */
    rules?: AsColumnPropTypes.Rules<D>;
    showFooterOverflow: AsColumnPropTypes.ShowFooterOverflow;
    showHeaderOverflow: AsColumnPropTypes.ShowHeaderOverflow;
    showOverflow: AsColumnPropTypes.ShowOverflow;
    slots: AsColumnPropTypes.Slots<D>;
    sortable: AsColumnPropTypes.Sortable;
    sortBy: AsColumnPropTypes.SortBy;
    // 列排序
    sortNumber: number;

    sortType: AsColumnPropTypes.SortType;
    /**
     * 列头标题帮助图标配置项，`titlePrefix` 的别名
     */
    titleHelp?: AsColumnPropTypes.TitlePrefix;
    titlePrefix: AsColumnPropTypes.TitlePrefix;
    titleSuffix: AsColumnPropTypes.TitleSuffix;
    treeNode: AsColumnPropTypes.TreeNode;
    /**
     * 公开属性
     */
    type: AsColumnPropTypes.Type;
    verticalAlign: AsColumnPropTypes.VerticalAlign;

    visible: AsColumnPropTypes.Visible;
    width: AsColumnPropTypes.Width;
    /**
     * 获取列主键
     */
    getKey(): string;
    /**
     * 获取列标题
     */
    getTitle(): string;
  }

  export interface CellRenderDataParams<
    D = any,
  > extends CellRenderBodyParams<D> {}
  export interface CellRenderCellParams<
    D = any,
  > extends CellRenderBodyParams<D> {}

  export interface CellFloatingFilterParams<D = any> {
    $columnIndex: number;
    // TODO $gantt: AsGanttConstructor | null | undefined;
    // $grid: AsGridConstructor | null | undefined;
    $table: AsTableConstructor<D>;
    _columnIndex: number;
    column: ColumnInfo;
    columnIndex: number;
    fixed: AsColumnPropTypes.Fixed;
    hasFilter: boolean;
    isHidden: boolean;
    option: AsColumnPropTypes.FilterItem;
    source: string;
    type: string;
  }

  export interface CellRenderBodyParams<D = any> {
    $columnIndex: number;
    // TODO $gantt: null | undefined | AsGanttConstructor;
    // TODO $grid: null | undefined | AsGridConstructor;
    $rowIndex: number;
    $table: AsTableConstructor<D>;
    _columnIndex: number;
    _rowIndex: number;
    column: ColumnInfo<D>;
    columnIndex: number;
    fixed: AsColumnPropTypes.Fixed;
    isEdit: boolean;
    isHidden: boolean;
    level: number;
    prefixCls: string;
    row: D;
    rowid: string;
    rowIndex: number;
    seq: number | string;
    source: string;
    type: string;
  }

  export interface CellRenderFooterParams<D = any> {
    $columnIndex: number;
    // TODO $gantt: AsGanttConstructor | null | undefined;
    // $grid: AsGridConstructor | null | undefined;
    $rowIndex: number;
    $table: AsTableConstructor<D>;
    _columnIndex: number;
    _rowIndex: number;
    column: ColumnInfo;
    columnIndex: number;
    fixed: AsColumnPropTypes.Fixed;
    // 兼容旧
    itemIndex: number;
    items: any[];
    prefixCls: string;
    row: D;
    rowIndex: number;
    source: string;
    type: string;
  }

  export interface FilterCheckedParams<D = any> {
    column: AsTableDefines.ColumnInfo;
    datas: any[];
    field: AsColumnPropTypes.Field;
    values: any[];
  }

  export interface CellRenderCellParams<
    D = any,
  > extends CellRenderBodyParams<D> {}

  export interface CellRenderHeaderParams<D = any> {
    $columnIndex: number;
    // TODO $gantt: null | undefined | AsGanttConstructor;
    // TODO $grid: null | undefined | AsGridConstructor;
    $rowIndex: number;
    $table: AsTableConstructor<D>;
    _columnIndex: number;
    _rowIndex: number;
    checked?: boolean;
    column: ColumnInfo;
    columnIndex: number;
    firstFilterOption: AsColumnPropTypes.FilterItem;
    fixed: AsColumnPropTypes.Fixed;
    hasFilter: boolean;
    indeterminate?: boolean;
    isHidden: boolean;
    prefixCls: string;
    rowIndex: number;
    source: string;
    type: string;
  }

  export interface RowGroupItem {
    field: string;
  }

  export interface RowCacheFormatObj {
    label: any;
    value: any;
  }

  export interface RowCacheItem<D = any> {
    $index: number;
    _index: number;
    _seq: number;
    _tIndex: number;
    expandHeight: number;
    expandLoaded?: boolean;
    formatData?: Record<string, RowCacheFormatObj>;
    height: number;
    index: number;
    items: any[];
    level: number;
    lineHeight?: number;
    oHeight?: number;
    oTop: number;
    parent: any;
    resizeHeight: number;
    row: D;
    rowid: string;
    seq: number | string;
    treeIndex: number;
    treeLoaded?: boolean;
  }

  export interface HeaderColCacheItem {
    formatObj?: RowCacheFormatObj;
  }

  export interface FilterOption {
    _checked: boolean;
    checked: boolean;
    data: any;
    label: number | string;
    resetValue: any;
    value: any;
  }

  export interface SortCheckedParams<D = any> {
    column: AsTableDefines.ColumnInfo<D>;
    field: AsColumnPropTypes.Field;
    order: AsTablePropTypes.SortOrder;
    sortTime: number;
  }

  export interface HeaderColCacheItem {
    formatObj?: RowCacheFormatObj;
  }
  export interface FooterRowCacheItem {
    formatData?: Record<string, RowCacheFormatObj>;
  }

  export interface ColumnCacheItem<D = any> {
    $index: number;
    _index: number;
    colid: string;
    column: AsTableDefines.ColumnInfo<D>;
    index: number;
    items: AsTableDefines.ColumnInfo<D>[];
    oLeft: number;
    parent: AsTableDefines.ColumnInfo<D> | null;
    width: number;
  }

  export interface MergeOptions<D = any> {
    col: AsTableDefines.ColumnInfo | number;
    colspan: number;
    row: any | number;
    rowspan: number;
  }

  export interface MergeInfo {
    col: number;
    colspan: number;
    row: number;
    rowspan: number;
  }

  export interface MergeItem<D = any> extends MergeInfo {
    _col: AsTableDefines.ColumnInfo;
    _colspan: number;
    _row: any;
    _rowspan: number;
  }

  export interface AggregateRowInfo {
    [key: string]: any;
    aggData: Record<
      string,
      {
        label: any;
        type: string;
        value: any;
      }
    >;
    childCount: number;
    groupCombineds: string[];
    groupContent: string;
    groupField: string;
    isAggregate: boolean;
  }

  export interface MergeCacheItem {
    colspan: number;
    rowspan: number;
  }

  export interface MergeCacheRow {
    endIndex: number;
    startIndex: number;
  }

  export interface MergeCacheCol {
    endIndex: number;
    startIndex: number;
  }

  export interface AsTableCustomStorageObj {
    /**
     * 保存列聚合函数状态
     */
    aggFunc?: boolean | null;
    /**
     * 保存列的聚合分组状态
     */
    aggGroup?: boolean | null;
    /**
     * 保存列对齐方式
     */
    align?: boolean | null;
    /**
     * 保存列冻结状态
     */
    fixed?: boolean | null;
    /**
     * 保存表尾对齐方式
     */
    footerAlign?: boolean | null;
    /**
     * 保存表头对齐方式
     */
    headerAlign?: boolean | null;
    /**
     * 保存分页设置
     */
    pager?: boolean | null;
    /**
     * 保存列宽调整状态
     */
    resizable?: boolean | null;
    /**
     * 保存列顺序状态
     */
    sort?: boolean | null;
    /**
     * 保存列可视状态
     */
    visible?: boolean | null;
  }

  export type CustomSortStoreObj = {
    c?: CustomSortStoreObj[];
    k: string;
  };

  export interface CustomStoreData {
    aggFuncData?: Record<string, AsColumnPropTypes.AggFunc>;
    aggGroupData?: Record<string, boolean>;
    alignData?: Record<string, AsColumnPropTypes.Align>;
    fixedData?: Record<string, AsColumnPropTypes.Fixed>;
    footerAlignData?: Record<string, AsColumnPropTypes.FooterAlign>;
    headerAlignData?: Record<string, AsColumnPropTypes.HeaderAlign>;
    pagerData?: {
      pSize?: number;
    };
    resizableData?: Record<string, number>;
    sortData?: CustomSortStoreObj[];
    visibleData?: Record<string, boolean>;
  }
  export interface ColumnDragSlotParams<D = any> {
    column: AsTableDefines.ColumnInfo;
  }

  export interface RowDragSlotParams<D = any> {
    row: D;
  }

  export interface ValidatorRule<D = any> {
    /**
     * 提示消息
     */
    content?: string;
    /**
     * 指定字段
     */
    field?: string;
    /**
     * 最大长度/值
     */
    max?: number | string;
    maxWidth?: number;
    /**
     * 最小长度/值
     */
    min?: number | string;
    /**
     * 使用正则表达式校验
     */
    pattern?: RegExp | string;
    /**
     * 是否必填
     */
    required?: boolean;
    trigger?: '' | 'blur' | 'change' | 'manual' | null;
    /**
     * 数据类型
     */
    type?: '' | 'array' | 'number' | 'string' | null;
    /**
     * 使用自定义校验函数，接收一个 Promise
     * @param params 参数
     */
    validator?:
      | ((params: RuleValidatorParams<D>) => Error | Promise<void> | void)
      | string;
  }

  export interface RuleValidatorParams<D = any> {
    // TODO $grid: AsGridConstructor<D> | null | undefined;
    $table: AsTableConstructor<D>;
    cellValue: any;
    column: AsTableDefines.ColumnInfo<D>;
    columnIndex: number;
    field: string;
    row: D;
    rowIndex: number;
    rule: ValidatorRule<D>;
    rules: ValidatorRule<D>[];
  }

  export interface MenuOptions {
    disabled?: boolean;
    options?: MenuFirstOption[][];
  }
  export interface MenuFirstOption {
    [key: string]: any;
    children?: MenuChildOption[];
    className?: string;
    code?: string;
    disabled?: boolean;
    loading?: boolean;
    name?: string;
    params?: any;
    prefixConfig?: {
      className?: string;
      content?: string;
      icon?:
        | ((params: {}) => AsComponentSlotType | AsComponentSlotType[])
        | string;
    };
    prefixIcon?:
      | ((params: {}) => AsComponentSlotType | AsComponentSlotType[])
      | string;
    slots?: {
      content?:
        | ((
            params: AsTableDefines.MenuSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
    };
    suffixConfig?: {
      className?: string;
      content?: string;
      icon?: (() => AsComponentSlotType | AsComponentSlotType[]) | string;
    };
    suffixIcon?:
      | ((params: {}) => AsComponentSlotType | AsComponentSlotType[])
      | string;
    visible?: boolean;
  }
  export interface MenuChildOption {
    [key: string]: any;
    className?: string;
    code?: string;
    disabled?: boolean;
    loading?: boolean;
    name?: string;
    params?: any;
    prefixConfig?: {
      className?: string;
      content?: string;
      icon?:
        | ((params: {}) => AsComponentSlotType | AsComponentSlotType[])
        | string;
    };
    prefixIcon?:
      | ((params: {}) => AsComponentSlotType | AsComponentSlotType[])
      | string;
    slots?: {
      content?:
        | ((
            params: AsTableDefines.MenuSlotParams,
          ) => AsComponentSlotType | AsComponentSlotType[])
        | string;
    };
    suffixConfig?: {
      className?: string;
      content?: string;
      icon?: (() => AsComponentSlotType | AsComponentSlotType[]) | string;
    };
    suffixIcon?:
      | ((params: {}) => AsComponentSlotType | AsComponentSlotType[])
      | string;
    visible?: boolean;
  }

  export interface FilterStoreObj {
    column: AsTableDefines.ColumnInfo | null | undefined;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    maxHeight: null | number | string;
    style: any;
    targetEl: HTMLDivElement | null;
    visible: boolean;
  }

  export interface HistoryStackObj<D = any> {
    editActiveInfo?: {
      colid: string;
      rowid: string;
    };
    insertData: D[];
    removeData: D[];
    scrollInfo: {
      left: number;
      top: number;
    };
    selectActiveArea?: null | {
      areaIndex: number;
      colid: string;
      rowid: string;
    };
    selectActiveInfo?: {
      colid: string;
      rowid: string;
    };
    selectCellAreas?: {
      colIds: string[];
      rowIds: string[];
      type: AsTableExtendCellAreaDefines.CELL_AREA_TYPE;
    }[];
    visibleColumn: AsTableDefines.ColumnInfo[];
    visibleData: D[];
    visibleTreeData: D[];
  }

  export interface RowDragstartEventParams<D = any> {
    column: AsTableDefines.ColumnInfo;
    row: D;
  }

  export interface RowDragToChildMethod<
    D = any,
  > extends RowDragendEventParams<D> {}

  export interface ColumnDragstartEventParams<D = any> {
    column: AsTableDefines.ColumnInfo;
  }

  export interface ColumnDragoverEventParams<D = any> {
    dragColumn: AsTableDefines.ColumnInfo;
    dragPos: 'left' | 'right';
    offsetIndex: 0 | 1;
    oldColumn: AsTableDefines.ColumnInfo;
    targetColumn: AsTableDefines.ColumnInfo;
  }

  export interface ColumnDragendEventParams<D = any> {
    _index: {
      newIndex: number;
      oldIndex: number;
    };
    dragColumn: AsTableDefines.ColumnInfo;
    dragPos: 'left' | 'right';
    dragToChild: boolean;
    newColumn: AsTableDefines.ColumnInfo;
    offsetIndex: 0 | 1;
    oldColumn: AsTableDefines.ColumnInfo;
  }

  export interface ColumnDragToChildMethod<
    D = any,
  > extends ColumnDragendEventParams<D> {}

  export interface RowDragoverEventParams<D = any> {
    dragPos: 'bottom' | 'top';
    dragRow: D;
    offsetIndex: 0 | 1;
    oldRow: D;
    targetRow: D;
  }

  export interface RowDragendEventParams<D = any> {
    _index: {
      newIndex: number;
      oldIndex: number;
    };
    dragPos: 'bottom' | 'top';
    dragRow: D;
    dragToChild: boolean;
    newRow: D;
    offsetIndex: 0 | 1;
    oldRow: D;
  }

  export interface RowRemoveDragendEventParams<D = any> {
    row: D;
  }

  export interface RowInsertDragendEventParams<D = any> {
    dragPos: 'bottom' | 'top';
    dragRow: D;
    dragToChild: boolean;
    newRow: D;
    offsetIndex: 0 | 1;
    oldRow: D;
  }

  interface TableEventParams<D = any> extends AsComponentEventParams {
    $table: AsTableConstructor<D>;
  }

  export interface SortChangeParams<D = any> extends SortCheckedParams<D> {
    sortList: SortCheckedParams[];
  }

  export interface SortChangeEventParams<D = any>
    extends SortChangeParams<D>, TableEventParams<D> {}

  interface TableBaseHeaderCellParams<D = any> {
    $columnIndex: number;
    $rowIndex: number;
    column: ColumnInfo;
    columnIndex: number;
    source: string;
    type: string;
  }

  export interface HeaderCellClickParams<
    D = any,
  > extends TableBaseHeaderCellParams<D> {
    triggerFilter: boolean;
    triggerResizable: boolean;
    triggerSort: boolean;
  }

  export interface HeaderCellClickEventParams<D = any>
    extends HeaderCellClickParams<D>, TableEventParams<D> {}
}

export namespace AsTableSlotTypes {
  export interface DefaultSlotParams {}

  export interface BaseSlotParams<D = any> {
    $table: AsTableConstructor<D>;
    // TODO $grid: AsGridConstructor<D> | null | undefined
  }
  export interface RowDragIconSlotParams<D = any> extends BaseSlotParams<D> {
    column: AsTableDefines.ColumnInfo;
    row: D;
  }
  export interface ColumnDragIconSlotParams<D = any> extends BaseSlotParams<D> {
    column: AsTableDefines.ColumnInfo;
  }
  export interface ColumnGroupContentSlotParams<
    D = any,
  > extends BaseSlotParams<D> {
    childCount: number;
    column: AsTableDefines.ColumnInfo;
    groupContent: string;
    groupField: string;
    row: D;
  }

  export interface ColumnGroupValuesSlotParams<
    D = any,
  > extends BaseSlotParams<D> {
    aggValue: number;
    childCount: number;
    column: AsTableDefines.ColumnInfo;
    groupContent: string;
    groupField: string;
    row: D;
  }
}

export type AsTableEmits = [
  'ready',
  'init-rendered',
  'data-rendered',

  'update:data',
  'keydown-start',
  'keydown',
  'keydown-end',
  'paste',
  'copy',
  'cut',
  'undo',
  'redo',
  'context-menu',

  'columns-change',
  'data-change',
  'footer-data-change',

  'current-row-change',
  'current-row-disabled',
  'current-column-change',
  'current-column-disabled',
  'radio-change',
  'checkbox-change',
  'checkbox-all',
  'checkbox-range-start',
  'checkbox-range-change',
  'checkbox-range-end',
  'checkbox-range-select',
  'cell-click',
  'cell-dblclick',
  'cell-menu',
  'cell-mouseenter',
  'cell-mouseleave',
  'cell-selected',
  'cell-delete-value',
  'cell-backspace-value',
  'header-cell-click',
  'header-cell-dblclick',
  'header-cell-menu',
  'footer-cell-click',
  'footer-cell-dblclick',
  'footer-cell-menu',
  'clear-merge',
  'sort-change',
  'clear-sort',
  'clear-all-sort',
  'filter-change',
  'filter-visible',
  'clear-filter',
  'clear-all-filter',

  'column-resizable-change',
  'row-resizable-change',
  'toggle-row-group-expand',
  'toggle-row-expand',
  'toggle-tree-expand',
  'menu-click',
  'edit-closed',
  'row-dragstart',
  'row-dragover',
  'row-dragend',
  'row-remove-dragend',
  'row-insert-dragend',
  'column-dragstart',
  'column-dragover',
  'column-dragend',
  'enter-append-row',
  'tab-append-row',

  'edit-activated',
  'edit-disabled',
  'valid-error',
  'scroll',
  'scroll-boundary',
  'custom',
  'custom-open',
  'custom-close',
  'custom-cancel',
  'custom-reset',
  'custom-confirm',
  'custom-visible-change',
  'custom-visible-all',
  'custom-fixed-change',
  'custom-sort-change',
  'custom-align-change',
  'custom-header-align-change',
  'custom-footer-align-change',
];

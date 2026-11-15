import type {
  ComponentPublicInstance,
  ComputedRef,
  Ref,
  SetupContext,
  VNode,
} from 'vue';

import type { AsGlobalRendererOptions } from '@arvin-studio/core';

import type { ComponentBaseProps } from '../../config-provider/context';
import type { SizeType } from '../../config-provider/size-context';
import type { AsSharedTooltipPropTypes } from '../../tooltip/shared-tooltip';
import type {
  AsColumnProps,
  AsColumnPropTypes,
  AsColumnSlotTypes,
} from './column';
import type {
  AsComponentAlignType,
  AsComponentSlotType,
  AsComponentStyleType,
} from './common';
import type { AsTableExtendCellAreaDefines } from './extend-cell-area';

export interface AsTableConstructor<D = any> extends AsTableMethods {
  // TODO 类型
  asGantt: any;

  asGrid: any;
  context: SetupContext<AsTableEmits>;
  getComputeMaps(): TablePrivateComputed;

  /**
   * 组件内部属性
   * @private
   */
  internalData: TableInternalData<D>;
  props: AsTableProps;
  /**
   * 组件内部属性
   * @private
   */
  reactData: TableReactData;
  xID: string;
}

export interface TableReactData<D = any> {
  aggHandleAggColumns: AsTableDefines.ColumnInfo[];
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
  currColFlag: number;
  dragCol: AsTableDefines.ColumnInfo | null;
  dragRow: any;
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
}

export interface TableInternalData<D = any> {
  _lastResizeTime?: any;
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
  };
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

  isCurrDeepKey: boolean;
  isResizeCellHeight?: boolean;
  keepUpdateFieldMaps: Record<string, number>;
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
  // 已展开树节点
  treeExpandedMaps: Record<string, D | null>;
  // 树结构数据，已展开保留的行集合
  treeExpandedReserveRowMap: Record<string, D>;
  // 懒加载中的树节点的集合
  treeExpandLazyLoadedMaps: Record<string, D | null>;
  // 树结构数据，不确定状态的集合
  treeIndeterminateRowMaps: Record<string, D>;
  // 渲染所有列
  visibleColumn: AsTableDefines.ColumnInfo<D>[];
  // 数据集（仅可视）
  visibleDataRowIdData: Record<string, D>;
}

export interface TablePrivateComputed<D = any> {
  computeAggregateOpts: ComputedRef<AsTablePropTypes.AggregateConfig>;
  computeAreaOpts: ComputedRef<AsTablePropTypes.AreaOpts>;
  computeCellOffsetWidth: ComputedRef<number>;
  computeCellOpts: ComputedRef<AsTablePropTypes.CellConfig>;
  computeCheckboxOpts: ComputedRef<AsTablePropTypes.CheckboxOpts<D>>;
  computeColumnDragOpts: ComputedRef<AsTablePropTypes.ColumnDragConfig>;
  computeColumnOpts: ComputedRef<AsTablePropTypes.ColumnOpts>;
  computeCustomOpts: ComputedRef<AsTablePropTypes.CustomOpts<D>>;
  computeDefaultRowHeight: ComputedRef<number>;
  computeEditDirtyOpts: ComputedRef<AsTablePropTypes.EditDirtyConfig>;
  computeEditOpts: ComputedRef<AsTablePropTypes.EditOpts<D>>;
  computeEmptyOpts: ComputedRef<AsTablePropTypes.EmptyOpts>;
  computeExpandOpts: ComputedRef<AsTablePropTypes.ExpandOpts<D>>;
  computeFilterOpts: ComputedRef<AsTablePropTypes.FilterOpts<D>>;
  computeFloatingFilterOpts: ComputedRef<
    AsTablePropTypes.FloatingFilterConfig<D>
  >;
  computeFooterCellOpts: ComputedRef<AsTablePropTypes.FooterCellConfig>;
  computeFooterTooltipOpts: ComputedRef<
    AsTablePropTypes.FooterTooltipConfig<D>
  >;
  computeHeaderCellOpts: ComputedRef<AsTablePropTypes.HeaderCellConfig>;
  computeHeaderTooltipOpts: ComputedRef<
    AsTablePropTypes.HeaderTooltipConfig<D>
  >;
  computeIsAllCheckboxDisabled: ComputedRef<boolean>;
  computeIsBodyRenderOptimize: ComputedRef<boolean>;
  computeIsFooterRenderOptimize: ComputedRef<boolean>;
  computeIsHeaderRenderOptimize: ComputedRef<boolean>;
  computeMouseOpts: ComputedRef<AsTablePropTypes.MouseOpts>;
  computeRadioOpts: ComputedRef<AsTablePropTypes.RadioOpts<D>>;
  computeRendererOpts: ComputedRef<AsTablePropTypes.RendererConfig>;
  computeResizableOpts: ComputedRef<AsTablePropTypes.ResizableOpts<D>>;
  computeRowDragOpts: ComputedRef<AsTablePropTypes.RowDragConfig>;
  computeRowOpts: ComputedRef<AsTablePropTypes.RowOpts>;
  computeSeqOpts: ComputedRef<AsTablePropTypes.SeqOpts<D>>;
  computeSortOpts: ComputedRef<AsTablePropTypes.SortOpts<D>>;
  computeTooltipOpts: ComputedRef<AsTablePropTypes.TooltipConfig<D>>;
  computeTreeOpts: ComputedRef<AsTablePropTypes.TreeOpts<D>>;
  computeValidOpts: ComputedRef<AsTablePropTypes.ValidOpts<D>>;
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
   * 手动关闭快捷菜单
   */
  closeMenu(): Promise<any>;
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
  handleColResizeCellAreaEvent(evnt: MouseEvent, params: any): void;
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
  handleUpdateCustomColumn(): void;
  /**
   * 内部方法
   * @private
   */
  triggerCellAreaExtendMousedownEvent(evnt: MouseEvent, params: any): void;
}

export interface TableMethods<
  DT = any,
> extends AsTableExtendCellAreaMethods<DT> {
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
   * 用于 row-config.isCurrent，手动清空当前高亮的状态
   */
  clearCurrentRow(): Promise<any>;
  /**
   * 清除表尾单元格格式化缓存
   */
  clearFooterFormatterCache(isUpdate?: boolean): Promise<void>;
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
   * 用于 type=radio，手动清空用户的选择
   */
  clearRadioRow(): Promise<any>;
  /**
   * 手动清除滚动相关信息，还原到初始状态
   */
  clearScroll(): Promise<any>;
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

  dispatchEvent(
    type: ValueOf<AsTableEmits>,
    params: Record<string, any>,
    evnt: Event | null,
  ): void;
  /**
   * 获取单元格显示值
   */
  getCellLabel(
    row: any,
    fieldOrColumn:
      | AsColumnPropTypes.Field
      | AsTableDefines.ColumnInfo<any>
      | null,
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
   * 获取当前筛选的所有列信息
   */
  getCheckedFilters(): AsTableDefines.FilterCheckedParams[];
  /**
   * 根据列的字段名获取列
   * @param field 字段名
   */
  getColumnByField(
    field: AsColumnPropTypes.Field | null,
  ): AsTableDefines.ColumnInfo<DT> | null;
  /**
   * 根据 column 获取相对于 columns 中的索引
   * @param column 列对象
   */
  getColumnIndex(column: AsTableDefines.ColumnInfo<any> | null): number;

  /**
   * 用于 custom-config，用于获取个性化设置，用于自定义保持
   */
  getCustomStoreData(): AsTableDefines.CustomStoreData;
  /**
   * 获取表尾单元格显示值
   */
  getFooterCellLabel(
    row: any,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): null | number | string;
  /**
   * 获取表头单元格显示值
   */
  getHeaderCellLabel(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): string;
  /**
   * 根据 row 获取相对于 data 中的索引
   * @param row 行对象
   */
  getRowIndex(row: any): number;
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
   * 用于数据聚合，判断是为否为聚合的行数据
   */
  isAggregateRecord(row: any): boolean;
  /**
   * 用于 type=checkbox，判断复选行数据是否勾选
   * @param row 指定行
   */
  isCheckedByCheckboxRow(row: any): boolean;
  /**
   * 用于 edit-config，判断行是否为新增的临时数据
   * @param row 指定行
   */
  isInsertByRow(row: any | null): boolean;
  /**
   * 只对 keep-source 开启有效，判断行数据是否发生改变
   * @param row 指定行
   * @param field 指定字段
   */
  isUpdateByRow(row: any, field?: null | string): boolean;
  /**
   * 用于树结构，给行数据加载子节点
   * @param row 行对象
   * @param children 子节点
   */
  loadTreeChildren(row: any, children: any[]): Promise<any[]>;
  /**
   * 打开 tooltip 提示
   * @param target 目标元素
   * @param content 内容
   */
  openTooltip(target: HTMLElement, content: number | string): Promise<any>;

  /**
   * 重新计算表格，如果传 true 则进行完整计算
   * 对于某些特殊场景可能会用到，比如隐藏的表格、重新计算列宽...等
   */
  recalculate(refull?: boolean): Promise<void>;
  /**
   * 用于数据聚合，刷新聚合函数计算值
   */
  refreshAggregateCalcValues(): Promise<void>;
  /**
   * 刷新滚动操作，手动同步滚动相关位置
   * 对于某些特殊的操作，比如滚动条错位、固定列不同步
   */
  refreshScroll(): Promise<void>;
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
   * 用于 row-config.isCurrent，设置某一行为高亮状态
   * @param row 指定行
   */
  setCurrentRow(row: any): Promise<any>;
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
  /**
   * 临时合并表头单元格，如果为数组则合并多个
   */
  setMergeHeaderCells(
    merges:
      | AsTableDefines.MergeOptions<any>
      | AsTableDefines.MergeOptions<any>[],
  ): Promise<any>;

  /**
   * 用于 expand-config，设置展开行，二个参数设置这一行展开与否
   * @param rows 指定行
   * @param expanded 是否展开
   */
  setRowExpand(rows: any | any[], expanded: boolean): Promise<void>;
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
   * 用于 tree-config，设置展开树形节点，二个参数设置这一行展开与否
   * @param rows 指定行
   * @param checked 是否选中
   */
  setTreeExpand(rows: any | any[], checked: boolean): Promise<void>;
  /**
   * 用于 mouse-config.area，更新已选区域的单元格样式
   */
  updateCellAreas(): Promise<void>;
  /**
   * 手动更新表尾
   */
  updateFooter(): Promise<any>;
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
    params: AsTableDefines.CellRenderBodyParams,
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
  handleClearStack(): Promise<void>;

  /**
   * 内部方法
   * @private
   */
  handleColResizeDblclickEvent(
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
  handleUpdateBodyMerge(): void;
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
  saveCustomStore(type: AsTableDefines.CustomEventType): Promise<any>;
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
  triggerFilterEvent(
    evnt: Event,
    column: AsTableDefines.ColumnInfo,
    params: AsTableDefines.CellRenderHeaderParams,
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
    title: AsColumnPropTypes.TitlePrefix,
    params: AsTableDefines.CellRenderHeaderParams,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerHeaderTooltipEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderHeaderParams,
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
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams,
  ): void;
  /**
   * 内部方法
   * @private
   */
  triggerRowGroupExpandEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams,
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
  ): Promise<any>;
  /**
   * 内部方法
   * @private
   */
  triggerTreeExpandEvent(
    evnt: MouseEvent,
    params: AsTableDefines.CellRenderBodyParams,
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
}

export interface AsTablePrivateMethods<
  D = any,
> extends TablePrivateMethods<D> {}

export namespace AsTablePropTypes {
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
     * 不建议使用，已废弃
     * @deprecated
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
     * 个性化设置是否允许列选中的方法，该方法的返回值用来决定这一列的 checkbox 是否可以选中
     */
    checkMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
    }): boolean;
    /**
     * 是否启用，支持局部/全局启用
     */
    enabled?: boolean;
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
    /**
     * 是否启用 localStorage 本地保存，会将列操作状态保留在本地（需要有 id）
     */
    storage?: AsTableDefines.AsTableCustomStorageObj | boolean;
    /**
     * 只对 storage 有效，缓存项的配置
     */
    storeOptions?: AsTableDefines.AsTableCustomStorageObj;
    /**
     * 只对 storage 有效，重写默认的保存方法，用于实现服务端保存
     */
    updateStore?(params: {
      $table: AsTableConstructor<D>;
      id: string;
      storeData: AsTableDefines.CustomStoreData;
      type: AsTableDefines.CustomEventType;
    }): Promise<any>;
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
     * 只对 mouse-config.area 启用后有效，点击单元格后自动选取当前行的单元格;如果为 true，当选中第一列时联动选择当前行的单元格
     */
    selectCellToRow?: boolean;
  }
  export interface AreaOpts<D = any> extends AreaConfig<D> {}

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
     * 是否禁用拖拽按钮
     */
    disabledMethod?(params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      row: D;
    }): boolean;
    /**
     * 自定义图标
     */
    icon?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 只对 tree-config 启用有效，是否允许同级/跨层行拖拽，用于树结构，启用后允许跨层级拖拽（除了上级拖到子级）
     */
    isCrossDrag?: boolean;
    /**
     * 只对 tree-config 启用有效，是否允许同级行拖拽，用于树结构，启用后允许同层级之间进行拖拽
     */
    isPeerDrag?: boolean;
    /**
     * 是否显示拖拽按钮图标
     */
    showIcon?: boolean;
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
      /**
       * 已被 html 替换
       * @deprecated
       */
      content: string;
      html: string;

      options: PrintHandleOptions;
    }): boolean | string;
    /**
     * 已被 html 替换
     * @deprecated
     */
    content?: string;
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
      /**
       * 已被 html 替换
       * @deprecated
       */
      content: string;
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
     * 自定义编辑图标，支持 class 字符串、图标组件、VNode 或返回图标的函数
     */
    icon?:
      | ((params?: any) => AsComponentSlotType | AsComponentSlotType[])
      | AsComponentSlotType
      | AsComponentSlotType[];
    /**
     * 编辑模式
     * - cell（单元格编辑模式）
     * - row（行编辑模式）
     */
    mode?: '' | 'cell' | 'row' | null;
    /**
     * 是否显示必填星号
     */
    showAsterisk?: boolean;
    /**
     * 是否显示编辑图标
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
     * 已废弃，请使用 childrenField
     * @deprecated
     */
    children?: string;
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
     * 已废弃，请使用 hasChildField
     * @deprecated
     */
    hasChild?: string;
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
     * 已废弃，请使用 showLine
     * @deprecated
     */
    line?: boolean;
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
     * 统计列字段，指定后仅对这些字段使用统计（childCount）计算
     */
    countFields?: string[];
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
    filterMethod?: (params: {
      $table: AsTableConstructor<D>;
      cellValue: any;
      column: AsTableDefines.ColumnInfo<D>;
      options: AsTableDefines.FilterOption[];
      row: D;
      values: any[];
    }) => any;
    /**
     * 自定义筛选图标（有筛选条件）
     */
    iconMatch?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 自定义筛选图标（无筛选条件）
     */
    iconNone?: AsComponentSlotType | AsComponentSlotType[];
    /**
     * 筛选按钮图标的显示方法，该方法的返回值用于决定该列是否显示筛选按钮图标
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
     * 是否使用服务端排序，如果设置为 true 则不会对数据进行处理
     */
    remote?: boolean;

    /**
     * 是否显示筛选按钮图标
     */
    showIcon?: boolean;
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
   * 列配置信息
   */
  columnConfig?: AsTablePropTypes.ColumnConfig<D>;
  /**
   * 列拖拽排序配置项
   */
  columnDragConfig?: AsTablePropTypes.ColumnDragConfig<D>;
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
   * 筛选配置项
   */
  filterConfig?: AsTablePropTypes.FilterConfig<D>;
  /**
   * 浮动筛选配置项
   */
  floatingFilterConfig?: AsTablePropTypes.FloatingFilterConfig<D>;
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
   * 保持原始值的状态，被某些功能所依赖，比如编辑状态、还原数据等
   */
  keepSource?: AsTablePropTypes.KeepSource;
  /**
   * max-height
   */
  maxHeight?: AsTablePropTypes.MaxHeight;
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
   * 工具提示配置项
   */
  tooltipConfig?: AsTablePropTypes.TooltipConfig<D>;
  /**
   * 树形结构配置项
   */
  treeConfig?: AsTablePropTypes.TreeConfig<D>;
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
}

export namespace AsTableDefines {
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
    defaultFixed: AsColumnPropTypes.Fixed | undefined;
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
     */
    order: AsTablePropTypes.SortOrder;
    /**
     * @private
     */
    parentId: null | string;
    /**
     * @private
     */
    renderAutoWidth: number;
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
  'column-resizable-change',
  'ready',
  'init-rendered',
  'data-rendered',
  'data-change',

  'columns-change',
  'cell-mouseenter',
  'cell-mouseleave',
  'footer-data-change',

  'scroll',
  'scroll-boundary',

  'filter-visible',
  'radio-change',
  'checkbox-all',

  'checkbox-range-select',
  'checkbox-change',
  'row-resizable-change',
];

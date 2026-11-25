import type {
  ComponentPublicInstance,
  ComputedRef,
  RenderFunction,
  SetupContext,
} from 'vue';

import type { AsColumnPropTypes } from '../../table/types/column';
import type { AsComponentSlotType } from '../../table/types/common';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTableEmits,
  AsTableListeners,
  AsTableProps,
  AsTableSlots,
  AsTableSlotTypes,
  TableMethods,
} from '../../table/types/table';

export type AsGridInstance<D = any> = ComponentPublicInstance<
  AsGridProps<D>,
  AsGridConstructor<D>
>;

export interface AsGridConstructor<D = any> extends AsGridMethods<D> {
  context: SetupContext<AsGridEmits>;
  getComputeMaps(): GridPrivateComputed;
  getRefMaps(): GridPrivateRef;
  internalData: GridInternalData;
  props: AsGridProps;
  reactData: GridReactData;
  renderVN: RenderFunction;
  xID: string;
}

export interface GridPrivateRef {
  refElem?: any;
  refPager?: any;
  refPopupContainerElem?: any;
  refTable?: any;
}

export interface GridTablePage {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface AsGridProps<D = any> extends AsTableProps<D> {
  columns?: AsGridPropTypes.Columns<D>;
  layouts?: AsGridPropTypes.Layouts;
  pagerConfig?: AsGridPropTypes.PagerConfig;
  zoomConfig?: AsGridPropTypes.ZoomConfig;
}

export interface GridPrivateComputed<D = any> {
  [key: symbol]: D;
  computePagerOpts: ComputedRef<AsGridPropTypes.PagerOpts>;
  computeZoomOpts: ComputedRef<AsGridPropTypes.ZoomOpts>;
}
export interface AsGridPrivateComputed<
  D = any,
> extends GridPrivateComputed<D> {}

export interface GridReactData<D = any> {
  filterData: AsTableDefines.FilterCheckedParams<D>[];
  footerData: any[];
  isZMax: boolean;
  sortData: AsTableDefines.SortCheckedParams<D>[];
  tableData: D[];
  tableLoading: boolean;
  tablePage: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
  tZindex: number;
}

export interface GridInternalData {
  uFoot?: boolean;
}

export interface GridMethods {
  endPage(): Promise<number>;
  getCustomPagerData(): GridTablePage;
  getPageSize(): number;
  homePage(): Promise<number>;
  isMaximized(): boolean;
  maximize(): Promise<boolean>;
  revert(): Promise<boolean>;
  setCurrentPage(currentPage: number): Promise<void>;
  setPageSize(pageSize: number): Promise<void>;
  triggerZoomEvent(evnt?: Event | null): Promise<void>;
  zoom(): Promise<boolean>;
}

export interface AsGridMethods<D = any> extends GridMethods, TableMethods<D> {}

export interface GridPrivateMethods<D = any> {
  callSlot<T = any>(
    slotFunc:
      | ((params: T) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string,
    params: T,
  ): AsComponentSlotType[];
  extendTableMethods<T>(methodKeys: T[]): any;
  getExcludeHeight(): number;
  getParentHeight(): number;
  triggerZoomEvent(evnt: Event): void;
}
export interface AsGridPrivateMethods<D = any> extends GridPrivateMethods<D> {}

export namespace AsGridPropTypes {
  export type Column<D = any> = AsTableDefines.ColumnOptions<D>;
  export type Columns<D = any> = Column<D>[];

  export type Layouts = AsGridDefines.LayoutKey[] | AsGridDefines.LayoutKey[][];

  export interface PagerConfig {
    currentPage?: number;
    enabled?: boolean;
    pageSize?: number;
    pageSizeOptions?: (number | string)[];
    showSizeChanger?: boolean;
    total?: number;
  }
  export interface PagerOpts extends PagerConfig {}

  export interface ZoomConfig {
    enabled?: boolean;
    escRestore?: boolean;
  }

  export interface ZoomOpts extends ZoomConfig {}
}

export type AsGridEmits = [...AsTableEmits, 'pageChange', 'zoom'];

export namespace AsGridDefines {
  export type LayoutKey = 'Bottom' | 'Pager' | 'Table' | 'Top';
}

export interface AsGridListeners<D = any> extends AsTableListeners<D> {
  onPageChange?: (params: GridTablePage) => void;
  onZoom?: (params: { type: 'max' | 'revert' }) => void;
}

export namespace AsGridSlotTypes {
  export interface DefaultSlotParams<D = any> {
    /**
     * 相对于可视区渲染中的列索引，等同于 getVMColumnIndex(column)
     */
    $columnIndex: number;
    // TODO $gantt: AsGanttConstructor<D> | null | undefined;
    $grid: AsGridConstructor<D> | null | undefined;
    /**
     * 相对于可视区渲染中的行索引，等同于 getVMRowIndex(row)
     */
    $rowIndex: number;
    $table: AsTableConstructor<D>;
    [key: string]: any;
    /**
     * 相对于当前表格列的索引，等同于 getVTColumnIndex(column)
     */
    _columnIndex: number;
    /**
     * 相对于当前表格数据的索引，等同于 getVTRowIndex(row)
     */
    _rowIndex: number;
    aggValue: number;
    checked: boolean;
    childCount: number;
    /**
     * 当前列对象
     */
    column: AsTableDefines.ColumnInfo;

    /**
     * 相对于 columns 中的索引，等同于 getTColumnIndex(column)
     */
    columnIndex: number;

    data: any;
    // 混用多组件不具名插槽
    field: string;
    fixed: AsColumnPropTypes.Fixed;
    groupContent: string;
    groupField: string;
    groupValues: number;
    indeterminate: boolean;
    isEdit: boolean;

    isHidden: boolean;
    item: any;
    level: number;
    option: AsColumnPropTypes.FilterItem;
    /**
     * 当前行对象，支持数据双向绑定
     */
    row: D;
    rowid: string;
    /**
     * 相对于 data 中的索引，等同于 getRowIndex(row)
     */
    rowIndex: number;
    seq: number | string;
    tooltipContent: string;

    type: string;
  }

  export interface BaseSlotParams<D = any> {
    // TODO $gantt: AsGanttConstructor<D> | null | undefined;
    $grid: AsGridConstructor<D> | null | undefined;
    $table: AsTableConstructor<D>;
  }
  export interface EmptySlotParams<D = any> extends BaseSlotParams<D> {}
  export interface LoadingSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface FormSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface ToolbarSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface TopSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface BottomSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface LeftSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface RightSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface AsideLeftSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface AsideRightSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface PagerSlotParams<D = any> extends BaseSlotParams<D> {}
  export interface RowDragIconSlotParams<
    D = any,
  > extends AsTableSlotTypes.RowDragIconSlotParams<D> {}
  export interface ColumnDragIconSlotParams<
    D = any,
  > extends AsTableSlotTypes.ColumnDragIconSlotParams<D> {}
}

export interface AsGridSlots<D = any> extends AsTableSlots<D> {
  [key: string]:
    | ((params: AsGridSlotTypes.DefaultSlotParams<D>) => any)
    | undefined;

  /**
   * 自定义左侧模板
   */
  asideLeft?(params: AsGridSlotTypes.AsideLeftSlotParams<D>): any;
  /**
   * 自定义右侧模板
   */
  asideRight?(params: AsGridSlotTypes.AsideRightSlotParams<D>): any;
  /**
   * 自定义表格底部模板
   */
  bottom?(params: AsGridSlotTypes.BottomSlotParams<D>): any;
  /**
   * 只对 column-config.drag 开启后有效，自定义列拖拽按钮图标
   */
  columnDragIcon?(
    params:
      | AsGridSlotTypes.ColumnDragIconSlotParams<D>
      | AsGridSlotTypes.RowDragIconSlotParams<D>,
  ): any;
  /**
   * 自定义空数据时显示模板
   */
  empty?(params: AsGridSlotTypes.EmptySlotParams<D>): any;
  /**
   * 自定义表格左边模板
   */
  left?(params: AsGridSlotTypes.LeftSlotParams<D>): any;
  /**
   * 自定义加载中模板
   */
  loading?(params: AsGridSlotTypes.LoadingSlotParams<D>): any;
  /**
   * 自定义分页模板
   */
  pager?(params: AsGridSlotTypes.PagerSlotParams<D>): any;
  /**
   * 自定义表格边侧模板
   */
  right?(params: AsGridSlotTypes.RightSlotParams<D>): any;
  /**
   * 只对 row-config.drag 开启后有效，自定义行拖拽按钮图标
   */
  rowDragIcon?(params: AsGridSlotTypes.RowDragIconSlotParams<D>): any;

  /**
   * 自定义表格顶部模板
   */
  top?(params: AsGridSlotTypes.TopSlotParams<D>): any;
}

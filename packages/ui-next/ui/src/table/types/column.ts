import type { Component } from 'vue';

import type { AsGlobalRendererHandles } from '@arvin-studio/core';

import type { AsComponentSlotType } from './common';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePrivateMethods,
  AsTablePropTypes,
  AsTableSlotTypes,
} from './table';

export namespace AsColumnPropTypes {
  export type Params = any;
  export type Padding = boolean;
  export type FloatingFilters = boolean;
  export type MinWidth = number | string;
  export type MaxWidth = number | string;
  export type ColId = number | string;
  export type Title = number | string;
  export type Visible = boolean;
  export type Resizable = boolean;
  export type Border =
    | ''
    | 'default'
    | 'full'
    | 'inner'
    | 'none'
    | 'outer'
    | boolean;
  export type Fixed = '' | 'left' | 'right' | null | undefined;
  export type Align = '' | 'center' | 'left' | 'right' | null | undefined;
  export type HeaderAlign = Align;
  export type FooterAlign = Align;
  export type Field = string;
  export type Sortable = boolean;
  export type Width = number | string;
  export type Type = 'checkbox' | 'expand' | 'html' | 'radio' | 'seq' | null;
  export type ShowOverflow = AsTablePropTypes.ShowOverflow;
  export type ShowHeaderOverflow = ShowOverflow;
  export type ShowFooterOverflow = ShowOverflow;
  export type Rules<D = any> = AsTableDefines.ValidatorRule<D>[];
  export type VerticalAlign = '' | 'center' | 'top' | null;
  export type CellType = '' | 'auto' | 'date' | 'number' | 'string' | null;
  export type PasteMethod<D = any> = (
    params: AsColumnDefines.CellPasteParams<D>,
  ) => void;

  export interface TooltipHelperOption {
    content: null | string;
    icon?: Component | string;
    /**
     * 图标状态
     */
    iconStatus?: string;
  }
  export type TitlePrefix = TooltipHelperOption;
  export type TitleSuffix = TooltipHelperOption;

  /**
   * 设置为拖拽排序
   */
  export type DragSort = boolean;
  export type ClassName<D = any> =
    | ((
        params: AsGlobalRendererHandles.RenderTableCellParams<D>,
      ) => any[] | string | { [key: string]: boolean })
    | string;
  export type HeaderClassName<D = any> =
    | ((
        params: AsGlobalRendererHandles.RenderTableHeaderParams<D>,
      ) => any[] | string | { [key: string]: boolean })
    | string;
  export type FooterClassName<D = any> =
    | ((
        params: AsGlobalRendererHandles.RenderTableFooterParams<D>,
      ) => any[] | string | { [key: string]: boolean })
    | string;
  export interface FilterItem<OD = any> {
    checked?: boolean;
    data?: OD;
    label?: number | string;
    resetValue?: any;
    value?: any;
  }
  /**
   * 请使用 FilterItem
   * @deprecated
   */
  export interface Filter extends FilterItem {}
  export type Filters<OD = any> = FilterItem<OD>[];
  /**
   * 设置为行高拖拽
   */
  export type RowResize = boolean;
  export type FilterMultiple = boolean;
  /**
   * 设置为分组节点
   */
  export type RowGroupNode = boolean;
  /**
   * 设置为树节点
   */
  export type TreeNode = boolean;
  export type SortBy<D = any> =
    | ((params: {
        column: AsTableDefines.ColumnInfo<D>;
        row: D;
      }) => number | string)
    | string;
  export type SortType = 'auto' | 'number' | 'string' | null;

  export type Slots<D = any> = {
    /**
     * 只对 type=checkbox 有效，自定义复选框模板
     */
    checkbox?:
      | ((
          params: AsColumnSlotTypes.CheckboxSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 只对 column-config.drag 开启后有效，自定义列拖拽按钮图标
     */
    'column-drag-icon'?:
      | ((
          params: AsTableSlotTypes.ColumnDragIconSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    columnDragIcon?:
      | ((
          params: AsTableSlotTypes.ColumnDragIconSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 只对 type=expand 有效，自定义展开后的内容模板
     */
    content?:
      | ((
          params: AsColumnSlotTypes.ContentSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 自定义显示内容模板
     */
    default?:
      | ((
          params: AsColumnSlotTypes.DefaultSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 只对 edit-render 启用时有效，自定义编辑组件模板
     */
    edit?:
      | ((
          params: AsColumnSlotTypes.EditSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 只对 filter-render 或 filters 启用时有效，自定义筛选面板内容模板
     */
    filter?:
      | ((
          params: AsColumnSlotTypes.FilterSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 只对 floating-filters 和 filter-render 启用时有效，自定义浮动筛选模板
     */
    'floating-filter'?:
      | ((
          params: AsColumnSlotTypes.FloatingFilterSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    floatingFilter?:
      | ((
          params: AsColumnSlotTypes.FloatingFilterSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 自定义表尾内容的模板
     */
    footer?:
      | ((
          params: AsColumnSlotTypes.FooterSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 只对 aggregate-config 开启后有效，自定义分组列内容模板
     */
    'group-content'?:
      | ((
          params: AsTableSlotTypes.ColumnGroupContentSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 只对 agg-func 开启后有效，自定义分组列聚合数据模板
     */
    'group-values'?:
      | ((
          params: AsTableSlotTypes.ColumnGroupValuesSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    groupContent?:
      | ((
          params: AsTableSlotTypes.ColumnGroupContentSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    groupValues?:
      | ((
          params: AsTableSlotTypes.ColumnGroupValuesSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 自定义表头内容的模板
     * @deprecated 请使用 title 插槽
     */
    header?:
      | ((
          params: AsColumnSlotTypes.HeaderSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 只对 tree-config / expand-config 有效，自定义展开图标
     */
    icon?:
      | ((
          params: AsColumnSlotTypes.DefaultSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 只对 type=radio 有效，自定义单选框模板
     */
    radio?:
      | ((
          params: AsColumnSlotTypes.RadioSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 只对 row-config.drag 开启后有效，自定义行拖拽按钮图标
     */
    'row-drag-icon'?:
      | ((
          params: AsTableSlotTypes.RowDragIconSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    rowDragIcon?:
      | ((
          params: AsTableSlotTypes.RowDragIconSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 自定义排序图标
     */
    sort?:
      | ((
          params: AsColumnSlotTypes.HeaderSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;

    /**
     * 自定义标题模板
     */
    title?:
      | ((
          params: AsColumnSlotTypes.TitleSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
    /**
     * 只对 edit-render 启用时有效，自定义可编辑组件模板
     */
    valid?:
      | ((
          params: AsColumnSlotTypes.ValidSlotParams<D>,
        ) => AsComponentSlotType | AsComponentSlotType[])
      | null
      | string;
  };

  export namespace AsColumnSlotTypes {
    export interface DefaultSlotParams<
      D = any,
    > extends AsTableDefines.CellRenderBodyParams<D> {}

    export interface CheckboxSlotParams<D = any> extends DefaultSlotParams<D> {
      checked: boolean;
      indeterminate: boolean;
    }
    export interface RadioSlotParams<D = any> extends DefaultSlotParams<D> {
      checked: boolean;
    }

    export interface EditSlotParams<
      D = any,
    > extends AsTableDefines.CellRenderBodyParams<D> {}

    export interface FilterSlotParams<D = any> {
      $panel: any;
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo<D>;
      filterList: AsColumnPropTypes.FilterItem[];
      option?: AsTableDefines.FilterOption;
    }

    export interface FooterSlotParams<D = any> {
      $columnIndex: number;
      $rowIndex: number;
      _columnIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      items: any[];
      row: D;
      rowIndex: number;
    }

    export interface HeaderSlotParams<
      D = any,
    > extends AsTableDefines.CellRenderHeaderParams<D> {}

    export interface TitleSlotParams<D = any> extends HeaderSlotParams<D> {}

    export interface ContentSlotParams<
      D = any,
    > extends AsTableDefines.CellRenderBodyParams<D> {}
    export interface ValidSlotParams<D = any> extends DefaultSlotParams<D> {
      content: string;
      rule: AsTableDefines.ValidatorRule<D>;
    }

    export interface FloatingFilterSlotParams<
      D = any,
    > extends AsTableDefines.CellFloatingFilterParams<D> {}
  }

  export type Formatter<D = any> =
    | ((params: AsColumnDefines.CellFormatterParams<D>) => number | string)
    | any[]
    | string;

  export type HeaderFormatter =
    | ((params: {
        _columnIndex: number;
        cellTitle: any;
        cellValue: any;
        column: AsTableDefines.ColumnInfo;
      }) => number | string)
    | any[]
    | string;

  export type FooterFormatter<D = any> =
    | ((params: {
        _columnIndex: number;
        cellValue: any;
        column: AsTableDefines.ColumnInfo<D>;
        items: any[];
        itemValue: any;
        row: any;
      }) => number | string)
    | any[]
    | string;

  export interface FooterSlotParams<D = any> {
    $columnIndex: number;
    $rowIndex: number;
    _columnIndex: number;
    column: AsTableDefines.ColumnInfo;
    columnIndex: number;
    data: D[][];
    items: any[];
    row: D;
    rowIndex: number;
  }

  export interface CellRender<D = any, P = Record<string, any>> {
    /**
     * 目标组件渲染的属性
     */
    attrs?: Record<string, any>;
    /**
     * 多目标渲染
     */
    children?: any[];
    content?: string;
    enabled?: boolean;
    endField?: string;

    events?: Record<
      string,
      (
        cellParams: AsColumnSlotTypes.DefaultSlotParams<D>,
        ...args: any[]
      ) => any
    >;
    /**
     * 渲染器名称
     */
    name?: string;

    optionGroupProps?: AsGlobalRendererHandles.RenderOptionGroupProps;
    optionGroups?: any[];
    optionProps?: AsGlobalRendererHandles.RenderOptionProps;
    options?: any[];
    /**
     * 目标组件渲染的参数
     */
    props?: P;
    /**
     * 只对特定功能有效，当值为负数时，自动显示为红色
     */
    showNegativeStatus?: boolean;

    startField?: string;
  }
  /**
   * 编辑渲染配置项
   */
  export interface EditRender<D = any, P = Record<string, any>> {
    /**
     * 目标组件渲染的属性
     */
    attrs?: Record<string, any>;
    autoFocus?: boolean | string;
    /**
     * 已废弃，请使用 autoFocus
     * @deprecated
     */
    autofocus?: string;
    autoSelect?: boolean;

    /**
     * 已废弃，请使用 autoSelect
     * @deprecated
     */
    autoselect?: boolean;
    /**
     * 多目标渲染
     */
    children?: any[];

    content?: string;
    defaultValue?:
      | ((params: { column: AsTableDefines.ColumnInfo }) => any)
      | any[]
      | Date
      | null
      | number
      | object
      | RegExp
      | string
      | undefined;
    enabled?: boolean;
    endField?: string;
    events?: Record<
      string,
      (cellParams: AsColumnSlotTypes.EditSlotParams<D>, ...args: any[]) => any
    >;
    immediate?: boolean;
    /**
     * 渲染器名称
     */
    name?: string;
    optionGroupProps?: AsGlobalRendererHandles.RenderOptionGroupProps;
    optionGroups?: any[];
    optionProps?: AsGlobalRendererHandles.RenderOptionProps;
    options?: any[];
    placeholder?: string;

    /**
     * 目标组件渲染的参数
     */
    props?: P;

    /**
     * 只对 AsNumberInput 有效，当值为负数时，自动显示为红色
     */
    showNegativeStatus?: boolean;
    startField?: string;
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

  export type CopyMethod<D = any> = (
    params: AsColumnDefines.CellCopyParams<D>,
  ) => string;

  export type CutMethod<D = any> = (
    params: AsColumnDefines.CellCutParams<D>,
  ) => void;

  /**
   * 内容渲染配置项
   */
  export interface ContentRender<D = any, P = Record<string, any>> {
    /**
     * 目标组件渲染的属性
     */
    attrs?: Record<string, any>;
    /**
     * 多目标渲染
     */
    children?: any[];
    /**
     * 目标组件渲染的事件
     */
    events?: Record<
      string,
      (
        cellParams: AsColumnSlotTypes.ContentSlotParams<D>,
        ...args: any[]
      ) => any
    >;
    /**
     * 渲染器名称
     */
    name?: string;
    optionGroupProps?: AsGlobalRendererHandles.RenderOptionGroupProps;

    optionGroups?: any[];
    optionProps?: AsGlobalRendererHandles.RenderOptionProps;
    options?: any[];
    /**
     * 目标组件渲染的参数
     */
    props?: P;
  }
  /**
   * 指定聚合函数
   */
  export type AggFunc =
    | ''
    | AsTableDefines.AggFuncType
    | boolean
    | null
    | undefined;

  export interface FilterItem<OD = any> {
    checked?: boolean;
    data?: OD;
    label?: number | string;
    resetValue?: any;
    value?: any;
  }

  interface FilterMethodParams<D = any> {
    $table: AsTableConstructor<D>;
    cellValue: any;
    column: AsTableDefines.ColumnInfo<D>;
    option: AsTableDefines.FilterOption;
    row: D;
    value: any;
  }

  export type FilterMethod<D = any> = (
    params: FilterMethodParams<D>,
  ) => boolean;

  interface FilterResetMethodParams<D = any> {
    $table: AsTableConstructor<D>;
    column: AsTableDefines.ColumnInfo<D>;
    options: AsTableDefines.FilterOption[];
  }
  export type FilterResetMethod<D = any> = (
    params: FilterResetMethodParams<D>,
  ) => void;

  interface FilterRecoverMethodParams<D = any> {
    $table: AsTableConstructor<D>;
    column: AsTableDefines.ColumnInfo<D>;
    option: AsTableDefines.FilterOption;
  }
  export type FilterRecoverMethod<D = any> = (
    params: FilterRecoverMethodParams<D>,
  ) => void;

  /**
   * 筛选渲染配置项
   */
  export interface FilterRender {
    /**
     * 渲染器名称
     */
    name?: string;
  }

  interface ExportMethodParams<D = any> {
    $table: AsTableConstructor<D>;
    column: AsTableDefines.ColumnInfo<D>;
    options: AsTablePropTypes.ExportHandleOptions;
    row: D;
  }
  export type ExportMethod<D = any> = (
    params: ExportMethodParams<D>,
  ) => number | string;

  interface HeaderExportParams<D = any> {
    $table: AsTableConstructor<D>;
    column: AsTableDefines.ColumnInfo<D>;
    options: AsTablePropTypes.ExportHandleOptions;
  }
  export type HeaderExportMethod<D = any> = (
    params: HeaderExportParams<D>,
  ) => number | string;

  interface FooterExportParams<D = any> {
    $table: AsTableConstructor<D>;
    _columnIndex: number;
    column: AsTableDefines.ColumnInfo<D>;
    options: AsTablePropTypes.ExportHandleOptions;
    row: any;
  }
  export type FooterExportMethod<D = any> = (
    params: FooterExportParams<D>,
  ) => number | string;
}

export interface AsColumnProps<D = any> {
  /**
   * 指定聚合函数
   */
  aggFunc?: AsColumnPropTypes.AggFunc;
  /**
   * 列对齐方式
   */
  align?: AsColumnPropTypes.Align;
  /**
   * 单元格渲染配置项
   */
  cellRender?: AsColumnPropTypes.CellRender<D>;
  /**
   * 单元格值类型
   */
  cellType?: AsColumnPropTypes.CellType;

  /**
   * 给单元格附加 className
   */
  className?: AsColumnPropTypes.ClassName<D>;
  colId?: AsColumnPropTypes.ColId;
  /**
   * 内容渲染配置项
   */
  contentRender?: AsColumnPropTypes.ContentRender;
  /**
   * 用于 clip-config.isCopy，重写单元格复制取值的方法，将单元格复制到剪贴板
   */
  copyMethod?: AsColumnPropTypes.CopyMethod;
  /**
   * 用于 clip-config.isCut，重写单元格剪贴值清除的方法，将剪贴单元格的值清除
   */
  cutMethod?: AsColumnPropTypes.CutMethod;
  /**
   * 设置为拖拽排序
   */
  dragSort?: AsColumnPropTypes.DragSort;
  /**
   * 单元格编辑渲染配置项
   */
  editRender?: AsColumnPropTypes.EditRender<D>;
  /**
   * 自定义单元格数据导出方法
   */
  exportMethod?: AsColumnPropTypes.ExportMethod<D>;
  /**
   * 列字段名
   */
  field?: AsColumnPropTypes.Field;
  /**
   * 自定义筛选方法
   */
  filterMethod?: AsColumnPropTypes.FilterMethod<D>;

  /**
   * 筛选是否允许多选
   */
  filterMultiple?: AsColumnPropTypes.FilterMultiple;
  filterRecoverMethod?: AsColumnPropTypes.FilterRecoverMethod;
  /**
   * 筛选模板配置项
   */
  filterRender?: AsColumnPropTypes.FilterRender;
  filterResetMethod?: AsColumnPropTypes.FilterResetMethod;
  /**
   * 配置筛选条件数组
   */
  filters?: AsColumnPropTypes.Filters;
  /**
   * 将列固定在左侧或者右侧
   */
  fixed?: AsColumnPropTypes.Fixed;
  /**
   * 是否启用浮动筛选
   */
  floatingFilters?: AsColumnPropTypes.FloatingFilters;
  /**
   * 表尾列的对齐方式
   */
  footerAlign?: AsColumnPropTypes.FooterAlign;
  /**
   * 给表尾单元格附加 className
   */
  footerClassName?: AsColumnPropTypes.FooterClassName<D>;
  /**
   * 自定义表尾单元格数据导出方法
   */
  footerExportMethod?: AsColumnPropTypes.FooterExportMethod<D>;
  /**
   * 格式化表尾显示内容
   */
  footerFormatter?: AsColumnPropTypes.FooterFormatter<D>;
  /**
   * 格式化显示内容
   */
  formatter?: AsColumnPropTypes.Formatter<D>;
  /**
   * 表头对齐方式
   */
  headerAlign?: AsColumnPropTypes.HeaderAlign;
  /**
   * 给表头单元格附加 className
   */
  headerClassName?: AsColumnPropTypes.HeaderClassName<D>;
  /**
   * 自定义表尾单元格数据导出方法
   */
  headerExportMethod?: AsColumnPropTypes.HeaderExportMethod<D>;
  /**
   * 格式化表头显示内容
   */
  headerFormatter?: AsColumnPropTypes.HeaderFormatter;
  /**
   * 列最大宽度
   */
  maxWidth?: AsColumnPropTypes.MaxWidth;
  /**
   * 列最小宽度，把剩余宽度按比例分配
   */
  minWidth?: AsColumnPropTypes.MinWidth;
  /**
   * 单元格默认高度
   */
  padding?: AsColumnPropTypes.Padding;
  /**
   * 额外的参数
   */
  params?: AsColumnPropTypes.Params;
  /**
   * 用于 clip-config.isPaste，重写单元格粘贴赋值的方法，从剪贴板赋值到单元格
   */
  pasteMethod?: AsColumnPropTypes.PasteMethod;
  /**
   * 是否允许拖动列宽调整大小
   */
  resizable?: AsColumnPropTypes.Resizable;
  /**
   * 设置为分组节点
   */
  rowGroupNode?: AsColumnPropTypes.RowGroupNode;
  /**
   * 设置为行高拖拽
   */
  rowResize?: AsColumnPropTypes.RowResize;
  /**
   * 列的校验规则
   */
  rules?: AsColumnPropTypes.Rules<D>;
  /**
   * 当表尾内容过长时显示为省略号
   */
  showFooterOverflow?: AsColumnPropTypes.ShowFooterOverflow;
  /**
   * 当表头内容过长时显示为省略号
   */
  showHeaderOverflow?: AsColumnPropTypes.ShowHeaderOverflow;
  /**
   * 当内容过长时显示为省略号
   */
  showOverflow?: AsColumnPropTypes.ShowOverflow;
  /**
   * 是否允许排序
   */
  sortable?: AsColumnPropTypes.Sortable;
  /**
   * 自定义排序的属性
   */
  sortBy?: AsColumnPropTypes.SortBy<D>;

  /**
   * 排序的字段类型，比如字符串转数值等
   */
  sortType?: AsColumnPropTypes.SortType;
  /**
   * 列标题
   */
  title?: AsColumnPropTypes.Title;
  /**
   * 列头标题帮助图标配置项，`titlePrefix` 的别名
   */
  titleHelp?: AsColumnPropTypes.TitlePrefix;
  /**
   * 标题前缀图标配置项
   */
  titlePrefix?: AsColumnPropTypes.TitlePrefix;
  /**
   * 标题后缀图标配置项
   */
  titleSuffix?: AsColumnPropTypes.TitleSuffix;
  /**
   * 设置为树节点
   */
  treeNode?: AsColumnPropTypes.TreeNode;

  /**
   * 渲染类型
   */
  type?: AsColumnPropTypes.Type;
  /**
   * 垂直对齐方式
   */
  verticalAlign?: AsColumnPropTypes.VerticalAlign;
  /**
   * 是否可视
   */
  visible?: AsColumnPropTypes.Visible;
  /**
   * 列宽度
   */
  width?: AsColumnPropTypes.Width;
}

export namespace AsColumnDefines {
  export interface CellFormatterParams<D = any> {
    $table: AsTableConstructor<D> & AsTablePrivateMethods<D>;
    cellValue: any;
    column: AsTableDefines.ColumnInfo<D>;
    row: D;
  }

  export interface CellCopyParams<D = any> {
    // TODO $grid: AsGridConstructor<D> | null | undefined;
    $table: AsTableConstructor<D> & AsTablePrivateMethods<D>;
    cellValue: any;
    column: AsTableDefines.ColumnInfo<D>;
    isCut: boolean;
    row: D;
  }

  export interface CellCutParams<D = any> {
    // TODO $grid: AsGridConstructor<D> | null | undefined;
    $table: AsTableConstructor<D> & AsTablePrivateMethods<D>;
    cellValue: any;
    clipData: {
      html?: string;
      text?: string;
    };
    column: AsTableDefines.ColumnInfo<D>;
    row: D;
  }

  export interface CellPasteParams<D = any> {
    // TODO $grid: AsGridConstructor<D> | null | undefined;
    $table: AsTableConstructor<D> & AsTablePrivateMethods<D>;
    cellValue: any;
    clipData: {
      html?: string;
      text?: string;
    };
    column: AsTableDefines.ColumnInfo<D>;
    isCut: boolean;
    row: D;
  }
}

export namespace AsColumnSlotTypes {
  export interface DefaultSlotParams<
    D = any,
  > extends AsTableDefines.CellRenderBodyParams<D> {}

  export interface ValidSlotParams<D = any> extends DefaultSlotParams<D> {
    content: string;
    rule: AsTableDefines.ValidatorRule<D>;
  }
}

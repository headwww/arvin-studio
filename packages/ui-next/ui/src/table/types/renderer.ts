import type { AsColumnDefines, AsColumnPropTypes } from './column';
import type {
  AsComponentAlignType,
  AsComponentClassNameType,
  AsComponentSlotType,
  AsComponentStyleType,
} from './common';
import type { AsTableConstructor, AsTableDefines } from './table';

declare module '@arvin-studio/core' {
  export interface AsGlobalRendererOptions {
    /**
     * 表格 - 定义筛选选项数据
     */
    createTableFilterOptions?(
      params: AsGlobalRendererHandles.CreateTableFilterOptionsParams,
    ): AsColumnPropTypes.FilterItem[];
    /**
     * @deprecated 请使用 tableFilterClassName
     */
    filterClassName?:
      | ((params: any) => AsComponentClassNameType | string)
      | string;

    /**
     * @deprecated 请使用 renderTableFilter
     */
    renderFilter?(
      renderOpts: AsColumnPropTypes.FilterRender,
      renderParams: any,
    ): AsComponentSlotType | AsComponentSlotType[];
    /**
     * 表格 - 渲染非编辑状态时，与 renderTableEdit 配合使用
     */
    renderTableCell?(
      renderOpts: AsGlobalRendererHandles.RenderTableCellOptions<any>,
      renderParams: AsGlobalRendererHandles.RenderTableCellParams<any>,
    ): AsComponentSlotType | AsComponentSlotType[];

    /**
     * 表格 - 渲染单元格
     */
    renderTableDefault?(
      renderOpts: AsGlobalRendererHandles.RenderTableDefaultOptions,
      renderParams: AsGlobalRendererHandles.RenderTableDefaultParams<any>,
    ): AsComponentSlotType | AsComponentSlotType[];
    /**
     * 表格 - 渲染编辑状态单元格
     */
    renderTableEdit?(
      renderOpts: any,
      renderParams: any,
    ): AsComponentSlotType | AsComponentSlotType[];

    /**
     * 表格 - 空数据时渲染
     */
    renderTableEmpty?(
      renderOpts: AsGlobalRendererHandles.RenderTableEmptyOptions,
      renderParams: AsGlobalRendererHandles.RenderTableEmptyParams,
    ): AsComponentSlotType | AsComponentSlotType[];

    /**
     * 表格 - 空数据时渲染试图
     */
    renderTableEmptyView?(
      renderOpts: AsGlobalRendererHandles.RenderTableEmptyOptions,
      renderParams: AsGlobalRendererHandles.RenderTableEmptyParams,
    ): AsComponentSlotType | AsComponentSlotType[];

    /**
     * 表格 - 展开行渲染
     */
    renderTableExpand?(
      renderOpts: AsGlobalRendererHandles.RenderTableExpandOptions,
      renderParams: AsGlobalRendererHandles.RenderTableExpandParams<any>,
    ): AsComponentSlotType | AsComponentSlotType[];
    /**
     * 表格 - 筛选面板内容渲染
     */
    renderTableFilter?(
      renderOpts: AsColumnPropTypes.FilterRender,
      renderParams: any,
    ): AsComponentSlotType | AsComponentSlotType[];

    /**
     * 表格 - 自定义浮动筛选渲染内容
     */
    renderTableFloatingFilter?(
      renderOpts: AsGlobalRendererHandles.RenderTableFloatingFilterOptions,
      renderParams: AsGlobalRendererHandles.RenderTableFloatingFilterParams<any>,
    ): AsComponentSlotType | AsComponentSlotType[];
    /**
     * 表格 - 渲染尾部
     */
    renderTableFooter?(
      renderOpts: AsGlobalRendererHandles.RenderTableFooterOptions,
      renderParams: AsGlobalRendererHandles.RenderTableFooterParams<any>,
    ): AsComponentSlotType | AsComponentSlotType[];
    /**
     * 表格 - 渲染头部
     */
    renderTableHeader?(
      renderOpts: AsGlobalRendererHandles.RenderTableHeaderOptions,
      renderParams: AsGlobalRendererHandles.RenderTableHeaderParams<any>,
    ): AsComponentSlotType | AsComponentSlotType[];
    /**
     * 表格 - 筛选面板是否显示底部按钮
     */
    showTableFilterFooter?: boolean;

    /**
     * 表格 - 单元格对齐方式
     */
    tableCellAlign?: AsComponentAlignType;
    /**
     * 表格 - 单元格设置 class
     */
    tableCellClassName?:
      | ((
          params: AsGlobalRendererHandles.RenderTableDefaultParams<any>,
        ) => AsComponentClassNameType | string)
      | string;
    /**
     * 表格 - 自定义单元格格式化方法
     */
    tableCellFormatter?(
      renderOpts: AsGlobalRendererHandles.RenderTableDefaultOptions,
      params: AsGlobalRendererHandles.TableCellFormatterParams<any>,
    ): string;
    /**
     * 表格 - 单元格设置样式
     */
    tableCellStyle?:
      | ((
          params: AsGlobalRendererHandles.RenderTableDefaultParams<any>,
        ) => AsComponentStyleType)
      | AsComponentStyleType;
    /**
     * 表格 - 筛选面板自适应表格高度
     */
    tableFilterAutoHeight?: boolean;
    /**
     * 表格 - 筛选面板 className
     */
    tableFilterClassName?:
      | ((params: any) => AsComponentClassNameType | string)
      | string;
    /**
     * 表格 - 默认筛选处理方法，如果同时存在，会被 tableFilterMethod 覆盖
     */
    tableFilterDefaultMethod?(
      params: AsGlobalRendererHandles.TableFilterMethodParams<any>,
    ): boolean;
    /**
     * 表格 - 自定义筛选逻辑方法
     */
    tableFilterMethod?(
      params: AsGlobalRendererHandles.TableFilterMethodParams<any>,
    ): boolean;

    /**
     * 表格 - 自定义筛选还原逻辑方法
     */
    tableFilterRecoverMethod?(
      params: AsGlobalRendererHandles.TableFilterRecoverMethodParams<any>,
    ): void;

    /**
     * 表格 - 列尾单元格对齐方式
     */
    tableFooterCellAlign?: AsComponentAlignType;

    /**
     * 表格 - 表头单元格对齐方式
     */
    tableHeaderCellAlign?: AsComponentAlignType;
  }

  export namespace AsGlobalRendererHandles {
    export interface TableFilterRecoverMethodParams<D = any> {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      option: AsTableDefines.FilterOption;
    }

    export interface CreateTableFilterOptionsParams<D = any> {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo<D>;
    }
    export interface RenderTableFloatingFilterParams<D = any> {
      $columnIndex: number;
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo & {
        filters: AsTableDefines.FilterOption[];
      };
      columnIndex: number;
      option: AsTableDefines.FilterOption;
    }
    export interface RenderTableFloatingFilterOptions
      extends AsColumnPropTypes.FilterRender {}

    export interface TableFilterMethodParams<D = any> {
      $table: AsTableConstructor<D>;
      cellValue: any;
      column: AsTableDefines.ColumnInfo<D>;
      option: AsTableDefines.FilterOption;
      row: any;
      value: any;
    }

    export interface RenderTableEditParams<
      D = any,
    > extends AsTableDefines.CellRenderBodyParams<D> {}

    export interface RenderTableDefaultParams<
      D = any,
    > extends RenderTableEditParams<D> {}

    export interface RenderTableDefaultOptions<
      D = any,
    > extends AsColumnPropTypes.CellRender<D> {}

    export interface RenderTableFooterOptions
      extends AsGlobalRendererHandles.RenderOptions {}

    export interface RenderTableHeaderOptions
      extends AsGlobalRendererHandles.RenderOptions {}

    export interface RenderTableCellOptions<
      D = any,
      P = any,
    > extends AsColumnPropTypes.CellRender<D, P> {}

    export interface TableCellFormatterParams<
      D = any,
    > extends AsColumnDefines.CellFormatterParams<D> {}

    export type RenderTableEmptyOptions = AsColumnPropTypes.EmptyRender;

    export interface RenderTableExpandOptions
      extends AsColumnPropTypes.ContentRender {}
    export interface RenderTableExpandParams<
      D = any,
    > extends RenderTableEditParams<D> {}

    export interface RenderTableEmptyParams<D = any> {
      $table: AsTableConstructor<D>;
    }
    /**
     * 选项参数
     */
    export interface RenderOptionProps {
      children?: string;
      disabled?: string;
      key?: string;
      label?: string;
      value?: string;
    }

    /**
     * 分组选项参数
     */
    export interface RenderOptionGroupProps {
      key?: string;
      label?: string;
      options?: string;
    }
    export interface RenderTableCellParams<D = any> {
      $columnIndex: number;
      // TODO $grid: AsGridConstructor<D> | null | undefined;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo<D>;
      columnIndex: number;
      fixed: AsColumnPropTypes.Fixed;
      isHidden: boolean;
      row: D;
      rowid: string;
      rowIndex: number;
      type: string;
    }
    export interface RenderTableHeaderParams<D = any> {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo<D>;
      columnIndex: number;
    }

    export interface RenderTableFooterParams<D = any> {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      column: AsTableDefines.ColumnInfo<D>;
      columnIndex: number;
      items: any[];
      row: any;
    }

    export interface RenderOptions {
      /**
       * 目标组件渲染的属性
       */
      attrs?: { [key: string]: any };
      /**
       * 渲染类型
       */
      cellType?: AsColumnPropTypes.CellType;
      /**
       * 多目标渲染
       */
      children?: any[];
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
  }
}

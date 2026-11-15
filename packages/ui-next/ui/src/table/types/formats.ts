import type { AsTableDefines } from './table';

declare module '@arvin-studio/core' {
  export namespace AsGlobalFormatsHandles {
    export interface FormatsOptions {
      // /**
      //  * TODO 表单 - 自定义表单项格式化方法
      //  */
      // formItemFormatMethod?: (
      //   params: FormItemFormatMethodParams,
      //   ...args: any[]
      // ) => number | string;
      /**
       * 表格 - 自定义单元格格式化方法
       */
      tableCellFormatMethod?: (
        params: TableCellFormatMethodParams,
        ...args: any[]
      ) => number | string;
      /**
       * 表格 - 自定义表尾单元格格式化方法
       */
      tableFooterCellFormatMethod?: (
        params: TableFooterCellFormatMethodParams,
        ...args: any[]
      ) => number | string;

      /**
       * 表格 - 自定义表头单元格格式化方法
       */
      tableHeaderCellFormatMethod?: (
        params: TableHeaderCellFormatMethodParams,
        ...args: any[]
      ) => number | string;
    }

    export interface TableCellFormatMethodParams {
      cellValue: any;
      column: AsTableDefines.ColumnInfo;
      row: any;
    }

    export interface TableHeaderCellFormatMethodParams {
      _columnIndex: number;
      cellTitle: any;
      cellValue: any;
      column: AsTableDefines.ColumnInfo;
    }

    export interface TableFooterCellFormatMethodParams {
      _columnIndex: number;
      cellValue: any;
      column: AsTableDefines.ColumnInfo;
      items: any[];
      itemValue: any;
      row: any;
    }
  }
}

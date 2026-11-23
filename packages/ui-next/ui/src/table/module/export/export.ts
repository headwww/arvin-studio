import type { AsTablePropTypes } from '../../types/table';

export interface TableExportMethods<D = any> {
  /**
   * 关闭高级导入
   */
  closeExport(): Promise<any>;
  /**
   * 关闭高级导入
   */
  closeImport(): Promise<any>;
  /**
   * 关闭高级打印
   */
  closePrint(): Promise<any>;
  /**
   * 将表格数据导出
   * @param options 参数
   */
  exportData(options?: AsTablePropTypes.ExportConfig<D>): Promise<any>;
  getPrintHtml(options?: AsTablePropTypes.PrintConfig): Promise<{
    html: string;
  }>;
  /**
   * 将一个文件的数据导入表格
   * @param file 文件流
   * @param options 参数
   */
  importByFile(
    file: File,
    options: AsTablePropTypes.ImportConfig,
  ): Promise<any>;
  /**
   * 将数据导入表格
   * @param options 参数
   */
  importData(options?: AsTablePropTypes.ImportConfig): Promise<any>;
  /**
   * 打开高级导出
   * @param options 参数
   */
  openExport(options?: AsTablePropTypes.ExportConfig): void;
  /**
   * 打开高级导入
   * @param options 参数
   */
  openImport(options?: AsTablePropTypes.ImportConfig): void;
  /**
   * 打开高级打印
   * @param options 参数
   */
  openPrint(options?: AsTablePropTypes.PrintConfig): void;
  /**
   * 打印表格数据
   * @param options 参数
   */
  print: PrintFunction;
  /**
   * 读取本地文件
   * @param options 参数
   */
  readFile: ReadFileFunction;
  /**
   * 保存文件到本地
   * @param options
   */
  saveFile: SaveFileFunction;
}

export type TableExportPrivateMethods<D = any> = { _row?: D };

declare module '../../types/table' {
  export interface AsTableMethods<D = any> extends TableExportMethods<D> {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends TableExportPrivateMethods<D> {}
}

export type SaveFileFunction = (options: {
  content: Blob | string;
  filename: string;
  type: string;
}) => Promise<any>;

export type ReadFileFunction = (options?: {
  message?: boolean;
  multiple?: boolean;
  types?: string[];
}) => Promise<{
  file: File;
  files: File[];
  status: boolean;
}>;

export type PrintFunction = (options?: AsTablePropTypes.PrintConfig) => any;

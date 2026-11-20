import type { AsTableConstructor } from '../../types/table';

import { AsTableDefines } from '../../types/table';

export interface TableEditMethods<D = any> {
  /**
   * 手动清除单元格激活状态
   */
  clearEdit(row?: any): Promise<any>;
  /**
   * 手动清除单元格选中状态
   */
  clearSelected(): Promise<any>;
  /**
   * 用于 edit-config，获取已激活编辑的单元格信息
   */
  getEditCell(): null | {
    column: AsTableDefines.ColumnInfo;
    row: D;
  };
  /**
   * 用于 edit-config，获取新增的临时数据
   */
  getInsertRecords(): D[];
  /**
   * 获取表格数据集
   * 获取新增、删除、更改的数据
   */
  getRecordset(): {
    insertRecords: D[];
    pendingRecords: D[];
    removeRecords: D[];
    updateRecords: D[];
  };
  /**
   * 获取已删除的数据
   */
  getRemoveRecords(): D[];
  /**
   * 用于 mouse-config.selected，获取选中的单元格信息
   */
  getSelectedCell(): null | {
    column: AsTableDefines.ColumnInfo;
    row: D;
  };
  /**
   * 用于 edit-config，获取已修改的数据
   */
  getUpdateRecords(): D[];
  /**
   * 往表格插入临时数据，从第一行新增一行或多行新数据
   */
  insert(records: any): Promise<{ row: D; rows: D[] }>;
  /**
   * 往表格指定行中插入临时数据
   * 如果 row 为空则从插入到顶部，如果为树结构，则插入到目标节点顶部
   * 如果 row 为 -1 则从插入到底部，如果为树结构，则插入到目标节点底部
   * 如果 row 为有效行则插入到该行的位置，如果为树结构，则有插入到效的目标节点该行的位置
   */
  insertAt(
    records: any,
    targetRowOrRowid?: -1 | any | null,
  ): Promise<{ row: D; rows: D[] }>;
  /**
   * 用于树结构，往指定节点插入子级临时数据，从子级的第一行新增一行或多行新数据
   */
  insertChild(
    records: any,
    parentRowOrParentId: any,
  ): Promise<{ row: D; rows: D[] }>;
  /**
   * 用于树结构，往指定节点插入子级临时数据
   * 如果 row 为空则从插入到顶部，如果为树结构，则插入到目标节点顶部
   * 如果 row 为 -1 则从插入到底部，如果为树结构，则插入到目标节点底部
   * 如果 row 为有效行则插入到该行的位置，如果为树结构，则有插入到效的目标节点该行的位置
   */
  insertChildAt(
    records: any,
    parentRowOrParentId: any,
    targetRowOrRowid: -1 | any | null,
  ): Promise<{ row: D; rows: D[] }>;
  /**
   * 与 insertChildAt 行为一致，区别就是会插入指定目标子级的到下一行
   */
  insertChildNextAt(
    records: any,
    parentRowOrParentId: any,
    targetRowOrRowid: -1 | any | null,
  ): Promise<{ row: D; rows: D[] }>;
  /**
   * 与 insertAt 行为一致，区别就是会插入指定目标的到下一行
   */
  insertNextAt(
    records: any,
    targetRowOrRowid?: -1 | any | null,
  ): Promise<{ row: D; rows: D[] }>;
  /**
   * 用于 edit-config，判断行是否为激活编辑状态
   * @param row 指定行
   */
  isEditByRow(row: any): boolean;
  /**
   * 删除指定行数据，指定 row 或 [row, ...] 删除多条数据，如果为空则删除所有数据
   */
  remove(rows?: any | any[]): Promise<{ row: D; rows: D[] }>;
  /**
   * 删除复选框选中的行数据
   */
  removeCheckboxRow(): Promise<{ row: D; rows: D[] }>;
  /**
   * 删除当前行选中的行数据
   */
  removeCurrentRow(): Promise<{ row: D; rows: D[] }>;
  /**
   * 删除单选框选中的行数据
   */
  removeRadioRow(): Promise<{ row: D; rows: D[] }>;
  /**
   * 用于 edit-config，激活单元格编辑
   */
  setEditCell(
    row: any,
    fieldOrColumn: AsTableDefines.ColumnInfo | null | string,
    options?: {
      isClear?: boolean;
    },
  ): Promise<void>;
  /**
   * 用于 edit-config，激活行编辑并默认激活第一个列，也可以指定列；如果第二个参数为 true，则默认自动激活第一个可编辑列；也可以传指定列
   */
  setEditRow(
    row: any,
    fieldOrColumn?: AsTableDefines.ColumnInfo | boolean | null | string,
    options?: {
      isClear?: boolean;
    },
  ): Promise<void>;
  /**
   * 用于 mouse-config.mouse-config，选中某个单元格
   */
  setSelectCell(
    row: any,
    fieldOrColumn: AsTableDefines.ColumnInfo | string,
  ): Promise<void>;
}

export interface TableEditPrivateMethods<D = any> {
  /**
   * @private
   */
  addCellSelectedClass(): void;
  /**
   * @private
   */
  handleCellFocus(
    cell: HTMLElement,
    params: {
      $table: AsTableConstructor<D>;
      column: AsTableDefines.ColumnInfo;
      row: D;
    },
  ): HTMLInputElement | null;
  /**
   * @private
   */
  handleClearEdit(evnt: Event | null, row?: any): Promise<any>;
  /**
   * @private
   */
  handleEdit(
    params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    },
    evnt: any,
    options?: {
      isClear?: boolean;
    },
  ): Promise<any>;
  /**
   * @private
   */
  handleFocus(
    params: {
      $table: AsTableConstructor<D>;
      cell: HTMLElement;
      column: AsTableDefines.ColumnInfo;
      row: D;
    },
    evnt?: Event | null,
  ): void;

  /**
   * @private
   */
  handleSelected(
    params: {
      $columnIndex: number;
      $rowIndex: number;
      $table: AsTableConstructor<D>;
      _columnIndex: number;
      _rowIndex: number;
      column: AsTableDefines.ColumnInfo;
      columnIndex: number;
      row: D;
      rowIndex: number;
    },
    evnt: Event | null,
  ): Promise<any>;
}

declare module '../../types/table' {
  export interface AsTableMethods<D = any> extends TableEditMethods<D> {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends TableEditPrivateMethods<D> {}
}

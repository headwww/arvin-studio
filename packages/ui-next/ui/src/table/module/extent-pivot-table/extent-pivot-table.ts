import type { VNode } from 'vue';

import type { DefineAsComponentOptions } from '../../types/common';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePrivateMethods,
} from '../../types/table';

export interface AsTableExtendPivotTableMethods<D = any> {
  [key: symbol]: D;
}

export interface AsTableExtendPivotTablePrivateMethods<D = any> {
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
  getPivotTableAggregatePopupPanel(): DefineAsComponentOptions<
    {
      customStore: AsTableDefines.AsTableCustomStoreObj;
    },
    object
  >;
  /**
   * 内部方法
   * @private
   */
  getPivotTableAggregateRenderColTitles(
    column: AsTableDefines.ColumnInfo,
    titleVN: VNode,
  ): VNode[];
  /**
   * @private
   */
  getPivotTableAggregateSimplePanel(): DefineAsComponentOptions<
    {
      customStore: AsTableDefines.AsTableCustomStoreObj;
    },
    object
  >;
  /**
   * 内部方法
   * @private
   */
  handlePivotTableAggData(aggList: AsTableDefines.AggregateRowInfo[]): void;
  /**
   * 内部方法
   * @private
   */
  handlePivotTableAggregatePanelDragendEvent(evnt: DragEvent): void;
}

declare module '../../types/table' {
  export interface AsTableMethods<
    D = any,
  > extends AsTableExtendPivotTableMethods<D> {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends AsTableExtendPivotTablePrivateMethods<D> {}
}

import type { AsColumnPropTypes } from './column';
import type { AsComponentEventParams } from './common';
import type { AsTableConstructor, AsTableDefines } from './table';

export namespace AsTableExtendCellAreaDefines {
  export type CELL_AREA_TYPE = 'active' | 'copy' | 'extend' | 'main' | 'multi';

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

  export interface CellAreaExtensionStartParams<D = any> {
    cols: AsTableDefines.ColumnInfo[];
    fixed: AsColumnPropTypes.Fixed;
    rows: D[];
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
    $table: AsTableConstructor<D>;
    // TODO $grid: AsGridConstructor<D> | null | undefined
  }

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
}

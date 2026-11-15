import type { AsTableDefines } from './table';

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
}

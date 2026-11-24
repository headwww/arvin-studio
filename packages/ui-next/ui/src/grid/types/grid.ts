import type {
  ComponentPublicInstance,
  RenderFunction,
  SetupContext,
} from 'vue';

import type {
  AsTableDefines,
  AsTableEmits,
  AsTableProps,
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
export interface GridPrivateRef<D = any> {}

export interface GridReactData<D = any> {}
export interface GridInternalData {
  uFoot?: boolean;
}
export interface GridMethods<D = any> {}
export interface AsGridMethods<D = any>
  extends GridMethods<D>, Omit<TableMethods<D>, 'dispatchEvent'> {}

export interface AsGridProps<D = any> extends AsTableProps<D> {
  columns?: AsGridPropTypes.Columns<D>;
  layouts?: AsGridPropTypes.Layouts;
  zoomConfig?: AsGridPropTypes.ZoomConfig;
}

export interface GridPrivateComputed<D = any> {}

export namespace AsGridPropTypes {
  export type Column<D = any> = AsTableDefines.ColumnOptions<D>;
  export type Columns<D = any> = Column<D>[];

  export type Layouts = AsGridDefines.LayoutKey[] | AsGridDefines.LayoutKey[][];

  export interface ZoomConfig {
    escRestore?: boolean;
  }
  export interface ZoomOpts extends ZoomConfig {}
}
export interface AsGridPrivateMethods<D = any> extends GridPrivateMethods<D> {}

export type AsGridEmits = [...AsTableEmits, 'pageChange', 'zoom'];

export namespace AsGridDefines {
  export type LayoutKey = 'Bottom' | 'Pager' | 'Table' | 'Top';
}

export interface AsGridListeners<D = any> {}

export interface AsGridSlots<D = any> {}

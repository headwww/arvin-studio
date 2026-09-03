import type { CSSProperties } from 'vue';

import type { VueNode } from '../_util';
import type { Resolvable } from '../_util/hooks/useMergeSemantic';
import type { InputStatus } from '../_util/statusUtils';
import type { ComponentBaseProps } from '../config-provider/context';

export type TransferKey = number | string;

export type PaginationType =
  | boolean
  | {
      pageSize?: number;
      showLessItems?: boolean;
      showSizeChanger?: boolean;
      simple?: boolean;
    };

export type TransferDirection = 'left' | 'right';

export interface RenderResultObject {
  label: VueNode;
  value: string;
}

export type RenderResult = null | RenderResultObject | string | VueNode;

export interface TransferItem {
  [name: string]: any;
  description?: string;
  disabled?: boolean;
  key?: TransferKey;
  title?: string;
}

export type KeyWise<T> = T & { key: TransferKey };

export type KeyWiseTransferItem = KeyWise<TransferItem>;

export type TransferRender<RecordType> = (item: RecordType) => RenderResult;

export interface ListStyle {
  direction: TransferDirection;
}

export type SelectAllLabel =
  | ((info: { selectedCount: number; totalCount: number }) => VueNode)
  | VueNode;

export interface TransferLocale {
  deselectAll?: string;
  itemsUnit: string;
  itemUnit: string;
  notFoundContent?: VueNode | VueNode[];
  remove?: string;
  removeAll?: string;
  removeCurrent?: string;
  searchPlaceholder: string;
  selectAll?: string;
  selectCurrent?: string;
  selectInvert?: string;
  titles?: VueNode[];
}

export interface TransferSearchOption {
  defaultValue?: string;
  placeholder?: string;
}

/**
 * @since 1.3.0 (mirrors ant-design#57101)
 * Per-side semantic overrides applied on top of the shared keys.
 */
export interface TransferSectionSemanticClassNames {
  body?: string;
  footer?: string;
  header?: string;
  item?: string;
  itemContent?: string;
  itemIcon?: string;
  list?: string;
  section?: string;
  title?: string;
}

export interface TransferSectionSemanticStyles {
  body?: CSSProperties;
  footer?: CSSProperties;
  header?: CSSProperties;
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemIcon?: CSSProperties;
  list?: CSSProperties;
  section?: CSSProperties;
  title?: CSSProperties;
}

export interface TransferSemanticClassNames {
  actions?: string;
  body?: string;
  footer?: string;
  header?: string;
  item?: string;
  itemContent?: string;
  itemIcon?: string;
  list?: string;
  root?: string;
  section?: string;
  /** Per-side overrides applied on top of the shared keys. */
  source?: TransferSectionSemanticClassNames;
  /** Per-side overrides applied on top of the shared keys. */
  target?: TransferSectionSemanticClassNames;
  title?: string;
}

export interface TransferSemanticStyles {
  actions?: CSSProperties;
  body?: CSSProperties;
  footer?: CSSProperties;
  header?: CSSProperties;
  item?: CSSProperties;
  itemContent?: CSSProperties;
  itemIcon?: CSSProperties;
  list?: CSSProperties;
  root?: CSSProperties;
  section?: CSSProperties;
  source?: TransferSectionSemanticStyles;
  target?: TransferSectionSemanticStyles;
  title?: CSSProperties;
}

/*
 * Written with `Resolvable` directly (not SemanticClassNamesType/StylesType,
 * whose flat-value constraint rejects the nested source/target shape): the
 * runtime resolves function-form classes/styles through useMergeSemantic and
 * then reads `source`/`target` off the result, so resolver returns must be
 * allowed to carry the nested keys too.
 */
export type TransferClassNamesType = Resolvable<
  Readonly<TransferSemanticClassNames>,
  TransferProps
>;

export type TransferStylesType = Resolvable<
  Readonly<TransferSemanticStyles>,
  TransferProps
>;

export interface TransferListProps<RecordType> extends TransferLocale {
  checkedKeys: TransferKey[];
  classes?: TransferSemanticClassNames;
  dataSource: RecordType[];
  direction: TransferDirection;

  disabled?: boolean;
  filterOption?: (
    filterText: string,
    item: RecordType,
    direction: TransferDirection,
  ) => boolean;
  footer?: (
    props: TransferListProps<RecordType>,
    info?: { direction: TransferDirection },
  ) => any;
  handleClear: () => void;
  handleFilter: (e: Event) => void;
  labelRender?: (item: RecordType) => any;
  onItemRemove?: (keys: TransferKey[]) => void;
  onItemSelect: (key: TransferKey, check: boolean, e?: MouseEvent) => void;
  onItemSelectAll: (
    dataSource: TransferKey[],
    checkAll: 'replace' | boolean,
  ) => void;
  onScroll: (e: Event) => void;
  pagination?: PaginationType;
  prefixCls: string;
  render?: TransferRender<RecordType>;
  renderList?: (props: TransferListBodyProps<RecordType>) => any;
  selectAllLabel?: SelectAllLabel;
  selectionsIcon?: VueNode;
  showRemove?: boolean;
  showSearch?: boolean | TransferSearchOption;
  showSelectAll?: boolean;
  style?: CSSProperties;
  styles?: TransferSemanticStyles;
  titleText: VueNode;
}

export interface RenderedItem<RecordType> {
  item: RecordType;
  renderedEl: VueNode;
  renderedText: string;
}

export const OmitProps = [
  'handleFilter',
  'handleClear',
  'checkedKeys',
] as const;
export type OmitProp = (typeof OmitProps)[number];

type PartialTransferListProps<RecordType> = Omit<
  TransferListProps<RecordType>,
  OmitProp
>;

export interface TransferListBodyProps<
  RecordType,
> extends PartialTransferListProps<RecordType> {
  filteredItems: RecordType[];
  filteredRenderItems: RenderedItem<RecordType>[];
  selectedKeys: TransferKey[];
}

export interface TransferCustomListBodyProps<
  RecordType,
> extends TransferListBodyProps<RecordType> {}

export interface TransferProps<RecordType = any> extends ComponentBaseProps {
  actions?: VueNode[];
  classes?: TransferClassNamesType;
  dataSource?: RecordType[];
  disabled?: boolean;

  filterOption?: (
    inputValue: string,
    item: RecordType,
    direction: TransferDirection,
  ) => boolean;
  footer?: (
    props: TransferListProps<RecordType>,
    info?: { direction: TransferDirection },
  ) => any;
  labelRender?: (item: RecordType) => any;
  /** @deprecated Please use `styles.section` instead. */
  listStyle?: ((style: ListStyle) => CSSProperties) | CSSProperties;
  locale?: Partial<TransferLocale>;
  oneWay?: boolean;
  /** @deprecated Please use `actions` instead. */
  operations?: VueNode[];
  /** @deprecated Please use `styles.actions` instead. */
  operationStyle?: CSSProperties;
  pagination?: PaginationType;
  render?: TransferRender<RecordType>;
  rowKey?: (record: RecordType) => TransferKey;
  selectAllLabels?: SelectAllLabel[];
  selectedKeys?: TransferKey[];
  selectionsIcon?: VueNode;
  showSearch?: boolean | TransferSearchOption;
  showSelectAll?: boolean;
  status?: InputStatus;
  styles?: TransferStylesType;
  targetKeys?: TransferKey[];
  titles?: VueNode[];
}

export interface TransferEmits {
  change: (
    targetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[],
  ) => void;
  scroll: (direction: TransferDirection, e: Event) => void;
  search: (direction: TransferDirection, value: string) => void;
  selectChange: (
    sourceSelectedKeys: TransferKey[],
    targetSelectedKeys: TransferKey[],
  ) => void;
  'update:selectedKeys': (selectedKeys: TransferKey[]) => void;
  'update:targetKeys': (targetKeys: TransferKey[]) => void;
}

export interface TransferSlots<RecordType = any> {
  actions?: () => any;
  default?: (props: TransferCustomListBodyProps<RecordType>) => any;
  footer?: (props: {
    info?: { direction: TransferDirection };
    props: TransferListProps<RecordType>;
  }) => any;
  labelRender?: (item: RecordType) => any;
  render?: (item: RecordType) => any;
  selectionsIcon?: () => any;
  titles?: () => any;
}

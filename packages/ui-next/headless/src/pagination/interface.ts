import type { CSSProperties, PropType } from 'vue';

import type { VueNode } from '../util';

export interface PaginationLocale {
  // Options
  items_per_page?: string;
  jump_to?: string;
  jump_to_confirm?: string;
  next_3?: string;

  next_5?: string;
  next_page?: string;
  page?: string;
  page_size?: string;
  prev_3?: string;
  prev_5?: string;
  // Pagination
  prev_page?: string;
}

type SemanticName = 'item';
export interface PaginationData {
  align: 'center' | 'end' | 'start';
  className: string;
  classNames?: Partial<Record<SemanticName, string>>;
  current: number;
  defaultCurrent: number;
  defaultPageSize: number;

  disabled: boolean;
  hideOnSinglePage: boolean;
  jumpNextIcon: VueNode;
  jumpPrevIcon: VueNode;
  locale: PaginationLocale;
  nextIcon: VueNode;

  pageSize: number;
  pageSizeOptions: number[];
  prefixCls: string;
  prevIcon: VueNode;
  selectPrefixCls: string;
  showLessItems: boolean;
  showPrevNextJumpers: boolean;
  showQuickJumper: boolean | object;
  showSizeChanger: boolean;
  showTitle: boolean;

  simple: boolean | { readOnly?: boolean };

  sizeChangerRender?: SizeChangerRender;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  total: number;
  totalBoundaryShowSizeChanger?: number;
}

export interface PaginationOnChangeInfo {
  recommendPage?: number;
}

export interface PaginationProps extends Partial<PaginationData> {
  itemRender?: (
    page: number,
    type: 'jump-next' | 'jump-prev' | 'next' | 'page' | 'prev',
    element: VueNode,
  ) => VueNode;
  onChange?: (
    page: number,
    pageSize: number,
    info?: PaginationOnChangeInfo,
  ) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  // WAI-ARIA
  role?: string | undefined;
  showTotal?: (total: number, range: [number, number]) => VueNode;
}
export type SizeChangerRender = (info: {
  'aria-label': string;
  className: string;
  disabled: boolean;
  onSizeChange: (value: number | string) => void;
  options: {
    label: string;
    value: number | string;
  }[];
  size: number;
}) => VueNode;

export function optionsProps() {
  return {
    disabled: {
      type: Boolean,
    },
    locale: {
      type: Object as PropType<PaginationLocale>,
      required: true,
    },
    rootPrefixCls: {
      type: String,
      required: true,
    },
    selectPrefixCls: {
      type: String,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    pageSizeOptions: {
      type: Array as PropType<Array<number>>,
    },
    goButton: {
      type: [Boolean, String],
    },
    changeSize: {
      type: Function as PropType<(size: number) => void>,
    },
    quickGo: {
      type: Function as PropType<(value: number | undefined) => void>,
    },
    buildOptionText: {
      type: Function as PropType<(value: number | string) => string>,
    },
    showSizeChanger: {
      type: Boolean,
      require: true,
    },
    sizeChangerRender: {
      type: Function as PropType<SizeChangerRender>,
    },
  };
}

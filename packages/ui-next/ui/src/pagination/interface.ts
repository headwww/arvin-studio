import type { CSSProperties } from 'vue';

import type { PaginationProps as VcPaginationProps } from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { SizeType } from '../config-provider/size-context';
import type { SelectProps } from '../select';

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

export type SemanticName = keyof PaginationSemanticClassNames &
  keyof PaginationSemanticStyles;

export type PaginationSemanticName = SemanticName;

export interface PaginationSemanticClassNames {
  item?: string;
  root?: string;
}

export interface PaginationSemanticStyles {
  item?: CSSProperties;
  root?: CSSProperties;
}

export type PaginationClassNamesType = SemanticClassNamesType<
  PaginationProps,
  PaginationSemanticClassNames
>;

export type PaginationStylesType = SemanticStylesType<
  PaginationProps,
  PaginationSemanticStyles
>;

export interface PaginationProps extends Omit<
  VcPaginationProps,
  | 'className'
  | 'classNames'
  | 'jumpNextIcon'
  | 'jumpPrevIcon'
  | 'locale'
  | 'nextIcon'
  | 'onChange'
  | 'onShowSizeChange'
  | 'pageSizeOptions'
  | 'prevIcon'
  | 'showSizeChanger'
  | 'style'
  | 'styles'
> {
  classes?: PaginationClassNamesType;
  jumpNextIcon?: VueNode;
  jumpPrevIcon?: VueNode;
  locale?: PaginationLocale;
  nextIcon?: VueNode;
  pageSizeOptions?: (number | string)[];
  prevIcon?: VueNode;
  responsive?: boolean;
  rootClass?: string;
  /** @deprecated Not official support. Will be removed in next major version. */
  selectComponentClass?: any;
  showQuickJumper?: boolean | { goButton?: VueNode };
  showSizeChanger?: boolean | SelectProps;
  size?: SizeType;
  styles?: PaginationStylesType;
  totalBoundaryShowSizeChanger?: number;
}

export type PaginationPosition = 'both' | 'bottom' | 'top';

export interface PaginationConfig extends Omit<PaginationProps, 'rootClass'> {
  position?: PaginationPosition;
}

export interface PaginationEmits {
  change: (page: number, pageSize: number) => void;
  showSizeChange: (current: number, size: number) => void;
  'update:current': (page: number) => void;
  'update:pageSize': (size: number) => void;
}

export interface PaginationSlots {
  itemRender?: (ctx: {
    element: VueNode;
    page: number;
    type: 'jump-next' | 'jump-prev' | 'next' | 'page' | 'prev';
  }) => any;
  jumpNextIcon?: () => any;
  jumpPrevIcon?: () => any;
  nextIcon?: () => any;
  prevIcon?: () => any;
  showTotal?: (ctx: { range: [number, number]; total: number }) => any;
}

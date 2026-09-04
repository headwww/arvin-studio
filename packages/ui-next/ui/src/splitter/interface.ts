import type { CSSProperties } from 'vue';

import type { VueNode } from '../_util';
// ================ outside ================
import type {
  Orientation,
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context';
import type { ShowCollapsibleIconMode } from './SplitBar';

export type SplitterSemanticName = keyof SplitterSemanticClassNames &
  keyof SplitterSemanticStyles;

export interface SplitterSemanticClassNames {
  panel?: string;
  root?: string;
}

export interface SplitterSemanticStyles {
  panel?: CSSProperties;
  root?: CSSProperties;
}

export type DraggerSemantic = keyof DraggerSemanticClassNames &
  keyof DraggerSemanticStyles;

export interface DraggerSemanticClassNames {
  active?: string;
  default?: string;
}

export interface DraggerSemanticStyles {
  active?: CSSProperties;
  default?: CSSProperties;
}

export interface SplitterSemanticDraggerClassNames {
  active?: string;
  default?: string;
}

export type SplitterClassNamesType = SemanticClassNamesType<
  SplitterProps,
  SplitterSemanticClassNames,
  { dragger?: DraggerSemanticClassNames | string }
>;

export type SplitterStylesType = SemanticStylesType<
  SplitterProps,
  SplitterSemanticStyles,
  { dragger?: CSSProperties | DraggerSemanticStyles }
>;

export interface SplitterProps extends ComponentBaseProps {
  classes?: SplitterClassNamesType;
  /**
   * Collapse configuration.
   */
  collapsible?: {
    icon?: {
      end?: VueNode;
      start?: VueNode;
    };
  };
  /**
   * @deprecated please use `collapsible.icon`
   */
  collapsibleIcon?: {
    end?: VueNode;
    start?: VueNode;
  };
  draggerIcon?: VueNode;
  /**
   * @deprecated please use `orientation`
   * @default horizontal
   */
  layout?: Orientation;
  lazy?: boolean;
  onCollapse?: (collapsed: boolean[], sizes: number[]) => void;
  onDraggerDoubleClick?: (index: number) => void;
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  onResizeStart?: (sizes: number[]) => void;
  'onUpdate:collapse'?: (collapsed: boolean[]) => void;
  orientation?: Orientation;
  styles?: SplitterStylesType;
  vertical?: boolean;
}

export interface SplitterEmits {
  // 'resizeStart': (sizes: number[]) => void
  // 'resize': (sizes: number[]) => void
  // 'resizeEnd': (sizes: number[]) => void
  // 'collapse': (collapsed: boolean[], sizes: number[]) => void
  // 'update:collapse': (collapsed: boolean[]) => void
}
export interface SplitterSlots {
  collapsibleIconEnd?: () => any;
  collapsibleIconStart?: () => any;
  default?: () => any;
  draggerIcon?: () => any;
}

export interface PanelProps {
  class?: string;
  collapsible?:
    | boolean
    | {
        end?: boolean;
        showCollapsibleIcon?: ShowCollapsibleIconMode;
        start?: boolean;
      };
  defaultSize?: number | string;
  destroyOnHidden?: boolean;
  max?: number | string;
  min?: number | string;
  resizable?: boolean;
  size?: number | string;
  style?: CSSProperties;
}

// ================ inside ================
export interface InternalPanelProps extends PanelProps {
  class?: string;
  prefixCls?: string;
}

export interface UseResizeProps {
  basicsState: number[];
  items: PanelProps[];
  onResize: (sizes: number[]) => void;
  panelsRef: Array<{ current: HTMLElement | null }>;
  reverse: boolean;
  setBasicsState: (
    value: ((prevState: number[]) => number[]) | number[],
  ) => void;
}

export interface UseResize {
  setOffset: (offset: number, containerSize: number, index: number) => void;
  setSize: (data: { index: number; size: number }[]) => void;
}

export interface UseHandleProps extends Pick<SplitterProps, 'layout'> {
  basicsState: number[];
  containerRef?: { current: HTMLDivElement | null };
  onResizeEnd: (sizes: number[]) => void;
  onResizeStart: (sizes: number[]) => void;
  setOffset: UseResize['setOffset'];
  setResizing: (value: ((prevState: boolean) => boolean) | boolean) => void;
}

export interface UseHandle {
  onStart: (x: number, y: number, index: number) => void;
}

export interface UseCollapsibleProps {
  basicsState: number[];
  collapsible?: PanelProps['collapsible'];
  index: number;
  reverse: boolean;
  setSize?: UseResize['setSize'];
}

export interface UseCollapsible {
  nextIcon: boolean;
  onFold: (type: 'next' | 'previous') => void;
  overlap: boolean;
  previousIcon: boolean;
  setOldBasics: () => void;
}

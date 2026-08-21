import type { AriaAttributes, CSSProperties, Ref } from 'vue';

import type { TriggerProps } from '../trigger';
import type { VueNode } from '../util/type';
import type { Gap } from './hooks/useTarget';
import type { PlacementType } from './placements';
import type { DefaultPanelProps } from './TourStep/DefaultPanel';

export type SemanticName =
  | 'actions'
  | 'close'
  | 'description'
  | 'footer'
  | 'header'
  | 'mask'
  | 'section'
  | 'title';

export type HTMLAriaDataAttributes = AriaAttributes & {
  [key: `data-${string}`]: unknown;
  role?: string;
};
export interface TourStepInfo {
  arrow?: boolean | { pointAtCenter: boolean };
  className?: string;
  closable?: boolean | (HTMLAriaDataAttributes & { closeIcon?: VueNode });
  closeIcon?: VueNode;
  description?: VueNode;
  mask?:
    | boolean
    | {
        // to fill mask color, e.g. rgba(80,0,0,0.5)
        color?: string;
        style?: CSSProperties;
      };
  placement?: PlacementType;
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;

  style?: CSSProperties;
  target?:
    | (() => HTMLElement | null | undefined)
    | HTMLElement
    | null
    | Ref<HTMLElement | null | undefined>;
  title: VueNode;
}

export interface TourStepProps extends TourStepInfo {
  classNames?: Partial<Record<SemanticName, string>>;
  current?: number;
  onClose?: () => void;
  onFinish?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  prefixCls?: string;
  renderPanel?: (step: DefaultPanelProps, current: number) => VueNode;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  total?: number;
}

export interface TourProps extends Pick<TriggerProps, 'onPopupAlign'> {
  animated?: boolean | { placeholder: boolean };
  arrow?: boolean | { pointAtCenter: boolean };
  builtinPlacements?:
    | ((config?: {
        arrowPointAtCenter?: boolean;
      }) => TriggerProps['builtinPlacements'])
    | TriggerProps['builtinPlacements'];
  className?: string;
  classNames?: Partial<Record<SemanticName, string>>;
  closable?: TourStepProps['closable'];
  closeIcon?: TourStepProps['closeIcon'];
  current?: number;
  defaultCurrent?: number;
  defaultOpen?: boolean;
  disabledInteraction?: boolean;
  gap?: Gap;
  getPopupContainer?: false | TriggerProps['getPopupContainer'];
  keyboard?: boolean;

  mask?:
    | boolean
    | {
        // to fill mask color, e.g. rgba(80,0,0,0.5)
        color?: string;
        style?: CSSProperties;
      };
  onChange?: (current: number) => void;
  onClose?: (current: number) => void;
  onFinish?: () => void;
  open?: boolean;
  placement?: PlacementType;
  prefixCls?: string;
  renderPanel?: (props: DefaultPanelProps, current: number) => VueNode;
  rootClassName?: string;
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
  steps?: TourStepInfo[];
  style?: CSSProperties;
  styles?: Partial<Record<SemanticName, CSSProperties>>;
  zIndex?: number;
}

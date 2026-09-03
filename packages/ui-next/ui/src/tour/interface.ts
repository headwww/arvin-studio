import type { CSSProperties } from 'vue';

import type {
  TourProps as VcTourProps,
  TourStepProps as VcTourStepProps,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNames,
  SemanticClassNamesType,
  SemanticStyles,
  SemanticStylesType,
} from '../_util/hooks';
import type { ComponentBaseProps } from '../config-provider/context.ts';

export type TourSemanticName = keyof TourSemanticClassNames &
  keyof TourSemanticStyles;

export interface TourSemanticClassNames {
  actions?: string;
  close?: string;
  cover?: string;
  description?: string;
  footer?: string;
  header?: string;
  indicator?: string;
  indicators?: string;
  mask?: string;
  root?: string;
  section?: string;
  title?: string;
}

export interface TourSemanticStyles {
  actions?: CSSProperties;
  close?: CSSProperties;
  cover?: CSSProperties;
  description?: CSSProperties;
  footer?: CSSProperties;
  header?: CSSProperties;
  indicator?: CSSProperties;
  indicators?: CSSProperties;
  mask?: CSSProperties;
  root?: CSSProperties;
  section?: CSSProperties;
  title?: CSSProperties;
}

export type TourClassNamesType = SemanticClassNamesType<
  TourProps,
  TourSemanticClassNames
>;

export type TourStylesType = SemanticStylesType<TourProps, TourSemanticStyles>;

export interface TourProps
  extends
    ComponentBaseProps,
    Omit<
      VcTourProps,
      | 'className'
      | 'classNames'
      | 'onChange'
      | 'onClose'
      | 'onFinish'
      | 'onPopupAlign'
      | 'renderPanel'
      | 'rootClassName'
      | 'styles'
    > {
  actionsRender?: TourStepProps['actionsRender'];
  classes?: TourClassNamesType;
  current?: number;
  indicatorsRender?: (current: number, total: number) => any;
  prefixCls?: string;
  steps?: TourStepProps[];
  styles?: TourStylesType;
  // default type, affects the background color and text color
  type?: 'default' | 'primary';
  // className?: string
  // style?: CSSProperties
}

export interface TourEmits {
  change: (current: number) => void;
  close: (current: number) => void;
  finish: () => void;
  popupAlign: (el: HTMLElement, info: any) => void;
  'update:current': (current: number) => void;
  'update:open': (open: boolean) => void;
}

export interface TourSlots {
  actionsRender: (
    originNode: any,
    info: { current: number; total: number },
  ) => any;
  coverRender: (params: { index: number; step: TourStepProps }) => any;
  descriptionRender: (params: { index: number; step: TourStepProps }) => any;
  indicatorsRender: (current: number, total: number) => any;
  nextButton: (params: {
    current: number;
    isFirst: boolean;
    isLast: boolean;
  }) => any;
  prevButton: (params: {
    current: number;
    isFirst: boolean;
    isLast: boolean;
  }) => any;
  titleRender: (params: { index: number; step: TourStepProps }) => any;
}

export interface TourStepProps extends Omit<VcTourStepProps, 'className'> {
  actionsRender?: (
    originNode: any,
    info: { current: number; total: number },
  ) => any;
  class?: string;
  classes?: SemanticClassNames<TourSemanticName>;
  cover?: VueNode;
  indicatorsRender?: (current: number, total: number) => any;
  nextButtonProps?: {
    children?: VueNode;
    class?: string;
    onClick?: () => void;
    style?: CSSProperties;
  };
  prevButtonProps?: {
    children?: VueNode;
    class?: string;
    onClick?: () => void;
    style?: CSSProperties;
  };
  styles?: SemanticStyles<TourSemanticName>;
  // default type, affects the background color and text color
  type?: 'default' | 'primary';
}

export interface TourLocale {
  Finish: string;
  Next: string;
  Previous: string;
}

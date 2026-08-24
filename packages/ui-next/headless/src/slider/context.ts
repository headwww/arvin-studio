import type { InjectionKey, Ref } from 'vue';

import type { IsHandleDisabled } from './hooks/useDisabled';
import type {
  AriaValueFormat,
  Direction,
  SliderClassNames,
  SliderStyles,
} from './interface';

import { defineComponent, inject, provide, ref } from 'vue';

export interface SliderContextProps {
  ariaLabelForHandle?: string | string[];
  ariaLabelledByForHandle?: string | string[];
  ariaRequired?: boolean;
  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[];
  classNames: SliderClassNames;
  direction: Direction;
  disabled?: boolean;
  included?: boolean;
  includedEnd: number;
  includedStart: number;
  /** rc-slider#1069: per-handle disabled lookup. */
  isHandleDisabled: IsHandleDisabled;
  keyboard?: boolean;
  max: number;
  min: number;
  range?: boolean;
  step: null | number;
  styles: SliderStyles;
  tabIndex: number | number[];
}

const SliderContextKey: InjectionKey<Ref<SliderContextProps>> =
  Symbol('SliderContext');

export const defaultSliderContextValue: SliderContextProps = {
  min: 0,
  max: 0,
  direction: 'ltr',
  step: 1,
  includedStart: 0,
  includedEnd: 0,
  tabIndex: 0,
  keyboard: true,
  styles: {},
  classNames: {},
  isHandleDisabled: () => false,
};

export function useProviderSliderContext(ctx: Ref<SliderContextProps>) {
  provide(SliderContextKey, ctx);
}
export function useInjectSlider(): Ref<SliderContextProps> {
  return inject(SliderContextKey, ref({} as SliderContextProps));
}

export interface UnstableContextProps {
  onDragChange?: (info: {
    deleteIndex: number;
    draggingIndex: number;
    draggingValue: number;
    rawValues: number[];
  }) => void;
  onDragStart?: (info: {
    draggingIndex: number;
    draggingValue: number;
    rawValues: number[];
  }) => void;
}

/** @private NOT PROMISE AVAILABLE. DO NOT USE IN PRODUCTION. */
export const UnstableContextKey: InjectionKey<UnstableContextProps> =
  Symbol('UnstableContext');

// 默认值
export const defaultUnstableContextValue: UnstableContextProps = {};

export const UnstableProvider = defineComponent(
  (props, { slots }) => {
    provide(UnstableContextKey, props.value);
    return () => {
      return slots?.default?.();
    };
  },
  {
    props: ['value'],
  },
);

export function useUnstableContext() {
  return inject(UnstableContextKey, {} as UnstableContextProps);
}

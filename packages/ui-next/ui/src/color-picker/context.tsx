import type { Ref } from 'vue';

import type { AggregationColor } from './color';
import type { ModeOptions } from './hooks/useModeColor';
import type {
  ColorFormatType,
  ColorPickerEmits,
  ModeType,
  PresetsItem,
} from './interface';

import { computed, defineComponent, inject, provide, shallowRef } from 'vue';

export interface PanelPickerContextProps {
  /** The gradient Slider active handle */
  activeIndex: number;
  allowClear?: boolean;
  disabled?: boolean;
  disabledAlpha?: boolean;
  disabledFormat?: boolean;
  format?: ColorFormatType;
  /** Is gradient Slider dragging */
  gradientDragging: boolean;
  mode: ModeType;
  modeOptions: ModeOptions;
  /** The gradient Slider handle active changed */
  onActive: (index: number) => void;
  onChange?: (value?: AggregationColor, fromPicker?: boolean) => void;
  onChangeComplete?: ColorPickerEmits['changeComplete'];

  onClear?: () => void;
  onFormatChange?: ColorPickerEmits['formatChange'];
  /** The gradient Slider dragging changed */
  onGradientDragging: (dragging: boolean) => void;
  onModeChange: (mode: ModeType) => void;

  prefixCls: string;
  value: AggregationColor;
  // classes?: SemanticClassNames<any>
  // styles?: SemanticStyles<any>
}

export interface PanelPresetsContextProps {
  disabled?: boolean;
  onChange?: (value: AggregationColor) => void;
  prefixCls: string;
  presets?: PresetsItem[];
  value: AggregationColor;
  // classes?: SemanticClassNames<any>
  // styles?: SemanticStyles<any>
}

const PanelPickerContextKey = Symbol('PanelPickerContext');
const PanelPresetsContextKey = Symbol('PanelPresetsContext');

export function usePanelPickerProvider(value: Ref<PanelPickerContextProps>) {
  provide(PanelPickerContextKey, value);
}

export function usePanelPickerContext() {
  return inject<Ref<PanelPickerContextProps>>(
    PanelPickerContextKey,
    shallowRef({} as PanelPickerContextProps),
  );
}

export const PanelPickerContextProvider =
  defineComponent<PanelPickerContextProps>(
    (props, { slots }) => {
      usePanelPickerProvider(computed(() => props));
      return () => slots.default?.();
    },
    {
      inheritAttrs: false,
    },
  );

export function usePanelPresetsProvider(value: Ref<PanelPresetsContextProps>) {
  provide(PanelPresetsContextKey, value);
}

export function usePanelPresetsContext() {
  return inject<Ref<PanelPresetsContextProps>>(
    PanelPresetsContextKey,
    shallowRef({} as PanelPresetsContextProps),
  );
}

export const PanelPresetsContextProvider =
  defineComponent<PanelPresetsContextProps>(
    (props, { slots }) => {
      usePanelPresetsProvider(computed(() => props));
      return () => slots.default?.();
    },
    {
      inheritAttrs: false,
    },
  );

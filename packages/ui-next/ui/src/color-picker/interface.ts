import type { CSSProperties } from 'vue';

import type {
  ColorGenInput,
  Key,
  ColorPickerProps as VcColorPickerProps,
} from '@arvin-studio/headless';

import type { VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { SizeType } from '../config-provider/size-context';
import type { PopoverProps } from '../popover';
import type { TooltipPlacement } from '../tooltip';
import type { AggregationColor } from './color';

export type { ColorGenInput };

export type Colors<T> = {
  color: ColorGenInput<T>;
  percent: number;
}[];

export const FORMAT_HEX = 'hex';
export const FORMAT_RGB = 'rgb';
export const FORMAT_HSB = 'hsb';

export type ColorFormatType =
  | typeof FORMAT_HEX
  | typeof FORMAT_HSB
  | typeof FORMAT_RGB;
export type ColorValueFormatType =
  | ((value: AggregationColor) => string)
  | ColorFormatType;

export interface PresetsItem {
  colors: (AggregationColor | string)[];
  /**
   * Whether the initial state is collapsed
   * @since 5.11.0
   * @default true
   */
  defaultOpen?: boolean;
  /**
   * The key of the panel
   * @since 5.23.0
   */
  key?: Key;
  label: VueNode;
}

export type TriggerType = 'click' | 'hover';

export type TriggerPlacement = TooltipPlacement; // Alias, to prevent breaking changes.

export type SingleValueType = AggregationColor | string;

export type LineGradientType = {
  color: SingleValueType;
  percent: number;
}[];

export type ColorValueType = LineGradientType | null | SingleValueType;

export type ModeType = 'gradient' | 'single';

export type ColorPickerSemanticName = keyof ColorPickerSemanticClassNames &
  keyof ColorPickerSemanticStyles;

export interface ColorPickerSemanticClassNames {
  body?: string;
  content?: string;
  description?: string;
  root?: string;
}

export interface ColorPickerSemanticStyles {
  body?: CSSProperties;
  content?: CSSProperties;
  description?: CSSProperties;
  root?: CSSProperties;
}

export type ColorPickerClassNamesType = SemanticClassNamesType<
  ColorPickerProps,
  ColorPickerSemanticClassNames,
  { popup?: { root?: string } }
>;

export type ColorPickerStylesType = SemanticStylesType<
  ColorPickerProps,
  ColorPickerSemanticStyles,
  {
    popup?: { root?: CSSProperties };
    popupOverlayInner?: CSSProperties;
  }
>;

export type ColorPickerProps = Omit<
  VcColorPickerProps,
  | 'components'
  | 'defaultValue'
  | 'disabledAlpha'
  | 'onChange'
  | 'onChangeComplete'
  | 'panelRender'
  | 'value'
  | 'valueFormat'
> & {
  [key: `data-${string}`]: string;
  allowClear?: boolean;
  arrow?: boolean | { pointAtCenter?: boolean };
  classes?: ColorPickerClassNamesType;
  defaultFormat?: ColorFormatType;
  defaultValue?: ColorValueType;
  disabled?: boolean;
  disabledAlpha?: boolean;
  disabledFormat?: boolean;
  format?: ColorFormatType;
  mode?: ModeType | ModeType[];
  open?: boolean;
  panelRender?: (params: {
    extra: { components: { Picker: any; Presets: any } };
    panel: any;
  }) => any;
  placement?: TriggerPlacement;
  presets?: PresetsItem[];
  rootClass?: string;
  showText?: ((params: { color: AggregationColor }) => any) | boolean;
  size?: SizeType;
  styles?: ColorPickerStylesType;
  trigger?: TriggerType;
  value?: ColorValueType;
  valueFormat?: ColorValueFormatType;
} & Pick<
    PopoverProps,
    'autoAdjustOverflow' | 'destroyOnHidden' | 'getPopupContainer'
  >;

export interface ColorPickerEmits {
  change: (value: AggregationColor, css: string) => void;
  changeComplete: (value: AggregationColor) => void;
  clear: () => void;
  formatChange: (format?: ColorFormatType) => void;
  openChange: (open: boolean) => void;
  'update:format': (format: ColorFormatType) => void;
  'update:open': (open: boolean) => void;
  'update:value': (value: ColorValueType) => void;
}

export interface ColorPickerSlots {
  default: () => any;
  panelRender: (params: {
    extra: { components: { Picker: any; Presets: any } };
    panel: any;
  }) => any;
  showText: (params: { color: AggregationColor }) => any;
}

import type { CSSProperties } from 'vue';

import type {
  Orientation,
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type {
  AbstractCheckboxProps,
  CheckboxEmits,
} from '../checkbox/Checkbox.tsx';
import type {
  AbstractCheckboxGroupProps,
  CheckboxOptionType,
} from '../checkbox/Group.tsx';
import type { SizeType } from '../config-provider/size-context';

export type RadioGroupButtonStyle = 'outline' | 'solid';
export type RadioGroupOptionType = 'button' | 'default';

export interface RadioGroupProps extends AbstractCheckboxGroupProps {
  block?: boolean;
  buttonStyle?: RadioGroupButtonStyle;
  defaultValue?: any;
  disabled?: boolean;
  id?: string;
  labelRender?: (params: { index: number; item: CheckboxOptionType }) => any;
  name?: string;
  'onUpdate:value'?: (value: any) => void;
  optionType?: RadioGroupOptionType;
  orientation?: Orientation;
  size?: SizeType;
  value?: any;
  vertical?: boolean;
}

export interface RadioGroupEmits {
  blur: (e: FocusEvent) => void;
  change: (e: RadioChangeEvent) => void;
  focus: (e: FocusEvent) => void;
  mouseenter: (e: MouseEvent) => void;
  mouseleave: (e: MouseEvent) => void;
}

export interface RadioGroupSlots {
  default: () => any;
  labelRender: (params: { index: number; item: CheckboxOptionType }) => any;
}

export interface RadioGroupContextProps {
  block?: boolean;
  disabled?: boolean;
  name?: string;
  onChange: (e: RadioChangeEvent) => void;
  /**
   * Control the appearance for Radio to display as button or not
   *
   * @default 'default'
   * @internal
   */
  optionType?: RadioGroupOptionType;
  value: any;
}

export type RadioSemanticName = keyof RadioSemanticClassNames &
  keyof RadioSemanticStyles;

export interface RadioSemanticClassNames {
  icon?: string;
  label?: string;
  root?: string;
}

export interface RadioSemanticStyles {
  icon?: CSSProperties;
  label?: CSSProperties;
  root?: CSSProperties;
}

export type RadioClassNamesType = SemanticClassNamesType<
  RadioProps,
  RadioSemanticClassNames
>;

export type RadioStylesType = SemanticStylesType<
  RadioProps,
  RadioSemanticStyles
>;

export interface RadioProps extends AbstractCheckboxProps {
  classes?: RadioClassNamesType;
  /**
   * Control the appearance for Radio to display as button or not
   *
   * @default 'default'
   * @internal
   */
  optionType?: RadioGroupOptionType;
  styles?: RadioStylesType;
}

export interface RadioEmits extends CheckboxEmits {}

export interface RadioSlots {
  default?: () => any;
}

export interface RadioChangeEventTarget extends RadioProps {
  checked: boolean;
}

export interface RadioChangeEvent {
  nativeEvent: MouseEvent;
  preventDefault: () => void;
  stopPropagation: () => void;
  target: RadioChangeEventTarget;
}

export type RadioOptionTypeContextProps = RadioGroupOptionType;

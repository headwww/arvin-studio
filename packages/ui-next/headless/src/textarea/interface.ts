import type { CSSProperties } from 'vue';

import type { BaseInputProps, CommonInputProps, InputProps } from '../input';
import type { ChangeEventHandler } from '../util';

export interface AutoSizeType {
  maxRows?: number;
  minRows?: number;
}

// To compatible with origin usage. We have to wrap this
export interface ResizableTextAreaRef {
  textArea: HTMLTextAreaElement;
}

export interface TextAreaProps {
  allowClear?: BaseInputProps['allowClear'];
  autoFocus?: boolean;
  autoSize?: AutoSizeType | boolean;
  /**
   * Whether to trigger onChange during IME composition.
   * When false (default), onChange only fires after compositionEnd with the final value.
   * When true, onChange fires on every keystroke including intermediate IME values.
   */
  changeOnComposing?: boolean;
  classNames?: CommonInputProps['classNames'] & {
    count?: string;
    textarea?: string;
  };
  count?: InputProps['count'];
  defaultValue?: any;
  disabled?: boolean;
  hidden?: boolean;
  maxLength?: number;
  onBlur?: (e: FocusEvent) => void;
  onChange?: ChangeEventHandler;
  onClear?: InputProps['onClear'];
  onFocus?: (e: FocusEvent) => void;
  onKeydown?: (e: KeyboardEvent) => void;
  onKeyup?: (e: KeyboardEvent) => void;
  onPressEnter?: (e: any) => void;
  onResize?: (size: { height: number; width: number }) => void;
  placeholder?: string;
  prefixCls?: string;
  readOnly?: boolean;
  showCount?: InputProps['showCount'];
  styles?: {
    clear?: CSSProperties;
    count?: CSSProperties;
    textarea?: CSSProperties;
  };
  suffix?: BaseInputProps['suffix'];
  value?: any;
}

export interface TextAreaRef {
  blur: () => void;
  focus: () => void;
  nativeElement: HTMLElement;
  resizableTextArea: ResizableTextAreaRef;
}

import type { ComputedRef } from 'vue';

import type { VueNode } from '../../../../util';
import type { GenerateConfig } from '../../../generate';
import type { Locale, SelectorProps } from '../../../interface';

import { computed } from 'vue';

export interface InputProps {
  [key: string]: any;
  active?: boolean;
  'aria-required'?: boolean;
  autoComplete?: string;
  clearIcon?: VueNode;
  disabled?: boolean;
  format?: string;
  /** Meaning current is from the hover cell getting the placeholder text */
  helped?: boolean;
  id?: string;
  invalid?: boolean;
  name?: string;
  onBlur?: (e: FocusEvent) => void;
  onChange: (value: string) => void;
  onFocus?: (e: FocusEvent) => void;
  /**
   * Trigger when input need additional help.
   * Like open the popup for interactive.
   */
  onHelp: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onSubmit: VoidFunction;
  placeholder?: string;
  preserveInvalidOnBlur?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Used for single picker only */
  showActiveCls?: boolean;
  size?: number;
  suffixIcon?: VueNode;

  validateFormat: (value: string) => boolean;
  value?: string;
}

function formatValue<DateType>(
  value: DateType,
  {
    generateConfig,
    locale,
    format,
  }: {
    format: ((value: DateType) => string) | string;
    generateConfig: GenerateConfig<DateType>;
    locale: Locale;
  },
): string {
  if (!value) return '';

  if (typeof format === 'function') {
    return format(value);
  }

  return (
    generateConfig.locale.format(locale.locale, value, format) || String(value)
  );
}

function pickAttrs(
  props: Record<string, any>,
  { aria, data }: { aria?: boolean; data?: boolean },
) {
  const result: Record<string, any> = {};
  Object.keys(props).forEach((key) => {
    if (aria && (key.startsWith('aria-') || key === 'role')) {
      result[key] = props[key];
    }
    if (data && key.startsWith('data-')) {
      result[key] = props[key];
    }
  });
  return result;
}

export type UseInputProps<DateType extends object = any> = Pick<
  SelectorProps<DateType>,
  | 'activeHelp'
  | 'format'
  | 'generateConfig'
  | 'inputReadOnly'
  | 'locale'
  | 'maskFormat'
  | 'onBlur'
  | 'onFocus'
  | 'onInputChange'
  | 'onInvalid'
  | 'onKeyDown'
  | 'onOpenChange'
  | 'onSubmit'
  | 'open'
  | 'picker'
  | 'preserveInvalidOnBlur'
> & {
  activeIndex?: null | number;
  // RangePicker only
  allHelp: boolean;
  'aria-required'?: boolean;
  autoComplete?: string;
  disabled?: [boolean, boolean] | boolean;
  id?: string | string[];

  invalid?: [boolean, boolean] | boolean;
  name?: string;
  onChange: (value: DateType | null, index?: number) => void;
  placeholder?: [string, string] | string;

  // Attributes not in SelectorProps directly or omitted
  required?: boolean;
  value?: DateType[];
};

export default function useInputProps<DateType extends object = any>(
  props: ComputedRef<UseInputProps<DateType>>,
  /** Used for SinglePicker */
  postProps?: (info: { valueTexts: string[] }) => Partial<InputProps>,
) {
  // ======================== Parser ========================
  const parseDate = (str: string, formatStr: string) => {
    const { generateConfig, locale } = props.value;
    const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr]);
    return parsed && generateConfig.isValidate(parsed) ? parsed : null;
  };

  // ========================= Text =========================
  const firstFormat = computed(() => props.value.format[0]);

  const getText = (date: DateType) => {
    const { locale, generateConfig } = props.value;
    return formatValue(date, {
      locale,
      format: firstFormat.value as any,
      generateConfig,
    });
  };

  const valueTexts = computed(() => (props.value.value || []).map(getText));

  // ========================= Size =========================
  const size = computed(() => {
    const { picker, generateConfig } = props.value;
    const defaultSize = picker === 'time' ? 8 : 10;
    const length =
      typeof firstFormat.value === 'function'
        ? firstFormat.value(generateConfig.getNow()).length
        : firstFormat.value!.length;
    return Math.max(defaultSize, length) + 2;
  });

  // ======================= Validate =======================
  const validateFormat = (text: string) => {
    const { format } = props.value;
    for (const singleFormat of format) {
      // Only support string type
      if (typeof singleFormat !== 'string') {
        continue;
      }

      const parsed = parseDate(text, singleFormat);

      if (parsed) {
        return parsed;
      }
    }

    return false;
  };

  // ======================== Input =========================
  const getInputProps = (index?: number): InputProps => {
    function getProp<T>(propValue: T | T[]): T {
      return index === undefined
        ? (propValue as T)
        : (propValue as T[])[index]!;
    }

    const pickedAttrs = pickAttrs(props.value, { aria: true, data: true });

    const {
      maskFormat,
      preserveInvalidOnBlur,
      inputReadOnly,
      required,
      'aria-required': ariaRequired,
      name,
      autoComplete,
      id,
      invalid,
      placeholder,
      activeHelp,
      activeIndex,
      allHelp,
      disabled,
      onFocus,
      onBlur,
      onSubmit,
      onInputChange,
      onInvalid,
      onChange,
      onOpenChange,
      onKeyDown,
      open,
    } = props.value;

    const inputProps: InputProps = {
      ...pickedAttrs,

      // ============== Shared ==============
      format: maskFormat,
      validateFormat: (text: string) => !!validateFormat(text),
      preserveInvalidOnBlur,

      readOnly: inputReadOnly,

      required,
      'aria-required': ariaRequired,

      name,

      autoComplete,

      size: size.value,

      // ============= By Index =============
      id: getProp(id),

      value: getProp(valueTexts.value) || '',

      invalid: getProp(invalid),

      placeholder: getProp(placeholder),

      active: activeIndex === index,

      helped: allHelp || (activeHelp && activeIndex === index),

      disabled: getProp(disabled),

      onFocus: (event) => {
        onFocus(event, index);
      },
      onBlur: (event) => {
        // Blur do not trigger close
        // Since it may focus to the popup panel
        onBlur(event, index);
      },

      onSubmit,

      // Get validate text value
      onChange: (text: string) => {
        onInputChange();

        const parsed = validateFormat(text);

        if (parsed) {
          onInvalid(false, index);
          onChange(parsed, index);
          return;
        }

        // Tell outer that the value typed is invalid.
        // If text is empty, it means valid.
        onInvalid(!!text, index);
      },
      onHelp: () => {
        onOpenChange(true, { index });
      },
      onKeyDown: (event: KeyboardEvent) => {
        let prevented = false;

        onKeyDown?.(event, () => {
          prevented = true;
        });

        if (!event.defaultPrevented && !prevented) {
          switch (event.key) {
            case 'Enter': {
              if (!open) {
                onOpenChange(true);
              }
              break;
            }
            case 'Escape': {
              onOpenChange(false, { index });
              break;
            }
          }
        }
      },

      // ============ Post Props ============
      ...postProps?.({ valueTexts: valueTexts.value }),
    };

    // ============== Clean Up ==============
    Object.keys(inputProps).forEach((key) => {
      if (inputProps[key] === undefined) {
        delete inputProps[key];
      }
    });

    return inputProps;
  };

  return [getInputProps, getText] as const;
}

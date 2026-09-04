import type { CSSProperties, Ref } from 'vue';

import type {
  PickerRef,
  PickerLocale as VcPickerLocale,
  PickerProps as VcPickerProps,
  RangePickerProps as VcRangePickerProps,
} from '@arvin-studio/headless';

import type { AnyObject } from '../../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../../_util/hooks';
import type { InputStatus } from '../../_util/statusUtils';
import type { Variant } from '../../config-provider/context';
import type { SizeType } from '../../config-provider/size-context';
import type { TimePickerLocale } from '../../time-picker';

const _DataPickerPlacements = [
  'bottomLeft',
  'bottomRight',
  'topLeft',
  'topRight',
] as const;

type DataPickerPlacement = (typeof _DataPickerPlacements)[number];

export type DatePickerSemanticName = keyof DatePickerSemanticClassNames &
  keyof DatePickerSemanticStyles;

export type DatePickerPanelSemanticName =
  keyof DatePickerPanelSemanticClassNames & keyof DatePickerPanelSemanticStyles;

export interface DatePickerSemanticClassNames {
  input?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
}

export interface DatePickerSemanticStyles {
  input?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
}

export interface DatePickerPanelSemanticClassNames {
  body?: string;
  container?: string;
  content?: string;
  footer?: string;
  header?: string;
  item?: string;
  root?: string;
}

export interface DatePickerPanelSemanticStyles {
  body?: CSSProperties;
  container?: CSSProperties;
  content?: CSSProperties;
  footer?: CSSProperties;
  header?: CSSProperties;
  item?: CSSProperties;
  root?: CSSProperties;
}

export type DatePickerClassNamesType<P> = SemanticClassNamesType<
  InjectDefaultProps<P>,
  DatePickerSemanticClassNames,
  { popup?: DatePickerPanelSemanticClassNames | string }
>;

export type DatePickerStylesType<P> = SemanticStylesType<
  InjectDefaultProps<P>,
  DatePickerSemanticStyles,
  { popup?: DatePickerPanelSemanticStyles }
>;
export type PickerLocale = AdditionalPickerLocaleProps & {
  lang: AdditionalPickerLocaleLangProps & VcPickerLocale;
  timePickerLocale: TimePickerLocale;
};

/** @deprecated **Useless**. */
export interface AdditionalPickerLocaleProps {
  /**
   * @deprecated **Invalid**, Please use `lang.fieldDateFormat` instead.
   */
  dateFormat?: string;
  /**
   * @deprecated **Invalid**, Please use `lang.fieldDateTimeFormat` instead,
   */
  dateTimeFormat?: string;
  /**
   * @deprecated **Invalid**, Please use `lang.fieldWeekFormat` instead,
   */
  monthFormat?: string;
  /**
   * @deprecated **Invalid**, Please use `lang.fieldWeekFormat` instead,
   */
  weekFormat?: string;
}

export interface AdditionalPickerLocaleLangProps {
  monthPlaceholder?: string;
  placeholder: string;
  quarterPlaceholder?: string;
  rangeMonthPlaceholder?: [string, string];
  rangePlaceholder?: [string, string];
  rangeQuarterPlaceholder?: [string, string];
  rangeWeekPlaceholder?: [string, string];
  rangeYearPlaceholder?: [string, string];
  weekPlaceholder?: string;
  yearPlaceholder?: string;
}

export type RequiredSemanticPicker = Readonly<
  [
    classes: Ref<
      DatePickerSemanticClassNames & {
        popup: DatePickerPanelSemanticClassNames;
      }
    >,
    styles: Ref<
      DatePickerSemanticStyles & { popup: DatePickerPanelSemanticStyles }
    >,
  ]
>;
type RcEventKeys =
  | 'onBlur'
  | 'onCalendarChange'
  | 'onChange'
  | 'onClear'
  | 'onClick'
  | 'onFocus'
  | 'onKeyDown'
  | 'onMouseDown'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'onOk'
  | 'onOpenChange'
  | 'onPanelChange'
  | 'onSelect';

export type InjectDefaultProps<Props> = Omit<
  Props,
  | 'className'
  | 'classNames'
  | 'generateConfig'
  | 'hideHeader'
  | 'locale'
  | 'rootClassName'
  | 'style'
  | 'styles'
  | RcEventKeys
> & {
  /** @deprecated Use `variant` instead */
  bordered?: boolean;
  classes?: DatePickerClassNamesType<Props>;
  /**
   * @deprecated `dropdownClassName` is deprecated which will be removed in next major
   *   version.Please use `classes.popup.root` instead.
   */
  dropdownClassName?: string;
  locale?: PickerLocale;
  placement?: DataPickerPlacement;
  /**
   * @deprecated please use `classes.popup.root` instead
   */
  popupClassName?: string;
  /**
   * @deprecated please use `styles.popup.root` instead
   */
  popupStyle?: CSSProperties;
  rootClass?: string;
  size?: SizeType;
  status?: InputStatus;
  styles?: DatePickerStylesType<Props>;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
};

export interface BaseDefaultProps<Props> {
  /** @deprecated Use `variant` instead */
  bordered?: boolean;
  classes?: DatePickerClassNamesType<Props>;
  /**
   * @deprecated `dropdownClassName` is deprecated which will be removed in next major
   *   version.Please use `classes.popup.root` instead.
   */
  dropdownClassName?: string;
  locale?: PickerLocale;
  placement?: DataPickerPlacement;
  /**
   * @deprecated please use `classes.popup.root` instead
   */
  popupClassName?: string;
  /**
   * @deprecated please use `styles.popup.root` instead
   */
  popupStyle?: CSSProperties;
  rootClass?: string;
  size?: SizeType;
  status?: InputStatus;
  styles?: DatePickerStylesType<Props>;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
}
/** Base Single Picker props */
// export type PickerProps<DateType extends AnyObject = any> = VcPickerProps<DateType> & BaseDefaultProps<VcPickerProps<DateType>>

export interface PickerProps<DateType extends AnyObject = any>
  extends
    BaseDefaultProps<DateType>,
    Omit<
      VcPickerProps,
      | 'className'
      | 'classNames'
      | 'generateConfig'
      | 'hideHeader'
      | 'locale'
      | 'placement'
      | 'rootClassName'
      | 'style'
      | 'styles'
      | RcEventKeys
    > {}

/** Base Range Picker props */
export interface RangePickerProps<DateType extends AnyObject = any>
  extends
    BaseDefaultProps<DateType>,
    Omit<
      VcRangePickerProps<DateType>,
      | 'className'
      | 'classNames'
      | 'generateConfig'
      | 'hideHeader'
      | 'locale'
      | 'placement'
      | 'rootClassName'
      | 'style'
      | 'styles'
      | RcEventKeys
    > {}

export type GenericTimePickerProps<DateType extends AnyObject = any> = Omit<
  PickerProps<DateType>,
  'picker' | 'showTime'
>;

type MultiValueType<
  ValueType,
  IsMultiple extends boolean = false,
> = IsMultiple extends true ? ValueType[] : ValueType;

/**
 * Single Picker has the `multiple` prop,
 * which will make the `value` be `DateType[]` type.
 * Here to be a generic which accept the `ValueType` for developer usage.
 */
export type PickerPropsWithMultiple<
  DateType extends AnyObject = any,
  InnerPickerProps extends PickerProps<DateType> = PickerProps<DateType>,
  ValueType = DateType,
  IsMultiple extends boolean = false,
> = Omit<InnerPickerProps, 'defaultValue' | 'onChange' | 'onOk' | 'value'> & {
  defaultValue?: MultiValueType<ValueType, IsMultiple> | null;
  multiple?: IsMultiple;
  value?: MultiValueType<ValueType, IsMultiple> | null;
};

export type { PickerRef };

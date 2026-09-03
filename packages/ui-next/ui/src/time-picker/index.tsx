// oxlint-disable no-unused-vars
import type { App, CSSProperties, SlotsType } from 'vue';

import type { PickerMode, PickerRef } from '@arvin-studio/headless';

import type { AnyObject, VueNode } from '../_util';
import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from '../_util/hooks';
import type { InputStatus } from '../_util/statusUtils';
import type {
  PickerProps,
  RangePickerProps,
} from '../date-picker/generatePicker';

import { computed, defineComponent, shallowRef } from 'vue';

import genPurePanel from '../_util/PurePanel';
import { toPropsRefs } from '../_util/tools';
import { devUseWarning, isDev } from '../_util/warning';
import DatePicker from '../date-picker';
import useMergedPickerSemantic from '../date-picker/hooks/useMergedPickerSemantic';
import { useVariants } from '../form/hooks/useVariant';

export type TimePickerSemanticName = keyof TimePickerSemanticClassNames &
  keyof TimePickerSemanticStyles;

// import type { SemanticName } from '@rc-component/picker/interface';
export interface TimePickerSemanticClassNames {
  input?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
}

// import type { SemanticName } from '@rc-component/picker/interface';
export interface TimePickerSemanticStyles {
  input?: CSSProperties;
  prefix?: CSSProperties;
  root?: CSSProperties;
  suffix?: CSSProperties;
}

export type TimePickerPanelSemanticName =
  keyof TimePickerPanelSemanticClassNames & keyof TimePickerPanelSemanticStyles;

export interface TimePickerPanelSemanticClassNames {
  container?: string;
  content?: string;
  footer?: string;
  item?: string;
  root?: string;
}

export interface TimePickerPanelSemanticStyles {
  container?: CSSProperties;
  content?: CSSProperties;
  footer?: CSSProperties;
  item?: CSSProperties;
  root?: CSSProperties;
}

export type TimePickerClassNames = SemanticClassNamesType<
  TimePickerProps,
  TimePickerSemanticClassNames,
  { popup?: string | TimePickerPanelSemanticClassNames }
>;

export type TimePickerStyles = SemanticStylesType<
  TimePickerProps,
  TimePickerSemanticStyles,
  { popup?: TimePickerPanelSemanticStyles }
>;

export interface PickerTimeProps<DateType extends AnyObject> extends Omit<
  PickerProps<DateType>,
  'picker' | 'showTime'
> {}

export interface RangePickerTimeProps<DateType extends AnyObject> extends Omit<
  RangePickerProps<DateType>,
  'picker' | 'showTime'
> {
  /** @deprecated Please use `classes.popup` instead */
  popupClassName?: string;
  /** @deprecated Please use `styles.popup` instead */
  popupStyle?: CSSProperties;
}

const { TimePicker: InternalTimePicker, RangePicker: InternalRangePicker } =
  DatePicker;

export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}

type BaseTimeRangePickerProps = Omit<
  RangePickerTimeProps<AnyObject>,
  'onKeydown' | 'picker'
>;

export interface TimeRangePickerProps
  extends
    BaseTimeRangePickerProps,
    /* @vue-ignore */
    Omit<TimeRangePickerEmitsProps, keyof BaseTimeRangePickerProps> {
  /** @deprecated Please use `classes.popup` instead */
  popupClassName?: string;
  /** @deprecated Please use `styles.popup` instead */
  popupStyle?: CSSProperties;
}

export interface TimeRangePickerEmits<DateType = AnyObject> {
  blur: (e: FocusEvent, info: any) => void;
  calendarChange: (
    dates: DateType[],
    dateStrings: [string, string],
    info: any,
  ) => void;
  change: (dates: DateType[] | null, dateStrings: [string, string]) => void;
  focus: (e: FocusEvent, info: any) => void;
  keydown: (e: KeyboardEvent, preventDefault: VoidFunction) => void;
  ok: (dates: DateType[]) => void;
  openChange: (open: boolean) => void;
  panelChange: (dates: DateType[], modes: [PickerMode, PickerMode]) => void;
  'update:value': (dates: DateType[] | null) => void;
}

const RangePicker = defineComponent<TimeRangePickerProps, TimeRangePickerEmits>(
  (props, { slots, emit, expose, attrs }) => {
    const rangeRef = shallowRef<PickerRef>();

    const onChange = (
      dates: AnyObject[] | null,
      dateStrings: [string, string],
    ) => {
      emit('update:value', dates);
      emit('change', dates, dateStrings);
    };

    const onCalendarChange = (
      dates: AnyObject[],
      dateStrings: [string, string],
      info: any,
    ) => {
      emit('calendarChange', dates, dateStrings, info);
    };

    const onPanelChange = (
      dates: AnyObject[],
      modes: [PickerMode, PickerMode],
    ) => {
      emit('panelChange', dates, modes);
    };

    const onOpenChange = (open: boolean) => {
      emit('openChange', open);
    };

    const onOk = (dates: AnyObject[]) => {
      emit('ok', dates);
    };

    const onFocus = (e: FocusEvent, info: any) => {
      emit('focus', e, info);
    };

    const onBlur = (e: FocusEvent, info: any) => {
      emit('blur', e, info);
    };

    const onKeyDown = (e: KeyboardEvent, preventDefault: VoidFunction) => {
      emit('keydown', e, preventDefault);
    };

    expose({
      focus: (options?: FocusOptions) =>
        rangeRef.value?.focus?.(options as any),
      blur: () => rangeRef.value?.blur?.(),
      nativeElement: computed(() => rangeRef.value?.nativeElement),
    });

    return () => {
      return (
        <InternalRangePicker
          {...attrs}
          {...(props as any)}
          mode={undefined}
          onBlur={onBlur}
          onCalendarChange={onCalendarChange}
          onChange={onChange}
          onFocus={onFocus}
          onKeydown={onKeyDown}
          onOk={onOk}
          onOpenChange={onOpenChange}
          onPanelChange={onPanelChange}
          picker="time"
          ref={rangeRef as any}
          v-slots={slots}
        />
      );
    };
  },
  {
    name: 'ATimeRangePicker',
    inheritAttrs: false,
  },
);

type BaseTimePickerProps = Omit<
  PickerTimeProps<AnyObject>,
  'classes' | 'onKeydown' | 'picker' | 'styles'
>;

export interface TimePickerProps
  extends
    BaseTimePickerProps,
    /* @vue-ignore */
    Omit<TimePickerEmitsProps, keyof BaseTimePickerProps> {
  addon?: () => VueNode;
  classes?: TimePickerClassNames;
  /** @deprecated Please use `classes.popup` instead */
  popupClassName?: string;
  /** @deprecated Please use `styles.popup` instead */
  popupStyle?: CSSProperties;
  rootClass?: string;

  status?: InputStatus;
  styles?: TimePickerStyles;
}

export interface TimePickerSlots {
  [key: string]: any;
  addon?: () => any;
  renderExtraFooter?: (mode: PickerMode) => any;
  suffixIcon?: () => any;
}

export interface TimePickerEmits<DateType = AnyObject> {
  blur: (e: FocusEvent, info: any) => void;
  calendarChange: (
    date: DateType | DateType[],
    dateString: string | string[],
    info: any,
  ) => void;
  change: (
    date: DateType | DateType[] | null,
    dateString: string | string[],
  ) => void;
  focus: (e: FocusEvent, info: any) => void;
  keydown: (e: KeyboardEvent, preventDefault: VoidFunction) => void;
  ok: (date: DateType | DateType[]) => void;
  openChange: (open: boolean) => void;
  panelChange: (date: DateType, mode: PickerMode) => void;
  select: (date: DateType) => void;
  'update:value': (date: DateType | DateType[] | null) => void;
}
export interface TimeRangePickerEmitsProps<DateType = AnyObject> {
  onBlur?: TimeRangePickerEmits<DateType>['blur'];
  onCalendarChange?: TimeRangePickerEmits<DateType>['calendarChange'];
  onChange?: TimeRangePickerEmits<DateType>['change'];
  onFocus?: TimeRangePickerEmits<DateType>['focus'];
  onKeydown?: TimeRangePickerEmits<DateType>['keydown'];
  onOk?: TimeRangePickerEmits<DateType>['ok'];
  onOpenChange?: TimeRangePickerEmits<DateType>['openChange'];
  onPanelChange?: TimeRangePickerEmits<DateType>['panelChange'];
  'onUpdate:value'?: TimeRangePickerEmits<DateType>['update:value'];
}

export interface TimePickerEmitsProps<DateType = AnyObject> {
  onBlur?: TimePickerEmits<DateType>['blur'];
  onCalendarChange?: TimePickerEmits<DateType>['calendarChange'];
  onChange?: TimePickerEmits<DateType>['change'];
  onFocus?: TimePickerEmits<DateType>['focus'];
  onKeydown?: TimePickerEmits<DateType>['keydown'];
  onOk?: TimePickerEmits<DateType>['ok'];
  onOpenChange?: TimePickerEmits<DateType>['openChange'];
  onPanelChange?: TimePickerEmits<DateType>['panelChange'];
  onSelect?: TimePickerEmits<DateType>['select'];
  'onUpdate:value'?: TimePickerEmits<DateType>['update:value'];
}

const TimePicker = defineComponent<
  TimePickerProps,
  TimePickerEmits,
  string,
  SlotsType<TimePickerSlots>
>(
  (props, { slots, emit, expose, attrs }) => {
    const { variant, bordered, classes, styles, popupClassName, popupStyle } =
      toPropsRefs(
        props,
        'variant',
        'bordered',
        'classes',
        'styles',
        'popupClassName',
        'popupStyle',
      );

    if (isDev) {
      const warning = devUseWarning('TimePicker');
      warning.deprecated(!props.addon, 'addon', 'renderExtraFooter');
    }

    const [mergedVariant] = useVariants('timePicker', variant, bordered);

    const mergedProps = computed(() => ({
      ...props,
      variant: mergedVariant.value,
    }));

    const [mergedClassNames, mergedStyles] =
      useMergedPickerSemantic<TimePickerProps>(
        'timePicker',
        classes,
        styles,
        popupClassName,
        popupStyle,
        mergedProps,
      );

    const pickerRef = shallowRef<PickerRef>();

    const onChange = (
      date: AnyObject | AnyObject[] | null,
      dateString: string | string[],
    ) => {
      emit('update:value', date);
      emit('change', date, dateString);
    };

    const onCalendarChange = (
      date: AnyObject | AnyObject[],
      dateString: string | string[],
      info: any,
    ) => {
      emit('calendarChange', date, dateString, info);
    };

    const onPanelChange = (date: AnyObject, mode: PickerMode) => {
      emit('panelChange', date, mode);
    };

    const onOpenChange = (open: boolean) => {
      emit('openChange', open);
    };

    const onOk = (date: AnyObject | AnyObject[]) => {
      emit('ok', date);
    };

    const onSelect = (date: AnyObject) => {
      emit('select', date);
    };

    const onFocus = (e: FocusEvent, info: any) => {
      emit('focus', e, info);
    };

    const onBlur = (e: FocusEvent, info: any) => {
      emit('blur', e, info);
    };

    const onKeyDown = (e: KeyboardEvent, preventDefault: VoidFunction) => {
      emit('keydown', e, preventDefault);
    };

    const internalRenderExtraFooter = (mode: PickerMode) => {
      const renderSlot = slots.renderExtraFooter;
      if (renderSlot) {
        return renderSlot(mode);
      }
      const renderExtraFooter = props.renderExtraFooter;
      if (renderExtraFooter) {
        return renderExtraFooter(mode);
      }
      const addonSlot = slots.addon;
      if (addonSlot) {
        return addonSlot();
      }
      const addon = props.addon;
      if (addon) {
        return addon();
      }
      return undefined;
    };

    expose({
      focus: (options?: FocusOptions) => pickerRef.value?.focus?.(options),
      blur: () => pickerRef.value?.blur?.(),
      nativeElement: computed(() => pickerRef.value?.nativeElement),
    });

    return () => {
      const {
        addon,
        renderExtraFooter,
        classes,
        styles,
        popupClassName,
        popupStyle,
        variant,
        bordered,
        ...restProps
      } = props;

      return (
        <InternalTimePicker
          {...attrs}
          {...restProps}
          classes={mergedClassNames.value as any}
          mode={undefined}
          ref={pickerRef as any}
          renderExtraFooter={internalRenderExtraFooter as any}
          styles={mergedStyles.value as any}
          variant={mergedVariant.value}
          {...({
            onChange,
            onCalendarChange,
            onPanelChange,
            onOpenChange,
            onOk,
            onSelect,
            onFocus,
            onBlur,
            onKeydown: onKeyDown,
          } as any)}
          v-slots={slots}
        />
      );
    };
  },
  {
    name: 'AsTimePicker',
    inheritAttrs: false,
  },
);

export type MergedTimePicker = typeof TimePicker & {
  _InternalPanelDoNotUseOrYouWillBeFired: any;
  RangePicker: typeof RangePicker;
};

// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(TimePicker, 'popupAlign', undefined, 'picker');
(TimePicker as MergedTimePicker)._InternalPanelDoNotUseOrYouWillBeFired =
  PurePanel;
(TimePicker as MergedTimePicker).RangePicker = RangePicker;

(TimePicker as any).install = (app: App) => {
  app.component(TimePicker.name, TimePicker);
  app.component(RangePicker.name, RangePicker);
};

export default TimePicker as MergedTimePicker;

export const TimeRangePicker = RangePicker;

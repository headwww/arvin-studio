import type { CSSProperties, HTMLAttributes } from 'vue';

import type { VueNode } from '../../util';
import type {
  CellRender,
  Components,
  InternalMode,
  Locale,
  OnPanelChange,
  PanelMode,
  PanelSemanticName,
  PickerMode,
  SharedPanelProps,
  SharedTimeProps,
} from '../interface';

import { computed, defineComponent, ref, toRef, watch } from 'vue';

import { clsx } from '@arvin-studio/kit';

import useLocale from '../hooks/useLocale';
import { fillShowTimeConfig, getTimeProps } from '../hooks/useTimeConfig';
import useToggleDates from '../hooks/useToggleDates';
import defaultLocale from '../locale/en_US';
import { usePickerContext } from '../PickerInput/context';
import useCellRender from '../PickerInput/hooks/useCellRender';
import { isSame } from '../utils/dateUtil';
import { pickProps, toArray } from '../utils/miscUtil';
import {
  providePickerHackContext,
  provideSharedPanelContext,
  usePickerHackContext,
} from './context';
// Panels
import DatePanel from './DatePanel';
import DateTimePanel from './DateTimePanel';
import DecadePanel from './DecadePanel';
import MonthPanel from './MonthPanel';
import QuarterPanel from './QuarterPanel';
import TimePanel from './TimePanel';
import WeekPanel from './WeekPanel';
import YearPanel from './YearPanel';

const DefaultComponents: any = {
  date: DatePanel,
  datetime: DateTimePanel,
  week: WeekPanel,
  month: MonthPanel,
  quarter: QuarterPanel,
  year: YearPanel,
  decade: DecadePanel,
  time: TimePanel,
};

export interface PickerPanelRef {
  nativeElement: HTMLDivElement;
}

export interface BasePickerPanelProps<DateType extends object = any>
  extends
    Pick<
      SharedPanelProps<DateType>,
      // MISC
      | 'disabledDate'
      | 'generateConfig'

      // Disabled
      | 'locale'
      | 'maxDate'
      | 'minDate'

      // Icon
      | 'nextIcon'
      | 'prevIcon'
      | 'superNextIcon'
      | 'superPrevIcon'
    >,
    Pick<HTMLAttributes, 'tabindex'>,
    SharedTimeProps<DateType> {
  // Cell
  cellRender?: CellRender<DateType>;

  // Components
  components?: Components;

  /** @deprecated use cellRender instead of dateRender */
  dateRender?: (currentDate: DateType, today: DateType) => VueNode;

  // Panel control
  defaultPickerValue?: DateType | null;
  direction?: 'ltr' | 'rtl';
  /** @private This is internal usage. Do not use in your production env */
  hideHeader?: boolean;

  /** @private Used for Picker passing */
  hoverRangeValue?: [start: DateType, end: DateType];
  // Hover
  /** @private Used for Picker passing */
  hoverValue?: DateType[];
  // Mode
  mode?: PanelMode;

  /** @deprecated use cellRender instead of monthCellRender */
  monthCellRender?: (currentDate: DateType, locale: Locale) => VueNode;

  /** @private Used for Picker passing */
  onHover?: (date: DateType) => void;

  /**
   * Compatible with origin API.
   * Not mean the PickerPanel `onChange` event.
   */
  onPanelChange?: OnPanelChange<DateType>;

  onPickerValueChange?: (date: DateType) => void;
  // Value
  onSelect?: (date: DateType) => void;

  picker?: PickerMode;
  pickerValue?: DateType | null;
  // Style
  prefixCls?: string;

  // Time
  showTime?: SharedTimeProps<DateType> | true;

  // Week
  /**
   * Only worked in `date` mode. Show the current week
   */
  showWeek?: boolean;
}

export interface SinglePickerPanelProps<
  DateType extends object = any,
> extends BasePickerPanelProps<DateType> {
  defaultValue?: DateType;

  multiple?: false;
  onChange?: (date: DateType) => void;
  value?: DateType | null;
}

export type PickerPanelProps<DateType extends object = any> =
  BasePickerPanelProps<DateType> & {
    classNames?: Partial<Record<PanelSemanticName, string>>;

    defaultValue?: DateType | DateType[] | null;
    /** multiple selection. Not support time or datetime picker */
    multiple?: boolean;
    onChange?: (date: DateType | DateType[]) => void;
    styles?: Partial<Record<PanelSemanticName, CSSProperties>>;
    value?: DateType | DateType[] | null;
  };

const PickerPanel = defineComponent<PickerPanelProps>(
  (props, { attrs }) => {
    const pickerContext = usePickerContext();
    const rootRef = ref<HTMLDivElement>();

    const mergedPrefixCls = computed(
      () =>
        pickerContext.value.prefixCls || props.prefixCls || 'headless-picker',
    );
    const mergedGenerateConfig = computed(
      () => props.generateConfig || pickerContext.value.generateConfig,
    );
    const mergedLocale = computed(
      () => props.locale || pickerContext.value.locale || defaultLocale,
    );

    // Time
    const timePropsInfo = computed(() =>
      getTimeProps({
        ...props,
        locale: mergedLocale.value,
        format: undefined,
        picker: props.picker,
      }),
    );

    const localeTimeProps = computed(() => timePropsInfo.value[1]);
    const showTimeFormat = computed(() => timePropsInfo.value[2]);
    const propFormat = computed(() => timePropsInfo.value[3]);
    const timeProps = computed(() => timePropsInfo.value[0]);

    const filledLocale = useLocale(mergedLocale, localeTimeProps);

    const internalPicker = computed<InternalMode>(() => {
      if (props.picker === 'date' && props.showTime) {
        return 'datetime';
      }
      return props.picker || 'date';
    });

    const mergedShowTime = computed(() =>
      fillShowTimeConfig(
        internalPicker.value,
        showTimeFormat.value,
        propFormat.value,
        timeProps.value,
        filledLocale.value,
      ),
    );

    const now = computed(() => mergedGenerateConfig.value?.getNow?.());

    // Mode
    const internalModeState = ref<PanelMode>(props.picker || 'date');
    const mergedMode = computed(() => props.mode || internalModeState.value);
    const setMergedMode = (m: PanelMode) => {
      internalModeState.value = m;
    };

    const internalMode = computed(() =>
      mergedMode.value === 'date' && mergedShowTime.value
        ? 'datetime'
        : mergedMode.value,
    );

    // Toggle
    const toggleDates = useToggleDates(
      mergedGenerateConfig as any,
      filledLocale,
      internalPicker,
    );

    // Value
    const internalValueState = ref(props.defaultValue);
    const innerValue = computed(() =>
      props.value === undefined ? internalValueState.value : props.value,
    );
    const setMergedValue = (val: any) => {
      internalValueState.value = val;
    };

    const mergedValue = computed(() => {
      const vals = toArray(innerValue.value).filter(Boolean);
      return props.multiple ? vals : vals.slice(0, 1);
    });

    const triggerChange = (nextValue: any[] | null) => {
      setMergedValue(nextValue);

      if (
        props.onChange &&
        (nextValue === null ||
          mergedValue.value.length !== nextValue.length ||
          mergedValue.value.some(
            (ori, index) =>
              !isSame(
                mergedGenerateConfig.value,
                filledLocale.value,
                ori,
                nextValue[index],
                internalPicker.value,
              ),
          ))
      ) {
        props.onChange(props.multiple ? nextValue : nextValue?.[0]);
      }
    };

    const onInternalSelect = (newDate: any) => {
      props.onSelect?.(newDate);

      if (mergedMode.value === props.picker) {
        const nextValues = props.multiple
          ? toggleDates(mergedValue.value, newDate)
          : [newDate];
        triggerChange(nextValues);
      }
    };

    // PickerValue
    const internalPickerValueState = ref(
      props.defaultPickerValue || mergedValue.value[0] || now.value,
    );
    const mergedPickerValue = computed(() =>
      props.pickerValue === undefined
        ? internalPickerValueState.value
        : props.pickerValue,
    );
    const setInternalPickerValue = (val: any) => {
      internalPickerValueState.value = val;
    };

    watch(
      () => mergedValue.value[0],
      (val) => {
        if (val && props.pickerValue === undefined) {
          setInternalPickerValue(val);
        }
      },
    );

    const triggerPanelChange = (viewDate?: any, nextMode?: PanelMode) => {
      props.onPanelChange?.(
        viewDate || mergedPickerValue.value,
        nextMode || mergedMode.value,
      );
    };

    const setPickerValue = (
      nextPickerValue: any,
      triggerPanelEvent = false,
    ) => {
      setInternalPickerValue(nextPickerValue);
      props.onPickerValueChange?.(nextPickerValue);
      if (triggerPanelEvent) {
        triggerPanelChange(nextPickerValue);
      }
    };

    const triggerModeChange = (nextMode: PanelMode, viewDate?: any) => {
      setMergedMode(nextMode);
      if (viewDate) {
        setPickerValue(viewDate);
      }
      triggerPanelChange(viewDate, nextMode);
    };

    const onPanelValueSelect = (nextValue: any) => {
      onInternalSelect(nextValue);
      setPickerValue(nextValue);

      if (mergedMode.value !== props.picker) {
        const decadeYearQueue: PanelMode[] = ['decade', 'year'];
        const decadeYearMonthQueue: PanelMode[] = [...decadeYearQueue, 'month'];

        const pickerQueue: Partial<Record<PickerMode, PanelMode[]>> = {
          quarter: [...decadeYearQueue, 'quarter'],
          week: [...decadeYearMonthQueue, 'week'],
          date: [...decadeYearMonthQueue, 'date'],
        };

        const queue =
          pickerQueue[props.picker || 'date'] || decadeYearMonthQueue;
        const index = queue.indexOf(mergedMode.value);
        const nextMode = queue[index + 1];

        if (nextMode) {
          triggerModeChange(nextMode, nextValue);
        }
      }
    };

    // Hover Date
    const hoverRangeDate = computed(() => {
      let start: any;
      let end: any;

      if (Array.isArray(props.hoverRangeValue)) {
        [start, end] = props.hoverRangeValue;
      } else {
        start = props.hoverRangeValue;
      }

      if (!start && !end) {
        return null;
      }

      start ||= end;
      end ||= start;

      return mergedGenerateConfig.value.isAfter(start, end)
        ? [end, start]
        : [start, end];
    });

    // CellRender
    const onInternalCellRender = useCellRender(
      toRef(props, 'cellRender'),
      toRef(props, 'dateRender') as any,
      toRef(props, 'monthCellRender') as any,
    );

    // Shared Context
    const sharedPanelContext = computed(() => ({
      classNames:
        pickerContext.value.classNames?.popup ?? props.classNames ?? {},
      styles: pickerContext.value.styles?.popup ?? props.styles ?? {},
    }));

    provideSharedPanelContext(sharedPanelContext);

    const parentHackContext = usePickerHackContext();
    const pickerPanelContext = computed(() => ({
      ...parentHackContext?.value,
      hideHeader: props.hideHeader,
    }));

    providePickerHackContext(pickerPanelContext);

    return () => {
      const PanelComponent = (props.components?.[internalMode.value] ||
        DefaultComponents[internalMode.value] ||
        DatePanel) as any;

      const panelCls = `${mergedPrefixCls.value}-panel`;

      const panelProps = pickProps(props, [
        'showWeek',
        'prevIcon',
        'nextIcon',
        'superPrevIcon',
        'superNextIcon',
        'disabledDate',
        'minDate',
        'maxDate',
        'onHover',
      ]);
      return (
        <div
          class={clsx(panelCls, {
            [`${panelCls}-rtl`]: props.direction === 'rtl',
          })}
          ref={rootRef}
          tabindex={props.tabindex}
          {...attrs}
        >
          <PanelComponent
            {...panelProps}
            cellRender={onInternalCellRender}
            generateConfig={mergedGenerateConfig.value}
            hoverRangeValue={hoverRangeDate.value}
            hoverValue={props.hoverValue}
            locale={filledLocale.value}
            onModeChange={triggerModeChange}
            onPickerValueChange={(nextPickerValue: any) => {
              setPickerValue(nextPickerValue, true);
            }}
            onSelect={onPanelValueSelect}
            pickerValue={mergedPickerValue.value}
            prefixCls={mergedPrefixCls.value}
            showTime={mergedShowTime.value}
            value={mergedValue.value[0]}
            values={mergedValue.value}
          />
        </div>
      );
    };
  },
  {
    name: 'PickerPanel',
    inheritAttrs: false,
  },
);

export default PickerPanel;

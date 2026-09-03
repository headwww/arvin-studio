import type { CSSProperties, Ref } from 'vue';

import type { GenerateConfig, Locale } from '@arvin-studio/headless';

import type { CalendarMode, SelectInfo } from './generateCalendar';

import { computed, defineComponent, ref } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import {
  useFormItemInputContext,
  useFormItemInputContextProvider,
} from '../form/context';
import { RadioButton, RadioGroup } from '../radio';
import Select from '../select';

const YEAR_SELECT_OFFSET = 10;
const YEAR_SELECT_TOTAL = 20;

interface SharedProps<DateType> {
  divRef: Ref<HTMLDivElement | null>;
  fullscreen: boolean;
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  onChange: (year: DateType) => void;
  prefixCls: string;
  validRange?: [DateType, DateType];
  value: DateType;
}

const YearSelect = defineComponent<SharedProps<any>>(
  (props) => {
    return () => {
      const {
        fullscreen,
        validRange,
        generateConfig,
        locale,
        prefixCls,
        value,
        onChange,
        divRef,
      } = props;
      const year = generateConfig.getYear(value || generateConfig.getNow());

      let start = year - YEAR_SELECT_OFFSET;
      let end = start + YEAR_SELECT_TOTAL;

      if (validRange) {
        start = generateConfig.getYear(validRange[0]);
        end = generateConfig.getYear(validRange[1]) + 1;
      }

      const suffix = locale && locale.year === '年' ? '年' : '';
      const options: { label: string; value: number }[] = [];
      for (let index = start; index < end; index += 1) {
        options.push({ label: `${index}${suffix}`, value: index });
      }

      return (
        <Select
          class={`${prefixCls}-year-select`}
          getPopupContainer={() => divRef.value!}
          onChange={(numYear: any) => {
            let newDate = generateConfig.setYear(value, numYear);

            if (validRange) {
              const [startDate, endDate] = validRange;
              const newYear = generateConfig.getYear(newDate);
              const newMonth = generateConfig.getMonth(newDate);
              if (
                newYear === generateConfig.getYear(endDate) &&
                newMonth > generateConfig.getMonth(endDate)
              ) {
                newDate = generateConfig.setMonth(
                  newDate,
                  generateConfig.getMonth(endDate),
                );
              }
              if (
                newYear === generateConfig.getYear(startDate) &&
                newMonth < generateConfig.getMonth(startDate)
              ) {
                newDate = generateConfig.setMonth(
                  newDate,
                  generateConfig.getMonth(startDate),
                );
              }
            }

            onChange(newDate);
          }}
          options={options}
          size={fullscreen ? undefined : 'small'}
          value={year}
        />
      );
    };
  },
  {
    name: 'YearSelect',
    inheritAttrs: false,
  },
);

const MonthSelect = defineComponent<SharedProps<any>>(
  (props) => {
    return () => {
      const {
        prefixCls,
        fullscreen,
        validRange,
        value,
        generateConfig,
        locale,
        onChange,
        divRef,
      } = props;
      const month = generateConfig.getMonth(value || generateConfig.getNow());

      let start = 0;
      let end = 11;

      if (validRange) {
        const [rangeStart, rangeEnd] = validRange;
        const currentYear = generateConfig.getYear(value);
        if (generateConfig.getYear(rangeEnd) === currentYear) {
          end = generateConfig.getMonth(rangeEnd);
        }
        if (generateConfig.getYear(rangeStart) === currentYear) {
          start = generateConfig.getMonth(rangeStart);
        }
      }

      const months =
        locale.shortMonths ||
        generateConfig.locale.getShortMonths!(locale.locale);
      const options: { label: string; value: number }[] = [];
      for (let index = start; index <= end; index += 1) {
        options.push({
          label: months[index!]!,
          value: index,
        });
      }

      return (
        <Select
          class={`${prefixCls}-month-select`}
          getPopupContainer={() => divRef.value!}
          onChange={(newMonth: any) => {
            onChange(generateConfig.setMonth(value, newMonth));
          }}
          options={options}
          size={fullscreen ? undefined : 'small'}
          value={month}
        />
      );
    };
  },
  {
    name: 'MonthSelect',
    inheritAttrs: false,
  },
);

interface ModeSwitchProps<DateType> extends Omit<
  SharedProps<DateType>,
  'onChange'
> {
  mode: CalendarMode;
  onModeChange: (type: CalendarMode) => void;
}

const ModeSwitch = defineComponent<ModeSwitchProps<any>>(
  (props) => {
    return () => {
      const { prefixCls, locale, mode, fullscreen, onModeChange } = props;
      return (
        <RadioGroup
          class={`${prefixCls}-mode-switch`}
          onChange={(e: any) => {
            onModeChange(e.target.value);
          }}
          optionType="button"
          size={fullscreen ? undefined : 'small'}
          value={mode}
        >
          <RadioButton value="month">{locale.month}</RadioButton>
          <RadioButton value="year">{locale.year}</RadioButton>
        </RadioGroup>
      );
    };
  },
  {
    name: 'ModeSwitch',
    inheritAttrs: false,
  },
);

export interface CalendarHeaderProps<DateType> {
  className?: string;
  fullscreen: boolean;
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  mode: CalendarMode;
  onChange: (date: DateType, source: SelectInfo['source']) => void;
  onModeChange: (mode: CalendarMode) => void;
  prefixCls: string;
  style?: CSSProperties;
  validRange?: [DateType, DateType];
  value: DateType;
}

const CalendarHeader = defineComponent<CalendarHeaderProps<any>>(
  (props) => {
    const divRef = ref<HTMLDivElement | null>(null);

    const formItemInputContext = useFormItemInputContext();
    const mergedFormItemInputContext = computed(() => ({
      ...formItemInputContext.value,
      isFormItemInput: false,
    }));

    useFormItemInputContextProvider(mergedFormItemInputContext);

    return () => {
      const {
        prefixCls,
        fullscreen,
        mode,
        onChange,
        onModeChange,
        className,
        style,
      } = props;

      const sharedProps = {
        ...props,
        fullscreen,
        divRef,
      };

      return (
        <div
          class={clsx(`${prefixCls}-header`, className)}
          ref={divRef}
          style={style}
        >
          <YearSelect
            {...omit(sharedProps, ['onChange', 'onModeChange'])}
            onChange={(value) => {
              onChange(value, 'year');
            }}
          />
          {mode === 'month' ? (
            <MonthSelect
              {...omit(sharedProps, ['onChange', 'onModeChange'])}
              onChange={(value) => {
                onChange(value, 'month');
              }}
            />
          ) : null}
          <ModeSwitch
            {...omit(sharedProps, ['onChange', 'onModeChange'])}
            onModeChange={onModeChange}
          />
        </div>
      );
    };
  },
  {
    name: 'AsCalendarHeader',
  },
);

export default CalendarHeader;

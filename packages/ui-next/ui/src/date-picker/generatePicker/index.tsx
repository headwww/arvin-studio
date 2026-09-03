import type { PickerGenerateConfig as GenerateConfig } from '@arvin-studio/headless';

import type { AnyObject } from '../../_util';

import generateRangePicker from './generateRangePicker';
import generateSinglePicker from './generateSinglePicker';

export type {
  GenericTimePickerProps,
  PickerLocale,
  PickerProps,
  PickerPropsWithMultiple,
  RangePickerProps,
} from './interface';

function generatePicker<DateType extends AnyObject = AnyObject>(
  generateConfig: GenerateConfig<DateType>,
) {
  const {
    DatePicker,
    WeekPicker,
    MonthPicker,
    YearPicker,
    TimePicker,
    QuarterPicker,
  } = generateSinglePicker(generateConfig);

  const RangePicker = generateRangePicker(generateConfig);

  type MergedDatePickerType = typeof DatePicker & {
    MonthPicker: typeof MonthPicker;
    QuarterPicker: typeof QuarterPicker;
    RangePicker: typeof RangePicker;
    TimePicker: typeof TimePicker;
    WeekPicker: typeof WeekPicker;
    YearPicker: typeof YearPicker;
  };

  const MergedDatePicker = DatePicker as MergedDatePickerType;

  MergedDatePicker.WeekPicker = WeekPicker;
  MergedDatePicker.MonthPicker = MonthPicker;
  MergedDatePicker.YearPicker = YearPicker;
  MergedDatePicker.RangePicker = RangePicker;
  MergedDatePicker.TimePicker = TimePicker;
  MergedDatePicker.QuarterPicker = QuarterPicker;

  return MergedDatePicker;
}

export default generatePicker;

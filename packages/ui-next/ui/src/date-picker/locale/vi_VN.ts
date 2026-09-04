import type { PickerLocale } from '../generatePicker';

import { Picker_vi_Vn as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/vi_VN';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Chọn thời điểm',
    yearPlaceholder: 'Chọn năm',
    quarterPlaceholder: 'Chọn quý',
    monthPlaceholder: 'Chọn tháng',
    weekPlaceholder: 'Chọn tuần',
    rangePlaceholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
    rangeYearPlaceholder: ['Năm bắt đầu', 'Năm kết thúc'],
    rangeQuarterPlaceholder: ['Quý bắt đầu', 'Quý kết thúc'],
    rangeMonthPlaceholder: ['Tháng bắt đầu', 'Tháng kết thúc'],
    rangeWeekPlaceholder: ['Tuần bắt đầu', 'Tuần kết thúc'],
    shortMonths: [
      'Th 01',
      'Th 02',
      'Th 03',
      'Th 04',
      'Th 05',
      'Th 06',
      'Th 07',
      'Th 08',
      'Th 09',
      'Th 10',
      'Th 11',
      'Th 12',
    ],
    shortWeekDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

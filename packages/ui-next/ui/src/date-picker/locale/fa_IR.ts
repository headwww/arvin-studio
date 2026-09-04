import type { PickerLocale } from '../generatePicker';

import { Picker_fa_Ir as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/fa_IR';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'انتخاب تاریخ',
    yearPlaceholder: 'انتخاب سال',
    quarterPlaceholder: 'انتخاب فصل',
    monthPlaceholder: 'انتخاب ماه',
    weekPlaceholder: 'انتخاب هفته',
    rangePlaceholder: ['تاریخ شروع', 'تاریخ پایان'],
    rangeYearPlaceholder: ['سال شروع', 'سال پایان'],
    rangeQuarterPlaceholder: ['فصل شروع', 'فصل پایان'],
    rangeMonthPlaceholder: ['ماه شروع', 'ماه پایان'],
    rangeWeekPlaceholder: ['هفته شروع', 'هفته پایان'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

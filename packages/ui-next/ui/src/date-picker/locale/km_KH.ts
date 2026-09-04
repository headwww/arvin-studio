import type { PickerLocale } from '../generatePicker';

import { Picker_km_Kh as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/km_KH';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'រើសថ្ងៃ',
    yearPlaceholder: 'រើសឆ្នាំ',
    quarterPlaceholder: 'រើសត្រីមាស',
    monthPlaceholder: 'រើសខែ',
    weekPlaceholder: 'រើសសប្តាហ៍',
    rangePlaceholder: ['ថ្ងៃចាប់ផ្ដើម', 'ថ្ងៃបញ្ចប់'],
    rangeYearPlaceholder: ['ឆ្នាំចាប់ផ្ដើម', 'ឆ្នាំបញ្ចប់'],
    rangeMonthPlaceholder: ['ខែចាប់ផ្ដើម', 'ខែបញ្ចប់'],
    rangeWeekPlaceholder: ['សប្ដាហ៍ចាប់ផ្ដើម', 'សប្ដាហ៍បញ្ចប់'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

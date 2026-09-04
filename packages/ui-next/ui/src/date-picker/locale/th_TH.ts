import type { PickerLocale } from '../generatePicker';

import { Picker_th_Th as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/th_TH';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'เลือกวันที่',
    yearPlaceholder: 'เลือกปี',
    quarterPlaceholder: 'เลือกไตรมาส',
    monthPlaceholder: 'เลือกเดือน',
    weekPlaceholder: 'เลือกสัปดาห์',
    rangePlaceholder: ['วันเริ่มต้น', 'วันสิ้นสุด'],
    rangeYearPlaceholder: ['ปีเริ่มต้น', 'ปีสิ้นสุด'],
    rangeMonthPlaceholder: ['เดือนเริ่มต้น', 'เดือนสิ้นสุด'],
    rangeWeekPlaceholder: ['สัปดาห์เริ่มต้น', 'สัปดาห์สิ้นสุด'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

import type { PickerLocale } from '../generatePicker';

import { Picker_ur_Pk as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/ur_PK';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'تاریخ منتخب کریں',
    yearPlaceholder: 'سال کو منتخب کریں',
    quarterPlaceholder: 'کوارٹر منتخب کریں',
    monthPlaceholder: 'ماہ منتخب کریں',
    weekPlaceholder: 'ہفتہ منتخب کریں',
    rangePlaceholder: ['شروع کرنے کی تاریخ', 'آخری تاریخ'],
    rangeYearPlaceholder: ['آغاز سال', 'آخر سال'],
    rangeMonthPlaceholder: ['مہینہ شروع', 'اختتامی مہینہ'],
    rangeWeekPlaceholder: ['ہفتے شروع کریں', 'اختتام ہفتہ'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

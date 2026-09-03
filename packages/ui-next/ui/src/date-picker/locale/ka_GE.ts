import type { PickerLocale } from '../generatePicker';

import { Picker_ka_Ge as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/ka_GE';

const locale: PickerLocale = {
  lang: {
    placeholder: 'აირჩიეთ თარიღი',
    yearPlaceholder: 'აირჩიეთ წელი',
    quarterPlaceholder: 'აირჩიეთ მეოთხედი',
    monthPlaceholder: 'აირჩიეთ თვე',
    weekPlaceholder: 'აირჩიეთ კვირა',
    rangePlaceholder: ['საწყისი თარიღი', 'საბოლოო თარიღი'],
    rangeYearPlaceholder: ['საწყისი წელი', 'საბოლოო წელი'],
    rangeMonthPlaceholder: ['საწყისი თვე', 'საბოლოო თვე'],
    rangeWeekPlaceholder: ['საწყისი კვირა', 'საბოლოო კვირა'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

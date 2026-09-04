import type { PickerLocale } from '../generatePicker';

import { Picker_kk_Kz as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/kk_KZ';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Күнді таңдаңыз',
    yearPlaceholder: 'Жылды таңдаңыз',
    quarterPlaceholder: 'Тоқсанды таңдаңыз',
    monthPlaceholder: 'Айды таңдаңыз',
    weekPlaceholder: 'Аптаны таңдаңыз',
    rangePlaceholder: ['Бастау күні', 'Аяқталу күні'],
    rangeYearPlaceholder: ['Бастау жылы', 'Аяқталу жылы'],
    rangeMonthPlaceholder: ['Бастау айы', 'Аяқталу айы'],
    rangeWeekPlaceholder: ['Бастау апта', 'Аяқталу апта'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

import type { PickerLocale } from '../generatePicker';

import { Picker_lt_Lt as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/lt_LT';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Pasirinkite datą',
    yearPlaceholder: 'Pasirinkite metus',
    quarterPlaceholder: 'Pasirinkite ketvirtį',
    monthPlaceholder: 'Pasirinkite mėnesį',
    weekPlaceholder: 'Pasirinkite savaitę',
    rangePlaceholder: ['Pradžios data', 'Pabaigos data'],
    rangeYearPlaceholder: ['Pradžios metai', 'Pabaigos metai'],
    rangeQuarterPlaceholder: ['Pradžios ketvirtis', 'Pabaigos ketvirtis'],
    rangeMonthPlaceholder: ['Pradžios mėnesis', 'Pabaigos mėnesis'],
    rangeWeekPlaceholder: ['Pradžios savaitė', 'Pabaigos savaitė'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

import type { PickerLocale } from '../generatePicker';

import { Picker_pl_Pl as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/pl_PL';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Wybierz datę',
    rangePlaceholder: ['Data początkowa', 'Data końcowa'],
    yearFormat: 'YYYY',
    monthFormat: 'MMMM',
    monthBeforeYear: true,
    shortWeekDays: ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'],
    shortMonths: [
      'Sty',
      'Lut',
      'Mar',
      'Kwi',
      'Maj',
      'Cze',
      'Lip',
      'Sie',
      'Wrz',
      'Paź',
      'Lis',
      'Gru',
    ],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;

import type { PickerLocale } from '../generatePicker';

import { Picker_de_De as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/de_DE';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Datum auswählen',
    rangePlaceholder: ['Startdatum', 'Enddatum'],
    shortWeekDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    shortMonths: [
      'Jan',
      'Feb',
      'Mär',
      'Apr',
      'Mai',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Okt',
      'Nov',
      'Dez',
    ],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

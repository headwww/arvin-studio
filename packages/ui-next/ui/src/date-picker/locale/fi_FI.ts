import type { PickerLocale } from '../generatePicker';

import { Picker_fi_Fi as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/fi_FI';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Valitse päivä',
    rangePlaceholder: ['Alkamispäivä', 'Päättymispäivä'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

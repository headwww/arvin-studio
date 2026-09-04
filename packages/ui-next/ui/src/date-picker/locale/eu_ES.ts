import type { PickerLocale } from '../generatePicker';

import { Picker_eu_Es as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/eu_ES';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Hautatu data',
    rangePlaceholder: ['Hasierako data', 'Amaiera data'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

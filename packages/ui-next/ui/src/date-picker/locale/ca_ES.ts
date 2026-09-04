import type { PickerLocale } from '../generatePicker';

import { Picker_ca_Es as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/ca_ES';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Seleccionar data',
    rangePlaceholder: ['Data inicial', 'Data final'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

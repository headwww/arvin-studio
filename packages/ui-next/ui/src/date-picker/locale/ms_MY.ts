import type { PickerLocale } from '../generatePicker';

import { Picker_ms_My as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/ms_MY';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Pilih tarikh',
    rangePlaceholder: ['Tarikh mula', 'Tarikh akhir'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

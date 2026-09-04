import type { PickerLocale } from '../generatePicker';

import { Picker_cs_Cz as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/cs_CZ';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Vybrat datum',
    rangePlaceholder: ['Od', 'Do'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

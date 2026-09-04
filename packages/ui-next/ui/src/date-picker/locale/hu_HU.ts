import type { PickerLocale } from '../generatePicker';

import { Picker_hu_Hu as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/hu_HU';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Válasszon dátumot',
    rangePlaceholder: ['Kezdő dátum', 'Befejezés dátuma'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

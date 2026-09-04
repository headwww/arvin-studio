import type { PickerLocale } from '../generatePicker';

import { Picker_is_Is as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/is_IS';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Veldu dag',
    rangePlaceholder: ['Upphafsdagur', 'Lokadagur'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

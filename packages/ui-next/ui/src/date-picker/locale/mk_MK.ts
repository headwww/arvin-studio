import type { PickerLocale } from '../generatePicker';

import { Picker_mk_Mk as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/mk_MK';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Избери датум',
    rangePlaceholder: ['Од датум', 'До датум'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

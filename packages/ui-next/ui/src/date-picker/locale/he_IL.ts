import type { PickerLocale } from '../generatePicker';

import { Picker_he_Il as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/he_IL';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'בחר תאריך',
    rangePlaceholder: ['תאריך התחלה', 'תאריך סיום'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;

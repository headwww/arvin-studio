import type { PickerLocale } from '../generatePicker';

import { Picker_gl_Es as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/gl_ES';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Escolla data',
    rangePlaceholder: ['Data inicial', 'Data final'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;

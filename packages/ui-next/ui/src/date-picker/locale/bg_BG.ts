import type { PickerLocale } from '../generatePicker';

import { Picker_bg_Bg as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/bg_BG';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Избор на дата',
    rangePlaceholder: ['Начална', 'Крайна'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;

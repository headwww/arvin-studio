import type { PickerLocale } from '../generatePicker';

import { Picker_mn_Mn as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/mn_MN';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Огноо сонгох',
    rangePlaceholder: ['Эхлэх огноо', 'Дуусах огноо'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

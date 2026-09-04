import type { PickerLocale } from '../generatePicker';

import { Picker_sk_Sk as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/sk_SK';

// 统一合并为完整的 Locale
const locale: PickerLocale = {
  lang: {
    placeholder: 'Vybrať dátum',
    rangePlaceholder: ['Od', 'Do'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

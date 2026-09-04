import type { PickerLocale } from '../generatePicker';

import { Picker_et_Ee as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/et_EE';

// 统一合并为完整的 Locale
const locale: PickerLocale = {
  lang: {
    placeholder: 'Vali kuupäev',
    rangePlaceholder: ['Algus kuupäev', 'Lõpu kuupäev'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

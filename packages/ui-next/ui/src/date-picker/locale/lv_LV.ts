import type { PickerLocale } from '../generatePicker';

import { Picker_lv_Lv as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/lv_LV';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Izvēlieties datumu',
    rangePlaceholder: ['Sākuma datums', 'Beigu datums'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

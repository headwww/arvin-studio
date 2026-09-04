import type { PickerLocale } from '../generatePicker';

import { Picker_kmr_Iq as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/kmr_IQ';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Dîrok hilbijêre',
    rangePlaceholder: ['Dîroka destpêkê', 'Dîroka dawîn'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

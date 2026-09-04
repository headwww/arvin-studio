import type { PickerLocale } from '../generatePicker';

import { Picker_it_It as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/it_IT';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Selezionare la data',
    rangePlaceholder: ["Data d'inizio", 'Data di fine'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

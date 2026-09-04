import type { PickerLocale } from '../generatePicker';

import { Picker_pt_Br as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/pt_BR';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Selecionar data',
    rangePlaceholder: ['Data inicial', 'Data final'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

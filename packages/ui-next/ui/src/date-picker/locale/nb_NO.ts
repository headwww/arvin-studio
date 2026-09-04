import type { PickerLocale } from '../generatePicker';

import { Picker_nb_No as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/nb_NO';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Velg dato',
    yearPlaceholder: 'Velg år',
    quarterPlaceholder: 'Velg kvartal',
    monthPlaceholder: 'Velg måned',
    weekPlaceholder: 'Velg uke',
    rangePlaceholder: ['Startdato', 'Sluttdato'],
    rangeYearPlaceholder: ['Startår', 'Sluttår'],
    rangeMonthPlaceholder: ['Startmåned', 'Sluttmåned'],
    rangeWeekPlaceholder: ['Start uke', 'Sluttuke'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

import type { PickerLocale } from '../generatePicker';

import { Picker_fr_Ca as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/fr_CA';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Sélectionner une date',
    yearPlaceholder: 'Sélectionner une année',
    quarterPlaceholder: 'Sélectionner un trimestre',
    monthPlaceholder: 'Sélectionner un mois',
    weekPlaceholder: 'Sélectionner une semaine',
    rangePlaceholder: ['Date de début', 'Date de fin'],
    rangeYearPlaceholder: ['Année de début', 'Année de fin'],
    rangeMonthPlaceholder: ['Mois de début', 'Mois de fin'],
    rangeWeekPlaceholder: ['Semaine de début', 'Semaine de fin'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

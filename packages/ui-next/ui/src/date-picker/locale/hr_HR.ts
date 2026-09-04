import type { PickerLocale } from '../generatePicker';

import { Picker_hr_Hr as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/hr_HR';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Odaberite datum',
    yearPlaceholder: 'Odaberite godinu',
    quarterPlaceholder: 'Odaberite četvrtinu',
    monthPlaceholder: 'Odaberite mjesec',
    weekPlaceholder: 'Odaberite tjedan',
    rangePlaceholder: ['Početni datum', 'Završni datum'],
    rangeYearPlaceholder: ['Početna godina', 'Završna godina'],
    rangeMonthPlaceholder: ['Početni mjesec', 'Završni mjesec'],
    rangeWeekPlaceholder: ['Početni tjedan', 'Završni tjedan'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

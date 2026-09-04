import type { PickerLocale } from '../generatePicker';

import { Picker_mr_In as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/mr_IN';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'दिनांक निवडा',
    yearPlaceholder: 'वर्ष निवडा',
    quarterPlaceholder: 'तिमाही निवडा',
    monthPlaceholder: 'महिना निवडा',
    weekPlaceholder: 'आठवडा निवडा',
    rangePlaceholder: ['प्रारंभ तारीख', 'शेवटची तारीख'],
    rangeYearPlaceholder: ['प्रारंभ वर्ष', 'शेवटचे वर्ष'],
    rangeQuarterPlaceholder: ['सुरुवातीचा तिमाही', 'शेवटचा तिमाही'],
    rangeMonthPlaceholder: ['सुरुवातीचा महिना', 'शेवटचा महिना'],
    rangeWeekPlaceholder: ['सुरुवातीचा आठवडा', 'शेवटचा आठवडा'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

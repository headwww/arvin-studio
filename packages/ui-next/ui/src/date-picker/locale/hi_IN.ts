import type { PickerLocale } from '../generatePicker';

import { Picker_hi_In as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/hi_IN';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'तारीख़ चुनें',
    yearPlaceholder: 'वर्ष चुनें',
    quarterPlaceholder: 'तिमाही चुनें',
    monthPlaceholder: 'महीना चुनिए',
    weekPlaceholder: 'सप्ताह चुनें',
    rangePlaceholder: ['प्रारंभ तिथि', 'समाप्ति तिथि'],
    rangeYearPlaceholder: ['आरंभिक वर्ष', 'अंत वर्ष'],
    rangeMonthPlaceholder: ['आरंभिक महीना', 'अंत महीना'],
    rangeWeekPlaceholder: ['आरंभिक सप्ताह', 'अंत सप्ताह'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

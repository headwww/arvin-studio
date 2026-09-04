import type { PickerLocale } from '../generatePicker';

import { Picker_si_Lk as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/si_LK';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'දිනය තෝරන්න',
    yearPlaceholder: 'අවුරුද්ද තෝරන්න',
    quarterPlaceholder: 'කාර්තුව තෝරන්න',
    monthPlaceholder: 'මාසය තෝරන්න',
    weekPlaceholder: 'සතිය තෝරන්න',
    rangePlaceholder: ['ආරම්භක දිනය', 'නිමවන දිනය'],
    rangeYearPlaceholder: ['ආර්ම්භක අවුරුද්ද', 'නිමවන අවුරුද්ද'],
    rangeQuarterPlaceholder: ['ආරම්භක කාර්තුව', 'නිමවන කාර්තුව'],
    rangeMonthPlaceholder: ['ආරම්භක මාසය', 'නිමවන මාසය'],
    rangeWeekPlaceholder: ['ආරම්භක සතිය', 'නිමවන සතිය'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

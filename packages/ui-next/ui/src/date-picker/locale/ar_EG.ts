import type { PickerLocale } from '../generatePicker';

import { Picker_ar_Eg as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/ar_EG';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'اختيار التاريخ',
    rangePlaceholder: ['البداية', 'النهاية'],
    yearFormat: 'YYYY',
    monthFormat: 'MMMM',
    monthBeforeYear: true,
    shortWeekDays: [
      'الأحد',
      'الإثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ],
    shortMonths: [
      'يناير',
      'فبراير',
      'مارس',
      'إبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;

import type { PickerLocale } from '../generatePicker';

// Tamil Locale added to rc-calendar
import { Picker_ta_In as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/ta_IN';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'தேதியைத் தேர்ந்தெடுக்கவும்',
    rangePlaceholder: ['தொடக்க தேதி', 'கடைசி தேதி'],
    quarterPlaceholder: 'காலாண்டைத் தேர்ந்தெடுக்கவும்',
    monthPlaceholder: 'மாதத்தைத் தேர்ந்தெடுக்கவும்',
    weekPlaceholder: 'வாரத்தைத் தேர்ந்தெடுக்கவும்',
    rangeYearPlaceholder: ['தொடக்க ஆண்டு', 'இறுதி ஆண்டு'],
    rangeQuarterPlaceholder: ['காலாண்டு தொடக்கம்', 'இறுதி காலாண்டு'],
    rangeMonthPlaceholder: ['தொடக்க மாதம்', 'இறுதி மாதம்'],
    rangeWeekPlaceholder: ['வாரம் தொடங்கு', 'இறுதி வாரம்'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

export default locale;

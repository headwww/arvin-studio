import type { PickerLocale } from '../generatePicker';

import { Picker_pt_Pt as CalendarLocale } from '@arvin-studio/headless';

import TimePickerLocale from '../../time-picker/locale/pt_PT';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    ...CalendarLocale,
    placeholder: 'Data',
    rangePlaceholder: ['Data inicial', 'Data final'],
    today: 'Hoje',
    now: 'Agora',
    backToToday: 'Hoje',
    ok: 'OK',
    clear: 'Limpar',
    month: 'Mês',
    year: 'Ano',
    timeSelect: 'Hora',
    dateSelect: 'Selecionar data',
    monthSelect: 'Selecionar mês',
    yearSelect: 'Selecionar ano',
    decadeSelect: 'Selecionar década',
    yearFormat: 'YYYY',
    monthFormat: 'MMMM',
    monthBeforeYear: false,
    previousMonth: 'Mês anterior (PageUp)',
    nextMonth: 'Mês seguinte (PageDown)',
    previousYear: 'Ano anterior (Control + left)',
    nextYear: 'Ano seguinte (Control + right)',
    previousDecade: 'Última década',
    nextDecade: 'Próxima década',
    previousCentury: 'Último século',
    nextCentury: 'Próximo século',
  },
  timePickerLocale: {
    ...TimePickerLocale,
    placeholder: 'Hora',
  },
};

export default locale;

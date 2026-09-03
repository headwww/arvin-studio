import type { Dayjs } from 'dayjs';

import type { App } from 'vue';

import { dayjsGenerateConfig } from '@arvin-studio/headless';

import generateCalendar from './generateCalendar';

const Calendar = generateCalendar<Dayjs>(dayjsGenerateConfig);

export type CalendarType = typeof Calendar & {
  generateCalendar: typeof generateCalendar;
};

(Calendar as CalendarType).generateCalendar = generateCalendar;

(Calendar as any).install = (app: App) => {
  app.component(Calendar.name, Calendar);
};

export default Calendar as CalendarType;

export { type CalendarMode, type CalendarProps } from './generateCalendar';

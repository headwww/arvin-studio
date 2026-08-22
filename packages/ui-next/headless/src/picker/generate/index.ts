export interface GenerateConfig<DateType> {
  addDate: (value: DateType, diff: number) => DateType;
  addMonth: (value: DateType, diff: number) => DateType;
  // Set
  addYear: (value: DateType, diff: number) => DateType;
  getDate: (value: DateType) => number;
  getEndDate: (value: DateType) => DateType;
  getFixedDate: (fixed: string) => DateType;
  getHour: (value: DateType) => number;
  getMillisecond: (value: DateType) => number;
  getMinute: (value: DateType) => number;
  getMonth: (value: DateType) => number;
  getNow: () => DateType;

  getSecond: (value: DateType) => number;
  // Get
  getWeekDay: (value: DateType) => number;
  getYear: (value: DateType) => number;
  // Compare
  isAfter: (date1: DateType, date2: DateType) => boolean;
  isValidate: (date: DateType) => boolean;
  locale: {
    format: (locale: string, date: DateType, format: string) => null | string;
    /** A proxy for getting locale with moment or other locale library */
    getShortMonths?: (locale: string) => string[];
    /** A proxy for getting locale with moment or other locale library */
    getShortWeekDays?: (locale: string) => string[];

    getWeek: (locale: string, value: DateType) => number;

    getWeekFirstDate: (locale: string, value: DateType) => DateType;

    getWeekFirstDay: (locale: string) => number | undefined;
    /** Should only return validate date instance */
    parse: (locale: string, text: string, formats: string[]) => DateType | null;
  };
  setDate: (value: DateType, date: number) => DateType;
  setHour: (value: DateType, hour: number) => DateType;
  setMillisecond: (value: DateType, millisecond: number) => DateType;
  setMinute: (value: DateType, minute: number) => DateType;

  setMonth: (value: DateType, month: number) => DateType;
  setSecond: (value: DateType, second: number) => DateType;

  setYear: (value: DateType, year: number) => DateType;
}

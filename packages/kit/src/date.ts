import getDateDiff from './getDateDiff';
import getDayOfMonth from './getDayOfMonth';
import getDayOfQuarter from './getDayOfQuarter';
import getDayOfYear from './getDayOfYear';
import getMonthWeek from './getMonthWeek';
import getWhatDay from './getWhatDay';
import getWhatHours from './getWhatHours';
import getWhatMinutes from './getWhatMinutes';
import getWhatMonth from './getWhatMonth';
import getWhatQuarter from './getWhatQuarter';
import getWhatSeconds from './getWhatSeconds';
import getWhatWeek from './getWhatWeek';
import getWhatYear from './getWhatYear';
import getYearDay from './getYearDay';
import getYearWeek from './getYearWeek';
import isDateSame from './isDateSame';
import isValidDate from './isValidDate';
import now from './now';
import timestamp from './timestamp';
import toDateString from './toDateString';
import toStringDate from './toStringDate';

const dateExports = {
  now,
  timestamp,
  isValidDate,
  isDateSame,
  toStringDate,
  toDateString,
  getWhatYear,
  getWhatQuarter,
  getWhatMonth,
  getWhatWeek,
  getWhatDay,
  getWhatHours,
  getWhatMinutes,
  getWhatSeconds,
  getYearDay,
  getYearWeek,
  getMonthWeek,
  getDayOfYear,
  getDayOfQuarter,
  getDayOfMonth,
  getDateDiff,
};

export default dateExports;
export {
  getDateDiff,
  getDayOfMonth,
  getDayOfQuarter,
  getDayOfYear,
  getMonthWeek,
  getWhatDay,
  getWhatHours,
  getWhatMinutes,
  getWhatMonth,
  getWhatQuarter,
  getWhatSeconds,
  getWhatWeek,
  getWhatYear,
  getYearDay,
  getYearWeek,
  isDateSame,
  isValidDate,
  now,
  timestamp,
  toDateString,
  toStringDate,
};

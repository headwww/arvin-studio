import setupDefaults from './setupDefaults';
import helperStringUpperCase from './helperStringUpperCase';
import helperGetDateFullYear from './helperGetDateFullYear';
import helperGetDateMonth from './helperGetDateMonth';
import toStringDate from './toStringDate';
import getYearWeek from './getYearWeek';
import getYearDay from './getYearDay';
import assign from './assign';
import isValidDate from './isValidDate';
import isFunction from './isFunction';
import eqNull from './eqNull';
import padStart from './padStart';
import type { FirstDayOfWeek } from './getWhatWeek';

export type ToDateStringFormats = {
  /** 用于格式化季度，例如：[null, '第一季度', '第二季度', '第三季度', '第四季度'] */
  q?:
    | string[]
    | {
        1: string;
        2: string;
        3: string;
        4: string;
      }
    | ((value: string | number, match: string, date: Date) => string);
  /** 用于格式化周，例如：['日', '一', '二', '三', '四', '五', '六'] */
  E?:
    | string[]
    | {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
      }
    | ((value: string | number, match: string, date: Date) => string);
};

export interface ToDateStringOptions {
  /** 默认周视图的起始天 */
  firstDay?: FirstDayOfWeek;
  /** 自定义格式化模板 */
  formats?: ToDateStringFormats;
}

function handleCustomTemplate(
  date: Date,
  formats: ToDateStringFormats | undefined,
  match: string,
  value: any,
): any {
  if (!formats) return value;
  const format: any = formats[match as keyof ToDateStringFormats];
  if (format) {
    if (isFunction(format)) {
      return format(value, match, date);
    } else if (Array.isArray(format)) {
      return format[value];
    } else if (typeof format === 'object' && format !== null) {
      return format[value];
    }
  }
  return value;
}

const dateFormatRE =
  /\[([^\]]+)]|y{2,4}|M{1,2}|d{1,2}|H{1,2}|h{1,2}|m{1,2}|s{1,2}|S{1,3}|Z{1,2}|W{1,2}|D{1,3}|[aAeEq]/g;

/**
 * 日期格式化为任意格式字符串，转义符号 []
 *
 * @param date - 字符串/日期/时间戳
 * @param format - 格式化模板，默认：yyyy-MM-dd HH:mm:ss.SSS
 * @param options - 可选参数
 * @returns 格式化后的日期字符串
 */
function toDateString(date: string | Date | number | null | undefined): string;
function toDateString(
  date: string | Date | number | null | undefined,
  format: string | null | undefined,
): string;
function toDateString(
  date: string | Date | number | null | undefined,
  format: string | null | undefined,
  options: ToDateStringOptions,
): string;
function toDateString(
  date: any,
  format?: string | null | undefined,
  options?: ToDateStringOptions,
): string;
function toDateString(date: any, format?: any, options?: any): string {
  if (date) {
    const dateObj = toStringDate(date);
    if (isValidDate(dateObj)) {
      const opts = options || {};
      const resultFormat =
        format || setupDefaults.parseDateFormat || setupDefaults.formatString;
      const hours = dateObj.getHours();
      const apm = hours < 12 ? 'am' : 'pm';
      const formats = assign(
        {},
        setupDefaults.parseDateRules || setupDefaults.formatStringMatchs,
        opts.formats,
      );

      const fy = function (match: string, length: number) {
        return `${helperGetDateFullYear(dateObj)}`.substring(4 - length);
      };
      const fM = function (match: string, length: number) {
        return padStart(helperGetDateMonth(dateObj) + 1, length, '0');
      };
      const fd = function (match: string, length: number) {
        return padStart(dateObj.getDate(), length, '0');
      };
      const fH = function (match: string, length: number) {
        return padStart(hours, length, '0');
      };
      const fh = function (match: string, length: number) {
        return padStart(hours <= 12 ? hours : hours - 12, length, '0');
      };
      const fm = function (match: string, length: number) {
        return padStart(dateObj.getMinutes(), length, '0');
      };
      const fs = function (match: string, length: number) {
        return padStart(dateObj.getSeconds(), length, '0');
      };
      const fS = function (match: string, length: number) {
        return padStart(dateObj.getMilliseconds(), length, '0');
      };
      const fZ = function (match: string, length: number) {
        const zoneHours = (dateObj.getTimezoneOffset() / 60) * -1;
        return handleCustomTemplate(
          dateObj,
          formats,
          match,
          `${
            (zoneHours >= 0 ? '+' : '-') +
            padStart(zoneHours, 2, '0') +
            (length === 1 ? ':' : '')
          }00`,
        );
      };
      const fW = function (match: string, length: number) {
        return padStart(
          handleCustomTemplate(
            dateObj,
            formats,
            match,
            getYearWeek(
              dateObj,
              eqNull(opts.firstDay)
                ? setupDefaults.firstDayOfWeek
                : opts.firstDay,
            ),
          ),
          length,
          '0',
        );
      };
      const fD = function (match: string, length: number) {
        return padStart(
          handleCustomTemplate(dateObj, formats, match, getYearDay(dateObj)),
          length,
          '0',
        );
      };

      const parseDates: Record<string, (match: string, length: number) => any> =
        {
          yyyy: fy,
          yy: fy,
          MM: fM,
          M: fM,
          dd: fd,
          d: fd,
          HH: fH,
          H: fH,
          hh: fh,
          h: fh,
          mm: fm,
          m: fm,
          ss: fs,
          s: fs,
          SSS: fS,
          S: fS,
          ZZ: fZ,
          Z: fZ,
          WW: fW,
          W: fW,
          DDD: fD,
          D: fD,
          a: function (match: string) {
            return handleCustomTemplate(dateObj, formats, match, apm);
          },
          A: function (match: string) {
            return handleCustomTemplate(
              dateObj,
              formats,
              match,
              helperStringUpperCase(apm),
            );
          },
          e: function (match: string) {
            return handleCustomTemplate(
              dateObj,
              formats,
              match,
              dateObj.getDay(),
            );
          },
          E: function (match: string) {
            return handleCustomTemplate(
              dateObj,
              formats,
              match,
              dateObj.getDay(),
            );
          },
          q: function (match: string) {
            return handleCustomTemplate(
              dateObj,
              formats,
              match,
              Math.floor((helperGetDateMonth(dateObj) + 3) / 3),
            );
          },
        };

      return resultFormat.replace(
        dateFormatRE,
        function (match: string, skip: string) {
          return (
            skip ||
            (parseDates[match] ? parseDates[match](match, match.length) : match)
          );
        },
      );
    }
    return 'Invalid Date';
  }
  return '';
}

export default toDateString;

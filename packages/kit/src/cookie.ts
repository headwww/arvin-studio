import setupDefaults from './setupDefaults';
import staticDocument from './staticDocument';
import staticDecodeURIComponent from './staticDecodeURIComponent';
import staticEncodeURIComponent from './staticEncodeURIComponent';
import isArray from './isArray';
import isObject from './isObject';
import isDate from './isDate';
import isUndefined from './isUndefined';
import includes from './includes';
import keys from './keys';
import assign from './assign';
import arrayEach from './arrayEach';
import helperNewDate from './helperNewDate';
import helperGetDateTime from './helperGetDateTime';
import getWhatYear from './getWhatYear';
import getWhatMonth from './getWhatMonth';
import getWhatDay from './getWhatDay';

export interface CookieOptions {
  name?: string;
  value?: any;
  path?: string;
  domain?: string;
  secure?: boolean;
  expires?: number | string | Date;
}

export interface XECookie {
  (
    name?: string | CookieOptions[] | CookieOptions,
    value?: string,
    options?: CookieOptions,
  ): any;
  has: (name: string) => boolean;
  set: (name: string, value: any, options?: CookieOptions) => any;
  setItem: (name: string, value: any, options?: CookieOptions) => any;
  get: (name: string) => any;
  getItem: (name: string) => any;
  remove: (name: string, options?: CookieOptions) => void;
  removeItem: (name: string, options?: CookieOptions) => void;
  keys: () => string[];
  getJSON: () => Record<string, string>;
}

function toCookieUnitTime(unit: string, expires: number): number {
  const num = parseFloat(String(expires));
  const nowdate = helperNewDate();
  const time = helperGetDateTime(nowdate);
  switch (unit) {
    case 'y':
      return helperGetDateTime(getWhatYear(nowdate, num));
    case 'M':
      return helperGetDateTime(getWhatMonth(nowdate, num));
    case 'd':
      return helperGetDateTime(getWhatDay(nowdate, num));
    case 'h':
    case 'H':
      return time + num * 60 * 60 * 1000;
    case 'm':
      return time + num * 60 * 1000;
    case 's':
      return time + num * 1000;
  }
  return time;
}

function toCookieUTCString(date: any): string {
  return (isDate(date) ? date : new Date(date)).toUTCString();
}

function cookie(
  name?: string | CookieOptions[] | CookieOptions,
  value?: string,
  options?: CookieOptions,
  ..._rest: any[]
): any {
  if (staticDocument) {
    let opts: CookieOptions;
    let expires: any;
    let values: string[];
    let result: any;
    let cookies: string;
    let keyIndex: number;
    let inserts: CookieOptions[] = [];
    const argCount =
      name !== undefined
        ? 1 + (value !== undefined ? 1 : 0) + (options !== undefined ? 1 : 0)
        : 0;
    if (isArray(name)) {
      inserts = name as CookieOptions[];
    } else if (argCount > 1) {
      inserts = [assign({ name: name, value: value }, options)];
    } else if (isObject(name)) {
      inserts = [name as CookieOptions];
    }
    if (inserts.length > 0) {
      arrayEach(inserts, function (obj: CookieOptions) {
        opts = assign({}, setupDefaults.cookies, obj) as CookieOptions;
        values = [];
        if (opts.name) {
          expires = opts.expires;
          values.push(
            `${staticEncodeURIComponent(opts.name)}=${staticEncodeURIComponent(isObject(opts.value) ? JSON.stringify(opts.value) : opts.value)}`,
          );
          if (expires) {
            if (isNaN(expires)) {
              expires = (expires as string).replace(
                /^([0-9]+)(y|M|d|H|h|m|s)$/,
                function (_text: string, num: string, unit: string): string {
                  return toCookieUTCString(toCookieUnitTime(unit, Number(num)));
                },
              );
            } else if (
              /^[0-9]{11,13}$/.test(String(expires)) ||
              isDate(expires)
            ) {
              expires = toCookieUTCString(expires);
            } else {
              expires = toCookieUTCString(
                toCookieUnitTime('d', expires as number),
              );
            }
            opts.expires = expires;
          }
          arrayEach(
            ['expires', 'path', 'domain', 'secure'],
            function (key: string) {
              if (!isUndefined((opts as any)[key])) {
                values.push(
                  (opts as any)[key] && key === 'secure'
                    ? key
                    : `${key}=${(opts as any)[key]}`,
                );
              }
            },
          );
        }
        staticDocument.cookie = values.join('; ');
      });
      return true;
    } else {
      result = {};
      cookies = staticDocument.cookie;
      if (cookies) {
        arrayEach(cookies.split('; '), function (val: string) {
          keyIndex = val.indexOf('=');
          result[staticDecodeURIComponent(val.substring(0, keyIndex))] =
            staticDecodeURIComponent(val.substring(keyIndex + 1) || '');
        });
      }
      return argCount === 1 ? result[name as string] : result;
    }
  }
  return false;
}

function hasCookieItem(value: string): boolean {
  return includes(cookieKeys(), value);
}

function getCookieItem(name: string): any {
  return cookie(name);
}

function setCookieItem(name: string, value: any, options?: CookieOptions): any {
  cookie(name, value, options);
  return cookie;
}

function removeCookieItem(name: string, options?: CookieOptions): void {
  cookie(name, '', assign({ expires: -1 }, setupDefaults.cookies, options));
}

function cookieKeys(): string[] {
  return keys(cookie());
}

function cookieJson(): Record<string, string> {
  return cookie();
}

const cookieFn: any = cookie;

assign(cookieFn, {
  has: hasCookieItem,
  set: setCookieItem,
  setItem: setCookieItem,
  get: getCookieItem,
  getItem: getCookieItem,
  remove: removeCookieItem,
  removeItem: removeCookieItem,
  keys: cookieKeys,
  getJSON: cookieJson,
});

export default cookieFn as XECookie;

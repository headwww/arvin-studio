import arrayEach from './arrayEach';
import assign from './assign';
import getWhatDay from './getWhatDay';
import getWhatMonth from './getWhatMonth';
import getWhatYear from './getWhatYear';
import helperGetDateTime from './helperGetDateTime';
import helperNewDate from './helperNewDate';
import includes from './includes';
import isArray from './isArray';
import isDate from './isDate';
import isObject from './isObject';
import isUndefined from './isUndefined';
import keys from './keys';
import setupDefaults from './setupDefaults';
import staticDecodeURIComponent from './staticDecodeURIComponent';
import staticDocument from './staticDocument';
import staticEncodeURIComponent from './staticEncodeURIComponent';

export interface CookieOptions {
  domain?: string;
  expires?: Date | number | string;
  name?: string;
  path?: string;
  secure?: boolean;
  value?: any;
}

export interface XECookie {
  (
    name?: CookieOptions | CookieOptions[] | string,
    value?: string,
    options?: CookieOptions,
  ): any;
  get: (name: string) => any;
  getItem: (name: string) => any;
  getJSON: () => Record<string, string>;
  has: (name: string) => boolean;
  keys: () => string[];
  remove: (name: string, options?: CookieOptions) => void;
  removeItem: (name: string, options?: CookieOptions) => void;
  set: (name: string, value: any, options?: CookieOptions) => any;
  setItem: (name: string, value: any, options?: CookieOptions) => any;
}

function toCookieUnitTime(unit: string, expires: number): number {
  const num = Number.parseFloat(String(expires));
  const nowdate = helperNewDate();
  const time = helperGetDateTime(nowdate);
  switch (unit) {
    case 'd': {
      return helperGetDateTime(getWhatDay(nowdate, num));
    }
    case 'h':
    case 'H': {
      return time + num * 60 * 60 * 1000;
    }
    case 'M': {
      return helperGetDateTime(getWhatMonth(nowdate, num));
    }
    case 'm': {
      return time + num * 60 * 1000;
    }
    case 's': {
      return time + num * 1000;
    }
    case 'y': {
      return helperGetDateTime(getWhatYear(nowdate, num));
    }
  }
  return time;
}

function toCookieUTCString(date: any): string {
  return (isDate(date) ? date : new Date(date)).toUTCString();
}

function cookie(
  name?: CookieOptions | CookieOptions[] | string,
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
      name === undefined
        ? 0
        : 1 + (value === undefined ? 0 : 1) + (options === undefined ? 0 : 1);
    if (isArray(name)) {
      inserts = name as CookieOptions[];
    } else if (argCount > 1) {
      inserts = [assign({ name, value }, options)];
    } else if (isObject(name)) {
      inserts = [name as CookieOptions];
    }
    if (inserts.length > 0) {
      arrayEach(inserts, (obj: CookieOptions) => {
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
                (_text: string, num: string, unit: string): string => {
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
          arrayEach(['expires', 'path', 'domain', 'secure'], (key: string) => {
            if (!isUndefined((opts as any)[key])) {
              values.push(
                (opts as any)[key] && key === 'secure'
                  ? key
                  : `${key}=${(opts as any)[key]}`,
              );
            }
          });
        }
        (staticDocument as any).cookie = values.join('; ');
      });
      return true;
    }
    result = {};
    cookies = staticDocument.cookie;
    if (cookies) {
      arrayEach(cookies.split('; '), (val: string) => {
        keyIndex = val.indexOf('=');
        result[staticDecodeURIComponent(val.substring(0, keyIndex))] =
          staticDecodeURIComponent(val.substring(keyIndex + 1) || '');
      });
    }
    return argCount === 1 ? result[name as string] : result;
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

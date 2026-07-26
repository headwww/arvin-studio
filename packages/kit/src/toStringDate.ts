import helperGetDateTime from './helperGetDateTime';
import helperGetUTCDateTime from './helperGetUTCDateTime';
import isDate from './isDate';
import isNumber from './isNumber';
import isString from './isString';
import staticParseInt from './staticParseInt';

function getParseRule(txt: number | string): string {
  return String.raw`(\d{${txt}})`;
}

function toParseMs(num: number): number {
  if (num < 10) {
    return num * 100;
  } else if (num < 100) {
    return num * 10;
  }
  return num;
}

function toParseNum(num: any): number {
  return isNaN(num) ? num : staticParseInt(num);
}

const d2 = getParseRule(2);
const d1or2 = getParseRule('1,2');
const d1or7 = getParseRule('1,7');
const d3or4 = getParseRule('3,4');
const place = '.{1}';
const d1Or2RE = place + d1or2;
const dzZ = String.raw`(([zZ])|([-+]\d{2}:?\d{2}))`;

const defaulParseStrs = [
  d3or4,
  d1Or2RE,
  d1Or2RE,
  d1Or2RE,
  d1Or2RE,
  d1Or2RE,
  place + d1or7,
  dzZ,
];
const defaulParseREs: RegExp[] = [];

for (let len = defaulParseStrs.length - 1; len >= 0; len--) {
  let rule = '';
  for (let i = 0; i < len + 1; i++) {
    rule += defaulParseStrs[i];
  }
  defaulParseREs.push(new RegExp(`^${rule}`));
}

interface ParseResult {
  d?: string;
  H?: string;
  M?: string;
  m?: string;
  s?: string;
  S?: string;
  y?: string;
  Z?: string;
}

/**
 * 解析默认格式
 */
function parseDefaultRules(str: string): ParseResult {
  const resMaps: ParseResult = {};
  for (const defaulParseRE of defaulParseREs) {
    const matchRest = str.match(defaulParseRE!);
    if (matchRest) {
      resMaps.y = matchRest[1];
      resMaps.M = matchRest[2];
      resMaps.d = matchRest[3];
      resMaps.H = matchRest[4];
      resMaps.m = matchRest[5];
      resMaps.s = matchRest[6];
      resMaps.S = matchRest[7];
      resMaps.Z = matchRest[8];
      break;
    }
  }
  return resMaps;
}

const customParseStrs: [string, string][] = [
  ['yyyy', d3or4],
  ['yy', d2],
  ['MM', d2],
  ['M', d1or2],
  ['dd', d2],
  ['d', d1or2],
  ['HH', d2],
  ['H', d1or2],
  ['mm', d2],
  ['m', d1or2],
  ['ss', d2],
  ['s', d1or2],
  ['SSS', getParseRule(3)],
  ['S', d1or7],
  ['Z', dzZ],
];

const parseRuleMaps: Record<string, string> = {};
const parseRuleKeys: string[] = [String.raw`\[([^\]]+)\]`];

for (const itemRule of customParseStrs) {
  parseRuleMaps[itemRule![0]] = `${itemRule![1]}?`;
  parseRuleKeys.push(itemRule![0]);
}

const customParseRes = new RegExp(parseRuleKeys.join('|'), 'g');

interface CacheItem {
  _i: string[];
  _r: RegExp;
}

const cacheFormatMaps: Record<string, CacheItem> = {};

/**
 * 解析自定义格式
 */
function parseCustomRules(str: string, format: string): ParseResult {
  let cacheItem = cacheFormatMaps[format];
  if (!cacheItem) {
    const posIndexs: string[] = [];
    const re = format
      .replaceAll(/([$(){}*+.?\\^|])/g, String.raw`\$1`)
      .replace(customParseRes, function (text: string, val: string) {
        const firstChar = text.charAt(0);
        // 如果为转义符号:[关键字]
        if (firstChar === '[') {
          return val;
        }
        posIndexs.push(firstChar);
        return parseRuleMaps[text];
      } as any);
    cacheItem = cacheFormatMaps[format] = {
      _i: posIndexs,
      _r: new RegExp(re),
    };
  }

  const resMaps: ParseResult = {};
  const matchRest = str.match(cacheItem._r);
  if (matchRest) {
    const _i = cacheItem._i;
    for (let i = 1, len = matchRest.length; i < len; i++) {
      resMaps[_i[i - 1] as keyof ParseResult] = matchRest[i];
    }
  }
  return resMaps;
}

export interface ParsedDateTime {
  d?: number;
  H?: number;
  M?: number;
  m?: number;
  s?: number;
  S?: number;
  y?: string;
  Z?: string;
}

/**
 * 解析时区
 */
function parseTimeZone(resMaps: ParseResult): Date {
  // 如果为UTC 时间
  if (/^[zZ]/.test(resMaps.Z || '')) {
    const utcMaps: any = {
      y: resMaps.y,
      M: resMaps.M ? toParseNum(parseInt(resMaps.M)) - 1 : 0,
      d: resMaps.d ? toParseNum(parseInt(resMaps.d)) : 1,
      H: resMaps.H ? toParseNum(parseInt(resMaps.H)) : 0,
      m: resMaps.m ? toParseNum(parseInt(resMaps.m)) : 0,
      s: resMaps.s ? toParseNum(parseInt(resMaps.s)) : 0,
      S: resMaps.S
        ? // eslint-disable-next-line unicorn/max-nested-calls
          toParseMs(toParseNum(parseInt(resMaps.S.substring(0, 3))))
        : 0,
    };
    return new Date(helperGetUTCDateTime(utcMaps));
  } else {
    // 如果指定时区，时区转换
    const matchRest = resMaps.Z?.match(/([-+])(\d{2}):?(\d{2})/);
    if (matchRest) {
      const utcMaps: any = {
        y: resMaps.y,
        M: resMaps.M ? toParseNum(parseInt(resMaps.M)) - 1 : 0,
        d: resMaps.d ? toParseNum(parseInt(resMaps.d)) : 1,
        H: resMaps.H ? toParseNum(parseInt(resMaps.H)) : 0,
        m: resMaps.m ? toParseNum(parseInt(resMaps.m)) : 0,
        s: resMaps.s ? toParseNum(parseInt(resMaps.s)) : 0,
        S: resMaps.S
          ? // eslint-disable-next-line unicorn/max-nested-calls
            toParseMs(toParseNum(parseInt(resMaps.S.substring(0, 3))))
          : 0,
      };
      const utcTime = helperGetUTCDateTime(utcMaps);
      const offset =
        (matchRest[1] === '-' ? -1 : 1) *
          staticParseInt(matchRest[2]!) *
          3_600_000 +
        staticParseInt(matchRest[3]!) * 60_000;
      return new Date(utcTime - offset);
    }
  }
  return new Date('');
}

/**
 * 任意格式字符串转为日期
 *
 * @param str - 字符串/日期/时间戳
 * @param format - 解析格式 yyyy MM dd HH mm ss SSS
 * @returns 解析后的日期对象
 */
function toStringDate(str: Date | null | number | string | undefined): Date;
function toStringDate(
  str: Date | null | number | string | undefined,
  format: null | string | undefined,
): Date;
function toStringDate(str: any, format?: null | string | undefined): Date;
function toStringDate(str: any, format?: any): Date {
  if (str) {
    const isDType = isDate(str);
    if (isDType || ((!format || isNumber(str)) && /^[0-9]{11,15}$/.test(str))) {
      return new Date(isDType ? helperGetDateTime(str) : staticParseInt(str));
    }
    if (isString(str)) {
      const resMaps = format
        ? parseCustomRules(str, format)
        : parseDefaultRules(str);
      if (resMaps.y) {
        const M: number | undefined = resMaps.M
          ? toParseNum(parseInt(resMaps.M)) - 1
          : 0;
        const S: number | undefined = resMaps.S
          ? // eslint-disable-next-line unicorn/max-nested-calls
            toParseMs(toParseNum(parseInt(resMaps.S.substring(0, 3))))
          : 0;
        return resMaps.Z
          ? parseTimeZone(resMaps)
          : new Date(
              parseInt(resMaps.y),
              M || 0,
              resMaps.d ? toParseNum(parseInt(resMaps.d)) : 1,
              resMaps.H ? toParseNum(parseInt(resMaps.H)) : 0,
              resMaps.m ? toParseNum(parseInt(resMaps.m)) : 0,
              resMaps.s ? toParseNum(parseInt(resMaps.s)) : 0,
              S || 0,
            );
      }
    }
  }
  return new Date('');
}

export default toStringDate;

import each from './each';
import helperFormatEscaper from './helperFormatEscaper';
import staticEscapeMap from './staticEscapeMap';

const unescapeMap: Record<string, string> = {};
each(staticEscapeMap, (_: string, key: string) => {
  unescapeMap[staticEscapeMap[key]!] = key;
});

/**
 * 反转 escape
 *
 * @param str - 字符串
 * @returns 反转义后的字符串
 */
function unescape(str: null | string | undefined): string;
function unescape(str: any): string;
function unescape(str: any): string {
  const helper = helperFormatEscaper(unescapeMap);
  return helper(str);
}

export default unescape;

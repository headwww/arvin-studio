import staticEscapeMap from './staticEscapeMap';
import helperFormatEscaper from './helperFormatEscaper';
import each from './each';

const unescapeMap: Record<string, string> = {};
each(staticEscapeMap, function (_: string, key: string) {
  unescapeMap[staticEscapeMap[key]!] = key;
});

/**
 * 反转 escape
 *
 * @param str - 字符串
 * @returns 反转义后的字符串
 */
function unescape(str: string | null | undefined): string;
function unescape(str: any): string;
function unescape(str: any): string {
  const helper = helperFormatEscaper(unescapeMap);
  return helper(str);
}

export default unescape;

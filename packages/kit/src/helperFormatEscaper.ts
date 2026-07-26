import keys from './keys';
import toValueString from './toValueString';

/**
 * 创建转义字符替换函数
 */
function helperFormatEscaper(
  dataMap: Record<string, string>,
): (str: any) => string {
  const replaceRegexp = new RegExp(`(?:${keys(dataMap).join('|')})`, 'g');
  return function (str: any): string {
    return toValueString(str).replace(replaceRegexp, (match: string) => {
      return dataMap[match] as any;
    });
  };
}

export default helperFormatEscaper;

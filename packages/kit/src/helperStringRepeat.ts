import staticParseInt from './staticParseInt';

/**
 * 字符串重复
 */
function helperStringRepeat(str: string, count: number): string {
  if (str.repeat) {
    return str.repeat(count);
  }
  const list = isNaN(count) ? [] : new Array(staticParseInt(count as any));
  return list.join(str) + (list.length > 0 ? str : '');
}

export default helperStringRepeat;

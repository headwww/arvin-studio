import toValueString from './toValueString';

/**
 * 判断字符串是否在源字符串的尾部
 * @param str 字符串
 * @param val 值
 */
function endsWith(str: string | null | undefined, val: string): boolean;
/**
 * 判断字符串是否在源字符串的尾部
 * @param str 字符串
 * @param val 值
 * @param startIndex 截取长度（从头截取多少个字符后再判断尾部）
 */
function endsWith(
  str: string | null | undefined,
  val: string,
  startIndex: number,
): boolean;
function endsWith(
  str: string | null | undefined,
  val: string,
  startIndex?: number,
): boolean {
  // 空字符串始终是任意字符串的后缀（与原生 String.prototype.endsWith 一致）
  if (val === '') {
    return true;
  }
  const rest = toValueString(str);
  if (startIndex !== undefined) {
    const sub = rest.substring(0, startIndex);
    const idx = sub.indexOf(val);
    return idx >= 0 && idx === sub.length - val.length;
  }
  const idx = rest.indexOf(val);
  return idx >= 0 && idx === rest.length - val.length;
}

export default endsWith;

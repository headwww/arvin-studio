import toValueString from './toValueString';

/**
 * 判断字符串是否在源字符串的头部
 *
 * @param str - 字符串
 * @param val - 值
 * @param startIndex - 开始索引
 * @returns 是否以指定字符串开头
 */
function startsWith(
  str: null | number | string,
  val: string,
  startIndex?: number,
): boolean;
function startsWith(str: any, val: any, startIndex?: any): boolean;
function startsWith(str: any, val: any, startIndex?: any): boolean {
  const rest = toValueString(str);
  // 判断是否只传入了 str 参数（未传入 val），如果是则直接判断 val 是否在 rest 开头
  // 注意：此处保留 arguments.length 检查，因为原逻辑中 startsWith(str, val) 和 startsWith(str) 行为不同
  // startsWith(str) 等价于 rest.indexOf(str) === 0
  if (val === undefined) {
    return rest.indexOf(str) === 0;
  }
  const target = startIndex === undefined ? rest : rest.substring(startIndex);
  return target.indexOf(val) === 0;
}

export default startsWith;

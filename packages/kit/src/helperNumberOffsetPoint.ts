/**
 * 数值字符串插入小数点
 */
function helperNumberOffsetPoint(str: string, offsetIndex: number): string {
  return `${str.substring(0, offsetIndex)}.${str.substring(offsetIndex, str.length)}`;
}

export default helperNumberOffsetPoint;

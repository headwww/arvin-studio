/**
 * 获取数值小数点后的位数
 */
function helperNumberDecimal(numStr: string): number {
  return (numStr.split('.', 2)[1] || '').length;
}

export default helperNumberDecimal;

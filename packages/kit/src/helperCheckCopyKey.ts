/**
 * 检查是否是可克隆的属性
 */
function helperCheckCopyKey(key: string): boolean {
  return key !== '__proto__' && key !== 'constructor'
}

export default helperCheckCopyKey

/**
 * @file 通用校验工具，判断值是否非空（非 undefined、null、空字符串）
 */

/**
 * 判断值是否为"有效值"：不是 undefined、null 或空字符串。
 * 常用于过滤 props 中的空值，避免将无效属性透传到 DOM 元素上。
 */
function isValid(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}
export default isValid;

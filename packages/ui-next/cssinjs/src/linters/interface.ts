/**
 * @file Linter 接口定义，所有 CSS-in-JS 代码质量检查器遵循统一的函数签名
 */

/**
 * Linter 检查时的上下文信息。
 * @interface
 */
export interface LinterInfo {
  /** 当前组件的样式哈希 ID，用于定位具体组件 */
  hashId?: string;
  /** 父级选择器链路，从根到当前节点的所有选择器集合 */
  parentSelectors: string[];
  /** 样式文件路径或组件名，用于错误定位 */
  path?: string;
}

/**
 * Linter 函数签名：对每个 CSS 属性键值对进行检查，发现问题时通过 `lintWarning` 输出警告。
 * @param key - CSS 属性名
 * @param value - CSS 属性值（数字或字符串）
 * @param info - 当前样式的上下文信息
 */
export interface Linter {
  (key: string, value: number | string, info: LinterInfo): void;
}

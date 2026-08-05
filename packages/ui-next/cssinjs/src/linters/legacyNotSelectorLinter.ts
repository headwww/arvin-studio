/**
 * @file `:not()` 串联选择器兼容性检查器，检测旧浏览器不支持的多元素 `:not()` 写法
 */

import type { Linter, LinterInfo } from './interface';

import { lintWarning } from './utils';

/**
 * 判断 `:not()` 内是否为串联选择器（多个简单选择器组合）。
 * 旧浏览器仅支持 `:not(selector)` 单选择器形式。
 * @param selector - 选择器字符串
 * @returns 是否为串联选择器
 * @example
 * isConcatSelector(':not(h1#a.b)') // => true，h1 + #a + .b 串联
 * isConcatSelector(':not(.foo)')   // => false，单个选择器
 */
function isConcatSelector(selector: string) {
  const notContent = selector.match(/:not\(([^)]*)\)/)?.[1] || '';

  // 按属性选择器 `[...]`、类选择器 `.`、ID 选择器 `#` 分割
  // `h1#a.b` → ['h1', '#a', '.b']，大于 1 个片段即为串联
  const splitCells = notContent.split(/(\[[^[]*\])|(?=[.#])/).filter(Boolean);

  return splitCells.length > 1;
}

/**
 * 将父级选择器链拼接为完整的选择器路径。
 * 遇到 `&` 符号时替换为父级选择器（SCSS 风格的嵌套展开）。
 * @param info - Linter 上下文信息
 * @returns 完整的选择器路径字符串
 */
function parsePath(info: LinterInfo) {
  return info.parentSelectors.reduce((prev, cur) => {
    if (!prev) {
      return cur;
    }

    return cur.includes('&') ? cur.replaceAll('&', prev) : `${prev} ${cur}`;
  }, '');
}

/**
 * 检查选择器路径中是否包含旧浏览器不支持的串联 `:not()` 选择器。
 * 例如 `:not(h1.foo)` 在旧版浏览器中不兼容。
 */
const linter: Linter = (_key, _value, info) => {
  const parentSelectorPath = parsePath(info);
  const notList = parentSelectorPath.match(/:not\([^)]*\)/g) || [];

  if (notList.some(isConcatSelector)) {
    lintWarning(`Concat ':not' selector not support in legacy browsers.`, info);
  }
};

export default linter;

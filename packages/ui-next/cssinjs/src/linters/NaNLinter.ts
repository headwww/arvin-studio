/**
 * @file NaN 值检查器，检测 CSS 属性值中意外出现的 NaN
 */

import type { Linter } from './interface';

import { lintWarning } from './utils';

/**
 * 检查 CSS 属性值是否包含 NaN（字符串形式或数字形式）。
 * NaN 通常由错误的数学运算产生，出现在 CSS 中会导致样式失效。
 */
const linter: Linter = (key, value, info) => {
  if ((typeof value === 'string' && /NaN/.test(value)) || Number.isNaN(value)) {
    lintWarning(`Unexpected 'NaN' in property '${key}: ${value}'.`, info);
  }
};

export default linter;

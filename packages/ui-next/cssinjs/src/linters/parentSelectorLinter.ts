/**
 * @file 父级选择器检查器，检测选择器中 `&` 符号的重复使用
 */

import type { Linter } from '.';
import type { LinterInfo } from './interface';

import { lintWarning } from './utils';

/**
 * 检查选择器中是否使用了超过一个 `&` 符号。
 * 多个 `&` 会导致选择器嵌套层级混乱，且生成的 CSS 特异性难以预测，
 * 应限制每个选择器最多一个 `&`。
 */
const linter: Linter = (_key: any, _value: any, info: LinterInfo) => {
  if (
    info.parentSelectors.some((selector) => {
      const selectors = selector.split(',');
      // `&` 出现次数超过 1 次 → 有问题
      return selectors.some((item) => item.split('&').length > 2);
    })
  ) {
    lintWarning('Should not use more than one `&` in a selector.', info);
  }
};

export default linter;

/**
 * @file Linter 工具函数，提供统一的警告输出格式
 */

import type { LinterInfo } from './interface';

/**
 * 输出统一的 lint 警告到控制台，包含路径和父级选择器链信息便于定位问题。
 * @param message - 警告信息
 * @param info - 当前样式的上下文
 */
export function lintWarning(message: string, info: LinterInfo) {
  const { path, parentSelectors } = info;

  console.error(
    false,
    `[AS Design CSS-in-JS] ${path ? `Error in ${path}: ` : ''}${message}${
      parentSelectors.length > 0
        ? ` Selector: ${parentSelectors.join(' | ')}`
        : ''
    }`,
  );
}

/**
 * @file `content` 属性引号检查器，确保文本内容值用引号包裹
 */

import type { Linter } from './interface';

import { lintWarning } from './utils';

/**
 * 检查 `content` 属性的值是否被引号包裹。
 * 非关键字值（normal/none 等）、非 CSS 函数值（url/attr/gradient 等）、非 CSS 变量
 * 和未被引号包裹的裸字符串会触发警告。
 *
 * @example
 * content: 'hello'    // 通过，有引号
 * content: hello      // 警告，建议改为 `content: '"hello"'`
 * content: normal     // 通过，CSS 关键字
 * content: url(...)   // 通过，CSS 函数
 */
const linter: Linter = (key, value, info) => {
  if (key !== 'content') {
    return;
  }

  // CSS 函数值不需要引号
  const contentValuePattern =
    /(attr|counters?|url|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
  // CSS 关键字，无需引号
  const contentValues = ['normal', 'none', 'initial', 'inherit', 'unset'];
  if (
    typeof value !== 'string' ||
    (!contentValues.includes(value) &&
      !contentValuePattern.test(value) &&
      !value.startsWith('var(') &&
      (value.charAt(0) !== value.charAt(value.length - 1) ||
        (value.charAt(0) !== '"' && value.charAt(0) !== "'")))
  ) {
    lintWarning(
      `You seem to be using a value for 'content' without quotes, try replacing it with \`content: '"${value}"'\`.`,
      info,
    );
  }
};

export default linter;

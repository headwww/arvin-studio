/**
 *  —— lodash 风格路径取值
 *
 * 沿 path 逐层深入 entity 取值：任一层遇到 null/undefined 立即返回
 * undefined（不抛错），路径全部走完则返回最终值。
 * 路径元素支持 string / number / symbol 混合（如 ['a', 0, 'b']）。
 * 是 utils/set 与 mergeWith 等工具的取值基础。
 */
export function get(
  entity: any,
  path: (number | string | symbol)[] | readonly (number | string | symbol)[],
) {
  let current = entity;

  // 逐层深入：先判空再取值，避免访问 null/undefined 的属性抛错
  for (const element of path) {
    if (current === null || current === undefined) return undefined;

    current = current[element];
  }

  return current;
}

/**
 * —— 插槽/同名 prop 二选一的取值工具
 *
 * 组件常支持"插槽或同名 prop"两种方式传入内容（如 title 插槽与 title 属性）：
 * 优先取插槽渲染结果；无插槽时取同名 prop（函数 prop 视为渲染函数调用，
 * 普通值直接返回）。两者都未提供时返回 null。
 */
export function checkSlotProp(
  props: Record<string, any>,
  slots: Record<string, any>,
  name: string,
  ...args: any[]
) {
  // 优先级 1：同名插槽存在 → 调用插槽函数渲染
  if (slots[name]) return slots[name]?.(...args);
  // 优先级 2：同名 prop 存在
  if (name in props) {
    // 函数 prop 视为渲染函数，传入 args 调用（与插槽一致的行为）
    if (typeof props[name] === 'function') return props[name]?.(...args);
    // 普通值（字符串/数字/VNode 等）直接返回
    return props[name];
  }
  // 插槽与 prop 都未提供 → 返回 null 表示无内容
  return null;
}

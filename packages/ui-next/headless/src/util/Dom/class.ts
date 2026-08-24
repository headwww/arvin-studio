/**
 * @v-c/util className 操作工具（Dom/class）
 *
 * 为 Element 提供 hasClass / addClass / removeClass 三个原子操作：
 * - 优先使用原生 classList（标准、性能好）；
 * - 无 classList 的环境（旧浏览器）退化为基于 className 字符串的兜底实现。
 *
 * 关键设计（兜底路径）：
 * - hasClass 在 className 前后各补一个空格再做子串匹配，避免 "foo" 误匹配 "foobar"；
 * - removeClass 同样用 " className " 形态做替换，保证只删整个类名、不留多余空格。
 */
/** 判断元素是否包含指定类名 */
export function hasClass(node: Element, className: string) {
  if (node.classList) return node.classList.contains(className);

  // 兜底：className 前后补空格后匹配，防止 "foo" 命中 "foobar" 这类部分匹配
  const originClass = node.className;
  return ` ${originClass} `.includes(` ${className} `);
}

/** 为元素添加类名（已存在则跳过） */
export function addClass(node: Element, className: string) {
  if (node.classList) {
    node.classList.add(className);
  } else {
    // 兜底：先判重，避免拼接出重复类名
    if (!hasClass(node, className))
      node.className = `${node.className} ${className}`;
  }
}

/** 从元素移除类名（不存在则无操作） */
export function removeClass(node: Element, className: string) {
  if (node.classList) {
    node.classList.remove(className);
  } else {
    // 兜底：只在存在时才做字符串替换
    if (hasClass(node, className)) {
      const originClass = node.className;
      // 替换成单个空格：删除目标类名的同时不破坏其他类名之间的分隔
      node.className = ` ${originClass} `.replace(` ${className} `, ' ');
    }
  }
}

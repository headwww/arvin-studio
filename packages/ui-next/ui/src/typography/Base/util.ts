import type { VueNode } from '../../_util';

import { getSlotPropsFnRun } from '../../_util/tools';
import { isDev } from '../../_util/warning';

/**
 * 归一化为两元素数组（[默认态, 成功态] 的图标/文案双态约定）
 * - false 特判为 [false, false]（表示不显示）
 * - 数组原样返回；单个值包装为 [val]
 */
export function toList<T>(val: T | T[]): T[] {
  if (val === false) {
    return [false, false] as T[];
  }
  return Array.isArray(val) ? val : [val];
}

/**
 * 解析节点：dom 支持插槽/函数/静态值
 * - dom 为 true 或 undefined → 返回 defaultNode
 * - 否则返回 dom；dom 为空且 needDom → 返回 defaultNode 兜底
 */
export function getNode(dom: VueNode, defaultNode: VueNode, needDom?: boolean) {
  dom = getSlotPropsFnRun({}, { dom }, 'dom', false);
  defaultNode = getSlotPropsFnRun({}, { defaultNode }, 'defaultNode');
  if (dom === true || dom === undefined) {
    return defaultNode;
  }
  return dom || (needDom && defaultNode);
}

/**
 * Check for element is native ellipsis
 * 检测元素是否真的发生了 CSS 省略（溢出）
 * 原理：往元素内临时插入一个 <em>，对比其与元素本身的位置关系，
 * 若子元素任何一侧超出父元素边界 → 说明内容被裁切（省略生效）。
 */
export function isEleEllipsis(ele: HTMLElement): boolean {
  // Create a new div to get the size
  // 插入测量用的 em（行内元素，跟随文本流）
  const childDiv = document.createElement('em');
  ele.append(childDiv);

  // For test case
  // 测试场景加标记类名
  if (isDev) {
    childDiv.className = 'as-typography-css-ellipsis-content-measure';
  }

  const rect = ele.getBoundingClientRect();
  const childRect = childDiv.getBoundingClientRect();

  // Reset
  // 移除测量节点
  childDiv.remove();

  // Range checker
  // 任一方向越界 → 省略生效
  return (
    // Horizontal out of range
    rect.left > childRect.left ||
    childRect.right > rect.right ||
    // Vertical out of range
    rect.top > childRect.top ||
    childRect.bottom > rect.bottom
  );
}

/** 类型守卫：是否为可显示为文本的节点（string | number） */
export const isValidText = (val: any): val is number | string =>
  ['number', 'string'].includes(typeof val);

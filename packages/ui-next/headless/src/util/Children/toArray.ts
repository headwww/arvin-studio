/**
 *
 * 把任意形态的 children 归一化为扁平的 VNode 数组：
 * - 递归展开嵌套数组与 Fragment（Fragment 展一层 children 后继续递归）；
 * - 默认丢弃 null / undefined 空节点（keepEmpty 可保留），
 *   保证 slot 内容可以安全地 map / 过滤 / 计数。
 */
import type { VNode } from 'vue';

import { isFragment } from './isFragment';

/** toArray 选项 */
export interface Option {
  /** 为 true 时保留 null / undefined 空节点 */
  keepEmpty?: boolean;
}

/**
 * 归一化 children 为 VNode 数组
 * @param children 任意形态的子节点（VNode / 数组 / Fragment / 字符串等）
 * @param option 配置项（keepEmpty：是否保留空节点）
 * @returns 扁平化后的 VNode 数组
 */
export function toArray(children: any, option: Option = {}) {
  // 从slots中获取的必定是数组
  let ret: VNode[] = [];
  // 判断children是否是一个数组，如果不是就把它放到一个数组中
  // 统一为数组后逐项处理
  if (!Array.isArray(children)) children = [children];
  for (const child of children) {
    // 空节点默认跳过（keepEmpty 时保留）
    if ((child === undefined || child === null) && !option.keepEmpty) continue;

    // 嵌套数组：递归展开
    // eslint-disable-next-line unicorn/no-array-concat-in-loop
    if (Array.isArray(child)) ret = ret.concat(toArray(child, option));

    // Fragment：递归展开其 children（Vue 3 多根节点的表现形态）
    else if (isFragment(child) && child.children)
      // eslint-disable-next-line unicorn/no-array-concat-in-loop
      ret = ret.concat(toArray(child.children, option));
    else ret.push(child);
  }
  return ret;
}

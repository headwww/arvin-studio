/**
 *
 * 判定 VNode 是否为 Fragment 节点。Vue 3 中 Fragment 用于渲染多根节点，
 * 子节点遍历（toArray）时需先识别 Fragment 再递归展开，
 * 才能拿到真实的叶子节点（而非 <></> 壳）。
 */
import type { VNode, VNodeChild } from 'vue';

import { Fragment, isVNode } from 'vue';

/**
 * 判定节点是否为 Fragment VNode（带类型收窄）
 * @param node 任意子节点（VNode / 字符串 / 数组 / null 等）
 * @returns 是 Fragment 且为 VNode 时为 true
 */
export function isFragment(node: VNodeChild): node is VNode {
  return isVNode(node) && node.type === Fragment;
}

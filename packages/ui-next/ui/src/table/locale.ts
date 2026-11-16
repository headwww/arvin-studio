import type { VueNode } from '../_util';

export interface TableLocale {
  allTitle: VueNode;
  dragTip: VueNode;
  emptyText: VueNode;
  /**
   * 筛选按钮提示语
   */
  filter: VueNode;
  /**
   * 宽像素提示
   */
  resizeColTip: VueNode;
  resizeRowTip: VueNode;
  /**
   * 行分组统计文案，支持 {0}、{1} 占位符
   */
  rowGroupContentTotal: VueNode;
  seqTitle: VueNode;
  /**
   * 升序按钮提示语
   */
  sortAsc: VueNode;

  /**
   * 降序按钮提示语
   */
  sortDesc: VueNode;
  treeDragChild: VueNode;
}

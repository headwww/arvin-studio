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
   * 加载中提示语
   */
  loadingText?: string;
  /**
   * 宽像素提示
   */
  resizeColTip: VueNode;
  resizeRowTip: VueNode;
  /**
   * 行分组统计文案，支持 {0}、{1} 占位符
   */
  rowGroupContentTotal: VueNode;
  /**
   * 最大固定列数量提示，支持 {0} 占位符
   */
  maxFixedCol: VueNode;
  /**
   * 最大分组字段数量提示，支持 {0} 占位符
   */
  maxGroupCol: VueNode;
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
  /**
   * 树结构不支持操作提示，支持 {0} 占位符
   */
  noTree?: VueNode;
  /**
   * 数据分组后不支持操作提示，支持 {0} 占位符
   */
  noGroup?: VueNode;
  /**
   * 无法插入到指定位置提示
   */
  unableInsert?: VueNode;
}

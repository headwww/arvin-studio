import type { VueNode } from '../_util';

export interface TableLocale {
  /**
   * 筛选面板-全部选项文案
   */
  allFilter: VueNode;
  allTitle: VueNode;
  /**
   * 筛选面板-确认按钮文案
   */
  confirmFilter: VueNode;
  customAlignCenter: VueNode;
  customAlignLeft: VueNode;
  customAlignRight: VueNode;
  customAll: VueNode;
  customCancel: VueNode;
  customClose: VueNode;
  customColAlign: VueNode;
  customColFixed: VueNode;
  customColFooterAlign: VueNode;
  customColHeaderAlign: VueNode;
  customColTitle: VueNode;
  customColVisible: VueNode;
  customColWidth: VueNode;
  customConfirm: VueNode;
  customConfirmRestore: VueNode;
  customFixedLeft: VueNode;
  customFixedNone: VueNode;
  customFixedRight: VueNode;
  customMoveBottom: VueNode;
  customMoveDown: VueNode;
  customMoveTop: VueNode;
  customMoveUp: VueNode;
  customRestore: VueNode;
  customSortTip: VueNode;
  customTitle: VueNode;
  dragTip: VueNode;
  emptyText: VueNode;
  exportCancel: VueNode;
  exportColgroup: VueNode;
  exportColumn: VueNode;
  exportConfirm: VueNode;
  exportCurrentColumn: VueNode;
  exportFilename: VueNode;
  exportFooter: VueNode;
  exportHeader: VueNode;
  exportMerge: VueNode;
  exportMode: VueNode;
  exportModeCurrent: VueNode;
  exportModeEmpty: VueNode;
  exportModeSelected: VueNode;
  exportName: VueNode;
  exportNamePlaceholder: VueNode;
  exportOpts: VueNode;
  exportOriginal: VueNode;
  exportPrint: VueNode;
  exportPrintTitle: VueNode;
  exportRowGroupExpand: VueNode;
  exportSheetName: VueNode;
  exportSheetNamePlaceholder: VueNode;
  exportTitle: VueNode;
  exportTitleOpt: VueNode;
  exportTreeExpand: VueNode;
  exportType: VueNode;
  exportTypeCsv: VueNode;
  exportTypeHtml: VueNode;
  exportTypeTxt: VueNode;
  exportTypeXml: VueNode;
  exportUseStyle: VueNode;
  exportWidthMode: VueNode;
  /**
   * 筛选按钮提示语
   */
  filter: VueNode;
  importCancel: VueNode;
  importConfirm: VueNode;
  importFile: VueNode;
  importMode: VueNode;
  importModeCovering: VueNode;
  importModeInsertTop: VueNode;
  importSelectFile: VueNode;
  importTitle: VueNode;
  importType: VueNode;
  importTypeCsv: VueNode;
  importTypeHtml: VueNode;
  importTypeTxt: VueNode;
  importTypeXml: VueNode;
  /**
   * 加载中提示语
   */
  loadingText?: string;
  /**
   * 最大固定列数量提示，支持 {0} 占位符
   */
  maxFixedCol: VueNode;
  /**
   * 最大分组字段数量提示，支持 {0} 占位符
   */
  maxGroupCol: VueNode;
  /**
   * 菜单加载中提示语
   */
  menuLoading: VueNode;
  /**
   * 数据分组后不支持操作提示，支持 {0} 占位符
   */
  noGroup?: VueNode;
  /**
   * 树结构不支持操作提示，支持 {0} 占位符
   */
  noTree?: VueNode;
  /**
   * 筛选面板-重置按钮文案
   */
  resetFilter: VueNode;
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
  /**
   * 无法插入到指定位置提示
   */
  unableInsert?: VueNode;
}

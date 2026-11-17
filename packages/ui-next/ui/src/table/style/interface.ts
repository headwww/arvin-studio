import type { FullToken } from '../../theme/interface';

export interface ComponentToken {
  /** 边框色 */
  borderColor: string;
  /** 边框宽度 */
  borderWidth: number;

  /** 单元格激活区域背景色 */
  cellActiveAreaBackgroundColor: string;
  /** 单元格激活区域边框色 */
  cellActiveAreaBorderColor: string;
  /** 单元格激活区域边框宽度 */
  cellActiveAreaBorderWidth: number;
  /** 单元格选区背景色 */
  cellAreaBackgroundColor: string;
  /** 单元格选区边框色 */
  cellAreaBorderColor: string;
  /** 单元格选区边框宽度 */
  cellAreaBorderWidth: number;

  /** 行列选区状态背景色 */
  cellAreaStatusBackgroundColor: string;
  /** 单元格复制区域边框色 */
  cellClipAreaBorderColor: string;
  /** 单元格复制区域边框宽度 */
  cellClipAreaBorderWidth: number;
  /** 新增行标记颜色 */
  cellDirtyInsertColor: string;
  /** 修改单元格标记颜色 */
  cellDirtyUpdateColor: string;
  /** 单元格脏标记宽度 */
  cellDirtyWidth: number;
  /** 单元格扩展区域边框色 */
  cellExtendAreaBorderColor: string;
  /** 单元格扩展区域边框宽度 */
  cellExtendAreaBorderWidth: number;
  /** 单元格选区扩展按钮背景色 */
  cellMainAreaExtensionBackgroundColor: string;
  /** 单元格选区扩展按钮边框色 */
  cellMainAreaExtensionBorderColor: string;
  /** 表格校验错误单元格背景色 */
  cellValidateErrorCellBackgroundColor: string;
  /** 表格校验错误色，也用于待删除行删除线颜色 */
  cellValidateErrorColor: string;
  /** 表格校验错误提示（normal 主题）背景色 */
  cellValidateErrorThemeNormalBackgroundColor: string;
  /** 选区背景色 */
  checkboxRangeBackgroundColor: string;
  /** 选区边框色 */
  checkboxRangeBorderColor: string;
  /** 选区边框Width */
  checkboxRangeBorderWidth: number;
  /** 当前列背景色 */
  columnCurrentBackgroundColor: string;
  /** 列悬浮背景色 */
  columnHoverBackgroundColor: string;
  /** 悬浮当前列背景色 */
  columnHoverCurrentBackgroundColor: string;
  /** 列图标颜色（排序/筛选箭头） */
  columnIconBorderColor: string;
  /** 拖拽经过时的高亮背景色 */
  dragOverBackgroundColor: string;
  /** 表格内容字体大小 */
  contentFontSize: number;
  /**  大号表格内容字体大小*/
  contentFontSizeLG: number;
  /** 小号表格内容字体大小 */
  contentFontSizeSM: number;
  /** 当前档位行高 */
  currentRowLineHeight: number;
  /** 禁用文字色） */
  disabledColor: string;
  /** 展开行默认内边距 */
  expandPaddingDefault: number;
  /** 固定列滚动时的阴影颜色 */
  fixedScrollingBoxShadowColor: string;
  /** 固定左侧列滚动时的阴影 */
  fixedLeftScrollingBoxShadow: string;
  /** 固定右侧列滚动时的阴影 */
  fixedRightScrollingBoxShadow: string;
  /** 表尾背景 */
  footerBackgroundColor: string;
  /** 表尾文字颜色 */
  footerFontColor: string;
  /** 表头背景 */
  headerBackgroundColor: string;
  /** 表头文字颜色 */
  headerFontColor: string;
  /** 表头文字字重 */
  headerFontWeight: number;
  /** @internal */
  headerIconColor: string;
  /** 表格内容区背景 */
  layoutBackgroundColor: string;
  /** 占位符文字色 */
  placeholderColor: string;
  /** 主色/链接/激活色） */
  primaryColor: string;
  /** 列宽拖拽辅助线颜色 */
  resizableLineColor: string;
  /** 复选行选中背景色 */
  rowCheckboxCheckedBackgroundColor: string;
  /** 当前行背景色 */
  rowCurrentBackgroundColor: string;
  /** 表格默认尺寸下的行高（px），空数据占位块 min-height 复用此值 */
  rowHeight: number;
  /** 表格 large 尺寸（size="large"）下的行高（px） */
  rowHeightLG: number;
  /** 表格 small 尺寸（size="small"）下的行高（px） */
  rowHeightSM: number;
  /** 行悬浮背景色 */
  rowHoverBackgroundColor: string;
  /** 悬浮复选选中行背景色 */
  rowHoverCheckboxCheckedBackgroundColor: string;
  /** 悬浮当前行背景色 */
  rowHoverCurrentBackgroundColor: string;
  /** 悬浮单选选中行背景色 */
  rowHoverRadioCheckedBackgroundColor: string;
  /** 悬浮斑马纹行背景色 */
  rowHoverStripedBackgroundColor: string;
  /** 单选行选中背景色 */
  rowRadioCheckedBackgroundColor: string;
  /** 横向滚动条高度（px） */
  scrollbarHeight: number;
  /** 纵向滚动条宽度（px） */
  scrollbarWidth: number;
  /** 斑马线背景 */
  stripedBackgroundColor: string;
  /** 树节点连接线颜色 */
  treeNodeLineColor: string;
  /** 树节点连接线样式 */
  treeNodeLineStyle: string;
}

export interface TableToken extends FullToken<'Table'> {
  /** 当前档位单元格内边距 */
  cellPadding: number;
  /** large 档位单元格内边距 */
  cellPaddingLG: number;
  /** small、mini 档位单元格内边距 */
  cellPaddingSM: number;
  /** 当前档位单元格内边距，medium、small、mini 都从这里取 */
  currentCellPadding: number;
  /** large 档位单元格内边距 */
  currentCellPaddingLG: number;
  /** small、mini 档位单元格内边距 */
  currentCellPaddingSM: number;
}

import type { GetDefaultToken } from '../../theme/interface';

import { FastColor } from '@arvin-studio/headless';

// 必须返回 ComponentToken
export const prepareComponentToken: GetDefaultToken<'Table'> = (token) => {
  const contentFontSize = token.contentFontSize ?? token.fontSize;
  const contentFontSizeSM = token.contentFontSizeSM ?? token.fontSizeSM;
  const contentFontSizeLG = token.contentFontSizeLG ?? token.fontSizeLG;

  const currentCellPaddingSM = 5;
  const currentCellPadding = 7;
  const currentCellPaddingLG = 9;

  const {
    colorBgContainer,
    colorTextDisabled,
    colorBorderSecondary,
    colorBorder,
    colorTextPlaceholder,
    colorPrimary,
    colorText,
    colorWhite,
    colorFillAlter,
    colorSuccess,
    colorWarning,
    colorFillTertiary,
    colorFillSecondary,
    colorError,
    colorIcon,
    opacityLoading,
  } = token;

  // ── 调色盘 ──
  // 每个值后面标注 vxe 原始 SCSS 变量（light 主题值），见 vxe-table-main/styles/variable.scss
  // 半透明 token（colorFillAlter 等）先按容器背景合成，才能拿到可直接比较的实色
  const solidFill = (color: string) =>
    new FastColor(color).onBackground(colorBgContainer).toHexString();
  const mixColor = (base: string, target: string, weight: number) =>
    new FastColor(base).mix(target, weight).toHexString();
  const alphaColor = (color: string, alpha: number) =>
    new FastColor(color)
      .setA(alpha)
      .onBackground(colorBgContainer)
      .toHexString();

  const colorFillAlterSolid = solidFill(colorFillAlter);

  const baseColorAction = new FastColor(colorIcon);

  // 边框 #e8eaec：colorBorder → colorBorderSecondary 之间，再掺一点主色去掉纯灰感
  const borderColor = mixColor(
    mixColor(colorBorderSecondary, colorBorder, 20),
    colorPrimary,
    2,
  );

  // 表头 #f8f8f9 / 斑马线 #fafafa：两者只差一档，vxe 也是分开定义
  const headerBg = mixColor(colorFillAlterSolid, colorBorder, 5);
  const stripedBg = colorFillAlterSolid;

  // 行 hover #f5f7fa / 列 hover #eceef1
  const rowHoverBg = solidFill(colorFillTertiary);
  const columnHoverBg = mixColor(
    solidFill(colorFillSecondary),
    colorPrimary,
    2,
  );

  // 当前行/当前列 #e6f7ff，hover 态 #d7effb
  const rowCurrentBg = alphaColor(colorPrimary, 0.08);
  const rowHoverCurrentBg = alphaColor(colorPrimary, 0.14);

  // 选中行 #fff3e0，hover 态 #ffebbc（暖色，与主色无关）
  const rowCheckedBg = alphaColor(colorWarning, 0.12);
  const rowHoverCheckedBg = alphaColor(colorWarning, 0.27);

  // 树节点连接线 #909399
  const treeNodeLineColorValue = mixColor(
    mixColor(colorText, colorBgContainer, 57),
    colorPrimary,
    3,
  );

  // 列图标边框 #c0c4cc
  const columnIconBorderColorValue = mixColor(
    mixColor(solidFill(colorTextPlaceholder), colorBgContainer, 10),
    colorPrimary,
    4,
  );

  // 单元格选区 rgba(64,158,255,0.2) / 选区状态 rgba(64,158,255,0.1)
  const cellAreaBg = new FastColor(colorPrimary).setA(0.2).toRgbString();
  const cellAreaStatusBg = new FastColor(colorPrimary).setA(0.1).toRgbString();

  // 对应 vxe 的 rgba(245, 108, 108, 0.1)：校验错误色的 10% 透明度
  const cellValidateErrorCellBg = new FastColor(colorError)
    .setA(0.1)
    .toHexString();

  // 对应 vxe 的 rgba(0, 0, 0, 0.12)：固定列滚动阴影色
  const fixedScrollingBoxShadowColor = 'rgba(0, 0, 0, 0.12)';

  return {
    // 布局/边框
    layoutBackgroundColor: colorBgContainer,
    headerFontColor: colorText,
    borderColor,
    borderWidth: 1.04,
    resizableLineColor: colorBorder,

    // 固定列滚动阴影
    fixedScrollingBoxShadowColor,
    fixedLeftScrollingBoxShadow: `8px 0px 10px -5px ${fixedScrollingBoxShadowColor}`,
    fixedRightScrollingBoxShadow: `-8px 0px 10px -5px ${fixedScrollingBoxShadowColor}`,

    // 内容字体
    contentFontSize,
    contentFontSizeSM,
    contentFontSizeLG,

    // 单元格内边距
    currentCellPadding,
    currentCellPaddingLG,
    currentCellPaddingSM,

    // 基础状态颜色
    currentRowLineHeight: 22,
    placeholderColor: colorTextPlaceholder,
    primaryColor: colorPrimary,
    disabledColor: colorTextDisabled,
    footerBackgroundColor: colorBgContainer,
    footerFontColor: colorText,
    headerBackgroundColor: headerBg,
    headerFontWeight: 700,
    stripedBackgroundColor: stripedBg,

    // 行高
    rowHeight: 44,
    rowHeightSM: 40,
    rowHeightLG: 48,

    // 滚动条
    scrollbarWidth: 18,
    scrollbarHeight: 18,

    // 复选框选区
    checkboxRangeBackgroundColor: cellAreaBg,
    checkboxRangeBorderColor: colorPrimary,
    checkboxRangeBorderWidth: 1,

    // 单元格选区
    cellAreaBackgroundColor: cellAreaBg,
    cellAreaBorderColor: colorPrimary,
    cellAreaBorderWidth: 1,

    // 单元格选区扩展按钮
    cellMainAreaExtensionBorderColor: colorWhite,
    cellMainAreaExtensionBackgroundColor: colorPrimary,

    // 单元格扩展区域
    cellExtendAreaBorderColor: colorPrimary,
    cellExtendAreaBorderWidth: 2,
    // 单元格复制区域
    cellClipAreaBorderWidth: 3,
    cellClipAreaBorderColor: colorPrimary,

    // 单元格激活区域
    cellActiveAreaBorderColor: colorPrimary,
    cellActiveAreaBorderWidth: 1,
    cellActiveAreaBackgroundColor: 'transparent',

    // 行列选区状态
    cellAreaStatusBackgroundColor: cellAreaStatusBg,
    // 行高亮
    rowRadioCheckedBackgroundColor: rowCheckedBg,
    rowCheckboxCheckedBackgroundColor: rowCheckedBg,
    rowCurrentBackgroundColor: rowCurrentBg,
    rowHoverBackgroundColor: rowHoverBg,
    columnCurrentBackgroundColor: rowCurrentBg,
    columnHoverBackgroundColor: columnHoverBg,
    columnHoverCurrentBackgroundColor: rowHoverCurrentBg,
    columnIconBorderColor: columnIconBorderColorValue,
    rowHoverStripedBackgroundColor: rowHoverBg,
    rowHoverRadioCheckedBackgroundColor: rowHoverCheckedBg,
    rowHoverCheckboxCheckedBackgroundColor: rowHoverCheckedBg,
    rowHoverCurrentBackgroundColor: rowHoverCurrentBg,
    dragOverBackgroundColor: new FastColor('#ffffc8').setA(0.3).toRgbString(),

    // 单元格脏标记
    cellDirtyWidth: 5,
    cellDirtyInsertColor: colorSuccess,
    cellDirtyUpdateColor: colorError,

    // 表格校验错误色 / 待删除行删除线
    cellValidateErrorColor: colorError,
    // 负数金额文字色（vxe 与校验错误同色 #f56c6c）
    cellNegativeColor: colorError,
    // 校验错误单元格背景（show--valid-bg）
    cellValidateErrorCellBackgroundColor: cellValidateErrorCellBg,
    // 校验错误提示 normal 主题背景
    cellValidateErrorThemeNormalBackgroundColor: colorBgContainer,
    // 展开行默认内边距
    expandPaddingDefault: 16,

    // 树节点连接线
    treeNodeLineColor: treeNodeLineColorValue,
    treeNodeLineStyle: 'dotted',

    cellPaddingSM: 5,
    cellPadding: 7,
    cellPaddingLG: 9,

    headerIconColor: baseColorAction
      .clone()
      .setA(baseColorAction.a * opacityLoading)
      .toRgbString(),
  };
};

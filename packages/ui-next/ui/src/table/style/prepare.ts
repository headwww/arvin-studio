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
    colorTextTertiary,
    colorPrimary,
    colorText,
    colorWhite,
    colorFillAlter,
    colorSuccess,
    colorWarning,
    colorPrimaryBg,
    colorFillTertiary,
    colorPrimaryBgHover,
    colorFillSecondary,
    colorError,
    colorIcon,
    opacityLoading,
  } = token;

  const colorFillAlterSolid = new FastColor(colorFillAlter)
    .onBackground(colorBgContainer)
    .toHexString();

  const baseColorAction = new FastColor(colorIcon);

  const cellBg = new FastColor(colorPrimary).setA(0.12).toHexString();

  // 对应 vxe 的 rgba(245, 108, 108, 0.1)：校验错误色的 10% 透明度
  const cellValidateErrorCellBg = new FastColor(colorError)
    .setA(0.1)
    .toHexString();

  return {
    // 布局/边框
    layoutBackgroundColor: colorBgContainer,
    headerFontColor: colorText,
    borderColor: colorBorderSecondary,
    borderWidth: 1.04,
    resizableLineColor: colorBorder,

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
    headerBackgroundColor: colorFillAlterSolid,
    headerFontWeight: 700,
    stripedBackgroundColor: colorFillAlterSolid,

    // 行高
    rowHeight: 44,
    rowHeightSM: 40,
    rowHeightLG: 48,

    // 滚动条
    scrollbarWidth: 18,
    scrollbarHeight: 18,

    // 复选框选区
    checkboxRangeBackgroundColor: cellBg,
    checkboxRangeBorderColor: token.primaryColor!,
    checkboxRangeBorderWidth: 1,

    // 单元格选区
    cellAreaBackgroundColor: cellBg,
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
    cellActiveAreaBackgroundColor: cellBg,

    // 行列选区状态
    cellAreaStatusBackgroundColor: cellBg,
    // 行高亮
    rowRadioCheckedBackgroundColor: colorPrimaryBg,
    rowCheckboxCheckedBackgroundColor: colorPrimaryBg,
    rowCurrentBackgroundColor: colorPrimaryBg,
    rowHoverBackgroundColor: colorFillTertiary,
    columnCurrentBackgroundColor: colorPrimaryBgHover,
    columnHoverBackgroundColor: colorFillTertiary,
    columnHoverCurrentBackgroundColor: colorPrimaryBgHover,
    columnIconBorderColor: '#c0c4cc',
    rowHoverStripedBackgroundColor: colorFillSecondary,
    rowHoverRadioCheckedBackgroundColor: colorPrimaryBgHover,
    rowHoverCheckboxCheckedBackgroundColor: colorPrimaryBgHover,
    rowHoverCurrentBackgroundColor: colorPrimaryBgHover,

    // 单元格脏标记
    cellDirtyWidth: 5,
    cellDirtyInsertColor: colorSuccess,
    cellDirtyUpdateColor: colorWarning,

    // 表格校验错误色 / 待删除行删除线
    cellValidateErrorColor: colorError,
    // 校验错误单元格背景（show--valid-bg）
    cellValidateErrorCellBackgroundColor: cellValidateErrorCellBg,
    // 校验错误提示 normal 主题背景
    cellValidateErrorThemeNormalBackgroundColor: colorBgContainer,
    // 展开行默认内边距
    expandPaddingDefault: 16,

    // 树节点连接线
    treeNodeLineColor: colorTextTertiary,
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

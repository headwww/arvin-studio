import type { CSSProperties } from 'vue';

import type { CSSObject } from '@arvin-studio/cssinjs';

import type {
  FullToken,
  GenStyleFn,
  GetDefaultToken,
  PresetColorKey,
} from '../../theme/internal';

import { unit } from '@arvin-studio/cssinjs';
import { Color as VcColor } from '@arvin-studio/headless';

import { AggregationColor } from '../../color-picker/color';
import { getLineHeight, mergeToken, PresetColors } from '../../theme/internal';
import getAlphaColor from '../../theme/util/getAlphaColor';

export interface ComponentToken {
  /**
   * @deprecated use `colorBorderDisabled` instead
   * @desc 禁用状态边框颜色
   * @descEN Border color of disabled button
   */
  borderColorDisabled: string;
  /**
   * @desc 按钮内容字体大小
   * @descEN Font size of button content
   */
  contentFontSize: number;
  /**
   * @desc 大号按钮内容字体大小
   * @descEN Font size of large button content
   */
  contentFontSizeLG: number;
  /**
   * @desc 小号按钮内容字体大小
   * @descEN Font size of small button content
   */
  contentFontSizeSM: number;
  /**
   * @desc 按钮内容字体行高
   * @descEN Line height of button content
   * @deprecated not used
   */
  contentLineHeight: number;
  /**
   * @desc 大号按钮内容字体行高
   * @descEN Line height of large button content
   * @deprecated not used
   */
  contentLineHeightLG: number;
  /**
   * @desc 小号按钮内容字体行高
   * @descEN Line height of small button content
   * @deprecated not used
   */
  contentLineHeightSM: number;
  /**
   * @desc 危险按钮文本颜色
   * @descEN Text color of danger button
   */
  dangerColor: string;
  /**
   * @desc 危险按钮阴影
   * @descEN Shadow of danger button
   */
  dangerShadow: string;
  /**
   * @desc type='dashed' 禁用状态下的背景颜色
   * @descE background color when type='dashed' is disabled
   */
  dashedBgDisabled: string;
  /**
   * @desc 默认按钮激活态背景色
   * @descEN Background color of default button when active
   */
  defaultActiveBg: string;
  /**
   * @desc 默认按钮激活态边框颜色
   * @descEN Border color of default button when active
   */
  defaultActiveBorderColor: string;
  /**
   * @desc 默认按钮激活态文字颜色
   * @descEN Text color of default button when active
   */
  defaultActiveColor: string;
  /**
   * @desc 默认按钮背景色
   * @descEN Background color of default button
   */
  defaultBg: string;
  /**
   * @desc type='default' 禁用状态下的背景颜色
   * @descE background color when type='default' is disabled
   */
  defaultBgDisabled: string;
  /**
   * @desc 默认按钮边框颜色
   * @descEN Border color of default button
   */
  defaultBorderColor: string;
  /**
   * @desc 默认按钮文本颜色
   * @descEN Text color of default button
   */
  defaultColor: string;
  /**
   * @desc 默认幽灵按钮边框颜色
   * @descEN Border color of default ghost button
   */
  defaultGhostBorderColor: string;
  /**
   * @desc 默认幽灵按钮文本颜色
   * @descEN Text color of default ghost button
   */
  defaultGhostColor: string;
  /**
   * @desc 默认按钮悬浮态背景色
   * @descEN Background color of default button when hover
   */
  defaultHoverBg: string;
  /**
   * @desc 默认按钮悬浮态边框颜色
   * @descEN Border color of default button
   */
  defaultHoverBorderColor: string;
  /**
   * @desc 默认按钮悬浮态文本颜色
   * @descEN Text color of default button when hover
   */
  defaultHoverColor: string;
  /**
   * @desc 默认按钮阴影
   * @descEN Shadow of default button
   */
  defaultShadow: string;
  /**
   * @desc 文字字重
   * @descEN Font weight of text
   */
  fontWeight: CSSProperties['fontWeight'];
  /**
   * @desc 幽灵按钮背景色
   * @descEN Background color of ghost button
   */
  ghostBg: string;
  /**
   * @desc 图标文字间距
   * @descEN Gap between icon and text
   */
  iconGap: CSSProperties['gap'];
  /**
   * @desc 链接按钮悬浮态背景色
   * @descEN Background color of link button when hover
   */
  linkHoverBg: string;
  /**
   * @desc 只有图标的按钮图标尺寸
   * @descEN Icon size of button which only contains icon
   */
  onlyIconSize: number | string;
  /**
   * @desc 大号只有图标的按钮图标尺寸
   * @descEN Icon size of large button which only contains icon
   */
  onlyIconSizeLG: number | string;
  /**
   * @desc 小号只有图标的按钮图标尺寸
   * @descEN Icon size of small button which only contains icon
   */
  onlyIconSizeSM: number | string;
  /**
   * @desc 按钮纵向内间距
   * @descEN Vertical padding of button
   * @deprecated not used
   */
  paddingBlock: CSSProperties['paddingBlock'];
  /**
   * @desc 大号按钮纵向内间距
   * @descEN Vertical padding of large button
   * @deprecated not used
   */
  paddingBlockLG: CSSProperties['paddingBlock'];
  /**
   * @desc 小号按钮纵向内间距
   * @descEN Vertical padding of small button
   * @deprecated not used
   */
  paddingBlockSM: CSSProperties['paddingBlock'];
  /**
   * @desc 按钮横向内间距
   * @descEN Horizontal padding of button
   */
  paddingInline: CSSProperties['paddingInline'];
  /**
   * @desc 大号按钮横向内间距
   * @descEN Horizontal padding of large button
   */
  paddingInlineLG: CSSProperties['paddingInline'];
  /**
   * @desc 小号按钮横向内间距
   * @descEN Horizontal padding of small button
   */
  paddingInlineSM: CSSProperties['paddingInline'];
  /**
   * @desc 主要按钮文本颜色
   * @descEN Text color of primary button
   */
  primaryColor: string;
  /**
   * @desc 主要按钮阴影
   * @descEN Shadow of primary button
   */
  primaryShadow: string;
  /**
   * @desc 主要填充按钮的浅色背景颜色
   * @descEN Background color of primary filled button
   */
  /**
   * @desc 默认实心按钮的文本色
   * @descEN Default text color for solid buttons.
   */
  solidTextColor: string;
  /**
   * @desc 文本按钮悬浮态背景色
   * @descEN Background color of text button when hover
   */
  textHoverBg: string;
  /**
   * @desc 默认文本按钮激活态文字颜色
   * @descEN Default text color for text buttons on active
   */
  textTextActiveColor: string;
  /**
   * @desc 默认文本按钮的文本色
   * @descEN Default text color for text buttons
   */
  textTextColor: string;
  /**
   * @desc 默认文本按钮悬浮态文本颜色
   * @descEN Default text color for text buttons on hover
   */
  textTextHoverColor: string;
}

type ShadowColorMap = {
  /**
   * @desc 预设按钮的阴影色
   * @descEN Shadow colors of preset button
   */
  [Key in `${PresetColorKey}ShadowColor`]: string;
};

type PresetColorHoverActiveMap = {
  [Key in `${PresetColorKey}Active` | `${PresetColorKey}Hover`]: string;
};

interface GroupToken {
  /**
   * @desc 按钮组边框颜色
   * @descEN Border color of button group
   * @internal Button.Group 已废弃相关token不应该在显示在文档上
   */

  groupBorderColor: string;
}

export interface ButtonToken
  extends
    FullToken<'Button'>,
    GroupToken,
    PresetColorHoverActiveMap,
    ShadowColorMap {
  /**
   * @desc 只有图标的按钮图标尺寸
   * @descEN Icon size of button which only contains icon
   */
  buttonIconOnlyFontSize: number | string;
  /**
   * @desc 按钮横向内边距
   * @descEN Horizontal padding of button
   */
  buttonPaddingHorizontal: CSSProperties['paddingInline'];
  /**
   * @desc 按钮纵向内边距
   * @descEN Vertical padding of button
   */
  buttonPaddingVertical: CSSProperties['paddingBlock'];
}

/**
 * 将 FullToken<'Button'> 转为 ButtonToken，注入 3 个计算属性。
 *
 * 这层转换让样式函数用更直观的名字：
 *   paddingInline       → buttonPaddingHorizontal（按钮横向内间距 = 全局内容间距）
 *   onlyIconSize        → buttonIconOnlyFontSize（纯图标按钮的图标尺寸）
 *   borderColorDisabled → colorBorderDisabled（做一次重映射，处理废弃命名）
 */
export function prepareToken(token: Parameters<GenStyleFn<'Button'>>[0]) {
  const { paddingInline, onlyIconSize, colorBorderDisabled } = token;

  const buttonToken = mergeToken<ButtonToken>(token, {
    buttonPaddingHorizontal: paddingInline,
    buttonPaddingVertical: 0,
    buttonIconOnlyFontSize: onlyIconSize,
    colorBorderDisabled,
  });

  return buttonToken;
}

/**
 * 从全局 AliasToken 计算 Button 的 40+ 个默认 ComponentToken 值。
 *
 * 这是 genStyleHooks('Button', styleFn, prepareComponentToken) 的第三个参数。
 * 输入全局 token，输出 Button 专属的默认值。用户通过 ConfigProvider 覆盖的值
 * 会由 genComponentStyleHook 内部的 getComponentToken 合并到这些默认值之上。
 *
 * 计算结果分为 4 类：
 *   - 预设色阴影：12 种预设色 × 控制线宽度 × 半透明混合
 *   - 字重/间距/阴影：fontWeight(400)、iconGap(token.marginXS)、xxxShadow
 *   - 颜色语义：defaultColor/HoverBg/ActiveBorder...（default/primary/danger 三态）
 *   - 内间距：水平方向 = 内容间距 - 边框宽度；垂直方向 = (控件高度 - 字号×行高)/2 - 边框
 *
 * @param token - 全局 AliasToken（200+ 个值，来自 useCacheToken 的派生结果）
 */
export const prepareComponentToken: GetDefaultToken<'Button'> = (token) => {
  // 内容字号回退：优先用 Button 专属的 contentFontSize，否则用全局 fontSize
  const contentFontSize = token.contentFontSize ?? token.fontSize;
  const contentFontSizeSM = token.contentFontSizeSM ?? token.fontSize;
  const contentFontSizeLG = token.contentFontSizeLG ?? token.fontSizeLG;

  // 内容行高回退：优先用 Button 专属的，否则用全局 fontSize 算出默认行高
  const contentLineHeight =
    token.contentLineHeight ?? getLineHeight(contentFontSize);
  const contentLineHeightSM =
    token.contentLineHeightSM ?? getLineHeight(contentFontSizeSM);
  const contentLineHeightLG =
    token.contentLineHeightLG ?? getLineHeight(contentFontSizeLG);

  // 实心按钮文本色：根据背景色亮度自动选黑或白
  const solidTextColor = isBright(
    new AggregationColor(token.colorBgSolid),
    '#fff',
  )
    ? '#000'
    : '#fff';

  // 12 种预设色各自的阴影：基于每种颜色的第 1 梯度 + 容器背景色做半透明混合
  const shadowColorTokens = PresetColors.reduce<CSSObject>(
    (prev, colorKey) => ({
      ...prev,
      [`${colorKey}ShadowColor`]: `0 ${unit(token.controlOutlineWidth)} 0 ${getAlphaColor(token[`${colorKey}1`], token.colorBgContainer)}`,
    }),
    {},
  );

  // paddingBlock 计算公式：(控件高度 - 内容字号×行高) / 2 - 边框宽度
  // 确保文字在按钮中垂直居中
  const defaultBgDisabled = token.colorBgContainerDisabled;
  const dashedBgDisabled = token.colorBgContainerDisabled;

  return {
    // 12 种预设色的阴影
    ...shadowColorTokens,

    // ── 字重 / 间距 / 阴影 ──
    fontWeight: 400,
    iconGap: token.marginXS,
    defaultShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlTmpOutline}`,
    primaryShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlOutline}`,
    dangerShadow: `0 ${token.controlOutlineWidth}px 0 ${token.colorErrorOutline}`,

    // ── 颜色语义 ──
    primaryColor: token.colorTextLightSolid,
    dangerColor: token.colorTextLightSolid,
    borderColorDisabled: token.colorBorderDisabled,
    defaultGhostColor: token.colorBgContainer,
    ghostBg: 'transparent',
    defaultGhostBorderColor: token.colorBgContainer,
    defaultColor: token.colorText,
    defaultBg: token.colorBgContainer,
    defaultBorderColor: token.colorBorder,
    defaultBorderColorDisabled: token.colorBorder,
    defaultHoverBg: token.colorBgContainer,
    defaultHoverColor: token.colorPrimaryHover,
    defaultHoverBorderColor: token.colorPrimaryHover,
    defaultActiveBg: token.colorBgContainer,
    defaultActiveColor: token.colorPrimaryActive,
    defaultActiveBorderColor: token.colorPrimaryActive,
    solidTextColor,
    linkHoverBg: 'transparent',
    textTextColor: token.colorText,
    textTextHoverColor: token.colorText,
    textTextActiveColor: token.colorText,
    textHoverBg: token.colorFillTertiary,

    // ── 水平内间距（内容间距 - 边框宽度，补偿边框带来的额外宽度） ──
    paddingInline: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineLG: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineSM: 8 - token.lineWidth,

    // ── 纯图标按钮图标尺寸（inherit 表示继承父级字号） ──
    onlyIconSize: 'inherit',
    onlyIconSizeSM: 'inherit',
    onlyIconSizeLG: 'inherit',

    groupBorderColor: token.colorPrimaryHover,

    // ── 内容字体（可能被用户覆盖为自定义值） ──
    contentFontSize,
    contentFontSizeSM,
    contentFontSizeLG,
    contentLineHeight,
    contentLineHeightSM,
    contentLineHeightLG,

    // ── 纵向内间距（通过公式计算，保证文字在按钮中垂直居中） ──
    // (控件高度 - 内容字号×行高) / 2 - 边框宽度，最小为 0
    paddingBlock: Math.max(
      (token.controlHeight - contentFontSize * contentLineHeight) / 2 -
        token.lineWidth,
      0,
    ),
    paddingBlockSM: Math.max(
      (token.controlHeightSM - contentFontSizeSM * contentLineHeightSM) / 2 -
        token.lineWidth,
      0,
    ),
    paddingBlockLG: Math.max(
      (token.controlHeightLG - contentFontSizeLG * contentLineHeightLG) / 2 -
        token.lineWidth,
      0,
    ),

    // ── 禁用态背景色 ──
    defaultBgDisabled,
    dashedBgDisabled,
  };
};

function isBright(value: AggregationColor, bgColorToken: string) {
  const { r, g, b, a } = value.toRgb();
  const hsv = new VcColor(value.toRgbString())
    .onBackground(bgColorToken)
    .toHsv();
  if (a <= 0.5) {
    // Adapted to dark mode
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
}

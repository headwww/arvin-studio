/**
 * Typography 样式 mixins（各能力块独立的样式生成器）
 *
 * 按能力拆分：标题 / 链接 / 重置（code/mark/列表/表格等内联元素排版）/
 * 编辑 / 复制 / 省略号，由 style/index.ts 统一组装。
 * 全部函数都基于 TypographyToken 生成，遵循"样式跟随 token"的规范。
 */
import type { CSSObject } from '@arvin-studio/cssinjs';

import type { TypographyToken } from '.';
import type { GenerateStyle } from '../../theme/internal';

/*
.typography-title(@fontSize; @fontWeight; @lineHeight; @headingColor; @headingMarginBottom;) {
 margin-bottom: @headingMarginBottom;
 color: @headingColor;
 font-weight: @fontWeight;
 fontSize: @fontSize;
 line-height: @lineHeight;
}
*/
import { unit } from '@arvin-studio/cssinjs';
import { gold } from '@arvin-studio/headless';

import { operationUnit } from '../../style';

/** 单个标题级别的样式（由 token 的 fontSizeHeadingN / colorTextHeading 驱动） */
function getTitleStyle(
  fontSize: number | string,
  lineHeight: number,
  color: string,
  token: TypographyToken,
) {
  const { titleMarginBottom, fontWeightStrong } = token;

  return {
    marginBottom: titleMarginBottom,
    color,
    fontWeight: fontWeightStrong,
    fontSize,
    lineHeight,
  };
}

export const getTitleStyles: GenerateStyle<TypographyToken, CSSObject> = (
  token,
) => {
  const headings = [1, 2, 3, 4, 5] as const;

  const styles: CSSObject = {};
  headings.forEach((headingLevel) => {
    styles[
      `
      h${headingLevel}&,
      div&-h${headingLevel},
      div&-h${headingLevel} > textarea,
      h${headingLevel}
    `
    ] = getTitleStyle(
      token[`fontSizeHeading${headingLevel}`],
      token[`lineHeightHeading${headingLevel}`],
      token.colorTextHeading,
      token,
    );
  });
  return styles;
};

/** 链接形态样式（Typography.Link）：operationUnit 交互反馈 + 禁用态 */
export const getLinkStyles: GenerateStyle<TypographyToken, CSSObject> = (
  token,
) => {
  const { componentCls } = token;
  const linkCls = `${componentCls}-link`;

  return {
    [`&${linkCls}`]: {
      ...operationUnit(token),
      userSelect: 'text',

      // 禁用：不可点击；操作区仍可交互（复制/编辑）
      [`&[disabled], &${componentCls}-disabled`]: {
        color: token.colorTextDisabled,
        cursor: 'not-allowed',

        '&:active, &:hover': {
          color: token.colorTextDisabled,
        },

        '&:active': {
          pointerEvents: 'none',

          // 禁用链接内的操作区放行点击
          [`${componentCls}-actions`]: {
            pointerEvents: 'auto',
          },
        },
      },
    },
  };
};

/** 行内元素重置样式：code/kbd/mark/下划线/删除线/列表/表格等排版细节 */
export const getResetStyles: GenerateStyle<TypographyToken, CSSObject> = (
  token,
) => ({
  // 行内代码
  code: {
    margin: '0 0.2em',
    paddingInline: '0.4em',
    paddingBlock: '0.2em 0.1em',
    fontSize: '85%',
    fontFamily: token.fontFamilyCode,
    background: 'rgba(150, 150, 150, 0.1)',
    border: `${unit(token.lineWidth)} ${token.lineType} rgba(100, 100, 100, 0.2)`,
    borderRadius: 3,
  },

  // 键盘键帽
  kbd: {
    margin: '0 0.2em',
    paddingInline: '0.4em',
    paddingBlock: '0.15em 0.1em',
    fontSize: '90%',
    fontFamily: token.fontFamilyCode,
    background: 'rgba(150, 150, 150, 0.06)',
    border: `${unit(token.lineWidth)} ${token.lineType} rgba(100, 100, 100, 0.2)`,
    borderBottomWidth: 2,
    borderRadius: 3,
  },

  // 高亮标记（antd 经典金色）
  mark: {
    padding: 0,
    // FIXME hardcode in v4
    backgroundColor: gold[2],
  },

  // 下划线
  'u, ins': {
    textDecoration: 'underline',
    textDecorationSkipInk: 'auto',
  },

  // 删除线
  's, del': {
    textDecoration: 'line-through',
  },

  // 加粗
  strong: {
    fontWeight: token.fontWeightStrong,
  },

  // list
  // 列表排版
  'ul, ol': {
    marginInline: 0,
    marginBlock: '0 1em',
    padding: 0,

    li: {
      marginInline: '20px 0',
      marginBlock: 0,
      paddingInline: '4px 0',
      paddingBlock: 0,
    },
  },

  ul: {
    listStyleType: 'circle',

    ul: {
      listStyleType: 'disc',
    },
  },

  ol: {
    listStyleType: 'decimal',
  },

  // pre & block
  // 预格式文本与引用块
  'pre, blockquote': {
    margin: '1em 0',
  },

  pre: {
    padding: '0.4em 0.6em',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    background: 'rgba(150, 150, 150, 0.1)',
    border: `${unit(token.lineWidth)} ${token.lineType} rgba(100, 100, 100, 0.2)`,
    borderRadius: 3,
    fontFamily: token.fontFamilyCode,

    // Compatible for marked
    // 兼容 markdown 渲染：pre 内 code 不重复装饰
    code: {
      display: 'inline',
      margin: 0,
      padding: 0,
      fontSize: 'inherit',
      fontFamily: 'inherit',
      background: 'transparent',
      border: 0,
    },
  },

  blockquote: {
    paddingInline: '0.6em 0',
    paddingBlock: 0,
    borderInlineStart: '4px solid rgba(100, 100, 100, 0.2)',
    opacity: 0.85,
  },

  // table - Follow Table component default style
  // 表格排版（对齐 Table 组件默认样式）
  table: {
    width: '100%',
    textAlign: 'start',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginBlock: '1em',

    'th, td': {
      padding: unit(token.padding),
      overflowWrap: 'break-word',
      borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorSplit}`,
    },

    // 表头两端圆角
    'thead > tr:first-child > th:first-child': {
      borderStartStartRadius: token.borderRadiusLG,
    },

    'thead > tr:first-child > th:last-child': {
      borderStartEndRadius: token.borderRadiusLG,
    },

    'thead > tr > th': {
      textAlign: 'start',
      position: 'relative',
      color: token.colorTextHeading,
      fontWeight: token.fontWeightStrong,
      backgroundColor: token.colorFillAlter,
      transition: `background-color ${token.motionDurationMid} ease`,

      // 表头列间分隔竖线
      '&:not(:last-child)::before': {
        position: 'absolute',
        top: '50%',
        insetInlineEnd: 0,
        width: 1,
        height: '1.6em',
        backgroundColor: token.colorSplit,
        transform: 'translateY(-50%)',
        content: '""',
      },
    },

    'tbody > tr': {
      '> th, > td': {
        transition: `background-color ${token.motionDurationMid} ease`,
      },
      // 行悬停高亮
      '&:hover > th, &:hover > td': {
        backgroundColor: token.colorFillAlter,
      },
    },
  },
});

/** 编辑态样式：edit-content 容器偏移 + 确认图标定位 + textarea 细节修复 */
export const getEditableStyles: GenerateStyle<TypographyToken, CSSObject> = (
  token,
) => {
  const { componentCls, paddingSM } = token;

  const inputShift = paddingSM;
  return {
    '&-edit-content': {
      position: 'relative',

      // div 容器：左/上微调对齐原文本位置
      'div&': {
        insetInlineStart: token.calc(token.paddingSM).mul(-1).equal(),
        insetBlockStart: token.calc(inputShift).div(-2).add(1).equal(),
        marginBottom: token.calc(inputShift).div(2).sub(2).equal(),
      },

      // 右下角的回车确认图标
      [`${componentCls}-edit-content-confirm`]: {
        position: 'absolute',
        insetInlineEnd: token.calc(token.marginXS).add(2).equal(),
        insetBlockEnd: token.marginXS,
        color: token.colorIcon,
        // default style
        // 防止继承标题的粗体/字号/斜体
        fontWeight: 'normal',
        fontSize: token.fontSize,
        fontStyle: 'normal',
        pointerEvents: 'none', // 纯视觉提示，不拦截点击
      },

      textarea: {
        margin: '0!important',
        // Fix Editable Textarea flash in Firefox
        // 修复 Firefox 中 textarea 闪烁
        MozTransition: 'none',
        height: '1em',
      },
    },
  };
};

/** 复制态样式：已复制成功色 + 纯图标模式去除左间距 */
export const getCopyableStyles: GenerateStyle<TypographyToken, CSSObject> = (
  token,
) => ({
  [`${token.componentCls}-copy-success`]: {
    [`
    &,
    &:hover,
    &:focus`]: {
      color: token.colorSuccess,
    },
  },
  [`${token.componentCls}-copy-icon-only`]: {
    marginInlineStart: 0,
  },
});

/** 省略号样式：单行 text-overflow / 多行 line-clamp（CSS 省略路径） */
export function getEllipsisStyles(): CSSObject {
  return {
    // 可省略的内联元素需支持宽度约束
    [`
  a&-ellipsis,
  span&-ellipsis
  `]: {
      display: 'inline-block',
      maxWidth: '100%',
    },

    // 单行省略
    '&-ellipsis-single-line': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',

      // https://blog.csdn.net/iefreer/article/details/50421025
      // 内联元素垂直对齐底部，避免省略号悬空
      'a&, span&': {
        verticalAlign: 'bottom',
      },

      // 单行省略时行内 code 特殊处理
      '> code': {
        paddingBlock: 0,
        maxWidth: 'calc(100% - 1.2em)',
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'bottom',
        boxSizing: 'content-box',
      },
    },

    // 多行省略（-webkit-box + line-clamp；行数由 JS 内联覆盖）
    '&-ellipsis-multiple-line': {
      display: '-webkit-box',
      overflow: 'hidden',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
    },
  };
}

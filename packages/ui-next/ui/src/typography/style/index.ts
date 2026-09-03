/**
 * Typography 样式入口
 *
 * 组装各 mixin（标题/重置/链接/编辑/复制/省略号）为完整组件样式，
 * 并定义组件级 token（titleMarginTop / titleMarginBottom）。
 * 全部基于主题 token 生成，支持 CSS 变量与暗色主题。
 */
import type { CSSObject } from '@arvin-studio/cssinjs';

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from '../../theme/internal';

import { operationUnit } from '../../style';
import { genStyleHooks } from '../../theme/internal';
import {
  getCopyableStyles,
  getEditableStyles,
  getEllipsisStyles,
  getLinkStyles,
  getResetStyles,
  getTitleStyles,
} from './mixins';

/** Component only token. Which will handle additional calculation of alias token */
/** 组件级 token（会在全局 token 基础上额外计算） */
export interface ComponentToken {
  /**
   * @desc 标题下间距
   * @descEN Margin bottom of title
   */
  titleMarginBottom: number | string;
  /**
   * @desc 标题上间距
   * @descEN Margin top of title
   */
  titleMarginTop: number | string;
}

export type TypographyToken = FullToken<'Typography'>;

/** 主体样式：基础文字样式 + 类型色 + 禁用态 + 标题间距 + 各 mixin */
const genTypographyStyle: GenerateStyle<TypographyToken, CSSObject> = (
  token,
) => {
  const { componentCls, titleMarginTop } = token;

  return {
    [componentCls]: {
      color: token.colorText,
      wordBreak: 'break-word',
      lineHeight: token.lineHeight,
      // 语义化类型色（secondary/success/warning/danger），链接形态同样生效
      [`&${componentCls}-secondary, &${componentCls}-link${componentCls}-secondary`]:
        {
          color: token.colorTextDescription,
        },

      [`&${componentCls}-success, &${componentCls}-link${componentCls}-success`]:
        {
          color: token.colorSuccessText,
        },

      [`&${componentCls}-warning, &${componentCls}-link${componentCls}-warning`]:
        {
          color: token.colorWarningText,
        },

      [`&${componentCls}-danger, &${componentCls}-link${componentCls}-danger`]:
        {
          color: token.colorErrorText,
          // danger 链接的激活/聚焦/悬停色
          [`&${componentCls}-link:active, &${componentCls}-link:focus`]: {
            color: token.colorErrorTextActive,
          },
          [`&${componentCls}-link:hover`]: {
            color: token.colorErrorTextHover,
          },
        },

      // 禁用态
      [`&${componentCls}-disabled`]: {
        color: token.colorTextDisabled,
        cursor: 'not-allowed',
        userSelect: 'none',
      },

      // 块级（div/p）默认下边距
      [`
        div&,
        p
      `]: {
        marginBottom: '1em',
      },

      ...getTitleStyles(token),

      // 相邻标题的上间距（前一个兄弟为标题类时）
      [`
      & + h1${componentCls},
      & + h2${componentCls},
      & + h3${componentCls},
      & + h4${componentCls},
      & + h5${componentCls}
      `]: {
        marginTop: titleMarginTop,
      },

      // 正文块后的标题上间距
      [`
      div,
      ul,
      li,
      p,
      h1,
      h2,
      h3,
      h4,
      h5`]: {
        [`
        + h1,
        + h2,
        + h3,
        + h4,
        + h5
        `]: {
          marginTop: titleMarginTop,
        },
      },

      ...getResetStyles(token),

      ...getLinkStyles(token),

      // Operation
      // 操作区容器
      [`${componentCls}-actions`]: {
        display: 'inline',
      },

      // 展开/收起/编辑/复制按钮（operationUnit 统一悬停/点击反馈）
      [`
        ${componentCls}-expand,
        ${componentCls}-collapse,
        ${componentCls}-edit,
        ${componentCls}-copy
      `]: {
        ...operationUnit(token),
        marginInlineStart: token.marginXXS,
      },

      ...getEditableStyles(token),

      ...getCopyableStyles(token),

      ...getEllipsisStyles(),

      // RTL
      '&-rtl': {
        direction: 'rtl',
      },
    },
  };
};

/** 组件 token 默认值 */
export const prepareComponentToken: GetDefaultToken<'Typography'> = () => ({
  titleMarginTop: '1.2em',
  titleMarginBottom: '0.5em',
});

// ============================== Export ==============================
export default genStyleHooks(
  'Typography',
  genTypographyStyle,
  prepareComponentToken,
);

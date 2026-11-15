import type { CSSInterpolation, CSSObject } from '@arvin-studio/cssinjs';

import type { GenerateStyle } from '../../theme/internal';
import type { TableToken } from './interface';

import { mergeToken } from '@arvin-studio/cssinjs';

function genFontSizeStyle(token: TableToken, prefixCls = ''): CSSInterpolation {
  const { fontSize } = token;
  return [
    {
      [prefixCls]: {
        fontSize,
      },
    },
  ];
}

export const genSizeBaseTableStyle: GenerateStyle<TableToken> = (token) => {
  const tableToken = mergeToken<TableToken>(token, {
    fontSize: token.contentFontSize,
  });
  return genFontSizeStyle(tableToken, `${token.componentCls}-medium`);
};

export const genSizeSmallTableStyle: GenerateStyle<TableToken> = (token) => {
  const tableToken = mergeToken<TableToken>(token, {
    fontSize: token.contentFontSizeSM,
  });
  return genFontSizeStyle(tableToken, `${token.componentCls}-small`);
};

export const genSizeLargeTableStyle: GenerateStyle<TableToken> = (token) => {
  const tableToken = mergeToken<TableToken>(token, {
    fontSize: token.contentFontSizeLG,
  });
  return genFontSizeStyle(tableToken, `${token.componentCls}-large`);
};

export function genMainStyle(token: TableToken): CSSObject {
  const {
    componentCls,
    colorText,
    borderColor,
    borderWidth,
    placeholderColor,
    primaryColor,
    headerBackgroundColor,
    disabledColor,
    headerFontColor,
    fontWeightStrong,
  } = token;

  /* table*/
  return {
    [`${componentCls}--viewport-wrapper`]: {
      position: 'relative',
      overflow: 'hidden',
      flexGrow: 1,
    },

    [`${componentCls}-header--column`]: {
      position: 'relative',
      fontWeight: fontWeightStrong,
    },

    [componentCls]: {
      [`${componentCls}--header-wrapper`]: {
        color: headerFontColor,
      },
    },

    /** table */
    [`${componentCls}--render-default`]: {
      position: 'relative',
      fontFamily: 'inherit',
      color: colorText,
      direction: 'ltr',

      [`&.border--default,
        &.border--full,
        &.border--outer`]: {
        [`${componentCls}--header-wrapper`]: {
          backgroundColor: headerBackgroundColor,
        },
      },

      '&.border--inner': {
        [`${componentCls}--border-line`]: {
          borderWidth: '0 0 1px 0',
        },
      },
      '&.border--none': {
        [`${componentCls}--border-line`]: {
          display: 'none',
        },
      },
      [`${componentCls}-cell--placeholder`]: {
        color: placeholderColor,
      },
      [`${componentCls}--border-line`]: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
        border: `${borderWidth} solid ${borderColor}`,
      },
      [`${componentCls}-cell--drag-handle`]: {
        userSelect: 'none',
        '& + span': { paddingLeft: '0.5em' },
        '&:not(.is--disabled)': {
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          '&:hover': { color: primaryColor },
        },
        '&.is--disabled': {
          color: disabledColor,
          cursor: 'not-allowed',
        },
      },
      [`${componentCls}-cell`]: {
        whiteSpace: 'pre-line',
        wordBreak: 'break-all',
      },
      [`${componentCls}-header--column,
        ${componentCls}-footer--column`]: {
        [`&>${componentCls}-cell`]: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
      },

      [`${componentCls}-body--column`]: {
        [`&>${componentCls}-cell`]: {
          display: 'flex',
          flexDirection: 'row',
        },
      },
    },
  };
}

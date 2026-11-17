import type { CSSInterpolation } from '@arvin-studio/cssinjs';

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

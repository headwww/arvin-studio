import type { CSSObject } from '@arvin-studio/cssinjs';

import type { GenerateStyle } from '../../theme/internal';
import type { InputToken } from './token';

import { unit } from '@arvin-studio/cssinjs';

import { genStyleHooks, mergeToken } from '../../theme/internal';
import { genCssVar } from '../../theme/util/genStyleUtils';
import { initComponentToken, initInputToken } from './token';

const genSearchStyle: GenerateStyle<InputToken, CSSObject> = (token) => {
  const { componentCls, asCls, calc, max } = token;

  const btnCls = `${componentCls}-btn`;
  const [varName, varRef] = genCssVar(asCls, 'input-search');
  const inputFontSizeSM = token.inputFontSizeSM ?? token.fontSize;
  const smallButtonHeight = max(
    token.controlHeightSM,
    calc(inputFontSizeSM)
      .mul(token.lineHeight)
      .add(calc(token.paddingBlockSM).mul(2))
      .add(calc(token.lineWidth).mul(2))
      .equal(),
  );

  return {
    [componentCls]: {
      [varName('btn-height')]: unit(token.controlHeight),
      width: '100%',

      // =========================== Button ===========================
      [btnCls]: {
        height: varRef('btn-height'),

        '&:focus-visible': {
          zIndex: 5,
        },

        [`&${asCls}-btn-icon-only`]: {
          width: varRef('btn-height'),
        },

        '&-filled': {
          background: token.colorFillTertiary,

          '&:not(:disabled)': {
            '&:hover': {
              background: token.colorFillSecondary,
            },

            '&:active': {
              background: token.colorFill,
            },
          },
        },
      },

      [`&${componentCls}-large`]: {
        [varName('btn-height')]: unit(token.controlHeightLG),
      },

      [`&${componentCls}-small`]: {
        [varName('btn-height')]: unit(token.controlHeightSM),
      },

      [`&${componentCls}-small ${btnCls}`]: {
        minHeight: smallButtonHeight,

        [`&${token.asCls}-btn-icon-only`]: {
          minWidth: smallButtonHeight,
        },
      },
    },
  };
};

export default genStyleHooks(
  ['Input', 'Search'],
  (token) => {
    const inputToken = mergeToken<InputToken>(token, initInputToken(token));
    return genSearchStyle(inputToken);
  },
  initComponentToken,
);

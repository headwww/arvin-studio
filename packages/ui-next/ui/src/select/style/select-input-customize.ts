import type { CSSObject } from '@arvin-studio/cssinjs';

import type { GenerateStyle } from '../../theme/interface';
import type { SelectToken } from './token';

const genSelectInputCustomizeStyle: GenerateStyle<SelectToken, CSSObject> = (
  token,
) => {
  const { asCls, componentCls } = token;

  const transparentBackground: CSSObject = {
    background: 'transparent',
  };
  const disabledCustomizedInputSelector = [
    '> input[disabled]',
    '> textarea[disabled]',
    `> ${componentCls}-input`,
    `> ${asCls}-input-affix-wrapper-disabled`,
    `> ${asCls}-input-search`,
  ].join(', ');

  return {
    [`&${componentCls}-customize`]: {
      border: 0,
      padding: 0,
      fontSize: 'inherit',
      lineHeight: 'inherit',

      [`${componentCls}-placeholder`]: {
        display: 'none',
      },

      [`${componentCls}-content`]: {
        margin: 0,
        padding: 0,

        '&-value': {
          display: 'none',
        },
      },

      [`&${componentCls}-filled ${componentCls}-content`]: {
        [`${asCls}-input-filled`]: transparentBackground,
      },

      [`&${componentCls}-disabled ${componentCls}-content`]: {
        [disabledCustomizedInputSelector]: transparentBackground,

        'input[disabled], textarea[disabled]': transparentBackground,
      },
    },
  };
};

export default genSelectInputCustomizeStyle;

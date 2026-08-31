import type { CSSObject } from '@arvin-studio/cssinjs';

import type { StepsToken } from '.';
import type { GenerateStyle } from '../../theme/internal';

import { genCssVar } from '../../theme/util/genStyleUtils';

const genHorizontalStyle: GenerateStyle<StepsToken, CSSObject> = (token) => {
  const { componentCls, asCls } = token;
  const itemCls = `${componentCls}-item`;
  const [varName, varRef] = genCssVar(asCls, 'cmp-steps');
  return {
    [`${componentCls}-horizontal`]: {
      [`> ${itemCls}`]: {
        flex: '1 1 auto',
        minWidth: token.iconSize,
        [`${itemCls}-rail`]: {
          [varName('horizontal-rail-margin')]:
            `calc(${varRef('icon-size-max')} / 2 + ${varRef('item-wrapper-padding-top')})`,
          position: 'static',
          marginTop: varRef('horizontal-rail-margin'),
          width: 'auto',
          borderBlockStartWidth: varRef('rail-size'),
          flex: 1,
          minWidth: 0,
          alignSelf: 'flex-start',
          transform: 'translateY(-50%)',
        },
      },
    },
  };
};

export default genHorizontalStyle;

import type { CSSObject } from '@arvin-studio/cssinjs';

import type { FullToken, GenerateStyle } from '../../theme/internal';

import { genStyleHooks } from '../../theme/internal';

export interface ComponentToken {}

interface SpaceToken extends FullToken<'Space'> {}

const genSpaceCompactStyle: GenerateStyle<SpaceToken, CSSObject> = (token) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      display: 'inline-flex',

      '&-block': {
        display: 'flex',
        width: '100%',
      },
      '&-vertical': {
        flexDirection: 'column',
      },

      '&-rtl': {
        direction: 'rtl',
      },
    },
  };
};

// ============================== Export ==============================
export default genStyleHooks(
  ['Space', 'Compact'],
  genSpaceCompactStyle,
  () => ({}),
  {
    resetStyle: false,
  },
);

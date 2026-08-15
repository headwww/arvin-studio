import type { CSSObject } from '@arvin-studio/cssinjs';

import type { FullToken, GenerateStyle } from '../../theme/internal';

import { genStyleHooks } from '../../theme/internal';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComponentToken {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
    // Space component don't apply extra font style
    // https://github.com/ant-design/ant-design/issues/40315
    resetStyle: false,
  },
);

import type { CSSObject } from '@arvin-studio/cssinjs';

import type {
  AliasToken,
  GenerateStyle,
  TokenWithCommonCls,
} from '../../theme/internal';

const genCollapseMotion: GenerateStyle<
  TokenWithCommonCls<AliasToken>,
  CSSObject
> = (token) => {
  const { componentCls, asCls, motionDurationMid, motionEaseInOut } = token;
  return {
    [componentCls]: {
      // For common/openAnimation
      [`${asCls}-motion-collapse-legacy`]: {
        overflow: 'hidden',
        '&-active': {
          transition: `${['height', 'opacity']
            .map((prop) => `${prop} ${motionDurationMid} ${motionEaseInOut}`)
            .join(', ')} !important`,
        },
      },
      [`${asCls}-motion-collapse`]: {
        overflow: 'hidden',
        transition: `${['height', 'opacity']
          .map((prop) => `${prop} ${motionDurationMid} ${motionEaseInOut}`)
          .join(', ')} !important`,
      },
    },
  };
};

export default genCollapseMotion;

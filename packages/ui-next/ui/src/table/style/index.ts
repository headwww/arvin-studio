import type { CSSObject } from '@arvin-studio/cssinjs';

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from '../../theme/internal';

import { genStyleHooks } from '../../theme/internal';

export interface ComponentToken {}

interface TableToken extends FullToken<'Table'> {}

const genTableStyle: GenerateStyle<TableToken, CSSObject> = (token) => {
  const { componentCls } = token;
  return {
    [componentCls]: {}, // 用全局 token
  };
};

// 必须返回 ComponentToken
export const prepareComponentToken: GetDefaultToken<'Table'> = () => {
  return {};
};

export default genStyleHooks(
  'Table',
  (token) => {
    return [genTableStyle(token)];
  },
  prepareComponentToken,
);

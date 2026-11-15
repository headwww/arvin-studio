import type { TableToken } from './interface';

import { genStyleHooks, mergeToken } from '../../theme/internal';
import { genAreaStyle } from './area';
import {
  genBodyStyle,
  genLargeCellPaddingStyle,
  genMediumCellPaddingStyle,
  genSmallCellPaddingStyle,
} from './body';
import {
  genMainStyle,
  genSizeBaseTableStyle,
  genSizeLargeTableStyle,
  genSizeSmallTableStyle,
} from './main';
import { prepareComponentToken } from './prepare';
import { genScrollStyle } from './scroll';

export default genStyleHooks(
  'Table',
  (token) => {
    const tableToken = mergeToken<TableToken>(token, {});
    return [
      genMainStyle(tableToken),
      // 尺寸
      genSizeBaseTableStyle(tableToken),
      genSizeLargeTableStyle(tableToken),
      genSizeSmallTableStyle(tableToken),

      genMediumCellPaddingStyle(tableToken),
      genLargeCellPaddingStyle(tableToken),
      genSmallCellPaddingStyle(tableToken),

      genAreaStyle(tableToken),
      genBodyStyle(tableToken),
      genScrollStyle(tableToken),
    ];
  },
  prepareComponentToken,
  {
    // Space 同款：不需要额外 reset 字体（表格自带排版语义）
    resetStyle: false,
    unitless: {
      headerFontWeight: true,
    },
  },
);

import type { TableToken } from './interface';

import { genStyleHooks, mergeToken } from '../../theme/internal';
import {
  genBodyStyle,
  genLargeCellPaddingStyle,
  genMediumCellPaddingStyle,
  genSmallCellPaddingStyle,
} from './body';
import { genCustomStyle } from './custom';
import genExportStyle from './export';
import { genFilterStyle } from './filter';
import { genMenuStyle } from './menu';
import { prepareComponentToken } from './prepare';
import {
  genSizeBaseTableStyle,
  genSizeLargeTableStyle,
  genSizeSmallTableStyle,
} from './size';

export default genStyleHooks(
  'Table',
  (token) => {
    const tableToken = mergeToken<TableToken>(token, {});
    return [
      // 尺寸
      genSizeBaseTableStyle(tableToken),
      genSizeLargeTableStyle(tableToken),
      genSizeSmallTableStyle(tableToken),
      genMediumCellPaddingStyle(tableToken),
      genLargeCellPaddingStyle(tableToken),
      genSmallCellPaddingStyle(tableToken),
      genCustomStyle(tableToken),
    genExportStyle(tableToken),
      genFilterStyle(tableToken),
      genMenuStyle(tableToken),
      genBodyStyle(tableToken),
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

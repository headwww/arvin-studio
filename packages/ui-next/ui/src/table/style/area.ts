import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

export function genAreaStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,

    cellClipAreaBorderWidth,
  } = token;

  return [
    {
      [`${componentCls}--fixed-left-wrapper`]: {
        [`& .${componentCls}--cell-main-area[half="1"], ` +
        `& .${componentCls}--cell-item-area[half="1"], ` +
        `& .${componentCls}--cell-extend-area[half="1"], ` +
        `& .${componentCls}--cell-active-area[half="1"]`]: {
          borderRight: 0,
        },

        [`& .${componentCls}--cell-copy-area[half="1"]`]: {
          backgroundSize: `${cellClipAreaBorderWidth}px 12px, 0 12px, 12px ${cellClipAreaBorderWidth}px, 12px ${cellClipAreaBorderWidth}px`,
        },
      },
    },
  ];
}

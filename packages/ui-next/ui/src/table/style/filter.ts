import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

export function genFilterStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    iconCls,
    columnIconBorderColor,
    colorText,
    borderColor,
  } = token;

  return [
    {
      [`${componentCls}-cell--filter`]: {
        padding: '0 0.1em 0 0.2em',
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'inline-block',
        lineHeight: 0,

        [`&.col--filter`]: {
          [`${componentCls}-filter--btn`]: {
            color: colorText,
          },
        },

        [`${iconCls}`]: {
          color: columnIconBorderColor,
          cursor: 'pointer',

          [`&:hover`]: {
            color: colorText,
          },
        },
      },

      [`${componentCls}--filter-wrapper`]: {
        [`${componentCls}--filter-footer`]: {
          display: 'flex',
          padding: '0.6em',
          justifyContent: 'space-between',
          borderTop: `1px solid ${borderColor}`,
        },
      },
    },
  ];
}

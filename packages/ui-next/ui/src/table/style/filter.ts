import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

export function genFilterStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    iconCls,
    columnIconBorderColor,
    colorText,
    primaryColor,
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

      '.is--filter-active': {
        [`${componentCls}-cell--filter`]: {
          [`${componentCls}-filter--btn`]: {
            color: primaryColor,
          },
        },
      },
    },
  ];
}

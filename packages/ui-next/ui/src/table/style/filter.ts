import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

import { unit } from '@arvin-studio/cssinjs';

export function genFilterStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    iconCls,
    columnIconBorderColor,
    colorText,
    borderColor,
    colorFillTertiary,
    paddingXXS,
    paddingSM,
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
          [`${iconCls}`]: {
            color: primaryColor,
          },
        },
      },
      [`${componentCls}--filter-wrapper`]: {
        [`${componentCls}--filter-header`]: {
          flex: '0 0 auto',
          borderBottom: `1px solid ${borderColor}`,
        },

        [`${componentCls}--filter-body`]: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          columnGap: 0,
          minHeight: 0,
          padding: 0,
          overflowY: 'auto',
        },

        [`${componentCls}--filter-option`]: {
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          width: '100%',
          margin: 0,
          padding: `${unit(paddingXXS)} ${unit(paddingSM)}`,
          cursor: 'pointer',

          [`&:hover`]: {
            backgroundColor: colorFillTertiary,
          },
        },

        [`${componentCls}--filter-footer`]: {
          display: 'flex',
          flex: '0 0 auto',
          padding: '0.6em',
          justifyContent: 'space-between',
          borderTop: `1px solid ${borderColor}`,
        },
      },
    },
  ];
}

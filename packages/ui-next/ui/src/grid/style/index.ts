import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { FullToken } from '../../theme/interface';

import { genStyleHooks, mergeToken } from '../../theme/internal';

// biome-ignore lint/style/useConst: component token placeholder
export interface ComponentToken {}

export interface GridToken extends FullToken<'Grid'> {}

const genGridStyle = (token: GridToken): CSSInterpolation => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      fontSize: token.fontSize,

      [`&.size--large`]: {
        fontSize: token.fontSizeLG,
      },
      [`&.size--medium`]: {
        fontSize: token.fontSize,
      },
      [`&.size--small`]: {
        fontSize: token.fontSizeSM,
      },

      '&.is--loading': {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 99,
          width: '100%',
          height: '100%',
          userSelect: 'none',
          backgroundColor: token.colorBgContainer,
          opacity: 0.6,
        },
      },

      '&.is--maximize': {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        padding: '0.5em 1em',
        backgroundColor: token.colorBgLayout,
      },
    },

    [`${componentCls}--top-wrapper, ${componentCls}--bottom-wrapper, ${componentCls}--pager-wrapper`]:
      {
        position: 'relative',
      },

    [`${componentCls}--table-container`]: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      overflow: 'hidden',
    },

    [`${componentCls}--left-wrapper, ${componentCls}--right-wrapper`]: {
      flexShrink: 0,
      overflow: 'auto',
      outline: 0,
    },

    [`${componentCls}--table-wrapper`]: {
      flexGrow: 1,
      overflow: 'hidden',
    },

    [`${componentCls}--layout-body-wrapper`]: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      overflow: 'auto',
    },

    [`${componentCls}--layout-body-content-wrapper`]: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'auto',
    },

    [`${componentCls}--layout-header-wrapper, ${componentCls}--layout-footer-wrapper, ${componentCls}--layout-aside-left-wrapper, ${componentCls}--layout-aside-right-wrapper`]:
      {
        flexShrink: 0,
      },

    [`${componentCls}--layout-aside-left-wrapper, ${componentCls}--layout-aside-right-wrapper`]:
      {
        overflow: 'auto',
      },
  };
};

export default genStyleHooks(
  'Grid',
  (token) => {
    const gridToken = mergeToken<GridToken>(token, {});
    return [genGridStyle(gridToken)];
  },
  () => ({}),
  {
    resetStyle: false,
  },
);

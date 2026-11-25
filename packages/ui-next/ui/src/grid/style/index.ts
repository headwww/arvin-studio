import type { CSSObject } from '@arvin-studio/cssinjs';

import type {
  AliasToken,
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from '../../theme/internal';

import { unit } from '@arvin-studio/cssinjs';

import { genStyleHooks, mergeToken } from '../../theme/internal';
import { genCssVar } from '../../theme/util/genStyleUtils';

// biome-ignore lint/suspicious/noEmptyInterface: ComponentToken need to be empty by default
export interface ComponentToken {}

interface GridRowToken extends FullToken<'Grid'> {
  //
}

interface GridColToken extends FullToken<'Grid'> {
  /**
   * @desc 网格列数
   * @descEN Number of Grid columns
   */
  GridColumns: number;
}

// ============================== Row-Shared ==============================
const genGridRowStyle: GenerateStyle<GridRowToken, CSSObject> = (token) => {
  const { componentCls } = token;

  return {
    // Grid system
    [componentCls]: {
      display: 'flex',
      flexFlow: 'row wrap',
      minWidth: 0,

      '&::before, &::after': {
        display: 'flex',
      },

      '&-no-wrap': {
        flexWrap: 'nowrap',
      },

      // The origin of the X-axis
      '&-start': {
        justifyContent: 'flex-start',
      },

      // The center of the X-axis
      '&-center': {
        justifyContent: 'center',
      },

      // The opposite of the X-axis
      '&-end': {
        justifyContent: 'flex-end',
      },

      '&-space-between': {
        justifyContent: 'space-between',
      },

      '&-space-around': {
        justifyContent: 'space-around',
      },

      '&-space-evenly': {
        justifyContent: 'space-evenly',
      },

      // Align at the top
      '&-top': {
        alignItems: 'flex-start',
      },

      // Align at the center
      '&-middle': {
        alignItems: 'center',
      },

      '&-bottom': {
        alignItems: 'flex-end',
      },
    },
  };
};

// ============================== Col-Shared ==============================
const genGridColStyle: GenerateStyle<GridColToken, CSSObject> = (token) => {
  const { componentCls } = token;

  return {
    // Grid system
    [componentCls]: {
      position: 'relative',
      maxWidth: '100%',
      // Prevent columns from collapsing when empty
      minHeight: 1,
    },
  };
};

function genLoopGridColumnsStyle(
  token: GridColToken,
  sizeCls: string,
): CSSObject {
  const { componentCls, GridColumns, asCls } = token;

  const [GridVarName, GridVarRef] = genCssVar(asCls, 'Grid');
  const [, colVarRef] = genCssVar(asCls, 'col');

  const GridColumnsStyle: CSSObject = {};
  for (let i = GridColumns; i >= 0; i--) {
    if (i === 0) {
      GridColumnsStyle[`${componentCls}${sizeCls}-${i}`] = {
        display: 'none',
      };
      GridColumnsStyle[`${componentCls}-push-${i}`] = {
        insetInlineStart: 'auto',
      };
      GridColumnsStyle[`${componentCls}-pull-${i}`] = {
        insetInlineEnd: 'auto',
      };
      GridColumnsStyle[`${componentCls}${sizeCls}-push-${i}`] = {
        insetInlineStart: 'auto',
      };
      GridColumnsStyle[`${componentCls}${sizeCls}-pull-${i}`] = {
        insetInlineEnd: 'auto',
      };
      GridColumnsStyle[`${componentCls}${sizeCls}-offset-${i}`] = {
        marginInlineStart: 0,
      };
      GridColumnsStyle[`${componentCls}${sizeCls}-order-${i}`] = {
        order: 0,
      };
    } else {
      GridColumnsStyle[`${componentCls}${sizeCls}-${i}`] = [
        // Form set `display: flex` on Col which will override `display: block`.
        // Let's get it from css variable to support override.
        {
          [GridVarName('display')]: 'block',
          // Fallback to display if variable not support
          display: 'block',
        },
        {
          display: GridVarRef('display'),
          flex: `0 0 ${(i / GridColumns) * 100}%`,
          maxWidth: `${(i / GridColumns) * 100}%`,
        },
      ];
      GridColumnsStyle[`${componentCls}${sizeCls}-push-${i}`] = {
        insetInlineStart: `${(i / GridColumns) * 100}%`,
      };
      GridColumnsStyle[`${componentCls}${sizeCls}-pull-${i}`] = {
        insetInlineEnd: `${(i / GridColumns) * 100}%`,
      };
      GridColumnsStyle[`${componentCls}${sizeCls}-offset-${i}`] = {
        marginInlineStart: `${(i / GridColumns) * 100}%`,
      };
      GridColumnsStyle[`${componentCls}${sizeCls}-order-${i}`] = {
        order: i,
      };
    }
  }

  // Flex CSS Var
  GridColumnsStyle[`${componentCls}${sizeCls}-flex`] = {
    flex: colVarRef(`${sizeCls.replace(/-/, '')}-flex`),
  };

  return GridColumnsStyle;
}

function genGridStyle(token: GridColToken, sizeCls: string): CSSObject {
  return genLoopGridColumnsStyle(token, sizeCls);
}

function genGridMediaStyle(
  token: GridColToken,
  screenSize: number,
  sizeCls: string,
): CSSObject {
  return {
    [`@media (min-width: ${unit(screenSize)})`]: {
      ...genGridStyle(token, sizeCls),
    },
  };
}

export const prepareRowComponentToken: GetDefaultToken<'Grid'> = () => ({});

export const prepareColComponentToken: GetDefaultToken<'Grid'> = () => ({});

// ============================== Export ==============================
export const useRowStyle = genStyleHooks(
  'Grid',
  genGridRowStyle,
  prepareRowComponentToken,
);

export function getMediaSize(token: AliasToken) {
  const mediaSizesMap = {
    xs: token.screenXSMin,
    sm: token.screenSMMin,
    md: token.screenMDMin,
    lg: token.screenLGMin,
    xl: token.screenXLMin,
    xxl: token.screenXXLMin,
    xxxl: token.screenXXXLMin,
  } as const;

  return mediaSizesMap;
}

export const useColStyle = genStyleHooks(
  'Grid',
  (token) => {
    const GridToken: GridColToken = mergeToken<GridColToken>(token, {
      GridColumns: 24, // Row is divided into 24 parts in Grid
    });
    const GridMediaSizesMap: Record<string, number> = getMediaSize(GridToken);
    delete GridMediaSizesMap.xs;
    return [
      genGridColStyle(GridToken),
      genGridStyle(GridToken, ''),
      genGridStyle(GridToken, '-xs'),
      Object.entries(GridMediaSizesMap)
        .map(([key, value]) => genGridMediaStyle(GridToken, value!, `-${key}`))
        .reduce<CSSObject>((pre, cur) => ({ ...pre, ...cur }), {}),
    ];
  },
  prepareColComponentToken,
);

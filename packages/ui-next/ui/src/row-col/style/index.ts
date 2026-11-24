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

interface RowColRowToken extends FullToken<'RowCol'> {
  //
}

interface RowColColToken extends FullToken<'RowCol'> {
  /**
   * @desc 网格列数
   * @descEN Number of RowCol columns
   */
  RowColColumns: number;
}

// ============================== Row-Shared ==============================
const genRowColRowStyle: GenerateStyle<RowColRowToken, CSSObject> = (token) => {
  const { componentCls } = token;

  return {
    // RowCol system
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
const genRowColColStyle: GenerateStyle<RowColColToken, CSSObject> = (token) => {
  const { componentCls } = token;

  return {
    // RowCol system
    [componentCls]: {
      position: 'relative',
      maxWidth: '100%',
      // Prevent columns from collapsing when empty
      minHeight: 1,
    },
  };
};

function genLoopRowColColumnsStyle(
  token: RowColColToken,
  sizeCls: string,
): CSSObject {
  const { componentCls, RowColColumns, asCls } = token;

  const [RowColVarName, RowColVarRef] = genCssVar(asCls, 'RowCol');
  const [, colVarRef] = genCssVar(asCls, 'col');

  const RowColColumnsStyle: CSSObject = {};
  for (let i = RowColColumns; i >= 0; i--) {
    if (i === 0) {
      RowColColumnsStyle[`${componentCls}${sizeCls}-${i}`] = {
        display: 'none',
      };
      RowColColumnsStyle[`${componentCls}-push-${i}`] = {
        insetInlineStart: 'auto',
      };
      RowColColumnsStyle[`${componentCls}-pull-${i}`] = {
        insetInlineEnd: 'auto',
      };
      RowColColumnsStyle[`${componentCls}${sizeCls}-push-${i}`] = {
        insetInlineStart: 'auto',
      };
      RowColColumnsStyle[`${componentCls}${sizeCls}-pull-${i}`] = {
        insetInlineEnd: 'auto',
      };
      RowColColumnsStyle[`${componentCls}${sizeCls}-offset-${i}`] = {
        marginInlineStart: 0,
      };
      RowColColumnsStyle[`${componentCls}${sizeCls}-order-${i}`] = {
        order: 0,
      };
    } else {
      RowColColumnsStyle[`${componentCls}${sizeCls}-${i}`] = [
        // Form set `display: flex` on Col which will override `display: block`.
        // Let's get it from css variable to support override.
        {
          [RowColVarName('display')]: 'block',
          // Fallback to display if variable not support
          display: 'block',
        },
        {
          display: RowColVarRef('display'),
          flex: `0 0 ${(i / RowColColumns) * 100}%`,
          maxWidth: `${(i / RowColColumns) * 100}%`,
        },
      ];
      RowColColumnsStyle[`${componentCls}${sizeCls}-push-${i}`] = {
        insetInlineStart: `${(i / RowColColumns) * 100}%`,
      };
      RowColColumnsStyle[`${componentCls}${sizeCls}-pull-${i}`] = {
        insetInlineEnd: `${(i / RowColColumns) * 100}%`,
      };
      RowColColumnsStyle[`${componentCls}${sizeCls}-offset-${i}`] = {
        marginInlineStart: `${(i / RowColColumns) * 100}%`,
      };
      RowColColumnsStyle[`${componentCls}${sizeCls}-order-${i}`] = {
        order: i,
      };
    }
  }

  // Flex CSS Var
  RowColColumnsStyle[`${componentCls}${sizeCls}-flex`] = {
    flex: colVarRef(`${sizeCls.replace(/-/, '')}-flex`),
  };

  return RowColColumnsStyle;
}

function genRowColStyle(token: RowColColToken, sizeCls: string): CSSObject {
  return genLoopRowColColumnsStyle(token, sizeCls);
}

function genRowColMediaStyle(
  token: RowColColToken,
  screenSize: number,
  sizeCls: string,
): CSSObject {
  return {
    [`@media (min-width: ${unit(screenSize)})`]: {
      ...genRowColStyle(token, sizeCls),
    },
  };
}

export const prepareRowComponentToken: GetDefaultToken<'RowCol'> = () => ({});

export const prepareColComponentToken: GetDefaultToken<'RowCol'> = () => ({});

// ============================== Export ==============================
export const useRowStyle = genStyleHooks(
  'RowCol',
  genRowColRowStyle,
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
  'RowCol',
  (token) => {
    const RowColToken: RowColColToken = mergeToken<RowColColToken>(token, {
      RowColColumns: 24, // Row is divided into 24 parts in RowCol
    });
    const RowColMediaSizesMap: Record<string, number> =
      getMediaSize(RowColToken);
    delete RowColMediaSizesMap.xs;
    return [
      genRowColColStyle(RowColToken),
      genRowColStyle(RowColToken, ''),
      genRowColStyle(RowColToken, '-xs'),
      Object.entries(RowColMediaSizesMap)
        .map(([key, value]) =>
          genRowColMediaStyle(RowColToken, value!, `-${key}`),
        )
        .reduce<CSSObject>((pre, cur) => ({ ...pre, ...cur }), {}),
    ];
  },
  prepareColComponentToken,
);

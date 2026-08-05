import type { CSSInterpolation, CSSObject } from '@arvin-studio/cssinjs';

import type {
  AliasToken,
  CSSUtil,
  FullToken,
  OverrideComponent,
} from '../theme/internal';

interface CompactItemOptions {
  /**
   * Some component borders are implemented on child elements
   * like `Select`
   */
  borderElCls?: string;
  focus?: boolean;
  /**
   * Some components have special `focus` className especially with popovers
   * like `Select` and `DatePicker`
   */
  focusElCls?: string;
}

// handle border collapse
function compactItemBorder(
  token: AliasToken & CSSUtil,
  parentCls: string,
  options: CompactItemOptions,
  prefixCls: string,
): CSSObject {
  const { focusElCls, focus, borderElCls } = options;
  const childCombinator = borderElCls ? '> *' : '';
  const suffix = childCombinator ? ` ${childCombinator}` : '';
  const genEffects = (effects: Array<null | string>) =>
    effects
      .filter(Boolean)
      .map((n) => `&:${n}${suffix}`)
      .join(',');
  const hoverEffects = genEffects([
    'hover',
    focusElCls ? `hover${focusElCls}` : null,
  ]);
  const focusEffects = genEffects([focus ? 'focus' : null, 'active']);

  return {
    [`&-item:not(${parentCls}-last-item)`]: {
      marginInlineEnd: token.calc(token.lineWidth).mul(-1).equal(),
    },

    [`&-item:not(${prefixCls}-status-success)`]: {
      zIndex: 2,
    },

    '&-item': {
      [focusEffects]: {
        zIndex: 3,
      },

      [hoverEffects]: {
        zIndex: 4,
      },

      ...(focusElCls && {
        [`&${focusElCls}`]: {
          zIndex: 3,
        },
      }),

      [`&[disabled] ${childCombinator}`]: {
        zIndex: 0,
      },
    },
  };
}

// handle border-radius
function compactItemBorderRadius(
  prefixCls: string,
  parentCls: string,
  options: CompactItemOptions,
): CSSObject {
  const { borderElCls } = options;
  const childCombinator = borderElCls ? `> ${borderElCls}` : '';

  return {
    [`&-item:not(${parentCls}-first-item):not(${parentCls}-last-item) ${childCombinator}`]:
      {
        borderRadius: 0,
      },

    [`&-item:not(${parentCls}-last-item)${parentCls}-first-item`]: {
      [`& ${childCombinator}, &${prefixCls}-sm ${childCombinator}, &${prefixCls}-lg ${childCombinator}`]:
        {
          borderStartEndRadius: 0,
          borderEndEndRadius: 0,
        },
    },

    [`&-item:not(${parentCls}-first-item)${parentCls}-last-item`]: {
      [`& ${childCombinator}, &${prefixCls}-sm ${childCombinator}, &${prefixCls}-lg ${childCombinator}`]:
        {
          borderStartStartRadius: 0,
          borderEndStartRadius: 0,
        },
    },
  };
}

export function genCompactItemStyle<T extends OverrideComponent>(
  token: FullToken<T>,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  options: CompactItemOptions = { focus: true },
): CSSInterpolation {
  const { componentCls } = token;

  const compactCls = `${componentCls}-compact`;

  return {
    [compactCls]: {
      ...compactItemBorder(token as any, compactCls, options, componentCls),
      ...compactItemBorderRadius(componentCls, compactCls, options),
    },
  };
}

import type { CSSInterpolation, CSSObject } from '@arvin-studio/cssinjs';

import type { GenerateStyle } from '../../theme/internal';
import type { ButtonToken } from './token';

import { mergeToken, unit } from '@arvin-studio/cssinjs';

import { genFocusStyle, resetIcon } from '../../style';
import { genNoMotionStyle } from '../../style/motion';
import { genStyleHooks } from '../../theme/internal';
import { prepareComponentToken, prepareToken } from './token';
import genVariantStyle from './variant';

const genSharedButtonStyle: GenerateStyle<ButtonToken, CSSObject> = (token) => {
  const {
    componentCls,
    iconGap,
    fontWeight,
    iconCls,
    opacityLoading,
    motionDurationSlow,
    motionEaseInOut,
    calc,
  } = token;

  return {
    [componentCls]: {
      outline: 'none',
      position: 'relative',
      display: 'inline-flex',
      gap: iconGap,
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      backgroundImage: 'none',
      cursor: 'pointer',
      transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
      userSelect: 'none',
      touchAction: 'manipulation',
      ...genNoMotionStyle(),
      '&:disabled > *': {
        pointerEvents: 'none',
      },

      [`${componentCls}-icon > svg`]: resetIcon(),
      [`${componentCls}-icon`]: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',

        [iconCls]: {
          verticalAlign: 'middle',

          '&:before': {
            content: String.raw`"\a0"`,
            display: 'inline-block',
            width: 0,
          },
        },
      },

      '> a': {
        color: 'currentColor',
      },

      '&:not(:disabled)': genFocusStyle(token),

      [`&${componentCls}-two-chinese-chars::first-letter`]: {
        letterSpacing: '0.34em',
      },

      [`&${componentCls}-two-chinese-chars > *:not(${iconCls})`]: {
        marginInlineEnd: '-0.34em',
        letterSpacing: '0.34em',
      },

      [`&${componentCls}-icon-only`]: {
        paddingInline: 0,

        // make `btn-icon-only` not too narrow
        [`&${componentCls}-compact-item`]: {
          flex: 'none',
        },
      },

      // Loading
      [`&${componentCls}-loading`]: {
        opacity: opacityLoading,
        cursor: 'default',
      },

      [`${componentCls}-loading-icon`]: {
        transition: ['width', 'opacity', 'margin']
          .map((prop) => `${prop} ${motionDurationSlow} ${motionEaseInOut}`)
          .join(','),
      },

      // iconPlacement
      [`&:not(${componentCls}-icon-end)`]: {
        [`${componentCls}-loading-icon-motion`]: {
          '&-appear-start, &-enter-start': {
            marginInlineEnd: calc(iconGap).mul(-1).equal(),
          },
          '&-appear-active, &-enter-active': {
            marginInlineEnd: 0,
          },
          '&-leave-start': {
            marginInlineEnd: 0,
          },
          '&-leave-active': {
            marginInlineEnd: calc(iconGap).mul(-1).equal(),
          },
        },
      },
      '&-icon-end': {
        flexDirection: 'row-reverse',

        [`${componentCls}-loading-icon-motion`]: {
          '&-appear-start, &-enter-start': {
            marginInlineStart: calc(iconGap).mul(-1).equal(),
          },
          '&-appear-active, &-enter-active': {
            marginInlineStart: 0,
          },
          '&-leave-start': {
            marginInlineStart: 0,
          },
          '&-leave-active': {
            marginInlineStart: calc(iconGap).mul(-1).equal(),
          },
        },
      },
    },
  };
};

// ============================== Shape ===============================
/** 圆形按钮：宽高相等（minWidth = controlHeight），border-radius: 50% */
const genCircleButtonStyle: GenerateStyle<ButtonToken, CSSObject> = (
  token,
) => ({
  minWidth: token.controlHeight,
  paddingInline: 0,
  borderRadius: '50%',
});

// =============================== Size ===============================
/**
 * 尺寸样式的通用模板函数，被三个尺寸变体调用。
 * 设置 fontSize、height、padding、borderRadius 四个核心属性。
 *
 * @param token - 已经用 mergeToken 覆盖了尺寸相关字段的 token
 * @param prefixCls - 空字符串（medium）或 'as-btn-sm'/'as-btn-lg'（带点号前缀）
 */
function genButtonStyle(token: ButtonToken, prefixCls = ''): CSSInterpolation {
  const {
    componentCls,
    fontSize,
    controlHeight,
    buttonPaddingVertical,
    buttonPaddingHorizontal,
    borderRadius,
    iconCls,
    buttonIconOnlyFontSize,
  } = token;

  return [
    {
      [prefixCls]: {
        fontSize,
        height: controlHeight,
        padding: `${unit(buttonPaddingVertical!)} ${unit(buttonPaddingHorizontal!)}`,
        borderRadius,

        [`&${componentCls}-icon-only`]: {
          width: controlHeight,

          [iconCls]: {
            fontSize: buttonIconOnlyFontSize,
          },
        },
      },
    }, // Shape - patch prefixCls again to override solid border radius style
    {
      [`${componentCls}${componentCls}-circle${prefixCls}`]:
        genCircleButtonStyle(token),
    },
    {
      [`${componentCls}${componentCls}-round${prefixCls}`]: {
        borderRadius: token.controlHeight,
        [`&:not(${componentCls}-icon-only)`]: {
          paddingInline: token.buttonPaddingHorizontal,
        },
      },
    },
  ];
}

/** 中号尺寸（默认）：controlHeight=32px，fontSize=contentFontSize */
const genSizeBaseButtonStyle: GenerateStyle<ButtonToken> = (token) => {
  const baseToken = mergeToken<ButtonToken>(token, {
    fontSize: token.contentFontSize,
  });
  return genButtonStyle(baseToken, token.componentCls);
};

/** 小号尺寸：controlHeight→SM(24px)，内间距→SM，圆角→SM */
const genSizeSmallButtonStyle: GenerateStyle<ButtonToken> = (token) => {
  const smallToken = mergeToken<ButtonToken>(token, {
    controlHeight: token.controlHeightSM,
    fontSize: token.contentFontSizeSM,
    padding: token.paddingXS,
    buttonPaddingHorizontal: token.paddingInlineSM,
    buttonPaddingVertical: 0,
    borderRadius: token.borderRadiusSM,
    buttonIconOnlyFontSize: token.onlyIconSizeSM,
  });

  return genButtonStyle(smallToken, `${token.componentCls}-sm`);
};

/** 大号尺寸：controlHeight→LG(40px)，内间距→LG，圆角→LG */
const genSizeLargeButtonStyle: GenerateStyle<ButtonToken> = (token) => {
  const largeToken = mergeToken<ButtonToken>(token, {
    controlHeight: token.controlHeightLG,
    fontSize: token.contentFontSizeLG,
    buttonPaddingHorizontal: token.paddingInlineLG,
    buttonPaddingVertical: 0,
    borderRadius: token.borderRadiusLG,
    buttonIconOnlyFontSize: token.onlyIconSizeLG,
  });

  return genButtonStyle(largeToken, `${token.componentCls}-lg`);
};

/** 块级按钮：width: 100%，占满父容器 */
const genBlockButtonStyle: GenerateStyle<ButtonToken, CSSObject> = (token) => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      [`&${componentCls}-block`]: {
        width: '100%',
      },
    },
  };
};

export default genStyleHooks(
  'Button',
  (token) => {
    const buttonToken = prepareToken(token);

    return [
      // Shared
      genSharedButtonStyle(buttonToken),
      // Size
      genSizeBaseButtonStyle(buttonToken),
      genSizeSmallButtonStyle(buttonToken),
      genSizeLargeButtonStyle(buttonToken),
      // Block
      genBlockButtonStyle(buttonToken),

      // Variant
      genVariantStyle(buttonToken),
    ];
  },
  prepareComponentToken,
  {
    unitless: {},
  },
);

export { type ComponentToken } from './token';

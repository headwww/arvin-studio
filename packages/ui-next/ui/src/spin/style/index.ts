import type { CSSObject } from '@arvin-studio/cssinjs';

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from '../../theme/internal';

import { Keyframes } from '@arvin-studio/cssinjs';

import { resetComponent } from '../../style';
import { genStyleHooks, mergeToken } from '../../theme/internal';
import { genCssVar } from '../../theme/util/genStyleUtils';

export interface ComponentToken {
  /**
   * @desc 内容区域高度
   * @descEN Height of content area
   */
  contentHeight: number | string;
  /**
   * @desc 加载图标尺寸
   * @descEN Loading icon size
   */
  dotSize: number;
  /**
   * @desc 大号加载图标尺寸
   * @descEN Large loading icon size
   */
  dotSizeLG: number;
  /**
   * @desc 小号加载图标尺寸
   * @descEN Small loading icon size
   */
  dotSizeSM: number;
}

interface SpinToken extends FullToken<'Spin'> {
  spinDotDefault: string;
}

// 经典圆环：整体匀速旋转一周（方案 A）
const antSpinRotate = new Keyframes('antSpinRotate', {
  to: { transform: 'rotate(360deg)' },
});

// =============================== Spin ===============================
const genSpinStyle: GenerateStyle<SpinToken, CSSObject> = (token) => {
  const { componentCls } = token;

  const sectionCls = `${componentCls}-section`;

  return {
    [componentCls]: {
      ...resetComponent(token),
      position: 'relative',

      '&-rtl': {
        direction: 'rtl',
      },

      // ========================== Section ===========================
      [`&${sectionCls}, ${sectionCls}`]: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: token.paddingSM,
        color: token.colorPrimary,
      },

      [`&${sectionCls}`]: {
        display: 'inline-flex',
      },

      [sectionCls]: {
        position: 'absolute',
        top: '50%',
        left: {
          _skip_check_: true,
          value: '50%',
        },
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      },

      [`${componentCls}-description`]: {
        fontSize: token.fontSize,
        lineHeight: 1,
      },

      // ========================= Container ==========================
      [`${componentCls}-container`]: {
        position: 'relative',
        transition: `opacity ${token.motionDurationSlow}`,

        '&::after': {
          position: 'absolute',
          top: 0,
          insetInlineEnd: 0,
          bottom: 0,
          insetInlineStart: 0,
          zIndex: 10,
          width: '100%',
          height: '100%',
          background: token.colorBgContainer,
          opacity: 0,
          transition: `all ${token.motionDurationSlow}`,
          content: '""',
          pointerEvents: 'none',
        },
      },

      // ========================== Spinning ==========================
      '&-spinning': {
        [`${componentCls}-description`]: {
          textShadow: `0 0px 5px ${token.colorBgContainer}`,
        },

        [`${componentCls}-container`]: {
          clear: 'both',
          opacity: 0.5,
          userSelect: 'none',
          pointerEvents: 'none',

          '&::after': {
            opacity: 0.4,
            pointerEvents: 'auto',
          },
        },
      },

      // ========================= Fullscreen =========================
      '&-fullscreen': {
        position: 'fixed',
        inset: 0,
        backgroundColor: token.colorBgMask,
        zIndex: token.zIndexPopupBase,
        opacity: 0,
        pointerEvents: 'none',
        transition: `all ${token.motionDurationMid}`,

        [`&${componentCls}-spinning`]: {
          opacity: 1,
          pointerEvents: 'auto',
        },

        [sectionCls]: {
          color: token.colorWhite,

          [`${componentCls}-description`]: {
            color: token.colorTextLightSolid,
          },
        },
      },
    },
  };
};

// ============================ Indicator =============================
const genIndicatorStyle: GenerateStyle<SpinToken, CSSObject> = (token) => {
  const { componentCls, asCls, motionDurationSlow } = token;

  const [varName, varRef] = genCssVar(asCls, 'spin');

  return {
    [componentCls]: {
      [varName('dot-holder-size')]: token.dotSize,

      [`${componentCls}-dot`]: {
        // >>> holder
        '&-holder': {
          width: '1em',
          height: '1em',
          fontSize: varRef('dot-holder-size'),
          display: 'inline-block',
          transition: ['transform', 'opacity']
            .map((prop) => `${prop} ${motionDurationSlow} ease`)
            .join(', '),
          transformOrigin: '50% 50%',
          lineHeight: 1,

          '&-hidden': {
            transform: 'scale(0.3)',
            opacity: 0,
          },
        },

        // >>> holder > dot（经典圆环）
        position: 'relative',
        display: 'inline-block',
        fontSize: varRef('dot-holder-size'),
        width: '1em',
        height: '1em',
        borderRadius: '50%',
        borderWidth: 'calc(' + varRef('dot-holder-size') + ' / 6)',
        borderStyle: 'solid',
        borderColor: token.colorFillSecondary,
        borderTopColor: token.colorPrimary,
        animationName: antSpinRotate,
        animationDuration: '0.9s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',

        // ========================= Progress =========================
        '&-progress': {
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
        },

        '&-circle': {
          strokeLinecap: 'round',
          transition: [
            'stroke-dashoffset',
            'stroke-dasharray',
            'stroke',
            'stroke-width',
            'opacity',
          ]
            .map((item) => `${item} ${motionDurationSlow} ease`)
            .join(','),
          fillOpacity: 0,
          stroke: 'currentcolor',
        },

        '&-circle-bg': {
          stroke: token.colorFillSecondary,
        },
      },
    },
  };
};

// =============================== Size ===============================
const genSizeStyle: GenerateStyle<SpinToken, CSSObject> = (token) => {
  const { componentCls } = token;

  const [varName] = genCssVar(token.asCls, 'spin');

  return {
    [componentCls]: {
      '&-sm': {
        [varName('dot-holder-size')]: token.dotSizeSM,
      },

      '&-lg': {
        [varName('dot-holder-size')]: token.dotSizeLG,
      },
    },
  };
};

// ========================= Component Token ==========================
export const prepareComponentToken: GetDefaultToken<'Spin'> = (token) => {
  const { controlHeightLG, controlHeight } = token;
  return {
    contentHeight: 400,
    dotSize: controlHeightLG / 2,
    dotSizeSM: controlHeightLG * 0.35,
    dotSizeLG: controlHeight,
  };
};

// ============================== Export ==============================
export default genStyleHooks(
  'Spin',
  (token) => {
    const spinToken = mergeToken<SpinToken>(token, {
      spinDotDefault: token.colorTextDescription,
    });
    return [
      genSpinStyle(spinToken),
      genIndicatorStyle(spinToken),
      genSizeStyle(spinToken),
    ];
  },
  prepareComponentToken,
);

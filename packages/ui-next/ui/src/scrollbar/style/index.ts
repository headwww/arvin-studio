import type { CSSObject } from '@arvin-studio/cssinjs';

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from '../../theme/internal';

import { unit } from '@arvin-studio/cssinjs';
import { FastColor } from '@arvin-studio/headless';

import { resetComponent } from '../../style';
import { genStyleHooks } from '../../theme/internal';
import { genCssVar } from '../../theme/util/genStyleUtils';

export interface ComponentToken {
  /**
   * @desc 加载遮罩背景色
   * @descEN Background color of the loading mask
   */
  scrollbarLoadingMaskColor: string;
  /**
   * @desc 悬浮叠加模式下滚动条悬浮后的大小
   * @descEN Size of the scrollbar after hovering in fluent overlay mode
   */
  scrollbarOverlayActionSize: number;
  /**
   * @desc 悬浮叠加模式下滚动条的初始大小
   * @descEN Initial size of the scrollbar in fluent overlay mode
   */
  scrollbarOverlaySize: number;
  /**
   * @desc 滚动条大小
   * @descEN Size of the scrollbar
   */
  scrollbarSize: number;
  /**
   * @desc 滚动条滑块激活颜色
   * @descEN Color of the scrollbar thumb when active
   */
  scrollbarThumbActiveColor: string;
  /**
   * @desc 滚动条滑块圆角
   * @descEN Border radius of the scrollbar thumb
   */
  scrollbarThumbBorderRadius: number;
  /**
   * @desc 滚动条滑块颜色
   * @descEN Color of the scrollbar thumb
   */
  scrollbarThumbColor: string;
  /**
   * @desc 滚动条滑块悬浮颜色
   * @descEN Color of the scrollbar thumb when hovering
   */
  scrollbarThumbHoverColor: string;
  /**
   * @desc 滚动条轨道颜色
   * @descEN Color of the scrollbar track
   */
  scrollbarTrackColor: string;
  /**
   * @desc 滚动条轨道内边距
   * @descEN Padding of the scrollbar track
   */
  scrollbarTrackPadding: number;
}

interface ScrollbarToken extends FullToken<'Scrollbar'> {}

const genScrollbarStyle: GenerateStyle<ScrollbarToken, CSSObject> = (token) => {
  const {
    componentCls,
    asCls,
    scrollbarSize,
    scrollbarOverlaySize,
    scrollbarOverlayActionSize,
    scrollbarTrackPadding,
    scrollbarThumbBorderRadius,
    scrollbarThumbColor,
    scrollbarThumbHoverColor,
    scrollbarThumbActiveColor,
    scrollbarTrackColor,
    scrollbarLoadingMaskColor,
  } = token;

  const [varName, varRef] = genCssVar(asCls, 'scrollbar');

  const yWidth = varRef('y-width');
  const xHeight = varRef('x-height');
  const overlayYWidth = varRef('overlay-y-width');
  const overlayXHeight = varRef('overlay-x-height');
  const overlayActionYWidth = varRef('overlay-action-y-width');
  const overlayActionXHeight = varRef('overlay-action-x-height');
  const trackPadding = varRef('track-padding');
  const thumbRadius = varRef('thumb-radius');
  const thumbBg = varRef('thumb-bg');
  const thumbHoverBg = varRef('thumb-hover-bg');
  const thumbActiveBg = varRef('thumb-active-bg');
  const trackBg = varRef('track-bg');
  const currentYWidth = varRef('current-y-width');
  const currentXHeight = varRef('current-x-height');

  const viewCls = `${componentCls}-view`;
  const trackXCls = `${componentCls}-track-x`;
  const trackYCls = `${componentCls}-track-y`;
  const thumbXCls = `${componentCls}-thumb-x`;
  const thumbYCls = `${componentCls}-thumb-y`;
  const loadingCls = `${componentCls}-loading`;

  return {
    [componentCls]: {
      ...resetComponent(token),
      position: 'relative',

      [varName('y-width')]: unit(scrollbarSize),
      [varName('x-height')]: yWidth,
      [varName('overlay-y-width')]: unit(scrollbarOverlaySize),
      [varName('overlay-x-height')]: overlayYWidth,
      [varName('overlay-action-y-width')]: unit(scrollbarOverlayActionSize),
      [varName('overlay-action-x-height')]: overlayActionYWidth,
      [varName('track-padding')]: unit(scrollbarTrackPadding),
      [varName('thumb-radius')]: unit(scrollbarThumbBorderRadius),
      [varName('thumb-bg')]: scrollbarThumbColor,
      [varName('thumb-hover-bg')]: scrollbarThumbHoverColor,
      [varName('thumb-active-bg')]: scrollbarThumbActiveColor,
      [varName('track-bg')]: scrollbarTrackColor,

      // 默认模式：使用常规尺寸
      '&-default-mode': {
        [varName('current-y-width')]: yWidth,
        [varName('current-x-height')]: xHeight,
      },

      // 悬浮叠加模式：默认细线，悬浮后变宽
      '&-fluent-overlay': {
        [varName('current-y-width')]: overlayYWidth,
        [varName('current-x-height')]: overlayXHeight,

        [`& > ${trackXCls}, & > ${trackYCls}`]: {
          '&:hover': {
            [varName('current-y-width')]: overlayActionYWidth,
            [varName('current-x-height')]: overlayActionXHeight,
          },
        },
      },

      // 隐藏原生滚动条
      '&-virtual': {
        [`& > ${viewCls}`]: {
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },

        [`& > ${viewCls}::-webkit-scrollbar`]: {
          display: 'none',
        },
      },

      // 使用原生滚动条
      '&-native': {
        [`& > ${viewCls}::-webkit-scrollbar`]: {
          width: currentYWidth,
          height: currentXHeight,
        },

        [`& > ${viewCls}::-webkit-scrollbar-thumb`]: {
          borderRadius: thumbRadius,
          backgroundColor: thumbBg,
        },

        [`& > ${viewCls}::-webkit-scrollbar-thumb:hover`]: {
          backgroundColor: thumbHoverBg,
        },

        [`& > ${viewCls}::-webkit-scrollbar-thumb:active`]: {
          backgroundColor: thumbActiveBg,
        },
      },

      '&-x-hidden': {
        [`& > ${viewCls}`]: {
          overflowX: 'hidden',
        },
      },

      '&-y-hidden': {
        [`& > ${viewCls}`]: {
          overflowY: 'hidden',
        },
      },

      // 自动隐藏
      '&-x-auto-hide': {
        [`& > ${trackXCls}`]: {
          opacity: 0,
          transition: 'opacity 0.8s',
        },

        '&:hover': {
          [`& > ${trackXCls}`]: {
            opacity: 1,
          },
        },
      },

      '&-y-auto-hide': {
        [`& > ${trackYCls}`]: {
          opacity: 0,
          transition: 'opacity 0.8s',
        },

        '&:hover': {
          [`& > ${trackYCls}`]: {
            opacity: 1,
          },
        },
      },

      // 滚动条轨道显示
      '&-overflow-x': {
        [`& > ${trackXCls}`]: {
          display: 'block',
        },
      },

      '&-overflow-y': {
        [`& > ${trackYCls}`]: {
          display: 'block',
        },
      },

      // 滚动条位置
      '&-x-top': {
        [`& > ${trackXCls}`]: {
          top: 0,
        },
      },

      '&-x-bottom': {
        [`& > ${trackXCls}`]: {
          bottom: 0,
        },
      },

      '&-y-left': {
        [`& > ${trackYCls}`]: {
          left: 0,
        },
      },

      '&-y-right': {
        [`& > ${trackYCls}`]: {
          right: 0,
        },
      },

      // 横纵滚动条同时出现时，为另一条轨道让出空间
      [`&${componentCls}-overflow-x${componentCls}-overflow-y`]: {
        [`& > ${trackXCls}`]: {
          width: `calc(100% - ${currentXHeight})`,
        },

        [`& > ${trackYCls}`]: {
          height: `calc(100% - ${currentYWidth})`,
        },

        [`&${componentCls}-x-top${componentCls}-y-left, &${componentCls}-x-top${componentCls}-y-right`]:
          {
            [`& > ${trackYCls}`]: {
              top: currentXHeight,
            },
          },

        [`&${componentCls}-y-left${componentCls}-x-top, &${componentCls}-y-left${componentCls}-x-bottom`]:
          {
            [`& > ${trackXCls}`]: {
              left: currentYWidth,
            },
          },
      },

      // 为滚动条预留边距
      '&-padding': {
        [`&${componentCls}-overflow-x${componentCls}-x-top`]: {
          paddingTop: currentXHeight,
        },

        [`&${componentCls}-overflow-x${componentCls}-x-bottom`]: {
          paddingBottom: currentXHeight,
        },

        [`&${componentCls}-overflow-y${componentCls}-y-left`]: {
          paddingLeft: currentYWidth,
        },

        [`&${componentCls}-overflow-y${componentCls}-y-right`]: {
          paddingRight: currentYWidth,
        },
      },
    },

    [viewCls]: {
      width: '100%',
      height: '100%',
      overflowX: 'auto',
      overflowY: 'auto',
    },

    [trackXCls]: {
      position: 'absolute',
      display: 'none',
      left: 0,
      width: '100%',
      height: currentXHeight,
      padding: `${trackPadding} 0`,
      boxSizing: 'border-box',
      overflow: 'hidden',
      backgroundColor: trackBg,
      userSelect: 'none',
    },

    [trackYCls]: {
      position: 'absolute',
      display: 'none',
      top: 0,
      height: '100%',
      width: currentYWidth,
      padding: `0 ${trackPadding}`,
      boxSizing: 'border-box',
      overflow: 'hidden',
      backgroundColor: trackBg,
      userSelect: 'none',
    },

    [thumbXCls]: {
      height: '100%',
    },

    [thumbYCls]: {
      width: '100%',
    },

    [`${thumbXCls}, ${thumbYCls}`]: {
      borderRadius: thumbRadius,
      backgroundColor: thumbBg,

      '&:hover': {
        backgroundColor: thumbHoverBg,
      },

      '&:active': {
        backgroundColor: thumbActiveBg,
      },
    },

    [loadingCls]: {
      position: 'absolute',
      inset: 0,
      zIndex: 99,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: scrollbarLoadingMaskColor,
    },
  };
};

export const prepareComponentToken: GetDefaultToken<'Scrollbar'> = (token) => ({
  scrollbarSize: 10,
  scrollbarOverlaySize: 4,
  scrollbarOverlayActionSize: 12,
  scrollbarTrackPadding: 0,
  scrollbarThumbBorderRadius: token.borderRadiusSM,
  scrollbarThumbColor: new FastColor(token.colorText).setA(0.4).toRgbString(),
  scrollbarThumbHoverColor: new FastColor(token.colorText)
    .setA(0.5)
    .toRgbString(),
  scrollbarThumbActiveColor: new FastColor(token.colorText)
    .setA(0.6)
    .toRgbString(),
  scrollbarTrackColor: 'transparent',
  scrollbarLoadingMaskColor: new FastColor(token.colorBgContainer)
    .setA(0.5)
    .toRgbString(),
});

// ============================== Export ==============================
export default genStyleHooks(
  'Scrollbar',
  genScrollbarStyle,
  prepareComponentToken,
);

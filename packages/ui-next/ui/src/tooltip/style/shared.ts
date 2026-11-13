/**
 * @file SharedTooltip 组件样式（CSS-in-JS），复刻 VXE Tooltip 的视觉与定位规则。
 */

import type { CSSObject } from '@arvin-studio/cssinjs';

import type { FullToken, GenerateStyle } from '../../theme/internal';

import { Keyframes, unit } from '@arvin-studio/cssinjs';

import { genStyleHooks } from '../../theme/internal';
import { genCssVar } from '../../theme/util/genStyleUtils';

/** 面板进出场动画时长（ms），组件按同一时长安排关闭后的状态清理 */
export const SHARED_TOOLTIP_MOTION_DURATION = 160;

/**
 * 弹入动画：从触发元素一侧轻微放大，同时淡入。
 * 配合 placement 的 transform-origin，让动画看起来是从目标元素“长出来”的。
 */
const sharedTooltipEnterKeyframes = new Keyframes('asSharedTooltipEnter', {
  '0%': {
    opacity: 0,
    transform: 'scale(0.92)',
  },

  '100%': {
    opacity: 1,
    transform: 'scale(1)',
  },
});

/** SharedTooltip 的组件级 token，当前没有额外 token，保留给主题扩展 */
export type ComponentToken = object;

interface SharedTooltipToken extends FullToken<'SharedTooltip'> {}

/**
 * 生成 SharedTooltip 样式。
 *
 * 面板的真实位置、宽高由 JS 计算后写入内联样式，这里只负责外观、
 * 箭头方向以及 `enterable` 时用于衔接触发元素的透明感应区。
 */
const genSharedTooltipStyle: GenerateStyle<SharedTooltipToken, CSSObject> = (
  token,
) => {
  const {
    asCls,
    borderRadius,
    colorBgSpotlight,
    colorText,
    colorTextLightSolid,
    componentCls,
    dropShadowPopover,
    fontFamily,
  } = token;

  const [scrollbarVarName] = genCssVar(asCls, 'scrollbar');

  const bodyCls = `${componentCls}-body`;
  const contentCls = `${componentCls}-content`;
  const scrollbarContentCls = `${componentCls}-scrollbar-content`;
  const scrollbarViewCls = `${componentCls}-scrollbar-content-view`;
  const scrollbarInnerCls = `${componentCls}-scrollbar-content-inner`;
  const arrowCls = `${componentCls}-arrow`;

  /** 内容区与滚动条视图共享的排版尺寸 */
  const contentStyle: CSSObject = {
    width: 'max-content',
    maxWidth: 600,
    maxHeight: 800,
    padding: '8px 12px',
    overflow: 'auto',
    whiteSpace: 'pre-line',
    borderRadius: unit(borderRadius),
  };

  return {
    [componentCls]: {
      // 面板容器：默认隐藏，由 visible 与 placement 类控制显示和方向
      display: 'none',
      position: 'absolute',
      top: '-100%',
      left: '-100%',
      fontFamily,
      fontSize: '12px',
      color: colorText,
      pointerEvents: 'none',
      filter: dropShadowPopover,

      [`&${componentCls}-visible`]: {
        display: 'inline-block',
        animationName: sharedTooltipEnterKeyframes,
        animationDuration: `${SHARED_TOOLTIP_MOTION_DURATION}ms`,
        animationTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        animationFillMode: 'both',
      },

      [`&${componentCls}-has-arrow`]: {
        [arrowCls]: {
          display: 'block',
        },
      },

      // enterable：在面板与触发元素之间铺一块透明区域，避免鼠标移动时闪断
      [`&${componentCls}-enterable`]: {
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '6px',
          background: 'transparent',
        },

        [bodyCls]: {
          pointerEvents: 'all',
        },
      },

      // 普通内容区：宽高由 props 计算后走内联样式
      [contentCls]: contentStyle,

      // 使用 Scrollbar 时，尺寸和排版落在滚动视图上
      [scrollbarViewCls]: contentStyle,

      [scrollbarContentCls]: {
        maxWidth: '100%',

        // 气泡始终是暗色，滚动条滑块需要反色，否则默认的深色滑块会融进背景
        [scrollbarVarName('thumb-bg')]: 'rgba(255, 255, 255, 0.4)',
        [scrollbarVarName('thumb-hover-bg')]: 'rgba(255, 255, 255, 0.5)',
        [scrollbarVarName('thumb-active-bg')]: 'rgba(255, 255, 255, 0.6)',
      },

      [scrollbarInnerCls]: {
        minWidth: 0,
      },

      // 面板主体：暗色气泡，带轻微投影
      [bodyCls]: {
        position: 'relative',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        borderRadius: unit(borderRadius),
        background: colorBgSpotlight,
        color: colorTextLightSolid,
      },

      // 箭头：用上下边框着色形成三角形，内层再叠一层伪元素盖住接缝
      [arrowCls]: {
        display: 'none',
        position: 'absolute',
        left: '50%',
        borderWidth: '6px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        transform: 'translateX(-6px)',

        '&::before': {
          content: '""',
          position: 'absolute',
          left: '-5px',
          borderWidth: '5px',
          borderStyle: 'solid',
          borderColor: 'transparent',
        },
      },

      [`&${componentCls}-placement-top`]: {
        [`&${componentCls}-has-arrow`]: {
          // 给箭头留出空间，避免箭头盖住内容
          paddingBottom: '6px',
        },

        [`&${componentCls}-enterable::after`]: {
          bottom: '-6px',
        },

        [arrowCls]: {
          bottom: '-11px',
          borderTopColor: colorBgSpotlight,

          '&::before': {
            top: '-7px',
            borderTopColor: colorBgSpotlight,
          },
        },
      },

      [`&${componentCls}-placement-bottom`]: {
        [`&${componentCls}-has-arrow`]: {
          paddingTop: '6px',
        },

        [`&${componentCls}-enterable::after`]: {
          top: '-6px',
        },

        [arrowCls]: {
          top: '-11px',
          borderBottomColor: colorBgSpotlight,

          '&::before': {
            top: '-3px',
            borderBottomColor: colorBgSpotlight,
          },
        },
      },
    },
  };
};

export default genStyleHooks('SharedTooltip', genSharedTooltipStyle);

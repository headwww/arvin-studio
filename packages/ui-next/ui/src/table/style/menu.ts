import type { CSSInterpolation, CSSObject } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

import { Keyframes } from '@arvin-studio/cssinjs';

const menuZoomIn = new Keyframes('asTableMenuZoomIn', {
  '0%': {
    opacity: 0,
    transform: 'scale(0.92)',
  },

  '100%': {
    opacity: 1,
    transform: 'scale(1)',
  },
});

export function genMenuStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    fontSize,
    fontSizeSM,
    fontFamily,
    lineHeight,
    colorText,
    colorTextDisabled,
    colorBgElevated,
    boxShadowSecondary,
    controlHeight,
    controlItemBgHover,
    controlPaddingHorizontal,
    borderRadiusLG,
    borderRadiusSM,
    marginXS,
    motionDurationMid,
    motionEaseOutCirc,
    paddingXXS,
    zIndexPopupBase,
  } = token;

  const wrapperCls = `${componentCls}--context-menu-wrapper`;
  const childWrapperCls = `${componentCls}--context-menu-child-wrapper`;
  const optionCls = `${componentCls}--context-menu--option`;
  const linkCls = `${componentCls}-context-menu--link`;
  const motionCls = `${componentCls}-menu-popup`;

  // token 在 CSS 变量模式下是 var(...) 字符串，数值运算会得到 NaN，
  // 这里改用 calc 表达式拼出垂直内边距
  const itemPaddingBlock = token
    .calc(controlHeight)
    .sub(`calc(${fontSize} * ${lineHeight})`)
    .div(2)
    .equal();

  const menuBase: CSSObject = {
    minWidth: 'var(--menu-item-width, 120px)',
    padding: paddingXXS,
    fontSize,
    fontFamily,
    lineHeight,
    color: colorText,
    backgroundColor: colorBgElevated,
    borderRadius: borderRadiusLG,
    boxShadow: boxShadowSecondary,
    userSelect: 'none',
  };

  return [
    {
      [`${motionCls}-enter-active, ${motionCls}-leave-active`]: {
        transition: `opacity ${motionDurationMid}, transform ${motionDurationMid}`,
        transformOrigin: 'top left',
      },
      [`${motionCls}-enter-from, ${motionCls}-leave-to`]: {
        opacity: 0,
        transform: 'scale(0.92)',
      },
      [wrapperCls]: {
        ...menuBase,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: token.calc(zIndexPopupBase).add(100).equal(),
        transformOrigin: 'top left',
      },
      [childWrapperCls]: {
        ...menuBase,
        position: 'absolute',
        top: 0,
        left: '100%',
        display: 'none',
        zIndex: token.calc(zIndexPopupBase).add(100).equal(),
        transformOrigin: 'top left',
        '&.is--show': {
          display: 'block',
          animationName: menuZoomIn,
          animationDuration: motionDurationMid,
          animationTimingFunction: motionEaseOutCirc,
          animationFillMode: 'both',
        },
      },
      [`${wrapperCls} ul, ${childWrapperCls} ul`]: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
      },
      [optionCls]: {
        position: 'relative',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        borderRadius: borderRadiusSM,
        transition: `background-color ${motionDurationMid}`,
        '&:hover, &.link--active': {
          backgroundColor: controlItemBgHover,
        },
        '&.link--loading, &.link--disabled': {
          [`> ${linkCls}`]: {
            color: colorTextDisabled,
            cursor: 'not-allowed',
          },
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
      [linkCls]: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: `${itemPaddingBlock} ${controlPaddingHorizontal}`,
        color: 'inherit',
        fontSize,
        lineHeight,
        textDecoration: 'none',
        cursor: 'pointer',
      },
      [`${linkCls}-prefix`]: {
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        marginInlineEnd: marginXS,
        color: 'inherit',
      },
      [`${linkCls}-suffix`]: {
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        marginInlineStart: marginXS,
        color: 'inherit',
        fontSize: fontSizeSM,
      },
      [`${linkCls}-content`]: {
        flexGrow: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },
  ];
}

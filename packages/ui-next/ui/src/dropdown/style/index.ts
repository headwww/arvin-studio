import type { CSSProperties } from 'vue';

import type { ArrowOffsetToken } from '../../style/placementArrow';
import type { ArrowToken } from '../../style/roundedArrow';
import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from '../../theme/internal';

import { unit } from '@arvin-studio/cssinjs';

import { genFocusStyle, resetComponent } from '../../style';
import {
  initMoveMotion,
  initSlideMotion,
  initZoomMotion,
  slideDownIn,
  slideDownOut,
  slideLeftIn,
  slideLeftOut,
  slideRightIn,
  slideRightOut,
  slideUpIn,
  slideUpOut,
} from '../../style/motion';
import getArrowStyle, { getArrowOffsetToken } from '../../style/placementArrow';
import { getArrowToken } from '../../style/roundedArrow';
import { genStyleHooks, mergeToken } from '../../theme/internal';
import genStatusStyle from './status';

export interface ComponentToken extends ArrowOffsetToken, ArrowToken {
  /**
   * @desc 下拉菜单纵向内边距
   * @descEN Vertical padding of dropdown
   */
  paddingBlock: CSSProperties['paddingBlock'];
  /**
   * @desc 下拉菜单 z-index
   * @descEN z-index of dropdown
   */
  zIndexPopup: number;
}

/**
 * @desc Dropdown 组件的 Token
 * @descEN Token for Dropdown component
 */
export interface DropdownToken extends FullToken<'Dropdown'> {
  /**
   * @desc 下拉箭头距离
   * @descEN Distance of dropdown arrow
   */
  dropdownArrowDistance: number | string;
  /**
   * @desc 下拉菜单边缘子项内边距
   * @descEN Padding of edge child in dropdown menu
   */
  dropdownEdgeChildPadding: number;
  /**
   * @desc 菜单类名
   * @descEN Menu class name
   */
  menuCls: string;
}

// =============================== Base ===============================
const genBaseStyle: GenerateStyle<DropdownToken> = (token) => {
  const {
    componentCls,
    menuCls,
    zIndexPopup,
    dropdownArrowDistance,
    sizePopupArrow,
    asCls,
    iconCls,
    motionDurationMid,
    paddingBlock,
    fontSize,
    dropdownEdgeChildPadding,
    colorTextDisabled,
    fontSizeIcon,
    controlPaddingHorizontal,
    colorBgElevated,
    controlHeightLG,
  } = token;

  return [
    {
      [componentCls]: {
        position: 'absolute',
        top: -9999,
        left: {
          _skip_check_: true,
          value: -9999,
        },
        zIndex: zIndexPopup,
        display: 'block',

        // A placeholder out of dropdown visible range to avoid close when user moving
        '&::before': {
          position: 'absolute',
          insetBlock: token
            .calc(sizePopupArrow)
            .div(2)
            .sub(dropdownArrowDistance)
            .equal(),
          // insetInlineStart: -7, // FIXME: Seems not work for hidden element
          zIndex: -9999,
          opacity: 0.0001,
          content: '""',
        },

        // Makes vertical dropdowns have a scrollbar once they become taller than the viewport.
        // Leave some viewport spacing so the menu stays on-screen when the trigger is centered.
        '&-menu-vertical': {
          maxHeight: `calc(100vh - ${unit(token.calc(controlHeightLG).mul(2.5).equal())})`,
          overflowY: 'auto',
        },

        [`&-trigger${asCls}-btn`]: {
          [`& > ${iconCls}-down, & > ${asCls}-btn-icon > ${iconCls}-down`]: {
            fontSize: fontSizeIcon,
          },
        },

        [`${componentCls}-wrap`]: {
          position: 'relative',

          [`${asCls}-btn > ${iconCls}-down`]: {
            fontSize: fontSizeIcon,
          },

          [`${iconCls}-down::before`]: {
            transition: `transform ${motionDurationMid}`,
          },
        },

        [`${componentCls}-wrap-open`]: {
          [`${iconCls}-down::before`]: {
            transform: `rotate(180deg)`,
          },
        },

        [`
        &-hidden,
        &-menu-hidden,
        &-menu-submenu-hidden
      `]: {
          display: 'none',
        },

        // =============================================================
        // ==                         Motion                          ==
        // =============================================================
        // When position is not enough for dropdown, the placement will revert.
        // We will handle this with revert motion name.
        [`&${asCls}-slide-down-enter${asCls}-slide-down-enter-active${componentCls}-placement-bottomLeft,
          &${asCls}-slide-down-appear${asCls}-slide-down-appear-active${componentCls}-placement-bottomLeft,
          &${asCls}-slide-down-enter${asCls}-slide-down-enter-active${componentCls}-placement-bottom,
          &${asCls}-slide-down-appear${asCls}-slide-down-appear-active${componentCls}-placement-bottom,
          &${asCls}-slide-down-enter${asCls}-slide-down-enter-active${componentCls}-placement-bottomRight,
          &${asCls}-slide-down-appear${asCls}-slide-down-appear-active${componentCls}-placement-bottomRight`]:
          {
            animationName: slideUpIn,
          },

        [`&${asCls}-slide-up-enter${asCls}-slide-up-enter-active${componentCls}-placement-topLeft,
          &${asCls}-slide-up-appear${asCls}-slide-up-appear-active${componentCls}-placement-topLeft,
          &${asCls}-slide-up-enter${asCls}-slide-up-enter-active${componentCls}-placement-top,
          &${asCls}-slide-up-appear${asCls}-slide-up-appear-active${componentCls}-placement-top,
          &${asCls}-slide-up-enter${asCls}-slide-up-enter-active${componentCls}-placement-topRight,
          &${asCls}-slide-up-appear${asCls}-slide-up-appear-active${componentCls}-placement-topRight`]:
          {
            animationName: slideDownIn,
          },

        [`&${asCls}-slide-down-leave${asCls}-slide-down-leave-active${componentCls}-placement-bottomLeft,
          &${asCls}-slide-down-leave${asCls}-slide-down-leave-active${componentCls}-placement-bottom,
          &${asCls}-slide-down-leave${asCls}-slide-down-leave-active${componentCls}-placement-bottomRight`]:
          {
            animationName: slideUpOut,
          },

        [`&${asCls}-slide-up-leave${asCls}-slide-up-leave-active${componentCls}-placement-topLeft,
          &${asCls}-slide-up-leave${asCls}-slide-up-leave-active${componentCls}-placement-top,
          &${asCls}-slide-up-leave${asCls}-slide-up-leave-active${componentCls}-placement-topRight`]:
          {
            animationName: slideDownOut,
          },

        [`&${asCls}-slide-right-enter${asCls}-slide-right-enter-active${componentCls}-placement-right,
          &${asCls}-slide-right-appear${asCls}-slide-right-appear-active${componentCls}-placement-right,
          &${asCls}-slide-right-enter${asCls}-slide-right-enter-active${componentCls}-placement-rightTop,
          &${asCls}-slide-right-appear${asCls}-slide-right-appear-active${componentCls}-placement-rightTop,
          &${asCls}-slide-right-enter${asCls}-slide-right-enter-active${componentCls}-placement-rightBottom,
          &${asCls}-slide-right-appear${asCls}-slide-right-appear-active${componentCls}-placement-rightBottom`]:
          {
            animationName: slideLeftIn,
          },

        [`&${asCls}-slide-left-enter${asCls}-slide-left-enter-active${componentCls}-placement-left,
          &${asCls}-slide-left-appear${asCls}-slide-left-appear-active${componentCls}-placement-left,
          &${asCls}-slide-left-enter${asCls}-slide-left-enter-active${componentCls}-placement-leftTop,
          &${asCls}-slide-left-appear${asCls}-slide-left-appear-active${componentCls}-placement-leftTop,
          &${asCls}-slide-left-enter${asCls}-slide-left-enter-active${componentCls}-placement-leftBottom,
          &${asCls}-slide-left-appear${asCls}-slide-left-appear-active${componentCls}-placement-leftBottom`]:
          {
            animationName: slideRightIn,
          },

        [`&${asCls}-slide-right-leave${asCls}-slide-right-leave-active${componentCls}-placement-right,
          &${asCls}-slide-right-leave${asCls}-slide-right-leave-active${componentCls}-placement-rightTop,
          &${asCls}-slide-right-leave${asCls}-slide-right-leave-active${componentCls}-placement-rightBottom`]:
          {
            animationName: slideLeftOut,
          },

        [`&${asCls}-slide-left-leave${asCls}-slide-left-leave-active${componentCls}-placement-left,
          &${asCls}-slide-left-leave${asCls}-slide-left-leave-active${componentCls}-placement-leftTop,
          &${asCls}-slide-left-leave${asCls}-slide-left-leave-active${componentCls}-placement-leftBottom`]:
          {
            animationName: slideRightOut,
          },
      },
    },

    // =============================================================
    // ==                        Arrow style                      ==
    // =============================================================
    getArrowStyle<DropdownToken>(token, colorBgElevated),

    {
      // =============================================================
      // ==                          Menu                           ==
      // =============================================================
      [`${componentCls} ${menuCls}`]: {
        position: 'relative',
        margin: 0,
      },

      [`${menuCls}-submenu-popup`]: {
        position: 'absolute',
        zIndex: zIndexPopup,
        background: 'transparent',
        boxShadow: 'none',
        transformOrigin: '0 0',

        'ul, li': {
          listStyle: 'none',
          margin: 0,
        },
      },

      [`${componentCls}, ${componentCls}-menu-submenu`]: {
        ...resetComponent(token),

        [menuCls]: {
          padding: dropdownEdgeChildPadding,
          listStyleType: 'none',
          backgroundColor: colorBgElevated,
          backgroundClip: 'padding-box',
          borderRadius: token.borderRadiusLG,
          outline: 'none',
          boxShadow: token.boxShadowSecondary,
          ...genFocusStyle(token),

          '&:empty': {
            padding: 0,
            boxShadow: 'none',
          },

          [`${menuCls}-item-group-title`]: {
            padding: `${unit(paddingBlock!)} ${unit(controlPaddingHorizontal)}`,
            color: token.colorTextDescription,
            transition: `all ${motionDurationMid}`,
          },

          // ======================= Item Content =======================
          [`${menuCls}-item`]: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          },

          [`${menuCls}-item-icon`]: {
            minWidth: fontSize,
            marginInlineEnd: token.marginXS,
            fontSize: token.fontSizeSM,
          },

          [`${menuCls}-title-content`]: {
            flex: 'auto',

            '&-with-extra': {
              display: 'inline-flex',
              alignItems: 'center',
              width: '100%',
            },

            [`> a, > ${menuCls}-item-label > a`]: {
              color: 'inherit',
              transition: `all ${motionDurationMid}`,

              '&:hover': {
                color: 'inherit',
              },

              '&::after': {
                position: 'absolute',
                inset: 0,
                content: '""',
              },
            },

            [`${menuCls}-item-extra`]: {
              paddingInlineStart: token.padding,
              marginInlineStart: 'auto',
              fontSize: token.fontSizeSM,
              color: token.colorTextDescription,
            },
          },

          // =========================== Item ===========================
          [`${menuCls}-item, ${menuCls}-submenu-title`]: {
            display: 'flex',
            margin: 0,
            padding: `${unit(paddingBlock!)} ${unit(controlPaddingHorizontal)}`,
            color: token.colorText,
            fontWeight: 'normal',
            fontSize,
            lineHeight: token.lineHeight,
            cursor: 'pointer',
            transition: `all ${motionDurationMid}`,
            borderRadius: token.borderRadiusSM,

            '&:hover, &-active': {
              backgroundColor: token.controlItemBgHover,
            },

            ...genFocusStyle(token),

            '&-selected': {
              color: token.colorPrimary,
              backgroundColor: token.controlItemBgActive,
              '&:hover, &-active': {
                backgroundColor: token.controlItemBgActiveHover,
              },
            },

            '&-disabled': {
              color: colorTextDisabled,
              cursor: 'not-allowed',

              '&:hover': {
                color: colorTextDisabled,
                backgroundColor: colorBgElevated,
                cursor: 'not-allowed',
              },

              a: {
                pointerEvents: 'none',
              },
            },

            '&-divider': {
              height: 1, // By design
              margin: `${unit(token.marginXXS)} 0`,
              overflow: 'hidden',
              lineHeight: 0,
              backgroundColor: token.colorSplit,
            },

            [`${componentCls}-menu-submenu-expand-icon`]: {
              position: 'absolute',
              insetInlineEnd: token.paddingXS,

              [`${componentCls}-menu-submenu-arrow-icon`]: {
                marginInlineEnd: '0 !important',
                color: token.colorIcon,
                fontSize: fontSizeIcon,
                fontStyle: 'normal',
              },
            },
          },

          [`${menuCls}-item-group-list`]: {
            margin: `0 ${unit(token.marginXS)}`,
            padding: 0,
            listStyle: 'none',
          },

          [`${menuCls}-submenu-title`]: {
            paddingInlineEnd: token
              .calc(controlPaddingHorizontal)
              .add(token.fontSizeSM)
              .equal(),
          },

          [`${menuCls}-submenu-vertical`]: {
            position: 'relative',
          },

          [`${menuCls}-submenu${menuCls}-submenu-disabled ${componentCls}-menu-submenu-title`]:
            {
              [`&, ${componentCls}-menu-submenu-arrow-icon`]: {
                color: colorTextDisabled,
                backgroundColor: colorBgElevated,
                cursor: 'not-allowed',
              },
            },

          [`${menuCls}-submenu-selected ${componentCls}-menu-submenu-title`]: {
            color: token.colorPrimary,
          },
        },
      },
    },

    // Follow code may reuse in other components
    [
      initSlideMotion(token, 'slide-up'),
      initSlideMotion(token, 'slide-down'),
      initSlideMotion(token, 'slide-left'),
      initSlideMotion(token, 'slide-right'),
      initMoveMotion(token, 'move-up'),
      initMoveMotion(token, 'move-down'),
      initZoomMotion(token, 'zoom-big'),
    ],
  ];
};

// ============================== Export ==============================
export const prepareComponentToken: GetDefaultToken<'Dropdown'> = (token) => ({
  zIndexPopup: token.zIndexPopupBase + 50,
  paddingBlock: (token.controlHeight - token.fontSize * token.lineHeight) / 2,
  ...getArrowOffsetToken({
    contentRadius: token.borderRadiusLG,
    limitVerticalRadius: true,
  }),
  ...getArrowToken(token),
});

export default genStyleHooks(
  'Dropdown',
  (token) => {
    const { marginXXS, sizePopupArrow, paddingXXS, componentCls } = token;

    const dropdownToken = mergeToken<DropdownToken>(token, {
      menuCls: `${componentCls}-menu`,
      dropdownArrowDistance: token
        .calc(sizePopupArrow)
        .div(2)
        .add(marginXXS)
        .equal(),
      dropdownEdgeChildPadding: paddingXXS,
    });
    return [genBaseStyle(dropdownToken), genStatusStyle(dropdownToken)];
  },
  prepareComponentToken,
  { resetStyle: false },
);

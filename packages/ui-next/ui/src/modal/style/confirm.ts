// Style as confirm component
import type { CSSObject } from '@arvin-studio/cssinjs';

import type { ModalToken } from '.';
import type { GenerateStyle } from '../../theme/internal';

import { unit } from '@arvin-studio/cssinjs';

import { prepareComponentToken, prepareToken } from '.';
import { clearFix } from '../../style';
import { genSubStyleComponent } from '../../theme/internal';

// ============================= Confirm ==============================
const genModalConfirmStyle: GenerateStyle<ModalToken, CSSObject> = (token) => {
  const {
    componentCls,
    titleFontSize,
    titleLineHeight,
    modalConfirmIconSize,
    fontSize,
    lineHeight,
    modalTitleHeight,
    fontHeight,
    confirmBodyPadding,
  } = token;
  const confirmComponentCls = `${componentCls}-confirm`;

  return {
    [confirmComponentCls]: {
      '&-rtl': {
        direction: 'rtl',
      },
      [`${token.asCls}-modal-header`]: {
        display: 'none',
      },
      [`${confirmComponentCls}-body-wrapper`]: {
        ...clearFix(),
      },
      [`&${componentCls} ${componentCls}-body`]: {
        padding: confirmBodyPadding,
      },

      // ====================== Body ======================
      [`${confirmComponentCls}-body`]: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'start',

        [`> ${token.iconCls}`]: {
          flex: 'none',
          fontSize: modalConfirmIconSize,
          marginInlineEnd: token.confirmIconMarginInlineEnd,
          marginTop: token
            .calc(token.calc(fontHeight).sub(modalConfirmIconSize).equal())
            .div(2)
            .equal(),
        },
        [`&-has-title > ${token.iconCls}`]: {
          marginTop: token
            .calc(
              token.calc(modalTitleHeight).sub(modalConfirmIconSize).equal(),
            )
            .div(2)
            .equal(),
        },
      },

      [`${confirmComponentCls}-paragraph`]: {
        display: 'flex',
        flexDirection: 'column',
        flex: 'auto',
        rowGap: token.marginXS,
        maxWidth: `calc(100% - ${unit(token.marginSM)})`,
      },

      [`${confirmComponentCls}-body-no-icon ${confirmComponentCls}-paragraph`]:
        {
          maxWidth: '100%',
        },

      [`${token.iconCls} + ${confirmComponentCls}-paragraph`]: {
        maxWidth: `calc(100% - ${unit(
          token.calc(token.modalConfirmIconSize).add(token.marginSM).equal(),
        )})`,
      },

      [`${confirmComponentCls}-title`]: {
        color: token.colorTextHeading,
        fontWeight: token.fontWeightStrong,
        fontSize: titleFontSize,
        lineHeight: titleLineHeight,
      },

      [`${confirmComponentCls}-container`]: {
        color: token.colorText,
        fontSize,
        lineHeight,
      },

      // ===================== Footer =====================
      [`${confirmComponentCls}-btns`]: {
        textAlign: 'end',
        marginTop: token.confirmBtnsMarginTop,

        [`${token.asCls}-btn + ${token.asCls}-btn`]: {
          marginBottom: 0,
          marginInlineStart: token.marginXS,
        },
      },
    },

    [`${confirmComponentCls}-error ${confirmComponentCls}-body > ${token.iconCls}`]:
      {
        color: token.colorError,
      },

    [`${confirmComponentCls}-warning ${confirmComponentCls}-body > ${token.iconCls},
        ${confirmComponentCls}-confirm ${confirmComponentCls}-body > ${token.iconCls}`]:
      {
        color: token.colorWarning,
      },

    [`${confirmComponentCls}-info ${confirmComponentCls}-body > ${token.iconCls}`]:
      {
        color: token.colorInfo,
      },

    [`${confirmComponentCls}-success ${confirmComponentCls}-body > ${token.iconCls}`]:
      {
        color: token.colorSuccess,
      },
  };
};

// ============================== Export ==============================
export default genSubStyleComponent(
  ['Modal', 'confirm'],
  (token) => {
    const modalToken = prepareToken(token);

    return genModalConfirmStyle(modalToken);
  },
  prepareComponentToken,
  {
    // confirm is weak than modal since no conflict here
    order: -1000,
  },
);

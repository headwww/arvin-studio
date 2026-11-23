import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

export function genCustomStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    borderRadius,
    borderRadiusSM,
    boxShadowSecondary,
    colorBgElevated,
    colorBorderSecondary,
    colorFillAlter,
    colorIcon,
    colorPrimary,
    colorSplit,
    colorText,
    colorTextDisabled,
    colorTextHeading,
    controlItemBgHover,
    fontSize,
    fontSizeSM,
    motionDurationMid,
    zIndexPopupBase,
  } = token;

  const wrapperCls = `${componentCls}-custom-wrapper`;
  const bodyCls = `${componentCls}-custom--body`;
  const listCls = `${componentCls}-custom--panel-list`;
  const optionCls = `${componentCls}-custom--option`;
  const footerCls = `${componentCls}-custom--footer`;
  const popupTableCls = `${componentCls}-custom-popup-table`;

  return {
    [wrapperCls]: {
      position: 'absolute',
      zIndex: zIndexPopupBase,
      display: 'none',
      flexDirection: 'column',
      minWidth: 200,
      maxWidth: 420,
      color: colorText,
      fontSize,
      textAlign: 'left',
      backgroundColor: colorBgElevated,
      border: `1px solid ${colorBorderSecondary}`,
      borderRadius,
      boxShadow: boxShadowSecondary,
      overflow: 'hidden',
      '&.placement--top-left': {
        top: 2,
        left: 2,
      },
      '&.placement--top-right': {
        top: 2,
        right: 2,
      },
      '&.placement--bottom-left': {
        bottom: 2,
        left: 2,
      },
      '&.placement--bottom-right': {
        bottom: 2,
        right: 2,
      },
      '&.placement--left': {
        top: 2,
        left: 2,
        height: 'calc(100% - 4px)',
      },
      '&.placement--right': {
        top: 2,
        right: 2,
        height: 'calc(100% - 4px)',
      },
      '&.is--active': {
        display: 'flex',
      },
    },
    [`${componentCls}-custom-simple--body-wrapper`]: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'hidden',
      maxHeight: 'inherit',
    },
    [`${componentCls}-custom--header`]: {
      display: 'flex',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      height: 34,
      padding: '0 12px',
      fontWeight: 600,
      borderBottom: `1px solid ${colorSplit}`,
      userSelect: 'none',
    },
    [`${componentCls}-custom--title`]: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    [`${componentCls}-custom--header-actions`]: {
      display: 'flex',
      flexShrink: 0,
      alignItems: 'center',
      gap: 8,
    },
    [`${componentCls}-custom--actions`]: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    [`${componentCls}-custom--actions-divider`]: {
      width: 1,
      height: 14,
      backgroundColor: colorSplit,
      flexShrink: 0,
    },
    [`${componentCls}-custom--popup-actions`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%',
    },
    [`${componentCls}-custom--checkbox-option`]: {
      display: 'flex',
      flexShrink: 0,
      alignItems: 'center',
      paddingRight: 6,
      cursor: 'pointer',
      userSelect: 'none',
      '&.is--disabled': {
        color: colorTextDisabled,
        cursor: 'not-allowed',
      },
    },
    [`${componentCls}-custom--checkbox-label`]: {
      paddingLeft: 6,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    [bodyCls]: {
      position: 'relative',
      flexGrow: 1,
      overflowX: 'hidden',
      overflowY: 'auto',
      maxHeight: 'inherit',
    },
    [listCls]: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    [optionCls]: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '5px 12px',
      borderRadius: borderRadiusSM,
      '&.level--2': {
        paddingLeft: 24,
      },
      '&.level--3': {
        paddingLeft: 36,
      },
      '&.level--4': {
        paddingLeft: 48,
      },
      '&.level--5': {
        paddingLeft: 60,
      },
      transition: `background-color ${motionDurationMid}`,
      '&:hover': {
        backgroundColor: controlItemBgHover,
      },
      '&.is--hidden': {
        [`& .${componentCls}-custom--label`]: {
          color: colorTextDisabled,
        },
      },
      '&.is--drag-top::before, &.is--drag-bottom::before': {
        position: 'absolute',
        right: 0,
        left: 0,
        height: 2,
        backgroundColor: colorPrimary,
        content: '""',
      },
      '&.is--drag-top::before': {
        top: -1,
      },
      '&.is--drag-bottom::before': {
        bottom: -1,
      },
    },
    [`${componentCls}-custom-popup--row`]: {
      '&.is--drag-top': {
        boxShadow: `inset 0 2px 0 0 ${colorPrimary}`,
      },
      '&.is--drag-bottom': {
        boxShadow: `inset 0 -2px 0 0 ${colorPrimary}`,
      },
    },
    [`${componentCls}-custom--sort-btn`]: {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      paddingLeft: 2,
      paddingRight: 6,
      color: colorIcon,
      cursor: 'grab',
      userSelect: 'none',
      '&:hover': {
        color: colorPrimary,
      },
      '&:active': {
        cursor: 'grabbing',
      },
    },
    [`${componentCls}-custom--name-option`]: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },
    [`${componentCls}-custom--label`]: {
      flexGrow: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    [`${componentCls}-custom--move-option, ${componentCls}-custom--fixed-option`]:
      {
        display: 'flex',
        flexShrink: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginLeft: 4,
        '& .is--active': {
          color: colorPrimary,
        },
      },
    [footerCls]: {
      flexShrink: 0,
      borderTop: `1px solid ${colorSplit}`,
    },
    [`${componentCls}-custom--footer-buttons`]: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      '& > button': {
        flex: 1,
        borderRadius: 0,
      },
      '& > button:first-child': {
        borderBottomLeftRadius: borderRadius,
      },
      '& > button:last-child': {
        borderBottomRightRadius: borderRadius,
      },
    },
    [`${componentCls}-custom--drag-tip`]: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 100,
      maxWidth: '60%',
      minWidth: 100,
      padding: '6px 12px',
      overflow: 'hidden',
      fontSize: fontSizeSM,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      userSelect: 'none',
      backgroundColor: colorBgElevated,
      borderRadius,
      boxShadow: boxShadowSecondary,
    },
    [`${componentCls}-custom--popup-content`]: {
      padding: 0,
      overflowX: 'auto',
    },
    [`${componentCls}-custom--drawer-body`]: {
      padding: 0,
    },
    [popupTableCls]: {
      width: '100%',
      minWidth: 730,
      fontSize: fontSizeSM,
      borderCollapse: 'collapse',
      'th, td': {
        height: 38,
        padding: '0 10px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        borderBottom: `1px solid ${colorSplit}`,
      },
      th: {
        fontWeight: 500,
        color: colorTextHeading,
        backgroundColor: colorFillAlter,
      },
      'tbody tr:hover': {
        backgroundColor: controlItemBgHover,
      },
    },
  };
}

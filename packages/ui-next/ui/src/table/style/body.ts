import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { GenerateStyle } from '../../theme/interface';
import type { TableToken } from './interface';

import { Keyframes, mergeToken, unit } from '@arvin-studio/cssinjs';

export const moveCopyCellBorder = new Keyframes('moveCopyCellBorder', {
  '0%': {},
  '100%': {
    backgroundPosition: '0 -12px, 100% 12px, 12px 0, -12px 100%',
  },
});

function genCellPadding(token: TableToken, prefixCls = ''): CSSInterpolation {
  const { componentCls, padding } = token;
  return [
    {
      [`${componentCls}-header--column,
        ${componentCls}-body--column,
        ${componentCls}-footer--column`]: {
        [`&.is--pg-top${prefixCls}`]: {
          [`${componentCls}-cell`]: {
            paddingTop: padding,
          },
        },
        [`&.is--pg-bottom${prefixCls}`]: {
          [`${componentCls}-cell`]: {
            paddingBottom: padding,
          },
        },
        [`&.is--pg-left${prefixCls}`]: {
          [`${componentCls}-cell`]: {
            paddingLeft: padding,
          },
        },
        [`&.is--pg-right${prefixCls}`]: {
          [`${componentCls}-cell`]: {
            paddingRight: padding,
          },
        },
      },
    },
  ];
}

export const genMediumCellPaddingStyle: GenerateStyle<TableToken> = (token) => {
  const tableToken = mergeToken<TableToken>(token, {
    padding: token.currentCellPadding,
  });
  return genCellPadding(tableToken, '.size--medium');
};

export const genSmallCellPaddingStyle: GenerateStyle<TableToken> = (token) => {
  const tableToken = mergeToken<TableToken>(token, {
    padding: token.currentCellPaddingSM,
  });
  return genCellPadding(tableToken, '.size--small');
};

export const genLargeCellPaddingStyle: GenerateStyle<TableToken> = (token) => {
  const tableToken = mergeToken<TableToken>(token, {
    padding: token.currentCellPaddingLG,
  });
  return genCellPadding(tableToken, '.size--large');
};

export function genBodyStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    resizableLineColor,
    colorBgContainer,
    checkboxRangeBorderWidth,
    checkboxRangeBackgroundColor,
    checkboxRangeBorderColor,
    cellAreaBorderWidth,
    headerFontWeight,
    cellAreaBorderColor,
    cellMainAreaExtensionBorderColor,
    cellMainAreaExtensionBackgroundColor,
    cellExtendAreaBorderWidth,
    cellExtendAreaBorderColor,
    cellAreaStatusBackgroundColor,
    cellAreaBackgroundColor,
    cellClipAreaBorderColor,
    cellActiveAreaBorderWidth,
    cellActiveAreaBackgroundColor,
    cellActiveAreaBorderColor,
    cellClipAreaBorderWidth,
    rowHeight,
    rowHeightLG,
    rowHeightSM,
    cellPadding,
    cellPaddingLG,
    cellPaddingSM,
    placeholderColor,
    stripedBackgroundColor,
    rowRadioCheckedBackgroundColor,
    rowCheckboxCheckedBackgroundColor,
    rowCurrentBackgroundColor,
    rowHoverBackgroundColor,
    columnCurrentBackgroundColor,
    columnHoverBackgroundColor,
    columnHoverCurrentBackgroundColor,
    rowHoverStripedBackgroundColor,
    rowHoverRadioCheckedBackgroundColor,
    rowHoverCheckboxCheckedBackgroundColor,
    rowHoverCurrentBackgroundColor,
    disabledColor,
    cellValidateErrorColor,
    cellValidateErrorCellBackgroundColor,
    cellValidateErrorThemeNormalBackgroundColor,
    cellDirtyInsertColor,
    cellDirtyWidth,
    expandPaddingDefault,
    borderWidth,
    borderColor,
    currentRowLineHeight,
    primaryColor,
    borderRadius,
    calc,
    contentFontSize,
    cellDirtyUpdateColor,
    treeNodeLineColor,
    treeNodeLineStyle,
    headerFontColor,
    headerBackgroundColor,
    layoutBackgroundColor,
    colorTextSecondary,
    colorText,
    footerBackgroundColor,
    footerFontColor,
    colorSuccess,
    colorInfo,
    colorWarning,
    colorError,
    headerIconColor,
    dragOverBackgroundColor,
  } = token;
  return {
    [`${componentCls}--layout-wrapper`]: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: colorBgContainer,
    },
    [`${componentCls}--viewport-wrapper`]: {
      position: 'relative',
      overflow: 'hidden',
      flexGrow: 1,

      '&.x-ob--contain': {
        [`& > ${componentCls}--main-wrapper`]: {
          [`& > ${componentCls}--header-wrapper`]: {
            [`& > ${componentCls}--header-inner-wrapper`]: {
              overscrollBehaviorX: 'contain',
            },
          },
          [`& > ${componentCls}--body-wrapper`]: {
            [`& > ${componentCls}--body-inner-wrapper`]: {
              overscrollBehaviorX: 'contain',
            },
          },
          [`& > ${componentCls}--footer-wrapper`]: {
            [`& > ${componentCls}--footer-inner-wrapper`]: {
              overscrollBehaviorX: 'contain',
            },
          },
        },
      },
      '&.y-ob--contain': {
        [`& > ${componentCls}--main-wrapper`]: {
          [`& > ${componentCls}--body-wrapper`]: {
            [`& > ${componentCls}--body-inner-wrapper`]: {
              overscrollBehaviorY: 'contain',
            },
          },
        },
      },
    },

    [`${componentCls}--header-wrapper,
      ${componentCls}--body-wrapper,
      ${componentCls}--footer-wrapper,
      ${componentCls}--fixed-left-body-wrapper,
      ${componentCls}--fixed-right-body-wrapper`]: {
      overflow: 'hidden',
      outline: 0,
      scrollbarWidth: 'none',
      '-webkit-overflow-scrolling': 'touch',
    },

    [`${componentCls}--header-inner-wrapper,
      ${componentCls}--body-inner-wrapper,
      ${componentCls}--footer-inner-wrapper`]: {
      position: 'relative',
      width: '100%',
      height: '100%',
      scrollbarWidth: 'none',
      '-ms-overflow-style': 'none',
      '-webkit-overflow-scrolling': 'touch',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    [`${componentCls}--header-inner-wrapper,
      ${componentCls}--footer-inner-wrapper`]: {
      'overflow-y': 'hidden',
      'overflow-x': 'scroll',
    },
    [`${componentCls}--body-inner-wrapper`]: {
      'overflow-y': 'scroll',
      'overflow-x': 'scroll',
    },

    // 禁用滚动条
    [`${componentCls}--main-wrapper`]: {
      '&.sx--hidden': {
        [`& > ${componentCls}--header-wrapper`]: {
          [`& > ${componentCls}--header-inner-wrapper`]: {
            overflowX: 'hidden',
          },
        },
        [`& > ${componentCls}--body-wrapper`]: {
          [`& > ${componentCls}--body-inner-wrapper`]: {
            overflowX: 'hidden',
          },
        },
        [`& > ${componentCls}--footer-wrapper`]: {
          [`& > ${componentCls}--footer-inner-wrapper`]: {
            overflowX: 'hidden',
          },
        },
      },
      '&.sy--hidden': {
        [`& > ${componentCls}--body-wrapper`]: {
          [`& > ${componentCls}--body-inner-wrapper`]: {
            overflowY: 'hidden',
          },
        },
      },
    },

    [`${componentCls}-body--column`]: {
      '&.col--vertical-top': {
        '&.col--active': {
          [`& > ${componentCls}-cell`]: {
            [`& > ${componentCls}-cell--wrapper`]: {
              height: '100%',
            },
          },
        },
      },

      [`& ${componentCls}-cell--row-resizable`]: {
        position: 'absolute',
        left: 0,
        bottom: '-0.4em',
        height: '0.8em',
        width: '100%',
        textAlign: 'center',
        zIndex: 1,
        cursor: 'row-resize',
      },
    },

    [`${componentCls}`]: {
      // 列宽计算中：按内容撑开、不换行
      '&[data-calc-col]': {
        [`& ${componentCls}-header--column,
        & ${componentCls}-body--column,
        & ${componentCls}-footer--column`]: {
          [`& ${componentCls}-cell`]: {
            [`& > ${componentCls}-cell--wrapper`]: {
              wordBreak: 'break-all',
              whiteSpace: 'nowrap',
            },
          },
        },
      },

      // 非列宽计算中
      '&:not([data-calc-col])': {
        [`${componentCls}-cell--wrapper`]: {
          minWidth: '100%',
        },
      },

      // 非行高计算中
      '&:not([data-calc-row])': {
        [`${componentCls}-body--column`]: {
          '&.col--vertical-top': {
            '&:not(.col--active)': {
              [`& > ${componentCls}-cell`]: {
                [`& > ${componentCls}-cell--wrapper`]: {
                  minHeight: '100%',
                },
              },
            },
          },
        },
      },

      /* header*/
      [`${componentCls}--header-wrapper`]: {
        color: headerFontColor,
      },
      /* 排序*/
      [`${componentCls}-cell--sort`]: {
        textAlign: 'center',
        position: 'relative',
        padding: '0 0.1em 0 0.2em',
      },

      [`${componentCls}-cell--sort-vertical-layout`]: {
        display: 'inline-flex',
        flexDirection: 'column',
        height: '2.4em',
        verticalAlign: 'middle',

        [`${componentCls}-sort--asc-btn,
          ${componentCls}-sort--desc-btn`]: {
          height: '0.6em',
        },
      },

      [`${componentCls}-cell--sort-horizontal-layout`]: {
        display: 'inline-flex',
        flexDirection: 'row',

        [`${componentCls}-sort--asc-btn,
          ${componentCls}-sort--desc-btn`]: {
          width: '0.5em',
        },
      },

      [`${componentCls}-sort--asc-btn,
        ${componentCls}-sort--desc-btn`]: {
        color: headerIconColor,
        cursor: 'pointer',

        [`&:hover`]: {
          color: colorText,
        },

        [`&.sort--active`]: {
          color: primaryColor,
        },
      },
    },

    [`${componentCls}-sort--asc-btn,
      ${componentCls}-sort--desc-btn,
      ${componentCls}-filter--btn`]: {
      [`&:before, &:after`]: {
        transition: 'border 0.1s ease-in-out',
      },
    },

    [`${componentCls}-header--column`]: {
      position: 'relative',
      fontWeight: headerFontWeight,

      [`&.col--ellipsis`]: {
        [`& > ${componentCls}-cell`]: {
          [`${componentCls}-cell--wrapper`]: {
            display: 'flex',
            alignItems: 'center',

            [`${componentCls}-cell--drag-handle,
              ${componentCls}-cell--sort,
              ${componentCls}-cell--filter,
              ${componentCls}-cell--edit-icon,
              ${componentCls}-cell-title-prefix-icon,
              ${componentCls}-cell-title-suffix-icon,
              ${componentCls}-cell--checkbox,
              ${componentCls}-cell--required-icon`]: {
              flexShrink: 0,
            },
          },

          [`${componentCls}-cell--title`]: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
      },

      [`${componentCls}-cell--required-icon`]: {
        display: 'inline-block',
        color: cellValidateErrorColor,
        width: '0.8em',
        height: '1em',
        lineHeight: '1em',
        position: 'relative',
        paddingRight: '0.1em',

        [`& > i`]: {
          fontFamily: 'Verdana, Arial, Tahoma',
          fontWeight: 'normal',

          [`&:before`]: {
            content: '"*"',
            position: 'absolute',
            left: 0,
            top: '0.2em',
          },
        },
      },

      [`${componentCls}-cell--edit-icon,
        ${componentCls}-cell-title-prefix-icon,
        ${componentCls}-cell-title-suffix-icon,
         ${componentCls}-cell--filter`]: {
        padding: '0.2em',
        color: headerIconColor,
      },

      [`${componentCls}-cell-title-prefix-icon,
        ${componentCls}-cell-title-suffix-icon`]: {
        [`&.theme--primary`]: { color: primaryColor },
        [`&.theme--success`]: { color: colorSuccess },
        [`&.theme--info`]: { color: colorInfo },
        [`&.theme--warning`]: { color: colorWarning },
        [`&.theme--danger`]: { color: colorError },
        [`&.theme--error`]: { color: colorError },
      },

      [`&:last-child`]: {
        [`& > ${componentCls}-cell--col-resizable`]: {
          right: 0,
        },
      },
    },

    [`${componentCls}-cell--col-resizable`]: {
      position: 'absolute',
      right: '-0.3em',
      bottom: 0,
      width: '0.6em',
      height: '100%',
      textAlign: 'center',
      zIndex: 1,
      cursor: 'col-resize',

      [`&.is--line`]: {
        [`&:before,
          &:after`]: {
          content: '""',
          display: 'inline-block',
          verticalAlign: 'middle',
        },

        [`&:before`]: {
          width: 1,
          height: '50%',
          backgroundColor: resizableLineColor,
        },

        [`&:after`]: {
          width: 0,
          height: '100%',
        },
      },
    },

    /* 拖拽线 */
    [`${componentCls}--resizable-row-bar,
      ${componentCls}--resizable-col-bar`]: {
      display: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 13,
      pointerEvents: 'none',
      userSelect: 'none',

      [`&:before`]: {
        content: '""',
        display: 'block',
      },

      [`${componentCls}--resizable-number-tip`]: {
        position: 'absolute',
        padding: '0.25em 0.25em',
        fontSize: 12,
        borderRadius,
        whiteSpace: 'nowrap',
        color: '#ffffff',
        backgroundColor: primaryColor,
        userSelect: 'none',
        pointerEvents: 'none',
      },
    },

    /* 列宽线 */
    [`${componentCls}--resizable-col-bar`]: {
      width: '1px',
      height: '100%',
      cursor: 'col-resize',

      [`&:before`]: {
        width: 0,
        height: '100%',
        borderLeft: `1px dotted ${primaryColor}`,
      },

      [`${componentCls}--resizable-number-tip`]: {
        left: 0,
        top: '1em',
      },
    },

    /* 行高线 */
    [`${componentCls}--resizable-row-bar`]: {
      height: 1,
      width: '100%',
      cursor: 'row-resize',

      [`&:before`]: {
        height: 0,
        width: '100%',
        borderTop: `1px dotted ${primaryColor}`,
      },

      [`${componentCls}--resizable-number-tip`]: {
        top: 0,
        left: 0,
      },
    },

    /* 拖拽行与列 */
    [`${componentCls}--drag-col-line,
    ${componentCls}--drag-row-line`]: {
      display: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 11,
      pointerEvents: 'none',
    },

    [`${componentCls}--drag-row-line`]: {
      width: '100%',
      height: 1,
      border: '2px solid transparent',

      [`&[drag-pos="top"]`]: {
        borderTopColor: primaryColor,
      },
      [`&[drag-pos="bottom"]`]: {
        borderBottomColor: primaryColor,
      },
      [`&[drag-to-child="y"]`]: {
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: colorSuccess,
      },
      [`&.is--guides`]: {
        backgroundColor: dragOverBackgroundColor,
      },
    },

    [`${componentCls}--drag-col-line`]: {
      height: '100%',
      width: 1,
      border: '2px solid transparent',

      [`&[drag-pos="left"]`]: {
        borderLeftColor: primaryColor,
      },
      [`&[drag-pos="right"]`]: {
        borderRightColor: primaryColor,
      },
      [`&[drag-to-child="y"]`]: {
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colorSuccess,
      },
      [`&.is--guides`]: {
        backgroundColor: dragOverBackgroundColor,
      },
    },

    [`${componentCls}-body--row-list-move`]: {
      transitionProperty: 'transform',
      transitionDuration: '0.35s',
    },

    /* 拖拽排序提示框 */
    [`${componentCls}--drag-sort-tip`]: {
      display: 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      padding: '0.6em 1.4em',
      maxWidth: '50%',
      minWidth: '100px',
      borderRadius,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      pointerEvents: 'none',
      backgroundColor: layoutBackgroundColor,
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)',
      zIndex: 33,

      [`&[drag-status="normal"]`]: {
        [`${componentCls}--drag-sort-tip-normal-status`]: {
          display: 'block',
        },
      },
      [`&[drag-status="sub"]`]: {
        [`${componentCls}--drag-sort-tip-sub-status`]: {
          display: 'block',
        },
      },
      [`&[drag-status="disabled"]`]: {
        [`${componentCls}--drag-sort-tip-disabled-status`]: {
          display: 'block',
        },
      },
    },

    [`${componentCls}--drag-sort-tip-wrapper`]: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },

    [`${componentCls}--drag-sort-tip-status`]: {
      paddingRight: '0.4em',
    },

    [`${componentCls}--drag-sort-tip-disabled-status`]: {
      display: 'none',
      flexShrink: 0,
      color: colorError,
    },

    [`${componentCls}--drag-sort-tip-normal-status,
    ${componentCls}--drag-sort-tip-sub-status`]: {
      display: 'none',
    },

    [`${componentCls}--drag-sort-tip-content`]: {
      flexGrow: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    [`${componentCls}--checkbox-range,
    ${componentCls}--cell-main-area,
    ${componentCls}--cell-item-area,
    ${componentCls}--cell-extend-area,
    ${componentCls}--cell-active-area,
    ${componentCls}--cell-copy-area,
    ${componentCls}--cell-col-status-area,
    ${componentCls}--cell-row-status-area
  `]: {
      display: 'none',
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1,
    },

    [`${componentCls}--header-wrapper`]: {
      [`${componentCls}--cell-col-status-area`]: {
        top: 0,
        height: '100%',
      },
    },

    [`${componentCls}--fixed-left-wrapper,
          ${componentCls}--fixed-right-wrapper`]: {
      [`${componentCls}--checkbox-range,
            ${componentCls}--cell-main-area,
            ${componentCls}--cell-item-area,
            ${componentCls}--cell-extend-area,
            ${componentCls}--cell-active-area,
            ${componentCls}--cell-copy-area,
            ${componentCls}--cell-col-status-area,
            ${componentCls}--cell-row-status-area
            `]: {
        zIndex: 2,
      },
    },

    /* 复选框-范围选择*/
    [`${componentCls}--checkbox-range`]: {
      backgroundColor: checkboxRangeBackgroundColor,
      border: `${checkboxRangeBorderColor} solid ${checkboxRangeBorderWidth}`,
    },

    [`${componentCls}--cell-area`]: {
      height: 0,
      fontSize: 0,
      display: 'none',

      [`&>${componentCls}--cell-main-area`]: {
        backgroundColor: cellAreaBackgroundColor,
        border: `${cellAreaBorderWidth} solid ${cellAreaBorderColor}`,
      },

      [`${componentCls}--cell-main-area-btn`]: {
        display: 'none',
        position: 'absolute',
        right: '-1px',
        bottom: '-1px',
        width: '7px',
        height: '7px',
        borderStyle: 'solid',
        borderColor: cellMainAreaExtensionBorderColor,
        borderWidth: '1px 0 0 1px',
        backgroundColor: cellMainAreaExtensionBackgroundColor,
        pointerEvents: 'auto',
        cursor: 'crosshair',
      },

      [`${componentCls}--cell-extend-area`]: {
        border: `${cellExtendAreaBorderWidth} solid ${cellExtendAreaBorderColor}`,
      },

      [`${componentCls}--cell-col-status-area,
          ${componentCls}--cell-row-status-area`]: {
        backgroundColor: cellAreaStatusBackgroundColor,
      },

      [`& > ${componentCls}--cell-col-status-area`]: {
        borderBottom: `${cellAreaBorderWidth} solid ${cellAreaBorderColor}`,
      },

      [`& > ${componentCls}--cell-row-status-area`]: {
        borderRight: `${cellAreaBorderWidth} solid ${cellAreaBorderColor}`,
      },
    },
    [`${componentCls}--cell-copy-area`]: {
      background: [
        `linear-gradient(0deg, transparent 6px, ${cellClipAreaBorderColor} 6px) repeat-y`,
        `linear-gradient(0deg, transparent 50%, ${cellClipAreaBorderColor} 0) repeat-y`,
        `linear-gradient(90deg, transparent 50%, ${cellClipAreaBorderColor} 0) repeat-x`,
        `linear-gradient(90deg, transparent 50%, ${cellClipAreaBorderColor} 0) repeat-x`,
      ].join(', '),

      backgroundSize: [
        `${cellClipAreaBorderWidth}px 12px`,
        `${cellClipAreaBorderWidth}px 12px`,
        `12px ${cellClipAreaBorderWidth}px`,
        `12px ${cellClipAreaBorderWidth}px`,
      ].join(', '),

      backgroundPosition: '0 0, 100% 0, 0 0, 0 100%',
      animationName: moveCopyCellBorder,
      animationDuration: '0.5s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear',
    },
    [`${componentCls}--cell-active-area`]: {
      borderColor: cellActiveAreaBorderColor,
      borderStyle: 'solid',
      borderWidth: cellActiveAreaBorderWidth,
      backgroundColor: cellActiveAreaBackgroundColor,
    },
    [`${componentCls}--cell-multi-area`]: {
      [`& > ${componentCls}--cell-item-area`]: {
        backgroundColor: cellAreaBackgroundColor,
      },
    },
    [`${componentCls}-body--row`]: {
      '&:last-child': {
        [`& ${componentCls}-body--column`]: {
          [`& ${componentCls}-cell--row-resizable`]: {
            height: '0.4em',
            bottom: 0,
          },
        },
      },
    },
    /** render-default */
    [`${componentCls}--render-default`]: {
      [`${componentCls}--footer-wrapper`]: {
        marginTop: calc(borderWidth).mul(-1).equal(),
        backgroundColor: footerBackgroundColor,
      },
      [`${componentCls}--body-wrapper`]: {
        backgroundColor: colorBgContainer,
      },

      [`${componentCls}--header,
        ${componentCls}--body,
        ${componentCls}--footer`]: {
        border: 0,
        borderSpacing: 0,
        borderCollapse: 'separate',
        tableLayout: 'fixed',
      },
      '&:not(.is--empty)': {
        '&.is--footer': {
          '&.is--scroll-x': {
            [`${componentCls}--body-wrapper`]: {
              outline: 0,
            },
          },
        },
      },
      [`&.col-drag--resize`]: {
        [`${componentCls}--main-wrapper,
          ${componentCls}--fixed-left-wrapper,
          ${componentCls}--fixed-right-wrapper`]: {
          '*': {
            cursor: 'col-resize',
          },
        },
      },
      [`&.row-drag--resize`]: {
        [`${componentCls}--main-wrapper,
          ${componentCls}--fixed-left-wrapper,
          ${componentCls}--fixed-right-wrapper`]: {
          '*': {
            cursor: 'row-resize',
          },
        },
      },

      '&.header-cell--area': {
        [`${componentCls}--header-wrapper`]: {
          userSelect: 'none',
        },
      },

      '&.body-cell--area': {
        [`${componentCls}--body-wrapper`]: {
          userSelect: 'none',
        },
      },

      [`&.drag--range`]: {
        [`${componentCls}-body--column`]: {
          userSelect: 'none',
        },
      },

      [`&.checkbox--range`]: {
        [`${componentCls}-body--column`]: {
          [`&.col--checkbox`]: {
            userSelect: 'none',
          },
        },
      },

      [`${componentCls}-header--column,
        ${componentCls}-body--column,
        ${componentCls}-footer--column`]: {
        position: 'relative',
        lineHeight: unit(currentRowLineHeight),
        textAlign: 'left',

        '&.col--center': {
          textAlign: 'center',
          [`& > ${componentCls}-cell`]: {
            justifyContent: 'center',
          },
        },

        '&.col--right': {
          textAlign: 'right',
          [`& > ${componentCls}-cell`]: {
            justifyContent: 'right',
          },
        },
        '&.col--current': {
          backgroundColor: columnCurrentBackgroundColor,
        },

        /* 溢出列*/
        [`&:not(.col--active)`]: {
          [`&.col--ellipsis`]: {
            [`& > ${componentCls}-cell`]: {
              overflow: 'hidden',

              [`& > ${componentCls}-cell--wrapper`]: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            },
          },

          [`&.${componentCls}-row-group-cell,
            &.${componentCls}-tree-cell,
            &.col--vertical-top`]: {
            [`& > ${componentCls}-cell`]: {
              [`& > ${componentCls}-cell--wrapper`]: {
                whiteSpace: 'pre-line',
              },
            },
          },
        },
      },
      [`${componentCls}-header--column`]: {
        [`&.col--ellipsis`]: {
          [`&.col--center`]: {
            [`${componentCls}-cell--wrapper`]: {
              justifyContent: 'center',
            },
          },

          [`&.col--right`]: {
            [`${componentCls}-cell--wrapper`]: {
              justifyContent: 'right',
            },
          },
        },
      },

      [`${componentCls}-header--column,
         ${componentCls}-footer--column`]: {
        [`&.col--ellipsis`]: {
          [`&.col--center`]: {
            [`${componentCls}-cell`]: {
              justifyContent: 'center',
            },
          },

          [`&.col--right`]: {
            [`${componentCls}-cell`]: {
              justifyContent: 'flex-end',
            },
          },

          [`& > ${componentCls}-cell`]: {
            [`${componentCls}-cell--wrapper`]: {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          },
        },

        [`& > ${componentCls}-cell`]: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
      },
      // 列高亮
      [`&.column--highlight`]: {
        [`${componentCls}-header--column`]: {
          [`&:hover`]: {
            backgroundColor: columnHoverBackgroundColor,

            [`&.col--current`]: {
              backgroundColor: columnHoverCurrentBackgroundColor,
            },
          },
        },
      },

      [`${componentCls}-body--row`]: {
        /** 斑马线 */
        '&.row--stripe': {
          [`&>${componentCls}-body--column `]: {
            backgroundColor: stripedBackgroundColor,
          },
        },

        '&.row--radio': {
          [`&>${componentCls}-body--column`]: {
            backgroundColor: rowRadioCheckedBackgroundColor,
          },
        },
        '&.row--checked': {
          [`&>${componentCls}-body--column`]: {
            backgroundColor: rowCheckboxCheckedBackgroundColor,
          },
        },
        '&.row--current': {
          [`&>${componentCls}-body--column`]: {
            backgroundColor: rowCurrentBackgroundColor,
          },
        },
        '&.row--hover': {
          [`&>${componentCls}-body--column`]: {
            backgroundColor: rowHoverBackgroundColor,
            '&.col--current': {
              backgroundColor: columnCurrentBackgroundColor,
            },
          },
          '&.row--stripe': {
            [`& > ${componentCls}-body--column `]: {
              backgroundColor: rowHoverStripedBackgroundColor,
            },
          },
          '&.row--radio': {
            [`& > ${componentCls}-body--column`]: {
              backgroundColor: rowHoverRadioCheckedBackgroundColor,
            },
          },
          '&.row--checked': {
            [`& > ${componentCls}-body--column`]: {
              backgroundColor: rowHoverCheckboxCheckedBackgroundColor,
            },
          },
          '&.row--current': {
            [`& > ${componentCls}-body--column`]: {
              backgroundColor: rowHoverCurrentBackgroundColor,
            },
          },
        },
        /** 单元格标记删除状态 */
        '&.row--pending': {
          color: disabledColor,
          opacity: 0.5,
          textDecoration: 'line-through',
          cursor: 'no-drop',
          [`${componentCls}-body--column`]: {
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: 0,
              borderBottom: `1px solid ${cellValidateErrorColor}`,
              zIndex: 1,
            },
          },
        },
        /* 单元格编辑状态*/
        '&.row--new': {
          [`& > ${componentCls}-body--column `]: {
            position: 'relative',
            '&:before': {
              content: '""',
              top: calc(cellDirtyWidth).mul(-1).equal(),
              left: calc(cellDirtyWidth).mul(-1).equal(),
              position: 'absolute' as const,
              borderWidth: cellDirtyWidth,
              borderStyle: 'solid',
              borderColor: `transparent ${cellDirtyInsertColor} transparent transparent`,
              transform: 'rotate(45deg)',
            },
          },
        },

        [`&.row--drag-move`]: {
          transition: 'transform 0.5s ease',
        },

        [`&.row--drag-origin`]: {
          [`& > ${componentCls}-body--column`]: {
            [`& > ${componentCls}-cell`]: {
              opacity: 0.3,
            },
          },
        },
      },

      /* 边框*/
      [`&.border--default, &.border--none, &.border--outer, &.border--inner`]: {
        [`${componentCls}-cell--col-resizable`]: {
          [`&:before, &:after`]: {
            content: '""',
            display: 'inline-block',
            verticalAlign: 'middle',
          },

          [`&:before`]: {
            width: 1,
            height: '50%',
            backgroundColor: resizableLineColor,
          },

          [`&:after`]: {
            width: 0,
            height: '100%',
          },
        },
      },

      [`&.border--default, &.border--full, &.border--outer`]: {
        [`${componentCls}--header-wrapper`]: {
          backgroundColor: headerBackgroundColor,
        },
      },

      [`&.border--default, &.border--inner`]: {
        [`${componentCls}-header--column,
            ${componentCls}-body--column,
            ${componentCls}-footer--column`]: {
          backgroundImage: `linear-gradient(${borderColor}, ${borderColor})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `100% ${borderWidth}`,
          backgroundPosition: 'right bottom',
        },
      },

      [`&.border--default, &.border--full, &.border--inner`]: {
        [`${componentCls}--footer-wrapper`]: {
          borderTop: `${borderWidth} solid ${borderColor}`,
        },
      },

      '&.border--full': {
        [`${componentCls}-header--column,
            ${componentCls}-body--column,
            ${componentCls}-footer--column`]: {
          backgroundImage: `linear-gradient(${borderColor}, ${borderColor}), linear-gradient(${borderColor}, ${borderColor})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${borderWidth} 100%, 100% ${borderWidth}`,
          backgroundPosition: 'right top, right bottom;',
        },

        [`${componentCls}--fixed-left-wrapper`]: {
          [`${componentCls}-body--column`]: {
            borderRightColor: borderColor,
          },
        },
      },

      [`&.border--inner, &.border--none`]: {
        [`${componentCls}--header-wrapper`]: {
          backgroundColor: headerBackgroundColor,
        },
        [`${componentCls}--fixed-left-wrapper`]: {
          borderRight: 0,
        },
      },

      '.fixed--hidden': {
        visibility: 'hidden',
      },
      [`&${componentCls}-medium`]: {
        [`${componentCls}--empty-placeholder,
          ${componentCls}--empty-block`]: {
          minHeight: rowHeight,
        },
        [`${componentCls}-cell--valid-error-tip`]: {
          padding: `0 ${cellPadding}`,
        },
      },
      [`&${componentCls}-small`]: {
        [`${componentCls}--empty-placeholder,
          ${componentCls}--empty-block`]: {
          minHeight: rowHeightSM,
        },
        [`${componentCls}-cell--valid-error-tip`]: {
          padding: `0 ${cellPaddingSM}`,
        },
      },
      [`&${componentCls}-large`]: {
        [`${componentCls}--empty-placeholder,
          ${componentCls}--empty-block`]: {
          minHeight: rowHeightLG,
        },
        [`${componentCls}-cell--valid-error-tip`]: {
          padding: `0 ${cellPaddingLG}`,
        },
      },

      [`${componentCls}-cell`]: {
        whiteSpace: 'pre-line',
        wordBreak: 'break-all',
      },

      // 单元格占位符
      [`${componentCls}-cell--placeholder`]: {
        color: placeholderColor,
      },

      // 单选框和复选框
      [`${componentCls}-cell--radio`]: {
        cursor: 'pointer',

        [`&.is--readonly`]: {
          cursor: 'auto',
        },

        [`&.is--disabled`]: {
          color: disabledColor,
          cursor: 'not-allowed',
        },
      },
      [`${componentCls}-cell--checkbox`]: {
        cursor: 'pointer',

        [`&.is--checked, &.is--indeterminate`]: {
          color: primaryColor,
        },

        [`&.is--hidden`]: {
          cursor: 'default',
        },

        [`&.is--readonly`]: {
          cursor: 'auto',
        },

        [`&.is--disabled`]: {
          color: disabledColor,
          cursor: 'not-allowed',
        },

        [`${componentCls}-checkbox--label`]: {
          paddingLeft: '0.4em',
        },
      },

      [`${componentCls}--header-wrapper,
        ${componentCls}--body-wrapper,
        ${componentCls}--footer-wrapper`]: {
        position: 'relative',
        width: '100%',
        [`&.fixed-left--wrapper,
          &.fixed-right--wrapper`]: {
          position: 'absolute',
          top: 0,
          outline: 0,
        },
        '&.fixed-left--wrapper': {
          left: 0,
        },
        '&.fixed-right--wrapper': {
          right: 0,
        },
      },
      [`${componentCls}-body--x-space`]: {
        width: '100%',
        height: '1px',
        marginBottom: '-1px',
      },
      [`${componentCls}-body--y-space`]: {
        width: 0,
        float: 'left',
      },

      /* 树形节点*/
      [`${componentCls}-tree--line-wrapper`]: {
        position: 'relative',
        display: 'block',
        height: 0,
      },

      [`${componentCls}-tree--line`]: {
        content: '""',
        position: 'absolute',
        bottom: '-1.5em',
        width: '0.8em',
        borderWidth: '0 0 1px 1px',
        borderStyle: treeNodeLineStyle,
        borderColor: treeNodeLineColor,
        pointerEvents: 'none',
      },
      [`${componentCls}-row-group--tree-node,
      ${componentCls}-cell--tree-node`]: {
        position: 'relative',
      },

      [`${componentCls}-cell--tree-btn`]: {
        [`&:hover`]: {
          color: colorText,
        },

        [`& > span`]: {
          display: 'block',
          color: colorTextSecondary,
          transition: 'transform 0.1s ease-in-out',
        },
      },

      [`${componentCls}-row-group-cell,
        ${componentCls}-tree-cell`]: {
        display: 'block',
        paddingLeft: '1.5em',
      },

      [`${componentCls}-cell--tree-btn,
        ${componentCls}-row-group--node-btn`]: {
        position: 'absolute',
        top: '50%',
        textAlign: 'center',
        transform: 'translateY(-50%)',
        zIndex: 1,
        userSelect: 'none',
        cursor: 'pointer',
      },
      /* 行分组 */
      [`${componentCls}-row-group--node-btn`]: {
        [`&:hover`]: {
          color: colorText,
        },

        [`& > i`]: {
          display: 'block',
          color: colorTextSecondary,
          transition: 'transform 0.1s ease-in-out',
        },
      },

      /* 单元格高度*/
      [`${componentCls}-body--column`]: {
        [`&.col--ellipsis`]: {
          [`& > ${componentCls}-cell`]: {
            [`${componentCls}-row-group-cell, ${componentCls}-tree-cell`]: {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          },
        },
        [`&.col--cs-height,
          &.col--rs-height,
          &.col--auto-height`]: {
          overflow: 'hidden',
          [`&.col--tree-node,
            &.col--valid-error`]: {
            overflow: 'unset',
          },
          [`& > ${componentCls}-cell`]: {
            overflow: 'hidden',
          },
        },
        [`&.col--max-height`]: {
          overflow: 'hidden',

          [`&.col--tree-node,
            &.col--valid-error`]: {
            overflow: 'unset',
          },
          [`& > ${componentCls}-cell`]: {
            overflow: 'auto',
          },
        },
        [`& > ${componentCls}-cell`]: {
          display: 'flex',
          flexDirection: 'row',
        },
        /* 展开行*/
        [`&.col--expand`]: {
          [`& > ${componentCls}-cell`]: {
            [`${componentCls}-cell--wrapper`]: {
              display: 'flex',
              flexDirection: 'row',
            },
          },
        },
        [`&.is--drag-cell`]: {
          userSelect: 'none',
          [`&:not(.is--drag-disabled)`]: {
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
            '&:hover': {
              color: primaryColor,
            },
          },
          [`&.is--drag-disabled`]: {
            color: disabledColor,
            cursor: 'not-allowed',
          },
        },
        [`&.col--selected`]: {
          boxShadow: `inset 0px 0px 0px 2px ${primaryColor}`,
        },

        /* 校验不通过*/
        [`${componentCls}-cell--valid-error-tip`]: {
          width: '100%',
          position: 'absolute',
          left: '50%',
          fontSize: contentFontSize,
          lineHeight: '1em',
          transform: 'translate(-50%, -2px)',
          textAlign: 'left',
          zIndex: 4,
          padding: `0 ${cellPadding}px`,
          pointerEvents: 'none',
        },

        [`${componentCls}-cell--valid-error-wrapper`]: {
          position: 'relative',
          display: 'inline-block',
          borderRadius,
          pointerEvents: 'auto',
        },

        [`${componentCls}-cell--valid-error-theme-beautify`]: {
          padding: '0.2em 0.6em',
          color: '#fff',
          backgroundColor: cellValidateErrorColor,

          [`${componentCls}-cell--valid-error-msg`]: {
            background: 'transparent',
          },
        },

        [`${componentCls}-cell--valid-error-theme-normal`]: {
          color: cellValidateErrorColor,
          backgroundColor: cellValidateErrorThemeNormalBackgroundColor,
        },

        [`&.col--active, &.col--selected`]: {
          position: 'relative',
        },

        [`&.col--valid-error`]: {
          [`&.show--valid-bg`]: {
            backgroundColor: cellValidateErrorCellBackgroundColor,
          },
        },

        '&.col--dirty': {
          position: 'relative',
          '&:before': {
            content: '""',
            top: calc(cellDirtyWidth).mul(-1).equal(),
            left: calc(cellDirtyWidth).mul(-1).equal(),
            position: 'absolute' as const,
            borderWidth: cellDirtyWidth,
            borderStyle: 'solid',
            borderColor: `transparent ${cellDirtyUpdateColor} transparent transparent`,
            transform: 'rotate(45deg)',
          },
        },
      },

      [`${componentCls}--row-expanded-wrapper`]: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      },

      [`${componentCls}-body--row-expanded-cell`]: {
        position: 'absolute',
        zIndex: 5,
        top: 0,
        left: 0,
        width: '100%',
        overflow: 'auto',
        borderTop: '1px solid transparent',
        borderBottom: '1px solid transparent',
        pointerEvents: 'all',

        [`&.is--padding`]: {
          [`${componentCls}-body--row-expanded-content`]: {
            padding: expandPaddingDefault,
          },
        },
      },

      [`${componentCls}-body--row-expanded-content`]: {
        backgroundColor: layoutBackgroundColor,
      },

      [`${componentCls}-body--row-expanded-place-column`]: {
        borderBottom: `${borderWidth} solid ${borderColor}`,
        borderRight: `${borderWidth} solid ${borderColor}`,
      },

      [`${componentCls}--expanded`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,

        [`${componentCls}--expand-btn`]: {
          cursor: 'pointer',
          userSelect: 'none',
          color: colorTextSecondary,

          [`&:hover`]: {
            color: colorText,
          },

          i: {
            display: 'inline-block',
            width: '1em',
            height: '1em',
            lineHeight: '1em',
            transition: 'transform 0.1s ease-in-out',
          },
        },

        [`& + ${componentCls}--expand-label`]: {
          flexGrow: 1,
          paddingLeft: '0.5em',
        },
      },

      [`${componentCls}-body--expanded-row`]: {
        '&.is--padding': {
          [`& > ${componentCls}-body--expanded-column`]: {
            [`& > ${componentCls}-body--expanded-cell`]: {
              padding: expandPaddingDefault,
            },
          },
        },
      },
      [`${componentCls}-body--expanded-column`]: {
        borderBottom: `${borderWidth} solid ${borderColor}`,
        borderRight: `${borderWidth} solid ${borderColor}`,

        '&.col--ellipsis': {
          [`& > ${componentCls}-body--expanded-cell`]: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
      },

      [`${componentCls}-body--expanded-cell`]: {
        position: 'relative',
        zIndex: 1,
        '&.is--ellipsis': {
          overflow: 'auto',
          outline: 0,
        },
      },

      /* 拖拽列*/
      [`${componentCls}--column`]: {
        [`&.col--drag-move`]: {
          transition: 'transform 0.5s ease',
        },

        [`&.col--drag-origin`]: {
          [`& > ${componentCls}-cell`]: {
            opacity: 0.3,
          },
        },
      },

      /* 拖拽行把柄 */
      [`${componentCls}-cell--drag-handle`]: {
        userSelect: 'none',

        [`& + span`]: {
          paddingLeft: '0.5em',
        },

        [`&:not(.is--disabled)`]: {
          cursor: 'grab',

          [`&:active`]: {
            cursor: 'grabbing',
          },

          [`&:hover`]: {
            color: primaryColor,
          },
        },

        [`&.is--disabled`]: {
          color: disabledColor,
          cursor: 'not-allowed',
        },
      },

      [`${componentCls}--empty-placeholder,
          ${componentCls}--empty-block`]: {
        color: placeholderColor,
        minHeight: rowHeight,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        width: '100%',
        outline: 0,
      },
      [`${componentCls}--empty-block`]: {
        display: 'none',
        visibility: 'hidden',
        pointerEvents: 'none',
      },
      [`${componentCls}--empty-place-wrapper`]: {
        display: 'none',
        position: 'absolute',
        width: '100%',
        top: 0,
        zIndex: 5,
        overflow: 'hidden',
        pointerEvents: 'none',
      },
      [`${componentCls}--empty-content`]: {
        display: 'block',
        width: '50%',
        pointerEvents: 'auto',
      },
      [`&.is--empty`]: {
        [`${componentCls}--empty-placeholder,
          ${componentCls}--empty-block`]: {
          display: 'flex',
        },
      },

      /* 可编辑*/
      [`&${componentCls}-editable`]: {
        [`&.cell--highlight`]: {
          [`${componentCls}-body--column`]: {
            [`&.col--active`]: {
              boxShadow: `inset 0px 0px 0px 2px ${primaryColor}`,

              [`&.col--valid-error`]: {
                boxShadow: `inset 0px 0px 0px 2px ${cellValidateErrorColor}`,
              },
            },
          },
        },
        [`${componentCls}-body--column`]: {
          padding: 0,
        },
      },

      [`${componentCls}-cell--wrapper`]: {
        margin: 'auto 0',
      },
    },
    /* footer*/
    [`${componentCls}--footer-wrapper`]: {
      color: footerFontColor,
      [`&.body--wrapper`]: {
        outline: 0,
      },
    },
  };
}

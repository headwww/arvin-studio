import type { CSSInterpolation } from '@arvin-studio/cssinjs';

import type { TableToken } from './interface';

export default function genExportStyle(token: TableToken): CSSInterpolation {
  const {
    componentCls,
    colorBorderSecondary,
    colorText,
    colorTextSecondary,
    borderRadius,
    fontSize,
    paddingSM,
  } = token;

  return {
    [`${componentCls}-export-panel`]: {
      display: 'flex',
      flexDirection: 'column',
      gap: paddingSM,
      fontSize,
      color: colorText,
    },
    [`${componentCls}-export-panel--field`]: {
      display: 'flex',
      alignItems: 'center',
      gap: paddingSM,
      '& > label': {
        flex: '0 0 88px',
        color: colorTextSecondary,
        textAlign: 'right',
      },
      '& > .as-input, & > .as-select': {
        flex: '1 1 auto',
      },
      '&.is--column': {
        alignItems: 'flex-start',
      },
    },
    [`${componentCls}-export-panel--columns`]: {
      flex: '1 1 auto',
      maxHeight: 260,
      overflow: 'auto',
      border: `1px solid ${colorBorderSecondary}`,
      borderRadius,
      padding: '4px 0',
    },
    [`${componentCls}-export-panel--column-option`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      minHeight: 28,
      padding: '0 8px',
      cursor: 'pointer',
      userSelect: 'none',
      '&:hover': {
        backgroundColor: token.controlItemBgHover,
      },
      '&.is--all': {
        borderBottom: `1px solid ${colorBorderSecondary}`,
      },
    },
    [`${componentCls}-export-panel--column-label`]: {
      flex: '1 1 auto',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    [`${componentCls}-export-panel--params`]: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '6px 12px',
      flex: '1 1 auto',
    },
    [`${componentCls}-export-panel--param`]: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      userSelect: 'none',
    },
    [`${componentCls}-export-panel--footer`]: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
    },
    [`${componentCls}-import-panel`]: {
      display: 'flex',
      flexDirection: 'column',
      gap: paddingSM,
      fontSize,
      color: colorText,
    },
    [`${componentCls}-import-panel--file`]: {
      flex: '1 1 auto',
    },
    [`${componentCls}-import-panel--selected`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '2px 8px',
      border: `1px solid ${colorBorderSecondary}`,
      borderRadius,
      span: {
        flex: '1 1 auto',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },
    [`${componentCls}-import-panel--type`]: {
      flex: '1 1 auto',
      color: colorTextSecondary,
    },
  };
}

import type { ComputedRef, VNode } from 'vue';

import type { AsComponentSlotType } from './types/common';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePrivateMethods,
} from './types/table';

import { createCommentVNode, h, isVNode } from 'vue';

import {
  CaretDownOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  DownOutlined,
  FilterFilled,
  FormOutlined,
  HolderOutlined,
  LoadingOutlined,
  QuestionCircleFilled,
  RightOutlined,
} from '@arvin-studio/icons';
import { eqNull, get, isArray, isString } from '@arvin-studio/kit';

import { ArvinStudio, Checkbox, Radio } from '..';
import { updateCellTitle } from '../_util/dom';
import { getSlotVNs } from '../_util/vn';
import {
  createColumn,
  eqEmptyValue,
  formatText,
  getFuncText,
  getRowid,
  isEnableConf,
} from './util';

type AsTableRenderParams<T> = T & {
  $table: AsTableConstructor & AsTablePrivateMethods;
  locale?: ComputedRef<any>;
};

const { renderer } = ArvinStudio;

/**
 * 渲染图标，兼容以下两种写法：
 * - class 字符串（如 `vxe-icon-caret-up`）
 * - @arvin-studio/icons 图标组件 / VNode
 */
function renderIconVNode(icon: any, defaultIcon?: any): any {
  if (icon) {
    if (isString(icon)) {
      return h('i', { class: icon });
    }
    if (isArray(icon)) {
      return icon;
    }
    if (isVNode(icon)) {
      return icon;
    }
    return h(icon);
  }
  return defaultIcon ? h(defaultIcon) : createCommentVNode();
}

/**
 * 本地化文案格式化，支持 {0}、{1} 占位符
 */
export function formatLocaleText(template: any, ...args: any[]) {
  if (eqNull(template) || template === '') {
    return args[0] ?? '';
  }
  return `${template}`.replaceAll(
    /\{(\d+)\}/g,
    (_match, index) => `${args[Number(index)] ?? ''}`,
  );
}

function renderTitlePrefixIcon(
  params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
) {
  const { $table, column, prefixCls } = params;
  const titlePrefix = column.titlePrefix || column.titleHelp;
  if (titlePrefix) {
    return (
      <span
        class={[
          `${prefixCls}-cell-title-prefix-icon`,
          titlePrefix.iconStatus ? `theme--${titlePrefix.iconStatus}` : '',
        ]}
        onMouseenter={(evnt: MouseEvent) => {
          $table.triggerHeaderTitleEvent(evnt, titlePrefix, params);
        }}
        onMouseleave={(evnt: MouseEvent) => {
          $table.handleTargetLeaveEvent(evnt);
        }}
      >
        {renderIconVNode(titlePrefix.icon, QuestionCircleFilled)}
      </span>
    );
  }
  return createCommentVNode();
}

function renderTitleSuffixIcon(
  params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
) {
  const { $table, column, prefixCls } = params;
  const titleSuffix = column.titleSuffix;
  if (titleSuffix) {
    return (
      <span
        class={[
          `${prefixCls}-cell-title-suffix-icon`,
          titleSuffix.iconStatus ? `theme--${titleSuffix.iconStatus}` : '',
        ]}
        onMouseenter={(evnt: MouseEvent) => {
          $table.triggerHeaderTitleEvent(evnt, titleSuffix, params);
        }}
        onMouseleave={(evnt: MouseEvent) => {
          $table.handleTargetLeaveEvent(evnt);
        }}
      >
        {renderIconVNode(titleSuffix.icon, QuestionCircleFilled)}
      </span>
    );
  }
  return createCommentVNode();
}

function getFooterContent(
  params: AsTableRenderParams<AsTableDefines.CellRenderFooterParams>,
) {
  const { $table, column, row, prefixCls } = params;
  const tableProps = $table.props;
  const { editConfig } = tableProps;
  const { slots, editRender, cellRender } = column;
  const footerSlot = slots ? slots.footer : null;
  if (footerSlot) {
    return $table.callSlot(footerSlot, params);
  }
  const isEnableEdit = editConfig && isEnableConf(editConfig);
  const editRenderOpts =
    isEnableEdit && isEnableConf(editRender) ? editRender : null;
  const cellRenderOpts = isEnableConf(cellRender) ? cellRender : null;
  const renderOpts = editRenderOpts || cellRenderOpts;
  const itemValue = $table.getFooterCellLabel(row, column);
  if (renderOpts) {
    const { computeRendererOpts } = $table.getComputeMaps();
    const rendererOpts = computeRendererOpts.value;
    const compConf = renderOpts.name
      ? rendererOpts[renderOpts.name] || renderer.get(renderOpts.name)
      : null;
    if (compConf) {
      const rtFooter = compConf.renderTableFooter;
      if (rtFooter) {
        const footParams = Object.assign(params, {
          cellValue: itemValue,
          itemValue,
        });
        return getSlotVNs(rtFooter(renderOpts, footParams));
      }
    }
  }
  return [
    h(
      'span',
      {
        class: `${prefixCls}-cell--label`,
      },
      formatText(itemValue, 1),
    ),
  ];
}

function renderCellDragIcon(
  params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
) {
  const { $table, column, prefixCls } = params;
  const { slots } = column;
  const { context } = $table;
  const tableSlots = context.slots;
  const { computeRowDragOpts } = $table.getComputeMaps();
  const rowDragOpts = computeRowDragOpts.value;

  const { icon, trigger, disabledMethod } = rowDragOpts;
  const isDisabled = disabledMethod && disabledMethod(params);

  const rowDragIconSlot =
    (slots ? slots.rowDragIcon || slots['row-drag-icon'] : null) ||
    tableSlots.rowDragIcon ||
    tableSlots['row-drag-icon'];

  const ons: Record<string, any> = {};
  if (trigger !== 'cell') {
    ons.onMousedown = (evnt: MouseEvent) => {
      if (!isDisabled) {
        $table.handleCellDragMousedownEvent(evnt, params);
      }
    };
    ons.onMouseup = (evnt: MouseEvent) => {
      $table.handleCellDragMouseupEvent(evnt);
    };
  }
  return (
    <span
      class={[
        `${prefixCls}-cell--drag-handle`,
        {
          'is--disabled': isDisabled,
        },
      ]}
      key="dg"
      {...ons}
    >
      {rowDragIconSlot
        ? $table.callSlot(rowDragIconSlot, params)
        : renderIconVNode(icon, HolderOutlined)}
    </span>
  );
}

function renderHeaderCellDragIcon(
  params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
) {
  const { $table, column, prefixCls } = params;
  const { context } = $table;
  const tableSlots = context.slots;
  const { slots } = column;
  const { computeColumnOpts, computeColumnDragOpts } = $table.getComputeMaps();
  const columnOpts = computeColumnOpts.value;
  const columnDragOpts = computeColumnDragOpts.value;
  const {
    showIcon,
    isPeerDrag,
    icon,
    trigger,
    isCrossDrag,
    visibleMethod,
    disabledMethod,
  } = columnDragOpts;
  if (
    columnOpts.drag &&
    showIcon &&
    (!visibleMethod || visibleMethod(params)) &&
    !column.fixed &&
    (isPeerDrag || isCrossDrag || !column.parentId)
  ) {
    const isDisabled = disabledMethod && disabledMethod(params);
    const columnDragIconSlot =
      (slots ? slots.columnDragIcon || slots['column-drag-icon'] : null) ||
      tableSlots.columnDragIcon ||
      tableSlots['column-drag-icon'];
    const ons: Record<string, any> = {};
    if (trigger !== 'cell') {
      ons.onMousedown = (evnt: MouseEvent) => {
        if (!isDisabled) {
          $table.handleHeaderCellDragMousedownEvent(evnt, params);
        }
      };
      ons.onMouseup = (evnt: MouseEvent) => {
        $table.handleHeaderCellDragMouseupEvent(evnt);
      };
    }
    return (
      <span
        class={[
          `${prefixCls}-cell--drag-handle`,
          {
            'is--disabled': isDisabled,
          },
        ]}
        key="dg"
        {...ons}
      >
        {columnDragIconSlot
          ? $table.callSlot(columnDragIconSlot, params)
          : renderIconVNode(icon, HolderOutlined)}
      </span>
    );
  }
  return createCommentVNode();
}

function renderCellBaseVNs(
  params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  content: AsComponentSlotType | AsComponentSlotType[],
) {
  const { $table, column, level } = params;
  const { dragSort } = column;
  const tableProps = $table.props;
  const { treeConfig } = tableProps;
  const { computeRowOpts, computeRowDragOpts, computeTreeOpts } =
    $table.getComputeMaps();
  const rowOpts = computeRowOpts.value;
  const rowDragOpts = computeRowDragOpts.value;
  const treeOpts = computeTreeOpts.value;
  const { showIcon, isPeerDrag, isCrossDrag, visibleMethod } = rowDragOpts;
  const vns: any[] = [];
  if (
    dragSort &&
    rowOpts.drag &&
    showIcon &&
    (!visibleMethod || visibleMethod(params))
  ) {
    if (treeConfig) {
      if (treeOpts.transform && (isPeerDrag || isCrossDrag || !level)) {
        vns.push(renderCellDragIcon(params));
      }
    } else {
      vns.push(renderCellDragIcon(params));
    }
  }
  return vns.concat(isArray(content) ? content : [content]);
}

function getDefaultCellLabel(params: AsTableDefines.CellRenderBodyParams) {
  const { $table, row, column } = params;
  return formatText($table.getCellLabel(row, column), 1);
}

function renderCellHandle(
  params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
) {
  const { column, row, $table } = params;
  const tableProps = $table.props;
  const tableReactData = $table.reactData;
  const { isRowGroupStatus } = tableReactData;
  const { editConfig } = tableProps;
  const { type, treeNode, rowGroupNode, editRender } = column;
  const { computeEditOpts, computeCheckboxOpts, computeAggregateOpts } =
    $table.getComputeMaps();
  const aggregateOpts = computeAggregateOpts.value;
  const { mode } = aggregateOpts;
  const checkboxOpts = computeCheckboxOpts.value;
  const editOpts = computeEditOpts.value;
  const isDeepCell =
    treeNode ||
    (isRowGroupStatus &&
      (mode === 'column' ? column.field === row.groupField : rowGroupNode));
  switch (type) {
    case 'checkbox': {
      return checkboxOpts.checkField
        ? isDeepCell
          ? Cell.renderDeepSelectionCellByProp(params)
          : Cell.renderCheckboxCellByProp(params)
        : isDeepCell
          ? Cell.renderDeepSelectionCell(params)
          : Cell.renderCheckboxCell(params);
    }
    case 'expand': {
      return Cell.renderExpandCell(params);
    }
    case 'html': {
      return isDeepCell
        ? Cell.renderDeepHTMLCell(params)
        : Cell.renderHTMLCell(params);
    }
    case 'radio': {
      return isDeepCell
        ? Cell.renderDeepRadioCell(params)
        : Cell.renderRadioCell(params);
    }
    case 'seq': {
      return isDeepCell
        ? Cell.renderDeepIndexCell(params)
        : Cell.renderSeqCell(params);
    }
  }
  const isEnableEdit = editConfig && isEnableConf(editConfig);
  const editRenderOpts =
    isEnableEdit && isEnableConf(editRender) ? editRender : null;
  if (editRenderOpts) {
    // 编辑模式：单元格编辑 / 行编辑
    return editOpts.mode === 'cell'
      ? isDeepCell
        ? Cell.renderDeepCellEdit(params)
        : Cell.renderCellEdit(params)
      : isDeepCell
        ? Cell.renderDeepRowEdit(params)
        : Cell.renderRowEdit(params);
  }
  return isDeepCell
    ? Cell.renderDeepCell(params)
    : Cell.renderDefaultCell(params);
}

function renderHeaderHandle(
  params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
) {
  const { column, $table } = params;
  const tableProps = $table.props;
  const { editConfig } = tableProps;
  const { type, filters, sortable, editRender, slots } = column;

  // 兼容已废弃方式：header 插槽作为标题内容（vxe 默认行为，tableHeadeSlotToTitleSlot 不为 obsolete 时）
  const headerSlot = slots ? slots.header : null;
  if (headerSlot) {
    return renderTitleContent(params, $table.callSlot(headerSlot, params));
  }

  switch (type) {
    case 'checkbox': {
      return Cell.renderCheckboxHeader(params);
    }
    case 'html': {
      if (filters && sortable) {
        return Cell.renderSortAndFilterHeader(params);
      } else if (sortable) {
        return Cell.renderSortHeader(params);
      } else if (filters) {
        return Cell.renderFilterHeader(params);
      }
      break;
    }
    case 'radio': {
      return Cell.renderRadioHeader(params);
    }
    case 'seq': {
      return Cell.renderSeqHeader(params);
    }
  }
  const isEnableEdit = editConfig && isEnableConf(editConfig);
  const editRenderOpts =
    isEnableEdit && isEnableConf(editRender) ? editRender : null;
  if (editRenderOpts) {
    return Cell.renderEditHeader(params);
  } else if (filters && sortable) {
    return Cell.renderSortAndFilterHeader(params);
  } else if (sortable) {
    return Cell.renderSortHeader(params);
  } else if (filters) {
    return Cell.renderFilterHeader(params);
  }
  return Cell.renderDefaultHeader(params);
}

function renderHeaderCellBaseVNs(
  params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
  content: VNode | VNode[],
) {
  const vns = [
    renderTitlePrefixIcon(params),
    renderHeaderCellDragIcon(params),
    ...(isArray(content) ? content : [content]),
    renderTitleSuffixIcon(params),
  ];
  return vns;
}

function getRenderDefaultColumnTitle(
  column: AsTableDefines.ColumnInfo,
  content: AsComponentSlotType | AsComponentSlotType[],
) {
  if (column.type === 'html' && isString(content)) {
    return h('span', {
      key: 'ch',
      innerHTML: content,
    });
  }
  return h(
    'span',
    {
      key: 'ct',
    },
    getSlotVNs(content),
  );
}

function renderTitleContent(
  params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
  content: AsComponentSlotType | AsComponentSlotType[],
) {
  const { prefixCls, column, $table } = params;
  const tableProps = $table.props;
  const tableReactData = $table.reactData;
  const { computeHeaderTooltipOpts } = $table.getComputeMaps();
  const { showHeaderOverflow: allColumnHeaderOverflow } = tableProps;
  const { isRowGroupStatus, isDragResize } = tableReactData;
  const { showHeaderOverflow, slots } = column;
  const titleSlot = slots ? slots.title : null;
  const headerTooltipOpts = computeHeaderTooltipOpts.value;
  const showAllTip = headerTooltipOpts.showAll;
  const headOverflow = eqNull(showHeaderOverflow)
    ? allColumnHeaderOverflow
    : showHeaderOverflow;
  const showTitle =
    (headOverflow === true ? headerTooltipOpts.mode : headOverflow) === 'title';
  const showTooltip =
    (headOverflow === true ? headerTooltipOpts.mode : headOverflow) ===
    'tooltip';
  const ons: Record<string, any> = {};
  if (showTitle || showTooltip || showAllTip) {
    ons.onMouseenter = (evnt: MouseEvent) => {
      if (isDragResize) {
        return;
      }
      if (showTitle) {
        updateCellTitle(evnt.currentTarget, column);
      } else if (showTooltip || showAllTip) {
        $table.triggerHeaderTooltipEvent(evnt, params);
      }
    };
  }
  if (showTooltip || showAllTip) {
    ons.onMouseleave = (evnt: MouseEvent) => {
      if (isDragResize) {
        return;
      }
      if (showTooltip || showAllTip) {
        $table.handleTargetLeaveEvent(evnt);
      }
    };
  }

  const titleVN = getRenderDefaultColumnTitle(column, content);
  const titleVNs =
    isRowGroupStatus &&
    column.aggFunc &&
    typeof ($table as any).getPivotTableAggregateRenderColTitles === 'function'
      ? ($table as any).getPivotTableAggregateRenderColTitles(column, titleVN)
      : titleSlot
        ? $table.callSlot(titleSlot, params)
        : [titleVN];

  return [
    h(
      'span',
      {
        class: `${prefixCls}-cell--title`,
        ...ons,
      },
      titleVNs,
    ),
  ];
}

function renderFooterHandle(
  params: AsTableRenderParams<AsTableDefines.CellRenderFooterParams>,
) {
  return Cell.renderDefaultFooter(params);
}

export const Cell = {
  createColumn(
    $asTable: AsTableConstructor & AsTablePrivateMethods,
    columnOpts: AsTableDefines.ColumnInfo | AsTableDefines.ColumnOptions,
    locale?: ComputedRef<any>,
  ) {
    const { type } = columnOpts;
    const renConfs: any = {
      renderHeader: (param: any) => {
        return renderHeaderHandle({ ...param, locale });
      },
      renderCell: (param: any) => {
        return renderCellHandle({ ...param, locale });
      },
      renderFooter: renderFooterHandle,
    };
    if (type === 'expand') {
      renConfs.renderData = Cell.renderExpandData;
    }
    return createColumn($asTable, columnOpts, renConfs, locale);
  },

  /**
   * 列头标题
   */
  renderHeaderTitle(
    params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
  ) {
    const { $table, column } = params;
    const tableProps = $table.props;
    const { editConfig } = tableProps;
    const { editRender, cellRender } = column;
    const isEnableEdit = editConfig && isEnableConf(editConfig);
    const editRenderOpts =
      isEnableEdit && isEnableConf(editRender) ? editRender : null;
    const cellRenderOpts = isEnableConf(cellRender) ? cellRender : null;
    const renderOpts = editRenderOpts || cellRenderOpts;

    if (renderOpts) {
      const { computeRendererOpts } = $table.getComputeMaps();
      const rendererOpts = computeRendererOpts.value;
      const compConf = renderOpts.name
        ? rendererOpts[renderOpts.name] || renderer.get(renderOpts.name)
        : null;
      if (compConf) {
        const rtHeader = compConf.renderTableHeader;
        if (rtHeader) {
          return renderTitleContent(
            params,
            getSlotVNs(rtHeader(renderOpts, params)),
          );
        }
      }
    }
    return renderTitleContent(params, $table.getHeaderCellLabel(column));
  },
  renderDefaultHeader(
    params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
  ) {
    return renderHeaderCellBaseVNs(params, Cell.renderHeaderTitle(params));
  },
  renderDefaultCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, row, column, prefixCls, locale } = params;
    const tableProps = $table.props;
    const tableReactData = $table.reactData;
    const tableInternalData = $table.internalData;
    const { isRowGroupStatus } = tableReactData;

    const { editConfig } = tableProps;
    const { field, slots, editRender, cellRender, rowGroupNode, aggFunc } =
      column;

    const isEnableEdit = editConfig && isEnableConf(editConfig);
    const editRenderOpts =
      isEnableEdit && isEnableConf(editRender) ? editRender : null;
    const cellRenderOpts = isEnableConf(cellRender) ? cellRender : null;
    const defaultSlot = slots ? slots.default : null;
    const gcSlot = slots ? slots.groupContent || slots['group-content'] : null;
    const gvSlot = slots ? slots.groupValues || slots['group-values'] : null;

    let cellValue: null | number | string = '';
    if (isRowGroupStatus && field && row.isAggregate) {
      const aggRow: AsTableDefines.AggregateRowInfo = row;
      const { computeAggregateOpts } = $table.getComputeMaps();
      const aggregateOpts = computeAggregateOpts.value;
      const {
        contentMethod,
        totalMethod,
        formatValuesMethod,
        mode,
        showTotal,
        countFields,
        mapChildrenField,
      } = aggregateOpts;
      const aggData = aggRow.aggData;
      const { fullColumnFieldData } = tableInternalData;
      const currAggData = aggData ? aggData[field] : null;
      const groupField = aggRow.groupField;
      const groupContent = aggRow.groupContent;
      const childCount = aggRow.childCount;
      const childList = mapChildrenField ? aggRow[mapChildrenField] || [] : [];
      const colRest = (fullColumnFieldData[groupField] ||
        {}) as AsTableDefines.ColumnCacheItem;
      const ctParams = {
        $table,
        groupField,
        groupColumn: (colRest
          ? colRest.column
          : null) as AsTableDefines.ColumnInfo,
        column,
        groupValue: groupContent,
        childList,
        childCount,
        aggValue: null as any,
      };
      if (mode === 'column' ? field === aggRow.groupField : rowGroupNode) {
        cellValue = groupContent;
        if (contentMethod) {
          cellValue = `${contentMethod(ctParams)}`;
        }
        if (showTotal) {
          cellValue = formatLocaleText(
            locale?.value?.rowGroupContentTotal || '{0}（{1}）',
            cellValue,
            totalMethod ? totalMethod(ctParams) : childCount,
            childCount,
          );
        }
        if (gcSlot) {
          return renderCellBaseVNs(
            params,
            $table.callSlot(
              gcSlot,
              Object.assign(
                { groupField, groupContent, childList, childCount },
                params,
              ),
            ),
          );
        }
      } else if ($table.getPivotTableAggregateCellAggValue) {
        cellValue = $table.getPivotTableAggregateCellAggValue(params);
        ctParams.aggValue = cellValue;
        if (gvSlot) {
          return renderCellBaseVNs(
            params,
            $table.callSlot(
              gvSlot,
              Object.assign(
                { groupField, groupContent, childList, childCount },
                params,
                ctParams,
              ),
            ),
          );
        }
      } else if (
        aggFunc === true ||
        (countFields && countFields.includes(field))
      ) {
        cellValue = currAggData ? currAggData.value : childCount;
        ctParams.aggValue = cellValue;
        if (formatValuesMethod) {
          cellValue = formatValuesMethod(ctParams);
        }
        if (gvSlot) {
          return renderCellBaseVNs(
            params,
            $table.callSlot(
              gvSlot,
              Object.assign(
                { groupField, groupContent, childList, childCount },
                params,
                ctParams,
              ),
            ),
          );
        }
      }
    } else {
      if (defaultSlot) {
        // 列级默认插槽，最高优先
        return renderCellBaseVNs(params, $table.callSlot(defaultSlot, params));
      }
      const { computeRendererOpts } = $table.getComputeMaps();
      const rendererOpts = computeRendererOpts.value;
      // 如果是编辑模式-查看：slot default > formatter > cellRender.renderTableDefault > editRender.renderTableCell > editRender.renderTableDefault > cellRender.tableCellFormatter > editRender.tableCellFormatter > field
      // 如果是查看表格：slot default > formatter > cellRender.renderTableDefault > cellRender.tableCellFormatter > field
      const cellCompConf =
        cellRenderOpts && cellRenderOpts.name
          ? rendererOpts[cellRenderOpts.name] ||
            renderer.get(cellRenderOpts.name)
          : null;
      if (cellRenderOpts) {
        const cellDefaultRenderFn = cellCompConf
          ? cellCompConf.renderTableDefault
          : null;
        if (cellDefaultRenderFn && cellRenderOpts) {
          return renderCellBaseVNs(
            params,
            getSlotVNs(
              cellDefaultRenderFn(
                cellRenderOpts,

                Object.assign(
                  { $type: editRenderOpts ? 'edit' : 'cell' },
                  params,
                ),
              ),
            ),
          );
        }
      }
      if (editRenderOpts) {
        const editCompConf =
          editRenderOpts && editRenderOpts.name
            ? rendererOpts[editRenderOpts.name] ||
              renderer.get(editRenderOpts.name)
            : null;
        const editCellRenderFn = editCompConf
          ? editCompConf.renderTableCell || editCompConf.renderTableDefault
          : null;
        if (editCellRenderFn) {
          return renderCellBaseVNs(
            params,
            getSlotVNs(
              editCellRenderFn(
                editRenderOpts,

                Object.assign(
                  { $type: editRenderOpts ? 'edit' : 'cell' },
                  params,
                ),
              ),
            ),
          );
        }
      }
      // 如果是编辑模式-查看：cellRender.tableCellFormatter > editRender.tableCellFormatter > field
      // 如果是查看表格：cellRender.tableCellFormatter > field
      cellValue = $table.getCellLabel(row, column);
    }

    const cellPlaceholder = editRenderOpts ? editRenderOpts.placeholder : '';
    return renderCellBaseVNs(
      params,
      <span class={`${prefixCls}-cell--label`}>
        {editRenderOpts && eqEmptyValue(cellValue) ? (
          <span class={`${prefixCls}-cell--placeholder`}>
            {formatText(getFuncText(cellPlaceholder), 1)}
          </span>
        ) : (
          <span>{formatText(cellValue, 1)}</span>
        )}
      </span>,
    );
  },
  renderDeepCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    return Cell.renderDeepNodeBtn(
      params,
      Cell.renderDefaultCell(params) as VNode[],
    );
  },

  renderDefaultFooter(
    params: AsTableRenderParams<AsTableDefines.CellRenderFooterParams>,
  ) {
    return getFooterContent(params);
  },

  /**
   * 行分组
   */
  renderRowGroupBtn(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
    cellVNodes: AsComponentSlotType[],
  ) {
    const { $table, prefixCls } = params;
    const tableReactData = $table.reactData;
    const tableInternalData = $table.internalData;
    const { row, level } = params;
    const { computeAggregateOpts } = $table.getComputeMaps();
    const { rowGroupExpandedFlag } = tableReactData;
    const { rowGroupExpandedMaps } = tableInternalData;
    const aggregateOpts = computeAggregateOpts.value;
    const { mode, padding, indent, showIcon, iconOpen, iconClose } =
      aggregateOpts;
    const rowid = getRowid($table, row);
    const isExpand = !!rowGroupExpandedFlag && !!rowGroupExpandedMaps[rowid];
    return (
      <div
        class={[
          `${prefixCls}-row-group--tree-node`,
          {
            'is--expanded': isExpand,
          },
        ]}
        style={
          mode !== 'column' && padding && indent
            ? {
                paddingLeft: `${level * indent}px`,
              }
            : undefined
        }
      >
        {showIcon && row.isAggregate ? (
          <span
            class={`${prefixCls}-row-group--node-btn`}
            onClick={(evnt: MouseEvent) => {
              $table.triggerRowGroupExpandEvent(evnt, params);
            }}
          >
            {renderIconVNode(
              isExpand ? iconOpen : iconClose,
              isExpand ? DownOutlined : RightOutlined,
            )}
          </span>
        ) : (
          createCommentVNode()
        )}
        <div class={`${prefixCls}-row-group-cell`}>{cellVNodes}</div>
      </div>
    );
  },

  /**
   * 树
   */
  renderTreeNodeBtn(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
    cellVNodes: AsComponentSlotType[],
  ) {
    const { $table, isHidden, prefixCls } = params;
    const tableReactData = $table.reactData;
    const tableInternalData = $table.internalData;
    const { row, column, level } = params;
    const { slots } = column;
    const iconSlot = slots ? slots.icon : null;
    if (iconSlot) {
      return $table.callSlot(iconSlot, params);
    }
    const { computeTreeOpts } = $table.getComputeMaps();
    const { treeExpandedFlag } = tableReactData;
    const { fullAllDataRowIdData, treeExpandedMaps, treeExpandLazyLoadedMaps } =
      tableInternalData;
    const treeOpts = computeTreeOpts.value;
    const {
      padding,
      indent,
      lazy,
      trigger,
      visibleMethod,
      iconLoaded,
      showIcon,
      iconOpen,
      iconClose,
    } = treeOpts;
    const childrenField = treeOpts.children || treeOpts.childrenField;
    const hasChildField = treeOpts.hasChild || treeOpts.hasChildField;
    const rowChilds = row[childrenField];
    const hasChild = rowChilds && rowChilds.length > 0;
    let hasLazyChilds = false;
    let isActive = false;
    let isLazyLoading = false;
    let isLazyLoaded = false;
    const ons: Record<string, any> = {};
    if (!isHidden) {
      const rowid = getRowid($table, row);
      isActive = !!treeExpandedFlag && !!treeExpandedMaps[rowid];
      if (lazy) {
        const rest = fullAllDataRowIdData[rowid];
        isLazyLoading = !!treeExpandLazyLoadedMaps[rowid];
        hasLazyChilds = row[hasChildField];
        isLazyLoaded = !!rest?.treeLoaded;
      }
    }
    if (!trigger || trigger === 'default') {
      ons.onClick = (evnt: MouseEvent) => {
        $table.triggerTreeExpandEvent(evnt, params);
      };
    }

    return (
      <div
        class={[
          `${prefixCls}-cell--tree-node`,
          {
            'is--active': isActive,
          },
        ]}
        style={
          padding && indent
            ? {
                paddingLeft: `${level * indent}px`,
              }
            : undefined
        }
      >
        {showIcon &&
        (lazy
          ? isLazyLoaded
            ? hasChild
            : hasChild || hasLazyChilds
          : hasChild) &&
        (!visibleMethod || visibleMethod(params)) ? (
          <div class={`${prefixCls}-cell--tree-btn`} {...ons}>
            {isLazyLoading
              ? renderIconVNode(iconLoaded, LoadingOutlined)
              : isActive
                ? renderIconVNode(iconOpen, CaretDownOutlined)
                : renderIconVNode(iconClose, CaretRightOutlined)}
          </div>
        ) : null}
        <div class={`${prefixCls}-tree-cell`}>{cellVNodes}</div>
      </div>
    );
  },

  /**
   * 层级节点。
   * 行分组、树结构
   */
  renderDeepNodeBtn(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
    cellVNodes: AsComponentSlotType[],
  ) {
    const { $table, row, column } = params;
    const { rowGroupNode } = column;
    const tableReactData = $table.reactData;
    const { rowGroupList } = tableReactData;
    if (rowGroupList.length > 0) {
      const { computeAggregateOpts } = $table.getComputeMaps();
      const aggregateOpts = computeAggregateOpts.value;
      const { mode } = aggregateOpts;
      if (mode === 'column') {
        if (row.groupField && column.field === row.groupField) {
          return [Cell.renderRowGroupBtn(params, cellVNodes)];
        }
        return cellVNodes;
      } else if (rowGroupNode) {
        return [Cell.renderRowGroupBtn(params, cellVNodes)];
      }
    }
    return [Cell.renderTreeNodeBtn(params, cellVNodes)];
  },

  /**
   * 序号
   */
  renderSeqHeader(
    params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
  ) {
    const { $table, column } = params;
    return renderHeaderCellBaseVNs(
      params,
      renderTitleContent(params, $table.getHeaderCellLabel(column)),
    );
  },

  renderSeqCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, column } = params;
    const tableProps = $table.props;
    const { treeConfig } = tableProps;
    const { computeSeqOpts } = $table.getComputeMaps();
    const seqOpts = computeSeqOpts.value;
    const { slots } = column;
    const defaultSlot = slots ? slots.default : null;
    if (defaultSlot) {
      return renderCellBaseVNs(params, $table.callSlot(defaultSlot, params));
    }
    const { seq } = params;
    const seqMd = seqOpts.seqMethod;
    return renderCellBaseVNs(params, [
      h(
        'span',
        `${formatText(seqMd ? seqMd(params) : treeConfig ? seq : (seqOpts.startIndex || 0) + (seq as number), 1)}`,
      ),
    ]);
  },

  renderDeepIndexCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    return Cell.renderDeepNodeBtn(
      params,
      Cell.renderSeqCell(params) as VNode[],
    );
  },

  /**
   * 单选
   */
  renderRadioHeader(
    params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
  ) {
    const { $table, column, prefixCls } = params;
    const { slots } = column;
    const titleSlot = slots ? slots.title : null;

    return renderHeaderCellBaseVNs(
      params,
      renderTitleContent(
        params,
        <span class={`${prefixCls}-radio--label`}>
          {titleSlot
            ? $table.callSlot(titleSlot, params)
            : $table.getHeaderCellLabel(column)}
        </span>,
      ),
    );
  },

  /**
   * 单选框单元格渲染
   */
  renderRadioCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, column, isHidden, row, prefixCls } = params;
    const { reactData } = $table;

    const { computeRadioOpts } = $table.getComputeMaps();
    const radioOpts = computeRadioOpts.value;

    const { labelField, checkMethod, visibleMethod } = radioOpts;

    const { slots } = column;
    const defaultSlot = slots?.default;
    const radioSlot = slots?.radio;

    const isChecked = $table.eqRow(row, reactData.selectRadioRow);
    const isVisible = !visibleMethod || visibleMethod({ $table, row });

    let isDisabled = !!checkMethod;
    const ons: Record<string, any> = {};
    if (!isHidden) {
      ons.onClick = (evnt: MouseEvent) => {
        if (!isDisabled && isVisible) {
          $table.triggerRadioRowEvent(evnt, params);
        }
      };
      if (checkMethod) {
        isDisabled = !checkMethod({ $table, row });
      }
    }

    const radioParams = {
      ...params,
      checked: isChecked,
      disabled: isDisabled,
      visible: isVisible,
    };

    // 自定义单选框插槽
    if (radioSlot) {
      return renderCellBaseVNs(params, $table.callSlot(radioSlot, radioParams));
    }

    return renderCellBaseVNs(
      params,
      <span
        class={[
          `${prefixCls}-cell--radio`,
          {
            'is--checked': isChecked,
            'is--disabled': isDisabled,
          },
        ]}
        {...ons}
      >
        {isVisible && (
          <Radio checked={isChecked} disabled={isDisabled || isHidden} />
        )}

        {(defaultSlot || labelField) && (
          <span class={`${prefixCls}-radio--label`}>
            {defaultSlot
              ? $table.callSlot(defaultSlot, radioParams)
              : get(row, labelField as string)}
          </span>
        )}
      </span>,
    );
  },
  renderDeepRadioCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    return Cell.renderDeepNodeBtn(params, Cell.renderRadioCell(params));
  },

  /**
   * 多选表头
   */
  renderCheckboxHeader(
    params: AsTableRenderParams<AsTableDefines.CellRenderHeaderParams>,
  ) {
    const { $table, column, isHidden, prefixCls, locale } = params;
    const { reactData } = $table;

    const { computeIsAllCheckboxDisabled, computeCheckboxOpts } =
      $table.getComputeMaps();

    const {
      isAllSelected: isAllCheckboxSelected,
      isIndeterminate: isAllCheckboxIndeterminate,
    } = reactData;

    const isAllCheckboxDisabled = computeIsAllCheckboxDisabled.value;

    const { slots } = column;
    const titleSlot = slots?.title;

    const checkboxOpts = computeCheckboxOpts.value;
    const { checkStrictly, showHeader, headerTitle } = checkboxOpts;

    const colTitle = $table.getHeaderCellLabel(column);

    const checkboxParams = {
      ...params,
      checked: isAllCheckboxSelected,
      disabled: isAllCheckboxDisabled,
      indeterminate: isAllCheckboxIndeterminate,
    };

    const handleCheckAll = (evnt: MouseEvent) => {
      if (!isHidden && !isAllCheckboxDisabled) {
        $table.triggerCheckAllEvent(evnt, !isAllCheckboxSelected);
      }
    };

    const titleContent = titleSlot
      ? $table.callSlot(titleSlot, checkboxParams)
      : colTitle;

    // 不显示全选框
    if (checkStrictly ? !showHeader : showHeader === false) {
      return renderHeaderCellBaseVNs(
        params,
        renderTitleContent(
          checkboxParams,
          <span class={`${prefixCls}-checkbox--label`}>{titleContent}</span>,
        ),
      );
    }

    const title = eqNull(headerTitle)
      ? locale?.value.allTitle
      : `${headerTitle || ''}`;

    return renderHeaderCellBaseVNs(
      params,
      renderTitleContent(
        checkboxParams,
        <span
          class={[
            `${prefixCls}-cell--checkbox`,
            {
              'is--checked': isAllCheckboxSelected,
              'is--disabled': isAllCheckboxDisabled,
              'is--indeterminate': isAllCheckboxIndeterminate,
            },
          ]}
          onClick={handleCheckAll}
          title={title}
        >
          <Checkbox
            checked={isAllCheckboxSelected}
            disabled={isAllCheckboxDisabled || isHidden}
            indeterminate={isAllCheckboxIndeterminate}
          />

          {(titleSlot || colTitle) && (
            <span class={`${prefixCls}-checkbox--label`}>{titleContent}</span>
          )}
        </span>,
      ),
    );
  },

  /**
   * 多选单元格
   */
  renderCheckboxCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, row, column, isHidden, prefixCls } = params;

    const { props, reactData, internalData } = $table;
    const { treeConfig } = props;

    const { updateCheckboxFlag, isRowGroupStatus } = reactData;

    const { selectCheckboxMaps, treeIndeterminateRowMaps } = internalData;

    const { computeCheckboxOpts, computeAggregateOpts } =
      $table.getComputeMaps();

    const aggregateOpts = computeAggregateOpts.value;
    const { mapChildrenField } = aggregateOpts;

    const checkboxOpts = computeCheckboxOpts.value;
    const { labelField, checkMethod, visibleMethod } = checkboxOpts;

    const { slots } = column;
    const defaultSlot = slots?.default;
    const checkboxSlot = slots?.checkbox;

    let indeterminate = false;
    let isChecked = false;
    let isVisible = true;
    let isDisabled = false;

    if (!isHidden) {
      const rowid = getRowid($table, row);

      isChecked = !!updateCheckboxFlag && !!selectCheckboxMaps[rowid];

      if (checkMethod && isRowGroupStatus && $table.isAggregateRecord(row)) {
        const childList: any[] = row[mapChildrenField || ''];

        if (
          !childList ||
          childList.every((item) => !checkMethod({ $table, row: item }))
        ) {
          isDisabled = true;
        }
      } else {
        isVisible = !visibleMethod || visibleMethod({ $table, row });

        isDisabled = checkMethod
          ? !checkMethod({ $table, row })
          : !!checkMethod;
      }

      if (treeConfig || isRowGroupStatus) {
        indeterminate = !!treeIndeterminateRowMaps[rowid];
      }
    }

    const checkboxParams = {
      ...params,
      checked: isChecked,
      disabled: isDisabled,
      visible: isVisible,
      indeterminate,
    };

    // 自定义多选框插槽
    if (checkboxSlot) {
      return renderCellBaseVNs(
        params,
        $table.callSlot(checkboxSlot, checkboxParams),
      );
    }

    const handleClick = (evnt: MouseEvent) => {
      if (!isHidden && !isDisabled && isVisible) {
        $table.triggerCheckRowEvent(evnt, params, !isChecked);
      }
    };

    return renderCellBaseVNs(
      params,
      <span
        class={[
          `${prefixCls}-cell--checkbox`,
          {
            'is--checked': isChecked,
            'is--disabled': isDisabled,
            'is--indeterminate': indeterminate,
            'is--hidden': !isVisible,
          },
        ]}
        onClick={handleClick}
      >
        {isVisible && (
          <Checkbox
            checked={isChecked}
            disabled={isDisabled || isHidden}
            indeterminate={indeterminate}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {(defaultSlot || labelField) && (
          <span class={`${prefixCls}-checkbox--label`}>
            {defaultSlot
              ? $table.callSlot(defaultSlot, checkboxParams)
              : get(row, labelField as string)}
          </span>
        )}
      </span>,
    );
  },

  renderDeepSelectionCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    return Cell.renderDeepNodeBtn(params, Cell.renderCheckboxCell(params));
  },
  /**
   * 多选单元格（字段绑定模式）
   */
  renderCheckboxCellByProp(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, row, column, isHidden, prefixCls } = params;

    const { props, reactData, internalData } = $table;
    const { treeConfig } = props;

    const { updateCheckboxFlag, isRowGroupStatus } = reactData;

    const { treeIndeterminateRowMaps } = internalData;

    const { computeCheckboxOpts, computeAggregateOpts } =
      $table.getComputeMaps();

    const aggregateOpts = computeAggregateOpts.value;
    const { mapChildrenField } = aggregateOpts;

    const checkboxOpts = computeCheckboxOpts.value;

    const { labelField, checkField, checkMethod, visibleMethod } = checkboxOpts;

    const indeterminateField = checkboxOpts.indeterminateField;

    const { slots } = column;
    const defaultSlot = slots?.default;
    const checkboxSlot = slots?.checkbox;

    let indeterminate = false;
    let isChecked = false;
    let isVisible = true;
    let isDisabled = false;

    if (!isHidden) {
      const rowid = getRowid($table, row);

      isChecked = !!updateCheckboxFlag && !!get(row, checkField);

      if (checkMethod && isRowGroupStatus && $table.isAggregateRecord(row)) {
        const childList: any[] = row[mapChildrenField || ''];

        if (
          !childList ||
          childList.every((item) => !checkMethod({ $table, row: item }))
        ) {
          isDisabled = true;
        }
      } else {
        isVisible = !visibleMethod || visibleMethod({ $table, row });

        isDisabled = checkMethod
          ? !checkMethod({ $table, row })
          : !!checkMethod;
      }

      if (treeConfig || isRowGroupStatus) {
        indeterminate = !!treeIndeterminateRowMaps[rowid];
      }
    }

    // 优先使用数据字段中的半选状态
    const isIndeterminate =
      indeterminateField && !isChecked
        ? !!get(row, indeterminateField)
        : indeterminate;

    const checkboxParams = {
      ...params,
      checked: isChecked,
      disabled: isDisabled,
      visible: isVisible,
      indeterminate: isIndeterminate,
    };

    // 自定义多选框插槽
    if (checkboxSlot) {
      return renderCellBaseVNs(
        params,
        $table.callSlot(checkboxSlot, checkboxParams),
      );
    }

    const handleClick = (evnt: MouseEvent) => {
      if (!isHidden && !isDisabled && isVisible) {
        $table.triggerCheckRowEvent(evnt, params, !isChecked);
      }
    };

    return renderCellBaseVNs(
      params,
      <span
        class={[
          `${prefixCls}-cell--checkbox`,
          {
            'is--checked': isChecked,
            'is--disabled': isDisabled,
            'is--indeterminate': isIndeterminate,
            'is--hidden': !isVisible,
          },
        ]}
        onClick={handleClick}
      >
        {isVisible && (
          <>
            <Checkbox
              checked={isChecked}
              disabled={isDisabled || isHidden}
              indeterminate={isIndeterminate}
              style={{ pointerEvents: 'none' }}
            />

            {(defaultSlot || labelField) && (
              <span class={`${prefixCls}-checkbox--label`}>
                {defaultSlot
                  ? $table.callSlot(defaultSlot, checkboxParams)
                  : get(row, labelField as string)}
              </span>
            )}
          </>
        )}
      </span>,
    );
  },
  renderDeepSelectionCellByProp(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    return Cell.renderDeepNodeBtn(
      params,
      Cell.renderCheckboxCellByProp(params),
    );
  },

  /**
   * 展开行
   */
  renderExpandCell(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, isHidden, row, column, prefixCls } = params;

    const { reactData, internalData } = $table;
    const { isRowGroupStatus } = reactData;

    const { rowExpandedMaps, rowExpandLazyLoadedMaps } = internalData;

    const { computeExpandOpts } = $table.getComputeMaps();
    const expandOpts = computeExpandOpts.value;

    const {
      lazy,
      labelField,
      showIcon,
      visibleMethod,
      iconLoaded,
      iconOpen,
      iconClose,
    } = expandOpts;

    const { slots } = column;
    const defaultSlot = slots?.default;
    const iconSlot = slots?.icon;

    let isActive = false;
    let isLazyLoading = false;

    // 行分组聚合记录不支持展开
    if (isRowGroupStatus && row.isAggregate) {
      return renderCellBaseVNs(params, []);
    }

    // 自定义展开图标插槽
    if (iconSlot) {
      return renderCellBaseVNs(params, $table.callSlot(iconSlot, params));
    }

    if (!isHidden) {
      const rowid = getRowid($table, row);

      isActive = !!rowExpandedMaps[rowid];

      if (lazy) {
        isLazyLoading = !!rowExpandLazyLoadedMaps[rowid];
      }
    }

    const isVisible = showIcon && (!visibleMethod || visibleMethod(params));

    return renderCellBaseVNs(
      params,
      <>
        {isVisible ? (
          <div
            class={[
              `${prefixCls}--expanded`,
              {
                'is--active': isActive,
              },
            ]}
          >
            <span
              class={`${prefixCls}--expand-btn`}
              onClick={(evnt: MouseEvent) => {
                $table.triggerRowExpandEvent(evnt, params);
              }}
              onMousedown={(evnt: MouseEvent) => {
                evnt.stopPropagation();
              }}
            >
              {isLazyLoading
                ? renderIconVNode(iconLoaded, LoadingOutlined)
                : isActive
                  ? renderIconVNode(iconOpen, DownOutlined)
                  : renderIconVNode(iconClose, RightOutlined)}
            </span>
          </div>
        ) : (
          createCommentVNode()
        )}

        {defaultSlot || labelField ? (
          <div class={`${prefixCls}--expand-label`}>
            {defaultSlot
              ? $table.callSlot(defaultSlot, params)
              : get(row, labelField as string)}
          </div>
        ) : (
          createCommentVNode()
        )}
      </>,
    );
  },

  renderExpandData(
    params: AsTableRenderParams<AsTableDefines.CellRenderDataParams>,
  ) {
    const { $table, column } = params;
    const { slots, contentRender } = column;
    const contentSlot = slots ? slots.content : null;
    if (contentSlot) {
      return $table.callSlot(contentSlot, params);
    }
    if (contentRender) {
      const { computeRendererOpts } = $table.getComputeMaps();
      const rendererOpts = computeRendererOpts.value;
      const compConf = contentRender.name
        ? rendererOpts[contentRender.name] || renderer.get(contentRender.name)
        : null;
      if (compConf) {
        const rtExpand = compConf.renderTableExpand;
        if (rtExpand) {
          return getSlotVNs(rtExpand(contentRender, params));
        }
      }
    }
    return [];
  },
  /**
   * HTML 标签
   */
  renderHTMLCell(
    params: AsTableDefines.CellRenderBodyParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
    },
  ) {
    const { $table, column, prefixCls } = params;
    const { slots } = column;
    const defaultSlot = slots ? slots.default : null;
    if (defaultSlot) {
      return renderCellBaseVNs(params, $table.callSlot(defaultSlot, params));
    }
    return renderCellBaseVNs(params, [
      h('span', {
        class: `${prefixCls}-cell--html`,
        innerHTML: getDefaultCellLabel(params),
      }),
    ]);
  },
  renderDeepHTMLCell(
    params: AsTableDefines.CellRenderBodyParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
    },
  ) {
    return Cell.renderDeepNodeBtn(params, Cell.renderHTMLCell(params));
  },

  /**
   * 排序和筛选
   */
  renderSortAndFilterHeader(
    params: AsTableDefines.CellRenderHeaderParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
    },
  ) {
    return renderHeaderCellBaseVNs(
      params,
      Cell.renderHeaderTitle(params).concat(
        Cell.renderSortIcon(params).concat(Cell.renderFilterIcon(params)),
      ),
    );
  },

  /**
   * 排序
   */
  renderSortHeader(
    params: AsTableDefines.CellRenderHeaderParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
    },
  ) {
    return renderHeaderCellBaseVNs(
      params,
      Cell.renderHeaderTitle(params).concat(Cell.renderSortIcon(params)),
    );
  },
  renderSortIcon(
    params: AsTableDefines.CellRenderHeaderParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
      locale?: ComputedRef<any>;
    },
  ): VNode[] {
    const { $table, column, prefixCls, locale } = params;
    const { computeSortOpts } = $table.getComputeMaps();
    const sortOpts = computeSortOpts.value;
    const {
      showIcon,
      allowBtn,
      ascTitle,
      descTitle,
      iconLayout,
      iconAsc,
      iconDesc,
      iconVisibleMethod,
    } = sortOpts;
    const { order, slots } = column;
    if (
      showIcon !== false &&
      (!iconVisibleMethod || iconVisibleMethod(params))
    ) {
      const sortSlot = slots ? slots.sort : null;
      if (sortSlot) {
        return getSlotVNs($table.callSlot(sortSlot, params)) as VNode[];
      }
      const isAllowBtn = allowBtn !== false;
      const ascTitleText = eqNull(ascTitle)
        ? locale?.value?.sortAsc
        : `${ascTitle || ''}`;
      const descTitleText = eqNull(descTitle)
        ? locale?.value?.sortDesc
        : `${descTitle || ''}`;
      return [
        <span
          class={[
            `${prefixCls}-cell--sort`,
            `${prefixCls}-cell--sort-${iconLayout || 'vertical'}-layout`,
          ]}
          key="sort"
        >
          <span
            class={[
              `${prefixCls}-sort--asc-btn`,
              {
                'sort--active': order === 'asc',
              },
            ]}
            onClick={
              isAllowBtn
                ? (evnt: Event) => {
                    evnt.stopPropagation();
                    $table.triggerSortEvent(evnt, column, 'asc');
                  }
                : undefined
            }
            title={ascTitleText}
          >
            {renderIconVNode(iconAsc, CaretUpOutlined)}
          </span>
          <span
            class={[
              `${prefixCls}-sort--desc-btn`,
              {
                'sort--active': order === 'desc',
              },
            ]}
            onClick={
              isAllowBtn
                ? (evnt: Event) => {
                    evnt.stopPropagation();
                    $table.triggerSortEvent(evnt, column, 'desc');
                  }
                : undefined
            }
            title={descTitleText}
          >
            {renderIconVNode(iconDesc, CaretDownOutlined)}
          </span>
        </span>,
      ];
    }
    return [];
  },

  /**
   * 筛选
   */
  renderFilterHeader(
    params: AsTableDefines.CellRenderHeaderParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
    },
  ) {
    return renderHeaderCellBaseVNs(
      params,
      Cell.renderHeaderTitle(params).concat(Cell.renderFilterIcon(params)),
    );
  },
  renderFilterIcon(
    params: AsTableDefines.CellRenderHeaderParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
      locale?: ComputedRef<any>;
    },
  ): VNode[] {
    const { $table, column, prefixCls, hasFilter, locale } = params;
    const tableReactData = $table.reactData;
    const { filterStore } = tableReactData;
    const { computeFilterOpts } = $table.getComputeMaps();
    const filterOpts = computeFilterOpts.value;
    const { showIcon, iconNone, iconMatch, iconVisibleMethod } = filterOpts;
    // eslint-disable-next-line unicorn/prefer-minimal-ternary
    const filterIcon = hasFilter
      ? renderIconVNode(iconMatch, FilterFilled)
      : renderIconVNode(iconNone, FilterFilled);
    if (
      showIcon !== false &&
      (!iconVisibleMethod || iconVisibleMethod(params))
    ) {
      return [
        <span
          class={[
            `${prefixCls}-cell--filter`,
            {
              'is--active':
                filterStore.visible && filterStore.column === column,
            },
          ]}
          key="filter"
          onClick={(evnt: MouseEvent) => {
            $table.triggerFilterEvent(evnt, column, params);
          }}
          title={locale?.value?.filter}
        >
          {filterIcon}
        </span>,
      ];
    }
    return [];
  },

  /**
   * 可编辑
   */
  renderEditHeader(
    params: AsTableDefines.CellRenderHeaderParams & {
      $table: AsTableConstructor & AsTablePrivateMethods;
    },
  ) {
    const { $table, column, prefixCls } = params;
    const tableProps = $table.props;
    const { computeEditOpts } = $table.getComputeMaps();
    const { editConfig, editRules } = tableProps;
    const editOpts = computeEditOpts.value;
    const { sortable, filters, editRender } = column;
    const isEnableEdit = editConfig && isEnableConf(editConfig);
    const editRenderOpts =
      isEnableEdit && isEnableConf(editRender) ? editRender : null;
    let isRequired = false;
    if (editRules) {
      const columnRules = column.rules ?? get(editRules, column.field);
      if (columnRules) {
        isRequired = columnRules.some((rule) => rule.required);
      }
    }
    let editIconVNs: VNode[] = [];
    if (isEnableEdit) {
      const { showAsterisk, showIcon, icon } = editOpts;
      editIconVNs = [
        isRequired && showAsterisk !== false ? (
          <span class={`${prefixCls}-cell--required-icon`} key="required">
            <i />
          </span>
        ) : (
          createCommentVNode()
        ),
        editRenderOpts && showIcon !== false ? (
          <span class={`${prefixCls}-cell--edit-icon`} key="edit">
            {typeof icon === 'function'
              ? getSlotVNs(icon({}))
              : renderIconVNode(icon, FormOutlined)}
          </span>
        ) : (
          createCommentVNode()
        ),
      ];
    }
    return renderHeaderCellBaseVNs(
      params,
      editIconVNs
        .concat(Cell.renderHeaderTitle(params))
        .concat(sortable ? Cell.renderSortIcon(params) : [])
        .concat(filters ? Cell.renderFilterIcon(params) : []),
    );
  },
  // 行格编辑模式
  renderRowEdit(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, column } = params;
    const tableProps = $table.props;
    const { editConfig } = tableProps;
    const tableReactData = $table.reactData;
    const { editStore } = tableReactData;
    const { actived } = editStore;
    const { editRender } = column;
    const isEnableEdit = editConfig && isEnableConf(editConfig);
    const editRenderOpts =
      isEnableEdit && isEnableConf(editRender) ? editRender : null;
    return Cell.runRenderer(
      params,
      !!(editRenderOpts && actived && actived.row === params.row),
    );
  },
  renderDeepRowEdit(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    return Cell.renderDeepNodeBtn(
      params,
      Cell.renderRowEdit(params) as VNode[],
    );
  },
  // 单元格编辑模式
  renderCellEdit(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    const { $table, column } = params;
    const tableProps = $table.props;
    const { editConfig } = tableProps;
    const tableReactData = $table.reactData;
    const { editStore } = tableReactData;
    const { actived } = editStore;
    const { editRender } = column;
    const isEnableEdit = editConfig && isEnableConf(editConfig);
    const editRenderOpts =
      isEnableEdit && isEnableConf(editRender) ? editRender : null;
    return Cell.runRenderer(
      params,
      !!(
        editRenderOpts &&
        actived &&
        actived.row === params.row &&
        actived.column === params.column
      ),
    );
  },
  renderDeepCellEdit(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
  ) {
    return Cell.renderDeepNodeBtn(
      params,
      Cell.renderCellEdit(params) as VNode[],
    );
  },
  runRenderer(
    params: AsTableRenderParams<AsTableDefines.CellRenderBodyParams>,
    isEdit: boolean,
  ) {
    const { $table, row, column, prefixCls } = params;
    const tableProps = $table.props;
    const { editConfig } = tableProps;
    const tableReactData = $table.reactData;
    const { isRowGroupStatus } = tableReactData;
    const { slots, field, editRender, formatter } = column;
    const isEnableEdit = editConfig && isEnableConf(editConfig);
    const editRenderOpts =
      isEnableEdit && isEnableConf(editRender) ? editRender : null;
    const defaultSlot = slots ? slots.default : null;
    const gcSlot = slots ? slots.groupContent || slots['group-content'] : null;
    const editSlot = slots ? slots.edit : null;
    const cellParams = Object.assign({ $type: '', isEdit }, params);
    if (isEdit && editRenderOpts) {
      cellParams.$type = 'edit';
      if (editSlot) {
        return $table.callSlot(editSlot, cellParams);
      }
      const { computeRendererOpts } = $table.getComputeMaps();
      const rendererOpts = computeRendererOpts.value;
      const compConf = editRenderOpts.name
        ? rendererOpts[editRenderOpts.name] || renderer.get(editRenderOpts.name)
        : null;
      const rtEdit = compConf ? compConf.renderTableEdit : null;
      if (rtEdit) {
        return getSlotVNs(rtEdit(editRenderOpts, cellParams));
      }
      return [];
    }

    if (isRowGroupStatus && field && row.isAggregate) {
      const aggRow: AsTableDefines.AggregateRowInfo = row;
      const { computeAggregateOpts } = $table.getComputeMaps();
      const aggregateOpts = computeAggregateOpts.value;
      const { mapChildrenField } = aggregateOpts;
      const groupField = aggRow.groupField;
      const groupContent = aggRow.groupContent;
      const childList = mapChildrenField ? aggRow[mapChildrenField] || [] : [];
      const childCount = aggRow.childCount;
      if (gcSlot) {
        return renderCellBaseVNs(
          params,
          $table.callSlot(
            gcSlot,
            Object.assign(
              { groupField, groupContent, childList, childCount },
              params,
            ),
          ),
        );
      }
    } else if (defaultSlot) {
      return renderCellBaseVNs(
        params,
        $table.callSlot(defaultSlot, cellParams),
      );
    }

    if (formatter) {
      return renderCellBaseVNs(params, [
        <span class={`${prefixCls}-cell--label`}>
          {getDefaultCellLabel(cellParams)}
        </span>,
      ]);
    }
    return Cell.renderDefaultCell(cellParams);
  },
};

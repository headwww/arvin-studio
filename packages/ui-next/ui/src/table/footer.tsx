import type { PropType, Ref } from 'vue';

import type {
  AsTableConstructor,
  AsTableDefines,
  AsTableMethods,
  AsTablePrivateMethods,
  AsTablePropTypes,
} from './types/table';

import {
  createCommentVNode,
  defineComponent,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';

import { isBoolean, isFunction } from '@arvin-studio/kit';

import { ArvinStudio } from '..';
import { getPropClass, updateCellTitle } from '../_util/dom';
import { getCalcHeight, getDefaultConfig } from './util';

const sourceType = 'table';
const renderType = 'footer';

const { renderer } = ArvinStudio;

export default defineComponent({
  name: 'AsTableFooter',
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    footerTableData: {
      type: Array as PropType<any[][]>,
      default: () => [],
    },
    tableColumn: {
      type: Array as PropType<AsTableDefines.ColumnInfo[]>,
      default: () => [],
    },
    fixedColumn: {
      type: Array as PropType<AsTableDefines.ColumnInfo[]>,
      default: () => [],
    },
    fixedType: {
      type: String as PropType<'' | 'left' | 'right'>,
      default: null,
    },
    size: {
      type: String as PropType<AsTablePropTypes.Size>,
      default: 'medium',
    },
  },
  setup(props) {
    const $asTable = inject(
      '$asTable',
      {} as AsTableConstructor & AsTableMethods & AsTablePrivateMethods,
    );

    const {
      xID,
      props: tableProps,
      internalData: tableInternalData,
      reactData: tableReactData,
    } = $asTable;

    const {
      computeFooterTooltipOpts,
      computeColumnOpts,
      computeCellOpts,
      computeFooterCellOpts,
      computeDefaultRowHeight,
      computeResizableOpts,
      computeVirtualXOpts,
      computeIsFooterRenderOptimize,
      computeRendererOpts,
    } = $asTable.getComputeMaps();

    const refElem = ref() as Ref<HTMLDivElement>;
    const refFooterScroll = ref() as Ref<HTMLDivElement>;
    const refFooterTable = ref() as Ref<HTMLTableElement>;
    const refFooterColgroup = ref() as Ref<HTMLTableColElement>;
    const refFooterTFoot = ref() as Ref<HTMLTableSectionElement>;
    const refFooterXSpace = ref() as Ref<HTMLDivElement>;

    const renderRows = (
      isOptimizeMode: boolean,
      tableColumn: AsTableDefines.ColumnInfo[],
      row: any,
      $rowIndex: number,
      _rowIndex: number,
    ) => {
      const { prefixCls, size, fixedType } = props;
      const {
        fullColumnIdData,
        mergeFooterList,
        mergeFooterCellMaps,
        scrollXStore,
        currentCol,
      } = tableInternalData;
      const rendererOpts = computeRendererOpts.value;
      const {
        border,
        footerCellClassName,
        footerCellStyle,
        footerAlign: allFooterAlign,
        footerSpanMethod,
        align: allAlign,
        showFooterOverflow: allColumnFooterOverflow,
      } = tableProps;
      const {
        scrollXLoad,
        scrollYLoad,
        overflowX,
        mergeFootFlag,
        currColFlag,
      } = tableReactData;

      const virtualXOpts = computeVirtualXOpts.value;
      const footerTooltipOpts = computeFooterTooltipOpts.value;
      const resizableOpts = computeResizableOpts.value;
      const { isAllColumnDrag } = resizableOpts;
      const cellOpts = computeCellOpts.value;
      const footerCellOpts = computeFooterCellOpts.value;
      const columnOpts = computeColumnOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;

      const currCellHeight =
        getCalcHeight(footerCellOpts.height) || defaultRowHeight;

      return tableColumn.map((column, $columnIndex) => {
        const {
          type,
          showFooterOverflow,
          footerAlign,
          align,
          footerClassName,
          editRender,
          cellRender,
        } = column;
        const colid = column.id;
        const colRest =
          fullColumnIdData[colid] || ({} as AsTableDefines.ColumnCacheItem);
        const renderOpts = editRender || cellRender;
        const compConf =
          renderOpts && renderOpts.name
            ? rendererOpts[renderOpts.name] || renderer.get(renderOpts.name)
            : null;
        const showAllTip = footerTooltipOpts.showAll;
        const fixedHiddenColumn =
          overflowX &&
          (fixedType ? column.fixed !== fixedType : !!column.fixed);

        const cellPadding = getDefaultConfig(
          footerCellOpts.padding,
          cellOpts.padding,
        );
        const isAllCellPadding = cellPadding === true;
        const isCellPaddingTop = cellPadding
          ? isAllCellPadding || cellPadding.top !== false
          : false;
        const isCellPaddingBottom = cellPadding
          ? isAllCellPadding || cellPadding.bottom !== false
          : false;
        const isCellPaddingLeft = cellPadding
          ? isAllCellPadding || cellPadding.left !== false
          : false;
        const isCellPaddingRight = cellPadding
          ? isAllCellPadding || cellPadding.right !== false
          : false;

        const footOverflow = getDefaultConfig(
          showFooterOverflow,
          allColumnFooterOverflow,
        );
        const footAlign =
          footerAlign ||
          (compConf ? compConf.tableFooterCellAlign : '') ||
          allFooterAlign ||
          align ||
          (compConf ? compConf.tableCellAlign : '') ||
          allAlign;
        const showEllipsis =
          (footOverflow === true ? footerTooltipOpts.mode : footOverflow) ===
          'ellipsis';
        const showTitle =
          (footOverflow === true ? footerTooltipOpts.mode : footOverflow) ===
          'title';
        const showTooltip =
          (footOverflow === true ? footerTooltipOpts.mode : footOverflow) ===
          'tooltip';
        const hasEllipsis = showTitle || showTooltip || showEllipsis;
        const showResizable = isBoolean(column.resizable)
          ? column.resizable
          : columnOpts.resizable;
        const attrs: any = { colid };
        const tfOns: any = {};
        const columnIndex = colRest.index;
        const _columnIndex = colRest._index;
        const itemIndex = _columnIndex;
        const cellParams: AsTableDefines.CellRenderFooterParams & {
          $table: AsTableConstructor<any> & AsTablePrivateMethods;
        } = {
          $table: $asTable,
          // TODO $gantt: $xeGantt,
          row,
          rowIndex: _rowIndex,
          _rowIndex,
          $rowIndex,
          column,
          columnIndex,
          $columnIndex,
          _columnIndex,
          itemIndex,
          items: row,
          fixed: fixedType,
          source: sourceType,
          type: renderType,
          prefixCls,
        };
        if (showTitle || showTooltip || showAllTip) {
          tfOns.onMouseenter = (evnt: MouseEvent) => {
            if (showTitle) {
              updateCellTitle(evnt.currentTarget, column);
            } else if (showTooltip || showAllTip) {
              $asTable.triggerFooterTooltipEvent(evnt, cellParams);
            }
          };
        }
        if (showTooltip || showAllTip) {
          tfOns.onMouseleave = (evnt: MouseEvent) => {
            if (showTooltip || showAllTip) {
              $asTable.handleTargetLeaveEvent(evnt);
            }
          };
        }
        tfOns.onClick = (evnt: MouseEvent) => {
          $asTable.triggerFooterCellClickEvent(evnt, cellParams);
        };
        tfOns.onDblclick = (evnt: MouseEvent) => {
          $asTable.triggerFooterCellDblclickEvent(evnt, cellParams);
        };
        let isMergeCell = false;
        // 合并行或列
        if (mergeFootFlag && mergeFooterList.length > 0) {
          const spanRest = mergeFooterCellMaps[`${_rowIndex}:${_columnIndex}`];
          if (spanRest) {
            const { rowspan, colspan } = spanRest;
            if (!rowspan || !colspan) {
              return null;
            }
            if (rowspan > 1) {
              isMergeCell = true;
              attrs.rowspan = rowspan;
            }
            if (colspan > 1) {
              isMergeCell = true;
              attrs.colspan = colspan;
            }
          }
        } else if (footerSpanMethod) {
          // 自定义合并方法
          const { rowspan = 1, colspan = 1 } =
            footerSpanMethod(cellParams) || {};
          if (!rowspan || !colspan) {
            return null;
          }
          if (rowspan > 1) {
            attrs.rowspan = rowspan;
          }
          if (colspan > 1) {
            attrs.colspan = colspan;
          }
        }
        const isLastColumn = $columnIndex === tableColumn.length - 1;
        const isAutoCellWidth =
          !column.resizeWidth &&
          (column.minWidth === 'auto' || column.width === 'auto');

        // oxlint-disable-next-line no-unused-vars
        let isVNPreEmptyStatus = false;
        // eslint-disable-next-line unicorn/prefer-ternary
        if (
          isOptimizeMode &&
          overflowX &&
          !isMergeCell &&
          scrollXLoad &&
          tableColumn.length > 10 &&
          !column.fixed &&
          !virtualXOpts.immediate &&
          (_columnIndex <
            scrollXStore.visibleStartIndex - scrollXStore.preloadSize ||
            _columnIndex >
              scrollXStore.visibleEndIndex + scrollXStore.preloadSize)
        ) {
          isVNPreEmptyStatus = true;
        }

        const tcStyle: Record<string, string> = {};
        if (hasEllipsis) {
          tcStyle.height = `${currCellHeight}px`;
        } else {
          tcStyle.minHeight = `${currCellHeight}px`;
        }

        return (
          <td
            class={[
              `${prefixCls}--column`,
              `${prefixCls}-footer--column`,
              `size--${size}`,
              column.id,
              {
                [`col--${footAlign}`]: footAlign,
                [`col--${type}`]: type,
                'col--last': isLastColumn,
                'fixed--width': !isAutoCellWidth,
                'fixed--hidden': fixedHiddenColumn,
                'is--pg-top': isCellPaddingTop,
                'is--pg-bottom': isCellPaddingBottom,
                'is--pg-left': isCellPaddingLeft,
                'is--pg-right': isCellPaddingRight,
                'col--ellipsis': hasEllipsis,
                'col--current': currColFlag && currentCol === column,
              },
              getPropClass(footerClassName, cellParams),
              getPropClass(footerCellClassName, cellParams),
            ]}
            {...attrs}
            style={
              footerCellStyle
                ? isFunction(footerCellStyle)
                  ? footerCellStyle(cellParams)
                  : footerCellStyle
                : null
            }
            {...tfOns}
            key={
              scrollXLoad || scrollYLoad || columnOpts.useKey || columnOpts.drag
                ? column.id
                : $columnIndex
            }
          >
            <div
              class={[
                `${prefixCls}-cell`,
                {
                  'c--title': showTitle,
                  'c--tooltip': showTooltip,
                  'c--ellipsis': showEllipsis,
                },
              ]}
              style={tcStyle}
            >
              {isVNPreEmptyStatus ? (
                []
              ) : (
                <div
                  class={[
                    `${prefixCls}-cell--wrapper`,
                    `${prefixCls}-footer-cell--wrapper`,
                  ]}
                  colid={colid}
                >
                  {column.renderFooter(cellParams)}
                </div>
              )}
              {!fixedHiddenColumn && showResizable && isAllColumnDrag ? (
                <div
                  class={[
                    `${prefixCls}-cell--col-resizable`,
                    {
                      'is--line': !border || border === 'none',
                    },
                  ]}
                  onDblclick={(evnt: MouseEvent) =>
                    $asTable.handleColResizeDblclickEvent(evnt, cellParams)
                  }
                  onMousedown={(evnt: MouseEvent) =>
                    $asTable.handleColResizeMousedownEvent(
                      evnt,
                      fixedType,
                      cellParams,
                    )
                  }
                ></div>
              ) : (
                createCommentVNode()
              )}
            </div>
          </td>
        );
      });
    };

    const renderHeads = (
      isOptimizeMode: boolean,
      renderColumnList: AsTableDefines.ColumnInfo[],
    ) => {
      const { fixedType, footerTableData, prefixCls } = props;

      const { footerRowClassName, footerRowStyle } = tableProps;

      return footerTableData.map((row, _rowIndex) => {
        const $rowIndex = _rowIndex;
        const rowParams = {
          $table: $asTable,
          row,
          rowIndex: _rowIndex,
          _rowIndex,
          $rowIndex,
          fixed: fixedType,
          type: renderType,
        };

        return (
          <tr
            class={[
              `${prefixCls}-footer--row`,
              footerRowClassName
                ? isFunction(footerRowClassName)
                  ? footerRowClassName(rowParams)
                  : footerRowClassName
                : '',
            ]}
            key={_rowIndex}
            style={
              footerRowStyle
                ? isFunction(footerRowStyle)
                  ? footerRowStyle(rowParams)
                  : (footerRowStyle as any)
                : null
            }
          >
            {renderRows(
              isOptimizeMode,
              renderColumnList,
              row,
              _rowIndex,
              _rowIndex,
            )}
          </tr>
        );
      });
    };
    const renderVN = () => {
      const { prefixCls, fixedType, tableColumn, fixedColumn } = props;
      const { visibleColumn, fullColumnIdData } = tableInternalData;
      const { isGroup, isColLoading, overflowX, scrollXLoad, dragCol } =
        tableReactData;

      const isFooterRenderOptimize = computeIsFooterRenderOptimize.value;

      let renderColumnList = tableColumn;
      const isOptimizeMode = isFooterRenderOptimize;

      if (!isOptimizeMode || (!isColLoading && (fixedType || !overflowX))) {
        renderColumnList = visibleColumn;
      }

      if (fixedType && isOptimizeMode) {
        renderColumnList = fixedColumn || [];
      }

      // 列拖拽
      if (
        !fixedType &&
        !isGroup &&
        scrollXLoad &&
        dragCol &&
        renderColumnList.length > 2
      ) {
        const dCowRest = fullColumnIdData[dragCol.id];
        if (dCowRest) {
          const dcIndex = dCowRest._index;
          const firstCol = renderColumnList[0];
          const lastCol = renderColumnList[renderColumnList.length - 1];
          const firstColRest = fullColumnIdData[firstCol!.id];
          const lastColRest = fullColumnIdData[lastCol!.id];
          if (firstColRest && lastColRest) {
            const fcIndex = firstColRest._index;
            const lcIndex = lastColRest._index;
            if (dcIndex < fcIndex) {
              renderColumnList = [dragCol].concat(renderColumnList);
            } else if (dcIndex > lcIndex) {
              renderColumnList = renderColumnList.concat([dragCol]);
            }
          }
        }
      }

      return (
        <div
          class={[
            `${prefixCls}--footer-wrapper`,
            fixedType ? `fixed-${fixedType}--wrapper` : 'body--wrapper',
          ]}
          ref={refElem}
          xid={xID}
        >
          <div
            class={`${prefixCls}--footer-inner-wrapper`}
            onScroll={(event) => {
              $asTable.triggerFooterScrollEvent(event, fixedType);
            }}
            ref={refFooterScroll}
          >
            {fixedType ? (
              createCommentVNode()
            ) : (
              <div
                class={`${prefixCls}-body--x-space`}
                ref={refFooterXSpace}
              ></div>
            )}
            <table
              border={0}
              cellpadding={0}
              cellspacing={0}
              class={`${prefixCls}--footer`}
              ref={refFooterTable}
              xid={xID}
              xvm={isOptimizeMode ? '1' : null}
            >
              <colgroup ref={refFooterColgroup}>
                {renderColumnList.map((column, $columnIndex) => {
                  return (
                    <col
                      key={$columnIndex}
                      name={column.id}
                      style={{
                        width: `${column.renderWidth}px`,
                      }}
                    />
                  );
                })}
              </colgroup>
              <tfoot ref={refFooterTFoot}>
                {renderHeads(isOptimizeMode, renderColumnList)}
              </tfoot>
            </table>
          </div>
        </div>
      );
    };

    onMounted(() => {
      nextTick(() => {
        const { fixedType } = props;
        const { elemStore } = tableInternalData;
        const prefix = `${fixedType || 'main'}-footer-`;
        elemStore[`${prefix}wrapper`] = refElem;
        elemStore[`${prefix}scroll`] = refFooterScroll;
        elemStore[`${prefix}table`] = refFooterTable;
        elemStore[`${prefix}colgroup`] = refFooterColgroup;
        elemStore[`${prefix}list`] = refFooterTFoot;
        elemStore[`${prefix}xSpace`] = refFooterXSpace;
      });
    });

    onUnmounted(() => {
      const { fixedType } = props;
      const { elemStore } = tableInternalData;
      const prefix = `${fixedType || 'main'}-footer-`;
      elemStore[`${prefix}wrapper`] = null;
      elemStore[`${prefix}scroll`] = null;
      elemStore[`${prefix}table`] = null;
      elemStore[`${prefix}colgroup`] = null;
      elemStore[`${prefix}list`] = null;
      elemStore[`${prefix}xSpace`] = null;
    });
    return renderVN;
  },
});

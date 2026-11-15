import type { Ref } from 'vue';

import type { AsComponentSlotType } from './types/common';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePrivateMethods,
  AsTablePropTypes,
} from './types/table';

import {
  createCommentVNode,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';

import { clsx, eqNull, isBoolean, isFunction } from '@arvin-studio/kit';

import { ArvinStudio } from '..';
import { getPropClass, updateCellTitle } from '../_util/dom';
import { getSlotVNs } from '../_util/vn';
import enUS from '../locale/en_US';
import useLocale from '../locale/useLocale';
import {
  createHandleGetRowId,
  getCellRestHeight,
  getDefaultConfig,
  getRowid,
  isEnableConf,
} from './util';

export interface BodyProps {
  fixedColumn?: AsTableDefines.ColumnInfo[];
  fixedType: '' | 'left' | 'right';
  prefixCls: string;
  size: AsTablePropTypes.Size;
  tableColumn?: AsTableDefines.ColumnInfo[];
  tableData?: any[];
}

const defaults = {
  size: 'medium',
  fixedType: '',
} as BodyProps;

const renderType = 'body';
const sourceType = 'table';

const { renderer } = ArvinStudio;
export default defineComponent<BodyProps>(
  (props = defaults) => {
    const [locale] = useLocale('Table', enUS.Table);

    const $asTable = inject(
      '$asTable',
      {} as AsTableConstructor & AsTablePrivateMethods,
    );

    const {
      xID,
      props: tableProps,
      context: tableContext,
      reactData: tableReactData,
      internalData: tableInternalData,
    } = $asTable;

    const {
      computeEditOpts,
      computeCellOpts,
      computeIsBodyRenderOptimize,
      computeRendererOpts,
      computeEmptyOpts,
      computeMouseOpts,
      computeRowOpts,
      computeTreeOpts,
      computeRadioOpts,
      computeCheckboxOpts,
      computeColumnOpts,
      computeExpandOpts,
      computeTooltipOpts,
      computeVirtualXOpts,
      computeVirtualYOpts,
      computeValidOpts,
      computeResizableOpts,
      computeAreaOpts,
      computeRowDragOpts,
      computeDefaultRowHeight,
      computeCellOffsetWidth,
    } = $asTable.getComputeMaps();

    const refElem = ref() as Ref<HTMLDivElement>;
    const refBodyScroll = ref() as Ref<HTMLDivElement>;
    const refBodyTable = ref() as Ref<HTMLTableElement>;
    const refBodyColgroup = ref() as Ref<HTMLTableColElement>;
    const refBodyTBody = ref() as Ref<HTMLTableSectionElement>;
    const refBodyXSpace = ref() as Ref<HTMLDivElement>;
    const refBodyYSpace = ref() as Ref<HTMLDivElement>;
    const refBodyEmptyBlock = ref() as Ref<HTMLDivElement>;

    const { prefixCls } = props;

    // 滚动、拖动过程中不需要触发
    const isVMScrollProcess = () => {
      const { isDragResize } = tableReactData;
      return !!isDragResize;
    };

    const renderLine = (
      rowid: string,
      params: AsTableDefines.CellRenderBodyParams,
      cellHeight: number,
    ) => {
      const { column } = params;
      const { treeConfig } = tableProps;
      const treeOpts = computeTreeOpts.value;
      const { slots, treeNode } = column;
      const { fullAllDataRowIdData } = tableInternalData;
      const cellOpts = computeCellOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;

      if (treeConfig && treeNode && treeOpts.showLine) {
        if (slots && (slots as any).line) {
          return $asTable.callSlot((slots as any).line, params);
        }
        const rowRest = fullAllDataRowIdData[rowid];
        let rLevel = 0;
        let prevRow = null;
        let parentRow = null;
        let lineHeight = '';
        if (rowRest) {
          rLevel = rowRest.level;
          prevRow = rowRest.items[rowRest.treeIndex - 1];
          parentRow = rowRest.parent;
        }
        if (!rLevel && !treeOpts.showRootLine) {
          return [];
        }
        if (prevRow) {
          const prevRowRest =
            fullAllDataRowIdData[getRowid($asTable, prevRow)] ||
            ({} as AsTableDefines.RowCacheItem);
          lineHeight = `${prevRowRest.lineHeight || 0}px`;
        } else if (rLevel && parentRow) {
          const parentRowRest =
            fullAllDataRowIdData[getRowid($asTable, parentRow)] ||
            ({} as AsTableDefines.RowCacheItem);
          lineHeight = `calc(-1em + ${Math.floor(cellHeight / 2 + getCellRestHeight(parentRowRest, cellOpts, defaultRowHeight) / 2)}px)`;
        }
        return [
          <div class={`${prefixCls}-tree--line-wrapper`} key="tl">
            <div
              class={`${prefixCls}-tree--line`}
              style={{
                height: lineHeight,
                bottom: `-${Math.floor(cellHeight / 2)}px`,
                left: `calc(${rLevel * treeOpts.indent}px + 1em)`,
              }}
            ></div>
          </div>,
        ];
      }
      return [];
    };

    const renderTdColumn = (
      seq: number | string,
      rowid: string,
      fixedType: '' | 'left' | 'right',
      isOptimizeMode: boolean,
      rowLevel: number,
      row: any,
      rowIndex: number,
      $rowIndex: number,
      _rowIndex: number,
      column: AsTableDefines.ColumnInfo,
      $columnIndex: number,
      columns: AsTableDefines.ColumnInfo[],
      items: any[],
    ) => {
      const {
        showOverflow: allShowOverflow,
        treeConfig,
        editRules,
        editConfig,
        cellClassName: allCellClassName,
        mouseConfig,
        cellStyle,
        align: allAlign,
        tooltipConfig,
        spanMethod,
      } = tableProps;
      const {
        tableData,
        tableColumn,
        dragRow,
        overflowX,
        overflowY,
        scrollXLoad,
        scrollYLoad,
        isAllOverflow,
        validErrorMaps,
        calcCellHeightFlag,
        resizeHeightFlag,
        currColFlag,
        editStore,
        mergeBodyFlag,
        resizeWidthFlag,
      } = tableReactData;
      const {
        scrollYStore,
        scrollXStore,
        fullColumnIdData,
        afterFullData,
        fullAllDataRowIdData,
        currentCol,
        keepUpdateFieldMaps,
        mergeBodyList,
        mergeBodyCellMaps,
        visibleColumn,
      } = tableInternalData;
      const {
        field,
        align,
        cellRender,
        editRender,
        showOverflow,
        slots,
        border,
        rowResize,
        verticalAlign,
        type,
        treeNode,
        className,
        padding,
      } = column;

      const columnOpts = computeColumnOpts.value;
      const validOpts = computeValidOpts.value;
      const cellOpts = computeCellOpts.value;
      const tooltipOpts = computeTooltipOpts.value;
      const virtualXOpts = computeVirtualXOpts.value;
      const virtualYOpts = computeVirtualYOpts.value;
      const resizableOpts = computeResizableOpts.value;
      const rendererOpts = computeRendererOpts.value;
      const mouseOpts = computeMouseOpts.value;
      const areaOpts = computeAreaOpts.value;
      const rowDragOpts = computeRowDragOpts.value;
      const editOpts = computeEditOpts.value;
      const checkboxOpts = computeCheckboxOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;
      const cellOffsetWidth = computeCellOffsetWidth.value;

      const {
        maxHeight,
        verticalAlign: allVerticalAlign,
        minHeight,
      } = cellOpts;
      const {
        disabledMethod: dragDisabledMethod,
        isCrossDrag,
        isPeerDrag,
      } = rowDragOpts;
      const { selectCellToRow } = areaOpts;
      const { isAllColumnDrag, isAllRowDrag } = resizableOpts;
      const { actived } = editStore;
      const rowOpts = computeRowOpts.value;
      const rowRest =
        fullAllDataRowIdData[rowid] || ({} as AsTableDefines.RowCacheItem);

      const colid = column.id;
      const colRest =
        fullColumnIdData[colid] || ({} as AsTableDefines.ColumnCacheItem);
      const customCellHeight = calcCellHeightFlag ? cellOpts.height : 0;
      const showAllTip = tooltipOpts.showAll;
      const columnIndex = colRest.index;
      const _columnIndex = colRest._index;
      const renderOpts = editRender || cellRender;
      const compConf =
        renderOpts && renderOpts.name
          ? rendererOpts[renderOpts.name] || renderer.get(renderOpts.name)
          : null;
      const compCellClassName = compConf ? compConf.tableCellClassName : null;
      const compCellStyle = compConf ? compConf.tableCellStyle : '';
      const isEdit = isEnableConf(editRender);
      const resizeHeight = resizeHeightFlag ? rowRest.resizeHeight : 0;
      // 这个格子是否「属于别的面板、在本实例里要被遮掉」。
      let fixedHiddenColumn =
        overflowX && (fixedType ? column.fixed !== fixedType : !!column.fixed);

      const cellOverflow = getDefaultConfig(showOverflow, allShowOverflow);
      const showEllipsis =
        (cellOverflow === true ? tooltipOpts.mode : cellOverflow) ===
        'ellipsis';
      const showTitle =
        (cellOverflow === true ? tooltipOpts.mode : cellOverflow) === 'title';
      const showTooltip =
        (cellOverflow === true ? tooltipOpts.mode : cellOverflow) === 'tooltip';
      const hasEllipsis =
        isAllOverflow || showTitle || showTooltip || showEllipsis;
      const isCsHeight = !!customCellHeight;
      const isRsHeight = resizeHeight > 0;
      let isDirty;

      const cellPadding = getDefaultConfig(padding, cellOpts.padding);
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

      const showResizable = isBoolean(column.resizable)
        ? column.resizable
        : columnOpts.resizable;

      const cellVerticalAlign = eqNull(verticalAlign)
        ? allVerticalAlign
        : verticalAlign;
      const cellAlign =
        align || (compConf ? compConf.tableCellAlign : '') || allAlign;
      const errorValidItem = validErrorMaps[`${rowid}:${colid}`];
      const showValidTip = editRules && validOpts.showErrorMessage;
      const tdAttrs: any = { colid };
      const cellParams = {
        $table: $asTable,
        // TODO $grid: $xeGrid,
        // $gantt: $xeGantt,
        isEdit: false,
        seq,
        rowid,
        row,
        rowIndex,
        $rowIndex,
        _rowIndex,
        column,
        prefixCls,
        columnIndex,
        $columnIndex,
        _columnIndex,
        fixed: fixedType,
        source: sourceType,
        type: renderType,
        isHidden: !!fixedHiddenColumn,
        level: rowLevel,
        visibleData: afterFullData,
        data: tableData,
        items,
      };

      let isRowDragCell = false;
      let isDisabledDrag = false;
      if (rowOpts.drag) {
        isRowDragCell =
          rowDragOpts.trigger === 'row' ||
          (column.dragSort && rowDragOpts.trigger === 'cell');
      }
      if (isRowDragCell) {
        isDisabledDrag = !!(
          dragDisabledMethod && dragDisabledMethod(cellParams)
        );
      }

      const tdOns: any = {};
      // hover 进入事件
      if (showTitle || showTooltip || showAllTip || tooltipConfig) {
        tdOns.onMouseover = (evnt: MouseEvent) => {
          if (!isVMScrollProcess()) {
            if (showTitle) {
              updateCellTitle(evnt.currentTarget, column);
            } else if (showTooltip || showAllTip) {
              // 如果配置了显示 tooltip
              $asTable.triggerBodyTooltipEvent(evnt, cellParams);
            }
          }
          $asTable.dispatchEvent(
            'cell-mouseenter',
            Object.assign({ cell: evnt.currentTarget }, cellParams),
            evnt,
          );
        };
      }
      // hover 退出事件
      if (showTooltip || showAllTip || tooltipConfig) {
        tdOns.onMouseleave = (evnt: MouseEvent) => {
          if (!isVMScrollProcess() && (showTooltip || showAllTip)) {
            $asTable.handleTargetLeaveEvent(evnt);
          }
          $asTable.dispatchEvent(
            'cell-mouseleave',
            Object.assign({ cell: evnt.currentTarget }, cellParams),
            evnt,
          );
        };
      }

      // 按下事件处理
      if (isRowDragCell || checkboxOpts.range || mouseConfig) {
        tdOns.onMousedown = (evnt: MouseEvent) => {
          $asTable.triggerCellMousedownEvent(evnt, cellParams);
        };
      }

      // 拖拽列事件
      if (isRowDragCell) {
        tdOns.onMouseup = $asTable.triggerCellMouseupEvent;
      }

      // 点击事件处理
      tdOns.onClick = (evnt: MouseEvent) => {
        $asTable.triggerCellClickEvent(evnt, cellParams);
      };

      // 双击事件处理
      tdOns.onDblclick = (evnt: MouseEvent) => {
        $asTable.triggerCellDblclickEvent(evnt, cellParams);
      };

      let isMergeCell = false;
      let mergeColspan = 1;
      let mergeRowspan = 1;
      // 合并行或列
      if (mergeBodyFlag && mergeBodyList.length > 0) {
        const spanRest = mergeBodyCellMaps[`${_rowIndex}:${_columnIndex}`];
        if (spanRest) {
          const { rowspan, colspan } = spanRest;
          if (!rowspan || !colspan) {
            return createCommentVNode();
          }
          if (rowspan > 1) {
            isMergeCell = true;
            mergeRowspan = rowspan;
            tdAttrs.rowspan = rowspan;
          }
          if (colspan > 1) {
            isMergeCell = true;
            mergeColspan = colspan;
            tdAttrs.colspan = colspan;
          }
        }
      } else if (spanMethod) {
        // 自定义合并行或列的方法
        const { rowspan = 1, colspan = 1 } = spanMethod(cellParams) || {};
        if (!rowspan || !colspan) {
          return createCommentVNode();
        }
        if (rowspan > 1) {
          isMergeCell = true;
          mergeRowspan = rowspan;
          tdAttrs.rowspan = rowspan;
        }
        if (colspan > 1) {
          isMergeCell = true;
          mergeColspan = colspan;
          tdAttrs.colspan = colspan;
        }
      }
      // 如果被合并不可隐藏
      if (
        fixedHiddenColumn &&
        isMergeCell &&
        (tdAttrs.colspan > 1 || tdAttrs.rowspan > 1)
      ) {
        fixedHiddenColumn = false;
      }

      // 如果编辑列开启显示状态
      if (
        !fixedHiddenColumn &&
        editConfig &&
        (editOpts.showStatus || editOpts.showUpdateStatus) &&
        keepUpdateFieldMaps[field]
      ) {
        isDirty = $asTable.isUpdateByRow(row, field);
      }

      const isVNAutoHeight = !hasEllipsis && (scrollYLoad || scrollXLoad);
      let cellHeight = getCellRestHeight(rowRest, cellOpts, defaultRowHeight);

      const isLastColumn = $columnIndex === columns.length - 1;
      const isAutoCellWidth =
        !column.resizeWidth &&
        (column.minWidth === 'auto' || column.width === 'auto');

      let isVNPreEmptyStatus = false;

      if (!isMergeCell && (!dragRow || getRowid($asTable, dragRow) !== rowid)) {
        if (
          overflowY &&
          scrollYLoad &&
          tableData.length > 16 &&
          !treeConfig &&
          !virtualYOpts.immediate &&
          (_rowIndex <
            scrollYStore.visibleStartIndex - scrollYStore.preloadSize ||
            _rowIndex > scrollYStore.visibleEndIndex + scrollYStore.preloadSize)
        ) {
          isVNPreEmptyStatus = true;
        }
        if (
          overflowX &&
          scrollXLoad &&
          tableColumn.length > 10 &&
          !virtualXOpts.immediate &&
          !column.fixed &&
          (_columnIndex <
            scrollXStore.visibleStartIndex - scrollXStore.preloadSize ||
            _columnIndex >
              scrollXStore.visibleEndIndex + scrollXStore.preloadSize)
        ) {
          isVNPreEmptyStatus = true;
        }
      }

      if (mergeRowspan > 1) {
        const mEndRow = afterFullData[_rowIndex + mergeRowspan - 1];
        if (mEndRow) {
          const meRowRest = fullAllDataRowIdData[getRowid($asTable, mEndRow)];
          if (meRowRest) {
            cellHeight +=
              meRowRest.oTop +
              getCellRestHeight(meRowRest, cellOpts, defaultRowHeight) -
              rowRest.oTop -
              getCellRestHeight(rowRest, cellOpts, defaultRowHeight);
          }
        }
      }

      const tcStyle: Record<string, string> = {};
      if (maxHeight) {
        tcStyle.maxHeight = `${maxHeight}px`;
      }

      if (hasEllipsis && resizeWidthFlag) {
        let mergeColWidth = 0;
        if (mergeColspan > 1) {
          for (let index = 1; index < mergeColspan; index++) {
            const nextColumn = visibleColumn[columnIndex + index];
            if (nextColumn) {
              mergeColWidth += nextColumn.renderWidth;
            }
          }
        }
        tcStyle.width = `${column.renderWidth + mergeColWidth - cellOffsetWidth}px`;
      }
      if (
        scrollYLoad ||
        scrollXLoad ||
        hasEllipsis ||
        isCsHeight ||
        isRsHeight
      ) {
        tcStyle.height = `${cellHeight}px`;
      } else {
        tcStyle.minHeight = `${cellHeight}px`;
      }
      if (minHeight) {
        tcStyle.minHeight = `${minHeight}px`;
      }

      const tdVNs: AsComponentSlotType[] = [];
      // 被遮挡的格子内容不可见，只保留带 tcStyle 的空壳撑住行高
      if (fixedHiddenColumn && isAllOverflow) {
        tdVNs.push(
          <div
            class={[
              `${prefixCls}-cell`,
              {
                'c--title': showTitle,
                'c--tooltip': showTooltip,
                'c--ellipsis': showEllipsis,
              },
            ]}
            key="tc"
            style={tcStyle}
          ></div>,
        );
      } else {
        // 渲染单元格
        if (treeConfig) {
          tdVNs.push(...renderLine(rowid, cellParams, cellHeight));
        }

        const clVNs: AsComponentSlotType[] = [];
        if (!isVNPreEmptyStatus) {
          clVNs.push(
            <div
              class={clsx(
                `${prefixCls}-cell--wrapper`,
                `${prefixCls}-body-cell--wrapper`,
              )}
              colid={colid}
              rowid={rowid}
            >
              {column.renderCell(cellParams)}
            </div>,
          );
        }
        tdVNs.push(
          <div
            class={clsx(`${prefixCls}-cell`, {
              'c--title': showTitle,
              'c--tooltip': showTooltip,
              'c--ellipsis': showEllipsis,
            })}
            key="tc"
            style={tcStyle}
            title={
              showTitle ? ($asTable.getCellLabel(row, column) as any) : null
            }
          >
            {clVNs}
          </div>,
        );
        /** 校验提示 */
        if (showValidTip && errorValidItem) {
          const errRule = errorValidItem.rule;
          const validParams = {
            ...cellParams,
            ...errorValidItem,
            rule: errorValidItem,
          };
          const validSlot = slots ? slots.valid : null;

          tdVNs.push(
            <div
              class={[
                `${prefixCls}-cell--valid-error-tip`,
                getPropClass(validOpts.className, validParams),
              ]}
              key="tcv"
              style={
                errRule && errRule.maxWidth
                  ? {
                      width: `${errRule.maxWidth}px`,
                    }
                  : null
              }
            >
              <div
                class={[
                  `${prefixCls}-cell--valid-error-wrapper`,
                  `${prefixCls}-cell--valid-error-theme-${validOpts.theme || 'normal'}`,
                ]}
              >
                {validSlot ? (
                  $asTable.callSlot(validSlot, validParams)
                ) : (
                  <span class={`${prefixCls}-cell--valid-error-msg`}>
                    {errorValidItem.content}
                  </span>
                )}
              </div>
            </div>,
          );
        }
      }

      const showAreaRowStatus =
        // oxlint-disable-next-line no-unneeded-ternary
        mouseConfig && mouseOpts.area && !_columnIndex && selectCellToRow
          ? true
          : false;

      if (!fixedHiddenColumn && showResizable && isAllColumnDrag) {
        tdVNs.push(
          <div
            class={[
              `${prefixCls}-cell--col-resizable`,
              {
                'is--line': !border || border === 'none',
              },
            ]}
            key="tcc"
            onDblclick={(evnt: MouseEvent) =>
              $asTable.handleColResizeDblclickEvent(evnt, fixedType, cellParams)
            }
            onMousedown={(evnt: MouseEvent) =>
              $asTable.handleColResizeMousedownEvent(
                evnt,
                fixedType,
                cellParams,
              )
            }
          ></div>,
        );
      }

      if ((rowResize || isAllRowDrag) && rowOpts.resizable) {
        tdVNs.push(
          <div
            class={[`${prefixCls}-cell--row-resizable`]}
            key="tcr"
            onDblclick={(evnt: MouseEvent) =>
              $asTable.handleRowResizeDblclickEvent(evnt, cellParams)
            }
            onMousedown={(evnt: MouseEvent) =>
              $asTable.handleRowResizeMousedownEvent(evnt, cellParams)
            }
          ></div>,
        );
      }

      return (
        <td
          class={[
            `${props.prefixCls}--column`,
            `${props.prefixCls}-body--column`,
            colid,
            cellVerticalAlign ? `col--vertical-${cellVerticalAlign}` : '',
            cellAlign ? `col--${cellAlign}` : '',
            type ? `col--${type}` : '',
            `size--${props.size}`,
            {
              'col--last': isLastColumn,
              'col--tree-node': treeNode,
              'col--edit': isEdit,
              'col--ellipsis': hasEllipsis,
              'col--cs-height': isCsHeight,
              'col--rs-height': isRsHeight,
              'col--to-row': showAreaRowStatus,
              'col--auto-height': isVNAutoHeight,
              'fixed--width': !isAutoCellWidth,
              'fixed--hidden': fixedHiddenColumn,
              'is--pg-top': isCellPaddingTop,
              'is--pg-bottom': isCellPaddingBottom,
              'is--pg-left': isCellPaddingLeft,
              'is--pg-right': isCellPaddingRight,
              'is--progress':
                (fixedHiddenColumn && isAllOverflow) || isVNPreEmptyStatus,
              'is--drag-cell':
                isRowDragCell && (isCrossDrag || isPeerDrag || !rowLevel),
              'is--drag-disabled': isDisabledDrag,
              'col--dirty': isDirty,
              'col--active':
                editConfig &&
                isEdit &&
                actived.row === row &&
                (actived.column === column || editOpts.mode === 'row'),
              'col--valid-error': !!errorValidItem,
              'show--valid-bg': errorValidItem && validOpts.showErrorBackground,
              'col--current': currColFlag && currentCol === column,
            },
            getPropClass(compCellClassName, cellParams),
            getPropClass(className, cellParams),
            getPropClass(allCellClassName, cellParams),
          ]}
          key={
            scrollXLoad ||
            scrollYLoad ||
            columnOpts.useKey ||
            rowOpts.useKey ||
            columnOpts.drag
              ? colid
              : $columnIndex
          }
          {...tdAttrs}
          {...tdOns}
          style={Object.assign(
            {},
            isFunction(compCellStyle)
              ? compCellStyle(cellParams)
              : compCellStyle,
            isFunction(cellStyle) ? cellStyle(cellParams) : cellStyle,
          )}
        >
          {isOptimizeMode && fixedHiddenColumn ? [] : tdVNs}
        </td>
      );
    };

    const renderRows = (
      fixedType: '' | 'left' | 'right',
      isOptimizeMode: boolean,
      tableData: any[],
      tableColumn: AsTableDefines.ColumnInfo[],
    ) => {
      const { stripe, treeConfig, rowClassName, rowStyle, editConfig } =
        tableProps;
      const {
        isRowGroupStatus,
        rowExpandedFlag,
        expandColumn,
        treeExpandedFlag,
        scrollYLoad,
        selectRadioRow,
        pendingRowFlag,
        rowExpandHeightFlag,
        isAllOverflow,
        hasFixedColumn,
      } = tableReactData;
      const {
        fullAllDataRowIdData,
        rowExpandedMaps,
        treeExpandedMaps,
        pendingRowMaps,
        currentRow,
        fullColumnIdData,
      } = tableInternalData;
      const treeOpts = computeTreeOpts.value;
      const rowOpts = computeRowOpts.value;
      const editOpts = computeEditOpts.value;
      const radioOpts = computeRadioOpts.value;
      const checkboxOpts = computeCheckboxOpts.value;
      const columnOpts = computeColumnOpts.value;

      const { transform, seqMode } = treeOpts;
      const childrenField = treeOpts.childrenField;

      const rows: any[] = [];

      const { handleGetRowId } = createHandleGetRowId($asTable);
      const isDeepRow = treeConfig || isRowGroupStatus;
      tableData.forEach((row, $rowIndex) => {
        const rowid = handleGetRowId(row);
        const rowRest =
          fullAllDataRowIdData[rowid] || ({} as AsTableDefines.RowCacheItem);
        let rowIndex = $rowIndex;
        let rowLevel = 0;
        let seq = -1;
        let _rowIndex = -1;
        const hasRowGroupAggregate = isRowGroupStatus && row.isAggregate;

        const trOn: Record<string, any> = {};
        // 高亮当前行事件
        if (rowOpts.isHover) {
          trOn.onMouseover = (evnt: MouseEvent) => {
            if (isVMScrollProcess()) {
              return;
            }
            $asTable.triggerHoverEvent(evnt, { row, rowIndex });
          };
          trOn.onMouseleave = () => {
            if (isVMScrollProcess()) {
              return;
            }
            $asTable.clearHoverRow();
          };
        }

        if (rowRest) {
          rowIndex = rowRest.index;
          _rowIndex = rowRest._index;
          rowLevel = rowRest.level;
          seq = rowRest.seq as any;
          if (
            hasRowGroupAggregate ||
            (treeConfig && transform && seqMode === 'increasing')
          ) {
            seq = rowRest._index + 1;
          } else if (treeConfig && seqMode === 'fixed') {
            seq = rowRest._tIndex + 1;
          }
        }
        const params = {
          $table: $asTable,
          seq,
          rowid,
          fixed: fixedType,
          type: renderType,
          level: rowLevel,
          row,
          rowIndex,
          $rowIndex,
          _rowIndex,
        };
        // 行是否被展开
        const isExpandRow =
          expandColumn && !!rowExpandedFlag && !!rowExpandedMaps[rowid];
        // 树节点是否被展开
        let isExpandTree = false;
        let rowChildren = [];
        const isNewRow = editConfig ? $asTable.isInsertByRow(row) : false;
        if (treeConfig && !scrollYLoad && !transform) {
          rowChildren = row[childrenField];
          isExpandTree =
            !!treeExpandedFlag &&
            rowChildren &&
            rowChildren.length > 0 &&
            !!treeExpandedMaps[rowid];
        }
        //  拖拽行事件
        if (rowOpts.drag && !isRowGroupStatus && (!treeConfig || transform)) {
          trOn.onDragstart = $asTable.handleRowDragDragstartEvent;
          trOn.onDragend = $asTable.handleRowDragDragendEvent;
          trOn.onDragover = $asTable.handleRowDragDragoverEvent;
        }
        const trClass = [
          `${props.prefixCls}-body--row`,
          isDeepRow ? `row--level-${rowLevel}` : '',
          {
            'row--stripe': stripe && (_rowIndex + 1) % 2 === 0,
            'is--new': isNewRow,
            'is--expand-row': isExpandRow,
            'is--expand-tree': isExpandTree,
            'row--new':
              isNewRow && (editOpts.showStatus || editOpts.showInsertStatus),
            'row--radio':
              radioOpts.highlight && $asTable.eqRow(selectRadioRow, row),
            'row--checked':
              checkboxOpts.highlight && $asTable.isCheckedByCheckboxRow(row),
            'row--pending': !!pendingRowFlag && !!pendingRowMaps[rowid],
            'row--group': hasRowGroupAggregate,
            'row--current':
              currentRow && rowid === getRowid($asTable, currentRow),
          },
          getPropClass(rowClassName, params),
        ];

        const tdVNs = tableColumn.map((column, $columnIndex) => {
          return renderTdColumn(
            seq,
            rowid,
            fixedType,
            isOptimizeMode,
            rowLevel,
            row,
            rowIndex,
            $rowIndex,
            _rowIndex,
            column,
            $columnIndex,
            tableColumn,
            tableData,
          );
        });
        rows.push(
          <tr
            class={trClass}
            key={
              rowOpts.useKey ||
              rowOpts.drag ||
              columnOpts.drag ||
              isRowGroupStatus ||
              treeConfig
                ? rowid
                : $rowIndex
            }
            rowid={rowid}
            style={
              rowStyle
                ? isFunction(rowStyle)
                  ? (rowStyle(params) as any)
                  : (rowStyle as any)
                : null
            }
            {...trOn}
          >
            {tdVNs}
          </tr>,
        );
        // 如果行被展开了
        if (isExpandRow) {
          const expandOpts = computeExpandOpts.value;
          const {
            height: expandHeight,
            padding,
            mode: expandMode,
          } = expandOpts;
          if (expandMode === 'fixed') {
            const currExpHeight = rowRest.expandHeight;
            const expHeight =
              rowExpandHeightFlag && (currExpHeight || expandHeight)
                ? (currExpHeight || expandHeight || 0) + 1
                : 0;
            rows.push(
              h(
                'tr',
                {
                  class: `${prefixCls}-body--row-expanded-place`,
                  key: `expand_${rowid}`,
                  rowid,
                },
                [
                  h('td', {
                    class: `${prefixCls}-body--row-expanded-place-column`,
                    colspan: tableColumn.length,
                    style: {
                      height: `${expHeight}px`,
                    },
                  }),
                ],
              ),
            );
          } else {
            const cellStyle: any = {};
            if (expandHeight) {
              cellStyle.height = `${expandHeight}px`;
            }
            if (treeConfig) {
              cellStyle.paddingLeft = `${rowLevel * treeOpts.indent + 30}px`;
            }
            const { showOverflow } = expandColumn || {};
            const colid = expandColumn.id;
            const colRest =
              fullColumnIdData[colid] || ({} as AsTableDefines.RowCacheItem);
            const hasEllipsis = eqNull(showOverflow)
              ? isAllOverflow
              : showOverflow;
            let columnIndex = -1;
            let $columnIndex = -1;
            let _columnIndex = -1;
            if (colRest) {
              columnIndex = colRest.index;
              $columnIndex = colRest.$index;
              _columnIndex = colRest._index;
            }
            const expandParams: AsTableDefines.CellRenderDataParams = {
              $table: $asTable,
              // TODO $grid: $xeGrid,
              // $gantt: $xeGantt,
              prefixCls,
              seq,
              column: expandColumn as AsTableDefines.ColumnInfo,
              columnIndex,
              $columnIndex,
              _columnIndex,
              fixed: fixedType,
              source: sourceType,
              type: renderType,
              level: rowLevel,
              row,
              rowid,
              rowIndex,
              $rowIndex,
              _rowIndex,
              isHidden: false,
              isEdit: false,
            };
            rows.push(
              <tr
                class={[
                  `${prefixCls}-body--expanded-row`,
                  { 'is--padding': padding },
                ]}
                key={`expand_${rowid}`}
              >
                <td
                  class={[
                    `${prefixCls}-body--expanded-column`,
                    {
                      'fixed--hidden': fixedType && !hasFixedColumn,
                      'col--ellipsis': hasEllipsis,
                    },
                  ]}
                  colspan={tableColumn.length}
                >
                  <div
                    class={[
                      `${prefixCls}-body--expanded-cell`,
                      { 'is--ellipsis': expandHeight },
                    ]}
                    style={cellStyle}
                  >
                    {expandColumn.renderData(expandParams)}
                  </div>
                </td>
              </tr>,
            );
          }
        }

        // 如果是树形表格
        if (isExpandTree) {
          rows.push(
            ...renderRows(fixedType, isOptimizeMode, rowChildren, tableColumn),
          );
        }
      });
      return rows;
    };

    onMounted(() => {
      nextTick(() => {
        const { fixedType } = props;
        const { elemStore } = tableInternalData;
        const prefix = `${fixedType || 'main'}-body-`;
        elemStore[`${prefix}wrapper`] = refElem;
        elemStore[`${prefix}scroll`] = refBodyScroll;
        elemStore[`${prefix}table`] = refBodyTable;
        elemStore[`${prefix}colgroup`] = refBodyColgroup;
        elemStore[`${prefix}list`] = refBodyTBody;
        elemStore[`${prefix}xSpace`] = refBodyXSpace;
        elemStore[`${prefix}ySpace`] = refBodyYSpace;
        elemStore[`${prefix}emptyBlock`] = refBodyEmptyBlock;
      });
    });

    onUnmounted(() => {
      const { fixedType } = props;
      const { elemStore } = tableInternalData;
      const prefix = `${fixedType || 'main'}-body-`;
      elemStore[`${prefix}wrapper`] = null;
      elemStore[`${prefix}scroll`] = null;
      elemStore[`${prefix}table`] = null;
      elemStore[`${prefix}colgroup`] = null;
      elemStore[`${prefix}list`] = null;
      elemStore[`${prefix}xSpace`] = null;
      elemStore[`${prefix}ySpace`] = null;
      elemStore[`${prefix}emptyBlock`] = null;
    });

    const renderVN = () => {
      const { slots } = tableContext;
      const { mouseConfig } = tableProps;
      const { tableColumn, fixedType, fixedColumn } = props;
      const emptyOpts = computeEmptyOpts.value;
      const mouseOpts = computeMouseOpts.value;
      const {
        isGroup,
        isColLoading,
        overflowX,
        tableData,
        scrollXLoad,
        scrollYLoad,
        dragRow,
        dragCol,
      } = tableReactData;
      const { visibleColumn, fullAllDataRowIdData, fullColumnIdData } =
        tableInternalData;
      const isBodyRenderOptimize = computeIsBodyRenderOptimize.value;
      let renderDataList = tableData;
      let renderColumnList = tableColumn as AsTableDefines.ColumnInfo[];

      const isOptimizeMode = isBodyRenderOptimize;

      if (!isColLoading && (fixedType || !overflowX)) {
        renderColumnList = visibleColumn;
      }

      if (fixedType && isOptimizeMode) {
        renderColumnList = fixedColumn || [];
      }

      // 这是一个纯视觉补丁。纵向虚拟滚动下，renderDataList 只是视口那一段；
      // 拖动某一行时，如果被拖的行已经在切片之外，拖拽过程中就会出现“拖着一个不存在的行”的错位。
      // 这里把它临时拼进列表首尾，让落点指示线有行可依。
      if (scrollYLoad && dragRow && renderDataList.length > 2) {
        const dRowRest = fullAllDataRowIdData[getRowid($asTable, dragRow)];
        if (dRowRest) {
          const drIndex = dRowRest._index;
          const firstRow = renderDataList[0];
          const lastRow = renderDataList[renderDataList.length - 1];
          const firstRowRest =
            fullAllDataRowIdData[getRowid($asTable, firstRow)];
          const lastRowRest = fullAllDataRowIdData[getRowid($asTable, lastRow)];
          if (firstRowRest && lastRowRest) {
            const frIndex = firstRowRest._index;
            const lrIndex = lastRowRest._index;
            if (drIndex < frIndex) {
              renderDataList = [dragRow].concat(renderDataList);
            } else if (drIndex > lrIndex) {
              renderDataList = renderDataList.concat([dragRow]);
            }
          }
        }
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
          const firstCol: any = renderColumnList[0];
          const lastCol: any = renderColumnList[renderColumnList.length - 1];
          const firstColRest = fullColumnIdData[firstCol.id];
          const lastColRest = fullColumnIdData[lastCol.id];
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

      let emptyContent: AsComponentSlotType | AsComponentSlotType[] | string;
      const emptySlot = slots ? slots.empty : null;
      const emptyParams = {
        $table: $asTable,
        // TODO $grid: $asGrid, $gantt: $asGantt
      };
      if (emptySlot) {
        emptyContent = $asTable.callSlot(emptySlot, emptyParams);
      } else {
        const rendererOpts = computeRendererOpts.value;
        const compConf = emptyOpts.name
          ? rendererOpts[emptyOpts.name] || renderer.get(emptyOpts.name)
          : null;
        const rtEmptyView = compConf
          ? compConf.renderTableEmpty || compConf.renderTableEmptyView
          : null;
        emptyContent = rtEmptyView
          ? getSlotVNs(rtEmptyView(emptyOpts, emptyParams))
          : tableProps.emptyText || locale?.value.emptyText;
      }

      return (
        <div
          class={[
            `${prefixCls}--body-wrapper`,
            fixedType ? `fixed-${fixedType}--wrapper` : 'body--wrapper',
          ]}
          ref={refElem}
          xid={xID}
        >
          <div
            class={`${prefixCls}--body-inner-wrapper`}
            onScroll={(event: any) => {
              $asTable.triggerBodyScrollEvent(event, fixedType);
            }}
            ref={refBodyScroll}
          >
            {fixedType ? (
              createCommentVNode()
            ) : (
              <div
                class={`${prefixCls}-body--x-space`}
                ref={refBodyXSpace}
              ></div>
            )}
            <div class={`${prefixCls}-body--y-space`} ref={refBodyYSpace} />
            <table
              border={0}
              cellpadding={0}
              cellspacing={0}
              class={`${prefixCls}--body`}
              ref={refBodyTable}
              xvm={isOptimizeMode ? '1' : null}
            >
              <colgroup ref={refBodyColgroup}>
                {renderColumnList.map((column: any, $columnIndex: any) => {
                  return (
                    <col
                      key={$columnIndex}
                      name={column.id}
                      style={{
                        width: `${column.renderWidth}px`,
                      }}
                    ></col>
                  );
                })}
              </colgroup>
              <tbody ref={refBodyTBody}>
                {renderRows(
                  fixedType,
                  isOptimizeMode,
                  renderDataList,
                  renderColumnList,
                )}
              </tbody>
            </table>
            <div class={`${prefixCls}--checkbox-range`}></div>
            {mouseConfig && mouseOpts.area ? (
              <div class={`${prefixCls}--cell-area`} xid={xID}>
                <span class={`${prefixCls}--cell--main-area`}>
                  {mouseOpts.extension ? (
                    <span
                      class={`${prefixCls}--cell-main-area-btn`}
                      onMousedown={(evnt: MouseEvent) => {
                        if ($asTable.triggerCellAreaExtendMousedownEvent) {
                          $asTable.triggerCellAreaExtendMousedownEvent(evnt, {
                            $table: $asTable,
                            fixed: fixedType,
                            type: renderType,
                          });
                        }
                      }}
                    ></span>
                  ) : (
                    []
                  )}
                </span>
                <span class={`${prefixCls}--cell-clip-area`}></span>
                <span class={`${prefixCls}--cell-extend-area`}></span>
                <span class={`${prefixCls}--cell-multi-area`}></span>
                <span class={`${prefixCls}--cell-active-area`}></span>
                <span class={`${prefixCls}--cell-row-status-area`}></span>
              </div>
            ) : (
              createCommentVNode()
            )}
            {fixedType ? (
              createCommentVNode()
            ) : (
              <div class={`${prefixCls}--empty-block`} ref={refBodyEmptyBlock}>
                <div class={`${prefixCls}--empty-content`}>{emptyContent}</div>
              </div>
            )}
          </div>
        </div>
      );
    };

    return renderVN;
  },
  {
    name: 'AsTableBody',
  },
);

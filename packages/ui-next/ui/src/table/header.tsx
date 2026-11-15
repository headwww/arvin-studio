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
  watch,
} from 'vue';

import { eachTree, eqNull, isBoolean, isFunction } from '@arvin-studio/kit';

import { ArvinStudio } from '..';
import { getSlotVNs } from '../_util/vn';
import {
  convertHeaderColumnToRows,
  convertHeaderToGridRows,
  getCalcHeight,
  getDefaultConfig,
  isEnableConf,
} from './util';

const sourceType = 'table';
const renderType = 'header';

const { renderer } = ArvinStudio;

export default defineComponent({
  name: 'AsTableHeader',
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    tableData: Array as PropType<any[]>,
    tableColumn: Array as PropType<AsTableDefines.ColumnInfo[]>,
    fixedColumn: Array as PropType<AsTableDefines.ColumnInfo[]>,
    tableGroupColumn: Array as PropType<AsTableDefines.ColumnInfo[]>,
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

    const { xID } = $asTable;

    const {
      computeIsHeaderRenderOptimize,
      computeCellOpts,
      computeHeaderCellOpts,
      computeMouseOpts,
      computeRendererOpts,
      computeHeaderTooltipOpts,
      computeFloatingFilterOpts,
      computeColumnOpts,
      computeVirtualXOpts,
      computeColumnDragOpts,
      computeDefaultRowHeight,
    } = $asTable.getComputeMaps();

    const {
      props: tableProps,
      reactData: tableReactData,
      internalData: tableInternalData,
    } = $asTable;

    const headerColumn = ref<AsTableDefines.ColumnInfo[][]>([]);

    const refElem = ref() as Ref<HTMLDivElement>;
    const refHeaderScroll = ref() as Ref<HTMLDivElement>;
    const refHeaderTable = ref() as Ref<HTMLTableElement>;
    const refHeaderColgroup = ref() as Ref<HTMLTableColElement>;
    const refHeaderTHead = ref() as Ref<HTMLTableSectionElement>;
    const refHeaderXSpace = ref() as Ref<HTMLDivElement>;
    const refHeaderBorderRepair = ref() as Ref<HTMLDivElement>;

    const uploadColumn = () => {
      const { showCustomHeader } = tableProps;
      const { collectColumn, visibleColumn } = tableInternalData;
      const { tableGroupColumn } = props;
      const { isGroup } = tableReactData;
      let spanColumns: AsTableDefines.ColumnInfo[][] = isGroup
        ? convertHeaderColumnToRows(tableGroupColumn)
        : [];
      let visibleColgroups: AsTableDefines.ColumnInfo[][] = [];
      if (showCustomHeader && spanColumns.length > 1) {
        visibleColgroups = convertHeaderToGridRows(spanColumns);
        spanColumns = visibleColgroups;
      }
      headerColumn.value = spanColumns;
      nextTick(() => {
        $asTable.dispatchEvent(
          'columns-change',
          { visibleColgroups, collectColumn, visibleColumn },
          null,
        );
      });
    };

    const renderRows = (
      isGroup: boolean,
      isOptimizeMode: boolean,
      headerGroups: AsTableDefines.ColumnInfo[][],
      _rowIndex: number,
      cols: AsTableDefines.ColumnInfo[],
    ) => {
      const { prefixCls, fixedType } = props;
      const {
        fullColumnIdData,
        scrollXStore,
        mergeHeaderList,
        mergeHeaderCellMaps,
        currentCol,
      } = tableInternalData;
      const {
        dragCol,
        scrollXLoad,
        scrollYLoad,
        overflowX,
        mergeHeadFlag,
        tableColumn,
        currColFlag,
      } = tableReactData;

      const {
        showCustomHeader,
        showHeaderOverflow: allColumnHeaderOverflow,
        headerAlign: allHeaderAlign,
        align: allAlign,
        headerCellClassName,
        headerCellStyle,
        mouseConfig,
      } = tableProps;

      const cellOpts = computeCellOpts.value;
      const headerCellOpts = computeHeaderCellOpts.value;
      const rendererOpts = computeRendererOpts.value;
      const headerTooltipOpts = computeHeaderTooltipOpts.value;
      const columnOpts = computeColumnOpts.value;
      const columnDragOpts = computeColumnDragOpts.value;
      const virtualXOpts = computeVirtualXOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;

      const currCellHeight =
        getCalcHeight(headerCellOpts.height) || defaultRowHeight;

      const {
        disabledMethod: dragDisabledMethod,
        isCrossDrag,
        isPeerDrag,
      } = columnDragOpts;
      const isLastRow = _rowIndex === headerGroups.length - 1;

      return cols.map((column, $columnIndex) => {
        const {
          type,
          showHeaderOverflow,
          headerAlign,
          align,
          filters,
          headerClassName,
          editRender,
          cellRender,
        } = column;

        const colid = column.id;
        const colRest = (fullColumnIdData[colid] ||
          {}) as AsTableDefines.ColumnCacheItem;
        const renderOpts = editRender || cellRender;
        const compConf =
          renderOpts && renderOpts.name
            ? rendererOpts[renderOpts.name] || renderer.get(renderOpts.name)
            : null;

        const isColGroup = column.children && column.children.length > 0;

        const fixedHiddenColumn =
          overflowX &&
          !isColGroup &&
          (fixedType ? column.fixed !== fixedType : !!column.fixed);

        const cellPadding = getDefaultConfig(
          headerCellOpts.padding,
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

        const headOverflow = getDefaultConfig(
          showHeaderOverflow,
          allColumnHeaderOverflow,
        );
        const headAlign =
          headerAlign ||
          (compConf ? compConf.tableHeaderCellAlign : '') ||
          allHeaderAlign ||
          align ||
          (compConf ? compConf.tableCellAlign : '') ||
          allAlign;
        const showEllipsis =
          (headOverflow === true ? headerTooltipOpts.mode : headOverflow) ===
          'ellipsis';
        const showTitle =
          (headOverflow === true ? headerTooltipOpts.mode : headOverflow) ===
          'title';
        const showTooltip =
          (headOverflow === true ? headerTooltipOpts.mode : headOverflow) ===
          'tooltip';
        const hasEllipsis = showTitle || showTooltip || showEllipsis;

        let hasFilter = false;
        let firstFilterOption: AsTableDefines.FilterOption | null = null;
        if (filters) {
          firstFilterOption = filters[0] as AsTableDefines.FilterOption;
          hasFilter = filters.some((item) => item.checked);
        }

        const columnIndex = colRest.index;
        const _columnIndex = colRest._index;
        const cellParams: AsTableDefines.CellRenderHeaderParams & {
          $table: AsTableConstructor & AsTablePrivateMethods;
        } = {
          $table: $asTable,
          // TODO  $grid: $xeGrid,
          // $gantt: $xeGantt,
          rowIndex: _rowIndex,
          _rowIndex,
          $rowIndex: _rowIndex,
          column,
          columnIndex,
          $columnIndex,
          _columnIndex,
          prefixCls,
          firstFilterOption: firstFilterOption as AsTableDefines.FilterOption,
          fixed: fixedType,
          source: sourceType,
          type: renderType,
          isHidden: fixedHiddenColumn,
          hasFilter,
        };

        const thAttrs: Record<string, null | number | string> = {
          colid,
        };
        let isMergeCell = false;
        // 合并行或列
        if (!showCustomHeader) {
          thAttrs.colspan = column.colSpan > 1 ? column.colSpan : null;
          thAttrs.rowspan = column.rowSpan > 1 ? column.rowSpan : null;
        }
        if (
          mergeHeadFlag &&
          mergeHeaderList.length > 0 &&
          (showCustomHeader || isLastRow)
        ) {
          const spanRest =
            mergeHeaderCellMaps[
              `${_rowIndex}:${showCustomHeader ? $columnIndex : _columnIndex}`
            ];
          if (spanRest) {
            const { rowspan, colspan } = spanRest;
            if (!rowspan || !colspan) {
              return null;
            }
            if (rowspan > 1) {
              isMergeCell = true;
              thAttrs.rowspan = rowspan;
            }
            if (colspan > 1) {
              isMergeCell = true;
              thAttrs.colspan = colspan;
            }
          }
        }

        const thOns: any = {
          onClick: (evnt: MouseEvent) =>
            $asTable.triggerHeaderCellClickEvent(evnt, cellParams),
          onDblclick: (evnt: MouseEvent) =>
            $asTable.triggerHeaderCellDblclickEvent(evnt, cellParams),
        };

        const isColDragCell =
          columnOpts.drag && columnDragOpts.trigger === 'cell';
        const isDisabledDrag = isColDragCell
          ? !!(dragDisabledMethod && dragDisabledMethod(cellParams))
          : false;

        // 按下事件处理
        if (mouseConfig || isColDragCell) {
          thOns.onMousedown = (evnt: MouseEvent) =>
            $asTable.triggerHeaderCellMousedownEvent(evnt, cellParams);
        }
        // 拖拽列事件
        if (columnOpts.drag) {
          thOns.onDragstart = $asTable.handleHeaderCellDragDragstartEvent;
          thOns.onDragend = $asTable.handleHeaderCellDragDragendEvent;
          thOns.onDragover = $asTable.handleHeaderCellDragDragoverEvent;
          if (isColDragCell) {
            thOns.onMouseup = $asTable.handleHeaderCellDragMouseupEvent;
          }
        }

        const isLastColumn = $columnIndex === cols.length - 1;
        const showResizable = isBoolean(column.resizable)
          ? column.resizable
          : columnOpts.resizable;

        const isAutoCellWidth =
          !column.resizeWidth &&
          (column.minWidth === 'auto' || column.width === 'auto');
        let isVNPreEmptyStatus = false;
        // eslint-disable-next-line unicorn/prefer-ternary
        if (
          isOptimizeMode &&
          overflowX &&
          !isGroup &&
          !isMergeCell &&
          (!dragCol || dragCol.id !== colid) &&
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

        if (showCustomHeader) {
          // custom
        } else if (isColGroup && !isLastRow) {
          let childWidth = 0;
          eachTree(column.children, (childRow) => {
            if (
              childRow.visible &&
              (!childRow.children || childRow.children.length === 0)
            ) {
              childWidth += childRow.renderWidth;
            }
          });
          tcStyle.width = `${childWidth}px`;
        }

        return (
          <th
            class={[
              `${prefixCls}--column`,
              `${prefixCls}-header--column`,
              colid,
              fixedHiddenColumn ? 'fixed--hidden' : 'fixed--visible',
              `size--${props.size}`,
              {
                [`col--${headAlign}`]: headAlign,
                [`col--${type}`]: type,
                'col--last': isLastColumn,
                'col--fixed': column.fixed,
                'col--group': isColGroup,
                'col--ellipsis': hasEllipsis,
                'fixed--width': !isAutoCellWidth,
                'is--pg-top': isCellPaddingTop,
                'is--pg-bottom': isCellPaddingBottom,
                'is--pg-left': isCellPaddingLeft,
                'is--pg-right': isCellPaddingRight,
                'is--sortable': column.sortable,
                'col--filter': !!filters,
                'is--filter-active': hasFilter,
                'is--drag-active':
                  columnOpts.drag &&
                  !column.fixed &&
                  !isDisabledDrag &&
                  (isCrossDrag || isPeerDrag || !column.parentId),
                'is--drag-disabled': columnOpts.drag && isDisabledDrag,
                'col--current': currColFlag && currentCol === column,
              },
              headerClassName
                ? isFunction(headerClassName)
                  ? headerClassName(cellParams)
                  : headerClassName
                : '',
              headerCellClassName
                ? isFunction(headerCellClassName)
                  ? headerCellClassName(cellParams)
                  : headerCellClassName
                : '',
            ]}
            key={
              showCustomHeader
                ? `${colid}${$columnIndex}`
                : scrollXLoad ||
                    scrollYLoad ||
                    columnOpts.useKey ||
                    columnOpts.drag ||
                    isColGroup
                  ? colid
                  : $columnIndex
            }
            {...thAttrs}
            {...thOns}
            style={
              headerCellStyle
                ? isFunction(headerCellStyle)
                  ? headerCellStyle(cellParams)
                  : (headerCellStyle as any)
                : null
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
              {isVNPreEmptyStatus || (isOptimizeMode && fixedHiddenColumn) ? (
                []
              ) : (
                <div
                  class={[
                    `${prefixCls}-cell--wrapper`,
                    `${prefixCls}-header-cell--wrapper`,
                  ]}
                  colid={colid}
                >
                  {column.renderHeader(cellParams)}
                </div>
              )}
            </div>
            {!fixedHiddenColumn &&
            showResizable &&
            (!showCustomHeader || isLastRow) ? (
              <div
                class={`${prefixCls}-cell--col-resizable`}
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
          </th>
        );
      });
    };

    const renderFilterRows = (
      isOptimizeMode: boolean,
      cols: AsTableDefines.ColumnInfo[],
    ) => {
      const { prefixCls, fixedType } = props;
      const { overflowX, currColFlag } = tableReactData;
      const { fullColumnIdData, currentCol } = tableInternalData;
      const {
        showHeaderOverflow: allColumnHeaderOverflow,
        headerAlign: allHeaderAlign,
        align: allAlign,
      } = tableProps;
      const rendererOpts = computeRendererOpts.value;
      const headerTooltipOpts = computeHeaderTooltipOpts.value;
      const headerCellOpts = computeHeaderCellOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;
      const cellOpts = computeCellOpts.value;
      const floatingFilterOpts = computeFloatingFilterOpts.value;

      const { cellClassName } = floatingFilterOpts;

      const currCellHeight =
        getCalcHeight(headerCellOpts.height) || defaultRowHeight;

      return cols.map((column, $columnIndex) => {
        const {
          type,
          showHeaderOverflow,
          headerAlign,
          align,
          filters,
          editRender,
          cellRender,
          floatingFilters,
          filterRender,
          slots,
        } = column;

        const colid = column.id;
        const colRest =
          fullColumnIdData[colid] || ({} as AsTableDefines.ColumnCacheItem);
        const renderOpts = editRender || cellRender;
        const flSlot = slots
          ? slots.floatingFilter || slots['floating-filter']
          : null;
        const flCompConf =
          isEnableConf(filterRender) && filterRender.name
            ? rendererOpts[filterRender.name] || renderer.get(filterRender.name)
            : null;
        const rtFloatingFilter = flCompConf
          ? flCompConf.renderTableFloatingFilter
          : null;

        const compConf =
          renderOpts && renderOpts.name
            ? rendererOpts[renderOpts.name] || renderer.get(renderOpts.name)
            : null;

        const fixedHiddenColumn =
          overflowX &&
          (fixedType ? column.fixed !== fixedType : !!column.fixed);
        const isPadding = isBoolean(headerCellOpts.padding)
          ? headerCellOpts.padding
          : cellOpts.padding;

        const headOverflow = eqNull(showHeaderOverflow)
          ? allColumnHeaderOverflow
          : showHeaderOverflow;
        const headAlign =
          headerAlign ||
          (compConf ? compConf.tableHeaderCellAlign : '') ||
          allHeaderAlign ||
          align ||
          (compConf ? compConf.tableCellAlign : '') ||
          allAlign;
        const showEllipsis = headOverflow === 'ellipsis';
        const showTitle = headOverflow === 'title';
        const showTooltip =
          // eslint-disable-next-line unicorn/prefer-minimal-ternary
          headOverflow === true
            ? headerTooltipOpts.mode === 'tooltip'
            : headOverflow === 'tooltip';
        const hasEllipsis = showTitle || showTooltip || showEllipsis;

        let hasFilter = false;
        let firstFilterOption: AsTableDefines.FilterOption | null = null;
        if (filters) {
          firstFilterOption = filters[0] as AsTableDefines.FilterOption;
          hasFilter = filters.some((item) => item.checked);
        }
        const columnIndex = colRest.index;
        const _columnIndex = colRest._index;
        const cellParams: AsTableDefines.CellFloatingFilterParams & {
          $table: AsTableConstructor & AsTablePrivateMethods;
        } = {
          $table: $asTable,
          // As $grid: $xeGrid,
          // $gantt: $xeGantt,
          column,
          columnIndex,
          $columnIndex,
          _columnIndex,
          option: firstFilterOption as AsTableDefines.FilterOption,
          fixed: fixedType,
          source: sourceType,
          type: renderType,
          isHidden: fixedHiddenColumn,
          hasFilter,
        };
        const thAttrs: Record<string, null | number | string> = {
          colid,
        };

        const isLastColumn = $columnIndex === cols.length - 1;
        const isAutoCellWidth =
          !column.resizeWidth &&
          (column.minWidth === 'auto' || column.width === 'auto');

        const tcStyle: Record<string, string> = {};
        if (hasEllipsis) {
          tcStyle.height = `${currCellHeight}px`;
        } else {
          tcStyle.minHeight = `${currCellHeight}px`;
        }

        return (
          <th
            class={[
              `${prefixCls}--column`,
              `${prefixCls}-header--column`,
              colid,
              fixedHiddenColumn ? 'fixed--hidden' : 'fixed--visible',
              `size--${props.size}`,
              {
                [`col--${headAlign}`]: headAlign,
                [`col--${type}`]: type,
                'col--last': isLastColumn,
                'col--fixed': column.fixed,
                'col--ellipsis': hasEllipsis,
                'fixed--width': !isAutoCellWidth,
                'is--padding': isPadding,
                'is--sortable': column.sortable,
                'col--current': currColFlag && currentCol === column,
              },
            ]}
            key={colid}
            {...thAttrs}
          >
            <div
              class={[
                `${prefixCls}-cell`,
                `${cellClassName || ''}`,
                {
                  'c--title': showTitle,
                  'c--tooltip': showTooltip,
                  'c--ellipsis': showEllipsis,
                },
              ]}
              style={tcStyle}
            >
              {isOptimizeMode && fixedHiddenColumn && !floatingFilters ? (
                []
              ) : (
                <div
                  class={[
                    `${prefixCls}-cell--wrapper`,
                    `${prefixCls}-header-cell--wrapper`,
                  ]}
                  colid={colid}
                >
                  {flSlot
                    ? $asTable.callSlot(flSlot, cellParams)
                    : rtFloatingFilter && firstFilterOption
                      ? getSlotVNs(
                          rtFloatingFilter(filterRender, cellParams as any),
                        )
                      : []}
                </div>
              )}
            </div>
          </th>
        );
      });
    };

    const renderHeads = (
      isGroup: boolean,
      isOptimizeMode: boolean,
      headerGroups: AsTableDefines.ColumnInfo[][],
      renderColumnList: AsTableDefines.ColumnInfo[],
    ) => {
      const { fixedType } = props;

      const { headerRowClassName, headerRowStyle } = tableProps;

      const floatingFilterOpts = computeFloatingFilterOpts.value;

      const rowVNs = headerGroups.map((cols, _rowIndex) => {
        const params = {
          $table: $asTable,
          rowIndex: _rowIndex,
          _rowIndex,
          $rowIndex: _rowIndex,
          fixed: fixedType,
          type: renderType,
        };

        return (
          <tr
            class={[
              `${props.prefixCls}-header--row`,
              headerRowClassName
                ? isFunction(headerRowClassName)
                  ? headerRowClassName(params)
                  : headerRowClassName
                : '',
            ]}
            key={_rowIndex}
            style={
              headerRowStyle
                ? isFunction(headerRowStyle)
                  ? headerRowStyle(params)
                  : (headerRowStyle as any)
                : null
            }
          >
            {renderRows(isGroup, isOptimizeMode, headerGroups, _rowIndex, cols)}
          </tr>
        );
      });
      if (floatingFilterOpts.enabled) {
        rowVNs.push(
          <tr
            class={[
              `${props.prefixCls}-header--row is--floating-filters`,
              `${floatingFilterOpts.rowClassName || ''}`,
            ]}
            key="ff"
          >
            {renderFilterRows(isOptimizeMode, renderColumnList)}
          </tr>,
        );
      }

      return rowVNs;
    };

    const renderVN = () => {
      const { prefixCls } = props;
      const { mouseConfig } = tableProps;
      const mouseOpts = computeMouseOpts.value;

      const { tableColumn, fixedColumn, fixedType } = props;
      const { isGroup, isColLoading, overflowX, scrollXLoad, dragCol } =
        tableReactData;
      const { visibleColumn, fullColumnIdData } = tableInternalData;
      const isHeaderRenderOptimize = computeIsHeaderRenderOptimize.value;
      //  二维：行 × 列（thead 用）
      let renderHeaderList = headerColumn.value || [];
      //  一维：列序列（colgroup 用）
      let renderColumnList = tableColumn as AsTableDefines.ColumnInfo[];

      const isOptimizeMode = isHeaderRenderOptimize;

      if (isGroup) {
        // 多级表头：永远全量（表头要跨列对齐，切不得）
        renderColumnList = visibleColumn;
      } else {
        // ① 不能进优化模式  → 必须全量
        // ② 能进优化模式，但"列已加载完"且（我是固定容器 或 没有横向滚动）→ 也用全量
        if (!isOptimizeMode || (!isColLoading && (fixedType || !overflowX))) {
          renderColumnList = visibleColumn;
        }

        // 如果是使用优化模式
        if (fixedType && isOptimizeMode) {
          renderColumnList = fixedColumn || [];
        }
        renderHeaderList = [renderColumnList];
      }

      //  虚拟 X 下的"拖拽列补渲染"：拖拽中的列如果不在当前切片里，就临时把它塞进渲染列表，否则它的表头格会消失。
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
          const firstCol = renderColumnList[0]!;
          const lastCol = renderColumnList[renderColumnList.length - 1]!;
          const firstColRest = fullColumnIdData[firstCol.id];
          const lastColRest = fullColumnIdData[lastCol.id];
          if (firstColRest && lastColRest) {
            const fcIndex = firstColRest._index;
            const lcIndex = lastColRest._index;
            if (dcIndex < fcIndex) {
              renderColumnList = [dragCol].concat(renderColumnList);
              renderHeaderList = [
                [dragCol].concat(renderHeaderList[0]!),
              ].concat(renderHeaderList.slice(1));
            } else if (dcIndex > lcIndex) {
              renderColumnList = renderColumnList.concat([dragCol]);
              renderHeaderList = [
                renderHeaderList[0]!.concat([dragCol]),
              ].concat(renderHeaderList.slice(1));
            }
          }
        }
      }
      return (
        <div
          class={[
            `${prefixCls}--header-wrapper`,
            fixedType ? `fixed-${fixedType}--wrapper` : 'body--wrapper',
          ]}
          ref={refElem}
          xid={xID}
        >
          <div
            class={`${prefixCls}--header-inner-wrapper`}
            onScroll={(event) => {
              $asTable.triggerHeaderScrollEvent(event, fixedType);
            }}
            ref={refHeaderScroll}
          >
            {fixedType ? (
              createCommentVNode()
            ) : (
              <div
                class={`${prefixCls}-body--x-space`}
                ref={refHeaderScroll}
              ></div>
            )}
            <table
              border={0}
              cellpadding={0}
              cellspacing={0}
              class={`${props.prefixCls}--header`}
              ref={refHeaderTable}
              xid={xID}
              xvm={isOptimizeMode ? '1' : null}
            >
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
              <thead ref={refHeaderTHead}>
                {renderHeads(
                  isGroup,
                  isOptimizeMode,
                  renderHeaderList,
                  renderColumnList,
                )}
              </thead>
            </table>
            {mouseConfig && mouseOpts.area ? (
              <div class={`${prefixCls}--cell-area`} xid={xID}>
                <span class={`${prefixCls}--cell--main-area`}></span>
                <span class={`${prefixCls}--cell-clip-area`}></span>
                <span class={`${prefixCls}--cell-extend-area`}></span>
                <span class={`${prefixCls}--cell-multi-area`}></span>
                <span class={`${prefixCls}--cell-active-area`}></span>
                <span class={`${prefixCls}--cell-col-status-area`}></span>
              </div>
            ) : (
              createCommentVNode()
            )}
          </div>
        </div>
      );
    };

    watch(() => props.tableColumn, uploadColumn);
    onMounted(() => {
      nextTick(() => {
        const { fixedType } = props;
        const { internalData } = $asTable;
        const { elemStore } = internalData;
        const prefix = `${fixedType || 'main'}-header-`;
        elemStore[`${prefix}wrapper`] = refElem;
        elemStore[`${prefix}scroll`] = refHeaderScroll;
        elemStore[`${prefix}table`] = refHeaderTable;
        elemStore[`${prefix}colgroup`] = refHeaderColgroup;
        elemStore[`${prefix}list`] = refHeaderTHead;
        elemStore[`${prefix}xSpace`] = refHeaderXSpace;
        elemStore[`${prefix}repair`] = refHeaderBorderRepair;
        uploadColumn();
      });
    });

    onUnmounted(() => {
      const { fixedType } = props;
      const { internalData } = $asTable;
      const { elemStore } = internalData;
      const prefix = `${fixedType || 'main'}-header-`;
      elemStore[`${prefix}wrapper`] = null;
      elemStore[`${prefix}scroll`] = null;
      elemStore[`${prefix}table`] = null;
      elemStore[`${prefix}colgroup`] = null;
      elemStore[`${prefix}list`] = null;
      elemStore[`${prefix}xSpace`] = null;
      elemStore[`${prefix}repair`] = null;
    });

    return renderVN;
  },
});

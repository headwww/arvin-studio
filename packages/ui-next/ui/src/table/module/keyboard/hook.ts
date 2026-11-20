import type { AsTableDefines } from '../../types/table';
import type { TableKeyboardPrivateMethods } from './keyboard';

import { findTree } from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import {
  addClass,
  getAbsolutePos,
  hasControlKey,
  removeClass,
} from '../../../_util/dom';
import { getRefElem } from '../../util';

const { hooks } = ArvinStudio;

hooks.add('tableKeyboardModule', {
  setupTable($asTable) {
    const { props, reactData, internalData, prefixCls } = $asTable;
    const { refElem, refTableBody } = $asTable.getRefMaps();
    const {
      computeCheckboxOpts,
      computeCellOpts,
      computeColumnOpts,
      computeCurrentColumnOpts,
      computeCurrentRowOpts,
      computeDefaultRowHeight,
      computeEditOpts,
      computeMouseOpts,
      computeRowOpts,
      computeTreeOpts,
    } = $asTable.getComputeMaps();

    /**
     * 根据拖拽方向与距离计算复选框范围涉及的行
     * 虚拟滚动时按行高累加，普通模式沿兄弟节点遍历
     */
    const getCheckboxRangeRows = (
      params: any,
      targetTrElem: HTMLElement,
      trRect: DOMRect,
      offsetClientTop: number,
      moveRange: number,
    ): any[] => {
      const { fullAllDataRowIdData } = internalData;
      const cellOpts = computeCellOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;
      const { row } = params;
      let countHeight = 0;
      let rangeRows: any[] = [];
      let moveSize = 0;
      const isDown = moveRange > 0;
      const { scrollYLoad } = reactData;
      const { afterFullData } = internalData;
      moveSize = isDown
        ? offsetClientTop + moveRange
        : trRect.height - offsetClientTop + Math.abs(moveRange);
      if (scrollYLoad) {
        const _rowIndex = $asTable.getVTRowIndex(row);
        if (!cellOpts.height) {
          // 行高固定时直接按默认行高估算
          rangeRows = isDown
            ? afterFullData.slice(
                _rowIndex,
                _rowIndex + Math.ceil(moveSize / defaultRowHeight),
              )
            : afterFullData.slice(
                _rowIndex - Math.floor(moveSize / defaultRowHeight),
                _rowIndex + 1,
              );
        } else if (isDown) {
          for (let i = _rowIndex; i < afterFullData.length; i++) {
            const item = afterFullData[i];
            const rowid = $asTable.getRowid(item);
            const rowRest: any = fullAllDataRowIdData[rowid] || {};
            countHeight +=
              rowRest.resizeHeight ||
              cellOpts.height ||
              rowRest.height ||
              defaultRowHeight;
            rangeRows.push(item);
            if (countHeight > moveSize) {
              return rangeRows;
            }
          }
        } else {
          for (let len = _rowIndex; len >= 0; len--) {
            const item = afterFullData[len];
            const rowid = $asTable.getRowid(item);
            const rowRest: any = fullAllDataRowIdData[rowid] || {};
            countHeight +=
              rowRest.resizeHeight ||
              cellOpts.height ||
              rowRest.height ||
              defaultRowHeight;
            rangeRows.push(item);
            if (countHeight > moveSize) {
              return rangeRows;
            }
          }
        }
      } else {
        const siblingProp = isDown ? 'next' : 'previous';
        while (targetTrElem && countHeight < moveSize) {
          const rowNodeRest = $asTable.getRowNode(targetTrElem);
          if (!rowNodeRest) {
            break;
          }
          rangeRows.push(rowNodeRest.item);
          countHeight += targetTrElem.offsetHeight;
          targetTrElem = targetTrElem[
            `${siblingProp}ElementSibling`
          ] as HTMLElement;
        }
      }
      return rangeRows;
    };

    /**
     * 处理复选框区域拖拽选择（按住鼠标左键在复选框列上拖动）
     */
    const handleCheckboxRangeEvent = (evnt: any, params: any) => {
      const { elemStore } = internalData;
      const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
      const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
      const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
      const { column, cell } = params;
      if (column.type !== 'checkbox') {
        return;
      }
      let bodyWrapperElem = bodyScrollElem as HTMLElement | null;
      if (leftScrollElem && column.fixed === 'left') {
        bodyWrapperElem = leftScrollElem;
      } else if (rightScrollElem && column.fixed === 'right') {
        bodyWrapperElem = rightScrollElem;
      }
      if (!bodyWrapperElem) {
        return;
      }
      const bodyRect = bodyWrapperElem.getBoundingClientRect();
      const el = refElem.value;
      const disX = evnt.clientX;
      const disY = evnt.clientY;
      const checkboxRangeElem = bodyWrapperElem.querySelector(
        `.${prefixCls.value}--checkbox-range`,
      ) as HTMLElement | null;
      if (!checkboxRangeElem) {
        return;
      }
      const trElem = cell.parentElement as HTMLElement;
      const selectRecords = $asTable.getCheckboxRecords();
      let lastRangeRows: any[] = [];
      const marginSize = 1;
      const startTop = evnt.clientY - bodyRect.y + bodyWrapperElem.scrollTop;
      const startLeft = evnt.clientX - bodyRect.x + bodyWrapperElem.scrollLeft;
      const startScrollTop = bodyWrapperElem.scrollTop;
      const rowHeight = trElem.offsetHeight;
      const trRect = trElem.getBoundingClientRect();
      const offsetClientTop = disY - trRect.y;
      let mouseScrollTimeout: any = null;
      let isMouseScrollDown: any = false;
      let mouseScrollSpaceSize = 1;
      /**
       * 派发复选框范围事件
       */
      const triggerEvent = (
        type: 'change' | 'end' | 'start',
        evnt: MouseEvent,
      ) => {
        $asTable.dispatchEvent(
          `checkbox-range-${type}` as any,
          {
            records: () => $asTable.getCheckboxRecords(),
            reserves: () => $asTable.getCheckboxReserveRecords(),
          },
          evnt,
        );
      };
      /**
       * 根据鼠标当前位置计算选框并同步选中行
       */
      const handleChecked = (evnt: MouseEvent) => {
        const { clientX, clientY } = evnt;
        const offsetLeft = clientX - disX;
        const offsetTop =
          clientY - disY + (bodyWrapperElem.scrollTop - startScrollTop);
        let rangeHeight = Math.abs(offsetTop);
        let rangeWidth = Math.abs(offsetLeft);
        let rangeTop = startTop;
        let rangeLeft = startLeft;

        if (offsetTop < marginSize) {
          // 向上
          rangeTop += offsetTop;
          if (rangeTop < marginSize) {
            rangeTop = marginSize;
            rangeHeight = startTop;
          }
        } else {
          // 向下
          rangeHeight = Math.min(
            rangeHeight,
            bodyWrapperElem.scrollHeight - startTop - marginSize,
          );
        }
        if (offsetLeft < marginSize) {
          // 向左
          rangeLeft += offsetLeft;
          if (rangeWidth > startLeft) {
            rangeLeft = marginSize;
            rangeWidth = startLeft;
          }
        } else {
          // 向右
          rangeWidth = Math.min(
            rangeWidth,
            bodyWrapperElem.clientWidth - startLeft - marginSize,
          );
        }
        checkboxRangeElem.style.height = `${rangeHeight}px`;
        checkboxRangeElem.style.width = `${rangeWidth}px`;
        checkboxRangeElem.style.left = `${rangeLeft}px`;
        checkboxRangeElem.style.top = `${rangeTop}px`;
        checkboxRangeElem.style.display = 'block';
        const rangeRows = getCheckboxRangeRows(
          params,
          trElem,
          trRect,
          offsetClientTop,
          offsetTop < marginSize ? -rangeHeight : rangeHeight,
        );
        // 至少滑动 10px 才能有效匹配
        if (rangeHeight > 10 && rangeRows.length !== lastRangeRows.length) {
          const isControlKey = hasControlKey(evnt);
          lastRangeRows = rangeRows;
          if (isControlKey) {
            rangeRows.forEach((row: any) => {
              $asTable.handleBatchSelectRows(
                [row],
                !selectRecords.includes(row),
              );
            });
          } else {
            $asTable.setAllCheckboxRow(false);
            $asTable.handleCheckedCheckboxRow(rangeRows, true, false);
          }
          triggerEvent('change', evnt);
        }
      };
      /**
       * 停止鼠标自动滚动
       */
      const stopMouseScroll = () => {
        clearTimeout(mouseScrollTimeout);
        mouseScrollTimeout = null;
      };
      /**
       * 开始鼠标自动滚动
       */
      const startMouseScroll = (evnt: MouseEvent) => {
        stopMouseScroll();
        mouseScrollTimeout = setTimeout(() => {
          if (!mouseScrollTimeout) {
            return;
          }

          const { scrollLeft, scrollTop, clientHeight, scrollHeight } =
            bodyWrapperElem;
          const topSize = Math.ceil((mouseScrollSpaceSize * 50) / rowHeight);
          if (isMouseScrollDown) {
            if (scrollTop + clientHeight < scrollHeight) {
              $asTable.scrollTo(scrollLeft, scrollTop + topSize);
              startMouseScroll(evnt);
              handleChecked(evnt);
            } else {
              stopMouseScroll();
            }
          } else if (scrollTop) {
            $asTable.scrollTo(scrollLeft, scrollTop - topSize);
            startMouseScroll(evnt);
            handleChecked(evnt);
          } else {
            stopMouseScroll();
          }
        }, 50);
      };
      addClass(el, 'drag--range');
      document.onmousemove = (evnt) => {
        evnt.preventDefault();
        evnt.stopPropagation();
        const { clientY } = evnt;
        const { boundingTop } = getAbsolutePos(bodyWrapperElem);
        // 如果超过可视区，触发滚动
        if (clientY < boundingTop) {
          isMouseScrollDown = false;
          mouseScrollSpaceSize = boundingTop - clientY;
          if (!mouseScrollTimeout) {
            startMouseScroll(evnt);
          }
        } else if (clientY > boundingTop + bodyWrapperElem.clientHeight) {
          isMouseScrollDown = true;
          mouseScrollSpaceSize =
            clientY - boundingTop - bodyWrapperElem.clientHeight;
          if (!mouseScrollTimeout) {
            startMouseScroll(evnt);
          }
        } else if (mouseScrollTimeout) {
          stopMouseScroll();
        }
        handleChecked(evnt);
      };
      document.onmouseup = (evnt) => {
        stopMouseScroll();
        removeClass(el, 'drag--range');
        checkboxRangeElem.removeAttribute('style');
        document.onmousemove = null;
        document.onmouseup = null;
        triggerEvent('end', evnt);
      };
      triggerEvent('start', evnt);
    };

    /**
     * 处理单元格鼠标按下：区域选取、复选框范围、单元格选中
     */
    const handleCellMousedownEvent = (evnt: any, params: any) => {
      const { editConfig, checkboxConfig, mouseConfig } = props;
      const checkboxOpts = computeCheckboxOpts.value;
      const mouseOpts = computeMouseOpts.value;
      const editOpts = computeEditOpts.value;
      if (mouseConfig && mouseOpts.area && $asTable.triggerClAreaMnEvent) {
        return $asTable.triggerClAreaMnEvent(evnt, params);
      }
      if (checkboxConfig && checkboxOpts.range) {
        handleCheckboxRangeEvent(evnt, params);
      }
      if (
        mouseConfig &&
        mouseOpts.selected &&
        (!editConfig || editOpts.mode === 'cell')
      ) {
        $asTable.handleSelected(params as any, evnt);
      }
    };

    /**
     * 计算方向键移动后的行列，并滚动选中
     */
    const handleMoveSelected = (
      evnt: any,
      args: any,
      isLeftArrow: boolean,
      isUpArrow: boolean,
      isRightArrow: boolean,
      isDwArrow: boolean,
    ) => {
      const { afterFullData, visibleColumn } = internalData;
      const params = Object.assign({}, args);
      const { row, column } = params;
      const _rowIndex = $asTable.getVTRowIndex(row);
      const _columnIndex = $asTable.getVTColumnIndex(column);
      const tableBody = refTableBody.value;
      const tableBodyElem = tableBody
        ? (tableBody.$el as HTMLDivElement)
        : null;
      const tableWidth = tableBodyElem ? tableBodyElem.clientWidth : 0;
      let colAlign =
        isLeftArrow || isRightArrow || column.renderWidth < tableWidth;
      if (
        (isLeftArrow && _columnIndex >= 0) ||
        (isRightArrow && _columnIndex <= visibleColumn.length - 1)
      ) {
        colAlign = false;
      } else {
        evnt.preventDefault();
      }
      if (isUpArrow && _rowIndex > 0) {
        // 移动到上一行
        params.rowIndex = _rowIndex - 1;
        params.row = afterFullData[params.rowIndex];
      } else if (isDwArrow && _rowIndex < afterFullData.length - 1) {
        // 移动到下一行
        params.rowIndex = _rowIndex + 1;
        params.row = afterFullData[params.rowIndex];
      } else if (isLeftArrow && _columnIndex) {
        // 移动到左侧单元格
        params.columnIndex = _columnIndex - 1;
        params.column = visibleColumn[params.columnIndex];
      } else if (isRightArrow && _columnIndex < visibleColumn.length - 1) {
        // 移动到右侧单元格
        params.columnIndex = _columnIndex + 1;
        params.column = visibleColumn[params.columnIndex];
      }
      $asTable
        .scrollToRow(params.row, params.column, {
          colAlign,
        })
        .then(() => {
          params.cell = $asTable.getCellElement(params.row, params.column);
          $asTable.handleSelected(params as any, evnt);
        });
      return params;
    };

    /**
     * 键盘模块内部方法集合
     */
    const keyboardMethods: TableKeyboardPrivateMethods = {
      /**
       * 处理 Tab 键移动
       */
      moveTabSelected(args: any, isLeft: any, evnt: any) {
        const { editConfig } = props;
        const { afterFullData, visibleColumn } = internalData;
        const editOpts = computeEditOpts.value;
        const rowOpts = computeRowOpts.value;
        const currentRowOpts = computeCurrentRowOpts.value;
        const columnOpts = computeColumnOpts.value;
        const currentColumnOpts = computeCurrentColumnOpts.value;
        let targetRow: any;
        let targetRowIndex: any;
        let targetColumnIndex: any;
        const params = Object.assign({}, args);
        const _rowIndex = $asTable.getVTRowIndex(params.row);
        const _columnIndex = $asTable.getVTColumnIndex(params.column);
        evnt.preventDefault();
        if (isLeft) {
          if (_columnIndex <= 0) {
            // 如果已经是第一列，则移动到上一行
            if (_rowIndex > 0) {
              targetRowIndex = _rowIndex - 1;
              targetRow = afterFullData[targetRowIndex];
              targetColumnIndex = visibleColumn.length - 1;
            }
          } else {
            targetColumnIndex = _columnIndex - 1;
          }
        } else if (_columnIndex >= visibleColumn.length - 1) {
          // 如果已经是最后一列，则移动到下一行
          if (_rowIndex < afterFullData.length - 1) {
            targetRowIndex = _rowIndex + 1;
            targetRow = afterFullData[targetRowIndex];
            targetColumnIndex = 0;
          }
        } else {
          targetColumnIndex = _columnIndex + 1;
        }
        const targetColumn = visibleColumn[targetColumnIndex];
        if (targetColumn) {
          if (targetRow) {
            params.rowIndex = targetRowIndex;
            params.row = targetRow;
          } else {
            params.rowIndex = _rowIndex;
          }
          params.columnIndex = targetColumnIndex;
          params.column = targetColumn;
          params.cell = $asTable.getCellElement(params.row, params.column);
          if (rowOpts.isCurrent && currentRowOpts.isFollowSelected) {
            $asTable.triggerCurrentRowEvent(evnt, params);
          }
          if (columnOpts.isCurrent && currentColumnOpts.isFollowSelected) {
            $asTable.triggerCurrentColumnEvent(evnt, params);
          }
          if (editConfig) {
            if (
              editOpts.trigger === 'click' ||
              editOpts.trigger === 'dblclick'
            ) {
              if (editOpts.mode === 'row') {
                $asTable.handleEdit(params as any, evnt);
              } else {
                $asTable.scrollToRow(params.row, params.column).then(() => {
                  $asTable.handleSelected(params as any, evnt);
                });
              }
            }
          } else {
            $asTable.scrollToRow(params.row, params.column).then(() => {
              $asTable.handleSelected(params as any, evnt);
            });
          }
        }
      },
      /**
       * 处理当前行上下方向键移动
       */
      moveCurrentRow(isUpArrow: boolean, isDwArrow: boolean, evnt: any) {
        const { treeConfig } = props;
        const { afterFullData, currentRow } = internalData;
        const treeOpts = computeTreeOpts.value;
        const childrenField = treeOpts.childrenField;
        let targetRow: any;
        if (currentRow) {
          if (treeConfig) {
            const matchObj = findTree(
              afterFullData,
              (item: any) => item === currentRow,
              { children: childrenField },
            );
            if (matchObj) {
              const { index, items } = matchObj;
              if (isUpArrow && index > 0) {
                targetRow = items[index - 1];
              } else if (isDwArrow && index < items.length - 1) {
                targetRow = items[index + 1];
              }
            }
          } else {
            const _rowIndex = $asTable.getVTRowIndex(currentRow);
            if (isUpArrow && _rowIndex > 0) {
              targetRow = afterFullData[_rowIndex - 1];
            } else if (isDwArrow && _rowIndex < afterFullData.length - 1) {
              targetRow = afterFullData[_rowIndex + 1];
            }
          }
        } else {
          targetRow = afterFullData[0];
        }
        if (targetRow) {
          evnt.preventDefault();
          const params = {
            $table: $asTable,
            row: targetRow,
            rowIndex: $asTable.getRowIndex(targetRow),
            $rowIndex: $asTable.getVMRowIndex(targetRow),
          };
          $asTable
            .scrollToRow(targetRow)
            .then(() => $asTable.triggerCurrentRowEvent(evnt, params));
        }
      },
      /**
       * 处理当前列左右方向键移动
       */
      moveCurrentColumn(
        isLeftArrow: boolean,
        isRightArrow: boolean,
        evnt: any,
      ) {
        const { currentCol, visibleColumn } = internalData;
        let targetCol: AsTableDefines.ColumnInfo | null = null;
        if (currentCol) {
          const _columnIndex = $asTable.getVTColumnIndex(currentCol);
          if (isLeftArrow && _columnIndex > 0) {
            targetCol = visibleColumn[_columnIndex - 1] || null;
          } else if (isRightArrow && _columnIndex < visibleColumn.length - 1) {
            targetCol = visibleColumn[_columnIndex + 1] || null;
          }
        } else {
          targetCol = visibleColumn[0] || null;
        }
        if (targetCol) {
          evnt.preventDefault();
          const params = {
            $table: $asTable,
            column: targetCol,
            columnIndex: $asTable.getColumnIndex(targetCol),
            $columnIndex: $asTable.getVMColumnIndex(targetCol),
          };
          $asTable
            .scrollToColumn(targetCol)
            .then(() => $asTable.triggerCurrentColumnEvent(evnt, params));
        }
      },
      /**
       * 处理可编辑单元格的方向键移动
       */
      moveArrowSelected(
        args: any,
        isLeftArrow: boolean,
        isUpArrow: boolean,
        isRightArrow: boolean,
        isDwArrow: boolean,
        evnt: any,
      ) {
        const rowOpts = computeRowOpts.value;
        const currentRowOpts = computeCurrentRowOpts.value;
        const columnOpts = computeColumnOpts.value;
        const currentColumnOpts = computeCurrentColumnOpts.value;
        const params = handleMoveSelected(
          evnt,
          args,
          isLeftArrow,
          isUpArrow,
          isRightArrow,
          isDwArrow,
        );
        if (rowOpts.isCurrent) {
          if (currentRowOpts.isFollowSelected) {
            $asTable.triggerCurrentRowEvent(evnt, params);
          } else if (isUpArrow || isDwArrow) {
            // 当前行按键上下移动
            $asTable.moveCurrentRow(isUpArrow, isDwArrow, evnt);
          }
        }
        if (columnOpts.isCurrent) {
          if (currentColumnOpts.isFollowSelected) {
            $asTable.triggerCurrentColumnEvent(evnt, params);
          } else if (isLeftArrow || isRightArrow) {
            // 当前列按键左右移动
            $asTable.moveCurrentColumn(isLeftArrow, isRightArrow, evnt);
          }
        }
      },
      /**
       * 处理 Enter 键移动
       */
      moveEnterSelected(
        args: any,
        isLeftArrow: boolean,
        isUpArrow: boolean,
        isRightArrow: boolean,
        isDwArrow: boolean,
        evnt: any,
      ) {
        const rowOpts = computeRowOpts.value;
        const currentRowOpts = computeCurrentRowOpts.value;
        const columnOpts = computeColumnOpts.value;
        const currentColumnOpts = computeCurrentColumnOpts.value;
        const params = handleMoveSelected(
          evnt,
          args,
          isLeftArrow,
          isUpArrow,
          isRightArrow,
          isDwArrow,
        );
        if (rowOpts.isCurrent && currentRowOpts.isFollowSelected) {
          $asTable.triggerCurrentRowEvent(evnt, params);
        }
        if (columnOpts.isCurrent && currentColumnOpts.isFollowSelected) {
          $asTable.triggerCurrentColumnEvent(evnt, params);
        }
      },
      handleCellMousedownEvent,
    };

    return keyboardMethods;
  },
});

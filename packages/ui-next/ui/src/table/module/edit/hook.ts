import type { AsTableConstructor, AsTableDefines } from '../../types/table';
import type { TableEditMethods, TableEditPrivateMethods } from './edit';

import { nextTick, reactive } from 'vue';

import {
  browse,
  each,
  eachTree,
  eqNull,
  find,
  findTree,
  isArray,
  isFunction,
  isNumber,
  isString,
  toArrayTree,
} from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import { addClass, removeClass } from '../../../_util/dom';
import useLog from '../../../_util/logger';
import enUS from '../../../locale/en_US';
import useLocale from '../../../locale/useLocale';
import { formatLocaleText } from '../../cell';
import { getCellValue, getRowid, isEnableConf, setCellValue } from '../../util';

const { hooks, renderer } = ArvinStudio;

/**
 * 编辑单元格参数
 */
interface EditCellParams {
  $columnIndex: number;
  $rowIndex: number;
  $table: AsTableConstructor;
  _columnIndex: number;
  _rowIndex: number;
  cell?: HTMLElement;
  column: AsTableDefines.ColumnInfo;
  columnIndex: number;
  row: any;
  rowIndex: number;
}

/**
 * 激活编辑时的可选行为
 */
interface EditActiveOptions {
  isClear?: boolean;
  isFocus?: boolean;
  isPos?: boolean;
}

hooks.add('tableEditModule', {
  setupTable($asTable) {
    const { props, reactData, internalData, prefixCls } = $asTable;
    const { refElem } = $asTable.getRefMaps();
    const {
      computeMouseOpts,
      computeEditOpts,
      computeCheckboxOpts,
      computeTreeOpts,
      computeValidOpts,
      computeRendererOpts,
    } = $asTable.getComputeMaps();

    const [locale] = useLocale('Table', enUS.Table);
    const log = useLog('Table');

    const browseObj = browse();

    let editMethods = {} as TableEditMethods;
    let editPrivateMethods = {} as TableEditPrivateMethods;

    /**
     * 将行数据写入列的编辑模型，并重置更新标记
     */
    const getEditColumnModel = (
      row: any,
      column: AsTableDefines.ColumnInfo,
    ) => {
      const { model, editRender } = column;
      if (editRender) {
        model.value = getCellValue(row, column);
        model.update = false;
      }
    };

    /**
     * 将列编辑模型中的值回写到行数据
     */
    const setEditColumnModel = (
      row: any,
      column: AsTableDefines.ColumnInfo,
    ) => {
      const { model, editRender } = column;
      if (editRender && model.update) {
        setCellValue(row, column, model.value);
        model.update = false;
        model.value = null;
      }
    };

    /**
     * 移除当前选中单元格的高亮样式
     */
    const removeCellSelectedClass = () => {
      const el = refElem.value;
      if (el) {
        const cell = el.querySelector('.col--selected');
        if (cell) {
          removeClass(cell, 'col--selected');
        }
      }
    };

    /**
     * 同步当前激活编辑单元格的编辑值
     */
    const syncActivedCell = () => {
      const { editStore, tableColumn } = reactData;
      const editOpts = computeEditOpts.value;
      const { actived } = editStore;
      const { row, column } = actived;
      if (row && column) {
        if (editOpts.mode === 'row') {
          tableColumn.forEach((column) => setEditColumnModel(row, column));
        } else {
          setEditColumnModel(row, column);
        }
      }
    };

    /**
     * 向树形结构的指定位置插入行数据
     */
    const insertTreeRow = (newRecords: any[], isAppend: boolean) => {
      const {
        tableFullTreeData,
        afterFullData,
        fullDataRowIdData,
        fullAllDataRowIdData,
      } = internalData;
      const treeOpts = computeTreeOpts.value;
      const { rowField, parentField, mapChildrenField } = treeOpts;
      const childrenField = treeOpts.childrenField;
      const funcName = isAppend ? 'push' : 'unshift';
      newRecords.forEach((item) => {
        const parentRowId = item[parentField];
        const rowid = getRowid($asTable, item);
        const matchObj = parentRowId
          ? findTree(
              tableFullTreeData,
              (item) => parentRowId === item[rowField],
              { children: mapChildrenField },
            )
          : null;
        if (matchObj) {
          const { item: parentRow } = matchObj;
          const parentRest =
            fullAllDataRowIdData[getRowid($asTable, parentRow)];
          const parentLevel = parentRest ? parentRest.level : 0;
          let pChilds = parentRow[childrenField];
          let pMapChilds = parentRow[mapChildrenField];
          if (!isArray(pChilds)) {
            pChilds = parentRow[childrenField] = [];
          }
          if (!isArray(pMapChilds)) {
            pMapChilds = parentRow[mapChildrenField] = [];
          }
          pChilds[funcName](item);
          pMapChilds[funcName](item);
          const rest = {
            row: item,
            rowid,
            _seq: -1,
            seq: -1,
            index: -1,
            _index: -1,
            $index: -1,
            treeIndex: -1,
            _tIndex: -1,
            items: pChilds,
            parent: parentRow,
            level: parentLevel + 1,
            height: 0,
            resizeHeight: 0,
            oTop: 0,
            expandHeight: 0,
          };
          // eslint-disable-next-line unicorn/prefer-hoisting-branch-code
          fullDataRowIdData[rowid] = rest;
          fullAllDataRowIdData[rowid] = rest;
        } else {
          if (parentRowId) {
            log.warn('unableInsert');
          }
          afterFullData[funcName](item);
          tableFullTreeData[funcName](item);
          const rest = {
            row: item,
            rowid,
            _seq: -1,
            seq: -1,
            index: -1,
            _index: -1,
            $index: -1,
            treeIndex: -1,
            _tIndex: -1,
            items: tableFullTreeData,
            parent: null,
            level: 0,
            height: 0,
            resizeHeight: 0,
            oTop: 0,
            expandHeight: 0,
          };
          fullDataRowIdData[rowid] = rest;
          fullAllDataRowIdData[rowid] = rest;
        }
      });
    };

    /**
     * 处理行插入逻辑
     *
     * @param records 新增数据
     * @param targetRowOrRowid 目标行或行主键，null 表示顶部，-1 表示底部
     * @param isInsertNextRow 是否插入到目标行的下一行
     */
    const handleInsertRowAt = (
      records: any,
      targetRowOrRowid: any,
      isInsertNextRow?: boolean,
    ) => {
      const { treeConfig } = props;
      const { isRowGroupStatus } = reactData;
      const {
        tableFullTreeData,
        afterFullData,
        mergeBodyList,
        tableFullData,
        fullDataRowIdData,
        fullAllDataRowIdData,
        insertRowMaps,
        removeRowMaps,
      } = internalData;
      const treeOpts = computeTreeOpts.value;
      const { transform, parentField, rowField, mapChildrenField } = treeOpts;
      const childrenField = treeOpts.childrenField;
      if (!isArray(records)) {
        records = [records];
      }
      let targetRow = targetRowOrRowid;
      if (isString(targetRowOrRowid) || isNumber(targetRowOrRowid)) {
        const rowRest = fullAllDataRowIdData[targetRowOrRowid];
        if (rowRest) {
          targetRow = rowRest.row;
        }
      }
      if (records.length === 0) {
        return Promise.resolve({ row: null, rows: [] });
      }
      $asTable.handlePushStack();
      const newRecords: any[] = reactive(
        $asTable.defineField(
          records.map((record: any) =>
            Object.assign(
              treeConfig && transform
                ? { [mapChildrenField]: [], [childrenField]: [] }
                : {},
              record,
            ),
          ),
        ),
      );
      const treeRecords: any[] =
        treeConfig && transform
          ? toArrayTree(newRecords, {
              key: rowField,
              parentKey: parentField,
              children: childrenField,
            })
          : [];
      if (eqNull(targetRow)) {
        // 插入到顶部
        if (treeConfig && transform) {
          insertTreeRow(newRecords, false);
        } else if (isRowGroupStatus) {
          // 数据分组后不支持插入
          if (treeConfig) {
            throw new Error(formatLocaleText(locale?.value.noTree, 'insert'));
          }
          log.error('noGroup', ['insert']);
        } else {
          newRecords.forEach((item) => {
            const rowid = getRowid($asTable, item);
            const rest = {
              row: item,
              rowid,
              _seq: -1,
              seq: -1,
              index: -1,
              _index: -1,
              $index: -1,
              treeIndex: -1,
              _tIndex: -1,
              items: afterFullData,
              parent: null,
              level: 0,
              height: 0,
              resizeHeight: 0,
              oTop: 0,
              expandHeight: 0,
            };
            fullDataRowIdData[rowid] = rest;
            fullAllDataRowIdData[rowid] = rest;
            afterFullData.unshift(item);
            tableFullData.unshift(item);
          });
          // 刷新单元格合并
          mergeBodyList.forEach((mergeItem: any) => {
            const { row: mergeRowIndex } = mergeItem;
            if (mergeRowIndex >= 0) {
              mergeItem.row = mergeRowIndex + newRecords.length;
            }
          });
        }
      } else if (targetRow === -1) {
        // 插入到底部
        if (treeConfig && transform) {
          insertTreeRow(newRecords, true);
        } else if (isRowGroupStatus) {
          if (treeConfig) {
            throw new Error(formatLocaleText(locale?.value.noTree, 'insert'));
          }
          log.error('noGroup', ['insert']);
        } else {
          newRecords.forEach((item) => {
            const rowid = getRowid($asTable, item);
            const rest = {
              row: item,
              rowid,
              _seq: -1,
              seq: -1,
              index: -1,
              _index: -1,
              $index: -1,
              treeIndex: -1,
              _tIndex: -1,
              items: afterFullData,
              parent: null,
              level: 0,
              height: 0,
              resizeHeight: 0,
              oTop: 0,
              expandHeight: 0,
            };
            fullDataRowIdData[rowid] = rest;
            fullAllDataRowIdData[rowid] = rest;
            afterFullData.push(item);
            tableFullData.push(item);
          });
        }
      } else if (treeConfig && transform) {
        // 虚拟树：插入到目标节点的子级
        const matchMapObj = findTree(
          tableFullTreeData,
          (item) => targetRow[rowField] === item[rowField],
          { children: mapChildrenField },
        );
        if (matchMapObj) {
          const { parent: parentRow } = matchMapObj;
          const parentMapChilds = parentRow
            ? parentRow[mapChildrenField]
            : tableFullTreeData;
          const parentRest = fullDataRowIdData[getRowid($asTable, parentRow)];
          const parentLevel = parentRest ? parentRest.level : 0;
          treeRecords.forEach((row, i) => {
            if (parentRow) {
              if (row[parentField] !== parentRow[rowField]) {
                log.error('errProp', [
                  `${parentField}=${row[parentField]}`,
                  `${parentField}=${parentRow[rowField]}`,
                ]);
                row[parentField] = parentRow[rowField];
              }
            } else if (row[parentField] !== null) {
              if (!eqNull(row[parentField])) {
                log.error('errProp', [
                  `${parentField}=${row[parentField]}`,
                  'null',
                ]);
              }
              row[parentField] = null;
            }
            let targetIndex = matchMapObj.index + i;
            if (isInsertNextRow) {
              targetIndex += 1;
            }
            parentMapChilds.splice(targetIndex, 0, row);
          });
          eachTree(
            treeRecords,
            (item) => {
              const rowid = getRowid($asTable, item);
              const rest = {
                row: item,
                rowid,
                _seq: -1,
                seq: -1,
                index: -1,
                _index: -1,
                $index: -1,
                treeIndex: -1,
                _tIndex: -1,
                items: parentMapChilds,
                parent: parentRow,
                level: parentLevel + 1,
                height: 0,
                resizeHeight: 0,
                oTop: 0,
                expandHeight: 0,
              };
              if (item[childrenField]) {
                item[mapChildrenField] = item[childrenField];
              }
              fullDataRowIdData[rowid] = rest;
              fullAllDataRowIdData[rowid] = rest;
            },
            { children: childrenField },
          );
          // 同步到源数据
          if (parentRow) {
            const matchObj = findTree(
              tableFullTreeData,
              (item) => targetRow[rowField] === item[rowField],
              { children: childrenField },
            );
            if (matchObj) {
              const parentChilds = matchObj.items;
              let targetIndex = matchObj.index;
              if (isInsertNextRow) {
                targetIndex += 1;
              }
              parentChilds.splice(targetIndex, 0, ...treeRecords);
            }
          }
        } else {
          log.warn('unableInsert');
          insertTreeRow(newRecords, true);
        }
      } else if (isRowGroupStatus) {
        if (treeConfig) {
          throw new Error(formatLocaleText(locale?.value.noTree, 'insert'));
        }
        log.error('noGroup', ['insert']);
      } else {
        if (treeConfig) {
          throw new Error(formatLocaleText(locale?.value.noTree, 'insert'));
        }
        let afIndex = -1;
        // 如果是可视索引
        if (isNumber(targetRow)) {
          if (targetRow < afterFullData.length) {
            afIndex = targetRow;
          }
        } else {
          afIndex = $asTable.findRowIndexOf(afterFullData, targetRow);
        }
        if (isInsertNextRow) {
          afIndex = Math.min(afterFullData.length, afIndex + 1);
        }
        if (afIndex === -1) {
          throw new Error(formatLocaleText(locale?.value.unableInsert));
        }
        afterFullData.splice(afIndex, 0, ...newRecords);
        const tfIndex = $asTable.findRowIndexOf(tableFullData, targetRow);
        if (tfIndex > -1) {
          tableFullData.splice(
            tfIndex + (isInsertNextRow ? 1 : 0),
            0,
            ...newRecords,
          );
        } else {
          tableFullData.push(...newRecords);
        }
        // 刷新单元格合并
        mergeBodyList.forEach((mergeItem: any) => {
          const { row: mergeRowIndex, rowspan: mergeRowspan } = mergeItem;
          if (mergeRowIndex >= afIndex) {
            mergeItem.row = mergeRowIndex + newRecords.length;
          } else if (
            isInsertNextRow
              ? mergeRowIndex + mergeRowspan >= afIndex
              : mergeRowIndex + mergeRowspan > afIndex
          ) {
            mergeItem.rowspan = mergeRowspan + newRecords.length;
          }
        });
      }

      /**
       * 记录新增数据的状态
       */
      const handleStatus = (newRow: any) => {
        const rowid = getRowid($asTable, newRow);
        // 如果是被删除的数据，则还原状态
        if (removeRowMaps[rowid]) {
          delete removeRowMaps[rowid];
          if (insertRowMaps[rowid]) {
            delete insertRowMaps[rowid];
          }
        } else {
          insertRowMaps[rowid] = newRow;
        }
      };
      if (treeConfig && transform) {
        eachTree(treeRecords, handleStatus, { children: mapChildrenField });
      } else {
        newRecords.forEach(handleStatus);
      }

      reactData.removeRowFlag++;
      reactData.insertRowFlag++;
      $asTable.cacheRowMap(false);
      $asTable.updateScrollYStatus();
      $asTable.handleTableData(treeConfig && transform);
      if (!(treeConfig && transform)) {
        $asTable.updateAfterDataIndex();
      }
      $asTable.updateFooter();
      $asTable.handleUpdateBodyMerge();
      $asTable.checkSelectionStatus();
      if (reactData.scrollYLoad) {
        $asTable.updateScrollYSpace();
      }
      return nextTick()
        .then(() => {
          $asTable.updateCellAreas();
          return $asTable.recalculate(true);
        })
        .then(() => {
          return {
            row:
              newRecords.length > 0 ? newRecords[newRecords.length - 1] : null,
            rows: newRecords,
          };
        });
    };

    /**
     * 处理子行插入逻辑（树形结构）
     */
    const handleInsertChildRowAt = (
      records: any,
      parentRowOrParentId: any,
      targetRow: any,
      isInsertNextRow?: boolean,
    ) => {
      const { treeConfig } = props;
      const { fullAllDataRowIdData } = internalData;
      const treeOpts = computeTreeOpts.value;
      const { transform, rowField, parentField } = treeOpts;
      if (treeConfig && transform) {
        if (!isArray(records)) {
          records = [records];
        }
        let parentRow = parentRowOrParentId;
        if (isString(parentRowOrParentId) || isNumber(parentRowOrParentId)) {
          const rowRest = fullAllDataRowIdData[parentRowOrParentId];
          if (rowRest) {
            parentRow = rowRest.row;
          }
        }
        return handleInsertRowAt(
          records.map((item: any) =>
            Object.assign({}, item, { [parentField]: parentRow[rowField] }),
          ),
          targetRow,
          isInsertNextRow,
        );
      }
      log.error('errProp', [
        'tree-config.transform=false',
        'tree-config.transform=true',
      ]);
      return Promise.resolve({ row: null, rows: [] });
    };

    /**
     * 清除当前激活的编辑状态
     */
    const handleClearEdit = (evnt: Event | null, targetRow?: any) => {
      const { editStore } = reactData;
      const { actived, focused } = editStore;
      const { row, column } = actived;
      const validOpts = computeValidOpts.value;
      if (row || column) {
        if (
          targetRow &&
          getRowid($asTable, targetRow) !== getRowid($asTable, row)
        ) {
          return nextTick();
        }
        syncActivedCell();
        $asTable.updateFooter();
        actived.args = null;
        actived.row = null;
        actived.column = null;
        $asTable.dispatchEvent(
          'editClosed',
          {
            row,
            rowIndex: $asTable.getRowIndex(row),
            $rowIndex: $asTable.getVMRowIndex(row),
            column,
            columnIndex: $asTable.getColumnIndex(column),
            $columnIndex: $asTable.getVMColumnIndex(column),
          },
          evnt || null,
        );
      }
      focused.row = null;
      focused.column = null;
      if (
        validOpts.autoClear &&
        validOpts.msgMode !== 'full' &&
        $asTable.clearValidate
      ) {
        return $asTable.clearValidate();
      }
      return nextTick().then(() => $asTable.updateCellAreas());
    };

    /**
     * 激活指定单元格的编辑状态
     */
    const handleEditActive = (
      params: EditCellParams,
      evnt: Event | null,
      options: EditActiveOptions,
    ) => {
      const { editConfig, mouseConfig } = props;
      const { editStore, tableColumn } = reactData;
      const editOpts = computeEditOpts.value;
      const { mode } = editOpts;
      const { actived, focused } = editStore;
      const { row, column } = params;
      const { editRender } = column;
      const { isFocus, isPos, isClear } = options;
      const cell = (params.cell ||
        $asTable.getCellElement(row, column)) as HTMLElement;
      const beforeEditMethod = editOpts.beforeEditMethod;
      const editParams = { ...params, cell };
      // 激活编辑
      if (
        cell &&
        isEnableConf(editConfig) &&
        isEnableConf(editRender) &&
        !$asTable.isPendingByRow(row) &&
        !$asTable.isAggregateRecord(row)
      ) {
        if (
          actived.row !== row ||
          (mode === 'cell' ? actived.column !== column : false)
        ) {
          // 判断是否禁用编辑
          let type: 'editActivated' | 'editDisabled' = 'editDisabled';
          if (
            !beforeEditMethod ||
            beforeEditMethod({
              ...editParams,
              $table: $asTable,
            })
          ) {
            if (mouseConfig) {
              $asTable.clearSelected?.();
              if ($asTable.clearCellAreas) {
                $asTable.clearCellAreas();
                $asTable.clearCopyCellArea();
              }
            }
            $asTable.closeTooltip();
            if (actived.column) {
              handleClearEdit(evnt);
            }
            type = 'editActivated';
            column.renderHeight = cell.offsetHeight;
            actived.args = editParams;
            actived.row = row;
            actived.column = column;
            $asTable.handlePushStack();
            if (isClear) {
              setCellValue(row, column, null);
            }
            if (mode === 'row') {
              tableColumn.forEach((column: any) =>
                getEditColumnModel(row, column),
              );
            } else {
              getEditColumnModel(row, column);
            }
            const afterEditMethod = editOpts.afterEditMethod;
            nextTick(() => {
              if (isFocus) {
                $asTable.handleFocus(editParams, evnt);
              }
              if (afterEditMethod) {
                afterEditMethod({
                  ...editParams,
                  $table: $asTable,
                });
              }
            });
          }
          $asTable.dispatchEvent(
            type,
            {
              row,
              rowIndex: $asTable.getRowIndex(row),
              $rowIndex: $asTable.getVMRowIndex(row),
              column,
              columnIndex: $asTable.getColumnIndex(column),
              $columnIndex: $asTable.getVMColumnIndex(column),
            },
            evnt,
          );
        } else {
          const { column: oldColumn } = actived;
          if (mouseConfig) {
            $asTable.clearSelected?.();
            if ($asTable.clearCellAreas) {
              $asTable.clearCellAreas();
              $asTable.clearCopyCellArea();
            }
          }
          if (oldColumn && oldColumn !== column) {
            const { model: oldModel } = oldColumn;
            if (oldModel.update) {
              setCellValue(row, oldColumn, oldModel.value);
            }
            if ($asTable.clearValidate) {
              $asTable.clearValidate(row, column);
            }
          }
          column.renderHeight = cell.offsetHeight;
          actived.args = editParams;
          actived.column = column;
          if (isPos) {
            setTimeout(() => {
              $asTable.handleFocus(editParams, evnt);
            }, 0);
          }
        }
        focused.column = null;
        focused.row = null;
        $asTable.focus();
      }
      return nextTick();
    };

    /**
     * 激活指定行的编辑状态
     */
    const handleEditCell = (
      row: any,
      fieldOrColumn: AsTableDefines.ColumnInfo | null | string,
      options: EditActiveOptions,
    ) => {
      const { editConfig } = props;
      const { isPos } = options;
      const column = isString(fieldOrColumn)
        ? $asTable.getColumnByField(fieldOrColumn)
        : fieldOrColumn;
      if (
        row &&
        column &&
        isEnableConf(editConfig) &&
        isEnableConf(column.editRender) &&
        !$asTable.isAggregateRecord(row)
      ) {
        return Promise.resolve(
          isPos ? $asTable.scrollToRow(row, column) : null,
        ).then(() => {
          const cell = $asTable.getCellElement(row, column);
          if (cell) {
            handleEditActive(
              {
                row,
                rowIndex: $asTable.getRowIndex(row),
                $rowIndex: $asTable.getVMRowIndex(row),
                _rowIndex: $asTable.getVTRowIndex(row),
                column,
                columnIndex: $asTable.getColumnIndex(column),
                $columnIndex: $asTable.getVMColumnIndex(column),
                _columnIndex: $asTable.getVTColumnIndex(column),
                cell,
                $table: $asTable,
              },
              null,
              {
                isFocus: isPos,
                isPos,
              },
            );
            internalData._lastCallTime = Date.now();
          }
          return nextTick();
        });
      }
      return nextTick();
    };

    editMethods = {
      /**
       * 往表格中插入临时数据
       */
      insert(records) {
        return handleInsertRowAt(records, null);
      },
      /**
       * 往表格指定行前插入临时数据
       * 如果 row 为空则插入到顶部，如果为树结构，则插入到目标节点顶部
       * 如果 row 为 -1 则插入到底部，如果为树结构，则插入到目标节点底部
       * 如果 row 为有效行则插入到该行之前
       */
      insertAt(records, targetRowOrRowid) {
        return handleInsertRowAt(records, targetRowOrRowid);
      },
      /**
       * 往表格指定行后插入临时数据
       */
      insertNextAt(records, targetRowOrRowid) {
        return handleInsertRowAt(records, targetRowOrRowid, true);
      },
      /**
       * 往树形结构的指定父节点插入子节点
       */
      insertChild(records, parentRowOrParentId) {
        return handleInsertChildRowAt(records, parentRowOrParentId, null);
      },
      /**
       * 往树形结构的指定父节点、指定位置插入子节点
       */
      insertChildAt(records, parentRowOrParentId, targetRow) {
        return handleInsertChildRowAt(records, parentRowOrParentId, targetRow);
      },
      /**
       * 往树形结构的指定父节点、指定位置后插入子节点
       */
      insertChildNextAt(records, parentRowOrParentId, targetRow) {
        return handleInsertChildRowAt(
          records,
          parentRowOrParentId,
          targetRow,
          true,
        );
      },
      /**
       * 删除指定行数据
       * 如果传 row 则删除一行
       * 如果传 rows 则删除多行
       * 如果为空则删除所有
       */
      remove(rows: any) {
        const { treeConfig } = props;
        const { editStore, isRowGroupStatus } = reactData;
        const {
          tableFullTreeData,
          selectCheckboxMaps,
          afterFullData,
          mergeBodyList,
          tableFullData,
          pendingRowMaps,
          insertRowMaps,
          removeRowMaps,
        } = internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const treeOpts = computeTreeOpts.value;
        const { transform, mapChildrenField } = treeOpts;
        const childrenField = treeOpts.childrenField;
        const { actived } = editStore;
        const { checkField } = checkboxOpts;
        let delList: any[] = [];
        if (!rows) {
          rows = tableFullData;
        } else if (!isArray(rows)) {
          rows = [rows];
        }
        if (rows.length === 0) {
          return Promise.resolve({ row: null, rows: [] });
        }
        $asTable.handlePushStack();
        // 如果是新增，则保存记录
        rows.forEach((row: any) => {
          if ($asTable.isInsertByRow(row)) {
            return;
          }

          const rowid = getRowid($asTable, row);
          removeRowMaps[rowid] = row;
        });
        // 如果绑定了多选属性，则更新状态
        if (!checkField) {
          rows.forEach((row: any) => {
            const rowid = getRowid($asTable, row);
            if (selectCheckboxMaps[rowid]) {
              delete selectCheckboxMaps[rowid];
            }
          });
          reactData.updateCheckboxFlag++;
        }
        // 从数据源中移除
        if (tableFullData === rows) {
          rows = delList = tableFullData.slice(0);
          internalData.tableFullData = [];
          internalData.afterFullData = [];
          $asTable.clearMergeCells();
        } else if (treeConfig && transform) {
          // 如果为虚拟树
          rows.forEach((row: any) => {
            const rowid = getRowid($asTable, row);
            const matchMapObj = findTree(
              tableFullTreeData,
              (item) => rowid === getRowid($asTable, item),
              { children: mapChildrenField },
            );
            if (matchMapObj) {
              const rItems = matchMapObj.items.splice(matchMapObj.index, 1);
              delList.push(rItems[0]);
            }
            const matchObj = findTree(
              tableFullTreeData,
              (item) => rowid === getRowid($asTable, item),
              { children: childrenField },
            );
            if (matchObj) {
              matchObj.items.splice(matchObj.index, 1);
            }
            const afIndex = $asTable.findRowIndexOf(afterFullData, row);
            if (afIndex > -1) {
              afterFullData.splice(afIndex, 1);
            }
          });
        } else if (isRowGroupStatus) {
          // 数据分组后不支持删除
          log.warn('noGroup', ['remove']);
        } else {
          rows.forEach((row: any) => {
            const tfIndex = $asTable.findRowIndexOf(tableFullData, row);
            if (tfIndex > -1) {
              const rItems = tableFullData.splice(tfIndex, 1);
              delList.push(rItems[0]);
            }
            const afIndex = $asTable.findRowIndexOf(afterFullData, row);
            if (afIndex > -1) {
              // 刷新单元格合并
              mergeBodyList.forEach((mergeItem) => {
                const { row: mergeRowIndex, rowspan: mergeRowspan } = mergeItem;
                if (mergeRowIndex > afIndex) {
                  mergeItem.row = mergeRowIndex - 1;
                } else if (mergeRowIndex + mergeRowspan > afIndex) {
                  mergeItem.rowspan = mergeRowspan - 1;
                }
              });
              afterFullData.splice(afIndex, 1);
            }
          });
        }
        // 如果当前行被激活编辑，则清除激活状态
        if (actived.row && $asTable.findRowIndexOf(rows, actived.row) > -1) {
          editMethods.clearEdit();
        }
        // 从新增中移除已删除的数据
        rows.forEach((row: any) => {
          const rowid = getRowid($asTable, row);
          if (insertRowMaps[rowid]) {
            delete insertRowMaps[rowid];
          }
          if (pendingRowMaps[rowid]) {
            delete pendingRowMaps[rowid];
          }
        });
        reactData.removeRowFlag++;
        reactData.insertRowFlag++;
        reactData.pendingRowFlag++;
        $asTable.cacheRowMap(false);
        $asTable.handleTableData(treeConfig && transform);
        $asTable.updateFooter();
        $asTable.handleUpdateBodyMerge();
        if (!(treeConfig && transform)) {
          $asTable.updateAfterDataIndex();
        }
        $asTable.checkSelectionStatus();
        if (reactData.scrollYLoad) {
          $asTable.updateScrollYSpace();
        }
        return nextTick()
          .then(() => {
            $asTable.updateCellAreas();
            return $asTable.recalculate(true);
          })
          .then(() => {
            return {
              row: delList.length > 0 ? delList[delList.length - 1] : null,
              rows: delList,
            };
          });
      },
      /**
       * 删除复选框选中的数据
       */
      removeCheckboxRow() {
        return editMethods
          .remove($asTable.getCheckboxRecords())
          .then((params) => {
            $asTable.clearCheckboxRow();
            return params;
          });
      },
      /**
       * 删除单选框选中的数据
       */
      removeRadioRow() {
        const radioRecord = $asTable.getRadioRecord();
        return editMethods.remove(radioRecord || []).then((params) => {
          $asTable.clearRadioRow();
          return params;
        });
      },
      /**
       * 删除当前行选中的数据
       */
      removeCurrentRow() {
        const currentRecord = $asTable.getCurrentRecord();
        return editMethods.remove(currentRecord || []).then((params) => {
          $asTable.clearCurrentRow();
          return params;
        });
      },
      /**
       * 获取表格数据集，包含新增、删除、修改、标记
       */
      getRecordset() {
        const removeRecords = editMethods.getRemoveRecords();
        const pendingRecords = $asTable.getPendingRecords();
        const delRecords = removeRecords.concat(pendingRecords);
        // 如果已经被删除，则无需放到更新数组
        const updateRecords = editMethods
          .getUpdateRecords()
          .filter((row) =>
            delRecords.every((item) => !$asTable.eqRow(item, row)),
          );
        return {
          insertRecords: editMethods.getInsertRecords(),
          removeRecords,
          updateRecords,
          pendingRecords,
        };
      },
      /**
       * 获取新增的临时数据
       */
      getInsertRecords() {
        const { fullAllDataRowIdData, insertRowMaps } = internalData;
        const insertRecords: any[] = [];
        each(insertRowMaps, (row, rowid) => {
          if (fullAllDataRowIdData[rowid]) {
            insertRecords.push(row);
          }
        });
        return insertRecords;
      },
      /**
       * 获取已删除的数据
       */
      getRemoveRecords() {
        const { removeRowMaps } = internalData;
        const removeRecords: any[] = [];
        each(removeRowMaps, (row) => {
          removeRecords.push(row);
        });
        return removeRecords;
      },
      /**
       * 获取更新数据
       * 只精准匹配 row 的更改
       * 如果是树表格，子节点更改状态不会影响父节点的更新状态
       */
      getUpdateRecords() {
        const { keepSource, treeConfig } = props;
        const { tableFullData, tableFullTreeData } = internalData;
        const treeOpts = computeTreeOpts.value;
        const updateRecords: any[] = [];
        if (keepSource) {
          syncActivedCell();
          if (treeConfig) {
            const childrenField = treeOpts.childrenField;
            eachTree(
              tableFullTreeData,
              (row) => {
                if ($asTable.isUpdateByRow(row)) {
                  updateRecords.push(row);
                }
              },
              { children: childrenField },
            );
          } else {
            tableFullData.forEach((row) => {
              if ($asTable.isUpdateByRow(row)) {
                updateRecords.push(row);
              }
            });
          }
        }
        return updateRecords;
      },
      /**
       * 获取当前激活编辑的单元格
       */
      getEditCell() {
        const { editStore } = reactData;
        const { row, column } = editStore.actived;
        if (column && row) {
          return {
            row,
            rowIndex: $asTable.getRowIndex(row),
            column,
            columnIndex: $asTable.getColumnIndex(column),
          };
        }
        return null;
      },
      /**
       * 获取选中的单元格
       */
      getSelectedCell() {
        const { editStore } = reactData;
        const { row, column } = editStore.selected;
        if (row && column) {
          return {
            row,
            column,
          };
        }
        return null;
      },
      /**
       * 清除激活的编辑
       */
      clearEdit(row) {
        return handleClearEdit(null, row);
      },
      /**
       * 清除所选中源状态
       */
      clearSelected() {
        const { editStore } = reactData;
        const { selected } = editStore;
        selected.row = null;
        selected.column = null;
        removeCellSelectedClass();
        return nextTick();
      },
      /**
       * 判断行是否为激活编辑状态
       */
      isEditByRow(row) {
        const { editStore } = reactData;
        return editStore.actived.row === row;
      },
      /**
       * 激活行编辑
       */
      setEditRow(row, fieldOrColumn, options) {
        const { visibleColumn } = internalData;
        let column: any = find(visibleColumn, (column) =>
          isEnableConf(column.editRender),
        );
        let isPos = false;
        if (fieldOrColumn) {
          isPos = true;
          if (fieldOrColumn !== true) {
            column = isString(fieldOrColumn)
              ? $asTable.getColumnByField(fieldOrColumn)
              : fieldOrColumn;
          }
        }
        return handleEditCell(
          row,
          column,
          Object.assign(
            {
              isPos,
              isFocus: isPos,
            },
            options,
          ),
        );
      },
      /**
       * 激活单元格编辑
       */
      setEditCell(row, fieldOrColumn, options) {
        return handleEditCell(
          row,
          fieldOrColumn,
          Object.assign(
            {
              isFocus: true,
              isPos: true,
            },
            options,
          ),
        );
      },
      /**
       * 只对 trigger=dblclick 有效，选中单元格
       */
      setSelectCell(row, fieldOrColumn) {
        const { tableData } = reactData;
        const editOpts = computeEditOpts.value;
        const column = isString(fieldOrColumn)
          ? $asTable.getColumnByField(fieldOrColumn)
          : fieldOrColumn;
        if (row && column && editOpts.trigger !== 'manual') {
          const rowIndex = $asTable.findRowIndexOf(tableData, row);
          if (rowIndex > -1 && column) {
            const cell = $asTable.getCellElement(row, column);
            const params = {
              $table: $asTable,
              row,
              rowIndex,
              $rowIndex: $asTable.getVMRowIndex(row),
              _rowIndex: $asTable.getVTRowIndex(row),
              column,
              columnIndex: $asTable.getColumnIndex(column),
              $columnIndex: $asTable.getVMColumnIndex(column),
              _columnIndex: $asTable.getVTColumnIndex(column),
              cell,
            };
            $asTable.handleSelected(params, null);
          }
        }
        return nextTick();
      },
    };

    /**
     * 处理单元格聚焦
     */
    const handleCellFocus = (
      cell: HTMLElement,
      params: {
        $table: AsTableConstructor;
        column: AsTableDefines.ColumnInfo;
        row: any;
      },
    ) => {
      const { editConfig } = props;
      const { column } = params;
      const { editRender } = column;
      const editOpts = computeEditOpts.value;
      if (editConfig && isEnableConf(editRender)) {
        const rendererOpts = computeRendererOpts.value;
        const renderName = editRender.name;
        const compRender: any = renderName
          ? rendererOpts[renderName] || renderer.get(renderName)
          : null;
        let autoFocus: boolean | string = editRender.autoFocus || false;
        let autoSelect = editRender.autoSelect || false;
        let inputElem: HTMLElement | null = null;
        // 是否启用聚焦
        if (editOpts.autoFocus) {
          if (!autoFocus && compRender) {
            autoFocus = compRender.tableAutoFocus || compRender.tableAutofocus;
          }
          if (!autoSelect && compRender) {
            autoSelect = compRender.tableAutoSelect;
          }
          if (isFunction(autoFocus)) {
            inputElem = (autoFocus as any)(params);
          } else if (autoFocus) {
            // eslint-disable-next-line unicorn/prefer-ternary
            if (autoFocus === true) {
              // 自动匹配模式，会自动匹配第一个可输入元素
              inputElem = cell.querySelector('input,textarea');
            } else {
              inputElem = cell.querySelector(autoFocus);
            }
            if (inputElem) {
              inputElem.focus();
            }
          }
        }
        return inputElem as HTMLInputElement;
      }
      return null;
    };

    editPrivateMethods = {
      /**
       * 处理激活编辑
       */
      handleEdit(params, evnt, options) {
        return handleEditActive(
          params,
          evnt,
          Object.assign(
            {
              isFocus: true,
              isPos: true,
            },
            options,
          ),
        );
      },
      /**
       * 处理取消编辑
       */
      handleClearEdit,
      handleCellFocus,
      /**
       * 处理聚焦
       */
      handleFocus(params) {
        const { row, column, cell } = params;
        const { editRender } = column;
        const editOpts = computeEditOpts.value;
        if (isEnableConf(editRender)) {
          const autoSelect = editRender.autoSelect;
          const inputElem = handleCellFocus(cell as HTMLElement, params);
          if (inputElem) {
            if (autoSelect) {
              inputElem.select();
            } else if (browseObj.msie) {
              // 保持一致行为，光标移到末端
              const textRange = (inputElem as any).createTextRange();
              textRange.collapse(false);
              textRange.select();
            }
          } else // 是否自动定位
          if (editOpts.autoPos && !column.fixed) {
            $asTable.scrollToRow(row, column);
          }
        }
      },
      /**
       * 处理选中源
       */
      handleSelected(params, evnt) {
        const { mouseConfig, editConfig } = props;
        const { editStore } = reactData;
        const mouseOpts = computeMouseOpts.value;
        const editOpts = computeEditOpts.value;
        const { actived, selected } = editStore;
        const { row, column } = params;
        const isMouseSelected = mouseConfig && mouseOpts.selected;
        const selectMethod = () => {
          if (
            isMouseSelected &&
            (selected.row !== row || selected.column !== column) &&
            (actived.row !== row ||
              (editOpts.mode === 'cell' ? actived.column !== column : false))
          ) {
            handleClearEdit(evnt);
            $asTable.clearSelected?.();
            if ($asTable.clearCellAreas) {
              $asTable.clearCellAreas();
              $asTable.clearCopyCellArea();
            }
            selected.args = params;
            selected.row = row;
            selected.column = column;
            if (isMouseSelected) {
              editPrivateMethods.addCellSelectedClass();
            }
            $asTable.focus();
            // 如果是支持可复用控件
            if (
              editConfig &&
              editOpts.isReuseKeep &&
              isEnableConf(editOpts) &&
              isEnableConf(column.editRender)
            ) {
              setTimeout(() => {
                const cell = $asTable.getCellElement(row, column);
                if (cell) {
                  const hasReusekeep = cell.querySelector(
                    `.${prefixCls.value}-reusekeep-control`,
                  );
                  if (hasReusekeep) {
                    handleCellFocus(cell, params);
                  }
                }
              }, 0);
            }
            if (evnt) {
              $asTable.dispatchEvent('cellSelected', params, evnt);
            }
          }
          return nextTick();
        };
        return selectMethod();
      },
      /**
       * 添加选中单元格的高亮样式
       */
      addCellSelectedClass() {
        const { editStore } = reactData;
        const { selected } = editStore;
        const { row, column } = selected;
        removeCellSelectedClass();
        if (row && column) {
          const cell = $asTable.getCellElement(row, column);
          if (cell) {
            addClass(cell, 'col--selected');
          }
        }
      },
    };

    return { ...editMethods, ...editPrivateMethods };
  },
});

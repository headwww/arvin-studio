import type { ComputedRef } from 'vue';

import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePrivateMethods,
  AsTablePropTypes,
  TableInternalData,
  TableReactData,
} from './types/table';

import { reactive, watch } from 'vue';

import {
  arrayIndexOf,
  eqNull,
  findTree,
  first,
  floor,
  get,
  isArray,
  isBoolean,
  isEqual,
  isFunction,
  isNull,
  isNumber,
  isString,
  isUndefined,
  last,
  set,
  toInteger,
  toNumber,
  uniqueId,
} from '@arvin-studio/kit';

import { isPx, isScale, queryElement } from '../_util/dom';
import { ColumnInfo } from './columnInfo';

export function isEnableConf(conf: any): boolean {
  return conf && conf.enabled !== false;
}

export function createInternalData(): TableInternalData {
  return {
    tZindex: 0,
    // 懒加载中的展开行的集合
    rowExpandLazyLoadedMaps: {},
    initStatus: false,
    inited: false,
    tooltipTimeout: null,
    // 树结构数据，已展开保留的行集合
    treeExpandedReserveRowMap: {},
    // 表格宽度
    tableWidth: 0,
    // 表格高度
    tableHeight: 0,

    // 表头高度
    tHeaderHeight: 0,
    // 表体高度
    tBodyHeight: 0,
    // 表尾高度
    tFooterHeight: 0,

    // 渲染所有列
    visibleColumn: [],
    // 收集的列配置（带分组）
    collectColumn: [],
    // 数据集（仅可视）
    visibleDataRowIdData: {},
    // 懒加载中的树节点的集合
    treeExpandLazyLoadedMaps: {},
    // 已展开的分组行
    rowGroupExpandedMaps: {},
    fullColumnIdData: {},
    tableSourceData: [],
    isCurrDeepKey: false,
    // 当前行
    currentRow: null,
    // 当前 hover 行
    hoverRow: null,
    currKeyField: '',
    // 完整所有列（不带分组）
    tableFullColumn: [],
    // 单选框属性，已选中保留的行
    radioReserveRow: null,
    // 复选框属性，已选中保留的行集合
    checkboxReserveRowMap: {},
    // 树结构数据，不确定状态的集合
    treeIndeterminateRowMaps: {},
    // 复选框属性，已选中的行集合
    selectCheckboxMaps: {},
    // 已展开的行集合
    rowExpandedMaps: {},
    // 列表完整数据、条件处理后
    tableFullData: [],
    // 树结构完整数据、条件处理后
    tableFullTreeData: [],
    // 行分组全量数据、条件处理后
    tableFullGroupData: [],
    tableSynchData: [],
    afterTreeFullData: [],
    // 全量数据集（包括当前和已删除）
    fullAllDataRowIdData: {},
    // 行数据，已展开保留的行集合
    rowExpandedReserveRowMap: {},
    popupToWrapperElem: null,
    // 数据集（仅当前）
    fullDataRowIdData: {},
    // 渲染中缓存数据
    sourceDataRowIdData: {},
    // 列表条件处理后数据集合
    afterFullRowMaps: {},
    afterGroupFullData: [],
    afterFullData: [],
    keepUpdateFieldMaps: {},

    lastSTime: 0,
    // 最后滚动位置
    lastScrollLeft: 0,
    lastScrollTop: 0,
    // 存放横向 X 虚拟滚动相关的信息
    scrollXStore: {
      preloadSize: 0,
      offsetSize: 0,
      visibleSize: 0,
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      startIndex: 0,
      endIndex: 0,
    },
    // 存放纵向 Y 虚拟滚动相关信息
    scrollYStore: {
      preloadSize: 0,
      offsetSize: 0,
      visibleSize: 0,
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      startIndex: 0,
      endIndex: 0,
    },
    customHeight: 0,
    customMinHeight: 0,
    customMaxHeight: 0,
    cvCacheMaps: {},
    elemStore: {},
    fullColumnFieldData: {},
    // 已展开树节点集合
    treeExpandedMaps: {},
    // 已新增的临时行
    insertRowMaps: {},
    // 已删除行
    removeRowMaps: {},
    fullCellHeightMaps: {},
    fullCellStoreMaps: {},
    headerFullDataColData: {},
    footerFullDataRowData: {},
    // 合并单元格的数据
    mergeBodyList: [],
    mergeBodyMaps: {},
    // 已合并单元格数据集合
    mergeBodyRowMaps: {},
    mergeBodyColMaps: {},
    mergeBodyCellMaps: {},
    // 合并表尾的数据
    mergeFooterList: [],
    mergeFooterMaps: {},
    // 已合并表尾数据集合
    mergeFooterCellMaps: {},
    mergeFooterRowMaps: {},
    mergeFooterColMaps: {},
    pendingRowMaps: {},
    currentCol: null,
    // 合并表头单元格的数据
    mergeHeaderList: [],
    mergeHeaderRowMaps: {},
    mergeHeaderColMaps: {},
    mergeHeaderMaps: {},
    // 已合并单元格数据集合
    mergeHeaderCellMaps: {},
    rceDelay: 0,

    stackHistoryStore: {
      undoStacks: [],
      redoStacks: [],
    },
    teleportToWrapperElem: null,
    isActivated: false,
  };
}

export function createReactData(): TableReactData {
  return {
    dragTipText: '',
    isCrossDragRow: false,
    lazScrollLoading: false,
    rowHeightStore: {
      large: 48,
      medium: 44,
      small: 40,
    },
    currColFlag: 1,
    aggHandleAggColumns: [],
    // 渲染的列分组
    tableGroupColumn: [],
    // 存放列相关的信息
    columnStore: {
      leftList: [],
      centerList: [],
      rightList: [],
      resizeList: [],
      pxList: [],
      pxMinList: [],
      autoMinList: [],
      scaleList: [],
      scaleMinList: [],
      autoList: [],
      remainList: [],
    },
    // 当前选中的筛选列
    filterStore: {
      targetEl: null,
      isAllSelected: false,
      isIndeterminate: false,
      style: null,
      column: null,
      visible: false,
      maxHeight: null,
    },
    // 存放快捷菜单的信息
    ctxMenuStore: {
      list: [],
      selectChild: null,
      selected: null,
      showChild: false,
      style: null,
      visible: false,
    },
    // 是否存在横向滚动条
    overflowX: false,
    overflowY: false,
    // 纵向滚动条的宽度
    scrollbarWidth: 0,
    // 横向滚动条的高度
    scrollbarHeight: 0,
    hasFixedColumn: false,
    // 是否使用分组表头
    isGroup: false,
    // 复选框属性，是否全选
    isAllSelected: false,
    // 复选框属性，有选中且非全选状态
    isIndeterminate: false,
    isAllOverflow: false,
    isCustomStatus: false,
    isDragResize: false,
    isColLoading: false,
    updateCheckboxFlag: 1,
    updateColFlag: 0,
    // 存放数据校验相关信息
    validStore: {
      visible: false,
    },
    validErrorMaps: {},
    removeRowFlag: 1,
    // 低性能的静态列
    staticColumns: [],
    // 可视区渲染的列
    tableColumn: [],
    // 渲染中的数据
    tableData: [],
    rowGroupList: [],
    aggHandleFields: [],
    isRowGroupStatus: false,
    scrollXLeft: 0,
    scrollXWidth: 0,
    scrollYHeight: 0,
    scrollYTop: 0,
    isScrollYBig: false,
    isScrollXBig: false,
    // 是否启用了横向 X 可视渲染方式加载
    scrollXLoad: false,
    // 是否启用了纵向 Y 可视渲染方式加载
    scrollYLoad: false,
    // 单选框属性，选中行
    selectRadioRow: null,
    // 表尾合计数据
    footerTableData: [],
    rowGroupExpandedFlag: 1,
    treeExpandedFlag: 1,
    rowExpandedFlag: 1,
    scrollVMLoading: false,
    isRowLoading: false,
    insertRowFlag: 1,
    rowExpandHeightFlag: 1,
    // 行分组列信息
    rowGroupColumn: null,
    // 展开列信息
    expandColumn: null,
    // 自定义列相关的信息
    customStore: {
      btnEl: null,
      isAll: false,
      isIndeterminate: false,
      activeBtn: false,
      activeWrapper: false,
      visible: false,
      maxHeight: null,
      defPopupStyle: {},
      panePopupStyle: {},
      oldSortMaps: {},
      oldFixedMaps: {},
      oldVisibleMaps: {},
    },
    // 初始化标识
    initStore: {
      filter: false,
      import: false,
      export: false,
      custom: false,
    },
    dragCol: null,
    dragRow: null,
    calcCellHeightFlag: 1,
    resizeHeightFlag: 1,
    checkboxColumn: null,
    // 表格父容器的高度
    parentHeight: 0,
    pendingRowFlag: 1,
    resizeWidthFlag: 1,
    radioColumn: null,
    // 树节点列信息
    treeNodeColumn: null,
    // 刷新列标识，当列筛选被改变时，触发表格刷新数据
    upDataFlag: 0,
    // 刷新列标识，当列的特定属性被改变时，触发表格刷新列
    reColumnFlag: 0,
    mergeHeadFlag: 1,
    mergeBodyFlag: 1,
    mergeFootFlag: 1,
    // 已合并单元格数据集合
    mergeBodyCellMaps: {},
    // 存放可编辑相关信息
    editStore: {
      indexs: {
        columns: [],
      },
      titles: {
        columns: [],
      },
      // 选中源
      selected: {
        row: null,
        column: null,
      },
      // 已复制源
      copyed: {
        cut: false,
        rows: [],
        columns: [],
      },
      // 激活
      actived: {
        row: null,
        column: null,
      },
      // 当前被强制聚焦单元格，只会在鼠标点击后算聚焦
      focused: {
        row: null,
        column: null,
      },
    },
    // 存放 tooltip 相关信息
    tooltipStore: {
      row: null,
      column: null,
      content: '',
      visible: false,
      type: null,
      currOpts: {},
    },
  };
}
export interface ASColumnInstance {
  columnConfig: ColumnInfo;
}

/**
 * 把 <column> / <colgroup> 组件上的 props 变成响应式数据源，
 * props 一旦变化就同步写回内部的 ColumnInfo 配置对象，
 * 并按属性类型触发对应的表格刷新逻辑。
 * @param $asTable
 * @param props
 * @param column
 */
export function watchColumn(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
  props: any,
  column: ColumnInfo,
) {
  Object.keys(props).forEach((name) => {
    watch(
      () => props[name],
      (value: any) => {
        column.update(name, value);
        if ($asTable) {
          if (name === 'filters') {
            // TODO
            // $asTable.setFilter(column as any, value);
            // $asTable.handleUpdateDataQueue();
          } else if (
            ['fixed', 'maxWidth', 'minWidth', 'visible', 'width'].includes(name)
          ) {
            // $asTable.handleRefreshColumnQueue();
          }
        }
      },
    );
  });
}

export function isColumnInfo(column: any): column is ColumnInfo {
  return (
    column &&
    (column.constructor === ColumnInfo || column instanceof ColumnInfo)
  );
}

export function createColumn(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
  options: AsTableDefines.ColumnInfo | AsTableDefines.ColumnOptions,
  renderOptions: any,
  locale?: ComputedRef<any>,
): any {
  return isColumnInfo(options)
    ? options
    : reactive(new ColumnInfo($asTable, options, renderOptions, locale));
}

/**
 * 把"刚挂载的列组件"登记进列池
 * @param $asTable 表格实例
 * @param elem 本列组件渲染的那个空的div
 * @param column 本列对象
 * @param colgroup  父分组实例（inject 到的），顶层为 null
 */
export function assembleColumn(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
  elem: HTMLElement,
  column: ColumnInfo,
  colgroup: ASColumnInstance | null,
) {
  // 拿到表格响应式状态
  const { reactData } = $asTable;
  // 当前列池数组
  const { staticColumns } = reactData;
  // 空 div 的父元素（DOM 位置基准）
  const parentElem = elem.parentNode;
  // 父分组对应的列对象
  const parentColumn = colgroup ? colgroup.columnConfig : null;
  // 该往哪个数组塞
  const parentCols = parentColumn ? parentColumn.children : staticColumns;
  if (parentElem && parentCols) {
    column.defaultParentId = parentColumn ? parentColumn.id : null;
    parentCols.splice(
      arrayIndexOf(parentElem?.children as any, elem),
      0,
      column,
    );
    reactData.staticColumns = staticColumns.slice(0);
  }
}

/**
 * 销毁列，assembleColumn 的逆操作：将列从 reactData.staticColumns 中移除，并触发列重新初始化
 * 兼容多级表头，列可能位于任意分组列的 children 中，因此按 id 深度查找
 * @param $asTable 表格实例
 * @param column 需要销毁的列
 */
export function destroyColumn(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
  column: ColumnInfo,
) {
  const { reactData } = $asTable;
  const { staticColumns } = reactData;
  const matchObj = findTree(staticColumns, (item) => item.id === column.id, {
    children: 'children',
  });
  if (matchObj) {
    matchObj.items.splice(matchObj.index, 1);
  }
  reactData.staticColumns = staticColumns.slice(0);
}

export function getCellValue(
  row: any,
  column: AsTableDefines.ColumnInfo | null,
) {
  if (column) {
    return get(row, column.field);
  }
  return null;
}
/**
 * 判断值为：'' | null | undefined 时都属于空值
 */
export function eqEmptyValue(cellValue: any) {
  return cellValue === '' || eqNull(cellValue);
}

export function getRowUniqueId() {
  return uniqueId('row_');
}

/**
 * 生成行的唯一主键
 */
export function createRowId(
  rowOpts: AsTablePropTypes.RowConfig,
  row: any,
  keyField: string,
) {
  const { createKeyMethod } = rowOpts;
  if (createKeyMethod) {
    return createKeyMethod({ row, keyField });
  }
  return getRowUniqueId();
}

// 行主键 key
export function getRowkey($asTable: AsTableConstructor) {
  const { currKeyField } = $asTable.internalData;
  return currKeyField;
}

// 行主键 value
export function getRowid($asTable: AsTableConstructor, row: any) {
  const internalData = $asTable.internalData;
  const { isCurrDeepKey, currKeyField } = internalData;
  return row
    ? encodeRowid(
        (isCurrDeepKey ? getDeepRowIdByKey : getFastRowIdByKey)(
          row,
          currKeyField,
        ),
      )
    : '';
}

function getDeepRowIdByKey(row: any, rowKey: number | string) {
  return get(row, rowKey);
}

// 编码行主键
export function encodeRowid(rowVal: number | string) {
  return eqNull(rowVal) ? '' : encodeURIComponent(rowVal);
}

function updateDeepRowKey(
  rowOpts: AsTablePropTypes.RowConfig,
  row: any,
  rowKey: string,
) {
  let rowid = encodeRowid(getDeepRowIdByKey(row, rowKey));
  if (eqEmptyValue(rowid)) {
    const newRowid = createRowId(rowOpts, row, rowKey);
    rowid = `${newRowid}`;
    set(row, rowKey, rowid);
  }
  return rowid;
}

function getFastRowIdByKey(row: any, rowKey: string) {
  return row[rowKey];
}

function updateFastRowKey(
  rowOpts: AsTablePropTypes.RowConfig,
  row: any,
  rowKey: string,
) {
  let rowid = encodeRowid(getFastRowIdByKey(row, rowKey));
  if (eqEmptyValue(rowid)) {
    const newRowid = createRowId(rowOpts, row, rowKey);
    rowid = `${newRowid}`;
    row[rowKey] = newRowid;
  }
  return rowid;
}

export function createHandleUpdateRowId($asTable: AsTableConstructor) {
  const internalData = $asTable.internalData;
  const { isCurrDeepKey, currKeyField } = internalData;
  const { computeRowOpts } = $asTable.getComputeMaps();
  const rowOpts = computeRowOpts.value;
  const updateRId = isCurrDeepKey ? updateDeepRowKey : updateFastRowKey;
  return {
    rowKey: currKeyField,
    handleUpdateRowId(row: any) {
      return row ? updateRId(rowOpts, row, currKeyField) : '';
    },
  };
}

export function createHandleGetRowId($asTable: AsTableConstructor) {
  const internalData = $asTable.internalData;
  const { isCurrDeepKey, currKeyField } = internalData;
  const getRId = isCurrDeepKey ? getDeepRowIdByKey : getFastRowIdByKey;
  return {
    rowKey: currKeyField,
    handleGetRowId(row: any) {
      return row ? encodeRowid(getRId(row, currKeyField)) : '';
    },
  };
}

export function toTreePathSeq(path: any[]) {
  return path.map((num, i) => (i % 2 === 0 ? Number(num) + 1 : '.')).join('');
}

export function getCalcHeight(height: 'unset' | null | number | undefined) {
  if (height === 'unset') {
    return 0;
  }
  return height || 0;
}

export function getDefaultConfig<T = any, D = any>(val1: T, def1: D): D | T {
  return eqNull(val1) ? def1 : val1;
}

export function handleFieldOrColumn(
  $asTable: AsTableConstructor,
  fieldOrColumn: AsTableDefines.ColumnInfo | null | string,
) {
  if (fieldOrColumn) {
    return isString(fieldOrColumn) || isNumber(fieldOrColumn)
      ? $asTable.getColumnByField(`${fieldOrColumn}`)
      : fieldOrColumn;
  }
  return null;
}

export function hasDeepKey(rowKey: string) {
  return rowKey.includes('.');
}

// 获取所有的列，排除分组
export function getColumnList(columns: AsTableDefines.ColumnInfo[]) {
  const result: AsTableDefines.ColumnInfo[] = [];
  columns.forEach((column) => {
    result.push(
      ...(column.children && column.children.length > 0
        ? getColumnList(column.children)
        : [column]),
    );
  });
  return result;
}

function hangleBolleanDefaultValue(
  currVal: boolean | null | undefined,
  defVal: boolean | null | undefined,
) {
  return isBoolean(currVal) ? currVal : defVal;
}

export function handleCustomStoreConfig($asTable: AsTableConstructor) {
  const { computeCustomOpts } = $asTable.getComputeMaps();
  const customOpts = computeCustomOpts.value;
  const { storage, storeOptions } = customOpts;

  const isAllCustom = storage === true;
  const storageOpts: AsTableDefines.AsTableCustomStorageObj = Object.assign(
    {},
    isAllCustom ? {} : storage || {},
    storeOptions,
  );
  const isCustomAlign = hangleBolleanDefaultValue(
    storageOpts.align,
    isAllCustom,
  );
  const isCustomHeaderAlign = hangleBolleanDefaultValue(
    storageOpts.headerAlign,
    isAllCustom,
  );
  const isCustomFooterAlign = hangleBolleanDefaultValue(
    storageOpts.footerAlign,
    isAllCustom,
  );
  const isCustomResizable = hangleBolleanDefaultValue(
    storageOpts.resizable,
    isAllCustom,
  );
  const isCustomVisible = hangleBolleanDefaultValue(
    storageOpts.visible,
    isAllCustom,
  );
  const isCustomFixed = hangleBolleanDefaultValue(
    storageOpts.fixed,
    isAllCustom,
  );
  const isCustomSort = hangleBolleanDefaultValue(storageOpts.sort, isAllCustom);
  const isCustomAggGroup = hangleBolleanDefaultValue(
    storageOpts.aggGroup,
    isAllCustom,
  );
  const isCustomAggFunc = hangleBolleanDefaultValue(
    storageOpts.aggFunc,
    isAllCustom,
  );
  const isCustomPager = hangleBolleanDefaultValue(
    storageOpts.pager,
    isAllCustom,
  );
  return {
    isCustomAlign,
    isCustomHeaderAlign,
    isCustomFooterAlign,
    isCustomResizable,
    isCustomVisible,
    isCustomFixed,
    isCustomSort,
    isCustomAggGroup,
    isCustomAggFunc,
    isCustomPager,
  };
}

export function hasChildrenList(item: any) {
  return item && item.children && item.children.length > 0;
}

export function toFilters(filters: any, colid?: number | string) {
  if (filters) {
    if (isArray(filters)) {
      return filters.map(({ label, value, data, resetValue, checked }) => {
        return {
          label,
          value,
          data,
          resetValue,
          checked: !!checked,
          _checked: !!checked,
          _colId: colid,
        };
      });
    }
    return [];
  }
  return filters;
}

export function isEmptyValue(cellValue: any) {
  // eslint-disable-next-line unicorn/prefer-includes-over-repeated-comparisons
  return cellValue === null || cellValue === undefined || cellValue === '';
}

export function getFuncText(content?: boolean | null | number | string) {
  if (eqNull(content)) {
    return '';
  }
  return content;
}

export function formatText(value: any, placeholder?: any) {
  return `${isEmptyValue(value) ? (placeholder ? ' ' : '') : value}`;
}

const getAllConvertColumns = (columns: any, parentColumn?: any) => {
  const result: any[] = [];
  columns.forEach((column: any) => {
    column.parentId = parentColumn ? parentColumn.id : null;
    if (column.visible) {
      if (
        column.children &&
        column.children.some((column: any) => column.visible)
      ) {
        result.push(column);
        // eslint-disable-next-line unicorn/prefer-single-call
        result.push(...getAllConvertColumns(column.children, column));
      } else {
        result.push(column);
      }
    }
  });
  return result;
};

export const convertHeaderColumnToRows = (originColumns: any): any[][] => {
  let maxLevel = 1;
  const traverse = (column: any, parent?: any) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }
    if (
      column.children &&
      column.children.some((column: any) => column.visible)
    ) {
      let colSpan = 0;
      column.children.forEach((subColumn: any) => {
        if (!subColumn.visible) {
          return;
        }

        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  originColumns.forEach((column: any) => {
    column.level = 1;
    traverse(column);
  });

  const rows: any[] = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllConvertColumns(originColumns);

  allColumns.forEach((column) => {
    column.rowSpan =
      column.children && column.children.some((column: any) => column.visible)
        ? 1
        : maxLevel - column.level + 1;
    rows[column.level - 1].push(column);
  });

  return rows;
};

export function convertHeaderToGridRows(
  spanColumns: AsTableDefines.ColumnInfo[][],
) {
  const rSize = spanColumns.length;
  const cSize = spanColumns[0]!.reduce((sum, cell) => sum + cell.colSpan, 0);

  const occupiedRows: boolean[][] = [];
  const fullRows: any[][] = [];
  for (let rIndex = 0; rIndex < rSize; rIndex++) {
    const oCols: boolean[] = [];
    const dCols: string[] = [];
    for (let cIndex = 0; cIndex < cSize; cIndex++) {
      oCols.push(false);
      dCols.push('');
    }
    occupiedRows.push(oCols);
    fullRows.push(dCols);
  }

  for (let rIndex = 0; rIndex < rSize; rIndex++) {
    let currColIndex = 0;
    // eslint-disable-next-line unicorn/no-unreadable-for-of-expression
    for (const column of spanColumns[rIndex]!) {
      const { colSpan, rowSpan } = column;
      let startColIndex = -1;
      for (let ccIndex = currColIndex; ccIndex <= cSize - colSpan; ccIndex++) {
        let oFlag = true;
        for (let csIndex = 0; csIndex < colSpan; csIndex++) {
          if (occupiedRows[rIndex]![ccIndex + csIndex]) {
            oFlag = false;
            // eslint-disable-next-line unicorn/no-break-in-nested-loop
            break;
          }
        }
        if (oFlag) {
          startColIndex = ccIndex;
          // eslint-disable-next-line unicorn/no-break-in-nested-loop
          break;
        }
      }
      if (startColIndex === -1) {
        for (let j = 0; j <= cSize - colSpan; j++) {
          let oFlag = true;
          for (let k = 0; k < colSpan; k++) {
            if (occupiedRows[rIndex]![j + k]) {
              oFlag = false;
              // eslint-disable-next-line unicorn/no-break-in-nested-loop
              break;
            }
          }
          if (oFlag) {
            startColIndex = j;
            // eslint-disable-next-line unicorn/no-break-in-nested-loop
            break;
          }
        }
        if (startColIndex === -1) {
          // error
          // eslint-disable-next-line unicorn/no-break-in-nested-loop
          break;
        }
      }

      for (let srIndex = rIndex; srIndex < rIndex + rowSpan; srIndex++) {
        for (
          let scIndex = startColIndex;
          scIndex < startColIndex + colSpan;
          scIndex++
        ) {
          occupiedRows[srIndex]![scIndex] = true;
          fullRows[srIndex]![scIndex] = column;
        }
      }
      currColIndex = startColIndex + colSpan;
    }
  }
  return fullRows;
}

export function getCellRestHeight(
  rowRest: AsTableDefines.RowCacheItem,
  cellOpts: AsTablePropTypes.CellConfig,
  defaultRowHeight: number,
) {
  const { height, minHeight, maxHeight } = cellOpts;
  let cellHeight =
    rowRest.resizeHeight || height || rowRest.height || defaultRowHeight;
  if (maxHeight && maxHeight <= cellHeight) {
    cellHeight = maxHeight;
  }
  if (minHeight && minHeight >= cellHeight) {
    cellHeight = minHeight;
  }
  return cellHeight;
}

export function getRefElem(refEl: any) {
  if (refEl) {
    const rest = refEl.value;
    if (rest) {
      return (rest.$el || rest) as HTMLElement;
    }
  }
  return null;
}

const maxKey = '__max';

export function getRowMaxHeight(
  chRest: Record<string, number>,
  isForce: boolean,
) {
  if (isForce || !chRest[maxKey]) {
    let max = 0;
    for (const key in chRest) {
      const val = chRest[key];
      if (key !== maxKey && isNumber(val) && val > max) {
        max = val;
      }
    }
    chRest[maxKey] = max;
    return max;
  }
  return chRest[maxKey];
}

export function restoreScrollLocation(
  $asTable: AsTableConstructor,
  scrollLeft: number,
  scrollTop: number,
) {
  const internalData = $asTable.internalData;

  if (scrollLeft || scrollTop) {
    internalData.intoRunScroll = false;
    internalData.inVirtualScroll = false;
    internalData.inWheelScroll = false;
    internalData.inHeaderScroll = false;
    internalData.inBodyScroll = false;
    internalData.inFooterScroll = false;
    internalData.scrollRenderType = '';
    // 还原滚动状态
    return $asTable.scrollTo(scrollLeft, scrollTop);
  }
  return $asTable.clearScroll();
}

export const eqCellValue = (newRow: any, oldRow: any, field: string) => {
  const val1 = get(newRow, field);
  const val2 = get(oldRow, field);

  let result = false;
  if (eqEmptyValue(val1) && eqEmptyValue(val2)) {
    result = true;
  } else if (isString(val1) || isNumber(val1)) {
    result = `${val1}` === `${val2}`;
  } else {
    result = isEqual(val1, val2);
  }
  return { newValue: val1, oldValue: val2, result };
};

export function getFirstChildColumn(
  column: AsTableDefines.ColumnInfo,
): AsTableDefines.ColumnInfo {
  const { children } = column;
  if (children && children.length > 0) {
    // eslint-disable-next-line unicorn/no-useless-recursion
    return getFirstChildColumn(first(children));
  }
  return column;
}

export function getLastChildColumn(
  column: AsTableDefines.ColumnInfo,
): AsTableDefines.ColumnInfo {
  const { children } = column;
  if (children && children.length > 0) {
    return getFirstChildColumn(last(children));
  }
  return column;
}

/**
 * 列宽拖动最大宽度
 */
export function getColReMaxWidth(
  params: (
    | AsTableDefines.CellRenderBodyParams
    | AsTableDefines.CellRenderFooterParams
    | AsTableDefines.CellRenderHeaderParams
  ) & { cell: HTMLTableCellElement; prefixCls?: string },
) {
  const { $table, column, cell, prefixCls: prefixClsParam } = params;
  const prefixCls = prefixClsParam || $table.props.prefixCls || 'as-table';
  const internalData = $table.internalData;
  const { elemStore } = internalData;
  const { computeColumnOpts, computeResizableOpts } = $table.getComputeMaps();
  const resizableOpts = computeResizableOpts.value;
  const columnOpts = computeColumnOpts.value;
  const { maxWidth: reMaxWidth } = resizableOpts;
  const colMaxWidth = column.maxWidth || columnOpts.maxWidth;
  // 如果自定义调整宽度逻辑
  if (reMaxWidth) {
    const customMaxWidth = isFunction(reMaxWidth)
      ? reMaxWidth(params)
      : reMaxWidth;
    if (customMaxWidth !== 'auto') {
      return Math.max(1, toNumber(customMaxWidth));
    }
  }
  const minTitleWidth = floor(
    (toNumber(getComputedStyle(cell).fontSize) || 14) * 1.8,
  );
  const paddingLeftRight =
    getPaddingLeftRightSize(cell) +
    getPaddingLeftRightSize(queryElement(cell, `.${prefixCls}-cell`));
  const mWidth = minTitleWidth + paddingLeftRight;
  // 如果设置最小宽
  if (colMaxWidth) {
    const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
    if (bodyScrollElem) {
      if (isScale(colMaxWidth)) {
        const bodyWidth = bodyScrollElem.clientWidth - 1;
        const meanWidth = bodyWidth / 100;
        return Math.max(mWidth, Math.floor(toInteger(colMaxWidth) * meanWidth));
      } else if (isPx(colMaxWidth)) {
        return Math.max(mWidth, toInteger(colMaxWidth));
      }
    }
  }
  return -1;
}

/**
 * 列宽拖动最小宽度
 */
export function getColReMinWidth(
  params: (
    | AsTableDefines.CellRenderBodyParams
    | AsTableDefines.CellRenderFooterParams
    | AsTableDefines.CellRenderHeaderParams
  ) & { cell: HTMLTableCellElement; prefixCls?: string },
) {
  const { $table, column, cell, prefixCls: prefixClsParam } = params;
  const prefixCls = prefixClsParam || $table.props.prefixCls || 'as-table';
  const tableProps = $table.props;
  const internalData = $table.internalData;
  const { computeColumnOpts, computeResizableOpts } = $table.getComputeMaps();
  const resizableOpts = computeResizableOpts.value;
  const columnOpts = computeColumnOpts.value;
  const { minWidth: reMinWidth } = resizableOpts;
  // 如果自定义调整宽度逻辑
  if (reMinWidth) {
    const customMinWidth = isFunction(reMinWidth)
      ? reMinWidth(params)
      : reMinWidth;
    if (customMinWidth !== 'auto') {
      return Math.max(1, toNumber(customMinWidth));
    }
  }
  const { elemStore } = internalData;
  const { showHeaderOverflow: allColumnHeaderOverflow } = tableProps;
  const { showHeaderOverflow } = column;
  const colMinWidth = column.minWidth || columnOpts.minWidth;
  const headOverflow =
    isUndefined(showHeaderOverflow) || isNull(showHeaderOverflow)
      ? allColumnHeaderOverflow
      : showHeaderOverflow;
  const showEllipsis = headOverflow === 'ellipsis';
  const showTitle = headOverflow === 'title';
  const showTooltip = headOverflow === true || headOverflow === 'tooltip';
  const hasEllipsis = showTitle || showTooltip || showEllipsis;
  const minTitleWidth = floor(
    (toNumber(getComputedStyle(cell).fontSize) || 14) * 1.8,
  );
  const paddingLeftRight =
    getPaddingLeftRightSize(cell) +
    getPaddingLeftRightSize(queryElement(cell, `.${prefixCls}-cell`));
  let mWidth = minTitleWidth + paddingLeftRight;
  // 默认最小宽处理
  if (hasEllipsis) {
    const dragIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell--drag-handle`),
    );
    const checkboxIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell--checkbox`),
    );
    const requiredIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell--required-icon`),
    );
    const editIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell--edit-icon`),
    );
    const prefixIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell-title-prefix-icon`),
    );
    const suffixIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell-title-suffix-icon`),
    );
    const sortIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell--sort`),
    );
    const filterIconWidth = getElementMarginAndWidth(
      queryElement(cell, `.${prefixCls}-cell--filter`),
    );
    mWidth +=
      dragIconWidth +
      checkboxIconWidth +
      requiredIconWidth +
      editIconWidth +
      prefixIconWidth +
      suffixIconWidth +
      filterIconWidth +
      sortIconWidth;
  }
  // 如果设置最小宽
  if (colMinWidth) {
    const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
    if (bodyScrollElem) {
      if (isScale(colMinWidth)) {
        const bodyWidth = bodyScrollElem.clientWidth - 1;
        const meanWidth = bodyWidth / 100;
        return Math.max(mWidth, Math.floor(toInteger(colMinWidth) * meanWidth));
      } else if (isPx(colMinWidth)) {
        return Math.max(mWidth, toInteger(colMinWidth));
      }
    }
  }
  return mWidth;
}

function getPaddingLeftRightSize(elem: HTMLElement | null) {
  if (elem) {
    const computedStyle = getComputedStyle(elem);
    const paddingLeft = toNumber(computedStyle.paddingLeft);
    const paddingRight = toNumber(computedStyle.paddingRight);
    return paddingLeft + paddingRight;
  }
  return 0;
}

function getElementMarginAndWidth(elem: HTMLElement | null) {
  if (elem) {
    const computedStyle = getComputedStyle(elem);
    const marginLeft = toNumber(computedStyle.marginLeft);
    const marginRight = toNumber(computedStyle.marginRight);
    return elem.offsetWidth + marginLeft + marginRight;
  }
  return 0;
}

export function rowToVisible(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
  row: any,
) {
  const reactData = $asTable.reactData;
  const internalData = $asTable.internalData;

  const {
    computeLeftFixedWidth,
    computeRightFixedWidth,
    computeCellOpts,
    computeDefaultRowHeight,
  } = $asTable.getComputeMaps();
  const { scrollYLoad, scrollYTop, isAllOverflow } = reactData;
  const { elemStore, afterFullData, fullAllDataRowIdData, isResizeCellHeight } =
    internalData;
  const cellOpts = computeCellOpts.value;
  const defaultRowHeight = computeDefaultRowHeight.value;
  const leftFixedWidth = computeLeftFixedWidth.value;
  const rightFixedWidth = computeRightFixedWidth.value;
  const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
  const rowid = getRowid($asTable, row);
  if (bodyScrollElem) {
    const bodyHeight = bodyScrollElem.clientHeight;
    const bodyScrollTop = bodyScrollElem.scrollTop;
    const trElem: HTMLTableRowElement | null = bodyScrollElem.querySelector(
      `[rowid="${CSS.escape(rowid)}"]`,
    );
    if (trElem) {
      const trOffsetTop = trElem.offsetTop + (scrollYLoad ? scrollYTop : 0);
      const trHeight = trElem.clientHeight;
      // 检测行是否在可视区中
      if (
        trOffsetTop < bodyScrollTop ||
        trOffsetTop > bodyScrollTop + bodyHeight
      ) {
        return $asTable.scrollTo(null, trOffsetTop);
      } else if (trOffsetTop + trHeight >= bodyHeight + bodyScrollTop) {
        return $asTable.scrollTo(null, bodyScrollTop + trHeight);
      }
    } else {
      // 如果是虚拟渲染滚动
      if (scrollYLoad) {
        const isCustomCellHeight = isResizeCellHeight || cellOpts.height;
        if (!isCustomCellHeight && isAllOverflow) {
          return $asTable.scrollTo(
            null,
            ($asTable.findRowIndexOf(afterFullData, row) - 1) *
              defaultRowHeight,
          );
        }
        const rowRest =
          fullAllDataRowIdData[rowid] || ({} as AsTableDefines.RowCacheItem);
        const rHeight =
          rowRest.resizeHeight ||
          cellOpts.height ||
          rowRest.height ||
          defaultRowHeight;
        const scrollTop = rowRest.oTop;
        if (scrollTop < bodyScrollTop) {
          return $asTable.scrollTo(null, scrollTop - leftFixedWidth - 1);
        }
        return $asTable.scrollTo(
          null,
          scrollTop + rHeight - (bodyHeight - rightFixedWidth - 1),
        );
      }
    }
  }
  return Promise.resolve();
}

export function colToVisible(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
  isForce: boolean,
  column: AsTableDefines.ColumnInfo,
  row?: any,
) {
  const reactData = $asTable.reactData;
  const internalData = $asTable.internalData;

  const { computeLeftFixedWidth, computeRightFixedWidth } =
    $asTable.getComputeMaps();
  const { scrollXLoad, scrollXLeft } = reactData;
  const { elemStore, visibleColumn } = internalData;
  const leftFixedWidth = computeLeftFixedWidth.value;
  const rightFixedWidth = computeRightFixedWidth.value;
  const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
  if (column.fixed) {
    return Promise.resolve();
  }
  if (bodyScrollElem) {
    const bodyWidth = bodyScrollElem.clientWidth;
    const bodyScrollLeft = bodyScrollElem.scrollLeft;
    let tdElem: HTMLTableCellElement | null = null;
    if (row) {
      const rowid = getRowid($asTable, row);
      tdElem = bodyScrollElem.querySelector(
        `[rowid="${CSS.escape(rowid)}"] .${column.id}`,
      );
    }
    if (!tdElem) {
      tdElem = bodyScrollElem.querySelector(`.${column.id}`);
    }
    if (tdElem) {
      const tdOffsetLeft = tdElem.offsetLeft + (scrollXLoad ? scrollXLeft : 0);
      const cellWidth = tdElem.clientWidth;
      // 检测是否在可视区中
      if (
        isForce ||
        (!(
          tdOffsetLeft <= bodyScrollLeft + leftFixedWidth &&
          tdOffsetLeft + cellWidth > bodyScrollLeft + leftFixedWidth
        ) &&
          !(
            tdOffsetLeft >= bodyScrollLeft + leftFixedWidth &&
            tdOffsetLeft < bodyScrollLeft + bodyWidth - rightFixedWidth
          ))
      ) {
        if (tdOffsetLeft < bodyScrollLeft + leftFixedWidth) {
          return $asTable.scrollTo(tdOffsetLeft - leftFixedWidth - 1);
        } else if (
          tdOffsetLeft + cellWidth - bodyScrollLeft >
          bodyWidth - rightFixedWidth
        ) {
          return $asTable.scrollTo(
            tdOffsetLeft + cellWidth - (bodyWidth - rightFixedWidth - 1),
          );
        }
      }
    } else {
      if (scrollXLoad) {
        let tdOffsetLeft = 0;
        const cellWidth = column.renderWidth;
        for (const currCol of visibleColumn) {
          if (currCol === column || currCol.id === column.id) {
            break;
          }
          tdOffsetLeft += currCol.renderWidth;
        }
        // 检测是否在可视区中
        if (
          isForce ||
          (!(
            tdOffsetLeft <= bodyScrollLeft + leftFixedWidth &&
            tdOffsetLeft + cellWidth > bodyScrollLeft + leftFixedWidth
          ) &&
            !(
              tdOffsetLeft >= bodyScrollLeft + leftFixedWidth &&
              tdOffsetLeft < bodyScrollLeft + bodyWidth - rightFixedWidth
            ))
        ) {
          if (tdOffsetLeft < bodyScrollLeft) {
            return $asTable.scrollTo(tdOffsetLeft - leftFixedWidth - 1);
          }
          return $asTable.scrollTo(
            tdOffsetLeft + cellWidth - (bodyWidth - rightFixedWidth - 1),
          );
        }
      }
    }
  }
  return Promise.resolve();
}

export function clearTableDefaultStatus(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
) {
  const { props, internalData } = $asTable;

  internalData.initStatus = false;
  const actionList = [
    $asTable.clearSort(),
    $asTable.clearCurrentRow(),
    $asTable.clearCurrentColumn(),
    $asTable.clearRadioRow(),
    $asTable.clearRadioReserve(),
    $asTable.clearCheckboxRow(),
    $asTable.clearCheckboxReserve(),
    $asTable.clearRowExpand(),
    $asTable.clearTreeExpand(),
    $asTable.clearTreeExpandReserve(),
    $asTable.clearPendingRow(),
  ];
  if ($asTable.clearFilter) {
    actionList.push($asTable.clearFilter());
  }
  if ($asTable.clearSelected && (props.keyboardConfig || props.mouseConfig)) {
    actionList.push($asTable.clearSelected());
  }
  if ($asTable.clearCellAreas && props.mouseConfig) {
    actionList.push($asTable.clearCellAreas(), $asTable.clearCopyCellArea());
  }
  return Promise.all(actionList).then(() => {
    return $asTable.clearScroll();
  });
}

export function clearTableAllStatus(
  $asTable: AsTableConstructor & AsTablePrivateMethods,
) {
  if ($asTable.clearFilter) {
    $asTable.clearFilter();
  }
  return clearTableDefaultStatus($asTable);
}

export function setCellValue(
  row: any,
  column: AsTableDefines.ColumnInfo | null,
  value: any,
) {
  if (column) {
    set(row, column.field, value);
  }
}

export function handleRowidOrRow(
  $xeTable: AsTableConstructor,
  rowidOrRow: any,
) {
  if (rowidOrRow) {
    const rowid =
      isString(rowidOrRow) || isNumber(rowidOrRow)
        ? rowidOrRow
        : getRowid($xeTable, rowidOrRow);
    return $xeTable.getRowById(rowid);
  }
  return null;
}

export function getRootColumn(
  $xeTable: AsTableConstructor & AsTablePrivateMethods,
  column: ColumnInfo,
) {
  const { internalData } = $xeTable;

  const { fullColumnIdData } = internalData;
  if (!column) {
    return null;
  }
  let parentColId = column.parentId;
  while (fullColumnIdData[parentColId]) {
    const column = fullColumnIdData[parentColId]!.column;
    parentColId = column.parentId;
    if (!parentColId) {
      return column;
    }
  }
  return column;
}

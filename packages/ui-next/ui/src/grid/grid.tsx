import type { SlotsType, VNode } from 'vue';

import type { AsComponentStyleType } from '../table/types/common';
import type {
  AsTableConstructor,
  AsTableMethods,
  AsTablePrivateMethods,
  AsTableProps,
} from '../table/types/table';
import type {
  AsGridConstructor,
  AsGridDefines,
  AsGridListeners,
  AsGridPrivateComputed,
  AsGridPrivateMethods,
  AsGridProps,
  AsGridSlots,
  GridInternalData,
  GridPrivateRef,
  GridReactData,
} from './types/grid';

import {
  computed,
  createCommentVNode,
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
} from 'vue';

import { assign, isArray, isObject, uniqueId } from '@arvin-studio/kit';

import { ArvinStudio } from '..';
import { toCssUnit } from '../_util/dom';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import AsPagination from '../pagination';
import Table from '../table';
import { config } from '../table/config';
import { isEnableConf } from '../table/util';
import useStyle from './style';

const { hooks, globalEvents, GLOBAL_EVENT_KEYS } = ArvinStudio;

/**
 * 默认布局：[表头, 表体, 表尾]
 * 说明：目标库未移植 Form / Toolbar，默认布局只保留可用区域
 */
const defaultLayouts: AsGridDefines.LayoutKey[][] = [
  [],
  ['Top', 'Table', 'Bottom', 'Pager'],
  [],
];

/**
 * 表格事件监听键缓存（由 Table 组件的 emit 声明反推）
 */
let tableEmitListenerKeys: null | Set<string> = null;

const tableComponentPropKeys: (keyof AsTableProps)[] = [
  // 基本属性
  'id',
  'data',
  'height',
  'minHeight',
  'maxHeight',
  'resizable',
  'stripe',
  'border',
  'padding',
  'round',
  'size',
  'fit',
  'loading',
  'align',
  'headerAlign',
  'footerAlign',
  'showHeader',
  'highlightCurrentRow',
  'highlightHoverRow',
  'highlightCell',
  'showFooter',
  'footerData',
  'footerMethod',
  'rowClassName',
  'cellClassName',
  'headerRowClassName',
  'headerCellClassName',
  'footerRowClassName',
  'footerCellClassName',
  'cellStyle',
  'headerCellStyle',
  'footerCellStyle',
  'rowStyle',
  'headerRowStyle',
  'footerRowStyle',
  'showCustomHeader',
  'mergeHeaderCells',
  'mergeCells',
  'mergeFooterCells',
  'mergeFooterItems',
  'spanMethod',
  'footerSpanMethod',
  'showOverflow',
  'showHeaderOverflow',
  'showFooterOverflow',

  // 高级属性
  'zIndex',
  'emptyText',
  'keepSource',
  'autoResize',
  'syncResize',
  'resizeConfig',
  'columnConfig',
  'currentColumnConfig',
  'cellConfig',
  'headerCellConfig',
  'footerCellConfig',
  'rowConfig',
  'aggregateConfig',
  'aggregateAccuracyConfig',
  'currentRowConfig',
  'rowDragConfig',
  'columnDragConfig',
  'resizableConfig',
  'seqConfig',
  'sortConfig',
  'filterConfig',
  'floatingFilterConfig',
  'radioConfig',
  'checkboxConfig',
  'tooltipConfig',
  'headerTooltipConfig',
  'footerTooltipConfig',
  'exportConfig',
  'importConfig',
  'printConfig',
  'expandConfig',
  'treeConfig',
  'menuConfig',
  'mouseConfig',
  'areaConfig',
  'keyboardConfig',
  'clipConfig',
  'fnrConfig',
  'editConfig',
  'editDirtyConfig',
  'validConfig',
  'editRules',
  'loadingConfig',
  'emptyRender',
  'customConfig',
  'virtualXConfig',
  'virtualYConfig',
  'scrollbarConfig',
  'undoRedoHistoryConfig',
  'rendererConfig',
  'params',
];
const tableComponentMethodKeys: (keyof AsTableMethods)[] = [
  'clearAll',
  'updateData',
  'loadData',
  'reloadData',
  'reloadRow',
  'loadColumn',
  'reloadColumn',
  'getRowNode',
  'getColumnNode',
  'getRowIndex',
  'getVTRowIndex',
  'getVMRowIndex',
  'getColumnIndex',
  'getVTColumnIndex',
  'getVMColumnIndex',
  'setRow',
  'createData',
  'createRow',
  'revertData',
  'clearData',
  'isRemoveByRow',
  'isInsertByRow',
  'isUpdateByRow',
  'getColumns',
  'getColumnById',
  'getColumnByField',
  'getTableColumn',
  'getFullColumns',
  'getData',
  'getCheckboxRecords',
  'getTreeRowChildren',
  'getTreeRowLevel',
  'getTreeParentRow',
  'getRowSeq',
  'getRowById',
  'getRowid',
  'getTableData',
  'getFullData',
  'setColumnFixed',
  'clearColumnFixed',
  'setColumnWidth',
  'getColumnWidth',
  'recalcRowHeight',
  'setRowHeightConf',
  'getRowHeightConf',
  'setRowHeight',
  'getRowHeight',
  'hideColumn',
  'showColumn',
  'refreshColumn',
  'refreshScroll',
  'recalculate',
  'closeTooltip',
  'isAllCheckboxChecked',
  'isAllCheckboxIndeterminate',
  'getCheckboxIndeterminateRecords',
  'setCheckboxRow',
  'setCheckboxRowKey',
  'isCheckedByCheckboxRow',
  'isCheckedByCheckboxRowKey',
  'isIndeterminateByCheckboxRow',
  'isIndeterminateByCheckboxRowKey',
  'toggleCheckboxRow',
  'setAllCheckboxRow',
  'getRadioReserveRecord',
  'clearRadioReserve',
  'getCheckboxReserveRecords',
  'clearCheckboxReserve',
  'toggleAllCheckboxRow',
  'clearCheckboxRow',
  'setCurrentRow',
  'isCheckedByRadioRow',
  'isCheckedByRadioRowKey',
  'setRadioRow',
  'setRadioRowKey',
  'clearCurrentRow',
  'clearRadioRow',
  'getCurrentRecord',
  'getRadioRecord',
  'getCurrentColumn',
  'setCurrentColumn',
  'clearCurrentColumn',
  'setPendingRow',
  'togglePendingRow',
  'isPendingByRow',
  'getPendingRecords',
  'clearPendingRow',
  'setFilterByEvent',
  'sort',
  'setSort',
  'setSortByEvent',
  'clearSort',
  'clearSortByEvent',
  'isSort',
  'getSortColumns',
  'closeFilter',
  'clearFilterByEvent',
  'isActiveFilterByColumn',
  'isRowExpandLoaded',
  'clearRowExpandLoaded',
  'reloadRowExpand',
  'reloadRowExpand',
  'toggleRowExpand',
  'setAllRowExpand',
  'setRowExpand',
  'isRowExpandByRow',
  'clearRowExpand',
  'clearRowExpandReserve',
  'getRowExpandRecords',
  'getTreeExpandRecords',
  'isTreeExpandLoaded',
  'clearTreeExpandLoaded',
  'reloadTreeExpand',
  'toggleTreeExpand',
  'setAllTreeExpand',
  'setTreeExpand',
  'isTreeExpandByRow',
  'clearTreeExpand',
  'clearTreeExpandReserve',
  'getScrollData',
  'scrollTo',
  'scrollToStartRow',
  'scrollToEndRow',
  'scrollToRow',
  'scrollToStartColumn',
  'scrollToEndColumn',
  'scrollToColumn',
  'clearScroll',
  'updateFooter',
  'updateStatus',
  'setMergeCells',
  'removeInsertRow',
  'removeMergeCells',
  'getMergeCells',
  'setMergeHeaderCells',
  'removeMergeHeaderCells',
  'getMergeHeaderCells',
  'clearMergeHeaderCells',
  'clearMergeCells',
  'setMergeFooterItems',
  'removeMergeFooterItems',
  'getMergeFooterItems',
  'clearMergeFooterItems',
  'setCustomStoreData',
  'getCustomStoreData',
  'setRowGroupExpand',
  'setRowGroupExpandByField',
  'setAllRowGroupExpand',
  'clearRowGroupExpand',
  'isAggregateRecord',
  'isAggregateExpandByRow',
  'getAggregateContentByRow',
  'getAggregateRowChildren',
  'setRowGroups',
  'clearRowGroups',
  'openTooltip',
  'moveColumnTo',
  'moveRowTo',
  'getCellLabel',
  'updateCellLabel',
  'clearFormatterCache',
  'getFooterCellLabel',
  'updateFooterCellLabel',
  'clearFooterFormatterCache',
  'getUpdateCells',
  'undo',
  'redo',
  'effectCellData',
  'getCellElement',
  'focus',
  'blur',
];

function createReactData(): GridReactData {
  return {
    tableLoading: false,
    isZMax: false,
    tableData: [],
    filterData: [],
    sortData: [],
    footerData: [],
    tZindex: 0,
    tablePage: {
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
  };
}

function createInternalData(): GridInternalData {
  return {
    uFoot: false,
  };
}

export const Grid = defineComponent<
  AsGridProps,
  AsGridListeners,
  string,
  SlotsType<AsGridSlots>
>(
  (
    props = {
      size: 'medium',
      showHeader: true,
      autoResize: true,
      keepSource: false,
    } as AsGridProps,
    context,
  ) => {
    const { attrs, emit, slots } = context;
    const instance = getCurrentInstance();
    const xID = uniqueId();
    const {
      prefixCls,
      pagerConfig: cPagerConfig,
      zoomConfig: cZoomConfig,
    } = useComponentBaseConfig('grid', props, ['pagerConfig', 'zoomConfig']);
    const [hashId, cssVarCls] = useStyle(prefixCls);
    const size = useSize(computed(() => props.size ?? 'medium'));

    const reactData = reactive(createReactData());
    const internalData = createInternalData();

    const refElem = ref<HTMLDivElement>();
    const refTable = ref<AsTableConstructor & AsTablePrivateMethods>();
    const refPager = ref<any>();

    const refPopupContainerElem = ref<HTMLDivElement>();

    const refTopWrapper = ref<HTMLDivElement>();
    const refBottomWrapper = ref<HTMLDivElement>();
    const refPagerWrapper = ref<HTMLDivElement>();

    const extendTableMethods = <T,>(methodKeys: T[]) => {
      const funcs: any = {};
      methodKeys.forEach((name) => {
        funcs[name] = (...args: any[]) => {
          const $asTable: any = refTable.value;
          if ($asTable && $asTable[name]) {
            return $asTable[name](...args);
          }
        };
      });
      return funcs;
    };

    const gridExtendTableMethods = extendTableMethods(
      tableComponentMethodKeys,
    ) as AsTableMethods;

    tableComponentMethodKeys.forEach((name) => {
      gridExtendTableMethods[name] = (...args: any[]) => {
        const $xeTable: any = refTable.value;
        if ($xeTable && $xeTable[name]) {
          return $xeTable && $xeTable[name](...args);
        }
      };
    });

    tableComponentMethodKeys.forEach((name) => {
      gridExtendTableMethods[name] = (...args: any[]) => {
        const $xeTable: any = refTable.value;
        if ($xeTable && $xeTable[name]) {
          return $xeTable && $xeTable[name](...args);
        }
      };
    });

    const computePagerOpts = computed(() => {
      return Object.assign(
        {},
        config.grid.pagerConfig,
        cPagerConfig.value,
        props.pagerConfig,
      );
    });

    /**
     * 计算当前布局配置
     * 支持两种写法：
     * 1. 平铺：[ 'Top', 'Table', 'Bottom' ]，全部渲染到表体
     * 2. 分区：[ ['Top'], ['Table', 'Bottom'], [] ]，依次为表头 / 表体 / 表尾
     */
    const computeCurrLayoutConf = computed(() => {
      const { layouts } = props;
      const confs = (layouts ||
        (config.grid as any).layouts ||
        defaultLayouts) as
        | AsGridDefines.LayoutKey[]
        | AsGridDefines.LayoutKey[][];
      let headKeys: AsGridDefines.LayoutKey[] = [];
      let bodyKeys: AsGridDefines.LayoutKey[] = [];
      let footKeys: AsGridDefines.LayoutKey[] = [];
      if (isArray(confs[0])) {
        const [head, body, foot] = confs as AsGridDefines.LayoutKey[][];
        headKeys = head || [];
        bodyKeys = body || [];
        footKeys = foot || [];
      } else {
        bodyKeys = confs as AsGridDefines.LayoutKey[];
      }
      return { bodyKeys, footKeys, headKeys };
    });

    const computeZoomOpts = computed(() => {
      return Object.assign({}, cZoomConfig.value, props.zoomConfig);
    });

    const computeStyles = computed(() => {
      const { height, maxHeight } = props;
      const { isZMax, tZindex } = reactData;
      const stys: AsComponentStyleType = {};
      if (isZMax) {
        stys.zIndex = tZindex;
      } else {
        if (height) {
          stys.height =
            height === 'auto' || height === '100%' ? '100%' : toCssUnit(height);
        }
        if (maxHeight) {
          stys.maxHeight =
            maxHeight === 'auto' || maxHeight === '100%'
              ? '100%'
              : toCssUnit(maxHeight);
        }
      }
      return stys;
    });

    const computeTableExtendProps = computed(() => {
      const rest: Record<string, any> = {};
      tableComponentPropKeys.forEach((key) => {
        if (props[key] !== undefined) {
          rest[key] = props[key];
        }
      });
      return rest;
    });

    const computeTableProps = computed(() => {
      const { showFooter, editConfig } = props;
      const { isZMax, footerData } = reactData;
      const tableExtendProps = computeTableExtendProps.value;
      const tProps = Object.assign({}, tableExtendProps);
      if (showFooter && !tProps.footerData) {
        // 如果未设置自己的标位数据，则使用代理的
        tProps.footerData = footerData;
      }
      if (isZMax) {
        if (tProps.maxHeight) {
          tProps.maxHeight = '100%';
        } else {
          tProps.height = '100%';
        }
      }
      if (editConfig) {
        tProps.editConfig = Object.assign({}, editConfig);
      }
      return tProps;
    });

    const computeCustomCurrentPageFlag = computed(() => {
      const pagerOpts = computePagerOpts.value;
      return pagerOpts.currentPage;
    });

    const computeCustomPageSizeFlag = computed(() => {
      const pagerOpts = computePagerOpts.value;
      return pagerOpts.pageSize;
    });

    const computePageCount = computed(() => {
      const { tablePage } = reactData;
      return Math.max(Math.ceil(tablePage.total / tablePage.pageSize), 1);
    });

    const computeIsLoading = computed(() => {
      const { loading } = props;
      const { tableLoading } = reactData;
      return loading || tableLoading;
    });

    const refMaps: GridPrivateRef = {
      refElem,
      refTable,
      refPager,
      refPopupContainerElem,
    };

    const computeMaps: AsGridPrivateComputed = {
      computePagerOpts,
      computeZoomOpts,
    };

    const $asGrid = {
      context,
      getComputeMaps: () => computeMaps,
      getRefMaps: () => refMaps,
      internalData,
      props,
      reactData,
      xID,
    } as unknown as AsGridConstructor & AsGridPrivateMethods;

    // 继承表格实例方法，便于 $grid.loadColumn 等 API 透传到内部表格
    Object.assign($asGrid, gridExtendTableMethods);

    /**
     * 渲染表格顶部区域
     */
    const renderTop = () => {
      const topSlot = slots.top;
      if (topSlot) {
        return h(
          'div',
          {
            ref: refTopWrapper,
            key: 'top',
            class: `${prefixCls.value}--top-wrapper`,
          },
          topSlot({
            $grid: $asGrid,
            // TODO   $gantt: null
          } as any),
        );
      }
      return createCommentVNode();
    };

    const renderTableLeft = () => {
      const leftSlot = slots.left;
      if (leftSlot) {
        return h(
          'div',
          {
            class: `${prefixCls.value}--left-wrapper`,
          },
          leftSlot({
            $grid: $asGrid,
            // TODO $gantt: null
          } as any),
        );
      }
      return createCommentVNode();
    };

    const renderTableRight = () => {
      const rightSlot = slots.right;
      if (rightSlot) {
        return h(
          'div',
          {
            class: `${prefixCls.value}--right-wrapper`,
          },
          rightSlot({
            $grid: $asGrid,
            // TODO $gantt: null
          } as any),
        );
      }
      return createCommentVNode();
    };

    /**
     * 渲染表格底部区域
     */
    const renderBottom = () => {
      if (slots.bottom) {
        return h(
          'div',
          {
            ref: refBottomWrapper,
            key: 'bottom',
            class: `${prefixCls.value}--bottom-wrapper`,
          },
          slots.bottom({
            $grid: $asGrid,
            // TODO $gantt: null
          } as any),
        );
      }
      return createCommentVNode();
    };

    /**
     * 从 Table 组件已声明的 emit 事件名反推监听键（onXxx）
     * 说明：目标库的 emit 事件名是运行时推导出来的，这里直接从组件上读取，避免维护两份事件清单
     */
    const getTableEmitListenerKeys = () => {
      if (!tableEmitListenerKeys) {
        const emits = ((Table as any).emits || []) as string[];
        const names = isArray(emits) ? emits : Object.keys(emits);
        tableEmitListenerKeys = new Set(
          names.map(
            (name) => `on${name.charAt(0).toUpperCase()}${name.slice(1)}`,
          ),
        );
      }
      return tableEmitListenerKeys;
    };

    /**
     * 表格事件透传
     * 说明：监听器会被 Vue 归入 emit 监听而不进入 props / attrs，因此从 vnode.props 中取原始监听，
     * 再通过 grid 的 emit 重新派发，保持与 vxe-grid 一致的事件冒泡行为
     */
    const computeTableEvents = () => {
      const events: Record<string, (...args: any[]) => void> = {};
      const vnodeProps = instance?.vnode.props as
        | null
        | Record<string, any>
        | undefined;
      if (vnodeProps) {
        getTableEmitListenerKeys().forEach((key) => {
          const handler = vnodeProps[key];
          if (typeof handler === 'function') {
            const eventName = key.charAt(2).toLowerCase() + key.slice(3);
            events[key] = (...args: any[]) => {
              (emit as any)(eventName, ...args);
            };
          }
        });
      }
      return events;
    };

    /**
     * 渲染表格
     */
    const renderTable = () => {
      const tableProps = computeTableProps.value;
      const tableOns = computeTableEvents();
      const emptySlot = slots.empty;
      const loadingSlot = slots.loading;
      const rowDragIconSlot = slots.rowDragIcon || slots['row-drag-icon'];
      const columnDragIconSlot =
        slots.columnDragIcon || slots['column-drag-icon'];
      const headerTooltipSlot = slots.headerTooltip || slots['header-tooltip'];
      const tooltipSlot = slots.tooltip;
      const footerTooltipSlot = slots.footerTooltip || slots['footer-tooltip'];
      const slotObj: Record<string, any> = {};
      if (emptySlot) {
        slotObj.empty = emptySlot;
      }
      if (loadingSlot) {
        slotObj.loading = loadingSlot;
      }
      if (rowDragIconSlot) {
        slotObj.rowDragIcon = rowDragIconSlot;
      }
      if (columnDragIconSlot) {
        slotObj.columnDragIcon = columnDragIconSlot;
      }
      if (headerTooltipSlot) {
        slotObj.headerTooltip = headerTooltipSlot;
      }
      if (tooltipSlot) {
        slotObj.tooltip = tooltipSlot;
      }
      if (footerTooltipSlot) {
        slotObj.footerTooltip = footerTooltipSlot;
      }
      return h(
        'div',
        {
          class: `${prefixCls.value}--table-wrapper`,
        },
        [
          h(
            Table,
            {
              ref: refTable,
              ...tableProps,
              ...tableOns,
            },
            slotObj,
          ),
        ],
      );
    };

    /**
     * 分页改变事件
     */
    const pageChangeEvent = (currentPage: number, pageSize: number) => {
      const { tablePage } = reactData;
      const pagerOpts = computePagerOpts.value;
      tablePage.currentPage = currentPage;
      tablePage.pageSize = pageSize;
      (emit as any)('pageChange', {
        currentPage,
        pageSize,
        total: pagerOpts.total ?? tablePage.total,
      });
    };

    /**
     * 渲染分页
     */
    const renderPager = () => {
      const { pagerConfig } = props;
      const pagerOpts = computePagerOpts.value;
      const pagerSlot = slots.pager;
      if ((pagerConfig && isEnableConf(pagerOpts)) || pagerSlot) {
        return h(
          'div',
          {
            ref: refPagerWrapper,
            key: 'pager',
            class: `${prefixCls.value}--pager-wrapper`,
          },
          pagerSlot
            ? pagerSlot({ $grid: $asGrid } as any)
            : [
                h(AsPagination, {
                  ref: refPager,
                  current: pagerOpts.currentPage,
                  pageSize: pagerOpts.pageSize,
                  total: pagerOpts.total,
                  pageSizeOptions: pagerOpts.pageSizeOptions,
                  showSizeChanger: pagerOpts.showSizeChanger,
                  onChange: pageChangeEvent,
                }),
              ],
        );
      }
      return createCommentVNode();
    };

    /**
     * 渲染布局区域的子节点
     */
    const renderChildLayout = (layoutKeys: AsGridDefines.LayoutKey[]) => {
      const childVNs: VNode[] = [];
      layoutKeys.forEach((key) => {
        switch (key) {
          case 'Bottom': {
            childVNs.push(renderBottom());
            break;
          }
          case 'Pager': {
            childVNs.push(renderPager());
            break;
          }
          case 'Table': {
            childVNs.push(
              h(
                'div',
                {
                  key: 'table',
                  class: `${prefixCls.value}--table-container`,
                },
                [renderTableLeft(), renderTable(), renderTableRight()],
              ),
            );
            break;
          }
          case 'Top': {
            childVNs.push(renderTop());
            break;
          }
          // 未知布局项直接忽略
        }
      });
      return childVNs;
    };

    /**
     * 渲染布局
     */
    const renderLayout = () => {
      const { headKeys, bodyKeys, footKeys } = computeCurrLayoutConf.value;
      const asideLeftSlot = slots.asideLeft || slots['aside-left'];
      const asideRightSlot = slots.asideRight || slots['aside-right'];
      return [
        h(
          'div',
          {
            class: `${prefixCls.value}--layout-header-wrapper`,
          },
          renderChildLayout(headKeys),
        ),
        h(
          'div',
          {
            class: `${prefixCls.value}--layout-body-wrapper`,
          },
          [
            asideLeftSlot
              ? h(
                  'div',
                  {
                    class: `${prefixCls.value}--layout-aside-left-wrapper`,
                  },
                  asideLeftSlot({ $grid: $asGrid } as any),
                )
              : createCommentVNode(),
            h(
              'div',
              {
                class: `${prefixCls.value}--layout-body-content-wrapper`,
              },
              renderChildLayout(bodyKeys),
            ),
            asideRightSlot
              ? h(
                  'div',
                  {
                    class: `${prefixCls.value}--layout-aside-right-wrapper`,
                  },
                  asideRightSlot({ $grid: $asGrid } as any),
                )
              : createCommentVNode(),
          ],
        ),
        h(
          'div',
          {
            class: `${prefixCls.value}--layout-footer-wrapper`,
          },
          renderChildLayout(footKeys),
        ),
        h('div', {
          ref: refPopupContainerElem,
        }),
      ];
    };

    /**
     * 全局按键事件（最大化时 Esc 还原）
     */
    const handleGlobalKeydownEvent = (evnt: KeyboardEvent) => {
      const zoomOpts = computeZoomOpts.value;
      const isEsc = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ESCAPE);
      if (isEsc && reactData.isZMax && zoomOpts.escRestore !== false) {
        ($asGrid as any).triggerZoomEvent?.(evnt);
      }
    };

    const renderVN = () => {
      const styles = computeStyles.value;
      const isLoading = computeIsLoading.value;
      return (
        <div
          class={[
            prefixCls.value,
            {
              [`size--${size.value}`]: size.value,
              'is--round': props.round,
              'is--maximize': reactData.isZMax,
              'is--loading': isLoading,
            },
          ]}
          ref={refElem}
          style={styles}
        >
          {renderLayout()}
        </div>
      );
    };

    hooks.forEach((options) => {
      const { setupGrid } = options;
      if (setupGrid) {
        const hookRest = setupGrid($asGrid);
        if (hookRest && isObject(hookRest)) {
          Object.assign($asGrid, hookRest);
        }
      }
    });

    // TODO initPages();

    onMounted(() => {
      nextTick(() => {
        const { columns } = props;
        if (columns && columns.length > 0) {
          $asGrid.loadColumn(columns);
        }
      });
      globalEvents.on($asGrid, 'keydown', handleGlobalKeydownEvent);
    });

    onBeforeUnmount(() => {
      globalEvents.off($asGrid, 'keydown');
      assign(reactData, createReactData());
      assign(internalData, createInternalData());
    });

    $asGrid.renderVN = renderVN;

    // 暴露实例方法，便于通过 ref 调用 loadColumn/maximize 等 API
    context.expose($asGrid);

    provide('$asGantt', null);
    provide('$asGrid', $asGrid);

    return renderVN;
  },
  {
    name: 'AsGrid',
    inheritAttrs: false,
  },
);

export default Grid;

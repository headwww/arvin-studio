import type { ComponentPublicInstance, Ref } from 'vue';

import type { AsSharedTooltipInstance } from '..';
import type { AsColumnPropTypes } from './types/column';
import type { AsComponentSlotType, AsComponentStyleType } from './types/common';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTableEmits,
  AsTableMethods,
  AsTablePrivateComputed,
  AsTablePrivateMethods,
  AsTablePrivateRef,
  AsTableProps,
  AsTablePropTypes,
  TableMethods,
  TablePrivateMethods,
  ValueOf,
} from './types/table';

import {
  computed,
  createCommentVNode,
  defineComponent,
  h,
  inject,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  Teleport,
  watch,
} from 'vue';

import {
  StopOutlined,
  SubnodeOutlined,
  SwapOutlined,
} from '@arvin-studio/icons';
import {
  arrayEach,
  assign,
  browse,
  clone,
  clsx,
  destructuring,
  each,
  eachTree,
  eqNull,
  filterTree,
  findIndexOf,
  findTree,
  first,
  floor,
  get,
  has,
  includeArrays,
  includes,
  isArray,
  isBoolean,
  isEmpty,
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
  keys,
  last,
  lastArrayEach,
  lastEach,
  mapTree,
  objectEach,
  orderBy,
  searchTree,
  set,
  toArray,
  toArrayTree,
  toInteger,
  toJSONString,
  toNumber,
  toString,
  toStringJSON,
  toTreeArray,
  toValueString,
  uniqueId,
  values,
} from '@arvin-studio/kit';

import { ArvinStudio, message, SharedTooltip } from '..';
import {
  clearColAnimate,
  clearRowAnimate,
  moveColAnimateToLr,
  moveRowAnimateToTb,
} from '../_util/anime';
import {
  addClass,
  checkTargetElement,
  getEventTargetNode,
  getPaddingTopBottomSize,
  getTpImg,
  hasAxternalInputTarget,
  hasClass,
  hasControlKey,
  initTpImg,
  isPx,
  isScale,
  removeClass,
  setScrollLeft,
  setScrollTop,
  toCssUnit,
  wheelScrollLeftTo,
  wheelScrollTopTo,
} from '../_util/dom';
import useLog from '../_util/logger';
import { getSlotVNs } from '../_util/vn';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import { useLocaleContext } from '../locale';
import enUS from '../locale/en_US';
import useLocale from '../locale/useLocale';
import Spin from '../spin';
import { genCssVar } from '../theme/util/genStyleUtils';
import { getLastZIndex, nextZIndex } from '../tooltip/util';
import version from '../version';
import TableBodyComponent from './body';
import { Cell, formatLocaleText } from './cell';
import { config } from './config';
import TableFooterComponent from './footer';
import TableHeaderComponent from './header';
import TableCustomPanelComponent from './module/custom/panel';
import TableFilterPanelComponent from './module/filter/panel';
import TableMenuPanelComponent from './module/menu/panel';
import { getCrossTableDragRowInfo } from './store';
import useStyle from './style';
import {
  clearTableAllStatus,
  colToVisible,
  createHandleGetRowId,
  createHandleUpdateRowId,
  createInternalData,
  createReactData,
  createRowId,
  encodeRowid,
  eqCellValue,
  eqEmptyValue,
  formatText,
  getCalcHeight,
  getCellRestHeight,
  getCellValue,
  getColReMaxWidth,
  getColReMinWidth,
  getColumnList,
  getFuncText,
  getLastChildColumn,
  getRefElem,
  getRootColumn,
  getRowid,
  getRowkey,
  getRowMaxHeight,
  getRowUniqueId,
  handleCustomStoreConfig,
  handleFieldOrColumn,
  handleRowidOrRow,
  hasChildrenList,
  hasDeepKey,
  isEnableConf,
  restoreScrollLocation,
  rowToVisible,
  setCellValue,
  toFilters,
  toTreePathSeq,
} from './util';

import './module/edit/hook';
import './module/keyboard/hook';
import './module/validator/hook';
import './module/filter/hook';
import './module/menu/hook';
import './module/custom/hook';

const supportMaxRow = 5e6;
const customStorageKey = 'AS_CUSTOM_STORE';
const maxXWidth = 5e6;
const maxYHeight = 5e6;
const sourceType = 'table';

const {
  renderer,
  formats,
  createEvent,
  globalEvents,
  GLOBAL_EVENT_KEYS,
  interceptor,
  hooks,
  globalResize,
} = ArvinStudio;
const defaults = {
  size: 'medium',
  showHeader: true,
  autoResize: true,
  keepSource: false,
} as AsTableProps;

// oxlint-disable-next-line no-unused-vars
let crossTableDragRowObj: null | {
  $newTable: (AsTableConstructor & AsTablePrivateMethods) | null;
  $oldTable: AsTableConstructor & AsTablePrivateMethods;
} = null;

export const Table = defineComponent<AsTableProps>(
  (props = defaults, context) => {
    const { slots, emit } = context;
    const log = useLog('Table');
    const [locale] = useLocale('Table', enUS.Table);

    const {
      prefixCls,
      rootPrefixCls,
      rowConfig: cRowConfig,
      treeConfig: cTreeConfig,
      filterConfig: cFilterConfig,
      sortConfig: cSortConfig,
      aggregateConfig: cAggregateConfig,
      aggregateAccuracyConfig: cAggregateAccuracyConfig,
      clipConfig: cClipConfig,
      fnrConfig: cFnrConfig,
      menuConfig: cMenuConfig,
      undoRedoHistoryConfig: cUndoRedoHistoryConfig,
      exportConfig: cExportConfig,
      importConfig: cImportConfig,
      printConfig: cPrintConfig,
      checkboxConfig: cCheckboxConfig,
      virtualYConfig: cVirtualYConfig,
      customConfig: cCustomConfig,
      columnDragConfig: cColumnDragConfig,
      columnConfig: cColumnConfig,
      expandConfig: cExpandConfig,
      mouseConfig: cMouseConfig,
      virtualXConfig: cVirtualXConfig,
      rendererConfig: cRendererConfig,
      rowDragConfig: cRowDragConfig,
      cellConfig: cCellConfig,
      headerCellConfig: cHeaderCellConfig,
      emptyRender: cEmptyRender,
      loadingConfig: cLoadingConfig,
      editConfig: cEditConfig,
      radioConfig: cRadioConfig,
      tooltipConfig: cTooltipConfig,
      validConfig: cValidConfig,
      resizableConfig: cResizableConfig,
      seqConfig: cSeqConfig,
      areaConfig: cAreaConfig,
      floatingFilterConfig: cFloatingFilterConfig,
      headerTooltipConfig: cHeaderTooltipConfig,
      footerTooltipConfig: cFooterTooltipConfig,
      editDirtyConfig: cEditDirtyConfig,
      scrollbarConfig: cScrollbarConfig,
      minHeight: cMinHeight,
      resizeConfig: cResizeConfig,
      footerCellConfig: cFooterCellConfig,
      keyboardConfig: cKeyboardConfig,
      currentColumnConfig: cCurrentColumnConfig,
      currentRowConfig: cCurrentRowConfig,
    } = useComponentBaseConfig('table', props, [
      'resizeConfig',
      'rowConfig',
      'treeConfig',
      'filterConfig',
      'sortConfig',
      'aggregateConfig',
      'aggregateAccuracyConfig',
      'clipConfig',
      'fnrConfig',
      'menuConfig',
      'undoRedoHistoryConfig',
      'exportConfig',
      'importConfig',
      'printConfig',
      'checkboxConfig',
      'virtualYConfig',
      'customConfig',
      'columnDragConfig',
      'columnConfig',
      'expandConfig',
      'mouseConfig',
      'virtualXConfig',
      'rendererConfig',
      'rowDragConfig',
      'cellConfig',
      'headerCellConfig',
      'emptyRender',
      'loadingConfig',
      'editConfig',
      'radioConfig',
      'validConfig',
      'tooltipConfig',
      'resizableConfig',
      'areaConfig',
      'floatingFilterConfig',
      'headerTooltipConfig',
      'editDirtyConfig',
      'scrollbarConfig',
      'minHeight',
      'footerTooltipConfig',
      'footerCellConfig',
      'seqConfig',
      'keyboardConfig',
      'currentColumnConfig',
      'currentRowConfig',
    ]);

    const [hashId, cssVarCls] = useStyle(prefixCls);

    const xID = uniqueId();

    const browseObj = browse();

    const $asParentTable = inject<
      (AsTableConstructor & AsTablePrivateMethods) | null
    >('$asTable', null);

    const mergedSize = useSize(computed(() => props.size ?? 'medium'));

    const crossTableDragRowInfo = getCrossTableDragRowInfo();

    const reactData = reactive(createReactData());

    const internalData = createInternalData();

    let tableMethods = {} as TableMethods;
    let tablePrivateMethods = {} as TablePrivateMethods;

    const refElem = ref() as Ref<HTMLDivElement>;
    const refVarElem = ref() as Ref<HTMLDivElement>;
    const refTooltip = ref() as Ref<AsSharedTooltipInstance>;
    const refCommTooltip = ref() as Ref<AsSharedTooltipInstance>;
    const refValidTooltip = ref() as Ref<AsSharedTooltipInstance>;
    const refTableFilter = ref() as Ref<any>;
    const refTableMenu = ref() as Ref<any>;
    const refTableCustom = ref() as Ref<any>;

    const refTableViewportElem = ref<HTMLDivElement>();
    const refTableHeader = ref() as Ref<ComponentPublicInstance>;
    const refTableBody = ref() as Ref<ComponentPublicInstance>;
    const refTableFooter = ref() as Ref<ComponentPublicInstance>;
    const refTableLeftHeader = ref() as Ref<ComponentPublicInstance>;
    const refTableLeftBody = ref() as Ref<ComponentPublicInstance>;
    const refTableLeftFooter = ref() as Ref<ComponentPublicInstance>;
    const refTableRightHeader = ref() as Ref<ComponentPublicInstance>;
    const refTableRightBody = ref() as Ref<ComponentPublicInstance>;
    const refTableRightFooter = ref() as Ref<ComponentPublicInstance>;

    const refTeleportWrapper = ref<HTMLDivElement>();
    const refPopupWrapperElem = ref<HTMLDivElement>();

    const refLeftContainer = ref() as Ref<HTMLDivElement>;
    const refRightContainer = ref() as Ref<HTMLDivElement>;
    const refColResizeBar = ref() as Ref<HTMLDivElement>;
    const refRowResizeBar = ref() as Ref<HTMLDivElement>;
    const refEmptyPlaceholder = ref() as Ref<HTMLDivElement>;

    const refDragTipElem = ref<HTMLDivElement>();
    const refDragRowLineElem = ref<HTMLDivElement>();
    const refDragColLineElem = ref<HTMLDivElement>();

    const refRowExpandElem = ref<HTMLDivElement>();
    const refRowExpandYSpaceElem = ref<HTMLDivElement>();

    const refScrollXVirtualElem = ref<HTMLDivElement>();
    const refScrollYVirtualElem = ref<HTMLDivElement>();
    const refScrollXHandleElem = ref<HTMLDivElement>();
    const refScrollXLeftCornerElem = ref<HTMLDivElement>();
    const refScrollXRightCornerElem = ref<HTMLDivElement>();
    const refScrollYHandleElem = ref<HTMLDivElement>();
    const refScrollYTopCornerElem = ref<HTMLDivElement>();
    const refScrollXWrapperElem = ref<HTMLDivElement>();
    const refScrollYWrapperElem = ref<HTMLDivElement>();
    const refScrollYBottomCornerElem = ref<HTMLDivElement>();
    const refScrollXSpaceElem = ref<HTMLDivElement>();
    const refScrollYSpaceElem = ref<HTMLDivElement>();

    const computeTableId = computed(() => {
      const { id } = props;
      if (id) {
        if (isFunction(id)) {
          // TODO return `${id({ $table: $asTable, $grid: $asGrid, $gantt: $xeGantt }) || ''}`
          return `${id({ $table: $asTable }) || ''}`;
        }
        return `${id}`;
      }
      return '';
    });

    const computeRowField = computed(() => {
      const rowOpts = computeRowOpts.value;
      return `${rowOpts.keyField || '_AS_ROW_KEY'}`;
    });

    const computeValidOpts = computed(() => {
      const opts = Object.assign(
        {},
        config.table.validConfig,
        cValidConfig.value,
        props.validConfig,
      );
      return opts;
    });

    const computeScrollXThreshold = computed(() => {
      const virtualXOpts = computeVirtualXOpts.value;
      const { threshold } = virtualXOpts;
      if (threshold) {
        return toNumber(threshold);
      }
      return 0;
    });

    const computeVirtualXOpts = computed(() => {
      const { virtualXConfig } = props;
      return Object.assign(
        {},
        config.table.virtualXConfig,
        cVirtualXConfig.value,
        virtualXConfig,
      ) as AsTablePropTypes.VirtualXConfig & { gt: number };
    });

    const computeVirtualYOpts = computed(() => {
      const { virtualYConfig } = props;
      return Object.assign(
        {},
        config.table.virtualYConfig,
        cVirtualYConfig.value,
        virtualYConfig,
      ) as AsTablePropTypes.VirtualYConfig & { gt: number };
    });

    const computeVirtualScrollBars = computed(() => {
      const { overflowX, scrollXLoad, overflowY, scrollYLoad } = reactData;
      return {
        x: overflowX && scrollXLoad,
        y: overflowY && scrollYLoad,
      };
    });

    const computeScrollbarOpts = computed(() => {
      return Object.assign(
        {},
        config.table.scrollbarConfig as AsTablePropTypes.ScrollbarConfig,
        cScrollbarConfig.value,
        props.scrollbarConfig,
      );
    });

    const computeScrollbarXOpts = computed(() => {
      const scrollbarOpts = computeScrollbarOpts.value;
      return Object.assign({}, scrollbarOpts.x, props.scrollbarConfig?.x || {});
    });

    const computeScrollbarYOpts = computed(() => {
      const scrollbarOpts = computeScrollbarOpts.value;
      return Object.assign({}, scrollbarOpts.y, props.scrollbarConfig?.y || {});
    });

    const computeScrollbarXToTop = computed(() => {
      const scrollbarXOpts = computeScrollbarXOpts.value;
      return scrollbarXOpts.position === 'top';
    });

    const computeScrollbarYToLeft = computed(() => {
      const scrollbarYOpts = computeScrollbarYOpts.value;
      return scrollbarYOpts.position === 'left';
    });

    const computeScrollYThreshold = computed(() => {
      const virtualYOpts = computeVirtualYOpts.value;
      const { threshold } = virtualYOpts;
      if (threshold) {
        return toNumber(threshold);
      }
      return 0;
    });

    const computeRowHeightMaps = computed(() => {
      return reactData.rowHeightStore;
    });

    const computeDefaultRowHeight = computed(() => {
      const vSize = mergedSize.value;
      const rowHeightMaps = computeRowHeightMaps.value;
      return rowHeightMaps[vSize || 'medium'] || 18;
    });

    const computeColumnOpts = computed(() => {
      return Object.assign(
        {},
        config.table.columnConfig,
        cColumnConfig.value,
        props.columnConfig,
      );
    });

    const computeCurrentColumnOpts = computed(() => {
      return Object.assign(
        {},
        config.table.currentColumnConfig,
        cCurrentColumnConfig.value,
        props.currentColumnConfig,
      );
    });

    const computeCellOpts = computed(() => {
      const cellOpts = Object.assign(
        {},
        config.table.cellConfig,
        cCellConfig.value,
        props.cellConfig,
      );
      if (cellOpts.height) {
        cellOpts.height = toNumber(cellOpts.height);
      }
      return cellOpts;
    });

    const computeHeaderCellOpts = computed(() => {
      const headerCellOpts = Object.assign(
        {},
        config.table.headerCellConfig as AsTablePropTypes.HeaderCellConfig,
        cHeaderCellConfig.value,
        props.headerCellConfig,
      );

      const cellOpts = computeCellOpts.value;
      let headCellHeight = toNumber(
        getCalcHeight(headerCellOpts.height || cellOpts.height),
      );
      // TODO if ($xeGantt) {
      //         const { computeTaskViewScales } = $xeGantt.getComputeMaps()
      //         const taskViewScales = computeTaskViewScales.value
      //         if (taskViewScales && taskViewScales.length > 2) {
      //           const ganttMinHeadCellHeight = defaultRowHeight / 2 * taskViewScales.length
      //           headCellHeight = Math.max(ganttMinHeadCellHeight, headCellHeight)
      //         }
      //       }
      headerCellOpts.height = headCellHeight;
      return headerCellOpts;
    });

    const computeFooterCellOpts = computed(() => {
      const footerCellOpts = Object.assign(
        {},
        config.table.footerCellConfig as AsTablePropTypes.FooterCellConfig,
        cFooterCellConfig.value,
        props.footerCellConfig,
      );
      const cellOpts = computeCellOpts.value;
      footerCellOpts.height = toNumber(
        getCalcHeight(footerCellOpts.height || cellOpts.height),
      );
      return footerCellOpts;
    });

    const computeRowOpts = computed(() => {
      return Object.assign({}, cRowConfig.value, props.rowConfig);
    });

    const computeAggregateOpts = computed(() => {
      return Object.assign(
        {},
        config.table.aggregateConfig,
        cAggregateConfig.value,
        props.aggregateConfig,
      );
    });

    const computeAggregateMode = computed(() => {
      const aggregateOpts = computeAggregateOpts.value;
      return aggregateOpts.mode;
    });

    const computeAggregateAccuracyOpts = computed(() => {
      return Object.assign(
        {},
        config.table.aggregateAccuracyConfig,
        cAggregateAccuracyConfig.value,
        props.aggregateAccuracyConfig,
      );
    });

    const computeCurrentRowOpts = computed(() => {
      return Object.assign(
        {},
        config.table.currentRowConfig,
        cCurrentRowConfig.value,
        props.currentRowConfig,
      );
    });

    const computeRowDragOpts = computed(() => {
      return Object.assign(
        {},
        config.table.rowDragConfig,
        cRowDragConfig.value,
        props.rowDragConfig,
      );
    });

    const computeColumnDragOpts = computed(() => {
      return Object.assign(
        {},
        config.table.columnDragConfig,
        cColumnDragConfig.value,
        props.columnDragConfig,
      ) as AsTablePropTypes.ColumnDragConfig;
    });

    const computeResizeOpts = computed(() => {
      return Object.assign(
        {},
        config.table.resizeConfig,
        cResizeConfig.value,
        props.resizeConfig,
      ) as AsTablePropTypes.ResizeOpts;
    });

    const computeResizableOpts = computed(() => {
      return Object.assign(
        {},
        config.table.resizableConfig,
        cResizableConfig.value,
        props.resizableConfig,
      ) as AsTablePropTypes.ResizableOpts;
    });

    const computeSeqOpts = computed(() => {
      return Object.assign(
        { startIndex: 0 },
        cSeqConfig.value,
        props.seqConfig,
      ) as AsTablePropTypes.SeqOpts;
    });

    const computeRadioOpts = computed(() => {
      return Object.assign(
        {},
        config.table.radioConfig,
        cRadioConfig.value,
        props.radioConfig,
      ) as AsTablePropTypes.RadioOpts;
    });

    const computeCheckboxOpts = computed(() => {
      return Object.assign(
        {},
        config.table.checkboxConfig,
        cCheckboxConfig.value,
        props.checkboxConfig,
      ) as AsTablePropTypes.CheckboxOpts;
    });

    const computeTooltipOpts = computed(() => {
      return Object.assign(
        {},
        config.table.tooltipConfig,
        cTooltipConfig.value,
        props.tooltipConfig,
      );
    });

    const computeHeaderTooltipOpts = computed(() => {
      const tooltipOpts = computeTooltipOpts.value;
      return Object.assign(
        {},
        {
          enterable: tooltipOpts.enterable,
          defaultPlacement: tooltipOpts.defaultPlacement,
        },
        config.table.headerTooltipConfig,
        cHeaderTooltipConfig.value,
        props.headerTooltipConfig,
      );
    });

    const computeFooterTooltipOpts = computed(() => {
      const tooltipOpts = computeTooltipOpts.value;
      return Object.assign(
        {},
        {
          enterable: tooltipOpts.enterable,
          defaultPlacement: tooltipOpts.defaultPlacement,
        },
        config.table.footerTooltipConfig,
        cFooterTooltipConfig.value,
        props.footerTooltipConfig,
      );
    });

    const computeTableTipConfig = computed(() => {
      const { tooltipStore } = reactData;
      const tooltipOpts = computeTooltipOpts.value;
      return Object.assign({}, tooltipOpts, tooltipStore.currOpts);
    });

    const computeValidTipConfig = computed(() => {
      return Object.assign({}, computeTooltipOpts.value);
    });

    const computeEditOpts = computed(() => {
      return Object.assign(
        {},
        config.table.editConfig,
        cEditConfig.value,
        props.editConfig,
      ) as AsTablePropTypes.EditOpts;
    });

    const computeEditDirtyOpts = computed(() => {
      return Object.assign({}, cEditDirtyConfig.value, props.editDirtyConfig);
    });

    const computeSortOpts = computed(() => {
      return Object.assign(
        { orders: ['asc', 'desc', null] },
        config.table.sortConfig,
        cSortConfig.value,
        props.sortConfig,
      ) as AsTablePropTypes.SortOpts;
    });

    const computeFilterOpts = computed(() => {
      return Object.assign(
        {},
        config.table.filterConfig as AsTablePropTypes.FilterOpts,
        cFilterConfig.value,
        props.filterConfig,
      ) as AsTablePropTypes.FilterOpts;
    });

    const computeFloatingFilterOpts = computed(() => {
      return Object.assign(
        {},
        config.table.floatingFilterConfig,
        cFloatingFilterConfig.value,
        props.floatingFilterConfig,
      );
    });

    const computeMouseOpts = computed(() => {
      return Object.assign(
        {},
        config.table.mouseConfig,
        cMouseConfig.value,
        props.mouseConfig,
      ) as AsTablePropTypes.MouseOpts;
    });

    const computeAreaOpts = computed(() => {
      return Object.assign(
        {},
        config.table.areaConfig,
        cAreaConfig.value,
        props.areaConfig,
      ) as AsTablePropTypes.AreaOpts;
    });

    const computeKeyboardOpts = computed(() => {
      return Object.assign(
        {},
        config.table.keyboardConfig,
        cKeyboardConfig.value,
        props.keyboardConfig,
      ) as AsTablePropTypes.KeyboardOpts;
    });

    const computeClipOpts = computed(() => {
      return Object.assign(
        {},
        config.table.clipConfig,
        cClipConfig.value,
        props.clipConfig,
      );
    });

    const computeUndoRedoHistoryOpts = computed(() => {
      return Object.assign(
        {},
        config.table.undoRedoHistoryConfig,
        cUndoRedoHistoryConfig.value,
        props.undoRedoHistoryConfig,
      );
    });

    const computeFnrOpts = computed(() => {
      return Object.assign(
        {},
        config.table.fnrConfig,
        cFnrConfig.value,
        props.fnrConfig,
      ) as AsTablePropTypes.FNROpts;
    });

    const computeMenuOpts = computed(() => {
      return Object.assign(
        {},
        config.table.menuConfig,
        cMenuConfig.value,
        props.menuConfig,
      ) as AsTablePropTypes.MenuOpts;
    });

    const computeHeaderMenu = computed(() => {
      const menuOpts = computeMenuOpts.value;
      const headerOpts = menuOpts.header;
      return headerOpts && headerOpts.options ? headerOpts.options : [];
    });

    const computeBodyMenu = computed(() => {
      const menuOpts = computeMenuOpts.value;
      const bodyOpts = menuOpts.body;
      return bodyOpts && bodyOpts.options ? bodyOpts.options : [];
    });

    const computeFooterMenu = computed(() => {
      const menuOpts = computeMenuOpts.value;
      const footerOpts = menuOpts.footer;
      return footerOpts && footerOpts.options ? footerOpts.options : [];
    });

    const computeIsContentMenu = computed(() => {
      const menuOpts = computeMenuOpts.value;
      const headerMenu = computeHeaderMenu.value;
      const bodyMenu = computeBodyMenu.value;
      const footerMenu = computeFooterMenu.value;
      return !!(
        props.menuConfig &&
        isEnableConf(menuOpts) &&
        (headerMenu.length > 0 || bodyMenu.length > 0 || footerMenu.length > 0)
      );
    });

    const computeMenuList = computed(() => {
      const { ctxMenuStore } = reactData;
      const rest: any[] = [];
      ctxMenuStore.list.forEach((list) => {
        list.forEach((item) => {
          rest.push(item);
        });
      });
      return rest;
    });

    const computeExportOpts = computed(() => {
      return Object.assign(
        {},
        config.table.exportConfig,
        cExportConfig.value,
        props.exportConfig,
      ) as AsTablePropTypes.ExportOpts;
    });

    const computeImportOpts = computed(() => {
      return Object.assign(
        {},
        config.table.importConfig,
        cImportConfig.value,
        props.importConfig,
      ) as AsTablePropTypes.ImportOpts;
    });

    const computePrintOpts = computed(() => {
      return Object.assign(
        {},
        config.table.printConfig,
        cPrintConfig.value,
        props.printConfig,
      ) as AsTablePropTypes.PrintOpts;
    });

    const computeLeftFixedWidth = computed(() => {
      const { columnStore } = reactData;
      const { leftList } = columnStore;
      let leftWidth = 0;
      for (const column of leftList) {
        leftWidth += column.renderWidth;
      }
      return leftWidth;
    });

    const computeRightFixedWidth = computed(() => {
      const { columnStore } = reactData;
      const { rightList } = columnStore;
      let leftWidth = 0;
      for (const column of rightList) {
        leftWidth += column.renderWidth;
      }
      return leftWidth;
    });

    const computeBodyMergeCoverFixed = computed(() => {
      const { columnStore, mergeBodyFlag } = reactData;
      const { mergeBodyList, visibleColumn } = internalData;
      const { leftList, rightList } = columnStore;
      const rscIndex = visibleColumn.length - rightList.length;
      if (mergeBodyFlag && (leftList.length > 0 || rightList.length > 0)) {
        const lecIndex = leftList.length;
        for (const { col, colspan } of mergeBodyList) {
          if (
            (col < lecIndex && col + colspan > lecIndex) ||
            (col < rscIndex && col + colspan > rscIndex)
          ) {
            return true;
          }
        }
      }
      return false;
    });

    const computeIsHeaderRenderOptimize = computed(() => {
      // 表格级配置：两个"合并方法" + 表头溢出总开关
      const {
        spanMethod,
        footerSpanMethod,
        showHeaderOverflow: allColumnHeaderOverflow,
      } = props;
      //  运行时状态：是否分组表头 + 是否开了横向虚拟滚动
      const { isGroup, scrollXLoad } = reactData;

      let isOptimizeMode = false;

      if (isGroup) {
        // 分组表头：直接不优化（保持 false）
        // 多级表头要跨列对齐（colspan 横跨多个切片区间），切片渲染会错位
      } else {
        //  前提：开了横向虚拟滚动 + 表格级允许表头溢出
        if (scrollXLoad && allColumnHeaderOverflow) {
          if (spanMethod || footerSpanMethod) {
            // 配了合并方法 → 不优化
            // 合并单元格可能跨越切片边界，切片会让跨界格消失/错位
          } else {
            isOptimizeMode = true; // 498 四个条件全部满足 → 可以按切片渲染
          }
        }
      }
      return isOptimizeMode;
    });

    const computeIsBodyRenderOptimize = computed(() => {
      const { spanMethod, footerSpanMethod } = props;
      const { scrollXLoad, scrollYLoad, isAllOverflow, expandColumn } =
        reactData;
      const bodyMergeCoverFixed = computeBodyMergeCoverFixed.value;
      const expandOpts = computeExpandOpts.value;
      let isOptimizeMode = false;
      // 如果是使用优化模式
      if (scrollXLoad || scrollYLoad || isAllOverflow) {
        // 如果是展开行，内联模式，不支持优化
        // 如果是方法合并，不支持优化
        // 如果固定列且配置式合并，不支持优化
        if (
          (expandColumn && expandOpts.mode !== 'fixed') ||
          bodyMergeCoverFixed ||
          spanMethod ||
          footerSpanMethod
        ) {
          // 如果不支持优化模式
        } else {
          isOptimizeMode = true;
        }
      }
      return isOptimizeMode;
    });

    const computeIsFooterRenderOptimize = computed(() => {
      const {
        spanMethod,
        footerSpanMethod,
        showFooterOverflow: allColumnFooterOverflow,
      } = props;
      const { scrollXLoad } = reactData;
      let isOptimizeMode = false;
      // 如果是使用优化模式
      if (scrollXLoad && allColumnFooterOverflow) {
        if (spanMethod || footerSpanMethod) {
          // 如果不支持优化模式
        } else {
          isOptimizeMode = true;
        }
      }
      return isOptimizeMode;
    });

    const computeExpandOpts = computed(() => {
      return Object.assign(
        {},
        config.table.expandConfig,
        cExpandConfig.value,
        props.expandConfig,
      ) as AsTablePropTypes.ExpandOpts;
    });

    const computeTreeOpts = computed(() => {
      return Object.assign(
        {},
        config.table.treeConfig,
        cTreeConfig.value,
        props.treeConfig,
      ) as AsTablePropTypes.TreeOpts;
    });

    const computeEmptyOpts = computed(() => {
      return Object.assign(
        {},
        cEmptyRender.value,
        props.emptyRender,
      ) as AsTablePropTypes.EmptyOpts;
    });

    const computeLoadingOpts = computed(() => {
      return Object.assign(
        { text: locale?.value.loadingText },
        config.table.loadingConfig,
        cLoadingConfig.value,
        props.loadingConfig,
      ) as AsTablePropTypes.LoadingConfig;
    });

    const computeCellOffsetWidth = computed(() => {
      return props.border
        ? Math.max(
            2,
            Math.ceil(reactData.scrollbarWidth / reactData.tableColumn.length),
          )
        : 1;
    });

    const computeCustomOpts = computed(() => {
      return Object.assign(
        {},
        config.table.customConfig,
        cCustomConfig.value,
        props.customConfig,
      );
    });

    const computeCustomSimpleMode = computed(() => {
      const { height, minHeight } = props;
      const customOpts = computeCustomOpts.value;
      const { mode, placement, popupOptions } = customOpts;
      if (
        (!placement || placement === 'top-left' || placement === 'top-right') &&
        !(mode === 'modal' || mode === 'drawer')
      ) {
        const { mode: popupMode } = popupOptions || {};
        if (!popupMode || popupMode === 'auto') {
          if (height || minHeight) {
            return 'inside';
          }
          return 'outside';
        }
        if (popupMode) {
          return popupMode;
        }
      }
      return '';
    });

    const computeTableStyle = computed(() => {
      const [varName] = genCssVar(rootPrefixCls.value, 'table');
      const { width, height } = computeScrollbarOpts.value;
      const style: AsComponentStyleType = {};
      if (width) {
        style[varName('scrollbar-width')] = toCssUnit(width);
      }
      if (height) {
        style[varName('scrollbar-height')] = toCssUnit(height);
      }
      return style;
    });

    const computeTableRowExpandedList = computed(() => {
      const {
        tableData,
        rowExpandedFlag,
        expandColumn,
        rowGroupExpandedFlag,
        treeExpandedFlag,
      } = reactData;
      const { visibleDataRowIdData, rowExpandedMaps } = internalData;
      const expandList: any[] = [];
      if (
        tableData.length > 0 &&
        expandColumn &&
        rowExpandedFlag &&
        rowGroupExpandedFlag &&
        treeExpandedFlag
      ) {
        each(rowExpandedMaps, (row, rowid) => {
          if (visibleDataRowIdData[rowid]) {
            expandList.push(row);
          }
        });
      }
      return expandList;
    });

    const computeAutoWidthColumnList = computed(() => {
      const { visibleColumn } = internalData;
      const { tableColumn } = reactData;
      return tableColumn.length > 0 || visibleColumn.length > 0
        ? visibleColumn.filter(
            (column) => column.width === 'auto' || column.minWidth === 'auto',
          )
        : [];
    });

    const computeFixedColumnSize = computed(() => {
      const { tableColumn } = reactData;
      const { collectColumn } = internalData;
      let fixedSize = 0;
      // 只判断第一层
      if (tableColumn.length > 0 && collectColumn.length > 0) {
        collectColumn.forEach((column) => {
          if (column.fixed) {
            fixedSize++;
          }
        });
      }
      return fixedSize;
    });

    const computeIsMaxFixedColumn = computed(() => {
      const fixedColumnSize = computeFixedColumnSize.value;
      const columnOpts = computeColumnOpts.value;
      const { maxFixedSize } = columnOpts;
      if (maxFixedSize) {
        return fixedColumnSize >= maxFixedSize;
      }
      return false;
    });

    const computeKeepFields = computed(() => {
      const { tableFullColumn } = internalData;
      const { updateColFlag } = reactData;
      const editDirtyOpts = computeEditDirtyOpts.value;
      const { extraFields, includeFields, excludeFields } = editDirtyOpts;
      const kpFields: string[] = [];
      if (updateColFlag) {
        // 优先级 excludeFields > (includeFields || extraFields)
        const excludeFdMaps: Record<string, number> = {};
        if (excludeFields && excludeFields.length > 0) {
          excludeFields.forEach((field) => {
            excludeFdMaps[field] = 1;
          });
        }
        if (includeFields && includeFields.length > 0) {
          return excludeFields && excludeFields.length > 0
            ? includeFields.filter((field) => !excludeFdMaps[field])
            : includeFields;
        }
        const addFdMaps: Record<string, number> = {};
        if (extraFields && extraFields.length > 0) {
          extraFields.forEach((field) => {
            if (addFdMaps[field]) {
              return;
            }

            addFdMaps[field] = 1;
            kpFields.push(field);
          });
        }

        for (const column of tableFullColumn) {
          const { field, type, editRender, cellRender } = column;
          if (
            field &&
            !type &&
            (editRender || cellRender) &&
            !addFdMaps[field] &&
            !excludeFdMaps[field]
          ) {
            addFdMaps[field] = 1;
            kpFields.push(field);
          }
        }
      }
      return kpFields;
    });

    const computeTableBorder = computed(() => {
      const { border } = props;
      if (border === true) {
        return 'full';
      }
      if (border) {
        return border;
      }
      return 'default';
    });

    const computeIsAllCheckboxDisabled = computed(() => {
      const { treeConfig } = props;
      const { tableData } = reactData;
      const { tableFullData } = internalData;
      const checkboxOpts = computeCheckboxOpts.value;
      const { strict, checkMethod } = checkboxOpts;
      if (strict) {
        if (tableData.length > 0 || tableFullData.length > 0) {
          if (checkMethod) {
            if (treeConfig) {
              // 暂时不支持树形结构
            }
            // 如果所有行都被禁用
            return tableFullData.every(
              (row) => !checkMethod({ $table: $asTable, row }),
            );
          }
          return false;
        }
        return true;
      }
      return false;
    });

    const computeRowGroupFields = computed(() => {
      const aggregateOpts = computeAggregateOpts.value;
      return aggregateOpts.groupFields ?? [];
    });

    const computeRowGroupColumns = computed(() => {
      const { rowGroupList } = reactData;
      const { fullColumnFieldData } = internalData;
      const rgColumns: AsTableDefines.ColumnInfo[] = [];
      rowGroupList.forEach((aggConf) => {
        const colRest = fullColumnFieldData[aggConf.field];
        if (colRest) {
          rgColumns.push(colRest.column);
        }
      });
      return rgColumns;
    });

    const computeAggFuncColumns = computed(() => {
      const { rowGroupList, tableColumn } = reactData;
      if (rowGroupList.length > 0) {
        return tableColumn.filter((column) => column.aggFunc);
      }
      return [];
    });

    // TODO: 当前仓库的 Tabs / Modal / Splitter 尚未提供 resizeFlag，
    // 接入父级实例后再返回对应的 reactData.resizeFlag
    // const combineTabsResizeFlag = computed<boolean | null>(() => null);
    // const combineModalResizeFlag = computed<boolean | null>(() => null);
    // const combineSplitterResizeFlag = computed<boolean | null>(() => null);

    const computeRendererOpts = computed(() => {
      return Object.assign({}, cRendererConfig.value, props.rendererConfig);
    });

    const refMaps: AsTablePrivateRef = {
      refElem,
      refTooltip,
      refTableFilter,
      refTableMenu,
      refTableCustom,
      refValidTooltip,
      refTableHeader,
      refTableBody,
      refTableFooter,
      refTableLeftHeader,
      refTableLeftBody,
      refTableLeftFooter,
      refTableRightHeader,
      refTableRightBody,
      refTableRightFooter,
      refLeftContainer,
      refRightContainer,
      refColResizeBar,
      refRowResizeBar,
      refScrollXVirtualElem,
      refScrollYVirtualElem,
      refScrollXHandleElem,
      refScrollYHandleElem,
      refScrollXSpaceElem,
      refScrollYSpaceElem,
    };

    const computeMaps: AsTablePrivateComputed = {
      computeSize: mergedSize,
      computeTableId,
      computeValidOpts,
      computeRowField,
      computeVirtualXOpts,
      computeVirtualYOpts,
      computeScrollbarOpts,
      computeScrollbarXOpts,
      computeScrollbarYOpts,
      computeScrollbarXToTop,
      computeScrollbarYToLeft,
      computeColumnOpts,
      computeCurrentColumnOpts,
      computeScrollXThreshold,
      computeScrollYThreshold,
      computeRowHeightMaps,
      computeDefaultRowHeight,
      computeCellOpts,
      computeHeaderCellOpts,
      computeFooterCellOpts,
      computeRowOpts,
      computeAggregateOpts,
      computeAggregateAccuracyOpts,
      computeCurrentRowOpts,
      computeRowDragOpts,
      computeColumnDragOpts,
      computeResizeOpts,
      computeResizableOpts,
      computeSeqOpts,
      computeRadioOpts,
      computeCheckboxOpts,
      computeTooltipOpts,
      computeHeaderTooltipOpts,
      computeFooterTooltipOpts,
      computeEditOpts,
      computeEditDirtyOpts,
      computeSortOpts,
      computeFilterOpts,
      computeFloatingFilterOpts,
      computeMouseOpts,
      computeAreaOpts,
      computeKeyboardOpts,
      computeClipOpts,
      computeFnrOpts,
      computeHeaderMenu,
      computeBodyMenu,
      computeFooterMenu,
      computeIsContentMenu,
      computeMenuList,
      computeMenuOpts,
      computeExportOpts,
      computeImportOpts,
      computePrintOpts,
      computeExpandOpts,
      computeTreeOpts,
      computeEmptyOpts,
      computeLoadingOpts,
      computeCellOffsetWidth,
      computeCustomOpts,
      computeCustomSimpleMode,
      computeLeftFixedWidth,
      computeRightFixedWidth,
      computeBodyMergeCoverFixed,
      computeFixedColumnSize,
      computeIsMaxFixedColumn,
      computeKeepFields,
      computeIsAllCheckboxDisabled,
      computeIsHeaderRenderOptimize,
      computeIsBodyRenderOptimize,
      computeIsFooterRenderOptimize,
      computeVirtualScrollBars,
      computeRowGroupFields,
      computeRowGroupColumns,
      computeAggFuncColumns,
      computeUndoRedoHistoryOpts,
      computeRendererOpts,
    };

    const $asTable = {
      xID,
      prefixCls,
      context,
      props: props as AsTableProps,
      reactData,
      internalData,
      getRefMaps: () => refMaps,
      getComputeMaps: () => computeMaps,
    } as unknown as AsTableConstructor & AsTableMethods & AsTablePrivateMethods;

    // 暴露表格实例方法，便于通过 ref 调用 openCustom/openFilter 等 API
    context.expose($asTable);

    const handleKeyField = () => {
      const keyField = computeRowField.value;
      internalData.currKeyField = keyField;
      internalData.isCurrDeepKey = hasDeepKey(keyField);
    };

    const getNextSortOrder = (column: AsTableDefines.ColumnInfo) => {
      const sortOpts = computeSortOpts.value;
      const { orders = [] } = sortOpts;
      const currOrder = column.order || null;
      const oIndex = orders.indexOf(currOrder) + 1;
      return orders[oIndex < orders.length ? oIndex : 0];
    };

    const getCustomStorageMap = (id?: string) => {
      const rest = toStringJSON(localStorage.getItem(customStorageKey) || '');
      const maps = rest && rest._v === version ? rest : { _v: version };
      return (id ? maps[id] : maps) || {};
    };

    const setCustomStorageMap = (id: string, data: any) => {
      const maps = getCustomStorageMap();
      maps[id] = data || undefined;
      maps._v = version;
      localStorage.setItem(customStorageKey, toJSONString(maps));
    };

    const getRecoverRowMaps = (keyMaps: Record<string, any>) => {
      const { fullAllDataRowIdData } = internalData;
      const restKeys: Record<string, any> = {};
      each(keyMaps, (row, rowid) => {
        if (fullAllDataRowIdData[rowid]) {
          restKeys[rowid] = row;
        }
      });
      return restKeys;
    };

    const handleReserveRow = (reserveRowMap: any) => {
      const { fullDataRowIdData } = internalData;
      const reserveList: any[] = [];
      each(reserveRowMap, (item, rowid) => {
        if (
          fullDataRowIdData[rowid] &&
          $asTable.findRowIndexOf(reserveList, fullDataRowIdData[rowid].row) ===
            -1
        ) {
          reserveList.push(fullDataRowIdData[rowid].row);
        }
      });
      return reserveList;
    };

    /** 计算横向虚拟滚动显示的哪几列 */
    const handleVirtualXVisible = () => {
      const { isScrollXBig, scrollXWidth } = reactData;
      const { elemStore, visibleColumn, fullColumnIdData } = internalData;
      const leftFixedWidth = computeLeftFixedWidth.value;
      const rightFixedWidth = computeRightFixedWidth.value;
      const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
      if (bodyScrollElem) {
        const clientWidth = bodyScrollElem.clientWidth;
        let scrollLeft = bodyScrollElem.scrollLeft;
        if (isScrollXBig) {
          scrollLeft = Math.ceil(
            (scrollXWidth - clientWidth) *
              Math.min(1, scrollLeft / (maxXWidth - clientWidth)),
          );
        }
        const startLeft = scrollLeft + leftFixedWidth;
        const endLeft = scrollLeft + clientWidth - rightFixedWidth;
        let leftIndex = 0;
        let rightIndex = visibleColumn.length;
        while (leftIndex < rightIndex) {
          const cIndex = Math.floor((leftIndex + rightIndex) / 2);
          const column = visibleColumn[cIndex]!;
          const colid = column.id;
          const colRest =
            fullColumnIdData[colid] || ({} as AsTableDefines.ColumnCacheItem);
          if (colRest.oLeft <= startLeft) {
            leftIndex = cIndex + 1;
          } else {
            rightIndex = cIndex;
          }
        }
        let visibleSize = 0;
        const toVisibleIndex =
          leftIndex === visibleColumn.length
            ? leftIndex
            : Math.max(0, leftIndex < visibleColumn.length ? leftIndex - 2 : 0);
        for (
          let cIndex = toVisibleIndex, cLen = visibleColumn.length;
          cIndex < cLen;
          cIndex++
        ) {
          const column = visibleColumn[cIndex]!;
          const colid = column.id;
          const colRest =
            fullColumnIdData[colid] || ({} as AsTableDefines.ColumnCacheItem);
          visibleSize++;
          if (colRest.oLeft > endLeft || visibleSize >= 60) {
            break;
          }
        }
        return {
          toVisibleIndex: Math.max(0, toVisibleIndex),
          visibleSize: Math.max(1, visibleSize),
        };
      }
      return { toVisibleIndex: 0, visibleSize: 6 };
    };

    const calcVarRowHeightConfig = (
      sizeKey: 'large' | 'medium' | 'small',
      sizeEl?: Element,
    ) => {
      const { rowHeightStore } = reactData;
      if (sizeEl && sizeEl.clientHeight) {
        rowHeightStore[sizeKey] = sizeEl.clientHeight;
      }
    };

    const handleVirtualYVisible = () => {
      const { isAllOverflow, expandColumn, isScrollYBig, scrollYHeight } =
        reactData;
      const {
        elemStore,
        isResizeCellHeight,
        afterFullData,
        fullAllDataRowIdData,
      } = internalData;
      const cellOpts = computeCellOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;
      const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
      if (bodyScrollElem) {
        const clientHeight = bodyScrollElem.clientHeight;
        let scrollTop = bodyScrollElem.scrollTop;
        if (isScrollYBig) {
          scrollTop = Math.ceil(
            (scrollYHeight - clientHeight) *
              Math.min(1, scrollTop / (maxYHeight - clientHeight)),
          );
        }
        const startTop = scrollTop;
        const endTop = scrollTop + clientHeight;

        let toVisibleIndex = -1;
        let visibleSize = 0;
        const isCustomCellHeight = isResizeCellHeight || cellOpts.height;
        if (!isCustomCellHeight && !expandColumn && isAllOverflow) {
          toVisibleIndex = Math.floor(startTop / defaultRowHeight) - 1;
          visibleSize = Math.ceil(clientHeight / defaultRowHeight) + 1;
        } else {
          const { handleGetRowId } = createHandleGetRowId($asTable);
          let leftIndex = 0;
          let rightIndex = afterFullData.length;
          while (leftIndex < rightIndex) {
            const rIndex = Math.floor((leftIndex + rightIndex) / 2);
            const row = afterFullData[rIndex];
            const rowid = handleGetRowId(row);
            const rowRest =
              fullAllDataRowIdData[rowid] ||
              ({} as AsTableDefines.RowCacheItem);
            if (rowRest.oTop <= startTop) {
              leftIndex = rIndex + 1;
            } else {
              rightIndex = rIndex;
            }
          }
          toVisibleIndex =
            leftIndex === afterFullData.length
              ? leftIndex
              : Math.max(
                  0,
                  leftIndex < afterFullData.length ? leftIndex - 2 : 0,
                );
          for (
            let rIndex = toVisibleIndex, rLen = afterFullData.length;
            rIndex < rLen;
            rIndex++
          ) {
            const row = afterFullData[rIndex];
            const rowid = handleGetRowId(row);
            const rowRest =
              fullAllDataRowIdData[rowid] ||
              ({} as AsTableDefines.RowCacheItem);
            visibleSize++;
            if (rowRest.oTop > endTop || visibleSize >= 100) {
              break;
            }
          }
        }
        return {
          toVisibleIndex: Math.max(0, toVisibleIndex),
          visibleSize: Math.max(6, visibleSize),
        };
      }
      return { toVisibleIndex: 0, visibleSize: 6 };
    };

    const calculateMergerOffsetIndex = (
      list: any[],
      mergeMaps: Record<
        string,
        AsTableDefines.MergeCacheCol | AsTableDefines.MergeCacheRow
      >,
      offsetItem: AsTableDefines.MergeCacheCol | AsTableDefines.MergeCacheRow,
      type: 'col' | 'row',
    ) => {
      const mKey = `${offsetItem.startIndex}:${offsetItem.endIndex}`;
      const mObj = mergeMaps[mKey];
      // 缓存
      if (mObj) {
        offsetItem.startIndex = mObj.startIndex;
        offsetItem.endIndex = mObj.endIndex;
      } else {
        for (let len = list.length, mcIndex = 0; mcIndex < len; mcIndex++) {
          const mergeItem = list[mcIndex];
          const { startIndex, endIndex } = offsetItem;
          const mergeStartIndex = mergeItem[type];
          const mergeSpanNumber = mergeItem[`${type}span`];
          const mergeEndIndex = mergeStartIndex + mergeSpanNumber;
          if (mergeStartIndex < startIndex && startIndex < mergeEndIndex) {
            offsetItem.startIndex = mergeStartIndex;
          }
          if (mergeStartIndex < endIndex && endIndex < mergeEndIndex) {
            offsetItem.endIndex = mergeEndIndex;
          }
          if (
            offsetItem.startIndex !== startIndex ||
            offsetItem.endIndex !== endIndex
          ) {
            mcIndex = -1;
          }
        }
        mergeMaps[mKey] = offsetItem;
      }
    };

    function buildMergeData(mergeConfigs: AsTableDefines.MergeItem[]) {
      const mergeMaps: Record<string, AsTableDefines.MergeCacheItem> = {};
      const mergeRowMaps: Record<string, AsTableDefines.MergeCacheRow> = {};
      const mergeColMaps: Record<string, AsTableDefines.MergeCacheCol> = {};
      if (mergeConfigs && mergeConfigs.length > 0) {
        for (const {
          row: _rowIndex,
          col: _columnIndex,
          rowspan: mergeRowspan,
          colspan: mergeColspan,
        } of mergeConfigs) {
          for (let i = 0; i < mergeRowspan; i++) {
            const currRIndex = _rowIndex + i;
            for (let j = 0; j < mergeColspan; j++) {
              const currCIndex = _columnIndex + j;
              mergeMaps[`${currRIndex}:${currCIndex}`] =
                !i && !j
                  ? {
                      rowspan: mergeRowspan,
                      colspan: mergeColspan,
                    }
                  : {
                      rowspan: 0,
                      colspan: 0,
                    };
            }
          }
        }
      }
      return { mergeMaps, mergeRowMaps, mergeColMaps };
    }

    const handleUpdateMergeBodyCells = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      internalData.mergeBodyList = [];
      internalData.mergeBodyMaps = {};
      internalData.mergeBodyCellMaps = {};
      internalData.mergeBodyRowMaps = {};
      internalData.mergeBodyColMaps = {};
      $asTable.setMergeCells(merges);
    };

    const handleBodyMerge = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      const {
        fullAllDataRowIdData,
        fullColumnIdData,
        visibleColumn,
        afterFullData,
        mergeBodyList,
        mergeBodyMaps,
      } = internalData;
      if (merges) {
        const { handleGetRowId } = createHandleGetRowId($asTable);
        if (!isArray(merges)) {
          merges = [merges];
        }
        merges.forEach((item) => {
          let { row: margeRow, col: margeCol, rowspan, colspan } = item;
          let mergeRowIndex = -1;
          let mergeColumnIndex = -1;
          if (isNumber(margeRow)) {
            mergeRowIndex = margeRow;
          } else {
            const rowid = margeRow ? handleGetRowId(margeRow) : null;
            const rowRest = rowid ? fullAllDataRowIdData[rowid] : null;
            if (rowRest) {
              mergeRowIndex = rowRest._index;
            }
          }
          if (isNumber(margeCol)) {
            mergeColumnIndex = margeCol;
          } else {
            const colid = margeCol ? margeCol.id : null;
            const colRest = colid ? fullColumnIdData[colid] : null;
            if (colRest) {
              mergeColumnIndex = colRest._index;
            }
          }
          if (
            mergeRowIndex > -1 &&
            mergeColumnIndex > -1 &&
            (rowspan || colspan)
          ) {
            rowspan = toNumber(rowspan) || 1;
            colspan = toNumber(colspan) || 1;
            if (rowspan > 1 || colspan > 1) {
              const row = afterFullData[mergeRowIndex];
              const column = visibleColumn[mergeColumnIndex];
              let mergeItem =
                mergeBodyMaps[`${mergeRowIndex}:${mergeColumnIndex}`];
              if (mergeItem) {
                mergeItem.rowspan = rowspan;
                mergeItem.colspan = colspan;
                mergeItem._rowspan = rowspan;
                mergeItem._colspan = colspan;
              } else {
                mergeItem = {
                  row: mergeRowIndex,
                  col: mergeColumnIndex,
                  rowspan,
                  colspan,
                  _row: row,
                  _col: column!,
                  _rowspan: rowspan,
                  _colspan: colspan,
                };
                mergeBodyMaps[`${mergeRowIndex}:${mergeColumnIndex}`] =
                  mergeItem;
                mergeBodyList.push(mergeItem);
              }
            }
          }
        });
      }
    };

    const removeBodyMerges = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      const {
        mergeBodyList,
        fullColumnIdData,
        fullAllDataRowIdData,
        mergeBodyMaps,
      } = internalData;
      const rest: AsTableDefines.MergeItem[] = [];
      if (merges) {
        const { handleGetRowId } = createHandleGetRowId($asTable);
        if (!isArray(merges)) {
          merges = [merges];
        }
        merges.forEach((item) => {
          const { row: margeRow, col: margeCol } = item;
          let mergeRowIndex = -1;
          let mergeColumnIndex = -1;
          if (isNumber(margeRow)) {
            mergeRowIndex = margeRow;
          } else {
            const rowid = margeRow ? handleGetRowId(margeRow) : null;
            const rowRest = rowid ? fullAllDataRowIdData[rowid] : null;
            if (rowRest) {
              mergeRowIndex = rowRest._index;
            }
          }
          if (isNumber(margeCol)) {
            mergeColumnIndex = margeCol;
          } else {
            const colid = margeCol ? margeCol.id : null;
            const colRest = colid ? fullColumnIdData[colid] : null;
            if (colRest) {
              mergeColumnIndex = colRest._index;
            }
          }
          const mcIndex = findIndexOf(
            mergeBodyList,
            (item) =>
              item.row === mergeRowIndex && item.col === mergeColumnIndex,
          );
          if (mcIndex > -1) {
            const rItems = mergeBodyList.splice(mcIndex, 1);
            const item = rItems[0];
            if (item) {
              rest.push(rItems[0]!);
              if (mergeBodyMaps[`${mergeRowIndex}:${mergeColumnIndex}`]) {
                delete mergeBodyMaps[`${mergeRowIndex}:${mergeColumnIndex}`];
              }
            }
          }
        });
      }
      return rest;
    };

    const handleUpdateMergeHeaderCells = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      internalData.mergeHeaderList = [];
      internalData.mergeHeaderMaps = {};
      internalData.mergeHeaderCellMaps = {};
      internalData.mergeHeaderRowMaps = {};
      internalData.mergeBodyColMaps = {};
      $asTable.setMergeHeaderCells(merges);
    };

    const handleHeaderMerge = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      const { showCustomHeader } = props;
      const { footerTableData } = reactData;
      const { mergeHeaderList, mergeHeaderMaps, fullColumnIdData } =
        internalData;
      if (merges) {
        const { visibleColumn } = internalData;
        if (!isArray(merges)) {
          merges = [merges];
        }
        merges.forEach((item) => {
          let { row: margeRow, col: margeCol, rowspan, colspan } = item;
          const mergeRowIndex = isNumber(margeRow) ? margeRow : -1;
          let mergeColumnIndex = -1;
          if (isNumber(margeCol)) {
            mergeColumnIndex = margeCol;
          } else {
            const colid = margeCol ? margeCol.id : null;
            const colRest = colid ? fullColumnIdData[colid] : null;
            if (colRest) {
              mergeColumnIndex = colRest._index;
            }
          }
          if (
            mergeRowIndex > -1 &&
            mergeColumnIndex > -1 &&
            (rowspan || colspan)
          ) {
            rowspan = toNumber(rowspan) || 1;
            colspan = toNumber(colspan) || 1;
            if (!showCustomHeader && rowspan > 1) {
              log.error('As.error.notSupportProp', [
                '[table] show-custom-header=false',
                `rowspan=${rowspan}`,
                'rowspan=1',
              ]);
              return;
            }
            if (rowspan > 1 || colspan > 1) {
              const row = footerTableData[mergeRowIndex];
              const column = visibleColumn[mergeColumnIndex];
              let mergeItem =
                mergeHeaderMaps[`${mergeRowIndex}:${mergeColumnIndex}`];
              if (mergeItem) {
                mergeItem.rowspan = rowspan;
                mergeItem.colspan = colspan;
                mergeItem._rowspan = rowspan;
                mergeItem._colspan = colspan;
              } else {
                mergeItem = {
                  row: mergeRowIndex,
                  col: mergeColumnIndex,
                  rowspan,
                  colspan,
                  _row: row,
                  _col: column!,
                  _rowspan: rowspan,
                  _colspan: colspan,
                };
                mergeHeaderMaps[`${mergeRowIndex}:${mergeColumnIndex}`] =
                  mergeItem;
                mergeHeaderList.push(mergeItem);
              }
            }
          }
        });
      }
    };

    const removeHeaderMerges = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      const { mergeHeaderList, fullColumnIdData, mergeHeaderMaps } =
        internalData;
      const rest: AsTableDefines.MergeItem[] = [];
      if (merges) {
        if (!isArray(merges)) {
          merges = [merges];
        }
        merges.forEach((item) => {
          const { row: margeRow, col: margeCol } = item;
          const mergeRowIndex = isNumber(margeRow) ? margeRow : -1;
          let mergeColumnIndex = -1;
          if (isNumber(margeCol)) {
            mergeColumnIndex = margeCol;
          } else {
            const colid = margeCol ? margeCol.id : null;
            const colRest = colid ? fullColumnIdData[colid] : null;
            if (colRest) {
              mergeColumnIndex = colRest._index;
            }
          }
          const mcIndex = findIndexOf(
            mergeHeaderList,
            (item) =>
              item.row === mergeRowIndex && item.col === mergeColumnIndex,
          );
          if (mcIndex > -1) {
            const rItems = mergeHeaderList.splice(mcIndex, 1);
            const item = rItems[0];
            if (item) {
              rest.push(item);
              if (mergeHeaderMaps[`${mergeRowIndex}:${mergeColumnIndex}`]) {
                delete mergeHeaderMaps[`${mergeRowIndex}:${mergeColumnIndex}`];
              }
            }
          }
        });
      }
      return rest;
    };
    const handleUpdateMergeFooterCells = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      internalData.mergeFooterList = [];
      internalData.mergeFooterMaps = {};
      internalData.mergeFooterCellMaps = {};
      internalData.mergeFooterRowMaps = {};
      internalData.mergeFooterColMaps = {};
      $asTable.setMergeFooterCells(merges);
    };

    const handleFooterMerge = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      const { footerTableData } = reactData;
      const { mergeFooterList, mergeFooterMaps, fullColumnIdData } =
        internalData;
      if (merges) {
        const { visibleColumn } = internalData;
        if (!isArray(merges)) {
          merges = [merges];
        }
        merges.forEach((item) => {
          let { row: margeRow, col: margeCol, rowspan, colspan } = item;
          const mergeRowIndex = isNumber(margeRow) ? margeRow : -1;
          let mergeColumnIndex = -1;
          if (isNumber(margeCol)) {
            mergeColumnIndex = margeCol;
          } else {
            const colid = margeCol ? margeCol.id : null;
            const colRest = colid ? fullColumnIdData[colid] : null;
            if (colRest) {
              mergeColumnIndex = colRest._index;
            }
          }
          if (
            mergeRowIndex > -1 &&
            mergeColumnIndex > -1 &&
            (rowspan || colspan)
          ) {
            rowspan = toNumber(rowspan) || 1;
            colspan = toNumber(colspan) || 1;
            if (rowspan > 1 || colspan > 1) {
              const row = footerTableData[mergeRowIndex];
              const column = visibleColumn[mergeColumnIndex];
              let mergeItem =
                mergeFooterMaps[`${mergeRowIndex}:${mergeColumnIndex}`];
              if (mergeItem) {
                mergeItem.rowspan = rowspan;
                mergeItem.colspan = colspan;
                mergeItem._rowspan = rowspan;
                mergeItem._colspan = colspan;
              } else {
                mergeItem = {
                  row: mergeRowIndex,
                  col: mergeColumnIndex,
                  rowspan,
                  colspan,
                  _row: row,
                  _col: column!,
                  _rowspan: rowspan,
                  _colspan: colspan,
                };
                mergeFooterMaps[`${mergeRowIndex}:${mergeColumnIndex}`] =
                  mergeItem;
                mergeFooterList.push(mergeItem);
              }
            }
          }
        });
      }
    };

    const removeFooterMerges = (
      merges: AsTableDefines.MergeOptions | AsTableDefines.MergeOptions[],
    ) => {
      const { mergeFooterList, fullColumnIdData, mergeFooterMaps } =
        internalData;
      const rest: AsTableDefines.MergeItem[] = [];
      if (merges) {
        if (!isArray(merges)) {
          merges = [merges];
        }
        merges.forEach((item) => {
          const { row: margeRow, col: margeCol } = item;
          const mergeRowIndex = isNumber(margeRow) ? margeRow : -1;
          let mergeColumnIndex = -1;
          if (isNumber(margeCol)) {
            mergeColumnIndex = margeCol;
          } else {
            const colid = margeCol ? margeCol.id : null;
            const colRest = colid ? fullColumnIdData[colid] : null;
            if (colRest) {
              mergeColumnIndex = colRest._index;
            }
          }
          const mcIndex = findIndexOf(
            mergeFooterList,
            (item) =>
              item.row === mergeRowIndex && item.col === mergeColumnIndex,
          );
          if (mcIndex > -1) {
            const rItems = mergeFooterList.splice(mcIndex, 1);
            const item = rItems[0];
            if (item) {
              rest.push(item);
              if (mergeFooterMaps[`${mergeRowIndex}:${mergeColumnIndex}`]) {
                delete mergeFooterMaps[`${mergeRowIndex}:${mergeColumnIndex}`];
              }
            }
          }
        });
      }
      return rest;
    };

    const handleSortEvent = (
      evnt: Event | null,
      sortConfs: AsTableDefines.SortConfs | AsTableDefines.SortConfs[],
      isUpdate?: boolean,
    ) => {
      const { tableFullColumn } = internalData;
      const sortOpts = computeSortOpts.value;
      const { multiple, remote, orders } = sortOpts;
      if (!isArray(sortConfs)) {
        sortConfs = [sortConfs];
      }
      if (sortConfs && sortConfs.length > 0) {
        const orderActiveMaps: Record<string, AsTableDefines.ColumnInfo> = {};
        if (!multiple) {
          sortConfs = [sortConfs[0]!];
          tableFullColumn.forEach((column) => {
            if (column.order) {
              orderActiveMaps[column.id] = column;
            }
          });
        }
        const sortColMpps: Record<string, AsTableDefines.ColumnInfo> = {};
        let firstColumn: any = null;
        sortConfs.forEach((confs: any, index: number) => {
          let { field, order } = confs;
          const column = isString(field)
            ? $asTable.getColumnByField(field)
            : field;
          if (!firstColumn) {
            firstColumn = column;
          }
          if (column && column.sortable) {
            if (orders && !orders.includes(order)) {
              order = getNextSortOrder(column);
            }
            if (column.order !== order) {
              column.order = order;
            }
            column.sortTime = Date.now() + index;
            sortColMpps[column.id] = column;
          }
        });
        if (!multiple) {
          each(orderActiveMaps, (oaCol: AsTableDefines.ColumnInfo, oaId) => {
            if (!sortColMpps[oaId]) {
              oaCol.order = null;
            }
          });
        }
        if (isUpdate && !remote) {
          $asTable.handleTableData(true);
        }
        if (evnt) {
          $asTable.handleColumnSortEvent(evnt, firstColumn);
        }
        return nextTick().then(() => {
          updateRowOffsetTop();
          $asTable.updateCellAreas();
          return updateStyle();
        });
      }
      return nextTick();
    };

    const clearAllSort = () => {
      const { tableFullColumn } = internalData;
      tableFullColumn.forEach((column) => {
        column.order = null;
      });
    };

    const calcTableHeight = (key: 'height' | 'maxHeight' | 'minHeight') => {
      const { editConfig, editRules } = props;
      const { parentHeight, tableColumn } = reactData;
      let val = props[key];
      if (key === 'minHeight') {
        const defMinHeight = cMinHeight.value;
        if (eqNull(val)) {
          if (eqEmptyValue(defMinHeight)) {
            if (tableColumn.length === 0) {
              // 如果全部列被隐藏
              val = 40;
            } else if (editRules && isEnableConf(editConfig)) {
              // 编辑模式默认最小高度
              val = 144;
            }
          } else {
            val = defMinHeight;
          }
        }
      }
      let num = 0;
      if (val) {
        if (val === '100%' || val === 'auto') {
          num = parentHeight;
        } else {
          const excludeHeight = $asTable.getExcludeHeight();
          num = isScale(val)
            ? Math.floor(((toInteger(val) || 1) / 100) * parentHeight)
            : toNumber(val);
          num = Math.max(40, num - excludeHeight);
        }
      }
      return num;
    };

    const handleCustomRestore = (storeData: AsTableDefines.CustomStoreData) => {
      const { aggregateConfig } = props;
      const { collectColumn } = internalData;
      const {
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
      } = handleCustomStoreConfig($asTable);

      let {
        alignData,
        headerAlignData,
        footerAlignData,
        resizableData,
        sortData,
        visibleData,
        fixedData,
        aggGroupData,
        aggFuncData,
        pagerData,
      } = storeData;
      // 处理还原
      if (
        (isCustomAlign && alignData) ||
        (isCustomHeaderAlign && headerAlignData) ||
        (isCustomFooterAlign && footerAlignData) ||
        (isCustomResizable && resizableData) ||
        (isCustomSort && sortData) ||
        (isCustomVisible && visibleData) ||
        (isCustomFixed && fixedData) ||
        (isCustomAggGroup && aggGroupData) ||
        (isCustomAggFunc && aggFuncData) ||
        // TODO (isCustomPager && pagerData && $xeGGWrapper)
        (isCustomPager && pagerData)
      ) {
        const sortColMaps: Record<
          string,
          {
            key: string;
            pKey: null | string;
            sNum: number;
          }
        > = {};
        if (isCustomSort && sortData) {
          if (!isArray(sortData)) {
            const sortRests: { index: number; key: string }[] = [];
            each(sortData, (index: number, colKey: string) => {
              sortRests.push({ key: colKey, index });
            });
            sortData = orderBy(sortRests, {
              field: 'index',
              order: 'asc',
            }).map((item) => ({ k: item.key }));
          }
          let colNum = 1;
          eachTree(
            sortData,
            (sObj, index, sOjs, path, pSObj) => {
              sortColMaps[sObj.k] = {
                key: sObj.k,
                sNum: colNum++,
                pKey: pSObj ? pSObj.k : null,
              };
            },
            { children: 'c' },
          );
        }
        const colKeyMaps: Record<string, AsTableDefines.ColumnInfo> = {};
        const allCols: AsTableDefines.ColumnInfo[] = [];
        const aggGroupConfs: AsTableDefines.RowGroupItem[] = [];
        eachTree(collectColumn, (column, index, items, path, parentColumn) => {
          const colKey = column.getKey();
          // 支持一级
          if (
            !parentColumn &&
            isCustomFixed &&
            fixedData &&
            fixedData[colKey] !== undefined
          ) {
            column.fixed = fixedData[colKey];
          }
          if (
            isCustomResizable &&
            resizableData &&
            isNumber(resizableData[colKey])
          ) {
            column.resizeWidth = resizableData[colKey];
          }
          if (
            isCustomVisible &&
            visibleData &&
            isBoolean(visibleData[colKey])
          ) {
            column.visible = visibleData[colKey];
          }
          if (
            isCustomAggFunc &&
            aggFuncData &&
            aggregateConfig &&
            aggFuncData[colKey]
          ) {
            column.aggFunc = aggFuncData[colKey];
          }
          if (isCustomAggGroup && aggGroupData && aggGroupData[colKey]) {
            aggGroupConfs.push({ field: column.field });
          }
          colKeyMaps[colKey] = column;
          allCols.push(column);
        });
        if (aggregateConfig && aggGroupConfs.length > 0) {
          const groupRest = handleGroupData(
            internalData.tableFullData,
            aggGroupConfs,
          );
          internalData.tableFullTreeData = [];
          internalData.tableFullGroupData = groupRest.treeData;
          reactData.isRowGroupStatus = true;
          reactData.rowGroupList = aggGroupConfs;
          $asTable.cacheRowMap(false);
        }
        // 如果自定义了顺序
        if (isCustomSort && sortData) {
          allCols.forEach((column) => {
            const colKey = column.getKey();
            const scItem = sortColMaps[colKey];
            if (scItem) {
              const parentColumn = scItem.pKey ? colKeyMaps[scItem.pKey] : null;
              column.parentId = parentColumn ? parentColumn.id : null;
              column.renderSortNumber = scItem.sNum;
            }
          });
          const newCollectCols = toArrayTree(
            orderBy(allCols, 'renderSortNumber'),
            { key: 'id', parentKey: 'parentId', children: 'children' },
          );
          internalData.collectColumn = newCollectCols;
          internalData.tableFullColumn = getColumnList(newCollectCols);
          reactData.updateColFlag++;
        }
        reactData.isCustomStatus = true;
      } else {
        reactData.isCustomStatus = false;
      }
    };

    const updateColumnAllOverflow = () => {
      const { showOverflow } = props;
      const { isGroup } = reactData;
      const { fullAllDataRowIdData, tableFullColumn, collectColumn } =
        internalData;
      let isAllOverflow = !!showOverflow;
      const handleFunc = (column: AsTableDefines.ColumnInfo) => {
        if (isAllOverflow && column.showOverflow === false) {
          isAllOverflow = false;
        }
      };
      if (isGroup) {
        eachTree(collectColumn, handleFunc);
      } else {
        tableFullColumn.forEach(handleFunc);
      }
      each(fullAllDataRowIdData, (rowRest: AsTableDefines.RowCacheItem) => {
        rowRest.height = 0;
      });
      reactData.isAllOverflow = isAllOverflow;
    };

    /**
     * 还原自定义列操作状态
     * 把上一次用户对列的自定义操作（显隐 / 宽度 / 冻结 / 顺序 / 对齐 / 聚合）从存储里读回来，套用到刚建立的列树上。
     */
    const restoreCustomStorage = () => {
      const { customConfig } = props;
      const tableId = computeTableId.value;
      const customOpts = computeCustomOpts.value;
      const { storage, restoreStore } = customOpts;
      const {
        isCustomAlign,
        isCustomHeaderAlign,
        isCustomFooterAlign,
        isCustomResizable,
        isCustomVisible,
        isCustomFixed,
        isCustomSort,
        isCustomAggGroup,
        isCustomAggFunc,
      } = handleCustomStoreConfig($asTable);

      if (
        storage &&
        (customConfig ? isEnableConf(customOpts) : customOpts.enabled) &&
        (isCustomAlign ||
          isCustomHeaderAlign ||
          isCustomFooterAlign ||
          isCustomResizable ||
          isCustomVisible ||
          isCustomFixed ||
          isCustomSort ||
          isCustomAggGroup ||
          isCustomAggFunc)
      ) {
        if (!tableId) {
          log.error('reqProp', ['id']);
          return;
        }
        const storeData: AsTableDefines.CustomStoreData =
          getCustomStorageMap(tableId);
        return restoreStore
          ? Promise.resolve(
              restoreStore({
                $table: $asTable,
                id: tableId,
                type: 'restore',
                storeData,
              }),
            )
              .then((storeData) => {
                if (!storeData) {
                  return;
                }
                return handleCustomRestore(storeData);
              })
              .catch((error) => error)
          : handleCustomRestore(storeData);
      }
    };

    /**
     * 更新数据列的 Map
     * 牺牲数据组装的耗时，用来换取使用过程中的流畅
     */
    const cacheColumnMap = () => {
      const { treeConfig, showOverflow } = props;
      const { tableFullColumn, collectColumn } = internalData;
      const fullColIdData: Record<string, AsTableDefines.ColumnCacheItem> =
        (internalData.fullColumnIdData = {});
      const fullColFieldData: Record<string, AsTableDefines.ColumnCacheItem> =
        (internalData.fullColumnFieldData = {});
      const expandOpts = computeExpandOpts.value;
      const customOpts = computeCustomOpts.value;
      const columnDragOpts = computeColumnDragOpts.value;
      const columnOpts = computeColumnOpts.value;
      const mouseOpts = computeMouseOpts.value;
      const virtualYOpts = computeVirtualYOpts.value;
      const { storage } = customOpts;
      const { isCrossDrag, isSelfToChildDrag } = columnDragOpts;
      const rowOpts = computeRowOpts.value;
      const isGroup = collectColumn.some(hasChildrenList);
      let isAllOverflow = !!showOverflow;
      let htmlColumn: AsTableDefines.ColumnInfo | undefined;
      let treeNodeColumn: AsTableDefines.ColumnInfo | undefined;
      let rowGroupColumn: AsTableDefines.ColumnInfo | undefined;
      let expandColumn: AsTableDefines.ColumnInfo | undefined;
      let checkboxColumn: AsTableDefines.ColumnInfo | undefined;
      let radioColumn: AsTableDefines.ColumnInfo | undefined;
      const treeOpts = computeTreeOpts.value;
      let hasFixed: AsColumnPropTypes.Fixed | undefined;
      const handleFunc = (
        column: AsTableDefines.ColumnInfo,
        index: number,
        items: AsTableDefines.ColumnInfo[],
        _?: string[],
        parentColumn?: AsTableDefines.ColumnInfo,
      ) => {
        const {
          id: colid,
          field,
          fixed,
          type,
          treeNode,
          rowGroupNode,
        } = column;
        const rest = {
          $index: -1,
          _index: -1,
          column,
          colid,
          index,
          items,
          parent: parentColumn || null,
          width: 0,
          oLeft: 0,
        };
        if (field) {
          //  field 重复：报错并覆盖
          if (fullColFieldData[field]) {
            log.error('colRepet', ['field', field]);
          }
          fullColFieldData[field] = rest;
        } else {
          // 无 field 的列（分组/type 列）不进 field 索引
          if (storage && !type) {
            log.error('reqSupportProp', [
              'storage',
              `[${type ? `type=${type}` : `title=${column.getTitle()}`}]field=?`,
            ]);
          }
          if (columnOpts.drag && (isCrossDrag || isSelfToChildDrag)) {
            log.error('reqSupportProp', [
              'column-drag-config.isCrossDrag | column-drag-config.isSelfToChildDrag',
              `${column.getTitle() || type || ''} -> field=?`,
            ]);
          }
        }
        if (!hasFixed && fixed) {
          hasFixed = fixed;
        }
        if (!htmlColumn && type === 'html') {
          htmlColumn = column;
        }
        if (treeNode) {
          if (treeNodeColumn) {
            log.error('colRepet', ['tree-node', treeNode]);
          }
          if (!treeNodeColumn) {
            treeNodeColumn = column;
          }
        }
        if (rowGroupNode) {
          if (treeNodeColumn) {
            log.error('colRepet', ['row-group-node', rowGroupNode]);
          }
          if (!rowGroupColumn) {
            rowGroupColumn = column;
          }
        }
        if (type === 'expand') {
          if (expandColumn) {
            log.error('colRepet', ['type', type]);
          }
          if (!expandColumn) {
            expandColumn = column;
          }
        }
        if (type === 'checkbox') {
          if (checkboxColumn) {
            log.error('colRepet', ['type', type]);
          }
          if (!checkboxColumn) {
            checkboxColumn = column;
          }
        } else if (type === 'radio') {
          if (radioColumn) {
            log.error('colRepet', ['type', type]);
          }
          if (!radioColumn) {
            radioColumn = column;
          }
        }
        if (isAllOverflow && column.showOverflow === false) {
          isAllOverflow = false;
        }
        if (fullColIdData[colid]) {
          log.error('colRepet', ['colId', colid]);
        }
        fullColIdData[colid] = rest;
      };

      if (isGroup) {
        eachTree(
          collectColumn,
          (column, index, items, path, parentColumn, nodes) => {
            column.level = nodes.length;
            handleFunc(column, index, items, path, parentColumn);
          },
        );
      } else {
        tableFullColumn.forEach(handleFunc);
      }
      if (expandColumn) {
        if (expandOpts.mode !== 'fixed' && virtualYOpts.enabled) {
          log.error('notConflictProp', [
            'column.type="expand',
            'virtual-y-config.enabled=false',
          ]);
        }
        if (expandOpts.mode !== 'fixed' && mouseOpts.area) {
          log.error('errConflicts', [
            'mouse-config.area',
            'column.type=expand',
          ]);
        }
        if (expandOpts.mode !== 'inside' && treeConfig && !treeOpts.transform) {
          log.error('notConflictProp', [
            'tree-config.transform=false',
            'expand-config.mode=inside',
          ]);
        }

        if (htmlColumn) {
          if (!columnOpts.useKey) {
            log.error('notSupportProp', [
              'column.type=html',
              'column-config.useKey=false',
              'column-config.useKey=true',
            ]);
          }
          if (!rowOpts.useKey) {
            log.error('notSupportProp', [
              'column.type=html',
              'row-config.useKey=false',
              'row-config.useKey=true',
            ]);
          }
        }
      }
      reactData.isGroup = isGroup;
      reactData.rowGroupColumn = rowGroupColumn;
      reactData.treeNodeColumn = treeNodeColumn;
      reactData.expandColumn = expandColumn;
      reactData.checkboxColumn = checkboxColumn;
      reactData.radioColumn = radioColumn;
      reactData.isAllOverflow = isAllOverflow;
    };

    const updateHeight = () => {
      internalData.customHeight = calcTableHeight('height');
      internalData.customMinHeight = calcTableHeight('minHeight');
      internalData.customMaxHeight = calcTableHeight('maxHeight');
      // 如果启用虚拟滚动，纠正高度
      if (
        reactData.scrollYLoad &&
        !(
          internalData.customHeight ||
          internalData.customMinHeight ||
          internalData.customMaxHeight
        )
      ) {
        internalData.customHeight = 300;
      }
    };

    /**
     * 计算自适应列宽
     */
    const calcColumnAutoWidth = (
      column: AsTableDefines.ColumnInfo,
      wrapperEl: HTMLDivElement,
    ) => {
      const { scrollYLoad } = reactData;
      const columnOpts = computeColumnOpts.value;
      const { autoOptions } = columnOpts;
      const { isCalcHeader, isCalcBody, isCalcFooter } = autoOptions || {};
      const querySelections: string[] = [];
      if (isCalcHeader) {
        querySelections.push(
          `.${prefixCls.value}-header-cell--wrapper[colid="${column.id}"]`,
        );
      }
      if (isCalcBody) {
        querySelections.push(
          `.${prefixCls.value}-body-cell--wrapper[colid="${column.id}"]`,
        );
      }
      if (isCalcFooter) {
        querySelections.push(
          `.${prefixCls.value}-footer-cell--wrapper[colid="${column.id}"]`,
        );
      }
      const cellElemList =
        querySelections.length > 0
          ? wrapperEl.querySelectorAll(querySelections.join(','))
          : [];
      let leftRightPadding = 0;
      const firstCellEl = cellElemList[0];
      if (firstCellEl && firstCellEl.parentElement) {
        const cellStyle = getComputedStyle(firstCellEl.parentElement);
        leftRightPadding = Math.ceil(
          toNumber(cellStyle.paddingLeft) + toNumber(cellStyle.paddingRight),
        );
      }
      let colWidth =
        (scrollYLoad ? column.renderAutoWidth : 0) - leftRightPadding;
      for (const element of cellElemList) {
        const celEl = element as HTMLDivElement;
        colWidth = Math.max(
          colWidth,
          celEl ? Math.ceil(celEl.scrollWidth) + 4 : 0,
        );
      }
      return colWidth + leftRightPadding;
    };

    /**
     * 自适应列宽
     */
    const calcCellWidth = () => {
      const autoWidthColumnList = computeAutoWidthColumnList.value;
      const { fullColumnIdData } = internalData;
      const el = refElem.value;
      if (el && autoWidthColumnList.length > 0) {
        el.dataset.calcCol = 'Y';
        autoWidthColumnList.forEach((column) => {
          const colid = column.id;
          const colRest = fullColumnIdData[colid];
          const colWidth = calcColumnAutoWidth(column, el);
          if (colRest) {
            colRest.width = Math.max(colWidth, colRest.width);
          }
          column.renderAutoWidth = colWidth;
        });
        $asTable.analyColumnWidth();
        delete el.dataset.calcCol;
      }
    };

    /**
     * 列宽算法，计算单元格列宽，动态分配可用剩余空间
     * 支持 px、%、固定 混合分配
     * 支持动态列表调整分配
     * 支持自动分配偏移量
     * 支持 width=60 width=60px width=10% min-width=60 min-width=60px min-width=10%
     */
    const autoCellWidth = () => {
      const { elemStore } = internalData;
      const bodyWrapperElem = getRefElem(elemStore['main-body-wrapper']);
      if (!bodyWrapperElem) {
        return;
      }
      const yHandleEl = refScrollYHandleElem.value;
      if (!yHandleEl) {
        return;
      }
      const xHandleEl = refScrollXHandleElem.value;
      if (!xHandleEl) {
        return;
      }
      const columnOpts = computeColumnOpts.value;
      let tWidth = 0;
      const minCellWidth = 40; // 列宽最少限制 40px
      const bodyWidth = bodyWrapperElem.clientWidth;
      let remainWidth = bodyWidth;
      let meanWidth = remainWidth / 100;
      const { columnStore } = reactData;
      const {
        resizeList,
        pxMinList,
        autoMinList,
        pxList,
        scaleList,
        scaleMinList,
        autoList,
        remainList,
      } = columnStore;

      const parseColumnMaxWidth = (column: AsTableDefines.ColumnInfo) => {
        const maxWidth = column.maxWidth || columnOpts.maxWidth;
        if (maxWidth && maxWidth !== 'auto') {
          if (isScale(maxWidth)) {
            return Math.floor(toInteger(maxWidth) * meanWidth);
          }
          return toInteger(maxWidth);
        }
        return 0;
      };

      // 最小宽
      pxMinList.forEach((column) => {
        let miWidth = toInteger(column.minWidth);
        const mxWidth = parseColumnMaxWidth(column);
        if (mxWidth) {
          miWidth = Math.min(miWidth, mxWidth);
        }
        tWidth += miWidth;
        column.renderWidth = miWidth;
      });
      // 最小自适应
      autoMinList.forEach((column) => {
        let caWidth = Math.max(60, toInteger(column.renderAutoWidth));
        const mxWidth = parseColumnMaxWidth(column);
        if (mxWidth) {
          caWidth = Math.min(caWidth, mxWidth);
        }
        tWidth += caWidth;
        column.renderWidth = caWidth;
      });
      // 最小百分比
      scaleMinList.forEach((column) => {
        let smWidth = Math.floor(toInteger(column.minWidth) * meanWidth);
        const mxWidth = parseColumnMaxWidth(column);
        if (mxWidth) {
          smWidth = Math.min(smWidth, mxWidth);
        }
        tWidth += smWidth;
        column.renderWidth = smWidth;
      });
      // 固定百分比
      scaleList.forEach((column) => {
        let sfWidth = Math.floor(toInteger(column.width) * meanWidth);
        const mxWidth = parseColumnMaxWidth(column);
        if (mxWidth) {
          sfWidth = Math.min(sfWidth, mxWidth);
        }
        tWidth += sfWidth;
        column.renderWidth = sfWidth;
      });
      // 固定宽
      pxList.forEach((column) => {
        let pWidth = toInteger(column.width);
        const mxWidth = parseColumnMaxWidth(column);
        if (mxWidth) {
          pWidth = Math.min(pWidth, mxWidth);
        }
        tWidth += pWidth;
        column.renderWidth = pWidth;
      });
      // 自适应宽
      autoList.forEach((column) => {
        let aWidth = Math.max(60, toInteger(column.renderAutoWidth));
        const mxWidth = parseColumnMaxWidth(column);
        if (mxWidth) {
          aWidth = Math.min(aWidth, mxWidth);
        }
        tWidth += aWidth;
        column.renderWidth = aWidth;
      });

      // 调整了列宽
      resizeList.forEach((column) => {
        const reWidth = toInteger(column.resizeWidth);
        tWidth += reWidth;
        column.renderWidth = reWidth;
      });

      const zoomColumnList = scaleMinList
        .concat(pxMinList)
        .concat(autoMinList)
        .filter((column) => !parseColumnMaxWidth(column));
      remainWidth -= tWidth;
      meanWidth =
        remainWidth > 0
          ? Math.floor(
              remainWidth / (zoomColumnList.length + remainList.length),
            )
          : 0;
      if (remainWidth > 0) {
        zoomColumnList.forEach((column) => {
          tWidth += meanWidth;
          column.renderWidth += meanWidth;
        });
      }
      // 剩余均分
      remainList.forEach((column) => {
        const width = Math.max(meanWidth, minCellWidth);
        column.renderWidth = width;
        tWidth += width;
      });
      /**
       * 偏移量算法
       * 如果所有列足够放的情况下，从最后动态列开始分配
       * 排除已设置 max-width
       */
      const dynamicList = scaleList
        .concat(scaleMinList)
        .concat(pxMinList)
        .concat(autoMinList)
        .concat(remainList)
        .filter((column) => !parseColumnMaxWidth(column));
      let dynamicSize = dynamicList.length - 1;
      if (dynamicSize > 0) {
        let i = bodyWidth - tWidth;
        if (i > 0) {
          while (i > 0 && dynamicSize >= 0) {
            i--;
            dynamicList[dynamicSize--]!.renderWidth++;
          }
          tWidth = bodyWidth;
        }
      }
      reactData.scrollXWidth = tWidth;
      reactData.resizeWidthFlag++;
      updateColumnOffsetLeft();
      updateHeight();
    };

    /**
     * 计算自适应行高
     */
    const calcCellAutoHeight = (
      rowid: number | string,
      rowRest: AsTableDefines.RowCacheItem,
      wrapperEl: HTMLDivElement,
    ) => {
      const { fullCellHeightMaps } = internalData;
      let chRest = fullCellHeightMaps[rowid];
      if (!chRest) {
        chRest = {};
        fullCellHeightMaps[rowid] = chRest;
      }
      const wrapperElemList = wrapperEl.querySelectorAll(
        `.${prefixCls.value}-cell--wrapper[rowid="${CSS.escape(rowRest.rowid)}"]`,
      );
      let firstCellStyle: CSSStyleDeclaration | null = null;
      let topBottomPadding = 0;
      let changeCH = false;
      for (const element of wrapperElemList) {
        const wrapperElem = element as HTMLElement;
        const cellElem = wrapperElem.parentElement as HTMLTableCellElement;
        const cellStyle = cellElem.style;
        const orHeight = cellStyle.height;
        const colid = wrapperElem.getAttribute('colid') || '';
        cellStyle.height = '';
        if (!firstCellStyle) {
          firstCellStyle = getComputedStyle(cellElem);
          topBottomPadding = firstCellStyle
            ? Math.ceil(
                toNumber(firstCellStyle.paddingTop) +
                  toNumber(firstCellStyle.paddingBottom),
              )
            : 0;
        }
        const cellHeight = wrapperElem ? wrapperElem.clientHeight : 0;
        const colHeight = Math.ceil(cellHeight + topBottomPadding);
        if (chRest[colid] !== colHeight) {
          changeCH = true;
          chRest[colid] = colHeight;
        }
        cellStyle.height = orHeight;
      }
      const cellMaxHeight = getRowMaxHeight(chRest, changeCH);
      return cellMaxHeight;
    };

    /**
     * 自适应行高
     */
    const calcCellHeight = () => {
      const { treeConfig } = props;
      const { tableData, isAllOverflow, scrollYLoad, scrollXLoad } = reactData;
      const { fullAllDataRowIdData } = internalData;
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return;
      }
      const treeOpts = computeTreeOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;
      if (
        !isAllOverflow &&
        (scrollYLoad || scrollXLoad || (treeConfig && treeOpts.showLine))
      ) {
        const { handleGetRowId } = createHandleGetRowId($asTable);
        el.dataset.calcRow = 'Y';
        tableData.forEach((row) => {
          const rowid = handleGetRowId(row);
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            const reHeight = calcCellAutoHeight(rowid, rowRest, el);
            rowRest.height = Math.max(defaultRowHeight, reHeight);
          }
          delete el.dataset.calcRow;
        });
        reactData.calcCellHeightFlag++;
      }
    };

    /**
     * 获取列的排序取值函数
     * 返回一个 (row) => value 的函数，排序器会对每一行调用它，拿到该行在当前列上参与比较的值
     * 比较大小由排序器自己完成，这里只负责“取值”
     *
     * @param column 当前参与排序的列信息
     * @returns 取值函数，入参为行数据，返回该行在列上的排序值
     */
    const getOrderField = (column: AsTableDefines.ColumnInfo) => {
      const { isRowGroupStatus } = reactData;
      const { sortBy, sortType, aggFunc } = column;
      return isRowGroupStatus && aggFunc
        ? (row: any) => {
            if (row.isAggregate) {
              const aggData = row.aggData;
              const currAggData = aggData ? aggData[column.field] : null;
              return currAggData ? currAggData.value : null;
            }
            let cellValue;
            if (sortBy) {
              cellValue = isFunction(sortBy)
                ? sortBy({ row, column })
                : get(row, sortBy);
            } else {
              cellValue = $asTable.getCellLabel(row, column);
            }
            if (!sortType || sortType === 'auto') {
              return eqEmptyValue(cellValue) || isNaN(cellValue)
                ? cellValue
                : toNumber(cellValue);
            } else if (sortType === 'number') {
              return toNumber(cellValue);
            } else if (sortType === 'string') {
              return toValueString(cellValue);
            }
            return cellValue;
          }
        : (row: any) => {
            let cellValue;
            if (sortBy) {
              cellValue = isFunction(sortBy)
                ? sortBy({ row, column })
                : get(row, sortBy);
            } else {
              cellValue = $asTable.getCellLabel(row, column);
            }
            if (!sortType || sortType === 'auto') {
              return eqEmptyValue(cellValue) || isNaN(cellValue)
                ? cellValue
                : toNumber(cellValue);
            } else if (sortType === 'number') {
              return toNumber(cellValue);
            } else if (sortType === 'string') {
              return toValueString(cellValue);
            }
            return cellValue;
          };
    };

    const updateAfterTreeIndex = () => {
      const {
        fullDataRowIdData,
        fullAllDataRowIdData,
        afterFullData,
        afterTreeFullData,
      } = internalData;
      const treeOpts = computeTreeOpts.value;
      const { transform, mapChildrenField } = treeOpts;
      const childrenField = treeOpts.childrenField;
      const fullMaps: any = {};
      let rowNum = 0;
      const { handleGetRowId } = createHandleGetRowId($asTable);
      eachTree(
        afterTreeFullData,
        (row, index, items, path, parentRow) => {
          const rowid = handleGetRowId(row);
          const rowRest = fullAllDataRowIdData[rowid];
          const seq = path
            .map((num, i) => (i % 2 === 0 ? Number(num) + 1 : '.'))
            .join('');
          if (rowRest) {
            rowRest.seq = seq;
            rowRest._seq = rowNum;
            rowRest.treeIndex = index;
            rowRest._index = rowNum;
            rowRest._tIndex = rowNum;
          } else {
            const rest = {
              row,
              rowid,
              _seq: rowNum,
              seq,
              index,
              $index: -1,
              _index: rowNum,
              treeIndex: index,
              _tIndex: rowNum,
              items,
              parent: parentRow,
              level: 0,
              height: 0,
              resizeHeight: 0,
              oTop: 0,
              expandHeight: 0,
            };
            fullAllDataRowIdData[rowid] = rest;
            fullDataRowIdData[rowid] = rest;
          }
          rowNum++;
          fullMaps[rowid] = row;
        },
        { children: transform ? mapChildrenField : childrenField },
      );
      if (transform) {
        afterFullData.forEach((row, index) => {
          const rowid = handleGetRowId(row);
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            rowRest._index = index;
          }
        });
      }
      internalData.afterFullRowMaps = fullMaps;
    };

    const updateAfterListIndex = () => {
      const { afterFullData, fullDataRowIdData, fullAllDataRowIdData } =
        internalData;
      const { handleGetRowId } = createHandleGetRowId($asTable);
      const fullMaps: any = {};
      let rowNum = 0;
      afterFullData.forEach((row, index) => {
        const rowid = handleGetRowId(row);
        const rowRest = fullAllDataRowIdData[rowid];
        const seq = index + 1;
        if (rowRest) {
          rowRest.seq = seq;
          rowRest._seq = rowNum;
          rowRest._index = index;
        } else {
          const rest = {
            row,
            rowid,
            _seq: rowNum,
            seq,
            index: -1,
            $index: -1,
            _index: index,
            treeIndex: -1,
            _tIndex: -1,
            items: [],
            parent: null,
            level: 0,
            height: 0,
            resizeHeight: 0,
            oTop: 0,
            expandHeight: 0,
          };
          fullAllDataRowIdData[rowid] = rest;
          fullDataRowIdData[rowid] = rest;
        }
        rowNum++;
        fullMaps[rowid] = row;
      });
      internalData.afterFullRowMaps = fullMaps;
    };

    /**
     * 预编译
     * 对渲染中的数据提前解析序号及索引。牺牲提前编译耗时换取渲染中额外损耗，使运行时更加流畅
     */
    const updateAfterDataIndex = () => {
      const { treeConfig } = props;
      if (treeConfig) {
        updateAfterTreeIndex();
      } else {
        updateAfterListIndex();
      }
    };

    /**
     * 如果为虚拟树、行分组、则将树结构拍平
     * @returns
     */
    const handleVirtualTreeToList = () => {
      const { treeConfig } = props;
      const { isRowGroupStatus } = reactData;
      const { fullAllDataRowIdData, treeExpandedMaps, rowGroupExpandedMaps } =
        internalData;
      const aggregateOpts = computeAggregateOpts.value;
      const treeOpts = computeTreeOpts.value;
      const { handleGetRowId } = createHandleGetRowId($asTable);
      const fullData: any[] = [];
      const expandMaps: {
        [key: string]: number;
      } = {};
      if (treeConfig && treeOpts.transform) {
        const childrenField = treeOpts.childrenField;
        eachTree(
          internalData.afterTreeFullData,
          (row, _index, _items, _path, parentRow) => {
            const rowid = handleGetRowId(row);
            const parentRowid = handleGetRowId(parentRow);
            if (
              !parentRow ||
              (expandMaps[parentRowid] && treeExpandedMaps[parentRowid])
            ) {
              const rowRest = fullAllDataRowIdData[rowid];
              if (rowRest) {
                rowRest._index = fullData.length;
              }
              expandMaps[rowid] = 1;
              fullData.push(row);
            }
          },
          { children: childrenField },
        );
        internalData.afterFullData = fullData;
        updateScrollYStatus(fullData);
        return fullData;
      } else if (isRowGroupStatus) {
        const { childrenField } = aggregateOpts;
        eachTree(
          internalData.afterGroupFullData,
          (row, _index, _items, _path, parentRow) => {
            const rowid = handleGetRowId(row);
            const parentRowid = handleGetRowId(parentRow);
            if (
              !parentRow ||
              (expandMaps[parentRowid] && rowGroupExpandedMaps[parentRowid])
            ) {
              const rowRest = fullAllDataRowIdData[rowid];
              if (rowRest) {
                rowRest._index = fullData.length;
              }
              expandMaps[rowid] = 1;
              fullData.push(row);
            }
          },
          { children: childrenField },
        );
        internalData.afterFullData = fullData;
        updateScrollYStatus(fullData);
        return fullData;
      }
      return internalData.afterFullData;
    };

    /**
     * 编译处理后全量的表格数据
     * 如果存在筛选条件，继续处理
     */
    const updateAfterFullData = () => {
      const { treeConfig } = props;
      const { isRowGroupStatus } = reactData;
      const {
        tableFullColumn,
        tableFullGroupData,
        tableFullTreeData,
        tableFullData,
      } = internalData;
      const filterOpts = computeFilterOpts.value;
      const sortOpts = computeSortOpts.value;
      const treeOpts = computeTreeOpts.value;
      const childrenField = treeOpts.childrenField;

      const { transform, rowField, parentField, mapChildrenField } = treeOpts;

      const aggregateOpts = computeAggregateOpts.value;
      const {
        remote: allRemoteFilter,
        filterMethod: allFilterMethod,
        isDeep: isFilterDeep,
        isEvery,
      } = filterOpts;
      const {
        remote: allRemoteSort,
        multiple: sortMultiple,
        chronological,
        sortMethod: allSortMethod,
        isDeep: isSortDeep,
      } = sortOpts;

      let tableData: any[] = [];

      let tableTree: any[] = [];
      // 收集筛选/排序条件
      if (!allRemoteFilter || !allRemoteSort) {
        // 参与筛选的列
        const filterColumns: {
          column: AsTableDefines.ColumnInfo;
          itemList: AsTableDefines.FilterOption[];
          valueList: any[];
        }[] = [];
        // 参与排序的列
        let orderColumns: AsTableDefines.SortCheckedParams[] = [];
        tableFullColumn.forEach((column) => {
          const { field, sortable, order, filters, sortTime } = column;
          if (!allRemoteFilter && filters && filters.length > 0) {
            const valueList: any[] = [];
            const itemList: AsTableDefines.FilterOption[] = [];
            filters.forEach((item) => {
              if (!item.checked) {
                return;
              }

              itemList.push(item as AsTableDefines.FilterOption);
              valueList.push(item.value);
            });
            if (itemList.length > 0) {
              filterColumns.push({ column, valueList, itemList });
            }
          }
          if (!allRemoteSort && sortable && order) {
            orderColumns.push({
              column,
              field,
              order,
              sortTime,
            });
          }
        });
        // 多列排序：按点击时间来定优先级
        if (sortMultiple && chronological && orderColumns.length > 1) {
          orderColumns = orderBy(orderColumns, 'sortTime');
        }

        // 筛选
        if (!allRemoteFilter && filterColumns.length > 0) {
          const handleFilter = (row: any) => {
            return filterColumns.every(({ column, valueList, itemList }) => {
              const { filterMethod, filterRender } = column;
              const compConf = isEnableConf(filterRender)
                ? renderer.get(filterRender.name)
                : null;
              const compFilterMethod = compConf
                ? compConf.tableFilterMethod
                : null;
              const tdFilterMethod = compConf
                ? compConf.tableFilterDefaultMethod
                : null;
              //  取这一格的值
              const cellValue = getCellValue(row, column);
              // 列自己的方法最高优先级
              if (filterMethod) {
                return itemList.some((item) =>
                  filterMethod({
                    value: item.value,
                    option: item,
                    cellValue,
                    row,
                    column,
                    $table: $asTable,
                  }),
                );
                // 筛选组件提供的方法
              } else if (compFilterMethod) {
                return itemList.some((item) =>
                  compFilterMethod({
                    value: item.value,
                    option: item,
                    cellValue,
                    row,
                    column,
                    $table: $asTable,
                  }),
                );
                // 全局配置的
              } else if (allFilterMethod) {
                return allFilterMethod({
                  $table: $asTable,
                  options: itemList,
                  values: valueList,
                  cellValue,
                  row,
                  column,
                });
                // 组件默认的
              } else if (tdFilterMethod) {
                return itemList.some((item) =>
                  tdFilterMethod({
                    value: item.value,
                    option: item,
                    cellValue,
                    row,
                    column,
                    $table: $asTable,
                  }),
                );
              }
              // 兜底：值相等
              return valueList.includes(get(row, column.field));
            });
          };

          // 按数据形态选不同的筛选方式
          if (isRowGroupStatus) {
            tableTree = searchTree(tableFullGroupData, handleFilter, {
              // ← 分组树：保留父链
              original: true,
              isEvery: true,
              children: aggregateOpts.mapChildrenField,
              mapChildren: aggregateOpts.childrenField,
            });
            tableData = tableTree;
          } else if (treeConfig && transform && isFilterDeep !== false) {
            // 筛选虚拟树
            tableTree = searchTree(tableFullTreeData, handleFilter, {
              original: true,
              isEvery,
              children: mapChildrenField,
              mapChildren: childrenField,
            });
            tableData = tableTree;
          } else {
            tableData = treeConfig
              ? tableFullTreeData.filter(handleFilter) //  普通树：只滤当前层
              : tableFullData.filter(handleFilter); //  普通列表：直接 filter
            tableTree = tableData;
          }
        } else {
          //  没有筛选条件
          // 这里不是"什么都不做"：树/分组要用 searchTree(() => true) 把结构"还原"出来
          // 因为上一轮筛选可能砍掉了某些节点，必须重建完整树
          if (isRowGroupStatus) {
            // 还原行分组
            tableTree = searchTree(tableFullGroupData, () => true, {
              original: true,
              isEvery: true,
              children: aggregateOpts.mapChildrenField,
              mapChildren: aggregateOpts.childrenField,
            });
            tableData = tableTree;
          } else if (treeConfig && transform && isFilterDeep !== false) {
            // 还原虚拟树
            tableTree = searchTree(tableFullTreeData, () => true, {
              original: true,
              isEvery,
              children: mapChildrenField,
              mapChildren: childrenField,
            });
            tableData = tableTree;
          } else {
            tableData = treeConfig
              ? tableFullTreeData.slice(0)
              : tableFullData.slice(0);
            tableTree = tableData;
          }
        }

        // 处理排序
        // 支持单列、多列、组合排序
        if (!allRemoteSort && orderColumns.length > 0) {
          if (isRowGroupStatus) {
            // 行分组的排序
            if (allSortMethod) {
              const sortRests = allSortMethod({
                data: tableTree,
                sortList: orderColumns,
                $table: $asTable,
              });
              tableTree = isArray(sortRests) ? sortRests : tableTree;
            } else {
              const treeList = toTreeArray(tableTree, {
                key: aggregateOpts.rowField,
                parentKey: aggregateOpts.parentField,
                children: aggregateOpts.mapChildrenField,
              });
              tableTree = toArrayTree(
                orderBy(
                  treeList,
                  orderColumns.map(({ column, order }) => [
                    getOrderField(column),
                    order,
                  ]),
                ),
                {
                  key: aggregateOpts.rowField,
                  parentKey: aggregateOpts.parentField,
                  children: aggregateOpts.childrenField,
                  mapChildren: aggregateOpts.mapChildrenField,
                },
              );
            }
            tableData = tableTree;
          } else if (treeConfig && transform && isSortDeep !== false) {
            // 虚拟树的排序
            if (allSortMethod) {
              const sortRests = allSortMethod({
                data: tableTree,
                sortList: orderColumns,
                $table: $asTable,
              });
              tableTree = isArray(sortRests) ? sortRests : tableTree;
            } else {
              const treeList = toTreeArray(tableTree, {
                children: mapChildrenField,
              });
              tableTree = toArrayTree(
                orderBy(
                  treeList,
                  orderColumns.map(({ column, order }) => [
                    getOrderField(column),
                    order,
                  ]),
                ),
                {
                  key: rowField,
                  parentKey: parentField,
                  children: childrenField,
                  mapChildren: mapChildrenField,
                },
              );
            }
            tableData = tableTree;
          } else {
            if (allSortMethod) {
              const sortRests = allSortMethod({
                data: tableData,
                sortList: orderColumns,
                $table: $asTable,
              });
              tableData = isArray(sortRests) ? sortRests : tableData;
            } else {
              tableData = orderBy(
                tableData,
                orderColumns.map(({ column, order }) => [
                  getOrderField(column),
                  order,
                ]),
              );
            }
            tableTree = tableData;
          }
        }
      } else {
        if (isRowGroupStatus) {
          // 还原行分组
          // 还原虚拟树
          tableTree = searchTree(tableFullGroupData, () => true, {
            original: true,
            isEvery: true,
            children: aggregateOpts.mapChildrenField,
            mapChildren: aggregateOpts.childrenField,
          });
          tableData = tableTree;
        } else if (treeConfig && transform && isSortDeep !== false) {
          // 还原虚拟树
          tableTree = searchTree(tableFullTreeData, () => true, {
            original: true,
            isEvery,
            children: mapChildrenField,
            mapChildren: childrenField,
          });
          tableData = tableTree;
        } else {
          tableData = treeConfig
            ? tableFullTreeData.slice(0)
            : tableFullData.slice(0);
          tableTree = tableData;
        }
      }
      internalData.afterFullData = tableData;
      internalData.afterTreeFullData = tableTree;
      internalData.afterGroupFullData = tableTree;
      updateAfterDataIndex();
    };

    const updateStyle = () => {
      const { mouseConfig } = props;
      const {
        isGroup,
        tableColumn,
        overflowX,
        scrollbarWidth,
        overflowY,
        scrollbarHeight,
        scrollXWidth,
        columnStore,
        isColLoading,
        editStore,
      } = reactData;

      const {
        visibleColumn,
        tableHeight,
        elemStore,
        currentRow,
        customHeight,
        customMinHeight,
        customMaxHeight,
        tHeaderHeight,
        tFooterHeight,
      } = internalData;

      const el = refElem.value;
      if (!el || (internalData.tBodyHeight && !el.clientHeight)) {
        return;
      }

      const containerList = ['main', 'left', 'right'];
      const { leftList, rightList } = columnStore;

      let osbWidth = overflowY ? scrollbarWidth : 0;
      let osbHeight = overflowX ? scrollbarHeight : 0;

      const emptyPlaceholderElem = refEmptyPlaceholder.value;
      const isHeaderRenderOptimize = computeIsHeaderRenderOptimize.value;
      const isBodyRenderOptimize = computeIsBodyRenderOptimize.value;
      const isFooterRenderOptimize = computeIsFooterRenderOptimize.value;
      const scrollbarOpts = computeScrollbarOpts.value;
      const mouseOpts = computeMouseOpts.value;

      const bodyWrapperElem = getRefElem(elemStore['main-body-wrapper']);
      const bodyTableElem = getRefElem(elemStore['main-body-table']);

      if (emptyPlaceholderElem) {
        emptyPlaceholderElem.style.top = `${tHeaderHeight}px`;
        emptyPlaceholderElem.style.height = bodyWrapperElem
          ? `${bodyWrapperElem.offsetHeight - osbHeight}px`
          : '';
      }

      const scrollbarXConf = scrollbarOpts.x || {};
      const scrollbarYConf = scrollbarOpts.y || {};
      const scrollbarYToLeft = computeScrollbarYToLeft.value;

      let xScrollbarVisible = overflowX ? 'visible' : 'hidden';
      if (scrollbarXConf.visible === 'visible') {
        // TODO if (scrollbarXConf.visible === 'visible' || $xeGanttView) {
        osbHeight = scrollbarHeight;
        xScrollbarVisible = 'visible';
      } else if (
        scrollbarXConf.visible === 'hidden' ||
        scrollbarXConf.visible === false
      ) {
        osbHeight = 0;
        xScrollbarVisible = 'hidden';
      }

      let yScrollbarVisible = overflowY ? 'visible' : 'hidden';
      if (
        scrollbarYConf.visible === 'hidden' ||
        scrollbarYConf.visible === false
      ) {
        // TODO if (
        //   scrollbarYConf.visible === 'hidden' ||
        //   scrollbarYConf.visible === false ||
        //   ($xeGantt &&
        //     $xeGanttView &&
        //     $xeGantt.reactData.showRightView &&
        //     !scrollbarYToLeft)
        // ) {
        osbWidth = 0;
        yScrollbarVisible = 'hidden';
      } else if (scrollbarYConf.visible === 'visible') {
        osbWidth = scrollbarWidth;
        yScrollbarVisible = 'visible';
      }

      let tbHeight = 0;
      let bodyMaxHeight = 0;
      const bodyMinHeight =
        customMinHeight - tHeaderHeight - tFooterHeight - osbHeight;
      if (customMaxHeight) {
        bodyMaxHeight = Math.max(
          bodyMinHeight,
          customMaxHeight - tHeaderHeight - tFooterHeight - osbHeight,
        );
      }
      if (customHeight) {
        tbHeight = customHeight - tHeaderHeight - tFooterHeight - osbHeight;
      }
      if (!tbHeight && bodyTableElem) {
        tbHeight = bodyTableElem.clientHeight;
      }
      if (tbHeight) {
        if (bodyMaxHeight) {
          tbHeight = Math.min(bodyMaxHeight, tbHeight);
        }
        tbHeight = Math.max(bodyMinHeight, tbHeight);
      }
      const xLeftCornerEl = refScrollXLeftCornerElem.value;
      const xRightCornerEl = refScrollXRightCornerElem.value;
      const scrollXVirtualEl = refScrollXVirtualElem.value;
      if (scrollXVirtualEl) {
        scrollXVirtualEl.style.height = `${osbHeight}px`;
        scrollXVirtualEl.style.visibility = xScrollbarVisible;
      }
      const xWrapperEl = refScrollXWrapperElem.value;
      if (xWrapperEl) {
        xWrapperEl.style.width = `${el.clientWidth - osbWidth}px`;
        xWrapperEl.style.left = scrollbarYToLeft ? `${osbWidth}px` : '';
      }
      if (xLeftCornerEl) {
        if (scrollbarYToLeft) {
          xLeftCornerEl.style.width = `${osbWidth}px`;
          xLeftCornerEl.style.display = overflowY && osbWidth ? 'block' : '';
        } else {
          xLeftCornerEl.style.display = '';
        }
      }
      if (xRightCornerEl) {
        if (scrollbarYToLeft) {
          xRightCornerEl.style.display = '';
        } else {
          xRightCornerEl.style.width = `${osbWidth}px`;
          xRightCornerEl.style.display =
            xScrollbarVisible === 'visible' ? 'block' : '';
        }
      }

      const scrollYVirtualEl = refScrollYVirtualElem.value;
      if (scrollYVirtualEl) {
        scrollYVirtualEl.style.width = `${osbWidth}px`;
        scrollYVirtualEl.style.height = `${tbHeight + tHeaderHeight + tFooterHeight}px`;
        scrollYVirtualEl.style.visibility = yScrollbarVisible;
      }
      const yTopCornerEl = refScrollYTopCornerElem.value;
      if (yTopCornerEl) {
        yTopCornerEl.style.height = `${tHeaderHeight}px`;
        yTopCornerEl.style.display =
          tHeaderHeight && yScrollbarVisible === 'visible' ? 'block' : '';
      }
      const yWrapperEl = refScrollYWrapperElem.value;
      if (yWrapperEl) {
        yWrapperEl.style.height = `${tbHeight}px`;
        yWrapperEl.style.top = `${tHeaderHeight}px`;
      }
      const yBottomCornerEl = refScrollYBottomCornerElem.value;
      if (yBottomCornerEl) {
        yBottomCornerEl.style.height = `${tFooterHeight}px`;
        yBottomCornerEl.style.top = `${tHeaderHeight + tbHeight}px`;
        yBottomCornerEl.style.display =
          tFooterHeight && yScrollbarVisible === 'visible' ? 'block' : '';
      }

      const rowExpandEl = refRowExpandElem.value;
      if (rowExpandEl) {
        rowExpandEl.style.height = `${tbHeight}px`;
        rowExpandEl.style.top = `${tHeaderHeight}px`;
      }

      internalData.tBodyHeight = tbHeight;
      containerList.forEach((name, index) => {
        const fixedType = index > 0 ? name : '';
        const layoutList = ['header', 'body', 'footer'];
        const isFixedLeft = fixedType === 'left';
        let fixedColumn: AsTableDefines.ColumnInfo[] = [];
        let fixedWrapperElem: HTMLDivElement;
        if (fixedType) {
          fixedColumn = isFixedLeft ? leftList : rightList;
          fixedWrapperElem = isFixedLeft
            ? refLeftContainer.value
            : refRightContainer.value;
        }
        layoutList.forEach((layout) => {
          const wrapperElem = getRefElem(
            elemStore[`${name}-${layout}-wrapper`],
          );
          const currScrollElem = getRefElem(
            elemStore[`${name}-${layout}-scroll`],
          );
          const tableElem = getRefElem(elemStore[`${name}-${layout}-table`]);
          switch (layout) {
            case 'body': {
              if (currScrollElem) {
                currScrollElem.style.maxHeight = customMaxHeight
                  ? `${bodyMaxHeight}px`
                  : '';
                currScrollElem.style.height = customHeight
                  ? `${tbHeight}px`
                  : '';
                currScrollElem.style.minHeight = `${bodyMinHeight}px`;
              }

              // 如果是固定列
              if (fixedWrapperElem) {
                if (wrapperElem) {
                  wrapperElem.style.top = `${tHeaderHeight}px`;
                }
                fixedWrapperElem.style.height = `${customHeight > 0 ? customHeight : tableHeight + tHeaderHeight + tFooterHeight + osbHeight}px`;
                fixedWrapperElem.style.width = `${fixedColumn.reduce((previous, column) => previous + column.renderWidth, 0)}px`;
              }

              let renderColumnList = tableColumn;
              const isOptimizeMode = isBodyRenderOptimize;

              if (fixedType) {
                renderColumnList = visibleColumn;
                if (isOptimizeMode) {
                  renderColumnList = fixedColumn || [];
                }
              }

              const tWidth = renderColumnList.reduce(
                (previous, column) => previous + column.renderWidth,
                0,
              );

              if (fixedType) {
                if (isOptimizeMode) {
                  if (wrapperElem) {
                    wrapperElem.style.width = tWidth ? `${tWidth}px` : '';
                  }
                } else {
                  if (wrapperElem) {
                    wrapperElem.style.width = scrollXWidth
                      ? `${scrollXWidth}px`
                      : '';
                  }
                }
              }

              if (tableElem) {
                tableElem.style.width = tWidth ? `${tWidth}px` : '';
                // 兼容性处理
                tableElem.style.paddingRight =
                  osbWidth &&
                  fixedType &&
                  (browseObj.firefox || browseObj.safari)
                    ? `${osbWidth}px`
                    : '';
              }
              const emptyBlockElem = getRefElem(
                elemStore[`${name}-${layout}-emptyBlock`],
              );
              if (emptyBlockElem) {
                emptyBlockElem.style.width = tWidth ? `${tWidth}px` : '';
              }

              break;
            }
            case 'footer': {
              let renderColumnList = tableColumn;
              const isOptimizeMode = isFooterRenderOptimize;

              if (
                !isOptimizeMode ||
                (!isColLoading && (fixedType || !overflowX))
              ) {
                renderColumnList = visibleColumn;
              }

              if (fixedType && isOptimizeMode) {
                renderColumnList = fixedColumn || [];
              }

              const tWidth = renderColumnList.reduce(
                (previous, column) => previous + column.renderWidth,
                0,
              );

              if (fixedType) {
                if (isOptimizeMode) {
                  if (wrapperElem) {
                    wrapperElem.style.width = tWidth ? `${tWidth}px` : '';
                  }
                } else {
                  if (wrapperElem) {
                    wrapperElem.style.width = scrollXWidth
                      ? `${scrollXWidth}px`
                      : '';
                  }
                }
              }

              if (currScrollElem) {
                currScrollElem.style.height = `${tFooterHeight}px`;
                // 如果是固定列
                if (fixedWrapperElem && wrapperElem) {
                  wrapperElem.style.top = `${customHeight > 0 ? customHeight - tFooterHeight - osbHeight : tableHeight + tHeaderHeight}px`;
                }
              }
              if (tableElem) {
                tableElem.style.width = tWidth ? `${tWidth}px` : '';
              }

              break;
            }
            case 'header': {
              // 表头体样式处理
              // 横向滚动渲染
              let renderColumnList = tableColumn;
              const isOptimizeMode = isHeaderRenderOptimize;

              if (isGroup) {
                renderColumnList = visibleColumn;
              } else {
                if (
                  !isOptimizeMode ||
                  (!isColLoading && (fixedType || !overflowX))
                ) {
                  renderColumnList = visibleColumn;
                }

                // 如果是使用优化模式
                if (fixedType && isOptimizeMode) {
                  renderColumnList = fixedColumn || [];
                }
              }

              const tWidth = renderColumnList.reduce(
                (previous, column) => previous + column.renderWidth,
                0,
              );

              if (fixedType) {
                if (isGroup) {
                  if (wrapperElem) {
                    wrapperElem.style.width = scrollXWidth
                      ? `${scrollXWidth}px`
                      : '';
                  }
                } else {
                  if (isOptimizeMode) {
                    if (wrapperElem) {
                      wrapperElem.style.width = tWidth ? `${tWidth}px` : '';
                    }
                  } else {
                    if (wrapperElem) {
                      wrapperElem.style.width = scrollXWidth
                        ? `${scrollXWidth}px`
                        : '';
                    }
                  }
                }
              }

              if (currScrollElem) {
                currScrollElem.style.height = `${tHeaderHeight}px`;
              }

              if (tableElem) {
                tableElem.style.width = tWidth ? `${tWidth}px` : '';
              }

              break;
            }
            // No default
          }
        });
      });
      if (currentRow) {
        $asTable.setCurrentRow(currentRow);
      }
      if (
        mouseConfig &&
        mouseOpts.selected &&
        editStore.selected.row &&
        editStore.selected.column
      ) {
        $asTable.addCellSelectedClass();
      }
      // TODO if ($xeGanttView && $xeGanttView.handleUpdateStyle) {
      //   $xeGanttView.handleUpdateStyle()
      // }
      return nextTick();
    };

    const checkValidate = (type: any) => {
      if ($asTable.triggerValidate) {
        return $asTable.triggerValidate(type);
      }
      return nextTick();
    };

    /**
     * 当单元格发生改变时
     * 如果存在规则，则校验
     */
    const handleChangeCell = (evnt: Event, params: any) => {
      checkValidate('blur')
        .catch((error: any) => error)
        .then(() => {
          $asTable
            .handleEdit(params, evnt)
            .then(() => checkValidate('change'))
            .catch((error: any) => error);
        });
    };

    const handleDefaultSort = () => {
      const { sortConfig } = props;
      if (sortConfig) {
        const sortOpts = computeSortOpts.value;
        let { defaultSort } = sortOpts;
        if (defaultSort) {
          if (!isArray(defaultSort)) {
            defaultSort = [defaultSort];
          }
          if (defaultSort.length > 0) {
            (sortConfig.multiple
              ? defaultSort
              : defaultSort.slice(0, 1)
            ).forEach((item: any, index: number) => {
              const { field, order } = item;
              if (field && order) {
                const column = $asTable.getColumnByField(field);
                if (column && column.sortable) {
                  column.order = order;
                  column.sortTime = Date.now() + index;
                }
              }
            });
            if (!sortOpts.remote) {
              $asTable.handleTableData(true).then(updateStyle);
            }
          }
        }
      }
    };

    /**
     * 处理默认勾选
     */
    const handleDefaultSelectionChecked = () => {
      const { checkboxConfig } = props;
      if (checkboxConfig) {
        const { fullDataRowIdData } = internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkAll, checkRowKeys } = checkboxOpts;
        if (checkAll) {
          handleCheckedAllCheckboxRow(true, true);
        } else if (checkRowKeys) {
          const defSelection: any[] = [];
          checkRowKeys.forEach((rowKey: any) => {
            const rowid = encodeRowid(rowKey);
            if (fullDataRowIdData[rowid]) {
              defSelection.push(fullDataRowIdData[rowid].row);
            }
          });
          handleCheckedCheckboxRow(defSelection, true, true);
        }
      }
    };

    /**
     * 处理单选框默认勾选
     */
    const handleDefaultRadioChecked = () => {
      const { radioConfig } = props;
      if (radioConfig) {
        const { fullDataRowIdData } = internalData;
        const radioOpts = computeRadioOpts.value;
        const { checkRowKey: rowKey, reserve } = radioOpts;
        const rowid = rowKey ? encodeRowid(rowKey) : null;
        if (rowid) {
          if (fullDataRowIdData[rowid]) {
            handleCheckedRadioRow(fullDataRowIdData[rowid].row, true);
          }
          if (reserve) {
            const rowkey = getRowkey($asTable);
            internalData.radioReserveRow = { [rowkey]: rowid };
          }
        }
      }
    };

    /**
     * 处理默认展开行
     */
    const handleDefaultRowExpand = () => {
      const { expandConfig } = props;
      if (expandConfig) {
        const { fullDataRowIdData } = internalData;
        const expandOpts = computeExpandOpts.value;
        const { expandAll, expandRowKeys } = expandOpts;
        if (expandAll) {
          $asTable.setAllRowExpand(true);
        } else if (expandRowKeys) {
          const defExpandeds: any[] = [];
          expandRowKeys.forEach((rowKey: any) => {
            const rowid = encodeRowid(rowKey);
            if (fullDataRowIdData[rowid]) {
              defExpandeds.push(fullDataRowIdData[rowid].row);
            }
          });
          $asTable.setRowExpand(defExpandeds, true);
        }
      }
    };

    const handleRadioReserveRow = (row: any) => {
      const radioOpts = computeRadioOpts.value;
      if (radioOpts.reserve) {
        internalData.radioReserveRow = row;
      }
    };

    const handleCheckboxReserveRow = (row: any, checked: boolean) => {
      const { checkboxReserveRowMap } = internalData;
      const checkboxOpts = computeCheckboxOpts.value;
      if (checkboxOpts.reserve) {
        const rowid = getRowid($asTable, row);
        if (checked) {
          checkboxReserveRowMap[rowid] = row;
        } else if (checkboxReserveRowMap[rowid]) {
          delete checkboxReserveRowMap[rowid];
        }
      }
    };

    const handleCheckedRadioRow = (row: any, isForce: boolean) => {
      const radioOpts = computeRadioOpts.value;
      const { checkMethod } = radioOpts;
      if (
        row &&
        (isForce || !checkMethod || checkMethod({ $table: $asTable, row }))
      ) {
        reactData.selectRadioRow = row;
        handleRadioReserveRow(row);
      }
      return nextTick();
    };

    const handleCheckedCheckboxRow = (
      rows: any[],
      value: boolean,
      isForce?: boolean,
    ) => {
      if (rows && !isArray(rows)) {
        rows = [rows];
      }
      $asTable.handleBatchSelectRows(rows, !!value, isForce);
      $asTable.checkSelectionStatus();
      return nextTick();
    };

    const handleCheckedAllCheckboxRow = (
      checked: boolean,
      isForce?: boolean,
    ) => {
      const { treeConfig } = props;
      const { isRowGroupStatus } = reactData;
      const {
        afterFullData,
        afterTreeFullData,
        afterGroupFullData,
        checkboxReserveRowMap,
        selectCheckboxMaps,
      } = internalData;
      const treeOpts = computeTreeOpts.value;
      const aggregateOpts = computeAggregateOpts.value;
      const childrenField = treeOpts.childrenField;
      const checkboxOpts = computeCheckboxOpts.value;
      const { checkField, reserve, checkMethod } = checkboxOpts;
      const { handleGetRowId } = createHandleGetRowId($asTable);
      // indeterminateField 仅支持读取
      const indeterminateField = checkboxOpts.indeterminateField;
      const selectRowMaps: Record<string, any> = {};

      /**
       * 绑定属性方式（有污染）
       * 必须在行数据存在对应的属性，否则将不响应
       */
      if (checkField) {
        const checkValFn = (row: any) => {
          if (
            isForce ||
            !checkMethod ||
            checkMethod({ $table: $asTable, row })
          ) {
            if (checked) {
              selectRowMaps[handleGetRowId(row)] = row;
            }
            set(row, checkField, checked);
          }
          if ((treeConfig || isRowGroupStatus) && indeterminateField) {
            set(row, indeterminateField, false);
          }
        };
        // 如果存在选中方法
        // 如果方法成立，则更新值，否则忽略该数据
        if (treeConfig || isRowGroupStatus) {
          eachTree(afterFullData, checkValFn, {
            children: childrenField,
          });
        } else {
          afterFullData.forEach(checkValFn);
        }
      } else {
        /**
         * 默认方式（无污染）
         * 无需任何属性，直接绑定
         */
        if (isRowGroupStatus) {
          if (checked) {
            /**
             * 如果是行分组勾选
             * 如果方法成立，则添加到临时集合中
             */
            eachTree(
              afterGroupFullData,
              (row) => {
                if (
                  !(
                    isForce ||
                    !checkMethod ||
                    checkMethod({ $table: $asTable, row })
                  )
                ) {
                  return;
                }

                const rowid = handleGetRowId(row);
                selectRowMaps[rowid] = row;
              },
              { children: aggregateOpts.mapChildrenField },
            );
          } else {
            /**
             * 如果是树取消
             * 如果方法成立，则不添加到临时集合中
             */
            if (!isForce && checkMethod) {
              eachTree(
                afterGroupFullData,
                (row) => {
                  const rowid = handleGetRowId(row);
                  if (
                    checkMethod({ $table: $asTable, row })
                      ? false
                      : selectCheckboxMaps[rowid]
                  ) {
                    selectRowMaps[rowid] = row;
                  }
                },
                { children: aggregateOpts.mapChildrenField },
              );
            }
          }
        } else if (treeConfig) {
          if (checked) {
            /**
             * 如果是树勾选
             * 如果方法成立，则添加到临时集合中
             */
            eachTree(
              afterTreeFullData,
              (row) => {
                if (
                  !(
                    isForce ||
                    !checkMethod ||
                    checkMethod({ $table: $asTable, row })
                  )
                ) {
                  return;
                }

                const rowid = handleGetRowId(row);
                selectRowMaps[rowid] = row;
              },
              { children: childrenField },
            );
          } else {
            /**
             * 如果是树取消
             * 如果方法成立，则不添加到临时集合中
             */
            if (!isForce && checkMethod) {
              eachTree(
                afterTreeFullData,
                (row) => {
                  const rowid = handleGetRowId(row);
                  if (
                    checkMethod({ $table: $asTable, row })
                      ? false
                      : selectCheckboxMaps[rowid]
                  ) {
                    selectRowMaps[rowid] = row;
                  }
                },
                { children: childrenField },
              );
            }
          }
        } else {
          if (checked) {
            /**
             * 如果是行勾选
             * 如果存在选中方法且成立或者本身已勾选，则添加到临时集合中
             * 如果不存在选中方法，则添加所有数据到临时集合中
             */
            if (!isForce && checkMethod) {
              afterFullData.forEach((row) => {
                const rowid = handleGetRowId(row);
                if (
                  selectCheckboxMaps[rowid] ||
                  checkMethod({ $table: $asTable, row })
                ) {
                  selectRowMaps[rowid] = row;
                }
              });
            } else {
              afterFullData.forEach((row) => {
                const rowid = handleGetRowId(row);
                selectRowMaps[rowid] = row;
              });
            }
          } else {
            /**
             * 如果是行取消
             * 如果方法成立，则不添加到临时集合中；如果方法不成立则判断当前是否已勾选，如果已被勾选则添加到新集合中
             * 如果不存在选中方法，无需处理，临时集合默认为空
             */
            if (!isForce && checkMethod) {
              afterFullData.forEach((row) => {
                const rowid = handleGetRowId(row);
                if (
                  checkMethod({ $table: $asTable, row })
                    ? false
                    : selectCheckboxMaps[rowid]
                ) {
                  selectRowMaps[rowid] = row;
                }
              });
            }
          }
        }
      }
      if (reserve) {
        if (checked) {
          each(selectRowMaps, (row, rowid) => {
            checkboxReserveRowMap[rowid] = row;
          });
        } else {
          afterFullData.forEach((row) => handleCheckboxReserveRow(row, false));
        }
      }
      reactData.updateCheckboxFlag++;
      internalData.selectCheckboxMaps = checkField ? {} : selectRowMaps;

      reactData.isAllSelected = checked;
      reactData.isIndeterminate = false;
      internalData.treeIndeterminateRowMaps = {};
      $asTable.checkSelectionStatus();
      return nextTick();
    };

    // 还原展开、选中等相关状态
    const handleReserveStatus = () => {
      const { treeConfig } = props;
      const { expandColumn, selectRadioRow } = reactData;
      const {
        fullDataRowIdData,
        fullAllDataRowIdData,
        radioReserveRow,
        selectCheckboxMaps,
        treeExpandedMaps,
        rowExpandedMaps,
        currentRow,
      } = internalData;
      const expandOpts = computeExpandOpts.value;
      const treeOpts = computeTreeOpts.value;
      const radioOpts = computeRadioOpts.value;
      const checkboxOpts = computeCheckboxOpts.value;
      // 单选框
      if (
        selectRadioRow &&
        !fullAllDataRowIdData[getRowid($asTable, selectRadioRow)]
      ) {
        reactData.selectRadioRow = null; // 刷新单选行状态
      }
      // 还原保留选中状态
      if (radioOpts.reserve && radioReserveRow) {
        const rowid = getRowid($asTable, radioReserveRow);
        if (fullDataRowIdData[rowid]) {
          handleCheckedRadioRow(fullDataRowIdData[rowid].row, true);
        }
      }
      // 复选框
      internalData.selectCheckboxMaps = getRecoverRowMaps(selectCheckboxMaps); // 刷新多选行状态
      reactData.updateCheckboxFlag++;
      // 还原保留选中状态
      if (checkboxOpts.reserve) {
        handleCheckedCheckboxRow(
          handleReserveRow(internalData.checkboxReserveRowMap),
          true,
          true,
        );
      }
      if (currentRow && !fullAllDataRowIdData[getRowid($asTable, currentRow)]) {
        internalData.currentRow = null; // 刷新当前行状态
      }
      // 行展开
      internalData.rowExpandedMaps = expandColumn
        ? getRecoverRowMaps(rowExpandedMaps)
        : {}; // 刷新行展开状态
      reactData.rowExpandedFlag++;
      // 还原保留状态
      if (expandColumn && expandOpts.reserve) {
        $asTable.setRowExpand(
          handleReserveRow(internalData.rowExpandedReserveRowMap),
          true,
        );
      }
      // 树展开
      internalData.treeExpandedMaps = treeConfig
        ? getRecoverRowMaps(treeExpandedMaps)
        : {}; // 刷新树展开状态
      reactData.treeExpandedFlag++;
      if (treeConfig && treeOpts.reserve) {
        $asTable.setTreeExpand(
          handleReserveRow(internalData.treeExpandedReserveRowMap),
          true,
        );
      }
    };

    /**
     * 处理默认展开树节点
     */
    const handleDefaultTreeExpand = () => {
      const { treeConfig } = props;
      if (treeConfig) {
        const { fullAllDataRowIdData } = internalData;
        const treeOpts = computeTreeOpts.value;
        const { expandAll, expandRowKeys } = treeOpts;
        if (expandAll) {
          $asTable.setAllTreeExpand(true);
        } else if (expandRowKeys) {
          const defExpandeds: any[] = [];
          expandRowKeys.forEach((rowKey) => {
            const rowid = encodeRowid(rowKey);
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              defExpandeds.push(rowRest.row);
            }
          });
          $asTable.setTreeExpand(defExpandeds, true);
        }
      }
    };

    const handleAsyncTreeExpandChilds = (row: any): Promise<void> => {
      const treeOpts = computeTreeOpts.value;
      const checkboxOpts = computeCheckboxOpts.value;
      const { transform, loadMethod } = treeOpts;
      const { checkStrictly } = checkboxOpts;
      return new Promise<void>((resolve) => {
        if (loadMethod) {
          const { fullAllDataRowIdData, treeExpandLazyLoadedMaps } =
            internalData;
          const rowid = getRowid($asTable, row);
          const rowRest = fullAllDataRowIdData[rowid];
          treeExpandLazyLoadedMaps[rowid] = row;
          Promise.resolve(loadMethod({ $table: $asTable, row }))
            .then((childRecords: any) => {
              if (rowRest) {
                rowRest.treeLoaded = true;
              }
              if (treeExpandLazyLoadedMaps[rowid]) {
                delete treeExpandLazyLoadedMaps[rowid];
              }
              if (!isArray(childRecords)) {
                childRecords = [];
              }
              if (childRecords) {
                return $asTable
                  .loadTreeChildren(row, childRecords)
                  .then((childRows) => {
                    const { treeExpandedMaps } = internalData;
                    if (childRows.length > 0 && !treeExpandedMaps[rowid]) {
                      treeExpandedMaps[rowid] = row;
                    }
                    reactData.treeExpandedFlag++;
                    // 如果当前节点已选中，则展开后子节点也被选中
                    if (
                      !checkStrictly &&
                      $asTable.isCheckedByCheckboxRow(row)
                    ) {
                      handleCheckedCheckboxRow(childRows, true);
                    }
                    return nextTick().then(() => {
                      if (!transform) {
                        return;
                      }

                      $asTable.handleTableData();
                      updateAfterDataIndex();
                      return nextTick();
                    });
                  });
              }
            })
            .catch(() => {
              const { treeExpandLazyLoadedMaps } = internalData;
              if (rowRest) {
                rowRest.treeLoaded = false;
              }
              if (treeExpandLazyLoadedMaps[rowid]) {
                delete treeExpandLazyLoadedMaps[rowid];
              }
            })
            .finally(() => {
              reactData.treeExpandedFlag++;
              nextTick()
                .then(() => $asTable.recalculate())
                .then(() => resolve());
            });
        } else {
          resolve();
        }
      });
    };

    const handleTreeExpandReserve = (row: any, expanded: boolean) => {
      const { treeExpandedReserveRowMap } = internalData;
      const treeOpts = computeTreeOpts.value;
      if (treeOpts.reserve) {
        const rowid = getRowid($asTable, row);
        if (expanded) {
          treeExpandedReserveRowMap[rowid] = row;
        } else if (treeExpandedReserveRowMap[rowid]) {
          delete treeExpandedReserveRowMap[rowid];
        }
      }
    };

    const handleAsyncRowExpand = (row: any): Promise<void> => {
      return new Promise<void>((resolve) => {
        const expandOpts = computeExpandOpts.value;
        const { loadMethod } = expandOpts;
        if (loadMethod) {
          const { fullAllDataRowIdData, rowExpandLazyLoadedMaps } =
            internalData;
          const rowid = getRowid($asTable, row);
          const rowRest = fullAllDataRowIdData[rowid];
          rowExpandLazyLoadedMaps[rowid] = row;
          loadMethod({
            $table: $asTable,
            row,
            rowIndex: $asTable.getRowIndex(row),
            $rowIndex: $asTable.getVMRowIndex(row),
          })
            .then(() => {
              const { rowExpandedMaps } = internalData;
              if (rowRest) {
                rowRest.expandLoaded = true;
              }
              rowExpandedMaps[rowid] = row;
              reactData.rowExpandedFlag++;
            })
            .catch(() => {
              if (rowRest) {
                rowRest.expandLoaded = false;
              }
            })
            .finally(() => {
              const { rowExpandLazyLoadedMaps } = internalData;
              if (rowExpandLazyLoadedMaps[rowid]) {
                delete rowExpandLazyLoadedMaps[rowid];
              }
              reactData.rowExpandedFlag++;
              nextTick()
                .then(() => $asTable.recalculate())
                .then(() => $asTable.updateCellAreas())
                .then(() => resolve());
            });
        } else {
          resolve();
        }
      });
    };

    const handleRowExpandReserve = (row: any, expanded: boolean) => {
      const { rowExpandedReserveRowMap } = internalData;
      const expandOpts = computeExpandOpts.value;
      if (expandOpts.reserve) {
        const rowid = getRowid($asTable, row);
        if (expanded) {
          rowExpandedReserveRowMap[rowid] = row;
        } else if (rowExpandedReserveRowMap[rowid]) {
          delete rowExpandedReserveRowMap[rowid];
        }
      }
    };

    const handleDefaultMergeCells = () => {
      const { mergeCells } = props;
      if (mergeCells) {
        $asTable.setMergeCells(mergeCells);
      }
    };

    const handleDefaultMergeHeaderItems = () => {
      const { mergeHeaderCells } = props;
      if (mergeHeaderCells) {
        $asTable.setMergeHeaderCells(mergeHeaderCells);
      }
    };

    const handleDefaultMergeFooterItems = () => {
      const { mergeFooterCells } = props;
      const mFooterCells = mergeFooterCells;
      if (mFooterCells) {
        $asTable.setMergeFooterCells(mFooterCells);
      }
    };

    // 计算可视渲染相关数据
    const computeScrollLoad = () => {
      return nextTick().then(() => {
        const { scrollXLoad, scrollYLoad } = reactData;
        const { scrollXStore, scrollYStore } = internalData;
        const virtualYOpts = computeVirtualYOpts.value;
        const virtualXOpts = computeVirtualXOpts.value;
        if (scrollXLoad) {
          const { toVisibleIndex: toXVisibleIndex, visibleSize: visibleXSize } =
            handleVirtualXVisible();
          const offsetXSize = Math.max(
            0,
            virtualXOpts.oSize ? toNumber(virtualXOpts.oSize) : 0,
          );
          scrollXStore.preloadSize = toNumber(virtualXOpts.preSize);
          scrollXStore.offsetSize = offsetXSize;
          scrollXStore.visibleSize = visibleXSize;
          scrollXStore.endIndex = Math.max(
            scrollXStore.startIndex + scrollXStore.visibleSize + offsetXSize,
            scrollXStore.endIndex,
          );
          scrollXStore.visibleStartIndex = Math.max(
            scrollXStore.startIndex,
            toXVisibleIndex,
          );
          scrollXStore.visibleEndIndex = Math.min(
            scrollXStore.endIndex,
            toXVisibleIndex + visibleXSize,
          );
          $asTable.updateScrollXData().then(() => {
            loadScrollXData();
          });
        } else {
          $asTable.updateScrollXSpace();
        }

        const { toVisibleIndex: toYVisibleIndex, visibleSize: visibleYSize } =
          handleVirtualYVisible();
        if (scrollYLoad) {
          const offsetYSize = Math.max(
            0,
            virtualYOpts.oSize ? toNumber(virtualYOpts.oSize) : 0,
          );
          scrollYStore.preloadSize = toNumber(virtualYOpts.preSize);
          scrollYStore.offsetSize = offsetYSize;
          scrollYStore.visibleSize = visibleYSize;
          scrollYStore.endIndex = Math.max(
            scrollYStore.startIndex + visibleYSize + offsetYSize,
            scrollYStore.endIndex,
          );
          scrollYStore.visibleStartIndex = Math.max(
            scrollYStore.startIndex,
            toYVisibleIndex,
          );
          scrollYStore.visibleEndIndex = Math.min(
            scrollYStore.endIndex,
            toYVisibleIndex + visibleYSize,
          );
          $asTable.updateScrollYData().then(() => {
            loadScrollYData();
          });
        } else {
          $asTable.updateScrollYSpace();
        }
      });
    };

    const calcScrollbar = () => {
      const { scrollXWidth, scrollYHeight } = reactData;
      const { elemStore } = internalData;
      const scrollbarOpts = computeScrollbarOpts.value;
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return;
      }
      const bodyWrapperElem = getRefElem(elemStore['main-body-wrapper']);
      const headerTableElem = getRefElem(elemStore['main-header-table']);
      const footerTableElem = getRefElem(elemStore['main-footer-table']);
      const xHandleEl = refScrollXHandleElem.value;
      const yHandleEl = refScrollYHandleElem.value;

      let overflowY = false;

      let overflowX = false;
      if (bodyWrapperElem) {
        overflowY = scrollYHeight > bodyWrapperElem.clientHeight;
        if (yHandleEl) {
          reactData.scrollbarWidth =
            scrollbarOpts.width ||
            yHandleEl.offsetWidth - yHandleEl.clientWidth ||
            14;
        }
        reactData.overflowY = overflowY;
        overflowX = scrollXWidth > bodyWrapperElem.clientWidth;
        if (xHandleEl) {
          reactData.scrollbarHeight =
            scrollbarOpts.height ||
            xHandleEl.offsetHeight - xHandleEl.clientHeight ||
            14;
        }
        const hHeight = headerTableElem ? headerTableElem.clientHeight : 0;
        const fHeight = footerTableElem ? footerTableElem.clientHeight : 0;
        internalData.tableHeight = bodyWrapperElem.offsetHeight;
        internalData.tHeaderHeight = hHeight;
        internalData.tFooterHeight = fHeight;
        reactData.overflowX = overflowX;
        reactData.parentHeight = Math.max(
          hHeight + fHeight + 20,
          $asTable.getParentHeight(),
        );
      }
      if (overflowX) {
        $asTable.checkScrolling();
      }
    };

    const handleRecalculateStyle = (
      reFull: boolean,
      reWidth: boolean,
      reHeight: boolean,
    ) => {
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return nextTick();
      }
      const varEl = refVarElem.value;
      if (varEl) {
        const [mediumEl, smallEl, largeEl] = varEl.children;
        calcVarRowHeightConfig('medium', mediumEl);
        calcVarRowHeightConfig('small', smallEl);
        calcVarRowHeightConfig('large', largeEl);
      }
      if (reWidth) {
        calcCellWidth();
      }
      if (reWidth || reFull) {
        autoCellWidth();
      }
      calcScrollbar();
      updateStyle();
      updateRowExpandStyle();
      if (reFull) {
        updateTreeLineStyle();
      }
      internalData.rceRunTime = Date.now();
      return computeScrollLoad().then(() => {
        // 初始化时需要在列计算之后再执行优化运算，达到最优显示效果
        if (reWidth) {
          calcCellWidth();
        }
        if (reWidth || reFull) {
          autoCellWidth();
        }
        if (reHeight) {
          calcCellHeight();
        }
        updateStyle();
        calcScrollbar();
        if (reFull) {
          updateRowOffsetTop();
        }
        updateRowExpandStyle();
        if (reFull) {
          updateTreeLineStyle();
        }
        internalData.rceRunTime = Date.now();
        if (reFull) {
          return computeScrollLoad();
        }
      });
    };
    /**
     * 布局重算调度器
     * @param reFull 是否全量重算（行高、树线、行偏移）
     * @param reWidth 是否重算列宽
     * @param reHeight  是否重算行高
     * @param options
     * @returns
     */
    const defaultMinRunDelay = 50;
    const handleLazyRecalculate = (
      reFull: boolean,
      reWidth: boolean,
      reHeight: boolean,
      options?: {
        minRunDelay?: number; // 多少毫秒内至少执行一次
      },
    ) => {
      const minRunDelay =
        (options ? options.minRunDelay : defaultMinRunDelay) ||
        defaultMinRunDelay;
      const { tableData, tableColumn } = reactData;

      return new Promise<void>((resolve) => {
        const { rceTimeout, rceRunTime } = internalData;
        let rceDelay = internalData.rceDelay;
        const resizeOpts = computeResizeOpts.value;

        // 如果在500毫秒内频繁执行，则执行次数减缓
        rceDelay =
          rceRunTime && rceRunTime > Date.now() - 500
            ? Math.min(
                Math.max(60, Math.min(800, tableData.length / 8)),
                rceDelay + 50,
              )
            : 0;
        internalData.rceDelay = rceDelay;
        const refreshDelay = resizeOpts.refreshDelay || 30;
        const reDelay = rceDelay + refreshDelay;

        const el = refElem.value;
        if (el && el.clientWidth) {
          autoCellWidth();
          updateRowExpandStyle();
        }

        const renderCellSize = tableData.length * tableColumn.length;
        // 渲染量低的场景
        if (renderCellSize < 400) {
          rceDelay = 20;
        } else if (renderCellSize < 600) {
          rceDelay = 40;
        } else if (renderCellSize < 800) {
          rceDelay = 80;
        }
        if (rceTimeout) {
          clearTimeout(rceTimeout);
          // 多少毫秒内至少执行一次
          if (rceRunTime && rceRunTime + minRunDelay < Date.now()) {
            resolve(handleRecalculateStyle(reFull, reWidth, reHeight));
          } else {
            nextTick(() => {
              resolve();
            });
          }
        } else {
          resolve(handleRecalculateStyle(reFull, reWidth, reHeight));
        }
        // TODO if ($xeGanttView && $xeGanttView.handleLazyRecalculate) {
        //   $xeGanttView.handleLazyRecalculate()
        // }
        internalData.rceTimeout = setTimeout(() => {
          internalData.rceDelay = 0;
          internalData.rceTimeout = undefined;
          handleRecalculateStyle(reFull, reWidth, reHeight);
          // TODO if ($xeGanttView && $xeGanttView.handleLazyRecalculate) {
          //   $xeGanttView.handleLazyRecalculate();
          // }
        }, reDelay);
      });
    };

    const handleResizeEvent = () => {
      if (internalData.rsePending) {
        return;
      }
      internalData.rsePending = true;
      handleLazyRecalculate(true, true, true, {
        minRunDelay: 200,
      })
        .then(() => {
          internalData.rsePending = false;
        })
        .catch(() => {
          internalData.rsePending = false;
        });
    };

    const handleUpdateAggValues = () => {
      const { visibleColumn } = internalData;
      const aggCols: AsTableDefines.ColumnInfo[] = [];

      // 从「可见列」里挑出配了 aggFunc 的列，收集成一批
      visibleColumn.forEach((column) => {
        if (column.aggFunc) {
          aggCols.push(column);
        }
      });
      reactData.aggHandleAggColumns = aggCols; // 整体替换（不是增量改）
    };

    const handleUpdateRowGroup = (groupFields?: string[]) => {
      const aggGroupFields: string[] = [];
      const aggGroupConfs: { field: string }[] = [];
      if (groupFields) {
        (isArray(groupFields) ? groupFields : [groupFields]).forEach(
          (field) => {
            aggGroupFields.push(field);
            aggGroupConfs.push({
              field,
            });
          },
        );
      }
      reactData.rowGroupList = aggGroupConfs;
      reactData.aggHandleFields = aggGroupFields;
      handleUpdateAggValues();
    };

    /**
     * 处理分组汇总行/聚合行的数据
     *
     * 主要流程：
     * 1. 读取当前表格的聚合配置、聚合列、子节点字段。
     * 2. 遍历聚合行，计算每个聚合行的 childCount。
     * 3. 如果存在透视表聚合处理函数，则交给它处理。
     * 4. 否则本地遍历聚合列，计算每个字段的聚合值。
     * 5. 如果下层仍然是聚合行，则累加下层聚合结果；
     *    否则调用配置的聚合计算方法。
     * 6. 将计算结果写入 aggRow.aggData。
     *
     * @param aggList 聚合行信息列表
     */
    const handleeGroupSummary = (
      aggList: AsTableDefines.AggregateRowInfo[],
    ) => {
      // 表格内部列字段数据
      const { fullColumnFieldData } = internalData;

      // 当前聚合配置
      const aggregateOpts = computeAggregateOpts.value;

      // 需要参与聚合计算的列
      const aggFuncColumns = computeAggFuncColumns.value;

      // 子节点字段名，例如 children
      const { mapChildrenField } = aggregateOpts;

      // 聚合计算方法：优先 calcValuesMethod，其次 countMethod，最后 aggregateMethod
      const aggCalcMethod = aggregateOpts.calcValuesMethod;

      // 只有配置了子节点字段时才继续处理
      if (mapChildrenField) {
        // 第一步：计算每个聚合行的 childCount
        lastEach(aggList, (aggRow) => {
          let count = 0;

          // 遍历当前聚合行的子节点
          each(
            aggRow[mapChildrenField],
            (row: AsTableDefines.AggregateRowInfo) => {
              if (row.isAggregate) {
                // 如果子行本身也是聚合行，则累加它已经计算出的 childCount
                count += row.childCount || 0;
              } else {
                // 普通数据行，数量 +1
                count++;
              }
            },
          );

          // 写回当前聚合行的子节点数量
          aggRow.childCount = count;
        });

        //  需要实现额外的插件来实现这个钩子 第二步：如果表格支持透视表聚合数据处理，则交给它处理
        if ($asTable.handlePivotTableAggData) {
          $asTable.handlePivotTableAggData(aggList);
        } else {
          // 否则走本地聚合计算逻辑
          if (aggFuncColumns.length > 0) {
            // 遍历每一个聚合行
            lastEach(aggList, (aggRow) => {
              // 当前聚合行最终生成的聚合数据对象
              const aggDtObj: Record<
                string,
                {
                  label: any;
                  type: string;
                  value: any;
                }
              > = {};

              const aggData = aggRow.aggData;
              const groupField = aggRow.groupField;
              const groupContent = aggRow.groupContent;

              // 当前聚合行的子节点列表
              const childList = mapChildrenField
                ? aggRow[mapChildrenField] || []
                : [];

              // 当前聚合行的子节点数量
              const childCount = aggRow.childCount;

              // 当前分组字段对应的列信息
              const colRest =
                fullColumnFieldData[groupField] ||
                ({} as AsTableDefines.ColumnCacheItem);

              // 遍历所有需要聚合计算的列
              aggFuncColumns.forEach((column) => {
                const { field } = column;

                // 当前列已有的聚合数据
                const currAggData = aggData ? aggData[field] : null;

                // 传给聚合计算方法的上下文参数
                const ctParams = {
                  $table: $asTable,
                  groupField,
                  groupColumn: (colRest
                    ? colRest.column
                    : null) as AsTableDefines.ColumnInfo,
                  column,
                  groupValue: groupContent,
                  childList,
                  childCount,
                  aggValue: currAggData ? currAggData.value : 0,
                } as any;

                let aggVal = 0;

                // 如果下层同时也是分组聚合行
                if (childList.length > 0 && childList[0].isAggregate) {
                  // 则直接累加下层聚合行中对应字段的聚合值
                  each(childList, (row: AsTableDefines.AggregateRowInfo) => {
                    if (!row.isAggregate) {
                      return;
                    }

                    const currAggData = row.aggData[field];
                    if (currAggData) {
                      aggVal += currAggData.value;
                    }
                  });
                } else {
                  // 否则调用配置的聚合计算方法；没有配置时退化为 childCount
                  aggVal = aggCalcMethod
                    ? aggCalcMethod(ctParams)
                    : aggRow.childCount;
                }

                // 写入当前字段的聚合结果
                aggDtObj[field] = {
                  type: 'count',
                  value: aggVal,
                  label: aggVal,
                };
              });

              // 更新当前聚合行的聚合数据
              aggRow.aggData = aggDtObj;
            });
          }
        }
      }
    };

    const updateGroupData = () => {
      const { aggregateConfig } = props;
      const { isRowGroupStatus } = reactData;
      const { tableFullGroupData } = internalData;
      const aggregateOpts = computeAggregateOpts.value;
      const { mapChildrenField } = aggregateOpts;
      if (aggregateConfig && isRowGroupStatus) {
        const aggList: AsTableDefines.AggregateRowInfo[] = [];
        eachTree(
          tableFullGroupData,
          (row) => {
            if (row.isAggregate) {
              aggList.push(row);
            }
          },
          { children: mapChildrenField },
        );
        handleeGroupSummary(aggList);
      }
    };

    /**
     * 处理行分组逻辑
     *
     * @param list 原始数据
     * @param rowGroups 指定字段对数据进行分组
     * @param isCombinedField 展示方式是合并还是独立列
     */
    const handleGroupData = (
      list: any[],
      rowGroups: AsTableDefines.RowGroupItem[],
      isCombinedField?: boolean,
    ) => {
      let fullData = list;
      let treeData = list;
      if (rowGroups) {
        const aggregateOpts = computeAggregateOpts.value;
        const {
          rowField,
          parentField,
          separator,
          childrenField,
          mapChildrenField,
        } = aggregateOpts;
        const rowOpts = computeRowOpts.value;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField } = checkboxOpts;
        const indeterminateField = checkboxOpts.indeterminateField;
        const rgItem = rowGroups[0];
        if (
          rgItem &&
          rowField &&
          parentField &&
          childrenField &&
          mapChildrenField
        ) {
          fullData = [];
          treeData = [];
          const groupField = rgItem.field;
          const groupColumn = $asTable.getColumnByField(groupField);
          const groupMaps: Record<string, any[]> = {};
          const groupCombinedMaps: Record<string, any[]> = {};
          const aggList: AsTableDefines.AggregateRowInfo[] = [];
          const rowkey = getRowkey($asTable);
          list.forEach((row) => {
            const cellValue = groupColumn
              ? $asTable.getCellLabel(row, groupColumn)
              : get(row, groupField);
            let groupValue = eqNull(cellValue) ? '' : cellValue;
            if (isCombinedField) {
              const groupVals = [groupValue];
              rowGroups.slice(1).forEach((ogItem) => {
                const ogField = ogItem.field;
                const ogColumn = $asTable.getColumnByField(ogField);
                const ocValue = ogColumn
                  ? $asTable.getCellLabel(row, ogColumn)
                  : get(row, ogField);
                const ogValue = eqNull(ocValue) ? '' : ocValue;
                groupValue += (separator || ' / ') + ogValue;
                groupVals.push(ogValue);
              });
              if (!groupCombinedMaps[groupValue]) {
                groupCombinedMaps[groupValue] = groupVals;
              }
            }
            // 造桶或者取桶，然后挂数据
            let childList = groupMaps[groupValue];
            if (!childList) {
              childList = [];
              groupMaps[groupValue] = childList;
            }
            if (row.isAggregate) {
              row.isAggregate = undefined;
            }
            childList.push(row);
          });
          if (isCombinedField) {
            objectEach(groupMaps, (childList, groupValue) => {
              const aggRow: AsTableDefines.AggregateRowInfo = {
                isAggregate: true,
                aggData: {},
                groupContent: groupValue,
                groupCombineds: groupCombinedMaps[groupValue] as any,
                groupField,
                childCount: 0,
                [rowField]: getRowUniqueId(),
                [parentField]: null,
                [childrenField]: childList,
                [mapChildrenField]: childList,
              };
              aggRow[rowkey] = createRowId(rowOpts, aggRow, rowkey);
              if (checkField) {
                aggRow[checkField] = false;
              }
              if (indeterminateField) {
                aggRow[indeterminateField] = false;
              }
              aggList.push(aggRow);
              treeData.push(aggRow);
              fullData.push(aggRow);
            });
          } else {
            objectEach(groupMaps, (childList, groupValue) => {
              const { fullData: childFullData, treeData: childTreeData } =
                handleGroupData(childList, rowGroups.slice(1));
              const aggRow: AsTableDefines.AggregateRowInfo = {
                isAggregate: true,
                aggData: {},
                groupContent: groupValue,
                groupCombineds: [],
                groupField,
                childCount: 0,
                [rowField]: getRowUniqueId(),
                [parentField]: null,
                [childrenField]: childTreeData,
                [mapChildrenField]: childTreeData,
              };
              aggRow[rowkey] = createRowId(rowOpts, aggRow, rowkey);
              if (checkField) {
                aggRow[checkField] = false;
              }
              if (indeterminateField) {
                aggRow[indeterminateField] = false;
              }
              aggList.push(aggRow);
              treeData.push(aggRow);
              fullData.push(aggRow);
              if (childFullData.length > 0) {
                fullData.push(...childFullData);
              }
            });
          }
          handleeGroupSummary(aggList);
        }
      }
      return {
        treeData,
        fullData,
      };
    };

    const initGroupData = (
      list: any[],
      rowGroups: AsTableDefines.RowGroupItem[],
    ) => {
      const aggregateOpts = computeAggregateOpts.value;
      const { mode } = aggregateOpts;
      const isCombinedField = mode === 'combined';
      const groupRest = handleGroupData(list, rowGroups, isCombinedField);
      return groupRest;
    };

    const initData = () => {
      const { data } = props;
      loadTableData(data || [], true, true).then(() => {
        if (data && data.length > 0) {
          internalData.inited = true;
          internalData.initStatus = true;
          handleLoadDefaults();
        }
        handleInitDefaults();
        updateStyle();
        if (!reactData.isAllOverflow) {
          calcCellHeight();
          updateRowOffsetTop();
        }
      });
      nextTick(() => {
        dispatchEvent('ready', {}, null);
      });
    };

    /**
     * 加载表格数据
     */
    const loadTableData = (
      datas: any[],
      isReload: boolean,
      isReset: boolean,
    ) => {
      const { treeConfig, aggregateConfig, keepSource } = props;
      const { rowGroupList, scrollYLoad: oldScrollYLoad } = reactData;
      const {
        initStatus,
        scrollYStore,
        scrollXStore,
        lastScrollLeft,
        lastScrollTop,
      } = internalData;
      const rowOpts = computeRowOpts.value;
      const treeOpts = computeTreeOpts.value;
      const { transform } = treeOpts;
      const childrenField = treeOpts.childrenField;
      const expandOpts = computeExpandOpts.value;
      let treeData = [];
      let fullData = reactive(datas ? datas.slice(0) : []); // 转为响应式数据
      // 处理数据量过大发出警告
      if (fullData.length > supportMaxRow) {
        log.warn('errMaxRow', [supportMaxRow]);
      }
      // 行分组和树结构不兼容
      if (treeConfig && rowGroupList.length > 0) {
        log.error('noTree', ['aggregate-config']);
        return nextTick(); // ← 直接结束！表格保持旧数据
      }
      // 行拖拽和行分组不能同时开
      if (rowOpts.drag && rowGroupList.length > 0) {
        // ← 行拖拽 + 行分组 同时开
        log.error('errConflicts', ['row-config.drag', 'aggregate-config']);
        return nextTick();
      }
      let isRGroup = false;
      if (treeConfig) {
        if (transform) {
          // 树结构自动转换
          if (!treeOpts.rowField) {
            log.error('reqProp', ['tree-config.rowField']);
          }
          if (!treeOpts.parentField) {
            log.error('reqProp', ['tree-config.parentField']);
          }
          if (!childrenField) {
            log.error('reqProp', ['tree-config.childrenField']);
          }
          if (!treeOpts.mapChildrenField) {
            log.error('reqProp', ['tree-config.mapChildrenField']);
          }
          if (childrenField === treeOpts.mapChildrenField) {
            log.error('errConflicts', [
              'tree-config.childrenField',
              'tree-config.mapChildrenField',
            ]);
          }
          // 虚拟树的构建
          treeData = toArrayTree(fullData, {
            key: treeOpts.rowField,
            parentKey: treeOpts.parentField,
            children: childrenField,
            mapChildren: treeOpts.mapChildrenField,
          });
          fullData = treeData.slice(0);
        } else {
          treeData = fullData.slice(0);
        }
      } else if (aggregateConfig && rowGroupList.length > 0) {
        // 处理数据为行分组
        const groupRest = initGroupData(fullData, rowGroupList);
        treeData = groupRest.treeData;
        fullData = groupRest.fullData;
        isRGroup = true;
      }
      // 全局标记现在是不是分组模式
      reactData.isRowGroupStatus = isRGroup;
      //  当数据变动的时候需要把上一次的记忆全擦掉
      scrollYStore.startIndex = 0;
      scrollYStore.endIndex = 1;
      scrollXStore.startIndex = 0;
      scrollXStore.endIndex = 1;
      internalData.cvCacheMaps = {};
      reactData.isRowLoading = true;
      reactData.scrollVMLoading = false;
      reactData.treeExpandedFlag++;
      reactData.rowExpandedFlag++;
      internalData.insertRowMaps = {};
      reactData.insertRowFlag++;
      internalData.removeRowMaps = {};
      reactData.removeRowFlag++;
      internalData.fullCellHeightMaps = {};
      internalData.fullCellStoreMaps = {};
      const sYLoad = updateScrollYStatus(fullData);

      // 全量（列表视图）
      internalData.tableFullData = fullData;
      // 全量的树：分组模式下为空
      internalData.tableFullTreeData = isRGroup ? [] : treeData;
      // 全量的分组树：非分组模式为空
      internalData.tableFullGroupData = isRGroup ? treeData : [];

      // 缓存数据
      $asTable.cacheRowMap(isReset);
      // 原始数据
      internalData.tableSynchData = datas;
      if (isReset) {
        // 清掉"用户手动拖过行高"的标记：数据整体换了，实测行高作废
        internalData.isResizeCellHeight = false;
      }
      // 克隆原数据，用于显示编辑状态，与编辑值做对比
      if (keepSource) {
        //  只有开了 keep-source 才做
        // 深拷贝一份快照，用于脏检查 / revertData() 回滚
        $asTable.cacheSourceMap(fullData);
      }
      if ($asTable.clearCellAreas && props.mouseConfig) {
        // 开了鼠标框选才有这些方法;
        $asTable.clearCellAreas(); // TODO 清框选区域
        $asTable.clearCopyCellArea(); // TODO 清复制区域
      }
      $asTable.clearMergeCells(); //  清行合并结果（基于旧的行列位置，必须作废）
      $asTable.clearMergeFooterItems(); // 清表尾合并
      $asTable.clearHistory(); // 清撤销/重做栈

      $asTable.handleTableData(true);
      $asTable.updateFooter(); //  重算表尾合计（依赖刚算好的 afterFullData）
      $asTable.handleUpdateBodyMerge(); //  重算单元格合并（依赖新的行列索引）

      return nextTick()
        .then(() => {
          updateHeight();
          updateStyle();
        })
        .then(() => {
          computeScrollLoad();
          // TODO syncGanttScrollYStatus();
        })
        .then(() => {
          const virtualYOpts = computeVirtualYOpts.value;
          // 是否启用了虚拟滚动
          if (sYLoad) {
            scrollYStore.endIndex = scrollYStore.visibleSize;
          }

          if (sYLoad) {
            if (reactData.expandColumn && expandOpts.mode !== 'fixed') {
              log.error('notConflictProp', [
                'column.type="expand',
                'expand-config.mode="fixed"',
              ]);
            }
            if (
              virtualYOpts.mode === 'scroll' &&
              reactData.expandColumn &&
              expandOpts.mode === 'fixed'
            ) {
              log.warn('notConflictProp', [
                'virtual-y-config.mode=scroll',
                'expand-config.mode=inside',
              ]);
            }

            if (!(props.height || props.maxHeight)) {
              log.error('reqSupportProp', [
                'virtual-y-config.enabled = true',
                'height | max-height',
              ]);
            }
          }

          handleReserveStatus();
          $asTable.checkSelectionStatus();
          $asTable.dispatchEvent(
            'data-change',
            {
              visibleColumn: internalData.visibleColumn,
              visibleData: internalData.afterFullData,
            },
            null,
          );
          return new Promise<void>((resolve) => {
            nextTick()
              .then(() => handleRecalculateStyle(false, false, false))
              .then(() => {
                handleRecalculateStyle(false, true, true);
                updateRowOffsetTop();
              })
              .then(() => {
                let targetScrollLeft = lastScrollLeft;
                let targetScrollTop = lastScrollTop;
                const virtualXOpts = computeVirtualXOpts.value;
                const virtualYOpts = computeVirtualYOpts.value;
                // 是否在更新数据之后自动滚动重置滚动条
                if (virtualXOpts.scrollToLeftOnChange) {
                  targetScrollLeft = 0;
                }
                if (virtualYOpts.scrollToTopOnChange) {
                  targetScrollTop = 0;
                }
                reactData.isRowLoading = false;
                handleRecalculateStyle(false, false, false);
                updateTreeLineStyle();
                // TODO syncGanttScrollYStatus();

                // 如果是自动行高，特殊情况需调用 recalculate 手动刷新
                if (!props.showOverflow) {
                  setTimeout(() => {
                    handleLazyRecalculate(false, true, true);
                    setTimeout(
                      () => handleLazyRecalculate(false, true, true),
                      3000,
                    );
                  }, 2000);
                }
                // 是否变更虚拟滚动
                if (oldScrollYLoad === sYLoad) {
                  restoreScrollLocation(
                    $asTable,
                    targetScrollLeft,
                    targetScrollTop,
                  ).then(() => {
                    handleRecalculateStyle(false, true, true);
                    updateRowOffsetTop();
                    updateTreeLineStyle();
                    nextTick(() => resolve());
                  });
                } else {
                  setTimeout(() => {
                    restoreScrollLocation(
                      $asTable,
                      targetScrollLeft,
                      targetScrollTop,
                    ).then(() => {
                      handleRecalculateStyle(false, true, true);
                      updateRowOffsetTop();
                      updateTreeLineStyle();
                      nextTick(() => resolve());
                    });
                  }, 0);
                }
              });
          }).then(() => {
            if (initStatus) {
              dispatchEvent(
                'data-rendered',
                {
                  isReload,
                  visibleColumn: internalData.visibleColumn,
                  visibleData: internalData.afterFullData,
                },
                null,
              );
            } else {
              dispatchEvent(
                'init-rendered',
                {
                  visibleColumn: internalData.visibleColumn,
                  visibleData: internalData.afterFullData,
                },
                null,
              );
            }
          });
        });
    };

    /**
     * 处理数据加载默认行为
     * 默认执行一次，除非被重置
     */
    const handleLoadDefaults = () => {
      handleDefaultSelectionChecked();
      handleDefaultRadioChecked();
      handleDefaultRowExpand();
      handleDefaultTreeExpand();
      handleDefaultRowGroupExpand();
      handleDefaultMergeCells();
      handleDefaultMergeHeaderItems();
      handleDefaultMergeFooterItems();
      nextTick(() => {
        setTimeout(() => $asTable.recalculate(), 0);
      });
    };

    /**
     * 处理初始化的默认行为
     * 只会执行一次
     */
    const handleInitDefaults = () => {
      handleDefaultSort();
    };

    /**
     * 把内部全量顺序变成渲染真正消费的数组
     */
    const handleTableColumn = () => {
      const { scrollXLoad } = reactData;
      const { visibleColumn, scrollXStore, fullColumnIdData } = internalData;

      // ① 决定渲染内容：开虚拟 X → 按区间切片；否则全量
      //    slice() 一定是新数组，所以即使全量也会让引用变化（跟 staticColumns.slice(0) 同一个套路）
      const tableColumn = scrollXLoad
        ? visibleColumn.slice(scrollXStore.startIndex, scrollXStore.endIndex)
        : visibleColumn.slice(0);

      // ② 顺手写"渲染中的虚拟下标 $index"（= 在切片内的位置）
      tableColumn.forEach((column, $index) => {
        const colRest = fullColumnIdData[column.id];
        if (colRest) {
          colRest.$index = $index; // getVMColumnIndex() 读的就是它
        }
      });

      // ③ 提交到响应式状态 —— 渲染组件从这里取列
      reactData.tableColumn = tableColumn;
    };

    const handleUpdateColumn = () => {
      const columnList = orderBy(
        internalData.collectColumn,
        'renderSortNumber',
      );
      internalData.collectColumn = columnList;
      const tFullColumn = getColumnList(columnList);
      internalData.tableFullColumn = tFullColumn;
      reactData.updateColFlag++;
      cacheColumnMap();
    };

    const loadScrollXData = () => {
      const { isScrollXBig } = reactData;
      const { mergeBodyList, mergeFooterList, mergeBodyRowMaps, scrollXStore } =
        internalData;
      const { preloadSize, startIndex, endIndex, offsetSize } = scrollXStore;
      const { toVisibleIndex, visibleSize } = handleVirtualXVisible();
      const offsetItem: AsTableDefines.MergeCacheCol = {
        startIndex: Math.max(
          0,
          isScrollXBig
            ? toVisibleIndex - 1
            : toVisibleIndex - 1 - offsetSize - preloadSize,
        ),
        endIndex: isScrollXBig
          ? toVisibleIndex + visibleSize
          : toVisibleIndex + visibleSize + offsetSize + preloadSize,
      };
      scrollXStore.visibleStartIndex = toVisibleIndex - 1;
      scrollXStore.visibleEndIndex = toVisibleIndex + visibleSize + 1;
      calculateMergerOffsetIndex(
        mergeBodyList.concat(mergeFooterList),
        mergeBodyRowMaps,
        offsetItem,
        'col',
      );
      const { startIndex: offsetStartIndex, endIndex: offsetEndIndex } =
        offsetItem;
      if (
        (toVisibleIndex <= startIndex ||
          toVisibleIndex >= endIndex - visibleSize - 1) &&
        (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex)
      ) {
        scrollXStore.startIndex = offsetStartIndex;
        scrollXStore.endIndex = offsetEndIndex;
        $asTable.updateScrollXData();
      }
      $asTable.closeTooltip();
    };

    const parseColumns = (isReset: boolean) => {
      const leftList: AsTableDefines.ColumnInfo[] = [];
      const centerList: AsTableDefines.ColumnInfo[] = [];
      const rightList: AsTableDefines.ColumnInfo[] = [];
      const { collectColumn, tableFullColumn, fullColumnIdData, scrollXStore } =
        internalData;
      const { isGroup, columnStore } = reactData;
      // 如果是分组表头，如果子列全部被隐藏，则根列也隐藏
      if (isGroup) {
        const leftGroupList: AsTableDefines.ColumnInfo[] = [];
        const centerGroupList: AsTableDefines.ColumnInfo[] = [];
        const rightGroupList: AsTableDefines.ColumnInfo[] = [];
        eachTree(collectColumn, (column, index, items, path, parentColumn) => {
          const isColGroup = hasChildrenList(column);
          // 如果是分组，必须按组设置固定列，不允许给子列设置固定
          if (parentColumn && parentColumn.fixed) {
            column.fixed = parentColumn.fixed;
          }
          if (
            parentColumn &&
            (column.fixed || '') !== (parentColumn.fixed || '')
          ) {
            log.error('groupFixed');
          }
          if (isColGroup) {
            // 组自身的可见性 = 子树里是否存在可见叶子（"子列全隐藏 → 根列也隐藏"）
            column.visible = !!findTree(column.children, (subColumn) =>
              hasChildrenList(subColumn) ? false : subColumn.visible,
            );
          } else if (column.visible) {
            if (column.fixed === 'left') {
              leftList.push(column);
            } else if (column.fixed === 'right') {
              rightList.push(column);
            } else {
              centerList.push(column);
            }
          }
        });
        collectColumn.forEach((column) => {
          if (column.visible) {
            if (column.fixed === 'left') {
              leftGroupList.push(column);
            } else if (column.fixed === 'right') {
              rightGroupList.push(column);
            } else {
              centerGroupList.push(column);
            }
          }
        });
        reactData.tableGroupColumn = leftGroupList
          .concat(centerGroupList)
          .concat(rightGroupList);
      } else {
        // 重新分配列
        tableFullColumn.forEach((column) => {
          if (column.visible) {
            if (column.fixed === 'left') {
              leftList.push(column);
            } else if (column.fixed === 'right') {
              rightList.push(column);
            } else {
              centerList.push(column);
            }
          }
        });
      }
      // 拼出"可见列"总顺序：左固定 → 中间 → 右固定
      const visibleColumn = leftList.concat(centerList).concat(rightList);
      internalData.visibleColumn = visibleColumn;
      updateColumnOffsetLeft();
      // 决定要不要开横向虚拟滚动
      const sXLoad = updateScrollXStatus();
      reactData.hasFixedColumn = leftList.length > 0 || rightList.length > 0;
      // // 写回共享分类缓存
      Object.assign(columnStore, { leftList, centerList, rightList });
      if (sXLoad) {
        // 虚拟 X 不支持合并
        if (props.spanMethod) {
          log.error('scrollErrProp', ['span-method']);
        }
        if (props.footerSpanMethod) {
          log.error('scrollErrProp', ['footer-span-method']);
        }
        if (isReset) {
          //  列结构重建时，把横向虚拟滚动的渲染区间重置到"第一屏"
          const { visibleSize } = handleVirtualXVisible();
          scrollXStore.startIndex = 0;
          scrollXStore.endIndex = visibleSize;
          scrollXStore.visibleSize = visibleSize;
          scrollXStore.visibleStartIndex = 0;
          scrollXStore.visibleEndIndex = visibleSize;
        }
      }
      //  如果列被显示/隐藏，则清除合并状态
      // 如果列被设置为固定，则清除合并状态
      if (
        visibleColumn.length !== internalData.visibleColumn.length ||
        internalData.visibleColumn.some(
          (column, index) => column !== visibleColumn[index],
        )
      ) {
        $asTable.clearMergeCells();
        $asTable.clearMergeFooterItems();
      }

      // 写"可见列下标" _index
      visibleColumn.forEach((column, index) => {
        const colid = column.id;
        const colRest = fullColumnIdData[colid];
        if (colRest) {
          colRest._index = index;
        }
      });
      // 提交渲染列 + 聚合列
      handleTableColumn();
      handleUpdateAggValues();
      if (isReset) {
        updateColumnOffsetLeft();
        return $asTable
          .updateFooter()
          .then(() => {
            return $asTable.recalculate();
          })
          .then(() => {
            $asTable.updateCellAreas();
            return $asTable.recalculate();
          });
      }
      return $asTable.updateFooter();
    };

    /**
     * 初始化列层级缓存数据
     *
     * 遍历整棵列树（含子列），为每一列建立两套索引缓存：
     *   1. fullColIdData    —— 以列 id 为 key 的缓存
     *   2. fullColFieldData —— 以列 field 为 key 的缓存
     * 同时为每个列节点补全父级信息、排序序号等元数据。
     */
    const initColumnHierarchy = () => {
      const { collectColumn } = internalData;
      const fullColIdData: Record<string, AsTableDefines.ColumnCacheItem> = {};
      const fullColFieldData: Record<string, AsTableDefines.ColumnCacheItem> =
        {};
      let sortIndex = 1;
      eachTree(collectColumn, (column, index, items, _, parentColumn) => {
        const { id: colid, field } = column;
        const parentId = parentColumn ? parentColumn.id : null;
        const rest = {
          $index: -1,
          _index: -1,
          column,
          colid,
          index,
          items,
          parent: parentColumn || null,
          width: 0,
          oLeft: 0,
        };
        column.parentId = parentId;
        column.defaultParentId = parentId;
        column.sortNumber = sortIndex;
        column.renderSortNumber = sortIndex;
        if (field) {
          if (fullColFieldData[field]) {
            log.error('colRepet', ['field', field]);
          }
          fullColFieldData[field] = rest;
        }
        fullColIdData[colid] = rest;
      });
      internalData.fullColumnIdData = fullColIdData;
      internalData.fullColumnFieldData = fullColFieldData;
    };

    const buildColumnInfo = () => {
      const { scrollXLoad, scrollYLoad, expandColumn } = reactData;
      const expandOpts = computeExpandOpts.value;
      cacheColumnMap();
      parseColumns(true).then(() => {
        if (reactData.scrollXLoad) {
          loadScrollXData();
        }
      });

      $asTable.clearHeaderFormatterCache();
      $asTable.clearMergeCells();
      $asTable.clearMergeFooterItems();
      $asTable.handleTableData(true);
      $asTable.handleAggregateSummaryData();

      if (
        (scrollXLoad || scrollYLoad) &&
        expandColumn &&
        expandOpts.mode !== 'fixed'
      ) {
        log.error('scrollErrProp', ['column.type=expand']);
      }
      return nextTick().then(() => {
        // TODO if ($asToolbar) {
        //   $xeToolbar.syncUpdate({
        //     collectColumn: internalData.collectColumn,
        //     $table: $asTable
        //   })
        // }
        if ($asTable.handleUpdateCustomColumn) {
          $asTable.handleUpdateCustomColumn();
        }
        const columnOpts = computeColumnOpts.value;
        if (
          props.showCustomHeader &&
          reactData.isGroup &&
          columnOpts.resizable
        ) {
          log.error('notConflictProp', [
            'show-custom-header & colgroup',
            'column-config.resizable=false',
          ]);
        }
        reactData.isColLoading = false;
        return handleLazyRecalculate(false, true, true);
      });
    };

    const handleInitColumn = (collectColumn: AsTableDefines.ColumnInfo[]) => {
      internalData.collectColumn = collectColumn;
      // 拍平列
      const tFullColumn = getColumnList(collectColumn);
      internalData.tableFullColumn = tFullColumn;
      reactData.updateColFlag++;
      // 开始加载列
      reactData.isColLoading = true;
      initColumnHierarchy();
      return Promise.resolve(restoreCustomStorage()).then(() => {
        return buildColumnInfo();
      });
    };

    /**
     * 根据"列数"判断要不要开启横向虚拟滚动，并把结论写回响应式状态
     * @param fullColumn
     * @returns
     */
    const updateScrollXStatus = (fullColumn?: any[]) => {
      const virtualXOpts = computeVirtualXOpts.value;
      const allCols = fullColumn || internalData.tableFullColumn;
      // 如果gt为0，则总是启用
      const scrollXLoad =
        !!virtualXOpts.enabled &&
        virtualXOpts.gt > -1 &&
        (virtualXOpts.gt === 0 || virtualXOpts.gt < allCols.length);
      reactData.scrollXLoad = scrollXLoad;
      return scrollXLoad;
    };

    /**
     * 判定"要不要开纵向虚拟滚动"，把结果写进 reactData.scrollYLoad，并返回该布尔值
     * @param fullData
     * @returns
     */
    const updateScrollYStatus = (fullData?: any[]) => {
      const { treeConfig } = props;
      const virtualYOpts = computeVirtualYOpts.value;
      const treeOpts = computeTreeOpts.value;
      const { transform } = treeOpts;

      // 按"谁的行数"判断阈值：优先用传入的数组，不传则退回全量数据
      // 传拍平结果时判的是「可见行数」，不传时判的是「全量行数」—— 同一函数两种口径
      const allList = fullData || internalData.tableFullData;

      // 三个条件同时成立才开：
      //   enabled        总开关。默认为 undefined（全局配置里被注释掉了）→ 默认不开，必须显式 enabled: true
      //   gt > -1        排除 gt: -1 这种"关掉阈值判断"的配置
      //   gt === 0 || gt < allList.length
      //   gt === 0 表示总是启用；否则行数要【严格大于】gt 才开（gt:100 时 100 行不开、101 行才开）
      let scrollYLoad =
        !!virtualYOpts.enabled &&
        virtualYOpts.gt > -1 &&
        (virtualYOpts.gt === 0 || virtualYOpts.gt < allList.length);
      // 唯一的一条否决规则：嵌套树（transform = false）不支持纵向虚拟滚动
      // 因为它的子节点靠 body 递归渲染，不存在"第 N 个可见行"这个坐标，没法按下标切片
      // 先打日志再强制关闭 —— 属于自动降级：用户配错了不会崩，只是没有虚拟滚动
      if (scrollYLoad && treeConfig && !transform) {
        log.error('notSupportProp', [
          '[table] virtual-y-config.enabled=true',
          'tree-config.transform=false',
          'tree-config.transform=true',
        ]);
        scrollYLoad = false;
      }
      // 落库。这是 reactData.scrollYLoad 在整个 table 包里的【唯一写入点】
      reactData.scrollYLoad = scrollYLoad;
      // TODO 把新状态同步给 Gantt 视图 —— Gantt 复用 table 的行数据，需要知道开关状态
      // syncGanttScrollYStatus()
      return scrollYLoad;
    };

    /**
     * 展开与收起树节点
     * @param rows
     * @param expanded
     * @returns
     */
    const handleBaseTreeExpand = (rows: any[], expanded: boolean) => {
      const { treeNodeColumn } = reactData;
      const {
        fullAllDataRowIdData,
        tableFullTreeData,
        treeExpandedMaps,
        treeExpandLazyLoadedMaps,
      } = internalData;
      const treeOpts = computeTreeOpts.value;
      const { reserve, lazy, accordion, toggleMethod } = treeOpts;
      const childrenField = treeOpts.childrenField;
      const hasChildField = treeOpts.hasChildField;
      const result: any[] = [];
      const columnIndex = $asTable.getColumnIndex(treeNodeColumn);
      const $columnIndex = $asTable.getVMColumnIndex(treeNodeColumn);
      const _columnIndex = $asTable.getVTColumnIndex(treeNodeColumn);
      const { handleGetRowId } = createHandleGetRowId($asTable);
      let validRows = toggleMethod
        ? rows.filter((row: any) =>
            toggleMethod({
              $table: $asTable,
              expanded,
              column: treeNodeColumn,
              columnIndex,
              $columnIndex,
              _columnIndex,
              row,
            }),
          )
        : rows;
      if (accordion) {
        validRows =
          validRows.length > 0 ? [validRows[validRows.length - 1]] : [];
        // 同一级只能展开一个
        const matchObj = findTree(
          tableFullTreeData,
          (item) => item === validRows[0],
          { children: childrenField },
        );
        if (matchObj) {
          matchObj.items.forEach((item) => {
            const rowid = handleGetRowId(item);
            if (treeExpandedMaps[rowid]) {
              delete treeExpandedMaps[rowid];
            }
          });
        }
      }
      if (expanded) {
        validRows.forEach((row: any) => {
          const rowid = handleGetRowId(row);
          if (!treeExpandedMaps[rowid]) {
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              const isLoad =
                lazy &&
                row[hasChildField] &&
                !rowRest.treeLoaded &&
                !treeExpandLazyLoadedMaps[rowid];
              // 是否使用懒加载
              if (isLoad) {
                result.push(handleAsyncTreeExpandChilds(row));
              } else {
                if (row[childrenField] && row[childrenField].length > 0) {
                  treeExpandedMaps[rowid] = row;
                }
              }
            }
          }
        });
      } else {
        validRows.forEach((item) => {
          const rowid = handleGetRowId(item);
          if (treeExpandedMaps[rowid]) {
            delete treeExpandedMaps[rowid];
          }
        });
      }
      if (reserve) {
        validRows.forEach((row: any) => handleTreeExpandReserve(row, expanded));
      }
      reactData.treeExpandedFlag++;
      return Promise.all(result).then(() => {
        updateTreeLineStyle();
        return $asTable.recalculate();
      });
    };

    /**
     * 虚拟树的展开与收起
     * @param rows
     * @param expanded
     * @returns
     */
    const handleVirtualTreeExpand = (rows: any[], expanded: boolean) => {
      const { lastScrollLeft, lastScrollTop } = internalData;
      return handleBaseTreeExpand(rows, expanded)
        .then(() => {
          handleVirtualTreeToList();
          $asTable.handleTableData();
          reactData.treeExpandedFlag++;
          updateAfterDataIndex();
          return nextTick();
        })
        .then(() => {
          return handleRecalculateStyle(true, true, true);
        })
        .then(() => {
          restoreScrollLocation($asTable, lastScrollLeft, lastScrollTop);
          updateTreeLineStyle();
          setTimeout(() => {
            $asTable.updateCellAreas();
          }, 30);
        });
    };

    /**
     * 展开与收起行分组节点
     * @param rows
     * @param expanded
     * @returns
     */
    const handleRowGroupBaseExpand = (rows: any[], expanded: boolean) => {
      const { fullAllDataRowIdData, tableFullGroupData, rowGroupExpandedMaps } =
        internalData;
      const aggregateOpts = computeAggregateOpts.value;
      const { mapChildrenField, accordion } = aggregateOpts;
      const { handleGetRowId } = createHandleGetRowId($asTable);
      let validRows = rows;
      if (mapChildrenField) {
        if (accordion) {
          validRows =
            validRows.length > 0 ? [validRows[validRows.length - 1]] : [];
          // 同一级只能展开一个
          const matchObj = findTree(
            tableFullGroupData,
            (item) =>
              getRowid($asTable, item) === getRowid($asTable, validRows[0]),
            { children: mapChildrenField },
          );
          if (matchObj) {
            matchObj.items.forEach((item) => {
              const rowid = handleGetRowId(item);
              if (rowGroupExpandedMaps[rowid]) {
                delete rowGroupExpandedMaps[rowid];
              }
            });
          }
        }
        if (expanded) {
          validRows.forEach((row) => {
            const rowid = handleGetRowId(row);
            if (!rowGroupExpandedMaps[rowid]) {
              const rowRest = fullAllDataRowIdData[rowid];
              if (
                rowRest &&
                row[mapChildrenField] &&
                row[mapChildrenField].length > 0
              ) {
                rowGroupExpandedMaps[rowid] = row;
              }
            }
          });
        } else {
          validRows.forEach((item) => {
            const rowid = handleGetRowId(item);
            if (rowGroupExpandedMaps[rowid]) {
              delete rowGroupExpandedMaps[rowid];
            }
          });
        }
      }
      reactData.rowGroupExpandedFlag++;
      return $asTable.recalculate();
    };

    /**
     * 行分组的展开与收起
     * @param rows
     * @param expanded
     * @returns
     */
    const handleRowGroupVirtualExpand = (rows: any[], expanded: boolean) => {
      return handleRowGroupBaseExpand(rows, expanded)
        .then(() => {
          handleVirtualTreeToList();
          $asTable.handleTableData();
          reactData.rowGroupExpandedFlag++;
          updateAfterDataIndex();
          return nextTick();
        })
        .then(() => {
          return handleLazyRecalculate(true, true, true);
        })
        .then(() => {
          setTimeout(() => {
            $asTable.updateCellAreas();
          }, 30);
        });
    };

    /**
     * 处理默认展开分组行
     */
    const handleDefaultRowGroupExpand = () => {
      const { isRowGroupStatus } = reactData;
      if (isRowGroupStatus) {
        const aggregateOpts = computeAggregateOpts.value;
        const { expandAll, expandGroupFields } = aggregateOpts;
        if (expandAll) {
          $asTable.setAllRowGroupExpand(true);
        } else if (expandGroupFields && expandGroupFields.length > 0) {
          $asTable.setRowGroupExpandByField(expandGroupFields, true);
        }
      }
    };

    const handleCheckAllEvent = (evnt: Event | null, value: any) => {
      handleCheckedAllCheckboxRow(value);
      if (evnt) {
        dispatchEvent(
          'checkbox-all',
          {
            records: () => $asTable.getCheckboxRecords(),
            reserves: () => $asTable.getCheckboxReserveRecords(),
            indeterminates: () => $asTable.getCheckboxIndeterminateRecords(),
            checked: value,
          },
          evnt,
        );
      }
    };

    /**
     * 纵向 Y 可视渲染处理
     */
    const loadScrollYData = () => {
      const { isAllOverflow, isScrollYBig } = reactData;
      const { mergeBodyList, mergeBodyColMaps, scrollYStore } = internalData;
      const { preloadSize, startIndex, endIndex, offsetSize } = scrollYStore;
      const autoOffsetYSize = isAllOverflow ? offsetSize : offsetSize + 1;
      const { toVisibleIndex, visibleSize } = handleVirtualYVisible();
      const offsetItem: AsTableDefines.MergeCacheRow = {
        startIndex: Math.max(
          0,
          isScrollYBig
            ? toVisibleIndex - 1
            : toVisibleIndex - 1 - offsetSize - preloadSize,
        ),
        endIndex: isScrollYBig
          ? toVisibleIndex + visibleSize
          : toVisibleIndex + visibleSize + autoOffsetYSize + preloadSize,
      };
      scrollYStore.visibleStartIndex = toVisibleIndex - 1;
      scrollYStore.visibleEndIndex = toVisibleIndex + visibleSize + 1;
      calculateMergerOffsetIndex(
        mergeBodyList,
        mergeBodyColMaps,
        offsetItem,
        'row',
      );
      const { startIndex: offsetStartIndex, endIndex: offsetEndIndex } =
        offsetItem;
      if (
        (toVisibleIndex <= startIndex ||
          toVisibleIndex >= endIndex - visibleSize - 1) &&
        (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex)
      ) {
        scrollYStore.startIndex = offsetStartIndex;
        scrollYStore.endIndex = offsetEndIndex;
        $asTable.updateScrollYData();
      }
    };

    const createGetRowCacheProp = (
      prop: '$index' | '_index' | 'index' | 'seq',
    ) => {
      return function (row: any) {
        const { fullAllDataRowIdData } = internalData;
        if (row) {
          const rowid = getRowid($asTable, row);
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            return rowRest[prop];
          }
        }
        return -1;
      };
    };

    const createGetColumnCacheProp = (prop: '$index' | '_index' | 'index') => {
      return function (column: AsTableDefines.ColumnInfo) {
        const { fullColumnIdData } = internalData;
        if (column) {
          const colRest = fullColumnIdData[column.id];
          if (colRest) {
            return colRest[prop];
          }
        }
        return -1;
      };
    };

    const lazyScrollXData = () => {
      const { lxTimeout, lxRunTime, scrollXStore } = internalData;
      const { visibleSize } = scrollXStore;
      const fpsTime = visibleSize > 26 ? 26 : visibleSize > 16 ? 14 : 6;
      if (lxTimeout) {
        clearTimeout(lxTimeout);
      }
      if (!lxRunTime || lxRunTime + fpsTime < Date.now()) {
        internalData.lxRunTime = Date.now();
        loadScrollXData();
      }
      internalData.lxTimeout = setTimeout(() => {
        internalData.lxTimeout = undefined;
        internalData.lxRunTime = undefined;
        loadScrollXData();
      }, fpsTime);
    };

    const lazyScrollYData = () => {
      const { lyTimeout, lyRunTime, scrollYStore } = internalData;
      const { visibleSize } = scrollYStore;
      const fpsTime = visibleSize > 30 ? 32 : visibleSize > 20 ? 18 : 8;
      if (lyTimeout) {
        clearTimeout(lyTimeout);
      }
      if (!lyRunTime || lyRunTime + fpsTime < Date.now()) {
        internalData.lyRunTime = Date.now();
        loadScrollYData();
      }
      internalData.lyTimeout = setTimeout(() => {
        internalData.lyTimeout = undefined;
        internalData.lyRunTime = undefined;
        loadScrollYData();
      }, fpsTime);
    };

    const handleSyncScroll = (isRollX: boolean, isRollY: boolean) => {
      const { scrollXLoad, scrollYLoad, isAllOverflow } = reactData;
      const autoWidthColumnList = computeAutoWidthColumnList.value;
      internalData.lcsRunTime = Date.now();
      internalData.lcsTimeout = undefined;
      internalData.intoRunScroll = false;
      internalData.inVirtualScroll = false;
      internalData.inWheelScroll = false;
      internalData.inHeaderScroll = false;
      internalData.inBodyScroll = false;
      internalData.inFooterScroll = false;
      reactData.lazScrollLoading = false;
      internalData.scrollRenderType = '';

      let xRest = null;
      let yRest = null;
      if (!isAllOverflow) {
        calcCellHeight();
        updateRowOffsetTop();
      }
      if (isRollX && scrollXLoad) {
        xRest = $asTable.updateScrollXData();
      }
      if (isRollY && scrollYLoad) {
        if (autoWidthColumnList.length > 0) {
          calcCellWidth();
        }
        yRest = $asTable.updateScrollYData().then(() => {
          if (autoWidthColumnList.length > 0) {
            calcCellWidth();
            autoCellWidth();
          }
          if (!isAllOverflow) {
            calcCellHeight();
            updateRowOffsetTop();
          }
          return $asTable.updateScrollYSpace();
        });
      }
      updateRowExpandStyle();
      return Promise.all([
        xRest,
        yRest,
        scrollXLoad || scrollYLoad ? $asTable.updateCellAreas() : null,
      ]);
    };

    const checkLastSyncScroll = (isRollX: boolean, isRollY: boolean) => {
      const { lcsTimeout } = internalData;
      reactData.lazScrollLoading = true;
      if (lcsTimeout) {
        clearTimeout(lcsTimeout);
      }
      internalData.lcsTimeout = setTimeout(() => {
        handleSyncScroll(isRollX, isRollY).then(() => {
          if (reactData.scrollXLoad || reactData.scrollYLoad) {
            nextTick(() => {
              updateRowExpandStyle();
              if (!internalData.lcsTimeout) {
                handleSyncScroll(isRollX, isRollY);
              }
            });
          }
        });
      }, 240);
    };

    const getWheelSpeed = (lastScrollTime: number) => {
      let multiple = 1;
      const currTime = Date.now();
      if (lastScrollTime + 25 > currTime) {
        multiple = 1.18;
      } else if (lastScrollTime + 30 > currTime) {
        multiple = 1.15;
      } else if (lastScrollTime + 40 > currTime) {
        multiple = 1.12;
      } else if (lastScrollTime + 55 > currTime) {
        multiple = 1.09;
      } else if (lastScrollTime + 75 > currTime) {
        multiple = 1.06;
      } else if (lastScrollTime + 100 > currTime) {
        multiple = 1.03;
      }
      return multiple;
    };

    const dispatchEvent = (
      type: ValueOf<AsTableEmits>,
      params: Record<string, any>,
      evnt: Event | null,
    ) => {
      emit(
        type,
        createEvent(
          evnt,
          {
            $table: $asTable,
            // TODO , $grid: $xeGrid, $gantt: $xeGantt
          },
          params,
        ),
      );
    };

    const handleScrollToRowColumn = (
      fieldOrColumn: AsTableDefines.ColumnInfo | null | string,
      row: any,
      options?: AsTableDefines.ScrollToRowConfig,
    ) => {
      const { fullColumnIdData } = internalData;
      const column = handleFieldOrColumn($asTable, fieldOrColumn);
      if (column && fullColumnIdData[column.id]) {
        return colToVisible(
          $asTable,
          options ? options.colAlign !== false : true,
          column,
          row,
        );
      }
      return nextTick();
    };

    const handleUpdateResize = () => {
      const el = refElem.value;
      if (el && el.clientWidth && el.clientHeight) {
        $asTable.recalculate();
      }
    };

    const handleUpdateColResize = (evnt: MouseEvent, params: any) => {
      $asTable.analyColumnWidth();
      $asTable.recalculate().then(() => {
        $asTable.saveCustomStore('update:width');
        $asTable.refreshScroll().then(() => {
          $asTable.updateCellAreas();
        });
        $asTable.dispatchEvent('column-resizable-change', params, evnt);
        setTimeout(() => {
          $asTable.recalculate(true);
        }, 300);
      });
    };

    const handleUpdateRowResize = (evnt: MouseEvent, params: any) => {
      reactData.resizeHeightFlag++;
      $asTable.recalculate().then(() => {
        $asTable.refreshScroll().then(() => {
          $asTable.updateCellAreas();
        });
        $asTable.dispatchEvent('row-resizable-change', params, evnt);
        setTimeout(() => {
          $asTable.recalculate(true);
        }, 300);
      });
    };

    /**
     * 给每列算"累计左偏移 oLeft"（虚拟 X 定位与合并单元格用）
     * @returns
     */
    const updateColumnOffsetLeft = () => {
      const { visibleColumn, fullColumnIdData } = internalData;
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return;
      }
      let offsetLeft = 0;
      for (const column of visibleColumn) {
        const colid = column.id;
        const colRest = fullColumnIdData[colid];
        if (colRest) {
          colRest.oLeft = offsetLeft;
        }
        offsetLeft += column.renderWidth;
      }
    };

    const updateRowOffsetTop = () => {
      const { expandColumn } = reactData;
      const { afterFullData, fullAllDataRowIdData, rowExpandedMaps } =
        internalData;
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return;
      }
      const expandOpts = computeExpandOpts.value;
      const cellOpts = computeCellOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;
      const { handleGetRowId } = createHandleGetRowId($asTable);
      let offsetTop = 0;
      for (const row of afterFullData) {
        const rowid = handleGetRowId(row);
        const rowRest =
          fullAllDataRowIdData[rowid] || ({} as AsTableDefines.RowCacheItem);
        rowRest.oTop = offsetTop;
        offsetTop += getCellRestHeight(rowRest, cellOpts, defaultRowHeight);
        // 是否展开行
        if (expandColumn && rowExpandedMaps[rowid]) {
          offsetTop += rowRest.expandHeight || expandOpts.height || 0;
        }
      }
    };

    /**
     * 更新展开行样式
     */
    const updateRowExpandStyle = () => {
      const { expandColumn, scrollYLoad, scrollYTop, isScrollYBig } = reactData;
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return;
      }
      const expandOpts = computeExpandOpts.value;
      const { mode } = expandOpts;
      if (expandColumn && mode === 'fixed') {
        const { elemStore, fullAllDataRowIdData } = internalData;
        const cellOpts = computeCellOpts.value;
        const defaultRowHeight = computeDefaultRowHeight.value;
        const rowExpandEl = refRowExpandElem.value;
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        if (rowExpandEl && bodyScrollElem) {
          let isUpdateHeight = false;
          arrayEach(rowExpandEl.children, (reEl) => {
            const expandEl = reEl as HTMLDivElement;
            const rowid = expandEl.getAttribute('rowid') || '';
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              const expandHeight = expandEl.offsetHeight;
              const trEl = bodyScrollElem.querySelector(
                `.${prefixCls.value}-body--row[rowid="${CSS.escape(rowid)}"]`,
              ) as HTMLTableCellElement;
              let offsetTop = 0;
              if (scrollYLoad) {
                offsetTop =
                  isScrollYBig && trEl
                    ? trEl.offsetTop + trEl.offsetHeight
                    : rowRest.oTop +
                      getCellRestHeight(rowRest, cellOpts, defaultRowHeight);
              } else {
                if (trEl) {
                  offsetTop = trEl.offsetTop + trEl.offsetHeight;
                }
              }
              if (isScrollYBig) {
                offsetTop += scrollYTop;
              }
              expandEl.style.top = toCssUnit(offsetTop);

              if (!isUpdateHeight && rowRest.expandHeight !== expandHeight) {
                isUpdateHeight = true;
              }
              rowRest.expandHeight = expandHeight;
            }
          });
          if (isUpdateHeight) {
            reactData.rowExpandHeightFlag++;
            nextTick(() => {
              updateRowOffsetTop();
            });
          }
        }
      }
    };

    /**
     * 更新树连接线样式
     */
    const updateTreeLineStyle = () => {
      const { treeConfig } = props;
      if (!treeConfig) {
        return;
      }
      const { tableData } = reactData;
      const { fullAllDataRowIdData, treeExpandedMaps } = internalData;
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return;
      }
      const cellOpts = computeCellOpts.value;
      const defaultRowHeight = computeDefaultRowHeight.value;
      const treeOpts = computeTreeOpts.value;
      const { transform, mapChildrenField } = treeOpts;
      const childrenField = treeOpts.childrenField;
      const { handleGetRowId } = createHandleGetRowId($asTable);
      const expParentList: {
        nextRow: any;
        prevRow: any;
        row: any;
      }[] = [];

      const handleNodeRow = (row: any, rIndex: number, rows: any[]) => {
        const rowid = handleGetRowId(row);
        const rowRest =
          fullAllDataRowIdData[rowid] || ({} as AsTableDefines.RowCacheItem);
        const childList: any[] =
          row[transform ? mapChildrenField : childrenField];
        const prevRow = rows[rIndex - 1] || null;
        const nextRow = rows[rIndex + 1] || null;
        if (childList && childList.length > 0 && treeExpandedMaps[rowid]) {
          expParentList.push({ row, prevRow, nextRow });
          childList.forEach((childRow, crIndex) => {
            const childRowid = handleGetRowId(childRow);
            if (treeExpandedMaps[childRowid]) {
              handleNodeRow(childRow, crIndex, childList);
            }
          });
        } else {
          if (nextRow) {
            const nextRowid = handleGetRowId(nextRow);
            const nextRowRest =
              fullAllDataRowIdData[nextRowid] ||
              ({} as AsTableDefines.RowCacheItem);
            const currCellHeight = getCellRestHeight(
              rowRest,
              cellOpts,
              defaultRowHeight,
            );
            const nextCellHeight = getCellRestHeight(
              nextRowRest,
              cellOpts,
              defaultRowHeight,
            );
            rowRest.oHeight = currCellHeight;
            rowRest.lineHeight = Math.floor(
              currCellHeight / 2 + nextCellHeight / 2,
            );
          } else {
            rowRest.oHeight = 0;
            rowRest.lineHeight = 0;
          }
        }
      };
      tableData.forEach((row, rIndex) => {
        handleNodeRow(row, rIndex, tableData);
      });

      lastArrayEach(expParentList, ({ row, nextRow }) => {
        const rowid = handleGetRowId(row);
        const childList: any[] =
          row[transform ? mapChildrenField : childrenField];
        const rowRest = fullAllDataRowIdData[rowid];
        if (rowRest) {
          const currCellHeight = getCellRestHeight(
            rowRest,
            cellOpts,
            defaultRowHeight,
          );
          let countOffsetHeight = currCellHeight;
          let countLineHeight = 0;
          childList.forEach((childRow) => {
            const childRowid = handleGetRowId(childRow);
            const childRowRest =
              fullAllDataRowIdData[childRowid] ||
              ({} as AsTableDefines.RowCacheItem);
            const childList: any[] =
              childRow[transform ? mapChildrenField : childrenField];
            if (
              treeExpandedMaps[childRowid] &&
              childList &&
              childList.length > 0
            ) {
              countOffsetHeight += childRowRest.oHeight || 0;
              countLineHeight += childRowRest.oHeight || 0;
            } else {
              const cellHeight = getCellRestHeight(
                childRowRest,
                cellOpts,
                defaultRowHeight,
              );
              childRowRest.oHeight = cellHeight;
              childRowRest.lineHeight = cellHeight;
              countOffsetHeight += cellHeight;
              countLineHeight += cellHeight;
            }
          });
          if (nextRow) {
            const nextRowid = handleGetRowId(nextRow);
            const nextRowRest =
              fullAllDataRowIdData[nextRowid] ||
              ({} as AsTableDefines.RowCacheItem);
            const currCellHeight = getCellRestHeight(
              rowRest,
              cellOpts,
              defaultRowHeight,
            );
            const nextCellHeight = getCellRestHeight(
              nextRowRest,
              cellOpts,
              defaultRowHeight,
            );
            countOffsetHeight += currCellHeight;
            countLineHeight += Math.floor(
              currCellHeight / 2 + nextCellHeight / 2,
            );
          }
          rowRest.lineHeight = countLineHeight;
          rowRest.oHeight = countOffsetHeight;
        }
      });
    };

    const handleRowExpandScroll = () => {
      const { elemStore } = internalData;
      const rowExpandEl = refRowExpandElem.value;
      const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
      if (rowExpandEl && bodyScrollElem) {
        rowExpandEl.scrollTop = bodyScrollElem.scrollTop;
      }
    };

    const handleColumnVisible = (visible: boolean) => {
      return function (
        fieldOrColumn:
          | AsTableDefines.ColumnInfo
          | AsTableDefines.ColumnInfo[]
          | string
          | string[],
      ) {
        let status = false;
        const cols = isArray(fieldOrColumn) ? fieldOrColumn : [fieldOrColumn];
        cols.forEach((item) => {
          const column = handleFieldOrColumn($asTable, item);
          if (column) {
            if (column.children && column.children.length > 0) {
              eachTree([column], (item) => {
                item.visible = visible;
                item.renderVisible = visible;
              });
            } else {
              column.visible = visible;
              column.renderVisible = visible;
            }
            if (!status) {
              status = true;
            }
          }
        });
        if (status) {
          return $asTable.handleCustom();
        }
        return nextTick();
      };
    };

    tableMethods = {
      dispatchEvent,
      getEl() {
        return refElem.value;
      },
      /**
       * 重置表格的一切数据状态
       */
      clearAll() {
        return clearTableAllStatus($asTable);
      },
      /**
       * 手动处理数据，用于手动排序与筛选
       * 对于手动更改了排序、筛选...等条件后需要重新处理数据时可能会用到
       */
      updateData() {
        const { scrollXLoad, scrollYLoad } = reactData;
        return $asTable
          .handleTableData(true)
          .then(() => {
            $asTable.updateFooter();
            if (scrollXLoad || scrollYLoad) {
              if (scrollXLoad) {
                $asTable.updateScrollXSpace();
              }
              if (scrollYLoad) {
                $asTable.updateScrollYSpace();
              }
              return $asTable.refreshScroll();
            }
          })
          .then(() => {
            $asTable.updateCellAreas();
            return handleLazyRecalculate(true, true, true);
          })
          .then(() => {
            // 存在滚动行为未结束情况
            setTimeout(() => handleLazyRecalculate(false, true, true), 50);
          });
      },
      /**
       * 重新加载数据，不会清空表格状态
       * @param {Array} datas 数据
       */
      loadData(datas) {
        const { initStatus } = internalData;
        return loadTableData(datas, false, false).then(() => {
          internalData.inited = true;
          internalData.initStatus = true;
          if (!initStatus) {
            handleLoadDefaults();
          }
          return handleLazyRecalculate(false, true, true);
        });
      },
      /**
       * 重新加载数据，会清空表格状态
       * @param {Array} datas 数据
       */
      reloadData(datas) {
        return $asTable
          .clearAll()
          .then(() => {
            internalData.inited = true;
            internalData.initStatus = true;
            return loadTableData(datas, true, true);
          })
          .then(() => {
            handleLoadDefaults();
            return handleLazyRecalculate(false, true, true);
          });
      },
      /**
       * 修改行数据
       */
      setRow(rows, record) {
        if (rows && record) {
          const rest: any[] = isArray(rows) ? rows : [rows];
          const rowkey = getRowkey($asTable);
          rest.forEach((row) => {
            const rowid = getRowid($asTable, row);
            const newRecord = clone(Object.assign({}, record), true);
            set(newRecord, rowkey, rowid);
            Object.assign(row, newRecord);
          });
        }
        return nextTick();
      },
      /**
       * 局部加载行数据并恢复到初始状态
       * 对于行数据需要局部更改的场景中可能会用到
       * @param {Row} row 行对象
       * @param {Object} record 新数据
       * @param {String} field 字段名
       */
      reloadRow(row, record, field?: string) {
        const { keepSource } = props;
        const { tableData } = reactData;
        const { sourceDataRowIdData } = internalData;
        if (keepSource) {
          if ($asTable.isAggregateRecord(row)) {
            return nextTick();
          }
          const rowkey = getRowkey($asTable);
          const rowid = get(row, rowkey);
          const oRow = sourceDataRowIdData[rowid];
          if (oRow && row) {
            if (field) {
              const newValue = clone(get(record || row, field), true);
              set(row, field, newValue);
              set(oRow, field, newValue);
            } else {
              const newRecord = clone(Object.assign({}, record), true);
              set(newRecord, rowkey, rowid);
              destructuring(oRow, Object.assign(row, newRecord));
            }
          }
          reactData.tableData = tableData.slice(0);
        } else {
          log.error('reqProp', ['keep-source']);
        }
        return nextTick();
      },
      getParams() {
        return props.params;
      },
      /**
       * 用于树结构，给行数据加载子节点
       */
      loadTreeChildren(row, childRecords) {
        const { keepSource } = props;
        const {
          tableSourceData,
          fullDataRowIdData,
          fullAllDataRowIdData,
          sourceDataRowIdData,
        } = internalData;
        const treeOpts = computeTreeOpts.value;
        const { transform, mapChildrenField } = treeOpts;
        const childrenField = treeOpts.childrenField;
        const parentRest = fullAllDataRowIdData[getRowid($asTable, row)];
        const parentLevel = parentRest ? parentRest.level : 0;
        return $asTable.createData(childRecords).then((rows) => {
          if (keepSource) {
            const rowid = getRowid($asTable, row);
            const matchObj: any = findTree(
              tableSourceData,
              (item) => rowid === getRowid($asTable, item),
              { children: childrenField },
            );
            if (matchObj) {
              matchObj.item[childrenField] = clone(rows, true);
            }
            rows.forEach((childRow) => {
              const rowid = getRowid($asTable, childRow);
              sourceDataRowIdData[rowid] = clone(childRow, true);
            });
          }
          eachTree(
            rows,
            (childRow, index, items, path, parentItem, nodes) => {
              const rowid = getRowid($asTable, childRow);
              const parentRow = parentItem || parentRest?.row;
              const rest = {
                row: childRow,
                rowid,
                _seq: -1,
                seq: -1,
                index,
                _index: -1,
                $index: -1,
                treeIndex: -1,
                _tIndex: -1,
                items,
                parent: parentRow,
                level: parentLevel + nodes.length,
                height: 0,
                resizeHeight: 0,
                oTop: 0,
                expandHeight: 0,
              };
              fullDataRowIdData[rowid] = rest;
              fullAllDataRowIdData[rowid] = rest;
            },
            { children: childrenField },
          );
          row[childrenField] = rows;
          if (transform) {
            row[mapChildrenField] = clone(rows, false);
          }
          updateAfterDataIndex();
          return rows;
        });
      },
      /**
       * 加载列配置
       * 对于表格列需要重载、局部递增场景下可能会用到
       * @param {ColumnInfo} columns 列配置
       */
      loadColumn(columns) {
        const { lastScrollLeft, lastScrollTop } = internalData;
        const collectColumn = mapTree(columns, (column) =>
          reactive(Cell.createColumn($asTable, column)),
        );
        return handleInitColumn(collectColumn).then(() => {
          let targetScrollLeft = lastScrollLeft;
          let targetScrollTop = lastScrollTop;
          const virtualXOpts = computeVirtualXOpts.value;
          const virtualYOpts = computeVirtualYOpts.value;
          // 是否在更新数据之后自动滚动重置滚动条
          if (virtualXOpts.scrollToLeftOnChange) {
            targetScrollLeft = 0;
          }
          if (virtualYOpts.scrollToTopOnChange) {
            targetScrollTop = 0;
          }
          restoreScrollLocation($asTable, targetScrollLeft, targetScrollTop);
        });
      },
      /**
       * 加载列配置并恢复到初始状态
       * 对于表格列需要重载、局部递增场景下可能会用到
       * @param {ColumnInfo} columns 列配置
       */
      reloadColumn(columns) {
        return $asTable.clearAll().then(() => {
          return $asTable.loadColumn(columns);
        });
      },
      /**
       * 根据 tr 元素获取对应的 row 信息
       * @param {Element} tr 元素
       */
      getRowNode(tr) {
        if (tr) {
          const { fullAllDataRowIdData } = internalData;
          const rowid = tr.getAttribute('rowid');
          if (rowid) {
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              return {
                rowid: rowRest.rowid,
                item: rowRest.row,
                index: rowRest.index,
                items: rowRest.items,
                parent: rowRest.parent,
              };
            }
          }
        }
        return null;
      },
      /**
       * 根据 th/td 元素获取对应的 column 信息
       * @param {Element} cell 元素
       */
      getColumnNode(cell) {
        if (cell) {
          const { fullColumnIdData } = internalData;
          const colid = cell.getAttribute('colid');
          if (colid) {
            const colRest = fullColumnIdData[colid];
            if (colRest) {
              return {
                colid: colRest.colid,
                item: colRest.column,
                index: colRest.index,
                items: colRest.items,
                parent: colRest.parent,
              };
            }
          }
        }
        return null;
      },
      /**
       * 根据 row 获取序号
       * @param {Row} row 行对象
       */
      getRowSeq: createGetRowCacheProp('seq'),
      /**
       * 根据 row 获取相对于 data 中的索引
       * @param {Row} row 行对象
       */
      getRowIndex: createGetRowCacheProp('index') as (row: any) => number,
      /**
       * 根据 row 获取相对于当前数据中的索引
       * @param {Row} row 行对象
       */
      getVTRowIndex: createGetRowCacheProp('_index') as (row: any) => number,
      /**
       * 根据 row 获取渲染中的虚拟索引
       * @param {Row} row 行对象
       */
      getVMRowIndex: createGetRowCacheProp('$index') as (row: any) => number,

      /**
       * 根据 column 获取相对于 columns 中的索引
       * @param {ColumnInfo} column 列配置
       */
      getColumnIndex: createGetColumnCacheProp('index'),
      /**
       * 根据 column 获取相对于当前表格列中的索引
       * @param {ColumnInfo} column 列配置
       */
      getVTColumnIndex: createGetColumnCacheProp('_index'),
      /**
       * 根据 column 获取渲染中的虚拟索引
       * @param {ColumnInfo} column 列配置
       */
      getVMColumnIndex: createGetColumnCacheProp('$index'),
      /**
       * 创建 data 对象
       * 对于某些特殊场景可能会用到，会自动对数据的字段名进行检测，如果不存在就自动定义
       * @param {Array} records 新数据
       */
      createData(records) {
        return nextTick().then(() => {
          return reactive($asTable.defineField(records));
        });
      },
      /**
       * 创建 Row|Rows 对象
       * 对于某些特殊场景需要对数据进行手动插入时可能会用到
       * @param {Array/Object} records 新数据
       */
      createRow(records) {
        const isArr = isArray(records);
        if (!isArr) {
          records = [records || {}];
        }
        return $asTable
          .createData(records)
          .then((rows) => (isArr ? rows : rows[0]));
      },
      /**
       * 还原数据
       * 如果不传任何参数，则还原整个表格
       * 如果传 row 则还原一行
       * 如果传 rows 则还原多行
       * 如果还额外传了 field 则还原指定的单元格数据
       */
      revertData(rows: any, field) {
        const { keepSource, treeConfig } = props;
        const {
          fullAllDataRowIdData,
          fullDataRowIdData,
          tableSourceData,
          sourceDataRowIdData,
          tableFullData,
          afterFullData,
          removeRowMaps,
        } = internalData;
        const treeOpts = computeTreeOpts.value;
        const { transform } = treeOpts;
        const { handleGetRowId } = createHandleGetRowId($asTable);
        if (!keepSource) {
          log.error('reqProp', ['keep-source']);
          return nextTick();
        }
        let targetRows = rows;
        if (rows) {
          if (!isArray(rows)) {
            targetRows = [rows];
          }
        } else {
          targetRows = toArray($asTable.getUpdateRecords());
        }
        let reDelFlag = false;
        if (targetRows.length > 0) {
          targetRows.forEach((item: any) => {
            const rowid = handleGetRowId(item);
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              const row = rowRest.row;
              if (!$asTable.isInsertByRow(row)) {
                const oRow = sourceDataRowIdData[rowid];
                if (oRow && row) {
                  if (field) {
                    set(row, field, clone(get(oRow, field), true));
                  } else {
                    destructuring(row, clone(oRow, true));
                  }
                  if (
                    !fullDataRowIdData[rowid] &&
                    $asTable.isRemoveByRow(row)
                  ) {
                    if (removeRowMaps[rowid]) {
                      delete removeRowMaps[rowid];
                    }
                    tableFullData.unshift(row);
                    afterFullData.unshift(row);
                    reDelFlag = true;
                  }
                }
              }
            }
          });
        }
        if (rows) {
          if (reDelFlag) {
            reactData.removeRowFlag++;
            $asTable.updateFooter();
            $asTable.cacheRowMap(false);
            $asTable.handleTableData(treeConfig && transform);
            if (!(treeConfig && transform)) {
              $asTable.updateAfterDataIndex();
            }
            $asTable.checkSelectionStatus();
            if (reactData.scrollYLoad) {
              $asTable.updateScrollYSpace();
            }
          }
          return nextTick().then(() => {
            $asTable.updateCellAreas();
            return handleLazyRecalculate(false, true, true);
          });
        }
        return $asTable.reloadData(tableSourceData);
      },
      /**
       * 清空单元格内容
       * 如果不创参数，则清空整个表格内容
       * 如果传 row 则清空一行内容
       * 如果传 rows 则清空多行内容
       * 如果还额外传了 field 则清空指定单元格内容
       * @param {Array/Row} rows 行数据
       * @param {String} field 字段名
       */
      clearData(rows: any, field: string) {
        const { tableFullData, visibleColumn } = internalData;
        if (arguments.length === 0) {
          rows = tableFullData;
        } else if (rows && !isArray(rows)) {
          rows = [rows];
        }
        if (field) {
          rows.forEach((row: any) => set(row, field, null));
        } else {
          rows.forEach((row: any) => {
            visibleColumn.forEach((column) => {
              if (column.field) {
                setCellValue(row, column, null);
              }
            });
          });
        }
        return nextTick();
      },
      effectCellData(row, column, options) {
        const { fullCellStoreMaps } = internalData;
        const editOpts = computeEditOpts.value;
        const { key, isChanged, setValue, getResult } = options;
        const rowid = getRowid($asTable, row);
        const colid = column.id;
        let rowStore = fullCellStoreMaps[rowid];
        const cellValue = get(row, column.field);
        const restParams: AsTableDefines.CellCacheHandleParams = {
          $table: $asTable,
          row,
          rowid,
          column,
          colid,
          cellValue,
          oldValue: null,
        };

        if (editOpts.cache === false && key === 'render_table_cell') {
          const rest = restParams as AsTableDefines.CellCacheResultObj;
          rest.cellResult = getResult ? getResult(restParams) : cellValue;
          return rest;
        }

        if (!rowStore) {
          rowStore = {};
          fullCellStoreMaps[rowid] = rowStore;
        }
        let cellStore = rowStore[colid];
        if (!cellStore) {
          cellStore = {
            value: undefined,
            result: {},
          };
          rowStore[colid] = cellStore;
        }
        const restData = rowStore[colid]!;
        const oldValue = restData.value;
        restParams.oldValue = oldValue;
        if (isChanged ? !isChanged(restParams) : oldValue !== cellValue) {
          restData.value = setValue ? setValue(restParams) : cellValue;
          restData.result = {};
        }
        const storeData = restData.result;
        if (isUndefined(storeData[key])) {
          storeData[key] = getResult ? getResult(restParams) : cellValue;
        }
        const cellResult = storeData[key];
        const rest = restParams as AsTableDefines.CellCacheResultObj;
        rest.cellResult = cellResult;
        return rest;
      },
      getCellElement(row, fieldOrColumn) {
        const { elemStore } = internalData;
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (!column) {
          return null;
        }
        const rowid = getRowid($asTable, row);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
        const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
        let bodyElem;
        if (column) {
          if (column.fixed) {
            if (column.fixed === 'left') {
              if (leftScrollElem) {
                bodyElem = leftScrollElem;
              }
            } else {
              if (rightScrollElem) {
                bodyElem = rightScrollElem;
              }
            }
          }
          if (!bodyElem) {
            bodyElem = bodyScrollElem;
          }
          if (bodyElem) {
            return bodyElem.querySelector(
              `.${prefixCls.value}-body--row[rowid="${CSS.escape(rowid)}"] .${column.id}`,
            );
          }
        }
        return null;
      },
      getCellLabel(row, fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (!column) {
          return null;
        }
        const { editConfig } = props;
        const { formatter, editRender, cellRender } = column;
        let etOpSize = null;
        let etOgSize = null;
        let clOpSize = null;
        let clOgSize = null;
        if (editRender) {
          etOpSize = editRender.options ? editRender.options.length : 0;
          etOgSize = editRender.optionGroups
            ? editRender.optionGroups.length
            : 0;
        }
        if (cellRender) {
          clOpSize = cellRender.options ? cellRender.options.length : 0;
          clOgSize = cellRender.optionGroups
            ? cellRender.optionGroups.length
            : 0;
        }
        // formatter > tableCellFormatter
        const renderOpts = formatter
          ? null
          : editConfig && isEnableConf(editRender)
            ? editRender
            : isEnableConf(cellRender)
              ? cellRender
              : null;
        const compConf = renderOpts ? renderer.get(renderOpts.name) : null;
        const tcFormatter = compConf ? compConf.tableCellFormatter : null;
        const cellValue = getCellValue(row, column);
        let cellLabel = cellValue;
        if (formatter || tcFormatter) {
          let formatData:
            | Record<string, AsTableDefines.RowCacheFormatObj>
            | undefined;
          const { fullAllDataRowIdData } = internalData;
          const rowid = getRowid($asTable, row);
          const colid = column.id;
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            formatData = rowRest.formatData;
            if (!formatData) {
              formatData = fullAllDataRowIdData[rowid]!.formatData = {};
            }
            if (rowRest && formatData[colid]) {
              const ftValue = formatData[colid].value;
              if (
                ftValue &&
                ftValue[0] === cellValue &&
                ftValue[1] === etOpSize &&
                ftValue[2] === etOgSize &&
                ftValue[3] === clOpSize &&
                ftValue[4] === clOgSize
              ) {
                return formatData[colid].label;
              }
            }
            const formatParams = {
              $table: $asTable,
              cellValue,
              row,
              rowIndex: $asTable.getRowIndex(row),
              column,
              columnIndex: $asTable.getColumnIndex(column),
            };
            if (formatter) {
              if (isString(formatter)) {
                const gFormatOpts = formats.get(formatter);
                const tcFormatMethod = gFormatOpts
                  ? gFormatOpts.tableCellFormatMethod
                  : null;
                cellLabel = tcFormatMethod ? tcFormatMethod(formatParams) : '';
              } else if (isArray(formatter)) {
                const gFormatOpts = formats.get(formatter[0]);
                const tcFormatMethod = gFormatOpts
                  ? gFormatOpts.tableCellFormatMethod
                  : null;
                cellLabel = tcFormatMethod
                  ? tcFormatMethod(formatParams, ...formatter.slice(1))
                  : '';
              } else {
                cellLabel = formatter(formatParams);
              }
            } else if (renderOpts && tcFormatter) {
              cellLabel = tcFormatter(renderOpts, formatParams);
            }
            if (formatData) {
              const ftValue = [
                cellValue,
                etOpSize,
                etOgSize,
                clOpSize,
                clOgSize,
              ];
              formatData[colid] = { value: ftValue, label: cellLabel };
            }
          }
        }
        return cellLabel;
      },
      updateCellLabel(row, fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (!column) {
          return null;
        }
        const { fullAllDataRowIdData } = internalData;
        const rowid = getRowid($asTable, row);
        if (rowid) {
          const colid = column.id;
          const rowid = getRowid($asTable, row);
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            const formatData = rowRest.formatData;
            if (formatData) {
              delete formatData[colid];
            }
          }
        }
        return $asTable.getFooterCellLabel(row, column);
      },
      clearFormatterCache(isUpdate) {
        const { tableData, tableColumn } = reactData;
        const { fullAllDataRowIdData } = internalData;
        each(
          fullAllDataRowIdData,
          (rowRest: AsTableDefines.FooterRowCacheItem) => {
            if (rowRest.formatData) {
              rowRest.formatData = undefined;
            }
          },
        );
        if (isUpdate) {
          tableData.forEach((row) => {
            tableColumn.forEach((column) => {
              $asTable.getCellLabel(row, column);
            });
          });
        }
        return nextTick();
      },
      getHeaderCellLabel(fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (!column) {
          return null;
        }
        const { headerFormatter } = column;
        const _columnIndex = $asTable.getVTColumnIndex(column);
        let cellLabel = column.getTitle();

        if (headerFormatter) {
          const { headerFullDataColData } = internalData;
          const colid = column.id;
          let colRest = headerFullDataColData[colid];
          if (!colRest) {
            colRest = headerFullDataColData[colid] = {};
          }
          const formatObj = colRest.formatObj;
          if (formatObj && formatObj.value === cellLabel) {
            return formatObj.label;
          }
          const headFormatParams = {
            $table: $asTable,
            cellTitle: cellLabel,
            cellValue: cellLabel,
            column,
            _columnIndex,
            columnIndex: $asTable.getColumnIndex(column),
          };

          if (isString(headerFormatter)) {
            const gFormatOpts = formats.get(headerFormatter);
            const fcFormatMethod = gFormatOpts
              ? gFormatOpts.tableHeaderCellFormatMethod
              : null;
            cellLabel = toValueString(
              fcFormatMethod ? fcFormatMethod(headFormatParams) : '',
            );
          } else if (isArray(headerFormatter)) {
            const gFormatOpts = formats.get(headerFormatter[0]);
            const fcFormatMethod = gFormatOpts
              ? gFormatOpts.tableHeaderCellFormatMethod
              : null;
            cellLabel = toValueString(
              fcFormatMethod
                ? fcFormatMethod(headFormatParams, ...headerFormatter.slice(1))
                : '',
            );
          } else {
            cellLabel = toValueString(headerFormatter(headFormatParams));
          }
        }

        return cellLabel;
      },
      updateHeaderCellLabel(fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (!column) {
          return '';
        }
        const { headerFullDataColData } = internalData;
        const colid = column.id;
        const colRest = headerFullDataColData[colid];
        if (colRest) {
          colRest.formatObj = undefined;
        }
        return $asTable.getHeaderCellLabel(column);
      },
      clearHeaderFormatterCache(isUpdate) {
        const { tableColumn } = reactData;
        const { headerFullDataColData } = internalData;
        each(
          headerFullDataColData,
          (colRest: AsTableDefines.HeaderColCacheItem) => {
            if (colRest.formatObj) {
              colRest.formatObj = undefined;
            }
          },
        );
        if (isUpdate) {
          tableColumn.forEach((column) => {
            $asTable.getHeaderCellLabel(column);
          });
        }
        return nextTick();
      },

      getFooterCellLabel(row, fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (!column) {
          return null;
        }
        const { footerFormatter } = column;
        const _columnIndex = $asTable.getVTColumnIndex(column);
        let itemValue = isArray(row)
          ? row[_columnIndex]
          : get(row, column.field);
        let cellLabel: any = itemValue;
        if (footerFormatter) {
          let formatData:
            | Record<string, AsTableDefines.RowCacheFormatObj>
            | undefined;
          const { footerTableData } = reactData;
          const { footerFullDataRowData } = internalData;
          const colid = column.id;
          const $rowIndex = footerTableData.indexOf(row);

          let rowRest: any = null;
          if ($rowIndex !== -1) {
            rowRest = footerFullDataRowData[$rowIndex];
            if (!rowRest) {
              rowRest = footerFullDataRowData[$rowIndex] = {};
            }
            formatData = rowRest.formatData;
            if (!formatData) {
              formatData = footerFullDataRowData[$rowIndex]!.formatData = {};
            }
            if (
              rowRest &&
              formatData[colid] &&
              formatData[colid].value === itemValue
            ) {
              return formatData[colid].label;
            }
          }
          const footerFormatParams = {
            $table: $asTable,
            cellValue: itemValue,
            itemValue,
            row,
            items: row,
            $rowIndex,
            column,
            _columnIndex,
            columnIndex: $asTable.getColumnIndex(column),
          };
          if (isString(footerFormatter)) {
            const gFormatOpts = formats.get(footerFormatter);
            const fcFormatMethod = gFormatOpts
              ? gFormatOpts.tableFooterCellFormatMethod
              : null;
            cellLabel = fcFormatMethod
              ? fcFormatMethod(footerFormatParams)
              : '';
          } else if (isArray(footerFormatter)) {
            const gFormatOpts = formats.get(footerFormatter[0]);
            const fcFormatMethod = gFormatOpts
              ? gFormatOpts.tableFooterCellFormatMethod
              : null;
            cellLabel = fcFormatMethod
              ? fcFormatMethod(footerFormatParams, ...footerFormatter.slice(1))
              : '';
          } else {
            cellLabel = footerFormatter(footerFormatParams);
          }
          if (formatData) {
            formatData[colid] = { value: itemValue, label: cellLabel };
          }
        }
        return cellLabel;
      },
      updateFooterCellLabel(row, fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (!column) {
          return null;
        }
        const { footerTableData } = reactData;
        const { footerFullDataRowData } = internalData;
        const colid = column.id;
        const $rowIndex = footerTableData.indexOf(row);
        const rowRest = footerFullDataRowData[$rowIndex];
        if (rowRest) {
          const formatData = rowRest.formatData;
          if (formatData) {
            delete formatData[colid];
          }
        }
        return $asTable.getFooterCellLabel(row, column);
      },
      clearFooterFormatterCache(isUpdate) {
        const { tableData, tableColumn } = reactData;
        const { footerFullDataRowData } = internalData;
        each(
          footerFullDataRowData,
          (rowRest: AsTableDefines.FooterRowCacheItem) => {
            if (rowRest.formatData) {
              rowRest.formatData = undefined;
            }
          },
        );
        if (isUpdate) {
          tableData.forEach((row) => {
            tableColumn.forEach((column) => {
              $asTable.getFooterCellLabel(row, column);
            });
          });
        }
        return nextTick();
      },

      /**
       * 检查是否为临时行数据
       */
      isInsertByRow(row) {
        const rowid = getRowid($asTable, row);
        return !!reactData.insertRowFlag && !!internalData.insertRowMaps[rowid];
      },
      isRemoveByRow(row) {
        const rowid = getRowid($asTable, row);
        return !!reactData.removeRowFlag && !!internalData.removeRowMaps[rowid];
      },
      /**
       * 删除所有新增的临时数据
       */
      removeInsertRow() {
        const { insertRowMaps } = internalData;
        return $asTable.remove(values(insertRowMaps));
      },
      /**
       * 只对 keep-source 开启有效，判断行数据是否发生改变
       * @param row 指定行
       * @param field 指定字段
       */
      isUpdateByRow(rowidOrRow, field) {
        const { keepSource } = props;
        const { fullDataRowIdData, sourceDataRowIdData } = internalData;
        const keepFields = computeKeepFields.value;
        if (keepSource) {
          const rowid =
            isString(rowidOrRow) || isNumber(rowidOrRow)
              ? rowidOrRow
              : getRowid($asTable, rowidOrRow);
          const rowRest = fullDataRowIdData[rowid];
          // 新增的数据不需要检测
          if (!rowRest) {
            return false;
          }
          const row = rowRest.row;
          const oRow = sourceDataRowIdData[rowid];
          if (!oRow) {
            return false;
          }
          if (arguments.length > 1) {
            return !eqCellValue(row, oRow, field as string).result;
          }
          for (const keepField of keepFields) {
            if (!eqCellValue(row, oRow, keepField).result) {
              return true;
            }
          }
        }
        return false;
      },
      getUpdateCells() {
        const { keepSource, treeConfig } = props;
        const {
          tableFullData,
          tableFullTreeData,
          fullDataRowIdData,
          sourceDataRowIdData,
          fullColumnFieldData,
        } = internalData;
        const treeOpts: any = computeTreeOpts.value;
        const keepFields = computeKeepFields.value;
        const cellList: AsTableDefines.UpdateCellObj[] = [];
        if (keepSource) {
          const { handleGetRowId } = createHandleGetRowId($asTable);
          const handleCell = (item: any) => {
            const rowid = handleGetRowId(item);
            const rowRest = fullDataRowIdData[rowid];
            // 新增的数据不需要检测
            if (!rowRest) {
              return;
            }
            const row = rowRest.row;
            const oRow = sourceDataRowIdData[rowid];
            if (!oRow) {
              return;
            }
            for (const field of keepFields) {
              const { result, newValue, oldValue } = eqCellValue(
                row,
                oRow,
                field,
              );
              if (!result) {
                const column = fullColumnFieldData[field]
                  ? fullColumnFieldData[field].column
                  : null;
                cellList.push({
                  row,
                  rowid,
                  column,
                  field,
                  newValue,
                  oldValue,
                });
              }
            }
          };
          if (treeConfig) {
            eachTree(tableFullTreeData, handleCell, treeOpts);
          } else {
            tableFullData.forEach(handleCell);
          }
        }
        return cellList;
      },
      /**
       * 获取表格的可视列，也可以指定索引获取列
       * @param {Number} columnIndex 索引
       */
      getColumns(columnIndex?: number): any {
        const { visibleColumn } = internalData;
        return isUndefined(columnIndex)
          ? visibleColumn.slice(0)
          : visibleColumn[columnIndex];
      },
      /**
       * 根据列获取列的唯一主键
       */
      getColid(fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        return column ? column.id : null;
      },
      /**
       * 根据列的唯一主键获取列
       * @param {String} colid 列主键
       */
      getColumnById(colid) {
        const { fullColumnIdData } = internalData;
        return colid && fullColumnIdData[colid]
          ? fullColumnIdData[colid].column
          : null;
      },
      /**
       * 根据列的字段名获取列
       * @param {String} field 字段名
       */
      getColumnByField(field) {
        const fullColumnFieldData = internalData.fullColumnFieldData;
        return field && fullColumnFieldData[field]
          ? fullColumnFieldData[field].column
          : null;
      },
      getParentColumn(fieldOrColumn) {
        const { fullColumnIdData } = internalData;
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        return column && column.parentId && fullColumnIdData[column.parentId]
          ? fullColumnIdData[column.parentId]!.column
          : null;
      },
      /**
       * 获取当前表格的列
       * 收集到的全量列、全量表头列、处理条件之后的全量表头列、当前渲染中的表头列
       */
      getTableColumn() {
        return {
          collectColumn: internalData.collectColumn.slice(0),
          fullColumn: internalData.tableFullColumn.slice(0),
          visibleColumn: internalData.visibleColumn.slice(0),
          tableColumn: reactData.tableColumn.slice(0),
        };
      },
      /**
       * 移动列到指定列的位置
       * @param fieldOrColumn
       * @param targetFieldOrColumn
       * @param options
       */
      moveColumnTo(fieldOrColumn, targetFieldOrColumn, options) {
        const { fullColumnIdData, visibleColumn } = internalData;
        const { dragToChild, dragPos, isCrossDrag } = Object.assign(
          {},
          options,
        );
        const dragCol = handleFieldOrColumn($asTable, fieldOrColumn);
        let prevDragCol: AsTableDefines.ColumnInfo | null = null;
        const colRest = dragCol ? fullColumnIdData[dragCol.id] : null;
        let defPos: 'left' | 'right' = 'left';
        if (isNumber(targetFieldOrColumn)) {
          if (colRest && targetFieldOrColumn) {
            let currList = colRest.items;
            let offsetIndex = colRest._index + targetFieldOrColumn;
            if (isCrossDrag) {
              currList = visibleColumn;
              offsetIndex = colRest._index + targetFieldOrColumn;
            }
            if (offsetIndex > 0 && offsetIndex < currList.length - 1) {
              prevDragCol = currList[offsetIndex] as any;
            }
            if (targetFieldOrColumn > 0) {
              defPos = 'right';
            }
          }
        } else {
          prevDragCol = handleFieldOrColumn($asTable, targetFieldOrColumn);
          const targetColRest = prevDragCol
            ? fullColumnIdData[prevDragCol.id]
            : null;
          if (
            colRest &&
            targetColRest &&
            targetColRest._index > colRest._index
          ) {
            defPos = 'right';
          }
        }
        return $asTable.handleColDragSwapEvent(
          null,
          true,
          dragCol,
          prevDragCol,
          dragPos || defPos,
          dragToChild === true,
        );
      },
      /**
       * 移动行到指定行的位置
       * @param rowidOrRow
       * @param targetRowidOrRow
       * @param options
       */
      moveRowTo(rowidOrRow, targetRowidOrRow, options) {
        const { treeConfig } = props;
        const { fullAllDataRowIdData, afterFullData } = internalData;
        const { dragToChild, dragPos, isCrossDrag } = Object.assign(
          {},
          options,
        );
        const treeOpts = computeTreeOpts.value;
        const dragRow = handleRowidOrRow($asTable, rowidOrRow);
        let prevDragRow: any = null;
        let defPos: 'bottom' | 'top' = 'top';
        const rowRest = dragRow
          ? fullAllDataRowIdData[getRowid($asTable, dragRow)]
          : null;
        if (isNumber(targetRowidOrRow)) {
          if (rowRest && targetRowidOrRow) {
            let currList = afterFullData;
            let offsetIndex = rowRest._index + targetRowidOrRow;
            if (treeConfig) {
              currList = rowRest.items;
              if (treeOpts.transform) {
                offsetIndex = rowRest.treeIndex + targetRowidOrRow;
                if (isCrossDrag) {
                  currList = afterFullData;
                  offsetIndex = rowRest._index + targetRowidOrRow;
                }
              }
            }
            if (offsetIndex >= 0 && offsetIndex <= currList.length - 1) {
              prevDragRow = currList[offsetIndex];
            }
            if (targetRowidOrRow > 0) {
              defPos = 'bottom';
            }
          }
        } else {
          prevDragRow = handleRowidOrRow($asTable, targetRowidOrRow);
          const targetRowRest = prevDragRow
            ? fullAllDataRowIdData[getRowid($asTable, prevDragRow)]
            : null;
          if (
            rowRest &&
            targetRowRest &&
            targetRowRest._index > rowRest._index
          ) {
            defPos = 'bottom';
          }
        }
        const rest = $asTable.handleRowDragSwapEvent(
          null,
          true,
          dragRow,
          prevDragRow,
          dragPos || defPos,
          dragToChild === true,
        );
        return rest;
      },
      /**
       * 获取表格的全量列
       */
      getFullColumns() {
        const { collectColumn } = internalData;
        return collectColumn.slice(0);
      },
      /**
       * 获取数据，和 data 的行为一致，也可以指定索引获取数据
       */
      getData(rowIndex?: number) {
        const tableSynchData = props.data || internalData.tableSynchData;
        return isUndefined(rowIndex)
          ? tableSynchData.slice(0)
          : tableSynchData[rowIndex];
      },
      /**
       * 用于多选行，获取已选中的数据
       */
      getCheckboxRecords(isFull) {
        const { treeConfig } = props;
        const { updateCheckboxFlag } = reactData;
        const {
          tableFullData,
          afterFullData,
          tableFullTreeData,
          fullDataRowIdData,
          afterFullRowMaps,
          selectCheckboxMaps,
        } = internalData;
        const treeOpts = computeTreeOpts.value;
        const checkboxOpts = computeCheckboxOpts.value;
        const { transform, mapChildrenField } = treeOpts;
        const { checkField } = checkboxOpts;
        const childrenField = treeOpts.childrenField;
        let rowList: any[] = [];
        if (updateCheckboxFlag) {
          if (checkField) {
            if (treeConfig) {
              // 如果开启 transform 默认就是完整数据
              const currTableData = isFull
                ? transform
                  ? tableFullTreeData
                  : tableFullData
                : transform
                  ? tableFullTreeData
                  : afterFullData;
              rowList = filterTree(
                currTableData,
                (row) => get(row, checkField),
                { children: transform ? mapChildrenField : childrenField },
              );
            } else {
              const currTableData = isFull ? tableFullData : afterFullData;
              rowList = currTableData.filter((row) => get(row, checkField));
            }
          } else {
            const currMaps =
              isFull || (treeConfig && !transform)
                ? fullDataRowIdData
                : afterFullRowMaps;
            each(selectCheckboxMaps, (row, rowid) => {
              if (currMaps[rowid]) {
                rowList.push(fullDataRowIdData[rowid]!.row);
              }
            });
          }
        }
        return rowList;
      },
      /**
       * 只对 tree-config 有效，获取行的子级
       */
      getTreeRowChildren(rowOrRowid) {
        const { treeConfig } = props;
        const { fullAllDataRowIdData } = internalData;
        const treeOpts = computeTreeOpts.value;
        const { transform, mapChildrenField } = treeOpts;
        const childrenField = treeOpts.childrenField;
        if (rowOrRowid && treeConfig) {
          let rowid;
          rowid = isString(rowOrRowid)
            ? rowOrRowid
            : getRowid($asTable, rowOrRowid);
          if (rowid) {
            const rest = fullAllDataRowIdData[rowid];
            const row = rest ? rest.row : null;
            if (row) {
              return row[transform ? mapChildrenField : childrenField] || [];
            }
          }
        }
        return [];
      },
      /**
       * 只对 tree-config 有效，用于树形结构，获取指定行的层级
       */
      getTreeRowLevel(rowOrRowid) {
        const { treeConfig } = props;
        const { fullAllDataRowIdData } = internalData;
        if (rowOrRowid && treeConfig) {
          let rowid;
          rowid = isString(rowOrRowid)
            ? rowOrRowid
            : getRowid($asTable, rowOrRowid);
          if (rowid) {
            const rest = fullAllDataRowIdData[rowid];
            if (rest) {
              return rest.level;
            }
          }
        }
        return -1;
      },
      /**
       * 只对 tree-config 有效，获取行的父级
       */
      getTreeParentRow(rowOrRowid) {
        const { treeConfig } = props;
        const { fullAllDataRowIdData } = internalData;
        if (rowOrRowid && treeConfig) {
          let rowid;
          rowid = isString(rowOrRowid)
            ? rowOrRowid
            : getRowid($asTable, rowOrRowid);
          if (rowid) {
            const rest = fullAllDataRowIdData[rowid];
            if (rest) {
              return rest.parent;
            }
          }
        }
        return null;
      },
      getParentRow(rowOrRowid) {
        log.warn('delFunc', ['getParentRow', 'getTreeParentRow']);
        return $asTable.getTreeParentRow(rowOrRowid);
      },
      /**
       * 根据行的唯一主键获取行
       * @param {String/Number} rowid 行主键
       */
      getRowById(cellValue) {
        const { fullAllDataRowIdData } = internalData;
        const rowid = eqNull(cellValue)
          ? ''
          : encodeURIComponent(cellValue || '');
        return fullAllDataRowIdData[rowid]
          ? fullAllDataRowIdData[rowid].row
          : null;
      },
      /**
       * 根据行获取行的唯一主键
       * @param {Row} row 行对象
       */
      getRowid(row) {
        return getRowid($asTable, row);
      },
      /**
       * 获取处理后的表格数据
       * 如果存在筛选条件，继续处理
       * 如果存在排序，继续处理
       */
      getTableData() {
        const { tableData, footerTableData } = reactData;
        const { tableFullData, afterFullData, tableFullTreeData } =
          internalData;
        return {
          fullData: props.treeConfig
            ? tableFullTreeData.slice(0)
            : tableFullData.slice(0),
          visibleData: afterFullData.slice(0),
          tableData: tableData.slice(0),
          footerData: footerTableData.slice(0),
        };
      },
      /**
       * 获取表格的全量数据，如果是 tree-config 则返回带层级的树结构
       */
      getFullData() {
        const { treeConfig } = props;
        const { tableFullData, tableFullTreeData } = internalData;
        if (treeConfig) {
          return tableFullTreeData.slice(0);
        }
        return tableFullData.slice(0);
      },
      /**
       * 设置为固定列
       */
      setColumnFixed(fieldOrColumn, fixed) {
        let status = false;
        const cols = isArray(fieldOrColumn) ? fieldOrColumn : [fieldOrColumn];
        const columnOpts = computeColumnOpts.value;
        const isMaxFixedColumn = computeIsMaxFixedColumn.value;
        for (const item of cols) {
          const column = handleFieldOrColumn($asTable, item);
          const targetColumn = getRootColumn($asTable, column as any);
          if (targetColumn && targetColumn.fixed !== fixed) {
            // 是否超过最大固定列数量
            if (!targetColumn.fixed && isMaxFixedColumn) {
              message.error(
                formatLocaleText(
                  locale?.value.maxFixedCol,
                  columnOpts.maxFixedSize,
                ),
              );
              return nextTick();
            }
            eachTree([targetColumn], (column) => {
              column.fixed = fixed;
              column.renderFixed = fixed;
            });
            $asTable.saveCustomStore('update:fixed');
            if (!status) {
              status = true;
            }
          }
        }
        if (status) {
          return $asTable.refreshColumn();
        }
        return nextTick();
      },
      /**
       * 取消指定固定列
       */
      clearColumnFixed(fieldOrColumn) {
        let status = false;
        const cols = isArray(fieldOrColumn) ? fieldOrColumn : [fieldOrColumn];
        cols.forEach((item) => {
          const column = handleFieldOrColumn($asTable, item);
          const targetColumn = getRootColumn($asTable, column as any);
          if (targetColumn && targetColumn.fixed) {
            eachTree([targetColumn], (column) => {
              column.fixed = null;
              column.renderFixed = null;
            });
            $asTable.saveCustomStore('update:fixed');
            if (!status) {
              status = true;
            }
          }
        });
        if (status) {
          return $asTable.refreshColumn();
        }
        return nextTick();
      },
      /**
       * 隐藏指定列
       */
      hideColumn: handleColumnVisible(false),
      /**
       * 显示指定列
       */
      showColumn: handleColumnVisible(true),
      setColumnWidth(fieldOrColumn, width) {
        const { elemStore } = internalData;
        let status = false;
        const cols = isArray(fieldOrColumn) ? fieldOrColumn : [fieldOrColumn];
        let cWidth = toInteger(width);
        if (isScale(width)) {
          const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
          const bodyWidth = bodyScrollElem ? bodyScrollElem.clientWidth - 1 : 0;
          cWidth = Math.floor(cWidth * bodyWidth);
        }
        if (cWidth) {
          cols.forEach((item) => {
            const column = handleFieldOrColumn($asTable, item);
            if (column) {
              column.resizeWidth = cWidth;
              if (!status) {
                status = true;
              }
            }
          });
          if (status) {
            return $asTable.refreshColumn().then(() => {
              return { status };
            });
          }
        }
        return nextTick().then(() => {
          return { status };
        });
      },
      getColumnWidth(fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (column) {
          return column.renderWidth;
        }
        return 0;
      },
      /**
       * 手动重置列的显示隐藏、列宽拖动的状态、固定列、排序列；
       * 如果为 true 则重置所有状态
       * 如果已关联工具栏，则会同步更新
       */
      resetColumn(options) {
        log.warn('delFunc', ['resetColumn', 'resetCustom']);
        return $asTable.resetCustom(options);
      },
      /**
       * 刷新列信息
       * 将固定的列左边、右边分别靠边
       * 如果传 true 则会检查列顺序并排序
       */
      refreshColumn(initSort) {
        if (initSort) {
          handleUpdateColumn();
        }
        return parseColumns(true)
          .then(() => {
            return $asTable.refreshScroll();
          })
          .then(() => {
            return handleLazyRecalculate(false, true, true);
          });
      },
      setRowHeightConf(heightConf) {
        const { fullAllDataRowIdData } = internalData;
        let status = false;
        if (heightConf) {
          each(heightConf, (height, rowid) => {
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              const rHeight = toInteger(height);
              if (rHeight) {
                rowRest.resizeHeight = rHeight;
                if (!status) {
                  status = true;
                }
              }
            }
          });
          if (status) {
            internalData.isResizeCellHeight = true;
            reactData.resizeHeightFlag++;
          }
        }
        return nextTick().then(() => {
          updateRowOffsetTop();
          return { status };
        });
      },
      getRowHeightConf(isFull) {
        const { fullAllDataRowIdData, afterFullData } = internalData;
        const { handleGetRowId } = createHandleGetRowId($asTable);
        const cellOpts = computeCellOpts.value;
        const defaultRowHeight = computeDefaultRowHeight.value;
        const rest: Record<string, number> = {};
        afterFullData.forEach((row) => {
          const rowid = handleGetRowId(row);
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            const resizeHeight = rowRest.resizeHeight;
            if (resizeHeight || isFull) {
              const currCellHeight = getCellRestHeight(
                rowRest,
                cellOpts,
                defaultRowHeight,
              );
              rest[rowid] = currCellHeight;
            }
          }
        });
        return rest;
      },
      recalcRowHeight(rowOrId) {
        const { fullAllDataRowIdData } = internalData;
        const rows = isArray(rowOrId) ? rowOrId : [rowOrId];
        const el = refElem.value;
        if (el) {
          const { handleGetRowId } = createHandleGetRowId($asTable);
          el.dataset.calcRow = 'Y';
          rows.forEach((row) => {
            const rowid =
              isString(row) || isNumber(row) ? row : handleGetRowId(row);
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              rowRest.resizeHeight = calcCellAutoHeight(rowid, rowRest, el);
            }
            delete el.dataset.calcRow;
          });
          reactData.calcCellHeightFlag++;
        }
        return nextTick();
      },
      setRowHeight(rowOrId, height) {
        const { fullAllDataRowIdData } = internalData;
        let status = false;
        const rows = isArray(rowOrId) ? rowOrId : [rowOrId];
        let rHeight = toInteger(height);
        if (isScale(height)) {
          const tableBody = refTableBody.value;
          const bodyElem = tableBody ? (tableBody.$el as HTMLDivElement) : null;
          const bodyHeight = bodyElem ? bodyElem.clientHeight - 1 : 0;
          rHeight = Math.floor(rHeight * bodyHeight);
        }
        if (rHeight) {
          const { handleGetRowId } = createHandleGetRowId($asTable);
          rows.forEach((row) => {
            const rowid =
              isString(row) || isNumber(row) ? row : handleGetRowId(row);
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              rowRest.resizeHeight = rHeight;
              if (!status) {
                status = true;
              }
            }
          });
          if (status) {
            internalData.isResizeCellHeight = true;
            reactData.resizeHeightFlag++;
          }
        }
        return nextTick().then(() => {
          return { status };
        });
      },
      getRowHeight(rowOrId) {
        const { fullAllDataRowIdData } = internalData;
        const cellOpts = computeCellOpts.value;
        const defaultRowHeight = computeDefaultRowHeight.value;
        const rowid =
          isString(rowOrId) || isNumber(rowOrId)
            ? rowOrId
            : getRowid($asTable, rowOrId);
        const rowRest = fullAllDataRowIdData[rowid];
        if (rowRest) {
          return getCellRestHeight(rowRest, cellOpts, defaultRowHeight);
        }
        return 0;
      },
      /**
       * 刷新滚动操作，手动同步滚动相关位置（对于某些特殊的操作，比如滚动条错位、固定列不同步）
       */
      refreshScroll() {
        const { elemStore, lastScrollLeft, lastScrollTop } = internalData;
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
        const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
        const xHandleEl = refScrollXHandleElem.value;
        const yHandleEl = refScrollYHandleElem.value;
        return new Promise<void>((resolve) => {
          // 还原滚动条位置
          if (lastScrollLeft || lastScrollTop) {
            return restoreScrollLocation(
              $asTable,
              lastScrollLeft,
              lastScrollTop,
            ).then(() => {
              // 存在滚动行为未结束情况
              setTimeout(resolve, 10);
            });
          }
          internalData.intoRunScroll = true;
          // 重置
          setScrollTop(yHandleEl, lastScrollTop);
          setScrollTop(bodyScrollElem, lastScrollTop);
          setScrollTop(leftScrollElem, lastScrollTop);
          setScrollTop(rightScrollElem, lastScrollTop);

          setScrollLeft(xHandleEl, lastScrollLeft);
          setScrollLeft(bodyScrollElem, lastScrollLeft);
          setScrollLeft(headerScrollElem, lastScrollLeft);
          setScrollLeft(footerScrollElem, lastScrollLeft);
          // 存在滚动行为未结束情况
          setTimeout(() => {
            internalData.intoRunScroll = false;
            resolve();
          }, 10);
        });
      },
      /**
       * 重新渲染布局
       * 刷新布局
       */
      recalculate(reFull?: boolean) {
        const isForce = !!reFull;
        return handleLazyRecalculate(isForce, isForce, isForce);
      },
      openTooltip(target, content) {
        const $commTip = refCommTooltip.value;
        if ($commTip && $commTip.open) {
          return $commTip.open(target, content);
        }
        return nextTick();
      },
      /**
       * 关闭 tooltip
       */
      closeTooltip() {
        const { tooltipStore } = reactData;
        const $tooltip = refTooltip.value;
        const $commTip = refCommTooltip.value;
        if (tooltipStore.visible) {
          Object.assign(tooltipStore, {
            row: null,
            column: null,
            content: null,
            visible: false,
            type: null,
            currOpts: {},
          });
          if ($tooltip && $tooltip.close) {
            $tooltip.close();
          }
        }
        if ($commTip && $commTip.close) {
          $commTip.close();
        }
        return nextTick();
      },
      /**
       * 判断列头复选框是否被选中
       */
      isAllCheckboxChecked() {
        return reactData.isAllSelected;
      },
      /**
       * 判断列头复选框是否被半选
       */
      isAllCheckboxIndeterminate() {
        return !reactData.isAllSelected && reactData.isIndeterminate;
      },
      /**
       * 获取复选框半选状态的行数据
       */
      getCheckboxIndeterminateRecords(isFull) {
        const { treeConfig } = props;
        const { fullDataRowIdData, treeIndeterminateRowMaps } = internalData;
        if (treeConfig) {
          const fullRest: any[] = [];
          const defRest: any[] = [];
          each(treeIndeterminateRowMaps, (item, rowid) => {
            if (!item) {
              return;
            }

            fullRest.push(item);
            if (fullDataRowIdData[rowid]) {
              defRest.push(item);
            }
          });
          if (isFull) {
            return fullRest;
          }
          return defRest;
        }
        return [];
      },
      /**
       * 用于多选行，设置行为选中状态，第二个参数为选中与否
       * @param {Array/Row} rows 行数据
       * @param {Boolean} value 是否选中
       */
      setCheckboxRow(rows, checked) {
        if (rows && !isArray(rows)) {
          rows = [rows];
        }
        return handleCheckedCheckboxRow(rows, checked, true);
      },
      setCheckboxRowByKey(keys: any, checked) {
        const { fullAllDataRowIdData } = internalData;
        if (!isArray(keys)) {
          keys = [keys];
        }
        const rows: any = [];
        keys.forEach((rowKey: string) => {
          const rowid = encodeRowid(rowKey);
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            rows.push(rowRest.row);
          }
        });
        return handleCheckedCheckboxRow(rows, checked, true);
      },
      setCheckboxRowKey(keys, checked) {
        return $asTable.setCheckboxRowByKey(keys, checked);
      },
      isCheckedByCheckboxRow(row) {
        const { updateCheckboxFlag } = reactData;
        const { selectCheckboxMaps } = internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField } = checkboxOpts;
        if (checkField) {
          return get(row, checkField);
        }
        return (
          !!updateCheckboxFlag && !!selectCheckboxMaps[getRowid($asTable, row)]
        );
      },
      isCheckedByCheckboxRowKey(rowKey: any) {
        const { updateCheckboxFlag } = reactData;
        const { fullAllDataRowIdData, selectCheckboxMaps } = internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField } = checkboxOpts;
        const rowid = encodeRowid(rowKey);
        if (checkField) {
          const rowRest = fullAllDataRowIdData[rowid];
          if (rowRest) {
            return get(rowRest.row, checkField);
          }
          return false;
        }
        return !!updateCheckboxFlag && !!selectCheckboxMaps[rowid];
      },
      isIndeterminateByCheckboxRow(row) {
        const { treeIndeterminateRowMaps } = internalData;
        return (
          !!treeIndeterminateRowMaps[getRowid($asTable, row)] &&
          !$asTable.isCheckedByCheckboxRow(row)
        );
      },
      isIndeterminateByCheckboxRowKey(rowKey: any) {
        const { treeIndeterminateRowMaps } = internalData;
        const rowid = encodeRowid(rowKey);
        return (
          !!treeIndeterminateRowMaps[rowid] &&
          !$asTable.isCheckedByCheckboxRowKey(rowid)
        );
      },
      /**
       * 多选，切换某一行的选中状态
       */
      toggleCheckboxRow(row) {
        const { selectCheckboxMaps } = internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField } = checkboxOpts;
        const checked = checkField
          ? !get(row, checkField)
          : !selectCheckboxMaps[getRowid($asTable, row)];
        $asTable.handleBatchSelectRows([row], checked, true);
        $asTable.checkSelectionStatus();
        return nextTick();
      },
      /**
       * 用于多选行，设置所有行的选中状态
       * @param {Boolean} value 是否选中
       */
      setAllCheckboxRow(value) {
        return handleCheckedAllCheckboxRow(value, true);
      },
      /**
       * 获取单选框保留选中的行
       */
      getRadioReserveRecord(isFull) {
        const { treeConfig } = props;
        const { fullDataRowIdData, radioReserveRow, afterFullData } =
          internalData;
        const radioOpts = computeRadioOpts.value;
        const treeOpts = computeTreeOpts.value;
        const childrenField = treeOpts.childrenField;
        if (radioOpts.reserve && radioReserveRow) {
          const rowid = getRowid($asTable, radioReserveRow);
          if (isFull) {
            if (!fullDataRowIdData[rowid]) {
              return radioReserveRow;
            }
          } else {
            const rowkey = getRowkey($asTable);
            if (treeConfig) {
              const matchObj = findTree(
                afterFullData,
                (row) => rowid === get(row, rowkey),
                { children: childrenField },
              );
              if (matchObj) {
                return radioReserveRow;
              }
            } else {
              if (afterFullData.every((row) => rowid !== get(row, rowkey))) {
                return radioReserveRow;
              }
            }
          }
        }
        return null;
      },
      clearRadioReserve() {
        internalData.radioReserveRow = null;
        return nextTick();
      },
      /**
       * 获取复选框保留选中的行
       */
      getCheckboxReserveRecords(isFull) {
        const { treeConfig } = props;
        const { afterFullData, fullDataRowIdData, checkboxReserveRowMap } =
          internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const treeOpts = computeTreeOpts.value;
        const childrenField = treeOpts.childrenField;
        const reserveSelection: any[] = [];
        if (checkboxOpts.reserve) {
          const { handleGetRowId } = createHandleGetRowId($asTable);
          const afterFullIdMaps: { [key: string]: number } = {};
          if (treeConfig) {
            eachTree(
              afterFullData,
              (row) => {
                afterFullIdMaps[handleGetRowId(row)] = 1;
              },
              { children: childrenField },
            );
          } else {
            afterFullData.forEach((row) => {
              afterFullIdMaps[handleGetRowId(row)] = 1;
            });
          }
          each(checkboxReserveRowMap, (oldRow, oldRowid) => {
            if (oldRow) {
              if (isFull) {
                if (!fullDataRowIdData[oldRowid]) {
                  reserveSelection.push(oldRow);
                }
              } else {
                if (!afterFullIdMaps[oldRowid]) {
                  reserveSelection.push(oldRow);
                }
              }
            }
          });
        }
        return reserveSelection;
      },
      clearCheckboxReserve() {
        internalData.checkboxReserveRowMap = {};
        return nextTick();
      },
      /**
       * 多选，切换所有行的选中状态
       */
      toggleAllCheckboxRow() {
        handleCheckAllEvent(null, !reactData.isAllSelected);
        return nextTick();
      },
      /**
       * 用于多选行，手动清空用户的选择
       * 清空行为不管是否被禁用还是保留记录，都将彻底清空选中状态
       */
      clearCheckboxRow() {
        const { treeConfig } = props;
        const { tableFullData } = internalData;
        const treeOpts = computeTreeOpts.value;
        const childrenField = treeOpts.childrenField;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField, reserve } = checkboxOpts;
        // indeterminateField 仅支持读取
        const indeterminateField = checkboxOpts.indeterminateField;
        if (checkField) {
          const handleClearChecked = (item: any) => {
            if (treeConfig && indeterminateField) {
              set(item, indeterminateField, false);
            }
            set(item, checkField, false);
          };
          if (treeConfig) {
            eachTree(tableFullData, handleClearChecked, {
              children: childrenField,
            });
          } else {
            tableFullData.forEach(handleClearChecked);
          }
        }
        if (reserve) {
          tableFullData.forEach((row) => handleCheckboxReserveRow(row, false));
        }
        reactData.isAllSelected = false;
        reactData.isIndeterminate = false;
        internalData.selectCheckboxMaps = {};
        internalData.treeIndeterminateRowMaps = {};
        reactData.updateCheckboxFlag++;
        return nextTick();
      },
      /**
       * 用于当前行，设置某一行为高亮状态
       * @param {Row} row 行对象
       */
      setCurrentRow(row) {
        // const $xeGanttView = internalData.xeGanttView;
        const rowOpts = computeRowOpts.value;
        const el = refElem.value;
        $asTable.clearCurrentRow();
        internalData.currentRow = row;
        if (rowOpts.isCurrent && el) {
          const rowId = getRowid($asTable, row);
          const escapedRowId = CSS.escape(rowId);
          const selector = `[rowid="${escapedRowId}"]`;
          arrayEach(el.querySelectorAll(selector), (elem) =>
            addClass(elem, 'row--current'),
          );
        }
        // TODO if ($xeGanttView && $xeGanttView.handleUpdateCurrentRow) {
        //   $xeGanttView.handleUpdateCurrentRow(row);
        // }
        return nextTick();
      },
      isCheckedByRadioRow(row) {
        const { selectRadioRow } = reactData;
        if (row && selectRadioRow) {
          return $asTable.eqRow(selectRadioRow, row);
        }
        return false;
      },
      isCheckedByRadioRowKey(key) {
        const { selectRadioRow } = reactData;
        if (selectRadioRow) {
          return key === getRowid($asTable, selectRadioRow);
        }
        return false;
      },
      /**
       * 用于单选行，设置某一行为选中状态
       * @param {Row} row 行对象
       */
      setRadioRow(row) {
        return handleCheckedRadioRow(row, true);
      },
      /**
       * 用于单选行，设置某一行为选中状态
       * @param key 行主键
       */
      setRadioByRowKey(rowKey: any) {
        const { fullAllDataRowIdData } = internalData;
        const rowid = encodeRowid(rowKey);
        const rowRest = fullAllDataRowIdData[rowid];
        if (rowRest) {
          return handleCheckedRadioRow(rowRest.row, true);
        }
        return nextTick();
      },
      setRadioRowKey(rowKey) {
        return $asTable.setRadioByRowKey(rowKey);
      },
      /**
       * 用于当前行，手动清空当前高亮的状态
       */
      clearCurrentRow() {
        // const $xeGanttView = internalData.xeGanttView;
        const el = refElem.value;
        internalData.currentRow = null;
        internalData.hoverRow = null;
        if (el) {
          arrayEach(el.querySelectorAll('.row--current'), (elem) =>
            removeClass(elem, 'row--current'),
          );
        }
        // TODO if ($xeGanttView && $xeGanttView.handleUpdateCurrentRow) {
        //   $xeGanttView.handleUpdateCurrentRow();
        // }
        return nextTick();
      },
      /**
       * 用于单选行，手动清空用户的选择
       */
      clearRadioRow() {
        reactData.selectRadioRow = null;
        return nextTick();
      },
      /**
       * 用于当前行，获取当前行的数据
       */
      getCurrentRecord(isFull) {
        const { fullDataRowIdData, afterFullRowMaps, currentRow } =
          internalData;
        const rowOpts = computeRowOpts.value;
        if (rowOpts.isCurrent) {
          const rowid = getRowid($asTable, currentRow);
          if (isFull) {
            if (fullDataRowIdData[rowid]) {
              return currentRow;
            }
          } else {
            if (afterFullRowMaps[rowid]) {
              return currentRow;
            }
          }
        }
        return null;
      },
      /**
       * 用于单选行，获取当已选中的数据
       */
      getRadioRecord(isFull) {
        const { fullDataRowIdData, afterFullRowMaps } = internalData;
        const { selectRadioRow } = reactData;
        if (selectRadioRow) {
          const rowid = getRowid($asTable, selectRadioRow);
          if (isFull) {
            if (fullDataRowIdData[rowid]) {
              return selectRadioRow;
            }
          } else {
            if (afterFullRowMaps[rowid]) {
              return selectRadioRow;
            }
          }
        }
        return null;
      },
      getCurrentColumn() {
        const columnOpts = computeColumnOpts.value;
        return columnOpts.isCurrent ? internalData.currentCol : null;
      },
      /**
       * 用于当前列，设置某列行为高亮状态
       */
      setCurrentColumn(fieldOrColumn) {
        const { mouseConfig } = props;
        const mouseOpts = computeMouseOpts.value;
        const isMouseSelected = mouseConfig && mouseOpts.selected;
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (column) {
          $asTable.clearCurrentColumn();
          internalData.currentCol = column;
          reactData.currColFlag++; // 刷新当前列状态
        }
        return nextTick().then(() => {
          // 更新状选中态
          if (isMouseSelected) {
            $asTable.addCellSelectedClass();
          }
        });
      },
      /**
       * 用于当前列，手动清空当前高亮的状态
       */
      clearCurrentColumn() {
        internalData.currentCol = null;
        reactData.currColFlag++; // 刷新当前列状态
        return nextTick();
      },
      setPendingRow(rows: any | any[], status: boolean) {
        const { handleGetRowId } = createHandleGetRowId($asTable);
        const { pendingRowMaps } = internalData;
        if (rows && !isArray(rows)) {
          rows = [rows];
        }
        if (status) {
          rows.forEach((row: any) => {
            const rowid = handleGetRowId(row);
            if (rowid && !pendingRowMaps[rowid]) {
              pendingRowMaps[rowid] = row;
            }
          });
        } else {
          rows.forEach((row: any) => {
            const rowid = handleGetRowId(row);
            if (rowid && pendingRowMaps[rowid]) {
              delete pendingRowMaps[rowid];
            }
          });
        }
        reactData.pendingRowFlag++;
        return nextTick();
      },
      togglePendingRow(rows: any | any[]) {
        const { handleGetRowId } = createHandleGetRowId($asTable);
        const { pendingRowMaps } = internalData;
        if (rows && !isArray(rows)) {
          rows = [rows];
        }
        rows.forEach((row: any) => {
          const rowid = handleGetRowId(row);
          if (rowid) {
            if (pendingRowMaps[rowid]) {
              delete pendingRowMaps[rowid];
            } else {
              pendingRowMaps[rowid] = row;
            }
          }
        });
        reactData.pendingRowFlag++;
        return nextTick();
      },
      hasPendingByRow(row) {
        return $asTable.isPendingByRow(row);
      },
      isPendingByRow(row) {
        const { pendingRowMaps } = internalData;
        const rowid = getRowid($asTable, row);
        return !!pendingRowMaps[rowid];
      },
      getPendingRecords() {
        const { fullAllDataRowIdData, pendingRowMaps } = internalData;
        const insertRecords: any[] = [];
        each(pendingRowMaps, (row, rowid) => {
          if (fullAllDataRowIdData[rowid]) {
            insertRecords.push(row);
          }
        });
        return insertRecords;
      },
      clearPendingRow() {
        internalData.pendingRowMaps = {};
        reactData.pendingRowFlag++;
        return nextTick();
      },
      sort(sortConfs: any, sortOrder?: AsTablePropTypes.SortOrder) {
        const sortOpts = computeSortOpts.value;
        const { multiple, remote, orders } = sortOpts;
        if (sortConfs && isString(sortConfs)) {
          sortConfs = [{ field: sortConfs, order: sortOrder }];
        }
        if (!isArray(sortConfs)) {
          sortConfs = [sortConfs];
        }
        if (sortConfs.length > 0) {
          if (!multiple) {
            clearAllSort();
          }
          (multiple ? sortConfs : [sortConfs[0]]).forEach(
            (confs: any, index: number) => {
              let { field, order } = confs;
              const column = isString(field)
                ? $asTable.getColumnByField(field)
                : field;
              if (column && column.sortable) {
                if (orders && !orders.includes(order)) {
                  order = getNextSortOrder(column);
                }
                if (column.order !== order) {
                  column.order = order;
                }
                column.sortTime = Date.now() + index;
              }
            },
          );
          // 如果是服务端排序，则跳过本地排序处理
          if (!remote) {
            $asTable.handleTableData(true);
          }
          return nextTick().then(() => {
            updateRowOffsetTop();
            $asTable.updateCellAreas();
            return updateStyle();
          });
        }
        return nextTick();
      },
      setSort(sortConfs, isUpdate) {
        return handleSortEvent(null, sortConfs, isUpdate);
      },
      setSortByEvent(evnt, sortConfs) {
        return handleSortEvent(evnt, sortConfs, true);
      },
      /**
       * 清空指定列的排序条件
       * 如果为空则清空所有列的排序条件
       * @param {String} fieldOrColumn 列或字段名
       */
      clearSort(fieldOrColumn) {
        const sortOpts = computeSortOpts.value;
        if (fieldOrColumn) {
          const column = handleFieldOrColumn($asTable, fieldOrColumn);
          if (column) {
            column.order = null;
          }
        } else {
          clearAllSort();
        }
        if (!sortOpts.remote) {
          $asTable.handleTableData(true);
        }
        return nextTick().then(() => {
          updateRowOffsetTop();
          return updateStyle();
        });
      },
      clearSortByEvent(evnt, fieldOrColumn) {
        const { tableFullColumn } = internalData;
        const sortOpts = computeSortOpts.value;
        const { multiple } = sortOpts;
        const sortCols: AsTableDefines.ColumnInfo[] = [];
        let column: AsTableDefines.ColumnInfo<any> | null = null;
        if (evnt) {
          if (fieldOrColumn) {
            column = handleFieldOrColumn($asTable, fieldOrColumn);
            if (column) {
              column.order = null;
            }
          } else {
            tableFullColumn.forEach((column) => {
              if (!column.order) {
                return;
              }

              column.order = null;
              sortCols.push(column);
            });
          }
          if (!sortOpts.remote) {
            $asTable.handleTableData(true);
          }

          if (!multiple) {
            column = sortCols[0]!;
          }

          if (column) {
            $asTable.handleColumnSortEvent(evnt, column);
          }

          if (multiple && sortCols.length > 0) {
            const params = {
              $table: $asTable,
              $event: evnt,
              cols: sortCols,
              sortList: [],
            };
            dispatchEvent('clear-all-sort', params, evnt);
          }
        }
        return nextTick().then(() => {
          updateRowOffsetTop();
          return updateStyle();
        });
      },
      isSort(fieldOrColumn) {
        if (fieldOrColumn) {
          const column = handleFieldOrColumn($asTable, fieldOrColumn);
          return column ? column.sortable && !!column.order : false;
        }
        return $asTable.getSortColumns().length > 0;
      },
      getSortColumns() {
        const sortOpts = computeSortOpts.value;
        const { multiple, chronological } = sortOpts;
        const sortList: AsTableDefines.SortCheckedParams[] = [];
        const { tableFullColumn } = internalData;
        tableFullColumn.forEach((column) => {
          const { field, order } = column;
          if (column.sortable && order) {
            sortList.push({
              column,
              field,
              order,
              sortTime: column.sortTime,
            });
          }
        });
        if (multiple && chronological && sortList.length > 1) {
          return orderBy(sortList, 'sortTime');
        }
        return sortList;
      },
      setFilterByEvent(evnt, fieldOrColumn, options) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (column && column.filters) {
          column.filters = toFilters(options || [], column.id);
          return $asTable.handleColumnConfirmFilter(column, evnt);
        }
        return nextTick();
      },
      /**
       * 关闭筛选
       * @param {Event} evnt 事件
       */
      closeFilter() {
        const { filterStore } = reactData;
        const { column, visible } = filterStore;
        filterStore.isAllSelected = false;
        filterStore.isIndeterminate = false;
        filterStore.visible = false;
        if (visible) {
          const field = column ? column.field : null;
          dispatchEvent(
            'filter-visible',
            {
              column,
              property: field,
              field,
              filterList: () => $asTable.getCheckedFilters(),
              visible: false,
            },
            null,
          );
        }
        return nextTick();
      },
      /**
       * 判断指定列是否为筛选状态，如果为空则判断所有列
       * @param {String} fieldOrColumn 字段名
       */
      isActiveFilterByColumn(fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (column) {
          return (
            column.filters && column.filters.some((option) => option.checked)
          );
        }
        return $asTable.getCheckedFilters().length > 0;
      },
      isFilter(fieldOrColumn) {
        return $asTable.isActiveFilterByColumn(fieldOrColumn);
      },
      clearFilterByEvent(evnt, fieldOrColumn) {
        const { filterStore } = reactData;
        const { tableFullColumn } = internalData;
        const filterOpts = computeFilterOpts.value;
        const { multiple } = filterOpts;
        const filterCols: AsTableDefines.ColumnInfo[] = [];
        let column: AsTableDefines.ColumnInfo<any> | null = null;
        if (fieldOrColumn) {
          column = handleFieldOrColumn($asTable, fieldOrColumn);
          if (column) {
            $asTable.handleClearFilter(column);
          }
        } else {
          tableFullColumn.forEach((column) => {
            if (!column.filters) {
              return;
            }

            filterCols.push(column);
            $asTable.handleClearFilter(column);
          });
        }
        if (!fieldOrColumn || column !== filterStore.column) {
          Object.assign(filterStore, {
            isAllSelected: false,
            isIndeterminate: false,
            style: null,
            options: [],
            column: null,
            multiple: false, // 选项是覅多选
            visible: false,
          });
        }

        if (!filterOpts.remote) {
          $asTable.updateData();
        }

        if (!multiple) {
          column = filterCols[0] as any;
        }

        if (column) {
          const filterList = () => $asTable.getCheckedFilters();
          const values: any[] = [];
          const datas: any[] = [];
          column.filters.forEach((item: any) => {
            if (!item.checked) {
              return;
            }

            values.push(item.value);
            datas.push(item.data);
          });
          const params = {
            $table: $asTable,
            $event: evnt as Event,
            column,
            field: column.field,
            property: column.field,
            values,
            datas,
            filters: filterList,
            filterList,
          };
          $asTable.dispatchEvent('filter-change', params, evnt);
          $asTable.dispatchEvent('clear-filter', params, evnt);
        }

        if (multiple && filterCols.length > 0) {
          const params = {
            $table: $asTable,
            $event: evnt,
            cols: filterCols,
            filterList: [],
          };
          dispatchEvent('clear-all-filter', params, evnt);
        }

        return nextTick();
      },
      /**
       * 判断展开行是否懒加载完成
       * @param {Row} row 行对象
       */
      isRowExpandLoaded(row) {
        const { fullAllDataRowIdData } = internalData;
        const rowRest = fullAllDataRowIdData[getRowid($asTable, row)]!;
        return rowRest && !!rowRest.expandLoaded;
      },
      clearRowExpandLoaded(row) {
        const { fullAllDataRowIdData, rowExpandLazyLoadedMaps } = internalData;
        const expandOpts = computeExpandOpts.value;
        const { lazy } = expandOpts;
        const rowid = getRowid($asTable, row);
        const rowRest = fullAllDataRowIdData[rowid];
        if (lazy && rowRest) {
          rowRest.expandLoaded = false;
          delete rowExpandLazyLoadedMaps[rowid];
        }
        reactData.rowExpandedFlag++;
        return nextTick();
      },
      /**
       * 重新懒加载展开行，并展开内容
       * @param {Row} row 行对象
       */
      reloadRowExpand(row) {
        const { rowExpandLazyLoadedMaps } = internalData;
        const expandOpts = computeExpandOpts.value;
        const { lazy } = expandOpts;
        const rowid = getRowid($asTable, row);
        if (lazy && !rowExpandLazyLoadedMaps[rowid]) {
          $asTable
            .clearRowExpandLoaded(row)
            .then(() => handleAsyncRowExpand(row));
        }
        return nextTick();
      },
      reloadExpandContent(row) {
        log.warn('delFunc', ['reloadExpandContent', 'reloadRowExpand']);
        // 即将废弃
        return $asTable.reloadRowExpand(row);
      },
      /**
       * 切换展开行
       */
      toggleRowExpand(row) {
        return $asTable.setRowExpand(row, !$asTable.isRowExpandByRow(row));
      },
      /**
       * 设置所有行的展开与否
       * @param {Boolean} expanded 是否展开
       */
      setAllRowExpand(expanded) {
        const treeOpts = computeTreeOpts.value;
        const { tableFullData, tableFullTreeData } = internalData;
        const childrenField = treeOpts.childrenField;
        let expandedRows: any[] = [];
        if (props.treeConfig) {
          eachTree(
            tableFullTreeData,
            (row) => {
              expandedRows.push(row);
            },
            { children: childrenField },
          );
        } else {
          expandedRows = tableFullData;
        }
        return $asTable.setRowExpand(expandedRows, expanded);
      },
      /**
       * 设置展开行，二个参数设置这一行展开与否
       * 支持单行
       * 支持多行
       * @param {Array/Row} rows 行数据
       * @param {Boolean} expanded 是否展开
       */
      setRowExpand(rows, expanded) {
        const { expandColumn } = reactData;
        let { fullAllDataRowIdData, rowExpandedMaps, rowExpandLazyLoadedMaps } =
          internalData;
        const { handleGetRowId } = createHandleGetRowId($asTable);
        const expandOpts = computeExpandOpts.value;
        const { reserve, lazy, accordion, toggleMethod } = expandOpts;
        const lazyRests: any[] = [];
        const columnIndex = expandColumn
          ? $asTable.getColumnIndex(expandColumn)
          : -1;
        const $columnIndex = expandColumn
          ? $asTable.getVMColumnIndex(expandColumn)
          : -1;
        if (rows) {
          if (!isArray(rows)) {
            rows = [rows];
          }
          if (accordion) {
            // 只能同时展开一个
            rowExpandedMaps = {};
            internalData.rowExpandedMaps = rowExpandedMaps;
            rows = rows.slice(-1);
          }
          const validRows: any[] = toggleMethod
            ? rows.filter((row: any) =>
                toggleMethod({
                  $table: $asTable,
                  expanded,
                  column: expandColumn as AsTableDefines.ColumnInfo,
                  columnIndex,
                  $columnIndex,
                  row,
                  rowIndex: $asTable.getRowIndex(row),
                  $rowIndex: $asTable.getVMRowIndex(row),
                }),
              )
            : rows;
          if (expanded) {
            validRows.forEach((row) => {
              const rowid = handleGetRowId(row);
              if (!rowExpandedMaps[rowid]) {
                const rowRest = fullAllDataRowIdData[rowid];
                const isLoad =
                  lazy &&
                  !rowRest?.expandLoaded &&
                  !rowExpandLazyLoadedMaps[rowid];
                if (isLoad) {
                  lazyRests.push(handleAsyncRowExpand(row));
                } else {
                  rowExpandedMaps[rowid] = row;
                }
              }
            });
          } else {
            validRows.forEach((item) => {
              const rowid = handleGetRowId(item);
              if (rowExpandedMaps[rowid]) {
                delete rowExpandedMaps[rowid];
              }
            });
          }
          if (reserve) {
            validRows.forEach((row) => handleRowExpandReserve(row, expanded));
          }
        }
        reactData.rowExpandedFlag++;
        return Promise.all(lazyRests)
          .then(() => nextTick())
          .then(() => handleLazyRecalculate(true, true, true))
          .then(() => {
            updateRowOffsetTop();
            updateRowExpandStyle();
            handleRowExpandScroll();
            return $asTable.updateCellAreas();
          });
      },
      /**
       * 判断行是否为展开状态
       * @param {Row} row 行对象
       */
      isRowExpandByRow(row) {
        const { rowExpandedFlag } = reactData;
        const { rowExpandedMaps } = internalData;
        const rowid = getRowid($asTable, row);
        return !!rowExpandedFlag && !!rowExpandedMaps[rowid];
      },
      isExpandByRow(row) {
        // 已废弃
        log.warn('delFunc', ['isExpandByRow', 'isRowExpandByRow']);
        return $asTable.isRowExpandByRow(row);
      },
      /**
       * 手动清空展开行状态，数据会恢复成未展开的状态
       */
      clearRowExpand() {
        const { tableFullData, scrollYStore } = internalData;
        const expandOpts = computeExpandOpts.value;
        const { reserve } = expandOpts;
        const expList = $asTable.getRowExpandRecords();
        internalData.rowExpandedMaps = {};
        if (reserve) {
          tableFullData.forEach((row) => handleRowExpandReserve(row, false));
        }
        reactData.rowExpandedFlag++;
        scrollYStore.startIndex = 0;
        scrollYStore.endIndex = 1;
        return nextTick()
          .then(() => {
            if (expList.length > 0) {
              return handleLazyRecalculate(true, true, true);
            }
          })
          .then(() => {
            updateRowOffsetTop();
            updateRowExpandStyle();
            handleRowExpandScroll();
            return $asTable.updateCellAreas();
          });
      },
      clearRowExpandReserve() {
        internalData.rowExpandedReserveRowMap = {};
        return nextTick();
      },
      getRowExpandRecords() {
        const rest: any[] = [];
        each(internalData.rowExpandedMaps, (item) => {
          if (item) {
            rest.push(item);
          }
        });
        return rest;
      },
      setRowGroups(fieldOrColumns) {
        const { aggregateConfig } = props;
        const aggregateOpts = computeAggregateOpts.value;
        const { maxGroupSize } = aggregateOpts;
        if (!aggregateConfig) {
          log.error('reqProp', ['aggregate-config']);
          return nextTick();
        }
        const confList = fieldOrColumns
          ? isArray(fieldOrColumns)
            ? fieldOrColumns
            : [fieldOrColumns]
          : [];
        if (maxGroupSize && confList.length > maxGroupSize) {
          message.error(
            formatLocaleText(locale?.value.maxGroupCol, maxGroupSize),
          );
          return nextTick();
        }
        if (confList.length > 0) {
          handleUpdateRowGroup(
            confList.map((fieldOrColumn) => {
              return isString(fieldOrColumn)
                ? fieldOrColumn
                : fieldOrColumn.field;
            }),
          );
          return loadTableData(internalData.tableSynchData, false, true);
        }
        return nextTick();
      },
      getRowGroups() {
        const { aggregateConfig } = props;
        const { fullColumnFieldData } = internalData;
        if (aggregateConfig) {
          const { rowGroupList } = reactData;
          return rowGroupList.map(({ field }) => {
            const colRet = fullColumnFieldData[field];
            if (colRet) {
              return colRet.column;
            }
            return { field };
          });
        }
        return [];
      },
      getRowGroupFields() {
        return $asTable.getRowGroups().map((item) => item.field);
      },
      clearRowGroups() {
        const { aggregateConfig } = props;
        if (!aggregateConfig) {
          log.error('reqProp', ['aggregate-config']);
          return nextTick();
        }
        handleUpdateRowGroup([]);
        return loadTableData(internalData.tableSynchData, false, true);
      },
      isRowGroupRecord(row) {
        log.warn('delFunc', ['isRowGroupRecord', 'isAggregateRecord']);
        return $asTable.isAggregateRecord(row);
      },
      isRowGroupExpandByRow(row) {
        log.warn('delFunc', [
          'isRowGroupExpandByRow',
          'isAggregateExpandByRow',
        ]);
        return $asTable.isAggregateExpandByRow(row);
      },

      isAggregateRecord(row) {
        const { isRowGroupStatus } = reactData;
        return isRowGroupStatus && row.isAggregate;
      },
      getAggregateContentByRow(row) {
        const { isRowGroupStatus } = reactData;
        return isRowGroupStatus && row && row.isAggregate
          ? row.groupContent
          : '';
      },
      getAggregateRowChildren(row) {
        const aggregateOpts = computeAggregateOpts.value;
        const { childrenField, mapChildrenField } = aggregateOpts;

        const { isRowGroupStatus } = reactData;
        return isRowGroupStatus &&
          row &&
          row.isAggregate &&
          childrenField &&
          mapChildrenField
          ? row[mapChildrenField] || []
          : [];
      },
      refreshAggregateCalcValues() {
        updateGroupData();
        return nextTick();
      },
      isAggregateExpandByRow(row) {
        const { rowGroupExpandedFlag } = reactData;
        const { rowGroupExpandedMaps } = internalData;
        return (
          !!rowGroupExpandedFlag &&
          !!rowGroupExpandedMaps[getRowid($asTable, row)]
        );
      },
      setRowGroupExpand(rows, expanded) {
        if (rows) {
          if (!isArray(rows)) {
            rows = [rows];
          }
          return handleRowGroupVirtualExpand(rows, expanded);
        }
        return nextTick();
      },
      setRowGroupExpandByField(groupFields, expanded) {
        const { isRowGroupStatus } = reactData;
        const aggregateOpts = computeAggregateOpts.value;
        const { childrenField } = aggregateOpts;
        if (groupFields) {
          if (!isArray(groupFields)) {
            groupFields = [groupFields];
          }
          if (isRowGroupStatus) {
            const rows: any[] = [];
            const gfKeys: Record<string, boolean> = {};
            groupFields.forEach((groupField) => {
              gfKeys[groupField] = true;
            });
            eachTree(
              internalData.afterGroupFullData,
              (row) => {
                if (row.isAggregate && gfKeys[row.groupField]) {
                  rows.push(row);
                }
              },
              { children: childrenField },
            );
            if (rows.length > 0) {
              return handleRowGroupVirtualExpand(rows, expanded);
            }
          }
        }
        return nextTick();
      },

      setAllRowGroupExpand(expanded) {
        const { tableFullGroupData } = internalData;
        const aggregateOpts = computeAggregateOpts.value;
        const { mapChildrenField } = aggregateOpts;
        const rgExpandedMaps: Record<string, any> = {};
        if (expanded && mapChildrenField) {
          eachTree(
            tableFullGroupData,
            (row) => {
              if (row[mapChildrenField] && row[mapChildrenField].length > 0) {
                rgExpandedMaps[getRowid($asTable, row)] = row;
              }
            },
            { children: mapChildrenField },
          );
        }
        internalData.rowGroupExpandedMaps = rgExpandedMaps;
        handleVirtualTreeToList();
        $asTable.handleTableData();
        updateAfterDataIndex();
        reactData.rowGroupExpandedFlag++;
        return handleLazyRecalculate(true, true, true);
      },
      clearRowGroupExpand() {
        internalData.rowGroupExpandedMaps = {};
        handleVirtualTreeToList();
        $asTable.handleTableData();
        updateAfterDataIndex();
        reactData.rowGroupExpandedFlag++;
        return handleLazyRecalculate(true, true, true);
      },
      getTreeExpandRecords() {
        const rest: any[] = [];
        each(internalData.treeExpandedMaps, (item) => {
          if (item) {
            rest.push(item);
          }
        });
        return rest;
      },
      /**
       * 判断树节点是否懒加载完成
       * @param {Row} row 行对象
       */
      isTreeExpandLoaded(row) {
        const { fullAllDataRowIdData } = internalData;
        const rowRest = fullAllDataRowIdData[getRowid($asTable, row)]!;
        return rowRest && !!rowRest.treeLoaded;
      },
      clearTreeExpandLoaded(rows: any) {
        const { fullAllDataRowIdData, treeExpandedMaps } = internalData;
        const treeOpts = computeTreeOpts.value;
        const { transform } = treeOpts;
        if (rows) {
          if (!isArray(rows)) {
            rows = [rows];
          }
          rows.forEach((row: any) => {
            const rowid = getRowid($asTable, row);
            const rowRest = fullAllDataRowIdData[rowid];
            if (rowRest) {
              rowRest.treeLoaded = false;
              if (treeExpandedMaps[rowid]) {
                delete treeExpandedMaps[rowid];
              }
            }
          });
        } else {
          each(fullAllDataRowIdData, (rowRest) => {
            rowRest.treeLoaded = false;
          });
          internalData.treeExpandedMaps = {};
        }
        if (transform) {
          handleVirtualTreeToList();
          $asTable.handleTableData();
        }
        reactData.treeExpandedFlag++;
        return nextTick();
      },
      /**
       * 重新懒加载树节点，并展开该节点
       * @param {Row} row 行对象
       */
      reloadTreeExpand(row) {
        const { treeExpandLazyLoadedMaps } = internalData;
        const treeOpts = computeTreeOpts.value;
        const hasChildField = treeOpts.hasChildField;
        const { transform, lazy } = treeOpts;
        const rowid = getRowid($asTable, row);
        if (lazy && row[hasChildField] && !treeExpandLazyLoadedMaps[rowid]) {
          return $asTable
            .clearTreeExpandLoaded(row)
            .then(() => {
              return handleAsyncTreeExpandChilds(row);
            })
            .then(() => {
              if (transform) {
                handleVirtualTreeToList();
                $asTable.handleTableData();
              }
              reactData.treeExpandedFlag++;
            })
            .then(() => {
              return $asTable.recalculate();
            });
        }
        return nextTick();
      },
      reloadTreeChilds(row) {
        log.warn('delFunc', ['reloadTreeChilds', 'reloadTreeExpand']);
        // 即将废弃
        return $asTable.reloadTreeExpand(row);
      },
      /**
       * 切换/展开树节点
       */
      toggleTreeExpand(row) {
        return $asTable.setTreeExpand(row, !$asTable.isTreeExpandByRow(row));
      },
      /**
       * 设置所有树节点的展开与否
       * @param {Boolean} expanded 是否展开
       */
      setAllTreeExpand(expanded: boolean) {
        const { tableFullTreeData } = internalData;
        const treeOpts = computeTreeOpts.value;
        const { transform, lazy } = treeOpts;
        const childrenField = treeOpts.childrenField;
        const expandeds: any[] = [];
        eachTree(
          tableFullTreeData,
          (row) => {
            const rowChildren = row[childrenField];
            if (lazy || (rowChildren && rowChildren.length > 0)) {
              expandeds.push(row);
            }
          },
          { children: childrenField },
        );
        return $asTable.setTreeExpand(expandeds, expanded).then(() => {
          if (!transform) {
            return;
          }

          handleVirtualTreeToList();
          reactData.treeExpandedFlag++;
          return $asTable.recalculate();
        });
      },
      /**
       * 设置展开树形节点，二个参数设置这一行展开与否
       * 支持单行
       * 支持多行
       * @param {Array/Row} rows 行数据
       * @param {Boolean} expanded 是否展开
       */
      setTreeExpand(rows, expanded) {
        const treeOpts = computeTreeOpts.value;
        const { transform } = treeOpts;
        if (rows) {
          if (!isArray(rows)) {
            rows = [rows];
          }
          if (rows.length > 0) {
            // 如果为虚拟树
            return transform
              ? handleVirtualTreeExpand(rows, expanded)
              : handleBaseTreeExpand(rows, expanded);
          }
        }
        return nextTick();
      },
      /**
       * 判断行是否为树形节点展开状态
       * @param {Row} row 行对象
       */
      isTreeExpandByRow(row) {
        const { treeExpandedFlag } = reactData;
        const { treeExpandedMaps } = internalData;
        return (
          !!treeExpandedFlag && !!treeExpandedMaps[getRowid($asTable, row)]
        );
      },
      /**
       * 手动清空树形节点的展开状态，数据会恢复成未展开的状态
       */
      clearTreeExpand() {
        const { tableFullTreeData } = internalData;
        const treeOpts = computeTreeOpts.value;
        const childrenField = treeOpts.childrenField;
        const { transform, reserve } = treeOpts;
        const expList = $asTable.getTreeExpandRecords();
        internalData.treeExpandedMaps = {};
        if (reserve) {
          eachTree(
            tableFullTreeData,
            (row) => handleTreeExpandReserve(row, false),
            { children: childrenField },
          );
        }
        return $asTable
          .handleTableData()
          .then(() => {
            if (transform) {
              handleVirtualTreeToList();
              $asTable.handleTableData();
            }
            reactData.treeExpandedFlag++;
          })
          .then(() => {
            updateTreeLineStyle();
            if (expList.length > 0) {
              return $asTable.recalculate();
            }
          });
      },
      clearTreeExpandReserve() {
        internalData.treeExpandedReserveRowMap = {};
        return nextTick();
      },
      /**
       * 获取表格的滚动状态
       */
      getScroll() {
        return $asTable.getScrollData();
      },
      /**
       * 获取表格的滚动数据
       */
      getScrollData() {
        const { scrollXLoad, scrollYLoad, scrollbarHeight, scrollbarWidth } =
          reactData;
        const { elemStore } = internalData;
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const scrollTop = bodyScrollElem ? bodyScrollElem.scrollTop : 0;
        const scrollLeft = bodyScrollElem ? bodyScrollElem.scrollLeft : 0;
        const clientHeight = bodyScrollElem ? bodyScrollElem.clientHeight : 0;
        const clientWidth = bodyScrollElem ? bodyScrollElem.clientWidth : 0;
        const scrollHeight = bodyScrollElem ? bodyScrollElem.scrollHeight : 0;
        const scrollWidth = bodyScrollElem ? bodyScrollElem.scrollWidth : 0;
        const isTop = scrollTop <= 0;
        const isBottom = scrollTop + clientHeight >= scrollHeight;
        const isLeft = scrollLeft <= 0;
        const isRight = scrollLeft + clientWidth >= scrollWidth;
        return {
          virtualX: scrollXLoad,
          virtualY: scrollYLoad,
          isTop,
          isBottom,
          isLeft,
          isRight,
          scrollbarHeight,
          scrollbarWidth,
          scrollTop,
          scrollLeft,
          scrollHeight,
          scrollWidth,
          clientHeight,
          clientWidth,
        };
      },
      /**
       * 如果有滚动条，则滚动到对应的位置
       */
      scrollTo(scrollLeft, scrollTop) {
        const { elemStore } = internalData;
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
        const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
        const xHandleEl = refScrollXHandleElem.value;
        const yHandleEl = refScrollYHandleElem.value;

        internalData.intoRunScroll = true;

        if (scrollLeft && !isNumber(scrollLeft)) {
          scrollTop = scrollLeft.top;
          scrollLeft = scrollLeft.left;
        }
        if (isNumber(scrollLeft)) {
          setScrollLeft(xHandleEl, scrollLeft);
          setScrollLeft(bodyScrollElem, scrollLeft);
          setScrollLeft(headerScrollElem, scrollLeft);
          setScrollLeft(footerScrollElem, scrollLeft);
          if (reactData.scrollXLoad) {
            loadScrollXData();
          }
        }
        if (isNumber(scrollTop)) {
          setScrollTop(yHandleEl, scrollTop);
          setScrollTop(bodyScrollElem, scrollTop);
          setScrollTop(leftScrollElem, scrollTop);
          setScrollTop(rightScrollElem, scrollTop);
          if (reactData.scrollYLoad) {
            loadScrollYData();
          }
        }
        return new Promise<void>((resolve) => {
          setTimeout(
            () => {
              nextTick(() => {
                internalData.intoRunScroll = false;
                resolve();
              });
            },
            reactData.scrollXLoad || reactData.scrollYLoad ? 30 : 0,
          );
        });
      },

      /**
       * 如果有滚动条，则滚动到对应的行
       */
      scrollToRow(rowOrRowid, fieldOrColumn, options) {
        const { isAllOverflow, scrollYLoad, scrollXLoad } = reactData;
        const { fullAllDataRowIdData, _sToTime } = internalData;
        const rest = [];
        let row: any;
        if (isString(rowOrRowid) || isNumber(rowOrRowid)) {
          const rowid = rowOrRowid;
          const rowRest = rowid ? fullAllDataRowIdData[rowid] : null;
          if (rowRest) {
            row = rowRest.row;
          }
        } else {
          row = rowOrRowid;
        }
        if (row) {
          if (props.treeConfig) {
            rest.push($asTable.scrollToTreeRow(row));
          } else {
            rest.push(rowToVisible($asTable, row));
          }
        }
        if (fieldOrColumn) {
          rest.push(handleScrollToRowColumn(fieldOrColumn, row, options));
        }
        if (_sToTime) {
          clearTimeout(_sToTime);
        }
        return Promise.all(rest).then(() => {
          if (!row) {
            return;
          }

          if (!isAllOverflow && (scrollYLoad || scrollXLoad)) {
            calcCellHeight();
            calcCellWidth();
            // 可视区被渲染后位置被偏移
            internalData._sToTime = setTimeout(() => {
              internalData._sToTime = undefined;
              if (scrollYLoad) {
                if (props.treeConfig) {
                  $asTable.scrollToTreeRow(row);
                } else {
                  rowToVisible($asTable, row);
                }
              }
              if (scrollXLoad && fieldOrColumn) {
                handleScrollToRowColumn(fieldOrColumn, row, options);
              }
            }, 350);
          }
          return nextTick();
        });
      },
      /**
       * 如果有滚动条，则滚动到第一行
       */
      scrollToStartRow(fieldOrColumn, options) {
        const { afterFullData } = internalData;
        return $asTable.scrollToRow(afterFullData[0], fieldOrColumn, options);
      },
      /**
       * 如果有滚动条，则滚动到最后一行
       */
      scrollToEndRow(fieldOrColumn, options) {
        const { afterFullData } = internalData;
        return $asTable.scrollToRow(
          afterFullData[afterFullData.length - 1],
          fieldOrColumn,
          options,
        );
      },
      /**
       * 如果有滚动条，则滚动到对应的列
       */
      scrollToColumn(fieldOrColumn, options) {
        return handleScrollToRowColumn(fieldOrColumn, null, options);
      },
      /**
       * 如果有滚动条，则滚动到第一列
       */
      scrollToStartColumn(options) {
        const { visibleColumn } = internalData;
        return $asTable.scrollToColumn(visibleColumn[0]!, options);
      },
      /**
       * 如果有滚动条，则滚动到最后一列
       */
      scrollToEndColumn(options) {
        const { visibleColumn } = internalData;
        return $asTable.scrollToColumn(
          visibleColumn[visibleColumn.length - 1]!,
          options,
        );
      },
      /**
       * 手动清除滚动相关信息，还原到初始状态
       */
      clearScroll() {
        const { elemStore, scrollXStore, scrollYStore } = internalData;
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
        const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
        const xHandleEl = refScrollXHandleElem.value;
        const yHandleEl = refScrollYHandleElem.value;

        internalData.intoRunScroll = true;

        setScrollLeft(xHandleEl, 0);
        setScrollLeft(bodyScrollElem, 0);
        setScrollLeft(headerScrollElem, 0);
        setScrollLeft(footerScrollElem, 0);

        setScrollTop(yHandleEl, 0);
        setScrollTop(bodyScrollElem, 0);
        setScrollTop(leftScrollElem, 0);
        setScrollTop(rightScrollElem, 0);

        scrollXStore.startIndex = 0;
        scrollXStore.visibleStartIndex = 0;
        scrollXStore.endIndex = scrollXStore.visibleSize;
        scrollXStore.visibleEndIndex = scrollXStore.visibleSize;
        scrollYStore.startIndex = 0;
        scrollYStore.visibleStartIndex = 0;
        scrollYStore.endIndex = scrollYStore.visibleSize;
        scrollYStore.visibleEndIndex = scrollYStore.visibleSize;

        return nextTick().then(() => {
          internalData.lastScrollLeft = 0;
          internalData.lastScrollTop = 0;
          internalData.intoRunScroll = false;
        });
      },

      /**
       * 更新表尾合计
       */
      updateFooter() {
        const { showFooter, footerData, footerMethod } = props;
        const { visibleColumn, afterFullData } = internalData;
        let footData: any[] = [];
        if (showFooter && footerData && footerData.length > 0) {
          footData = footerData.slice(0);
        } else if (showFooter && footerMethod) {
          footData =
            visibleColumn.length > 0
              ? footerMethod({
                  columns: visibleColumn,
                  data: afterFullData,
                  $table: $asTable,
                  // TODO $grid: $xeGrid,
                  // $gantt: $xeGantt,
                })
              : [];
        }
        reactData.footerTableData = footData;
        $asTable.clearFooterFormatterCache();
        $asTable.handleUpdateFooterMerge();
        $asTable.dispatchEvent(
          'footer-data-change',
          {
            visibleColumn: internalData.visibleColumn,
            footData,
          },
          null,
        );
        return nextTick();
      },
      /**
       * 更新列状态 updateStatus({ row, column }, cellValue)
       * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一列编辑状态
       * 如果单元格配置了校验规则，则会进行校验
       */
      updateStatus(slotParams, cellValue) {
        return nextTick().then(() => {
          const { editRules } = props;
          const { isActivated } = internalData;
          if (isActivated && slotParams && editRules) {
            return $asTable.handleCellRuleUpdateStatus(
              'change',
              slotParams,
              cellValue,
            );
          }
        });
      },
      /**
       * 设置合并单元格 [{ row: Row|number, column: ColumnInfo|number, rowspan: number, colspan: number }]
       */
      setMergeCells(merges) {
        if (props.spanMethod) {
          log.error('errConflicts', ['merge-cells', 'span-method']);
        }
        handleBodyMerge(merges);
        $asTable.handleUpdateBodyMerge();
        return nextTick().then(() => {
          const { expandColumn } = reactData;
          const { mergeBodyList } = internalData;
          if (expandColumn && mergeBodyList.length > 0) {
            log.error('errConflicts', [
              'type=expand',
              'merge-cells | span-method',
            ]);
          }
          $asTable.updateCellAreas();
          return updateStyle();
        });
      },
      /**
       * 移除单元格合并 [{row:Row|number, col:ColumnInfo|number}]
       */
      removeMergeCells(merges) {
        if (props.spanMethod) {
          log.error('errConflicts', ['merge-cells', 'span-method']);
        }
        const rest = removeBodyMerges(merges);
        $asTable.handleUpdateBodyMerge();
        return nextTick().then(() => {
          $asTable.updateCellAreas();
          updateStyle();
          return rest;
        });
      },
      /**
       * 获取所有被合并的单元格
       */
      getMergeCells() {
        return internalData.mergeBodyList.slice(0);
      },
      /**
       * 清除所有单元格合并
       */
      clearMergeCells() {
        internalData.mergeBodyList = [];
        internalData.mergeBodyMaps = {};
        internalData.mergeBodyCellMaps = {};
        internalData.mergeBodyRowMaps = {};
        internalData.mergeBodyColMaps = {};
        reactData.mergeBodyFlag++;
        return nextTick().then(() => {
          return updateStyle();
        });
      },

      setMergeHeaderCells(merges) {
        handleHeaderMerge(merges);
        $asTable.handleUpdateHeaderMerge();
        return nextTick().then(() => {
          return updateStyle();
        });
      },
      /**
       * 移除表头单元格合并 [{row:Row|number, col:ColumnInfo|number}]
       */
      removeMergeHeaderCells(merges) {
        const rest = removeHeaderMerges(merges);
        $asTable.handleUpdateHeaderMerge();
        return nextTick().then(() => {
          updateStyle();
          return rest;
        });
      },
      /**
       * 获取所有被合并的表头单元格
       */
      getMergeHeaderCells() {
        return internalData.mergeHeaderList.slice(0);
      },
      /**
       * 清除所有表头单元格合并
       */
      clearMergeHeaderCells() {
        internalData.mergeHeaderList = [];
        internalData.mergeHeaderMaps = {};
        internalData.mergeHeaderCellMaps = {};
        internalData.mergeHeaderRowMaps = {};
        internalData.mergeBodyColMaps = {};
        reactData.mergeHeadFlag++;
        return nextTick().then(() => {
          return updateStyle();
        });
      },
      setMergeFooterCells(merges) {
        if (props.footerSpanMethod) {
          log.error('errConflicts', [
            'merge-footer-cells | merge-footer-items',
            'footer-span-method',
          ]);
        }
        handleFooterMerge(merges);
        $asTable.handleUpdateFooterMerge();
        return nextTick().then(() => {
          return updateStyle();
        });
      },
      setMergeFooterItems(merges) {
        return $asTable.setMergeFooterCells(merges);
      },
      removeMergeFooterCells(merges) {
        if (props.footerSpanMethod) {
          log.error('errConflicts', [
            'merge-footer-cells | merge-footer-items',
            'footer-span-method',
          ]);
        }
        const rest = removeFooterMerges(merges);
        $asTable.handleUpdateFooterMerge();
        return nextTick().then(() => {
          updateStyle();
          return rest;
        });
      },
      removeMergeFooterItems(merges) {
        // log.error('delFunc', ['removeMergeFooterItems', 'removeMergeFooterCells'])
        return $asTable.removeMergeFooterCells(merges);
      },
      /**
       * 获取所有被合并的表尾
       */
      getMergeFooterCells() {
        return internalData.mergeFooterList.slice(0);
      },
      getMergeFooterItems() {
        // log.error('delFunc', ['getMergeFooterItems', 'getMergeFooterCells'])
        return $asTable.getMergeFooterCells();
      },
      /**
       * 清除所有表尾合并
       */
      clearMergeFooterCells() {
        internalData.mergeFooterList = [];
        internalData.mergeFooterMaps = {};
        internalData.mergeFooterCellMaps = {};
        internalData.mergeFooterRowMaps = {};
        internalData.mergeFooterColMaps = {};
        reactData.mergeFootFlag++;
        return nextTick().then(() => {
          return updateStyle();
        });
      },
      clearMergeFooterItems() {
        return $asTable.clearMergeFooterCells();
      },

      updateCellAreas() {
        const { mouseConfig } = props;
        const mouseOpts = computeMouseOpts.value;
        if (
          mouseConfig &&
          mouseOpts.area &&
          $asTable.handleRecalculateCellAreaEvent
        ) {
          return $asTable.handleRecalculateCellAreaEvent();
        }
        return nextTick();
      },
      undo() {
        return $asTable.handleUndoStackEvent(null);
      },
      redo() {
        return $asTable.handleRedoStackEvent(null);
      },
      clearHistory() {
        return $asTable.handleClearStack();
      },
      /**
       * 用于 custom-config，用于手动恢复自定义列设置信息，恢复表格重置为初始状态
       * @param storeData
       * @returns
       */
      setCustomStoreData(storeData) {
        if (!storeData) {
          return nextTick();
        }
        const customOpts = computeCustomOpts.value;
        const { checkMethod } = customOpts;
        // 重置状态
        clearTableAllStatus($asTable);
        // 恢复列
        const allCols: AsTableDefines.ColumnInfo[] = [];
        eachTree(internalData.collectColumn, (column) => {
          column.resizeWidth = 0;
          column.fixed = column.defaultFixed;
          column.renderSortNumber = column.sortNumber;
          column.parentId = column.defaultParentId;
          if (!checkMethod || checkMethod({ $table: $asTable, column })) {
            column.visible = column.defaultVisible;
          }
          column.align = column.defaultAlign;
          column.headerAlign = column.defaultHeaderAlign;
          column.footerAlign = column.defaultFooterAlign;
          column.aggFunc = column.defaultAggFunc;
          column.renderAggFn = column.defaultAggFunc;
          column.renderResizeWidth = column.renderWidth;
          allCols.push(column);
        });
        const newCollectCols = toArrayTree(
          orderBy(allCols, 'renderSortNumber'),
          { key: 'id', parentKey: 'parentId', children: 'children' },
        );
        internalData.collectColumn = newCollectCols;
        internalData.tableFullColumn = getColumnList(newCollectCols);

        reactData.updateColFlag++;
        reactData.isColLoading = true;
        initColumnHierarchy();
        return Promise.resolve(handleCustomRestore(storeData))
          .then(() => {
            return buildColumnInfo();
          })
          .then(() => {
            // 恢复数据聚合分组
            const { isRowGroupStatus, rowGroupList } = reactData;
            if (isRowGroupStatus && !!$asTable.handlePivotTableAggData) {
              const rowGroupFields = computeRowGroupFields.value;
              if (
                rowGroupFields ? rowGroupFields.length : rowGroupList.length
              ) {
                if (rowGroupFields && rowGroupFields.length > 0) {
                  $asTable.setRowGroups(rowGroupFields);
                } else {
                  $asTable.clearRowGroups();
                }
              } else {
                $asTable.handleUpdateAggData();
              }
            }
          });
      },
      /**
       * 用于 custom-config，用于获取自定义列设置信息，用于自定义保持
       * @returns
       */
      getCustomStoreData() {
        const { id } = props;
        const customOpts = computeCustomOpts.value;
        const { isRowGroupStatus, rowGroupList } = reactData;
        const { fullColumnFieldData, collectColumn } = internalData;
        const { storage, checkMethod } = customOpts;
        const {
          isCustomAlign,
          isCustomHeaderAlign,
          isCustomFooterAlign,
          isCustomResizable,
          isCustomVisible,
          isCustomFixed,
          isCustomSort,
          isCustomAggGroup,
          isCustomAggFunc,
        } = handleCustomStoreConfig($asTable);

        const alignData: Record<string, AsColumnPropTypes.Align> = {};
        const headerAlignData: Record<string, AsColumnPropTypes.HeaderAlign> =
          {};
        const footerAlignData: Record<string, AsColumnPropTypes.FooterAlign> =
          {};
        const resizableData: Record<string, number> = {};
        const sortData: AsTableDefines.CustomSortStoreObj[] = [];
        const visibleData: Record<string, boolean> = {};
        const fixedData: Record<string, AsColumnPropTypes.Fixed> = {};
        const aggGroupData: Record<string, boolean> = {};
        const aggFuncData: Record<string, AsColumnPropTypes.AggFunc> = {};

        const storeData: AsTableDefines.CustomStoreData = {
          pagerData: undefined,
          // TODO isCustomPager && $xeGGWrapper && $xeGGWrapper.getCustomPagerData
          //   ? $xeGGWrapper.getCustomPagerData()
          //   : undefined,
          alignData: undefined,
          headerAlignData: undefined,
          footerAlignData: undefined,
          resizableData: undefined,
          sortData: undefined,
          visibleData: undefined,
          fixedData: undefined,
          aggGroupData: undefined,
          aggFuncData: undefined,
        };
        if (!id) {
          if (storage) {
            log.error('reqProp', ['id']);
          }
          return storeData;
        }
        let hasAlign = 0;
        let hasHeaderAlign = 0;
        let hasFooterAlign = 0;
        let hasResizable = 0;
        let hasSort = 0;
        let hasFixed = 0;
        let hasVisible = 0;
        let hasAggFunc = 0;
        const sortMaps: Record<string, AsTableDefines.CustomSortStoreObj> = {};
        eachTree(collectColumn, (column, index, items, path, parentColumn) => {
          const colKey = column.getKey();
          if (!colKey) {
            log.error('reqProp', [
              `${column.getTitle() || column.type || ''} -> column.field=?`,
            ]);
            return;
          }
          if (parentColumn) {
            if (isCustomSort) {
              const pColKey = parentColumn.getKey();
              const psObj = sortMaps[pColKey];
              hasSort = 1;
              if (psObj) {
                const sObj = { k: colKey };
                sortMaps[colKey] = sObj;
                if (!psObj.c) {
                  psObj.c = [];
                }
                psObj.c.push(sObj);
              }
            }
          } else {
            if (isCustomSort) {
              hasSort = 1;
              const sObj = { k: colKey };
              sortMaps[colKey] = sObj;
              sortData.push(sObj);
            }
            // 只支持一级
            if (
              isCustomFixed &&
              (column.fixed || '') !== (column.defaultFixed || '')
            ) {
              hasFixed = 1;
              fixedData[colKey] = column.fixed;
            }
          }
          if (isCustomAlign && column.align) {
            hasAlign = 1;
            alignData[colKey] = column.align;
          }
          if (isCustomHeaderAlign && column.headerAlign) {
            hasHeaderAlign = 1;
            headerAlignData[colKey] = column.headerAlign;
          }
          if (isCustomFooterAlign && column.footerAlign) {
            hasFooterAlign = 1;
            footerAlignData[colKey] = column.footerAlign;
          }
          if (isCustomResizable && column.resizeWidth) {
            hasResizable = 1;
            resizableData[colKey] = column.renderWidth;
          }
          if (
            isCustomVisible &&
            (!checkMethod || checkMethod({ $table: $asTable, column }))
          ) {
            if (!column.visible && column.defaultVisible) {
              hasVisible = 1;
              visibleData[colKey] = false;
            } else if (column.visible && !column.defaultVisible) {
              hasVisible = 1;
              visibleData[colKey] = true;
            }
          }
          if (
            isCustomAggFunc &&
            (column.aggFunc || '') !== (column.defaultAggFunc || '')
          ) {
            hasAggFunc = 1;
            aggFuncData[colKey] = column.aggFunc;
          }
        });
        if (hasAlign) {
          storeData.alignData = alignData;
        }
        if (hasHeaderAlign) {
          storeData.headerAlignData = headerAlignData;
        }
        if (hasFooterAlign) {
          storeData.footerAlignData = footerAlignData;
        }
        if (hasResizable) {
          storeData.resizableData = resizableData;
        }
        if (hasSort) {
          storeData.sortData = sortData;
        }
        if (hasFixed) {
          storeData.fixedData = fixedData;
        }
        if (hasVisible) {
          storeData.visibleData = visibleData;
        }
        if (isCustomAggGroup && isRowGroupStatus) {
          rowGroupList.forEach((aggConf) => {
            const colRest = fullColumnFieldData[aggConf.field];
            if (colRest) {
              aggGroupData[colRest.column.getKey()] = true;
            }
          });
          storeData.aggGroupData = aggGroupData;
        }
        if (hasAggFunc) {
          storeData.aggFuncData = aggFuncData;
        }
        return storeData;
      },

      focus() {
        internalData.isActivated = true;
        return nextTick();
      },
      blur() {
        internalData.isActivated = false;
        return nextTick();
      },
    };

    /**
     * 全局按下事件处理
     */
    const handleGlobalMousedownEvent = (evnt: MouseEvent) => {
      const { ctxMenuStore, editStore } = reactData;
      const { editRules } = props;
      const el = refElem.value;
      const editOpts = computeEditOpts.value;
      const validOpts = computeValidOpts.value;
      const { actived } = editStore;
      const $validTooltip = refValidTooltip.value;
      // TODO const tableFilter = refTableFilter.value;
      // const tableCustom = refTableCustom.value;
      // const tableMenu = refTableMenu.value;
      // 筛选
      // if (tableFilter) {
      //   if (getEventTargetNode(evnt, el, 'vxe-cell--filter').flag) {
      //     // 如果点击了筛选按钮
      //   } else if (
      //     getEventTargetNode(evnt, tableFilter.getRefMaps().refElem.value).flag
      //   ) {
      //     // 如果点击筛选容器
      //   } else {
      //     if (
      //       !getEventTargetNode(evnt, document.body, 'vxe-table--ignore-clear')
      //         .flag
      //     ) {
      //       $asTable.preventEvent(
      //         evnt,
      //         'event.clearFilter',
      //         internalData._currFilterParams,
      //         $asTable.closeFilter,
      //       );
      //     }
      //   }
      // }
      // // 自定义列
      // if (tableCustom) {
      //   if (
      //     customStore.btnEl === evnt.target ||
      //     getEventTargetNode(evnt, document.body, 'vxe-toolbar-custom-target')
      //       .flag
      //   ) {
      //     // 如果点击了自定义列按钮
      //   } else if (
      //     getEventTargetNode(evnt, tableCustom.getRefMaps().refElem.value).flag
      //   ) {
      //     // 如果点击自定义列容器
      //   } else {
      //     if (
      //       !getEventTargetNode(evnt, document.body, 'vxe-table--ignore-clear')
      //         .flag &&
      //       customStore.visible &&
      //       $asTable.closeCustom
      //     ) {
      //       $asTable.preventEvent(evnt, 'event.clearCustom', {}, () => {
      //         $asTable.closeCustom();
      //         $asTable.dispatchEvent('custom', { type: 'close' }, evnt);
      //       });
      //     }
      //   }
      // }

      // 如果已激活了编辑状态
      if (actived.row && editOpts.autoClear !== false) {
        // 如果是激活状态，点击了单元格之外
        const cell = actived.args.cell;
        if (!cell || !getEventTargetNode(evnt, cell).flag) {
          if (
            $validTooltip &&
            getEventTargetNode(evnt, $validTooltip.$el as HTMLDivElement).flag
          ) {
            // 如果是激活状态，且点击了校验提示框
          } else // 如果是激活状态，点击了单元格之外
          if (
            (!internalData._lastCallTime ||
              internalData._lastCallTime + 50 < Date.now()) &&
            !getEventTargetNode(
              evnt,
              document.body,
              `${prefixCls.value}--ignore-clear`,
            ).flag
          ) {
            // 如果手动调用了激活单元格，避免触发源被移除后导致重复关闭
            $asTable.preventEvent(evnt, 'event.clearEdit', actived.args, () => {
              let isClear;
              if (editOpts.mode === 'row') {
                const rowTargetNode = getEventTargetNode(
                  evnt,
                  el,
                  `${prefixCls.value}-body--row`,
                );
                const rowNodeRest = rowTargetNode.flag
                  ? $asTable.getRowNode(rowTargetNode.targetElem)
                  : null;
                // row 方式，如果点击了不同行
                isClear = rowNodeRest
                  ? !$asTable.eqRow(rowNodeRest.item, actived.args.row)
                  : false;
              } else {
                // cell 方式，如果是非编辑列
                isClear = !getEventTargetNode(evnt, el, 'col--edit').flag;
              }
              // 如果点击表头行，则清除激活状态
              if (!isClear) {
                isClear = getEventTargetNode(
                  evnt,
                  el,
                  `${prefixCls.value}-header--row`,
                ).flag;
              }
              // 如果点击表尾行，则清除激活状态
              if (!isClear) {
                isClear = getEventTargetNode(
                  evnt,
                  el,
                  `${prefixCls.value}-footer--row`,
                ).flag;
              }
              // 如果固定了高度且点击了行之外的空白处，则清除激活状态
              if (!isClear && props.height && !reactData.overflowY) {
                const bodyWrapperElem = evnt.target as HTMLDivElement;
                if (
                  hasClass(bodyWrapperElem, `${prefixCls.value}--body-wrapper`)
                ) {
                  isClear = evnt.offsetY < bodyWrapperElem.clientHeight;
                }
              }
              if (
                isClear ||
                // 如果点击了当前表格之外
                !getEventTargetNode(evnt, el).flag
              ) {
                setTimeout(() => {
                  $asTable.handleClearEdit(evnt).then(() => {
                    // 如果存在校验，点击了表格之外则清除
                    if (
                      !internalData.isActivated &&
                      editRules &&
                      validOpts.autoClear
                    ) {
                      reactData.validErrorMaps = {};
                    }
                  });
                }, 0);
              }
            });
          }
        }
      }
      // 如果配置了快捷菜单，点击了其他区域则关闭
      if (ctxMenuStore.visible && $asTable.closeMenu) {
        const tableMenu = refTableMenu.value;
        if (
          tableMenu &&
          !getEventTargetNode(evnt, tableMenu.getRefMaps().refElem.value).flag
        ) {
          $asTable.closeMenu();
        }
      }
      // TODO else if (
      //   mouseConfig &&
      //   !getEventTargetNode(evnt, el).flag &&
      //   !(
      //     $xeGGWrapper &&
      //     getEventTargetNode(evnt, $xeGGWrapper.getRefMaps().refElem.value).flag
      //   ) &&
      //   !(
      //     tableMenu &&
      //     getEventTargetNode(evnt, tableMenu.getRefMaps().refElem.value).flag
      //   ) &&
      //   !(
      //     $xeToolbar &&
      //     getEventTargetNode(evnt, $xeToolbar.getRefMaps().refElem.value).flag
      //   )
      // ) {
      //   if ($asTable.clearSelected) {
      //     $asTable.clearSelected();
      //   }
      //   if (areaOpts.autoClear && $asTable.getCellAreas) {
      //     const cellAreas = $asTable.getCellAreas();
      //     if (
      //       cellAreas &&
      //       cellAreas.length > 0 &&
      //       !getEventTargetNode(
      //         evnt,
      //         document.body,
      //         'vxe-table--ignore-areas-clear',
      //       ).flag
      //     ) {
      //       $asTable.preventEvent(evnt, 'event.clearAreas', {}, () => {
      //         $asTable.clearCellAreas();
      //         $asTable.clearCopyCellArea();
      //         dispatchEvent('clear-cell-area-selection', { cellAreas }, evnt);
      //       });
      //     }
      //   }
      // }
      // 如果配置了快捷菜单且，点击了其他地方则关闭
      // if (
      //   $asTable.closeMenu &&
      //   ctxMenuStore.visible &&
      //   tableMenu &&
      //   !getEventTargetNode(evnt, tableMenu.getRefMaps().refElem.value).flag
      // ) {
      //   $asTable.closeMenu();
      // }
      // if (
      //   !(
      //     actived.row &&
      //     getEventTargetNode(
      //       evnt,
      //       document.body,
      //       `${prefixCls.value}-table--ignore-clear`,
      //     ).flag
      //   )
      // ) {
      //   const isActivated = getEventTargetNode(
      //     evnt,
      //     $xeGGWrapper ? $xeGGWrapper.getRefMaps().refElem.value : el,
      //   ).flag;
      //   // 如果存在校验，点击了表格之外则清除
      //   if (!isActivated && editRules && validOpts.autoClear) {
      //     reactData.validErrorMaps = {};
      //   }
      //   // 最后激活的表格
      //   internalData.isActivated = isActivated;
      // }
    };

    /**
     * 窗口失焦事件处理
     */
    const handleGlobalBlurEvent = () => {
      $asTable.closeFilter();
      if ($asTable.closeMenu) {
        $asTable.closeMenu();
      }
    };

    /** 当页面、表格或任意滚动容器发生滚动时，它会把已经打开的筛选面板和自定义列弹窗重新定位到正确位置。 */
    const reUpdateCustomStyleEvent = (evnt: MouseEvent) => {
      // const { customStore } = reactData;
      // const customOpts = computeCustomOpts.value;
      // const { popupOptions } = customOpts;
      // const { transfer } = popupOptions || {};
      // if (transfer && customStore.visible) {
      //   const tableCustom = refTableCustom.value;
      //   if (
      //     tableCustom &&
      //     $asTable.handleCustomStyle &&
      //     !checkTargetElement(
      //       evnt.target,
      //       [tableCustom.getRefMaps().refElem.value as HTMLDivElement],
      //       evnt.currentTarget,
      //     )
      //   ) {
      //     $asTable.handleCustomStyle().then(() => {
      //       $asTable.handleCustomStyle();
      //     });
      //   }
      // }
    };

    const handleGlobalScrollEvent = (evnt: MouseEvent) => {
      const { filterStore } = reactData;
      if (filterStore.visible) {
        $asTable.handleFilterStyle();
      }
      reUpdateCustomStyleEvent(evnt);
    };

    /**
     * 全局滚动事件
     */
    const handleGlobalMousewheelEvent = () => {
      $asTable.closeTooltip();
      if ($asTable.closeMenu) {
        $asTable.closeMenu();
      }
    };

    /**
     * 表格键盘事件
     */
    const keydownEvent = (evnt: KeyboardEvent) => {
      const { mouseConfig, keyboardConfig } = props;
      const { filterStore, ctxMenuStore, editStore } = reactData;
      const mouseOpts = computeMouseOpts.value;
      const keyboardOpts = computeKeyboardOpts.value;
      const { actived } = editStore;
      const isEsc = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ESCAPE);
      if (isEsc) {
        $asTable.preventEvent(evnt, 'event.keydown', null, () => {
          dispatchEvent('keydown-start', {}, evnt);
          if (
            keyboardConfig &&
            mouseConfig &&
            mouseOpts.area &&
            $asTable.handleKdClAreaEvent
          ) {
            $asTable.handleKdClAreaEvent(evnt);
          } else if (
            actived.row ||
            filterStore.visible ||
            ctxMenuStore.visible
          ) {
            evnt.stopPropagation();
            // 如果按下了 Esc 键，关闭快捷菜单、筛选
            if ($asTable.closeMenu) {
              $asTable.closeMenu();
            }
            $asTable.closeFilter();
            // 如果是激活编辑状态，则取消编辑
            if (keyboardConfig && keyboardOpts.isEsc && actived.row) {
              const params = actived.args;
              $asTable.handleClearEdit(evnt);
              // 如果配置了选中功能，则为选中状态
              if (mouseOpts.selected) {
                nextTick(() => $asTable.handleSelected(params, evnt));
              }
            }
          }
          dispatchEvent('keydown', {}, evnt);
          dispatchEvent('keydown-end', {}, evnt);
        });
      }
    };

    const contextMenuEvent = (evnt: MouseEvent) => {
      dispatchEvent('context-menu', {}, evnt);
    };

    /**
     * 全局键盘事件
     */
    const handleGlobalKeydownEvent = (evnt: KeyboardEvent) => {
      // 该行为只对当前激活的表格有效
      if (internalData.isActivated) {
        $asTable.preventEvent(evnt, 'event.keydown', null, () => {
          const { mouseConfig, keyboardConfig, treeConfig, editConfig } = props;
          const { ctxMenuStore, editStore } = reactData;
          const { afterFullData, visibleColumn, currentRow } = internalData;
          const isContentMenu = computeIsContentMenu.value;
          const bodyMenu = computeBodyMenu.value;
          const keyboardOpts = computeKeyboardOpts.value;
          const mouseOpts = computeMouseOpts.value;
          const editOpts = computeEditOpts.value;
          const treeOpts = computeTreeOpts.value;
          const menuList = computeMenuList.value;
          const rowOpts = computeRowOpts.value;
          const columnOpts = computeColumnOpts.value;
          const {
            isLastEnterAppendRow,
            beforeEnterMethod,
            enterMethod,
            isLastTabAppendRow,
            beforeTabMethod,
            tabMethod,
          } = keyboardOpts;
          const { selected, actived } = editStore;
          const childrenField = treeOpts.childrenField;
          // eslint-disable-next-line unicorn/prefer-keyboard-event-key
          const keyCode = evnt.keyCode;
          const isProcess = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.PROCESS,
          );
          const isEsc = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ESCAPE);
          const hasBackspaceKey = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.BACKSPACE,
          );
          const isTab = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.TAB);
          const isEnter = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ENTER);
          const isSpacebar = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.SPACEBAR,
          );
          const isLeftArrow = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.ARROW_LEFT,
          );
          const isUpArrow = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.ARROW_UP,
          );
          const isRightArrow = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.ARROW_RIGHT,
          );
          const isDwArrow = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.ARROW_DOWN,
          );
          const hasDeleteKey = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.DELETE,
          );
          const isY = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.Y);
          const isZ = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.Z);
          const isF2 = globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.F2);
          const isContextMenu = globalEvents.hasKey(
            evnt,
            GLOBAL_EVENT_KEYS.CONTEXT_MENU,
          );
          const isControlKey = hasControlKey(evnt);
          const hasShiftKey = evnt.shiftKey;
          const isAltKey = evnt.altKey;
          const operArrow =
            isLeftArrow || isUpArrow || isRightArrow || isDwArrow;
          const operCtxMenu =
            isContentMenu &&
            ctxMenuStore.visible &&
            (isEnter || isSpacebar || operArrow);
          const isEditStatus =
            isEnableConf(editConfig) && actived.column && actived.row;
          const beforeEditMethod = editOpts.beforeEditMethod;
          const selectRow = selected.row;
          const selectColumn = selected.column;
          if (operCtxMenu) {
            // 如果配置了右键菜单; 支持方向键操作、回车
            evnt.preventDefault();
            if (
              ctxMenuStore.showChild &&
              hasChildrenList(ctxMenuStore.selected)
            ) {
              $asTable.moveCtxMenu(
                evnt,
                ctxMenuStore,
                'selectChild',
                isLeftArrow,
                false,
                ctxMenuStore.selected.children,
              );
            } else {
              $asTable.moveCtxMenu(
                evnt,
                ctxMenuStore,
                'selected',
                isRightArrow,
                true,
                menuList,
              );
            }
          } else if (
            keyboardConfig &&
            mouseConfig &&
            mouseOpts.area &&
            $asTable.handleKdClAreaEvent
          ) {
            $asTable.handleKdClAreaEvent(evnt);
          } else if (isEsc) {
            // 如果按下了 Esc 键，关闭快捷菜单、筛选
            if ($asTable.closeMenu) {
              $asTable.closeMenu();
            }
            $asTable.closeFilter();
            // 如果是激活编辑状态，则取消编辑
            if (keyboardConfig && keyboardOpts.isEsc && actived.row) {
              const params = actived.args;
              $asTable.handleClearEdit(evnt);
              // 如果配置了选中功能，则为选中状态
              if (mouseOpts.selected) {
                nextTick(() => $asTable.handleSelected(params, evnt));
              }
            }
          } else if (
            isSpacebar &&
            keyboardConfig &&
            keyboardOpts.isChecked &&
            selectRow &&
            selectColumn &&
            (selectColumn.type === 'checkbox' || selectColumn.type === 'radio')
          ) {
            // 空格键支持选中复选框
            evnt.preventDefault();
            if (selectColumn.type === 'checkbox') {
              $asTable.handleToggleCheckRowEvent(evnt, selected.args);
            } else {
              $asTable.triggerRadioRowEvent(evnt, selected.args);
            }
          } else if (isF2 && isEnableConf(editConfig)) {
            // 如果按下了 F2 键
            if (!isEditStatus && selectRow && selectColumn) {
              evnt.preventDefault();
              $asTable.handleEdit(selected.args, evnt);
            }
          } else if (isContextMenu) {
            // 如果按下上下文键
            internalData._keyCtx =
              selectRow && selectColumn && bodyMenu.length > 0;
            clearTimeout(internalData.keyCtxTimeout);
            internalData.keyCtxTimeout = setTimeout(() => {
              internalData._keyCtx = false;
            }, 1000);
          } else if (
            isEnter &&
            !isAltKey &&
            keyboardConfig &&
            keyboardOpts.isEnter &&
            (selectRow ||
              actived.row ||
              (treeConfig && rowOpts.isCurrent && currentRow))
          ) {
            // 退出选中
            if (isControlKey) {
              // 如果是激活编辑状态，则取消编辑
              if (actived.row) {
                const params = actived.args;
                $asTable.handleClearEdit(evnt);
                // 如果配置了选中功能，则为选中状态
                if (mouseOpts.selected) {
                  nextTick(() => {
                    $asTable.handleSelected(params, evnt);
                  });
                }
              }
            } else {
              // 如果是激活状态，退则出到上一行/下一行
              if (selectRow || actived.row) {
                const activeRow = selectRow || actived.row;
                const activeColumn = selectColumn || actived.column;
                if (activeColumn) {
                  const activeParams = selectRow ? selected.args : actived.args;
                  if (hasShiftKey) {
                    if (keyboardOpts.enterToTab) {
                      $asTable.moveTabSelected(activeParams, hasShiftKey, evnt);
                    } else {
                      $asTable.moveEnterSelected(
                        activeParams,
                        isLeftArrow,
                        true,
                        isRightArrow,
                        false,
                        evnt,
                      );
                    }
                  } else {
                    const _rowIndex = $asTable.getVTRowIndex(activeRow);
                    const _columnIndex =
                      $asTable.getVTColumnIndex(activeColumn);
                    if (keyboardOpts.enterToTab) {
                      const ttrParams = {
                        row: activeRow,
                        rowIndex: $asTable.getRowIndex(activeRow),
                        $rowIndex: $asTable.getVMRowIndex(activeRow),
                        _rowIndex,
                        column: activeColumn,
                        columnIndex: $asTable.getColumnIndex(activeColumn),
                        $columnIndex: $asTable.getVMColumnIndex(activeColumn),
                        _columnIndex,
                        $table: $asTable,
                      };
                      if (
                        !beforeTabMethod ||
                        beforeTabMethod(ttrParams) !== false
                      ) {
                        evnt.preventDefault();
                        // 最后一行按下Tab键，自动追加一行
                        if (isLastTabAppendRow) {
                          const newColumn = visibleColumn[0];
                          if (
                            _rowIndex >= afterFullData.length - 1 &&
                            _columnIndex >= visibleColumn.length - 1
                          ) {
                            if (actived.row) {
                              $asTable.handleClearEdit(evnt);
                            }
                            $asTable
                              .insertAt({}, -1)
                              .then(({ row: newRow }) => {
                                $asTable.scrollToRow(newRow, newColumn);
                                $asTable.handleSelected(
                                  {
                                    ...activeParams,
                                    row: newRow,
                                    column: newColumn,
                                  },
                                  evnt,
                                );
                              });
                            $asTable.dispatchEvent(
                              'tab-append-row',
                              ttrParams,
                              evnt,
                            );
                            return;
                          }
                        }
                        if (tabMethod) {
                          tabMethod(ttrParams);
                        } else {
                          $asTable.moveTabSelected(
                            activeParams,
                            hasShiftKey,
                            evnt,
                          );
                        }
                      }
                    } else {
                      const etrParams = {
                        row: activeRow,
                        rowIndex: $asTable.getRowIndex(activeRow),
                        $rowIndex: $asTable.getVMRowIndex(activeRow),
                        _rowIndex,
                        column: activeColumn,
                        columnIndex: $asTable.getColumnIndex(activeColumn),
                        $columnIndex: $asTable.getVMColumnIndex(activeColumn),
                        _columnIndex,
                        $table: $asTable,
                      };
                      if (
                        !beforeEnterMethod ||
                        beforeEnterMethod(etrParams) !== false
                      ) {
                        evnt.preventDefault();
                        // 最后一行按下回车键，自动追加一行
                        if (
                          isLastEnterAppendRow &&
                          _rowIndex >= afterFullData.length - 1
                        ) {
                          $asTable.insertAt({}, -1).then(({ row: newRow }) => {
                            $asTable.scrollToRow(newRow, activeColumn);
                            $asTable.handleSelected(
                              { ...activeParams, row: newRow },
                              evnt,
                            );
                          });
                          $asTable.dispatchEvent(
                            'enter-append-row',
                            etrParams,
                            evnt,
                          );
                          return;
                        }
                        if (enterMethod) {
                          enterMethod(etrParams);
                        } else {
                          if (actived.row) {
                            $asTable.handleClearEdit(evnt);
                          }
                          $asTable.moveEnterSelected(
                            activeParams,
                            isLeftArrow,
                            false,
                            isRightArrow,
                            true,
                            evnt,
                          );
                        }
                      }
                    }
                  }
                }
              } else if (treeConfig && rowOpts.isCurrent && currentRow) {
                // 如果是树形表格当前行回车移动到子节点
                const childrens = currentRow[childrenField];
                if (childrens && childrens.length > 0) {
                  evnt.preventDefault();
                  const targetRow = childrens[0];
                  const params = {
                    $table: $asTable,
                    row: targetRow,
                    rowIndex: $asTable.getRowIndex(targetRow),
                    $rowIndex: $asTable.getVMRowIndex(targetRow),
                  };
                  $asTable
                    .setTreeExpand(currentRow, true)
                    .then(() => $asTable.scrollToRow(targetRow))
                    .then(() => $asTable.triggerCurrentRowEvent(evnt, params));
                }
              }
            }
          } else if (operArrow && keyboardConfig && keyboardOpts.isArrow) {
            if (!isEditStatus) {
              // 如果按下了方向键
              if (mouseOpts.selected && selectRow && selectColumn) {
                $asTable.moveArrowSelected(
                  selected.args,
                  isLeftArrow,
                  isUpArrow,
                  isRightArrow,
                  isDwArrow,
                  evnt,
                );
              } else {
                // 当前行按键上下移动
                if ((isUpArrow || isDwArrow) && rowOpts.isCurrent) {
                  $asTable.moveCurrentRow(isUpArrow, isDwArrow, evnt);
                }
                // 当前行按键左右移动
                if ((isLeftArrow || isRightArrow) && columnOpts.isCurrent) {
                  $asTable.moveCurrentColumn(isLeftArrow, isRightArrow, evnt);
                }
              }
            }
          } else if (isTab && keyboardConfig && keyboardOpts.isTab) {
            // 如果按下了 Tab 键切换
            if (selectRow || actived.row) {
              const activeRow = selectRow || actived.row;
              const activeColumn = selectColumn || actived.column;
              if (activeColumn) {
                const activeParams = selectRow ? selected.args : actived.args;
                const _rowIndex = $asTable.getVTRowIndex(activeRow);
                const _columnIndex = $asTable.getVTColumnIndex(activeColumn);
                const ttrParams = {
                  row: activeRow,
                  rowIndex: $asTable.getRowIndex(activeRow),
                  $rowIndex: $asTable.getVMRowIndex(activeRow),
                  _rowIndex,
                  column: activeColumn as AsTableDefines.ColumnInfo,
                  columnIndex: $asTable.getColumnIndex(activeColumn),
                  $columnIndex: $asTable.getVMColumnIndex(activeColumn),
                  _columnIndex,
                  $table: $asTable,
                };
                if (!beforeTabMethod || beforeTabMethod(ttrParams) !== false) {
                  evnt.preventDefault();
                  // 最后一行按下Tab键，自动追加一行
                  if (isLastTabAppendRow) {
                    const newColumn = visibleColumn[0];
                    if (
                      _rowIndex >= afterFullData.length - 1 &&
                      _columnIndex >= visibleColumn.length - 1
                    ) {
                      if (actived.row) {
                        $asTable.handleClearEdit(evnt);
                      }
                      $asTable.insertAt({}, -1).then(({ row: newRow }) => {
                        $asTable.scrollToRow(newRow, newColumn);
                        $asTable.handleSelected(
                          { ...activeParams, row: newRow, column: newColumn },
                          evnt,
                        );
                      });
                      $asTable.dispatchEvent('tab-append-row', ttrParams, evnt);
                      return;
                    }
                  }
                  if (tabMethod) {
                    tabMethod(ttrParams);
                  } else {
                    if (actived.row) {
                      $asTable.handleClearEdit(evnt);
                    }
                    $asTable.moveTabSelected(activeParams, hasShiftKey, evnt);
                  }
                }
              }
            }
          } else if (
            keyboardConfig &&
            keyboardOpts.isDel &&
            hasDeleteKey &&
            isEnableConf(editConfig) &&
            (selectRow || selectColumn)
          ) {
            // 如果是删除键
            if (!isEditStatus) {
              const { delMethod } = keyboardOpts;
              const params = {
                row: selectRow,
                rowIndex: $asTable.getRowIndex(selectRow),
                column: selectColumn as AsTableDefines.ColumnInfo,
                columnIndex: $asTable.getColumnIndex(selectColumn),
                $table: $asTable,
                // TODO $grid: $xeGrid,
                // $gantt: $xeGantt,
              };
              // 是否被禁用
              if (!beforeEditMethod || beforeEditMethod(params)) {
                if (delMethod) {
                  delMethod(params);
                } else {
                  const selectCellValue = getCellValue(selectRow, selectColumn);
                  if (selectCellValue !== null) {
                    $asTable.handlePushStack();
                    setCellValue(selectRow, selectColumn, null);
                  }
                }
                // 如果按下 del 键，更新表尾数据
                $asTable.updateFooter();
                dispatchEvent('cell-delete-value', params, evnt);
              }
            }
          } else if (
            hasBackspaceKey &&
            keyboardConfig &&
            keyboardOpts.isBack &&
            isEnableConf(editConfig) &&
            (selectRow || selectColumn)
          ) {
            if (!isEditStatus) {
              const { backMethod } = keyboardOpts;
              // 如果是删除键
              if (
                keyboardOpts.isDel &&
                isEnableConf(editConfig) &&
                (selectRow || selectColumn)
              ) {
                const params = {
                  row: selectRow,
                  rowIndex: $asTable.getRowIndex(selectRow),
                  $rowIndex: $asTable.getVMRowIndex(selectRow),
                  _rowIndex: $asTable.getVTRowIndex(selectRow),
                  column: selectColumn as AsTableDefines.ColumnInfo,
                  columnIndex: $asTable.getColumnIndex(selectColumn),
                  $columnIndex: $asTable.getVMColumnIndex(selectColumn),
                  _columnIndex: $asTable.getVTColumnIndex(selectColumn),
                  $table: $asTable,
                  // TODO $grid: $xeGrid,
                  // $gantt: $xeGantt,
                };
                // 是否被禁用
                if (!beforeEditMethod || beforeEditMethod(params)) {
                  if (backMethod) {
                    backMethod(params);
                  } else {
                    $asTable.handleEdit(params, evnt, {
                      isClear: true,
                    });
                  }
                  dispatchEvent('cell-backspace-value', params, evnt);
                }
              }
            }
          } else if (
            hasBackspaceKey &&
            keyboardConfig &&
            treeConfig &&
            keyboardOpts.isBack &&
            rowOpts.isCurrent &&
            currentRow
          ) {
            // 如果树形表格回退键关闭当前行返回父节点
            const { parent: parentRow } = findTree(
              internalData.afterTreeFullData,
              (item) => item === currentRow,
              { children: childrenField },
            );
            if (parentRow) {
              evnt.preventDefault();
              const params = {
                row: parentRow,
                rowIndex: $asTable.getRowIndex(parentRow),
                $rowIndex: $asTable.getVMRowIndex(parentRow),
                $table: $asTable,
                // TODO $grid: $xeGrid,
                // $gantt: $xeGantt,
              };
              $asTable
                .setTreeExpand(parentRow, false)
                .then(() => $asTable.scrollToRow(parentRow))
                .then(() => $asTable.triggerCurrentRowEvent(evnt, params));
            }
          } else if (
            keyboardConfig &&
            keyboardOpts.isUndoRedo &&
            isControlKey &&
            (isZ || isY) &&
            !hasAxternalInputTarget(evnt.target, prefixCls.value)
          ) {
            if (evnt.target) {
              if (isY || (hasShiftKey && isZ)) {
                // 恢复被撤销的操作：Ctrl + Y 或 Ctrl + Shift + Z
                evnt.preventDefault();
                $asTable.handleRedoStackEvent(evnt);
              } else if (isZ) {
                // ‌撤销上一步操作‌：Ctrl + Z
                evnt.preventDefault();
                $asTable.handleUndoStackEvent(evnt);
              }
            }
          } else if (
            keyboardConfig &&
            isEnableConf(editConfig) &&
            keyboardOpts.isEdit &&
            !isControlKey &&
            (isSpacebar ||
              isProcess ||
              evnt.key === 'Process' ||
              (keyCode >= 48 && keyCode <= 57) ||
              (keyCode >= 65 && keyCode <= 90) ||
              (keyCode >= 96 && keyCode <= 111) ||
              (keyCode >= 186 && keyCode <= 192) ||
              (keyCode >= 219 && keyCode <= 222))
          ) {
            const { editMode, editMethod } = keyboardOpts;
            // 启用编辑后，空格键功能将失效
            // if (isSpacebar) {
            //   evnt.preventDefault()
            // }
            // 如果是按下非功能键之外允许直接编辑
            if (
              selectColumn &&
              selectRow &&
              isEnableConf(selectColumn.editRender)
            ) {
              const beforeEditMethod = editOpts.beforeEditMethod;
              const params = {
                row: selectRow,
                rowIndex: $asTable.getRowIndex(selectRow),
                $rowIndex: $asTable.getVMRowIndex(selectRow),
                _rowIndex: $asTable.getVTRowIndex(selectRow),
                column: selectColumn,
                columnIndex: $asTable.getColumnIndex(selectColumn),
                $columnIndex: $asTable.getVMColumnIndex(selectColumn),
                _columnIndex: $asTable.getVTColumnIndex(selectColumn),
                $table: $asTable,
                // TODO $grid: $xeGrid,
                // $gantt: $xeGantt,
              };
              if (!beforeEditMethod || beforeEditMethod(params)) {
                if (editMethod) {
                  editMethod(params);
                } else {
                  let isClearValue = false;
                  // 追加方式与覆盖式
                  // eslint-disable-next-line unicorn/prefer-ternary
                  if (editMode !== 'insert') {
                    isClearValue = true;
                  }
                  $asTable.handleEdit(params, evnt, {
                    isClear: isClearValue,
                  });
                }
              }
            }
          }
          dispatchEvent('keydown', {}, evnt);
        });
      }
    };

    const handleGlobalPasteEvent = (evnt: ClipboardEvent) => {
      const { keyboardConfig, mouseConfig } = props;
      const { editStore, filterStore } = reactData;
      const { isActivated } = internalData;
      const mouseOpts = computeMouseOpts.value;
      const keyboardOpts = computeKeyboardOpts.value;
      const { actived } = editStore;
      if (isActivated && !filterStore.visible) {
        if (
          !(actived.row || actived.column) &&
          keyboardConfig &&
          keyboardOpts.isClip &&
          mouseConfig &&
          mouseOpts.area &&
          $asTable.handlePeClAreaEvent
        ) {
          $asTable.handlePeClAreaEvent(evnt);
        }
        dispatchEvent('paste', {}, evnt);
      }
    };

    const handleGlobalCopyEvent = (evnt: ClipboardEvent) => {
      const { keyboardConfig, mouseConfig } = props;
      const { editStore, filterStore } = reactData;
      const { isActivated } = internalData;
      const mouseOpts = computeMouseOpts.value;
      const keyboardOpts = computeKeyboardOpts.value;
      const { actived } = editStore;
      if (isActivated && !filterStore.visible) {
        if (
          !(actived.row || actived.column) &&
          keyboardConfig &&
          keyboardOpts.isClip &&
          mouseConfig &&
          mouseOpts.area &&
          $asTable.handleCyClAreaEvent
        ) {
          $asTable.handleCyClAreaEvent(evnt);
        }
        dispatchEvent('copy', {}, evnt);
      }
    };

    const handleGlobalCutEvent = (evnt: ClipboardEvent) => {
      const { keyboardConfig, mouseConfig } = props;
      const { editStore, filterStore } = reactData;
      const { isActivated } = internalData;
      const mouseOpts = computeMouseOpts.value;
      const keyboardOpts = computeKeyboardOpts.value;
      const { actived } = editStore;
      if (isActivated && !filterStore.visible) {
        if (
          !(actived.row || actived.column) &&
          keyboardConfig &&
          keyboardOpts.isClip &&
          mouseConfig &&
          mouseOpts.area &&
          $asTable.handleCutCellAreaEvent
        ) {
          $asTable.handleCutCellAreaEvent(evnt);
        }
        dispatchEvent('cut', {}, evnt);
      }
    };

    const handleGlobalResizeEvent = () => {
      const { filterStore } = reactData;
      if (filterStore.visible) {
        $asTable.handleFilterStyle();
      }
      if ($asTable.closeMenu) {
        $asTable.closeMenu();
      }
      const el = refElem.value;
      if (!el || !el.clientWidth) {
        return;
      }
      if (internalData.rsePending) {
        return;
      }
      handleResizeEvent();
    };

    const handleTargetEnterEvent = (isClear: boolean) => {
      const $tooltip = refTooltip.value;
      clearTimeout(internalData.tooltipTimeout);
      if (isClear) {
        $asTable.closeTooltip();
      } else {
        if ($tooltip && $tooltip.setActived) {
          $tooltip.setActived(true);
        }
      }
    };

    const clearCrossTableDragStatus = () => {
      crossTableDragRowObj = null;
      crossTableDragRowInfo.row = null;
    };

    const clearDragStatus = () => {
      const { dragRow, dragCol } = reactData;
      if (dragRow || dragCol) {
        clearColDropOrigin();
        clearRowDropOrigin();
        hideDropTip();
        clearCrossTableDragStatus();
        reactData.dragRow = null;
        reactData.dragCol = null;
      }
    };

    const handleRowDragEndClearStatus = () => {
      clearRowDragData();
      clearCrossTableDragStatus();
      handleRecalculateStyle(false, true, true);
    };

    const handleColDragEndClearStatus = () => {
      clearColDragData();
      clearCrossTableDragStatus();
      handleRecalculateStyle(true, true, true);
    };

    const clearRowDropOrigin = () => {
      const el = refElem.value;
      if (el) {
        const clss = 'row--drag-origin';
        arrayEach(el.querySelectorAll(`.${clss}`), (elem) => {
          (elem as HTMLTableCellElement).draggable = false;
          removeClass(elem, clss);
        });
      }
    };

    const updateRowDropOrigin = (row: any) => {
      const el = refElem.value;
      if (el) {
        const clss = 'row--drag-origin';
        const rowid = getRowid($asTable, row);
        arrayEach(
          el.querySelectorAll(`[rowid="${CSS.escape(rowid)}"]`),
          (elem) => {
            addClass(elem, clss);
          },
        );
      }
    };

    const updateRowDropTipContent = (tdEl: HTMLElement) => {
      const { dragRow } = reactData;
      const rowDragOpts = computeRowDragOpts.value;
      const { tooltipMethod } = rowDragOpts;

      let tipContent = '';
      if (tooltipMethod) {
        const rtParams = {
          $table: $asTable,
          row: dragRow,
        };
        tipContent = `${tooltipMethod(rtParams) || ''}`;
      } else {
        tipContent = formatLocaleText(locale?.value.dragTip, [
          tdEl.textContent || '',
        ]);
      }
      reactData.dragTipText = tipContent;
    };

    const updateColDropOrigin = (column: AsTableDefines.ColumnInfo) => {
      const el = refElem.value;
      if (el) {
        const colQuerys: string[] = [];
        eachTree([column], (item) => {
          colQuerys.push(`[colid="${item.id}"]`);
        });
        const clss = 'col--drag-origin';
        arrayEach(el.querySelectorAll(colQuerys.join(',')), (elem) => {
          addClass(elem, clss);
        });
      }
    };

    const clearColDropOrigin = () => {
      const el = refElem.value;
      if (el) {
        const clss = 'col--drag-origin';
        arrayEach(el.querySelectorAll(`.${clss}`), (elem) => {
          (elem as HTMLTableCellElement).draggable = false;
          removeClass(elem, clss);
        });
      }
    };

    const updateColDropTipContent = (tdEl: HTMLElement) => {
      const { dragCol } = reactData;
      const columnDragOpts = computeColumnDragOpts.value;
      const { tooltipMethod } = columnDragOpts;

      let tipContent = '';
      if (tooltipMethod) {
        const dtParams = {
          $table: $asTable,
          column: dragCol,
        } as any;
        tipContent = `${tooltipMethod(dtParams) || ''}`;
      } else {
        tipContent = formatLocaleText(locale?.value.dragTip, [
          tdEl.textContent || '',
        ]);
      }
      reactData.dragTipText = tipContent;
    };

    const showDropTip = (
      evnt: DragEvent | MouseEvent,
      trEl: HTMLElement | null,
      thEl: HTMLElement | null,
      showLine: boolean,
      dragPos: string,
    ) => {
      let wrapperEl = refElem.value;
      // TODO if ($xeGantt && trEl) {
      //   const { refGanttContainerElem } = $xeGantt.getRefMaps();
      //   const ganttContainerElem = refGanttContainerElem.value;
      //   if (ganttContainerElem) {
      //     wrapperEl = ganttContainerElem;
      //   }
      // }
      if (!wrapperEl) {
        return;
      }
      const { overflowX, scrollbarWidth, overflowY, scrollbarHeight } =
        reactData;
      const { prevDragToChild } = internalData;
      const wrapperRect = wrapperEl.getBoundingClientRect();
      const osbWidth = overflowY ? scrollbarWidth : 0;
      const osbHeight = overflowX ? scrollbarHeight : 0;
      const tableWrapperWidth = wrapperEl.clientWidth;
      const tableWrapperHeight = wrapperEl.clientHeight;
      if (trEl) {
        const rdLineEl = refDragRowLineElem.value;
        if (rdLineEl) {
          if (showLine) {
            const scrollbarYToLeft = computeScrollbarYToLeft.value;
            const trRect = trEl.getBoundingClientRect();
            let trHeight = trEl.clientHeight;
            const offsetTop = Math.max(1, trRect.y - wrapperRect.y);
            if (offsetTop + trHeight > tableWrapperHeight - osbHeight) {
              trHeight = tableWrapperHeight - offsetTop - osbHeight;
            }
            rdLineEl.style.display = 'block';
            rdLineEl.style.left = `${scrollbarYToLeft ? osbWidth : 0}px`;
            rdLineEl.style.top = `${offsetTop}px`;
            rdLineEl.style.height = `${trHeight}px`;
            rdLineEl.style.width = `${tableWrapperWidth - osbWidth}px`;
            rdLineEl.setAttribute('drag-pos', dragPos);
            rdLineEl.setAttribute('drag-to-child', prevDragToChild ? 'y' : 'n');
          } else {
            rdLineEl.style.display = '';
          }
        }
      } else if (thEl) {
        const cdLineEl = refDragColLineElem.value;
        if (cdLineEl) {
          if (showLine) {
            const scrollbarXToTop = computeScrollbarXToTop.value;
            const leftContainerElem = refLeftContainer.value;
            const leftContainerWidth = leftContainerElem
              ? leftContainerElem.clientWidth
              : 0;
            const rightContainerElem = refRightContainer.value;
            const rightContainerWidth = rightContainerElem
              ? rightContainerElem.clientWidth
              : 0;
            const thRect = thEl.getBoundingClientRect();
            let thWidth = thEl.clientWidth;
            const offsetTop = Math.max(0, thRect.y - wrapperRect.y);
            const startX = leftContainerWidth;
            let offsetLeft = thRect.x - wrapperRect.x;
            if (offsetLeft < startX) {
              thWidth -= startX - offsetLeft;
              offsetLeft = startX;
            }
            const endX =
              tableWrapperWidth -
              rightContainerWidth -
              (rightContainerWidth ? 0 : osbWidth);
            if (offsetLeft + thWidth > endX) {
              thWidth = endX - offsetLeft;
            }
            cdLineEl.style.display = 'block';
            cdLineEl.style.top = `${offsetTop}px`;
            cdLineEl.style.left = `${offsetLeft}px`;
            cdLineEl.style.width = `${thWidth}px`;
            cdLineEl.style.height = prevDragToChild
              ? `${thRect.height}px`
              : `${tableWrapperHeight - offsetTop - (scrollbarXToTop ? 0 : osbHeight)}px`;
            cdLineEl.setAttribute('drag-pos', dragPos);
            cdLineEl.setAttribute('drag-to-child', prevDragToChild ? 'y' : 'n');
          } else {
            cdLineEl.style.display = '';
          }
        }
      }
      const rdTipEl = refDragTipElem.value;
      if (rdTipEl) {
        rdTipEl.style.display = 'block';
        rdTipEl.style.top = `${Math.min(wrapperEl.clientHeight - wrapperEl.scrollTop - rdTipEl.clientHeight, evnt.clientY - wrapperRect.y)}px`;
        rdTipEl.style.left = `${Math.min(wrapperEl.clientWidth - wrapperEl.scrollLeft - rdTipEl.clientWidth - 16, evnt.clientX - wrapperRect.x)}px`;
        rdTipEl.setAttribute(
          'drag-status',
          showLine ? (prevDragToChild ? 'sub' : 'normal') : 'disabled',
        );
      }
    };

    const hideDropTip = () => {
      const rdTipEl = refDragTipElem.value;
      const rdLineEl = refDragRowLineElem.value;
      const cdLineEl = refDragColLineElem.value;
      if (rdTipEl) {
        rdTipEl.style.display = '';
      }
      if (rdLineEl) {
        rdLineEl.style.display = '';
      }
      if (cdLineEl) {
        cdLineEl.style.display = '';
      }
    };

    const clearRowDragData = () => {
      let wrapperEl = refElem.value;
      const dtClss = [`.${prefixCls.value}-body--row`];
      // TODO if ($xeGantt) {
      //   const { refGanttContainerElem } = $xeGantt.getRefMaps();
      //   const ganttContainerElem = refGanttContainerElem.value;
      //   if (ganttContainerElem) {
      //     wrapperEl = ganttContainerElem;
      //   }
      //   dtClss.push('.As-gantt-view--body-row', '.As-gantt-view--chart-row');
      // }
      hideDropTip();
      clearRowDropOrigin();
      clearRowAnimate(wrapperEl, dtClss);
      internalData.prevDragToChild = false;
      reactData.dragRow = null;
      reactData.dragCol = null;
    };

    const clearColDragData = () => {
      const el = refElem.value;
      hideDropTip();
      clearColDropOrigin();
      clearColAnimate(el, [`.${prefixCls.value}--column`]);
      internalData.prevDragToChild = false;
      reactData.dragRow = null;
      reactData.dragCol = null;
    };

    /**
     * 处理显示 tooltip
     * @param {Event} evnt 事件
     * @param {Row} row 行对象
     */
    const handleTooltip = (
      evnt: MouseEvent,
      tipOpts:
        | AsTablePropTypes.FooterTooltipConfig
        | AsTablePropTypes.HeaderTooltipConfig
        | AsTablePropTypes.TooltipConfig,
      type: 'body' | 'footer' | 'header',
      tdEl: HTMLTableCellElement,
      overflowElem: HTMLElement | null,
      tipElem: HTMLElement | null,
      params: any,
    ) => {
      const tipOverEl = overflowElem || tdEl;

      if (!tipOverEl) {
        return nextTick();
      }
      params.cell = tdEl;
      const { tooltipStore } = reactData;
      const { column, row } = params;
      const { showAll, contentMethod } = tipOpts;
      const cellText = toString(
        column.type === 'html' ? tipOverEl.innerText : tipOverEl.textContent,
      ).trim();
      const isOver = tipOverEl.scrollWidth > tipOverEl.clientWidth;
      let isShow = false;
      let customContent: any = null;
      let content = '';
      if (contentMethod) {
        customContent = contentMethod(params);
      }
      // 是否全部展示
      if (showAll) {
        // 如果为 null 默认显示
        if (eqNull(customContent)) {
          isShow = true;
          content = cellText;
        } else if (customContent !== '' && customContent !== false) {
          // 如果为 '' | false 则不显示
          isShow = true;
          content = `${customContent}`;
        }
      } else {
        // 如果为 null 使用默认逻辑
        if (eqNull(customContent)) {
          isShow = isOver;
          content = cellText;
        } else if (customContent !== '' && customContent !== false) {
          // 如果为 '' | false 则不显示
          isShow = true;
          content = customContent;
        } else {
          content = cellText;
        }
      }
      if (isShow && content) {
        const tipContent = formatText(content);
        Object.assign(tooltipStore, {
          row,
          column,
          visible: true,
          content: tipContent,
          type,
          currOpts: tipOpts,
        });
        nextTick(() => {
          const $tooltip = refTooltip.value;
          if ($tooltip && $tooltip.open) {
            $tooltip.open(isOver ? tipOverEl : tipElem, tipContent);
          }
        });
      }
      return nextTick();
    };

    const truncateStackHistory = () => {
      const { stackHistoryStore } = internalData;
      const { undoStacks } = stackHistoryStore;
      const undoRedoHistoryOpts = computeUndoRedoHistoryOpts.value;
      const { stackSize } = undoRedoHistoryOpts;
      if (undoStacks.length > toNumber(stackSize)) {
        undoStacks.shift();
      }
    };

    /**
     * 生成快照数据
     */
    const getSnapshotStackData = () => {
      const { editStore } = reactData;
      const { afterFullData, elemStore, insertRowMaps, removeRowMaps } =
        internalData;
      const { selected, actived } = editStore;
      const { row: selectRow, column: selectColumn } = selected;
      const { row: editRow, column: editColumn } = actived;
      const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
      const stackObj: AsTableDefines.HistoryStackObj = {
        selectActiveInfo:
          selectRow && selectColumn
            ? {
                rowid: getRowid($asTable, selectRow),
                colid: selectColumn.id,
              }
            : undefined,
        editActiveInfo:
          editRow && editColumn
            ? {
                rowid: getRowid($asTable, editRow),
                colid: editColumn.id,
              }
            : undefined,
        scrollInfo: {
          top: bodyScrollElem ? bodyScrollElem.scrollTop : 0,
          left: bodyScrollElem ? bodyScrollElem.scrollLeft : 0,
        },
        insertData: clone(values(insertRowMaps), true),
        removeData: clone(values(removeRowMaps), true),
        visibleData: clone(afterFullData, true),
        visibleTreeData: [],
        visibleColumn: [],
      };
      return $asTable.getCellAreaPushStackObj
        ? $asTable.getCellAreaPushStackObj(stackObj)
        : stackObj;
    };

    /**
     * 刷新栈视图
     */
    const handleUpdateSnapshotStackData = (
      stackObj: AsTableDefines.HistoryStackObj | null | undefined,
    ) => {
      const { treeConfig } = props;
      const { editStore } = reactData;
      const { fullAllDataRowIdData, fullColumnIdData } = internalData;
      if (!stackObj) {
        return;
      }
      const treeOpts = computeTreeOpts.value;
      const { transform } = treeOpts;
      const {
        visibleData,
        editActiveInfo,
        selectActiveInfo,
        scrollInfo,
        insertData,
        removeData,
      } = stackObj;

      const iRowMaps: Record<string, any> = {};
      insertData.forEach((item) => {
        const rowid = getRowid($asTable, item);
        const rest = fullAllDataRowIdData[rowid];
        let row = item;
        if (rest) {
          row = rest.row;
          Object.assign(row, item);
        }
        iRowMaps[rowid] = row;
      });

      const rRowMaps: Record<string, any> = {};
      removeData.forEach((item) => {
        const rowid = getRowid($asTable, item);
        const rest = fullAllDataRowIdData[rowid];
        let row = item;
        if (rest) {
          row = rest.row;
          Object.assign(row, item);
        }
        rRowMaps[rowid] = row;
      });

      const afterFullList = visibleData.map((item) => {
        const rowid = getRowid($asTable, item);
        const rest = fullAllDataRowIdData[rowid];
        let row = item;
        if (rest) {
          row = rest.row;
          Object.assign(row, item);
        }
        return row;
      });

      internalData.insertRowMaps = iRowMaps;
      internalData.removeRowMaps = rRowMaps;
      internalData.afterFullData = afterFullList;

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

      if ($asTable.handleCellAreaSnapshotStackData) {
        $asTable.handleCellAreaSnapshotStackData(stackObj);
      } else {
        const { selected } = editStore;
        const mouseOpts = computeMouseOpts.value;
        let selectRowid = '';
        let selectColid = '';
        if (editActiveInfo) {
          selectRowid = editActiveInfo.rowid;
          selectColid = editActiveInfo.colid;
        } else if (selectActiveInfo) {
          selectRowid = selectActiveInfo.rowid;
          selectColid = selectActiveInfo.colid;
        }
        if (selectRowid && selectColid && mouseOpts.selected) {
          const editRow = fullAllDataRowIdData[selectRowid]
            ? fullAllDataRowIdData[selectRowid]!.row
            : null;
          const editColumn = fullColumnIdData[selectColid]
            ? fullColumnIdData[selectColid]!.column
            : null;
          if (editRow && editColumn) {
            const params = {
              row: editRow,
              column: editColumn,
            };
            selected.row = editRow;
            selected.column = editColumn;
            selected.args = params;
            nextTick(() => {
              $asTable.addCellSelectedClass();
              $asTable.scrollTo(scrollInfo);
            });
          }
        }
      }
    };

    const callSlot = <T,>(
      slotFunc:
        | ((params: T) => AsComponentSlotType | AsComponentSlotType[])
        | null
        | string,
      params: T,
    ): AsComponentSlotType[] => {
      // TODO if ($xeGGWrapper) {
      //   return $xeGGWrapper.callSlot(slotFunc, params);
      // }
      if (slotFunc && isFunction(slotFunc)) {
        return getSlotVNs(slotFunc(params));
      }
      return [];
    };

    tablePrivateMethods = {
      updateAfterDataIndex,
      callSlot,
      /**
       * 获取父容器元素
       */
      getParentElem() {
        const el = refElem.value;
        // TODO if ($xeGGWrapper) {
        //   const gridEl = $xeGGWrapper.getRefMaps().refElem.value
        //   return gridEl ? gridEl.parentNode as HTMLElement : null
        // }
        return el ? (el.parentNode as HTMLElement) : null;
      },
      /** 获取父容器的高度 */
      getParentHeight() {
        const { height } = props;
        const el = refElem.value;
        if (el) {
          const parentElem = el.parentNode as HTMLElement;
          let parentPaddingSize = 0;
          let parentWrapperHeight = 0;
          if (parentElem) {
            // TODO if ($xeGantt && hasClass(parentElem, 'As-gantt--table-wrapper')) {
            //   parentWrapperHeight = $xeGantt.getParentHeight()
            // } else if ($xeGrid && hasClass(parentElem, 'As-grid--table-wrapper')) {
            //   parentWrapperHeight = $xeGrid.getParentHeight()
            // } else {
            parentWrapperHeight = parentElem.clientHeight;
            parentPaddingSize =
              height === '100%' || height === 'auto'
                ? getPaddingTopBottomSize(parentElem)
                : 0;
            // }
          }
          return Math.floor(parentWrapperHeight - parentPaddingSize);
        }
        return 0;
      },

      /**
       * 获取需要排除的高度
       * 但渲染表格高度时，需要排除工具栏或分页等相关组件的高度
       * 如果存在表尾合计滚动条，则需要排除滚动条高度
       */
      getExcludeHeight() {
        // TODO return $xeGGWrapper ? $xeGGWrapper.getExcludeHeight() : 0
        return 0;
      },

      /**
       * 定义行数据中的列属性，如果不存在则定义
       * @param {Row} records 行数据
       */
      defineField(records) {
        const { treeConfig } = props;
        const expandOpts = computeExpandOpts.value;
        const treeOpts = computeTreeOpts.value;
        const radioOpts = computeRadioOpts.value;
        const rowOpts = computeRowOpts.value;
        const checkboxOpts = computeCheckboxOpts.value;
        const childrenField = treeOpts.childrenField;
        const rowkey = getRowkey($asTable);
        if (!isArray(records)) {
          records = [records];
        }
        return records.map((record) => {
          internalData.tableFullColumn.forEach((column) => {
            const { field, editRender } = column;
            if (field && !has(record, field) && !record[field]) {
              let cellValue = null;
              if (editRender) {
                const { defaultValue } = editRender;
                if (isFunction(defaultValue)) {
                  cellValue = defaultValue({ column });
                } else if (!isUndefined(defaultValue)) {
                  cellValue = defaultValue;
                }
              }
              set(record, field, cellValue);
            }
          });
          const otherFields: (string | undefined)[] = [
            radioOpts.labelField,
            checkboxOpts.checkField,
            checkboxOpts.labelField,
            expandOpts.labelField,
          ];
          otherFields.forEach((key) => {
            if (key && eqEmptyValue(get(record, key))) {
              set(record, key, null);
            }
          });
          if (
            treeConfig &&
            treeOpts.lazy &&
            isUndefined(record[childrenField])
          ) {
            record[childrenField] = null;
          }
          // 必须有行数据的唯一主键，可以自行设置；也可以默认生成一个随机数
          if (eqEmptyValue(get(record, rowkey))) {
            set(record, rowkey, createRowId(rowOpts, record, rowkey));
          }
          return record;
        });
      },

      /** 负责"条件"：筛选 + 排序 + 重算序号 → afterFullData */
      handleTableData(force?: boolean) {
        const { scrollYLoad } = reactData;
        const { scrollYStore, fullDataRowIdData } = internalData;
        // TODO const $xeGanttView = internalData.xeGanttView
        let fullList: any[] = internalData.afterFullData;
        // 是否进行数据处理
        if (force) {
          // 更新数据，处理筛选和排序
          updateAfterFullData();
          // 如果为虚拟树，将树结构拍平
          fullList = handleVirtualTreeToList();
          //  更新数据后清除合并缓存，涉及分组、筛选、排序等
          internalData.mergeHeaderRowMaps = {};
          internalData.mergeHeaderColMaps = {};
          internalData.mergeBodyRowMaps = {};
          internalData.mergeBodyColMaps = {};
          internalData.mergeFooterRowMaps = {};
          internalData.mergeFooterColMaps = {};
        }
        const tableData = scrollYLoad
          ? fullList.slice(scrollYStore.startIndex, scrollYStore.endIndex)
          : fullList.slice(0);
        reactData.tableData = tableData;
        const visibleDataRowIdMaps: Record<string, any> = {};
        tableData.forEach((row, $index) => {
          const rowid = getRowid($asTable, row);
          const rest = fullDataRowIdData[rowid];
          if (rest) {
            rest.$index = $index;
          }
          visibleDataRowIdMaps[rowid] = row;
        });
        reactData.tableData = tableData;
        internalData.visibleDataRowIdData = visibleDataRowIdMaps;
        // TODO if ($xeGanttView && $xeGanttView.updateViewData) {
        //   $xeGanttView.updateViewData(force)
        // }
        return nextTick();
      },

      /**
       * 重建/刷新表格的行缓存映射
       * 把当前表格数据按 rowid 建立成一份可快速查找的行元数据缓存
       * 并同步勾选、展开、懒加载等状态
       */
      cacheRowMap(isReset) {
        const { treeConfig } = props;
        const { isRowGroupStatus } = reactData;
        const {
          currKeyField,
          fullAllDataRowIdData,
          selectCheckboxMaps,
          rowExpandedMaps,
          tableFullTreeData,
          treeExpandedMaps,
          tableFullGroupData,
          tableFullData,
        } = internalData;
        const fullAllDataRowIdMaps: Record<
          string,
          AsTableDefines.RowCacheItem
        > = isReset ? {} : { ...fullAllDataRowIdData }; // 存在已删除数据
        const fullDataRowIdMaps: Record<string, AsTableDefines.RowCacheItem> =
          {};

        const idMaps: Record<string, boolean> = {};
        const { handleUpdateRowId } = createHandleUpdateRowId($asTable);

        let rowNum = 0;

        /**
         * 建行缓存
         * @param row 当前行对象（引用，不是拷贝）
         * @param index 在 items 数组里的下标
         * @param items 当前行所在的数组（父节点的 children，或顶层数组）
         * @param currIndex 在顶层数据数组里的下标（非根节点传 -1）
         * @param parentRow 父行对象（树/行分组有值，普通列表为 null）
         * @param rowid rowid（由调用方算好传进来，不是这里算的）
         * @param level 层级深度（根 = 0）
         * @param seq 显示序号（列表是 1,2,3；树是 '1.2.1'）
         */
        const handleRowCache = (
          row: any,
          index: number,
          items: any,
          currIndex: number,
          parentRow: any,
          rowid: string,
          level: number,
          seq: number | string,
        ) => {
          let rowRest = fullAllDataRowIdMaps[rowid];
          if (idMaps[rowid]) {
            log.error('repeatKey', [currKeyField, rowid]);
          }
          if (!rowRest) {
            rowRest = {
              row,
              rowid,
              _seq: -1,
              seq,
              index: -1,
              _index: -1,
              $index: -1,
              treeIndex: index,
              _tIndex: -1,
              items,
              parent: parentRow,
              level,
              height: 0,
              resizeHeight: 0,
              oTop: 0,
              expandHeight: 0,
            };
            fullDataRowIdMaps[rowid] = rowRest;
            fullAllDataRowIdMaps[rowid] = rowRest;
          }

          //  懒加载标记每次重新加载都清掉（树/行展开的"已加载"状态作废）
          rowRest.treeLoaded = false;
          rowRest.expandLoaded = false;

          rowRest._seq = rowNum++; //  写内部序号（这里自增了一次）
          rowRest.row = row; //  刷新行对象引用（数据可能被整体替换过）
          rowRest.items = items; //  它所在的数组
          rowRest.parent = parentRow; //  父行（树/分组才有）
          rowRest.level = level; // 层级
          rowRest.index = currIndex; //  在原始数组里的下标
          rowRest.treeIndex = index; //  在父节点 children 里的下标
          // 更新缓存
          if (selectCheckboxMaps[rowid]) {
            selectCheckboxMaps[rowid] = row; // 把勾选表里指向"旧行对象"的引用换成新对象
          }
          if (rowExpandedMaps[rowid]) {
            rowExpandedMaps[rowid] = row; //  行展开状态同理
          }

          rowNum++; //  又自增了一次（见后面的"观察"）
          idMaps[rowid] = true; //  登记去重表
          fullDataRowIdMaps[rowid] = rowRest;
          fullAllDataRowIdMaps[rowid] = rowRest;
        };

        if (treeConfig) {
          const treeOpts = computeTreeOpts.value;
          const { lazy } = treeOpts;
          const childrenField = treeOpts.childrenField!;
          const hasChildField = treeOpts.hasChildField!;
          eachTree(
            tableFullTreeData,
            (row, index, items, path, parentRow, nodes) => {
              const rowid = handleUpdateRowId(row);
              if (lazy) {
                if (row[hasChildField] && row[childrenField] === undefined) {
                  row[childrenField] = null;
                }
                if (
                  treeExpandedMaps[rowid] &&
                  (!row[childrenField] || row[childrenField].length === 0)
                ) {
                  delete treeExpandedMaps[rowid];
                }
              }
              handleRowCache(
                row,
                index,
                items,
                parentRow ? -1 : index,
                parentRow,
                rowid,
                nodes.length - 1,
                toTreePathSeq(path),
              );
            },
            { children: childrenField },
          );
        } else if (isRowGroupStatus) {
          const aggregateOpts = computeAggregateOpts.value;
          const { mapChildrenField } = aggregateOpts;
          eachTree(
            tableFullGroupData,
            (row, index, items, path, parentRow, nodes) => {
              const rowid = handleUpdateRowId(row);
              handleRowCache(
                row,
                index,
                items,
                parentRow ? -1 : index,
                parentRow,
                rowid,
                nodes.length - 1,
                toTreePathSeq(path),
              );
            },
            { children: mapChildrenField },
          );
        } else {
          tableFullData.forEach((row, index, items) => {
            handleRowCache(
              row,
              index,
              items,
              index,
              null,
              handleUpdateRowId(row),
              0,
              index + 1,
            );
          });
        }

        internalData.fullDataRowIdData = fullDataRowIdMaps;
        internalData.fullAllDataRowIdData = fullAllDataRowIdMaps;
        reactData.treeExpandedFlag++;
      },

      cacheSourceMap(fullData) {
        const { treeConfig } = props;
        const treeOpts = computeTreeOpts.value;
        const sourceData = clone(fullData, true);
        const { handleUpdateRowId } = createHandleUpdateRowId($asTable);
        const sourceRowIdData: Record<string, any> = {};
        const handleSourceRow = (row: any) => {
          const rowid = handleUpdateRowId(row);
          sourceRowIdData[rowid] = row;
        };
        // 源数据缓存
        if (treeConfig) {
          const childrenField = treeOpts.childrenField;
          eachTree(sourceData, handleSourceRow, {
            children: treeOpts.transform
              ? treeOpts.mapChildrenField
              : childrenField,
          });
        } else {
          sourceData.forEach(handleSourceRow);
        }
        // 按行做 diff 的基准
        internalData.sourceDataRowIdData = sourceRowIdData;
        // 整表回滚的基准
        internalData.tableSourceData = sourceData as any;
      },

      /**
       * 指定列宽的列进行拆分，分桶逻辑
       */
      analyColumnWidth() {
        const { tableFullColumn } = internalData;
        const columnOpts = computeColumnOpts.value;
        const { width: defaultWidth, minWidth: defaultMinWidth } = columnOpts;
        const resizeList: AsTableDefines.ColumnInfo[] = [];
        const pxList: AsTableDefines.ColumnInfo[] = [];
        const pxMinList: AsTableDefines.ColumnInfo[] = [];
        const autoMinList: AsTableDefines.ColumnInfo[] = [];
        const scaleList: AsTableDefines.ColumnInfo[] = [];
        const scaleMinList: AsTableDefines.ColumnInfo[] = [];
        const autoList: AsTableDefines.ColumnInfo[] = [];
        const remainList: AsTableDefines.ColumnInfo[] = [];
        tableFullColumn.forEach((column) => {
          if (defaultWidth && !column.width) {
            column.width = defaultWidth;
          }
          if (defaultMinWidth && !column.minWidth) {
            column.minWidth = defaultMinWidth;
          }
          if (column.visible) {
            if (column.resizeWidth) {
              resizeList.push(column);
            } else if (column.width === 'auto') {
              autoList.push(column);
            } else if (isPx(column.width)) {
              pxList.push(column);
            } else if (isScale(column.width)) {
              scaleList.push(column);
            } else if (isPx(column.minWidth)) {
              pxMinList.push(column);
            } else if (column.minWidth === 'auto') {
              autoMinList.push(column);
            } else if (isScale(column.minWidth)) {
              scaleMinList.push(column);
            } else {
              remainList.push(column);
            }
          }
        });
        Object.assign(reactData.columnStore, {
          resizeList,
          pxList,
          pxMinList,
          autoMinList,
          scaleList,
          scaleMinList,
          autoList,
          remainList,
        });
      },

      handleColResizeMousedownEvent(evnt, fixedType, params) {
        const isLeftBtn = evnt.button === 0;
        if (!isLeftBtn) {
          return;
        }
        evnt.stopPropagation();
        evnt.preventDefault();
        const { column } = params;
        const { columnStore, overflowX, scrollbarHeight } = reactData;
        const { visibleColumn } = internalData;
        const { leftList, rightList } = columnStore;
        const resizableOpts = computeResizableOpts.value;
        const osbHeight = overflowX ? scrollbarHeight : 0;
        const tableEl = refElem.value;
        const leftContainerElem = refLeftContainer.value;
        const rightContainerElem = refRightContainer.value;
        const resizeBarElem = refColResizeBar.value;
        if (!resizeBarElem) {
          return;
        }
        const isLeftFixed = fixedType === 'left';
        const isRightFixed = fixedType === 'right';
        const resizeTipElem = resizeBarElem.firstElementChild as HTMLDivElement;
        const scrollbarXToTop = computeScrollbarXToTop.value;
        const { clientX: dragClientX } = evnt;
        const dragBtnElem = evnt.target as HTMLDivElement;
        let cell = dragBtnElem.parentElement as HTMLTableCellElement | null;
        let resizeColumn = column;
        const isDragGroupCol = column.children && column.children.length > 0;
        if (isDragGroupCol) {
          resizeColumn = getLastChildColumn(column);
          if (isDragGroupCol) {
            const trEl = cell
              ? (cell.parentElement as HTMLTableRowElement)
              : null;
            const theadEl = trEl
              ? (trEl.parentElement as HTMLTableElement)
              : null;
            cell = theadEl
              ? theadEl.querySelector<HTMLTableCellElement>(
                  `.${prefixCls.value}-header--column[colid="${CSS.escape(resizeColumn.id)}"]`,
                )
              : null;
          }
        }
        if (!cell) {
          return;
        }
        const cellParams = assign(params, {
          cell,
          $table: $asTable,
          prefixCls: prefixCls.value,
        });
        let dragLeft = 0;
        const tableRect = tableEl.getBoundingClientRect();
        const rightContainerRect = rightContainerElem
          ? rightContainerElem.getBoundingClientRect()
          : null;
        const cellRect = cell.getBoundingClientRect();
        const dragBtnRect = dragBtnElem.getBoundingClientRect();

        const dragBtnWidth = dragBtnElem.clientWidth;
        const dragBtnOffsetWidth = floor(dragBtnWidth / 2);
        const dragPosLeft = dragBtnRect.x - tableRect.x + dragBtnOffsetWidth;

        const minInterval = getColReMinWidth(cellParams) - dragBtnOffsetWidth; // 列之间的最小间距
        const maxInterval = getColReMaxWidth(cellParams); // 列之间的最大间距
        const dragMinLeft = isRightFixed
          ? 0
          : cellRect.x - tableRect.x + dragBtnWidth + minInterval;
        const dragMaxLeft =
          cellRect.x - tableRect.x + cell.clientWidth - minInterval;

        let fixedLeftRemainWidth = 0;
        let fixedRightRemainWidth = 0;
        if (isLeftFixed || isRightFixed) {
          let isMach = false;
          const fixedColumn = isLeftFixed ? leftList : rightList;
          for (const item of fixedColumn) {
            if (isMach) {
              fixedLeftRemainWidth += item.renderWidth;
            } else {
              isMach = item.id === resizeColumn.id;
              if (!isMach) {
                fixedRightRemainWidth += item.renderWidth;
              }
            }
          }
        }

        // 处理拖动事件
        const updateEvent = (evnt: MouseEvent) => {
          evnt.stopPropagation();
          evnt.preventDefault();
          const tableHeight = tableEl.clientHeight;
          const offsetX = evnt.clientX - dragClientX;
          let left = dragPosLeft + offsetX;

          if (isLeftFixed) {
            if (rightContainerRect) {
              left = Math.min(
                left,
                rightContainerRect.x -
                  tableRect.x -
                  fixedLeftRemainWidth -
                  minInterval,
              );
            }
          } else if (isRightFixed) {
            if (leftContainerElem) {
              left = Math.max(
                left,
                leftContainerElem.clientWidth +
                  fixedRightRemainWidth +
                  minInterval,
              );
            }
            left = Math.min(left, dragMaxLeft);
          }

          dragLeft = Math.max(left, dragMinLeft);
          // 最大宽
          if (maxInterval > 1) {
            dragLeft = Math.min(
              dragLeft,
              maxInterval + dragMinLeft - minInterval,
            );
          }
          const resizeBarLeft = Math.max(1, dragLeft);
          resizeBarElem.style.left = `${resizeBarLeft}px`;
          resizeBarElem.style.top = `${scrollbarXToTop ? osbHeight : 0}px`;
          resizeBarElem.style.height = `${scrollbarXToTop ? tableHeight - osbHeight : tableHeight}px`;
          if (resizableOpts.showDragTip && resizeTipElem) {
            resizeTipElem.textContent = formatLocaleText(
              locale?.value.resizeColTip,
              Math.floor(
                resizeColumn.renderWidth +
                  (isRightFixed
                    ? dragPosLeft - dragLeft
                    : dragLeft - dragPosLeft),
              ),
            );
            const tableWrapperWidth = tableEl.clientWidth;
            const resizeBarWidth = resizeBarElem.clientWidth;
            const resizeTipWidth = resizeTipElem.clientWidth;
            const resizeTipHeight = resizeTipElem.clientHeight;
            let resizeTipLeft = -resizeTipWidth;
            if (resizeBarLeft < resizeTipWidth + resizeBarWidth) {
              resizeTipLeft = 0;
            } else if (resizeBarLeft > tableWrapperWidth) {
              resizeTipLeft += tableWrapperWidth - resizeBarLeft;
            }
            resizeTipElem.style.left = `${resizeTipLeft}px`;
            resizeTipElem.style.top = `${Math.min(tableHeight - resizeTipHeight, Math.max(0, evnt.clientY - tableRect.y - resizeTipHeight / 2))}px`;
          }
          reactData.isDragResize = true;
        };

        reactData.isDragResize = true;
        addClass(tableEl, 'col-drag--resize');
        resizeBarElem.style.display = 'block';
        document.onmousemove = updateEvent;
        document.onmouseup = function (evnt) {
          document.onmousemove = null;
          document.onmouseup = null;
          resizeBarElem.style.display = 'none';
          internalData._lastResizeTime = Date.now();

          setTimeout(() => {
            reactData.isDragResize = false;
          }, 50);

          const resizeWidth =
            resizeColumn.renderWidth +
            (isRightFixed ? dragPosLeft - dragLeft : dragLeft - dragPosLeft);
          const resizeParams = { ...params, resizeWidth, resizeColumn };
          if (resizableOpts.dragMode === 'fixed') {
            visibleColumn.forEach((item) => {
              if (item.id !== resizeColumn.id && !item.resizeWidth) {
                item.resizeWidth = item.renderWidth;
              }
            });
          }

          if ($asTable.handleColResizeCellAreaEvent) {
            $asTable.handleColResizeCellAreaEvent(evnt, resizeParams);
          } else {
            resizeColumn.resizeWidth = resizeWidth;
            handleUpdateColResize(evnt, resizeParams);
          }
          removeClass(tableEl, 'col-drag--resize');
        };
        updateEvent(evnt);
        if ($asTable.closeMenu) {
          $asTable.closeMenu();
        }
      },
      handleColResizeDblclickEvent(evnt, params) {
        const resizableOpts = computeResizableOpts.value;
        const { isDblclickAutoWidth } = resizableOpts;
        const el = refElem.value;
        if (isDblclickAutoWidth && el) {
          evnt.stopPropagation();
          evnt.preventDefault();
          const { fullColumnIdData } = internalData;
          const { column } = params;
          let resizeColumn = column;
          if (column.children && column.children.length > 0) {
            eachTree(column.children, (childColumn) => {
              resizeColumn = childColumn;
            });
          }
          const colid = resizeColumn.id;
          const colRest = fullColumnIdData[colid];
          const dragBtnElem = evnt.target as HTMLDivElement;
          const cell = dragBtnElem.parentNode as HTMLTableCellElement;
          const cellParams = Object.assign(params, {
            cell,
            $table: $asTable,
          });
          const colMinWidth = getColReMinWidth(cellParams);
          const colMaxWidth = getColReMaxWidth(cellParams);

          el.dataset.calcCol = 'Y';
          let resizeWidth = calcColumnAutoWidth(resizeColumn, el);
          delete el.dataset.calcCol;
          if (colRest) {
            resizeWidth = Math.max(resizeWidth, colRest.width);
          }
          resizeWidth = Math.max(colMinWidth, resizeWidth);
          if (colMaxWidth > 1) {
            resizeWidth = Math.min(colMaxWidth, resizeWidth);
          }
          const resizeParams = { ...params, resizeWidth, resizeColumn };
          reactData.isDragResize = false;
          internalData._lastResizeTime = Date.now();

          if ($asTable.handleColResizeDblclickCellAreaEvent) {
            $asTable.handleColResizeDblclickCellAreaEvent(evnt, resizeParams);
          } else {
            resizeColumn.resizeWidth = resizeWidth;
            handleUpdateColResize(evnt, resizeParams);
          }
        }
      },
      /**
       * @private
       */
      handleRowResizeMousedownEvent(evnt, params) {
        evnt.stopPropagation();
        evnt.preventDefault();
        const { row } = params;
        const { showOverflow } = props;
        const { overflowX, scrollbarWidth, overflowY, scrollbarHeight } =
          reactData;
        const { elemStore, fullAllDataRowIdData } = internalData;
        const osbWidth = overflowY ? scrollbarWidth : 0;
        const osbHeight = overflowX ? scrollbarHeight : 0;
        const scrollbarYToLeft = computeScrollbarYToLeft.value;
        const resizableOpts = computeResizableOpts.value;
        const cellOpts = computeCellOpts.value;
        let tableEl = refElem.value;
        // TODO if ($xeGantt) {
        //   const { refGanttContainerElem } = $xeGantt.getRefMaps()
        //   const ganttContainerElem = refGanttContainerElem.value
        //   if (ganttContainerElem) {
        //     tableEl = ganttContainerElem
        //   }
        // }
        const resizeBarElem = refRowResizeBar.value;
        if (!resizeBarElem) {
          return;
        }
        const { clientY: dragClientY } = evnt;
        const resizeTipElem = resizeBarElem.firstElementChild as HTMLDivElement;
        const dragBtnElem = evnt.currentTarget as HTMLDivElement;
        const tdEl = dragBtnElem.parentNode as HTMLTableCellElement;
        const trEl = tdEl.parentNode as HTMLTableCellElement;
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        if (!bodyScrollElem) {
          return;
        }
        const rowid = getRowid($asTable, row);
        const rowRest = fullAllDataRowIdData[rowid];
        if (!rowRest) {
          return;
        }
        const defaultRowHeight = computeDefaultRowHeight.value;
        let currCellHeight = getCellRestHeight(
          rowRest,
          cellOpts,
          defaultRowHeight,
        );
        if (!showOverflow) {
          currCellHeight = tdEl.clientHeight;
        }
        const tableRect = tableEl.getBoundingClientRect();
        const trRect = trEl.getBoundingClientRect();
        const targetOffsetY = dragClientY - trRect.y - trEl.clientHeight;
        let resizeHeight = currCellHeight;
        const cellEl = tdEl.querySelector(`.${prefixCls.value}-cell`);
        let cellMinHeight = 0;
        if (cellEl) {
          const cellStyle = getComputedStyle(cellEl);
          cellMinHeight = Math.max(
            1,
            Math.ceil(
              toNumber(cellStyle.paddingTop) +
                toNumber(cellStyle.paddingBottom),
            ),
          );
        }
        const minTop = trRect.y - tableRect.y + cellMinHeight;
        // 处理拖动事件
        const updateEvent = (evnt: MouseEvent) => {
          evnt.stopPropagation();
          evnt.preventDefault();
          const rtWidth = tableEl.clientWidth - osbWidth;
          const tableHeight = tableEl.clientHeight - osbHeight;
          let dragTop = evnt.clientY - tableRect.y - targetOffsetY;
          if (dragTop < minTop) {
            dragTop = minTop;
          } else {
            resizeHeight = Math.max(
              cellMinHeight,
              currCellHeight + evnt.clientY - dragClientY,
            );
          }
          resizeBarElem.style.left = `${scrollbarYToLeft ? osbWidth : 0}px`;
          resizeBarElem.style.top = `${dragTop}px`;
          resizeBarElem.style.width = `${rtWidth}px`;
          if (resizableOpts.showDragTip && resizeTipElem) {
            resizeTipElem.textContent = formatLocaleText(
              locale?.value.resizeRowTip,
              resizeHeight,
            );
            const resizeTipWidth = resizeTipElem.clientWidth;
            const resizeTipHeight = resizeTipElem.clientHeight;
            let resizeBarLeft = Math.max(2, evnt.clientX - tableRect.x);
            let resizeBarTop = 0;
            if (resizeBarLeft + resizeTipWidth >= rtWidth - 2) {
              resizeBarLeft = rtWidth - resizeTipWidth - 2;
            }
            if (dragTop + resizeTipHeight >= tableHeight) {
              resizeBarTop = tableHeight - (dragTop + resizeTipHeight);
            }
            resizeTipElem.style.left = `${resizeBarLeft}px`;
            resizeTipElem.style.top = `${resizeBarTop}px`;
          }
          reactData.isDragResize = true;
        };

        reactData.isDragResize = true;
        addClass(tableEl, 'row-drag--resize');
        resizeBarElem.style.display = 'block';
        document.onmousemove = updateEvent;
        document.onmouseup = function (evnt) {
          document.onmousemove = null;
          document.onmouseup = null;
          resizeBarElem.style.display = 'none';
          internalData._lastResizeTime = Date.now();

          setTimeout(() => {
            reactData.isDragResize = false;
          }, 50);

          if (resizeHeight !== currCellHeight) {
            const resizeParams = { ...params, resizeHeight, resizeRow: row };
            internalData.isResizeCellHeight = true;
            if ($asTable.handleRowResizeCellAreaEvent) {
              $asTable.handleRowResizeCellAreaEvent(evnt, resizeParams);
            } else {
              rowRest.resizeHeight = resizeHeight;
              handleUpdateRowResize(evnt, resizeParams);
              updateRowOffsetTop();
            }
          }
          removeClass(tableEl, 'row-drag--resize');
        };
        updateEvent(evnt);
      },

      /**
       * @private
       */
      handleRowResizeDblclickEvent(evnt, params) {
        const resizableOpts = computeResizableOpts.value;
        const { isDblclickAutoHeight } = resizableOpts;
        const el = refElem.value;
        if (isDblclickAutoHeight && el) {
          evnt.stopPropagation();
          evnt.preventDefault();
          const { editStore } = reactData;
          const { fullAllDataRowIdData } = internalData;
          const { actived } = editStore;
          const { row } = params;
          const rowid = getRowid($asTable, row);
          const rowRest = fullAllDataRowIdData[rowid];
          if (!rowRest) {
            return;
          }
          const handleRsHeight = () => {
            el.dataset.calcRow = 'Y';
            const resizeHeight = calcCellAutoHeight(rowid, rowRest, el);
            delete el.dataset.calcRow;
            const resizeParams = { ...params, resizeHeight, resizeRow: row };
            reactData.isDragResize = false;
            internalData._lastResizeTime = Date.now();
            if ($asTable.handleRowResizeDblclickCellAreaEvent) {
              $asTable.handleRowResizeDblclickCellAreaEvent(evnt, resizeParams);
            } else {
              rowRest.resizeHeight = resizeHeight;
              handleUpdateRowResize(evnt, resizeParams);
            }
          };
          if (actived.row || actived.column) {
            $asTable.clearEdit().then(handleRsHeight);
          } else {
            handleRsHeight();
          }
        }
      },
      /**
       * @private
       */
      saveCustomStore(type) {
        const { customConfig } = props;
        const tableId = computeTableId.value;
        const customOpts = computeCustomOpts.value;
        const { updateStore, storage } = customOpts;
        const {
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
        } = handleCustomStoreConfig($asTable);

        if (type !== 'reset') {
          // fix：修复拖动列宽，重置按钮无法点击的问题
          reactData.isCustomStatus = true;
        }
        if (
          storage &&
          (customConfig ? isEnableConf(customOpts) : customOpts.enabled) &&
          (isCustomAlign ||
            isCustomHeaderAlign ||
            isCustomFooterAlign ||
            isCustomResizable ||
            isCustomVisible ||
            isCustomFixed ||
            isCustomSort ||
            isCustomAggGroup ||
            isCustomAggFunc ||
            isCustomPager)
        ) {
          if (!tableId) {
            log.error('reqProp', ['id']);
            return nextTick();
          }
          const storeData: AsTableDefines.CustomStoreData =
            type === 'reset'
              ? {
                  pagerData: {},
                  alignData: {},
                  headerAlignData: {},
                  footerAlignData: {},
                  resizableData: {},
                  sortData: [],
                  visibleData: {},
                  fixedData: {},
                  aggGroupData: {},
                  aggFuncData: {},
                }
              : $asTable.getCustomStoreData();
          if (updateStore) {
            return updateStore({
              $table: $asTable,
              id: tableId,
              type,
              storeData,
            });
          } else {
            setCustomStorageMap(tableId, type === 'reset' ? null : storeData);
          }
        }
        return nextTick();
      },
      /**
       * @private
       */
      handleCustom() {
        const { mouseConfig } = props;
        if (mouseConfig) {
          if ($asTable.clearSelected) {
            $asTable.clearSelected();
          }
          if ($asTable.clearCellAreas) {
            $asTable.clearCellAreas();
            $asTable.clearCopyCellArea();
          }
        }
        $asTable.analyColumnWidth();
        return $asTable.refreshColumn(true);
      },
      handleUpdateDataQueue() {
        reactData.upDataFlag++;
      },
      handleRefreshColumnQueue() {
        reactData.reColumnFlag++;
      },
      handleFilterOptions(column) {
        if (!column) {
          return;
        }

        const { filterStore } = reactData;
        const { filterRender, filters } = column;
        const rendererOpts = computeRendererOpts.value;
        const filterOptions = filters || [];
        const compConf =
          isEnableConf(filterRender) && filterRender.name
            ? rendererOpts[filterRender.name] || renderer.get(filterRender.name)
            : null;
        const frMethod =
          column.filterRecoverMethod ||
          (compConf ? compConf.tableFilterRecoverMethod : null);
        filterStore.column = column;
        // 复原状态
        filterOptions.forEach((option: any) => {
          const { _checked, checked } = option;
          option._checked = checked;
          if (!checked && _checked !== checked && frMethod) {
            frMethod({ option, column, $table: $asTable });
          }
        });
        $asTable.checkFilterOptions();
      },
      preventEvent(evnt, type, args, next, end) {
        let evntList = interceptor.get(type);
        let rest = null;
        let isStop = false;
        for (const func of evntList) {
          const fnRest = func(
            Object.assign(
              {
                $table: $asTable,
                // TODO $grid: $xeGrid,
                // gantt: $xeGantt,
                $event: evnt,
              },
              args,
            ),
          );
          if (fnRest === false) {
            isStop = true;
            break;
          } else if (fnRest && fnRest.status === false) {
            rest = fnRest.result;
            isStop = true;
            break;
          }
        }
        if (!isStop && next) {
          rest = next();
        }
        if (end) {
          end();
        }
        return rest;
      },
      updateCheckboxStatus() {
        const { treeConfig } = props;
        const { isRowGroupStatus } = reactData;
        const {
          afterTreeFullData,
          afterGroupFullData,
          selectCheckboxMaps,
          treeIndeterminateRowMaps,
        } = internalData;
        const aggregateOpts = computeAggregateOpts.value;
        const treeOpts = computeTreeOpts.value;
        const childrenField = treeOpts.childrenField;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField, indeterminateField, checkStrictly, checkMethod } =
          checkboxOpts;
        if (checkStrictly) {
          return;
        }
        if (isRowGroupStatus || treeConfig) {
          const { handleGetRowId } = createHandleGetRowId($asTable);
          const childRowMaps: Record<string, number> = {};
          const childRowList: any[][] = [];

          if (isRowGroupStatus) {
            // 行分组
            const mapChildrenField = aggregateOpts.mapChildrenField;
            if (mapChildrenField) {
              eachTree(
                afterGroupFullData,
                (row: any) => {
                  const rowid = handleGetRowId(row);
                  const childList = row[mapChildrenField];
                  if (
                    childList &&
                    childList.length > 0 &&
                    !childRowMaps[rowid]
                  ) {
                    childRowMaps[rowid] = 1;
                    childRowList.unshift([row, rowid, childList]);
                  }
                },
                { children: mapChildrenField },
              );
            }
          } else if (treeConfig) {
            // 树结构
            const { transform, mapChildrenField } = treeOpts;
            eachTree(
              afterTreeFullData,
              (row: any) => {
                const rowid = handleGetRowId(row);
                const childList =
                  row[transform ? mapChildrenField : childrenField];
                if (childList && childList.length > 0 && !childRowMaps[rowid]) {
                  childRowMaps[rowid] = 1;
                  childRowList.unshift([row, rowid, childList]);
                } else {
                  if (indeterminateField) {
                    set(row, indeterminateField, false);
                  }
                }
              },
              { children: transform ? mapChildrenField : childrenField },
            );
          }

          childRowList.forEach((vals) => {
            const row = vals[0];
            const rowid: string = vals[1];
            const childList: any[] = vals[2];
            let sLen = 0; // 已选
            let hLen = 0; // 半选
            let vLen = 0; // 有效子行
            const cLen = childList.length; // 子行
            childList.forEach(
              checkMethod
                ? (item) => {
                    const childRowid = handleGetRowId(item);
                    const isSelect = checkField
                      ? get(item, checkField)
                      : selectCheckboxMaps[childRowid];
                    if (checkMethod({ $table: $asTable, row: item })) {
                      if (isSelect) {
                        sLen++;
                      } else if (treeIndeterminateRowMaps[childRowid]) {
                        hLen++;
                      }
                      vLen++;
                    } else {
                      if (isSelect) {
                        sLen++;
                      } else if (treeIndeterminateRowMaps[childRowid]) {
                        hLen++;
                      }
                    }
                  }
                : (item) => {
                    const childRowid = handleGetRowId(item);
                    const isSelect = checkField
                      ? get(item, checkField)
                      : selectCheckboxMaps[childRowid];
                    if (isSelect) {
                      sLen++;
                    } else if (treeIndeterminateRowMaps[childRowid]) {
                      hLen++;
                    }
                    vLen++;
                  },
            );

            let isSelected = false;
            if (cLen > 0) {
              if (vLen > 0) {
                isSelected = (sLen > 0 || hLen > 0) && sLen >= vLen;
              } else {
                // 如果存在子项禁用
                if (sLen > 0 && sLen >= vLen) {
                  isSelected = true;
                  // eslint-disable-next-line unicorn/no-duplicate-if-branches
                } else if (selectCheckboxMaps[rowid]) {
                  isSelected = true;
                } else {
                  isSelected = false;
                }
              }
            } else {
              // 如果无子项
              isSelected = selectCheckboxMaps[rowid];
            }
            const halfSelect = !isSelected && (sLen > 0 || hLen > 0);

            if (checkField) {
              set(row, checkField, isSelected);
            }
            if (indeterminateField) {
              set(row, indeterminateField, halfSelect);
            }
            if (isSelected) {
              if (!checkField) {
                selectCheckboxMaps[rowid] = row;
              }
              if (treeIndeterminateRowMaps[rowid]) {
                delete treeIndeterminateRowMaps[rowid];
              }
            } else {
              if (!checkField && selectCheckboxMaps[rowid]) {
                delete selectCheckboxMaps[rowid];
              }
              if (halfSelect) {
                treeIndeterminateRowMaps[rowid] = row;
              } else {
                if (treeIndeterminateRowMaps[rowid]) {
                  delete treeIndeterminateRowMaps[rowid];
                }
              }
            }
          });
        }
        reactData.updateCheckboxFlag++;
      },
      updateAllCheckboxStatus() {
        const { treeConfig } = props;
        const { isRowGroupStatus } = reactData;
        const {
          afterFullData,
          afterTreeFullData,
          afterGroupFullData,
          checkboxReserveRowMap,
          selectCheckboxMaps,
          treeIndeterminateRowMaps,
        } = internalData;
        const aggregateOpts = computeAggregateOpts.value;
        const { mapChildrenField } = aggregateOpts;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField, checkMethod, showReserveStatus } = checkboxOpts;
        const { handleGetRowId } = createHandleGetRowId($asTable);

        let sLen = 0; // 已选
        let dsLen = 0; // 禁用的已选
        let hLen = 0; // 半选
        let dhLen = 0; // 禁用的半选
        let vLen = 0; // 有效行

        const rootList = treeConfig
          ? afterTreeFullData
          : isRowGroupStatus
            ? afterGroupFullData
            : afterFullData;
        rootList.forEach(
          checkMethod
            ? (row) => {
                const childRowid = handleGetRowId(row);
                const selected = checkField
                  ? get(row, checkField)
                  : selectCheckboxMaps[childRowid];
                if (isRowGroupStatus && $asTable.isAggregateRecord(row)) {
                  const childList: any[] = row[mapChildrenField || ''];
                  if (selected) {
                    vLen++;
                    sLen++;
                  } else if (treeIndeterminateRowMaps[childRowid]) {
                    vLen++;
                    hLen++;
                  } else if (
                    childList &&
                    childList.some((item) =>
                      checkMethod({ $table: $asTable, row: item }),
                    )
                  ) {
                    vLen++;
                  }
                } else if (checkMethod({ $table: $asTable, row })) {
                  if (selected) {
                    sLen++;
                  } else if (treeIndeterminateRowMaps[childRowid]) {
                    hLen++;
                  }
                  vLen++;
                } else {
                  if (selected) {
                    dsLen++;
                  } else if (treeIndeterminateRowMaps[childRowid]) {
                    dhLen++;
                  }
                }
              }
            : (row) => {
                const childRowid = handleGetRowId(row);
                const selected = checkField
                  ? get(row, checkField)
                  : selectCheckboxMaps[childRowid];
                if (selected) {
                  sLen++;
                } else if (treeIndeterminateRowMaps[childRowid]) {
                  hLen++;
                }
                vLen++;
              },
        );

        const isSelected =
          rootList.length > 0
            ? // eslint-disable-next-line unicorn/prefer-minimal-ternary
              vLen > 0
              ? sLen >= vLen
              : sLen >= rootList.length
            : false;
        let halfSelect =
          !isSelected && (sLen > 0 || hLen > 0 || dsLen > 0 || dhLen > 0);

        // 如果复选框启用保留记录，当保留数据存在时显示半选
        if (!isSelected && !halfSelect && showReserveStatus) {
          halfSelect = !isEmpty(checkboxReserveRowMap);
        }

        reactData.isAllSelected = isSelected;
        reactData.isIndeterminate = halfSelect;
      },
      checkSelectionStatus() {
        $asTable.updateCheckboxStatus();
        $asTable.updateAllCheckboxStatus();
      },
      /**
       * 切换选中
       * 多选，行选中事件
       */
      handleBatchSelectRows(rows, checked, isForce) {
        const { treeConfig } = props;
        const { isRowGroupStatus } = reactData;
        const { selectCheckboxMaps } = internalData;
        const aggregateOpts = computeAggregateOpts.value;
        const treeOpts = computeTreeOpts.value;
        const { transform, mapChildrenField } = treeOpts;
        const childrenField = treeOpts.childrenField;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField, checkStrictly, checkMethod } = checkboxOpts;
        const { handleGetRowId } = createHandleGetRowId($asTable);
        // indeterminateField 仅支持读取
        const indeterminateField = checkboxOpts.indeterminateField;
        if (checkField) {
          // 树结构
          if ((treeConfig || isRowGroupStatus) && !checkStrictly) {
            // 更新子节点状态
            eachTree(
              rows,
              (row) => {
                if (
                  !(
                    isForce ||
                    !checkMethod ||
                    checkMethod({ $table: $asTable, row })
                  )
                ) {
                  return;
                }

                set(row, checkField, checked);
                if (indeterminateField) {
                  set(row, indeterminateField, false);
                }
                handleCheckboxReserveRow(row, checked);
              },
              { children: transform ? mapChildrenField : childrenField },
            );
            reactData.updateCheckboxFlag++;
            return;
          }
          // 列表
          rows.forEach((row) => {
            if (
              !(
                isForce ||
                !checkMethod ||
                checkMethod({ $table: $asTable, row })
              )
            ) {
              return;
            }

            set(row, checkField, checked);
            handleCheckboxReserveRow(row, checked);
          });
          reactData.updateCheckboxFlag++;
          return;
        }

        // 树结构
        if (!checkStrictly) {
          if (isRowGroupStatus) {
            // 更新行分组节点状态
            eachTree(
              rows,
              (row) => {
                const rowid = handleGetRowId(row);
                if (
                  isForce ||
                  !checkMethod ||
                  checkMethod({ $table: $asTable, row })
                ) {
                  if (checked) {
                    selectCheckboxMaps[rowid] = row;
                  } else {
                    if (selectCheckboxMaps[rowid]) {
                      delete selectCheckboxMaps[rowid];
                    }
                  }
                  handleCheckboxReserveRow(row, checked);
                }
              },
              { children: aggregateOpts.mapChildrenField },
            );
            reactData.updateCheckboxFlag++;
            return;
          } else if (treeConfig) {
            // 更新子节点状态
            eachTree(
              rows,
              (row) => {
                const rowid = handleGetRowId(row);
                if (
                  isForce ||
                  !checkMethod ||
                  checkMethod({ $table: $asTable, row })
                ) {
                  if (checked) {
                    selectCheckboxMaps[rowid] = row;
                  } else {
                    if (selectCheckboxMaps[rowid]) {
                      delete selectCheckboxMaps[rowid];
                    }
                  }
                  handleCheckboxReserveRow(row, checked);
                }
              },
              { children: transform ? mapChildrenField : childrenField },
            );
            reactData.updateCheckboxFlag++;
            return;
          }
        }

        // 列表
        rows.forEach((row) => {
          const rowid = handleGetRowId(row);
          if (
            isForce ||
            !checkMethod ||
            checkMethod({ $table: $asTable, row })
          ) {
            if (checked) {
              if (!selectCheckboxMaps[rowid]) {
                selectCheckboxMaps[rowid] = row;
              }
            } else {
              if (selectCheckboxMaps[rowid]) {
                delete selectCheckboxMaps[rowid];
              }
            }
            handleCheckboxReserveRow(row, checked);
            reactData.updateCheckboxFlag++;
          }
        });
      },

      handleUpdateHeaderMerge() {
        const { mergeHeaderList } = internalData;
        const { mergeMaps, mergeRowMaps, mergeColMaps } =
          buildMergeData(mergeHeaderList);
        internalData.mergeHeaderCellMaps = mergeMaps;
        internalData.mergeHeaderRowMaps = mergeRowMaps;
        internalData.mergeHeaderColMaps = mergeColMaps;
        reactData.mergeHeadFlag++;
      },
      /**
       * 处理合并
       */
      handleUpdateBodyMerge() {
        const { mergeBodyList } = internalData;
        const { mergeMaps, mergeRowMaps, mergeColMaps } =
          buildMergeData(mergeBodyList);
        internalData.mergeBodyCellMaps = mergeMaps;
        internalData.mergeBodyRowMaps = mergeRowMaps;
        internalData.mergeBodyColMaps = mergeColMaps;
        reactData.mergeBodyFlag++;
      },
      handleUpdateFooterMerge() {
        const { mergeFooterList } = internalData;
        const { mergeMaps, mergeRowMaps, mergeColMaps } =
          buildMergeData(mergeFooterList);
        internalData.mergeFooterCellMaps = mergeMaps;
        internalData.mergeFooterRowMaps = mergeRowMaps;
        internalData.mergeFooterColMaps = mergeColMaps;
        reactData.mergeFootFlag++;
      },
      handleAggregateSummaryData() {
        return $asTable.refreshAggregateCalcValues();
      },
      triggerHeaderTitleEvent(evnt, iconParams, params) {
        const tipContent = iconParams.content || (iconParams as any).message;
        if (tipContent) {
          const { tooltipStore } = reactData;
          const { column } = params;
          const content = getFuncText(tipContent);
          handleTargetEnterEvent(true);
          tooltipStore.row = null;
          tooltipStore.column = column;
          tooltipStore.visible = true;
          tooltipStore.currOpts = iconParams as any;
          nextTick(() => {
            const $tooltip = refTooltip.value;
            if ($tooltip && $tooltip.open) {
              $tooltip.open(evnt.currentTarget, content as any);
            }
          });
        }
      },
      /**
       * 触发表头 tooltip 事件
       */
      triggerHeaderTooltipEvent(evnt, params) {
        const { tooltipStore } = reactData;
        const headerTooltipOpts = computeHeaderTooltipOpts.value;
        const { column } = params;
        handleTargetEnterEvent(true);
        const titleElem = evnt.currentTarget as HTMLDivElement;
        if (!titleElem) {
          return;
        }
        const cWrapperEl = titleElem.parentElement as HTMLDivElement;
        if (!cWrapperEl) {
          return;
        }
        const cellEl = cWrapperEl.parentElement as HTMLDivElement;
        if (!cellEl) {
          return;
        }
        const thEl = cellEl.parentElement as HTMLTableCellElement;
        if (!thEl) {
          return;
        }
        if (tooltipStore.column !== column || !tooltipStore.visible) {
          const ctEl = thEl.querySelector<HTMLElement>(
            `.${prefixCls.value}-cell--title`,
          );
          handleTooltip(
            evnt,
            headerTooltipOpts,
            'header',
            thEl,
            (hasClass(thEl, 'col--ellipsis') ? ctEl : cWrapperEl) || cWrapperEl,
            ctEl || cellEl,
            params,
          );
        }
      },
      /**
       * 触发单元格 tooltip 事件
       */
      triggerBodyTooltipEvent(evnt, params) {
        const { editConfig } = props;
        const { editStore, tooltipStore } = reactData;
        const tooltipOpts = computeTooltipOpts.value;
        const editOpts = computeEditOpts.value;
        const { actived } = editStore;
        const { row, column } = params;
        const tdEl = evnt.currentTarget as HTMLTableCellElement;
        handleTargetEnterEvent(
          tooltipStore.column !== column || tooltipStore.row !== row,
        );
        // 单元格处于编辑状态时不触发提示框
        if (column.editRender && isEnableConf(editConfig)) {
          // 如果是行编辑模式
          if (editOpts.mode === 'row' && actived.row === row) {
            return;
          }
          // 如果是单元格编辑模式
          if (actived.row === row && actived.column === column) {
            return;
          }
        }
        if (
          tooltipStore.column !== column ||
          tooltipStore.row !== row ||
          !tooltipStore.visible
        ) {
          const ctEl = tdEl.querySelector<HTMLElement>(
            `.${prefixCls.value}-cell--wrapper`,
          );
          let ovEl = null;
          let tipEl = tdEl.querySelector<HTMLElement>(
            column.type === 'html'
              ? `.${prefixCls.value}-cell--html`
              : `.${prefixCls.value}-cell--label`,
          );
          if (column.treeNode) {
            ovEl = tdEl.querySelector<HTMLElement>(
              `.${prefixCls.value}-tree-cell`,
            );
          }
          if (!tipEl) {
            tipEl = ctEl;
          }
          handleTooltip(
            evnt,
            tooltipOpts,
            'body',
            tdEl,
            ovEl || ctEl,
            tipEl,
            params,
          );
        }
      },

      /**
       * 触发表尾 tooltip 事件
       */
      triggerFooterTooltipEvent(evnt, params) {
        const { column } = params;
        const { tooltipStore } = reactData;
        const footerTooltipOpts = computeFooterTooltipOpts.value;
        const tdEl = evnt.currentTarget as HTMLTableCellElement;
        handleTargetEnterEvent(
          tooltipStore.column !== column || !!tooltipStore.row,
        );
        if (tooltipStore.column !== column || !tooltipStore.visible) {
          const ctEl = tdEl.querySelector<HTMLElement>(
            `.${prefixCls.value}-cell--wrapper`,
          );
          let ovEl = null;
          let tipEl = tdEl.querySelector<HTMLElement>(
            column.type === 'html'
              ? `.${prefixCls.value}-cell--html`
              : `.${prefixCls.value}-cell--label`,
          );
          if (column.type === 'html') {
            ovEl = tdEl.querySelector<HTMLElement>(
              `.${prefixCls.value}-cell--html`,
            );
          }
          if (!tipEl) {
            tipEl = ctEl;
          }
          handleTooltip(
            evnt,
            footerTooltipOpts,
            'footer',
            tdEl,
            ovEl || ctEl,
            tipEl,
            params,
          );
        }
      },

      handleTargetLeaveEvent() {
        const tooltipOpts = computeTooltipOpts.value;
        let $tooltip = refTooltip.value;
        if ($tooltip && $tooltip.setActived) {
          $tooltip.setActived(false);
        }
        if (tooltipOpts.enterable) {
          internalData.tooltipTimeout = setTimeout(() => {
            $tooltip = refTooltip.value;
            if ($tooltip && $tooltip.isActived && !$tooltip.isActived()) {
              $asTable.closeTooltip();
            }
          }, tooltipOpts.leaveDelay);
        } else {
          $asTable.closeTooltip();
        }
      },
      triggerHeaderCellClickEvent(evnt, params) {
        const { _lastResizeTime } = internalData;
        const sortOpts = computeSortOpts.value;
        const columnOpts = computeColumnOpts.value;
        const currentColumnOpts = computeCurrentColumnOpts.value;
        const { column } = params;
        const cell = evnt.currentTarget;
        const triggerResizable =
          _lastResizeTime && _lastResizeTime > Date.now() - 300;
        const triggerSort = getEventTargetNode(
          evnt,
          cell,
          `${prefixCls.value}-cell--sort`,
        ).flag;
        const triggerFilter = getEventTargetNode(
          evnt,
          cell,
          `${prefixCls.value}-cell--filter`,
        ).flag;
        if (
          sortOpts.trigger === 'cell' &&
          !(triggerResizable || triggerSort || triggerFilter)
        ) {
          $asTable.triggerSortEvent(evnt, column, getNextSortOrder(column)!);
        }
        // TODO if ($xeGantt) {
        //   const ganttReactData = $asTable.reactData;
        //   ganttReactData.activeBarRowid = null;
        // }
        dispatchEvent(
          'header-cell-click',
          Object.assign(
            { triggerResizable, triggerSort, triggerFilter, cell },
            params,
          ),
          evnt,
        );
        if (
          columnOpts.isCurrent &&
          (!currentColumnOpts.trigger ||
            ['default', 'header'].includes(currentColumnOpts.trigger))
        ) {
          $asTable.triggerCurrentColumnEvent(evnt, params);
        }
      },
      triggerHeaderCellDblclickEvent(evnt, params) {
        dispatchEvent(
          'header-cell-dblclick',
          Object.assign({ cell: evnt.currentTarget }, params),
          evnt,
        );
      },
      /**
       * 列点击事件
       * 如果是单击模式，则激活为编辑状态
       * 如果是双击模式，则单击后选中状态
       */
      triggerCellClickEvent(evnt, params) {
        const { treeConfig, editConfig, aggregateConfig } = props;
        const {
          editStore,
          isDragResize,
          expandColumn,
          checkboxColumn,
          radioColumn,
        } = reactData;
        if (isDragResize) {
          return;
        }
        const expandOpts = computeExpandOpts.value;
        const editOpts = computeEditOpts.value;
        const treeOpts = computeTreeOpts.value;
        const radioOpts = computeRadioOpts.value;
        const checkboxOpts = computeCheckboxOpts.value;
        const keyboardOpts = computeKeyboardOpts.value;
        const aggregateOpts = computeAggregateOpts.value;
        const rowOpts = computeRowOpts.value;
        const columnOpts = computeColumnOpts.value;
        const currentColumnOpts = computeCurrentColumnOpts.value;
        const { actived, focused } = editStore;
        const { row, column } = params;
        const { type, treeNode, rowGroupNode } = column;
        const isRadioType = type === 'radio';
        const isCheckboxType = type === 'checkbox';
        const isExpandType = type === 'expand';
        const cell = evnt.currentTarget as HTMLDivElement;
        const triggerRadio =
          isRadioType &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}-cell--radio`).flag;
        const triggerCheckbox =
          isCheckboxType &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}-cell--checkbox`)
            .flag;
        const triggerTreeNode =
          treeNode &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}-cell--tree-btn`)
            .flag;
        const triggerExpandNode =
          isExpandType &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}--expanded`).flag;
        const triggerRowGroupNode =
          isExpandType &&
          getEventTargetNode(
            evnt,
            cell,
            `${prefixCls.value}-row-group--node-btn`,
          ).flag;
        params = Object.assign(
          {
            cell,
            triggerRadio,
            triggerCheckbox,
            triggerTreeNode,
            triggerExpandNode,
          },
          params,
        );
        if (!triggerCheckbox && !triggerRadio) {
          // 如果是展开行
          if (
            !triggerExpandNode &&
            ((expandColumn && expandOpts.trigger === 'row') ||
              (isExpandType && expandOpts.trigger === 'cell'))
          ) {
            $asTable.triggerRowExpandEvent(evnt, params);
          }
          // 如果是树形表格
          if (
            treeConfig &&
            (treeOpts.trigger === 'row' ||
              (treeNode && treeOpts.trigger === 'cell'))
          ) {
            $asTable.triggerTreeExpandEvent(evnt, params);
          }
          // 如果是行分组
          if (
            aggregateConfig &&
            (aggregateOpts.trigger === 'row' ||
              (rowGroupNode && aggregateOpts.trigger === 'cell'))
          ) {
            $asTable.triggerRowGroupExpandEvent(evnt, params);
          }
        }
        // 如果点击了树节点
        if (!triggerTreeNode) {
          if (!triggerExpandNode && !triggerRowGroupNode) {
            // 如果是当前行
            if (rowOpts.isCurrent && !triggerCheckbox && !triggerRadio) {
              $asTable.triggerCurrentRowEvent(evnt, params);
            }
            // 如果是当前列
            if (
              columnOpts.isCurrent &&
              (!currentColumnOpts.trigger ||
                ['cell', 'default'].includes(currentColumnOpts.trigger)) &&
              !triggerCheckbox &&
              !triggerRadio
            ) {
              $asTable.triggerCurrentColumnEvent(evnt, params);
            }
            // 如果是单选框
            if (
              !triggerRadio &&
              ((radioColumn && radioOpts.trigger === 'row') ||
                (isRadioType && radioOpts.trigger === 'cell'))
            ) {
              $asTable.triggerRadioRowEvent(evnt, params);
            }
            // 如果是复选框
            if (
              !triggerCheckbox &&
              ((checkboxColumn && checkboxOpts.trigger === 'row') ||
                (isCheckboxType && checkboxOpts.trigger === 'cell'))
            ) {
              $asTable.handleToggleCheckRowEvent(evnt, params);
            }
          }
          // 如果设置了单元格选中功能，则不会使用点击事件去处理（只能支持双击模式）
          if (isEnableConf(editConfig)) {
            // 记录点击输入框聚焦状态
            if (
              keyboardOpts.arrowCursorLock &&
              evnt &&
              editOpts.mode === 'cell' &&
              evnt.target &&
              /^input|textarea$/i.test((evnt.target as HTMLElement).tagName)
            ) {
              focused.column = column;
              focused.row = row;
            }
            if (editOpts.trigger === 'manual') {
              if (
                actived.args &&
                actived.row === row &&
                column !== actived.column
              ) {
                if (editOpts.mode === 'row') {
                  handleChangeCell(evnt, params);
                } else {
                  checkValidate('blur').catch((error: any) => error);
                }
              }
            } else if (
              !actived.args ||
              row !== actived.row ||
              column !== actived.column
            ) {
              if (editOpts.trigger === 'click') {
                handleChangeCell(evnt, params);
              }
              if (
                editOpts.trigger === 'dblclick' &&
                editOpts.mode === 'row' &&
                actived.row === row
              ) {
                handleChangeCell(evnt, params);
              }
            }
          }
        }
        // 如果是双击编辑模式，当autoClear=false时
        if (
          isEnableConf(editConfig) &&
          editOpts.autoClear !== false &&
          editOpts.trigger === 'dblclick' &&
          actived.row &&
          actived.column
        ) {
          if (editOpts.mode === 'row') {
            if (!$asTable.eqRow(actived.row, row)) {
              $asTable.handleClearEdit(evnt);
            }
          } else if (
            editOpts.mode === 'cell' &&
            (!$asTable.eqRow(actived.row, row) ||
              actived.column.id !== column.id)
          ) {
            $asTable.handleClearEdit(evnt);
          }
        }
        // TODO if ($xeGantt) {
        //   const ganttReactData = $xeGantt.reactData;
        //   ganttReactData.activeBarRowid = null;
        // }
        dispatchEvent('cell-click', params, evnt);
      },

      /**
       * 列双击点击事件
       * 如果是双击模式，则激活为编辑状态
       */
      triggerCellDblclickEvent(evnt, params) {
        const { editConfig } = props;
        const { editStore, isDragResize } = reactData;
        if (isDragResize) {
          return;
        }
        const editOpts = computeEditOpts.value;
        const { actived } = editStore;
        const cell = evnt.currentTarget as HTMLDivElement;
        params = Object.assign({ cell }, params);
        if (
          isEnableConf(editConfig) &&
          editOpts.trigger === 'dblclick' &&
          (!actived.args || evnt.currentTarget !== actived.args.cell)
        ) {
          if (editOpts.mode === 'row') {
            checkValidate('blur')
              .catch((error) => error)
              .then(() => {
                $asTable
                  .handleEdit(params, evnt)
                  .then(() => checkValidate('change'))
                  .catch((error) => error);
              });
          } else if (editOpts.mode === 'cell') {
            $asTable
              .handleEdit(params, evnt)
              .then(() => checkValidate('change'))
              .catch((error) => error);
          }
        }
        dispatchEvent('cell-dblclick', params, evnt);
      },
      triggerFooterCellClickEvent(evnt, params) {
        const cell = evnt.currentTarget as HTMLDivElement;
        params = Object.assign({ cell }, params);
        // TODO if ($xeGantt) {
        //   const ganttReactData = $xeGantt.reactData
        //   ganttReactData.activeBarRowid = null
        // }
        $asTable.dispatchEvent('footer-cell-click', params, evnt);
      },
      triggerFooterCellDblclickEvent(evnt, params) {
        const cell = evnt.currentTarget as HTMLDivElement;
        params = Object.assign({ cell }, params);
        $asTable.dispatchEvent('footer-cell-dblclick', params, evnt);
      },
      handleToggleCheckRowEvent(evnt, params) {
        const { selectCheckboxMaps } = internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const { checkField, trigger } = checkboxOpts;
        const { row } = params;
        if (trigger === 'manual') {
          return;
        }

        let checked = false;
        checked = checkField
          ? !get(row, checkField)
          : !selectCheckboxMaps[getRowid($asTable, row)];
        if (evnt) {
          $asTable.triggerCheckRowEvent(evnt, params, checked);
        } else {
          $asTable.handleBatchSelectRows([row], checked);
          $asTable.checkSelectionStatus();
        }
      },
      triggerCheckRowEvent(evnt: MouseEvent, params, checked) {
        const { treeConfig } = props;
        const { row } = params;
        const { isRowGroupStatus } = reactData;
        const {
          fullAllDataRowIdData,
          afterFullData,
          afterTreeFullData,
          afterGroupFullData,
        } = internalData;
        const checkboxOpts = computeCheckboxOpts.value;
        const aggregateOpts = computeAggregateOpts.value;
        const treeOpts = computeTreeOpts.value;
        const { checkMethod, trigger, checkStrictly } = checkboxOpts;
        if (trigger === 'manual') {
          return;
        }
        evnt.stopPropagation();

        if (checkboxOpts.isShiftKey && evnt.shiftKey) {
          const { handleGetRowId } = createHandleGetRowId($asTable);
          const checkboxRecords = $asTable.getCheckboxRecords();
          let currSeq = -1;
          let currRow: any = null;
          const currRowid = handleGetRowId(row);
          const rowRest = fullAllDataRowIdData[currRowid];
          if (rowRest) {
            currRow = rowRest.row;
            currSeq = rowRest._seq;
          }
          if (currRow && checkboxRecords.length > 0) {
            let rangeRows: any[] = [];
            let firstSeq = -1;
            let firstRow: any = null;
            let firstRowid = '';
            let lastSeq = -1;
            let lastRow: any = null;
            let lastRowid = '';
            // 根据序号取出范围最小/最大的行
            const selectMaps: Record<string, any> = {};
            checkboxRecords.forEach((item) => {
              const rowid = handleGetRowId(item);
              const rowRest = fullAllDataRowIdData[rowid];
              if (rowRest) {
                if (!firstRow || firstSeq > rowRest._seq) {
                  firstRowid = rowRest.rowid;
                  firstRow = rowRest.row;
                  firstSeq = rowRest._seq;
                }
                if (!lastRow || lastSeq < rowRest._seq) {
                  lastRowid = rowRest.rowid;
                  lastRow = rowRest.row;
                  lastSeq = rowRest._seq;
                }
              }
              selectMaps[rowid] = item;
            });
            // 如果已选只有一条并选择当前则跳过
            if (
              firstRow &&
              lastRow &&
              (checkboxRecords.length > 1 || currRowid !== firstRowid) &&
              (Math.abs(firstSeq - lastSeq) > 1 ||
                Math.abs(currSeq - firstSeq) > 1 ||
                Math.abs(currSeq - lastSeq) > 1)
            ) {
              // 树与分组
              if (treeConfig || isRowGroupStatus) {
                const { transform } = treeOpts;
                const childrenField = treeOpts.childrenField;
                const iteratorChildField = treeConfig
                  ? transform
                    ? treeOpts.mapChildrenField
                    : childrenField
                  : (aggregateOpts.mapChildrenField as string);
                let isMatchFirst = false;
                let matchStartRowid = '';
                let matchEndRowid = '';

                const handleGetChildRowid = (
                  rowid: string,
                  isLast: 0 | 1,
                ): string => {
                  const rowRest = fullAllDataRowIdData[rowid];
                  if (rowRest) {
                    const item = rowRest.row;
                    const childList = item[iteratorChildField];
                    if (childList && childList.length > 0) {
                      const targetRow = isLast
                        ? last(childList)
                        : first(childList);
                      return handleGetChildRowid(
                        handleGetRowId(targetRow),
                        isLast,
                      );
                    }
                  }
                  return rowid;
                };

                const handleGetSelectParentRowid = (rowid: string): string => {
                  const rowRest = fullAllDataRowIdData[rowid];
                  if (rowRest) {
                    const parentItem = rowRest.parent;
                    if (parentItem) {
                      const parentRowid = handleGetRowId(parentItem);
                      if (selectMaps[parentRowid]) {
                        return handleGetSelectParentRowid(parentRowid);
                      }
                    }
                  }
                  return rowid;
                };

                const handleGetRootRow = (
                  row: string,
                ): AsTableDefines.RowCacheItem | null => {
                  const rowid = handleGetRowId(row);
                  if (rowid) {
                    const rest = fullAllDataRowIdData[rowid];
                    if (rest) {
                      return rest.parent ? handleGetRootRow(rest.parent) : rest;
                    }
                  }
                  return null;
                };

                if (currSeq < firstSeq) {
                  matchStartRowid = handleGetChildRowid(currRowid, 0);
                  matchEndRowid = handleGetChildRowid(firstRowid, 1);
                } else {
                  matchStartRowid =
                    currSeq > lastSeq
                      ? handleGetSelectParentRowid(lastRowid)
                      : handleGetChildRowid(firstRowid, 0);
                  matchEndRowid = handleGetChildRowid(currRowid, 1);
                }

                const handleRangeRow = (item: any) => {
                  const rowid = handleGetRowId(item);
                  const childList = item[iteratorChildField];
                  if (!isMatchFirst && rowid === matchStartRowid) {
                    isMatchFirst = true;
                  }
                  // 如果是父子关联，则排除父节点
                  if (
                    isMatchFirst &&
                    (checkStrictly || !childList || childList.length === 0)
                  ) {
                    rangeRows.push(item);
                  }
                  // break
                  return rowid === matchEndRowid;
                };
                if (treeConfig) {
                  const matchStartRowRest =
                    fullAllDataRowIdData[matchStartRowid];
                  const firstRootRowRest = matchStartRowRest
                    ? handleGetRootRow(matchStartRowRest.row)
                    : null;
                  if (firstRootRowRest) {
                    // 优化查找复杂度
                    findTree(
                      afterTreeFullData.slice(firstRootRowRest.treeIndex),
                      handleRangeRow,
                      { children: iteratorChildField },
                    );
                  } else {
                    findTree(afterTreeFullData, handleRangeRow, {
                      children: iteratorChildField,
                    });
                  }
                } else {
                  findTree(afterGroupFullData, handleRangeRow, {
                    children: iteratorChildField,
                  });
                }
              } else {
                const _currRowIndex = $asTable.getVTRowIndex(currRow);
                const _firstRowIndex = $asTable.getVTRowIndex(firstRow);
                const _lastRowIndex = $asTable.getVTRowIndex(lastRow);
                if (_currRowIndex < _firstRowIndex) {
                  rangeRows = afterFullData.slice(
                    _currRowIndex,
                    _firstRowIndex + 1,
                  );
                } else if (_currRowIndex > _lastRowIndex) {
                  rangeRows = afterFullData.slice(
                    _lastRowIndex,
                    _currRowIndex + 1,
                  );
                } else {
                  rangeRows = afterFullData.slice(
                    _firstRowIndex,
                    _currRowIndex + 1,
                  );
                }
              }
              $asTable.setAllCheckboxRow(false);
              nextTick(() => {
                handleCheckedCheckboxRow(rangeRows, true, false);
              });
              dispatchEvent(
                'checkbox-range-select',
                Object.assign({ rangeRecords: rangeRows }, params),
                evnt,
              );
            }
          }
        }

        if (!checkMethod || checkMethod({ $table: $asTable, row })) {
          $asTable.handleBatchSelectRows([row], checked);
          $asTable.checkSelectionStatus();
          dispatchEvent(
            'checkbox-change',
            Object.assign(
              {
                records: () => $asTable.getCheckboxRecords(),
                reserves: () => $asTable.getCheckboxReserveRecords(),
                indeterminates: () =>
                  $asTable.getCheckboxIndeterminateRecords(),
                checked,
              },
              params,
            ),
            evnt,
          );
        }
      },
      /**
       * 多选，选中所有事件
       */
      triggerCheckAllEvent(evnt, value) {
        const checkboxOpts = computeCheckboxOpts.value;
        const { trigger } = checkboxOpts;
        if (trigger === 'manual') {
          return;
        }
        if (evnt) {
          evnt.stopPropagation();
        }
        handleCheckAllEvent(evnt, value);
      },

      /**
       * 单选，行选中事件
       */
      triggerRadioRowEvent(evnt, params) {
        const { selectRadioRow: oldValue } = reactData;
        const { row } = params;
        const radioOpts = computeRadioOpts.value;
        const { trigger, strict, checkMethod } = radioOpts;
        if (trigger === 'manual') {
          return;
        }
        evnt.stopPropagation();
        if (!checkMethod || checkMethod({ $table: $asTable, row })) {
          let newValue = row;
          let isChange = oldValue !== newValue;
          if (strict) {
            handleCheckedRadioRow(newValue, false);
          } else {
            if (oldValue === newValue) {
              newValue = null;
            }
            isChange = oldValue !== newValue;
            if (isChange && newValue) {
              handleCheckedRadioRow(newValue, false);
            } else {
              newValue = null;
              $asTable.clearRadioRow();
            }
          }
          if (isChange) {
            dispatchEvent(
              'radio-change',
              { oldValue, newValue, selected: !!newValue, ...params },
              evnt,
            );
          }
        }
      },
      triggerCurrentColumnEvent(evnt, params) {
        const { currentCol: oldValue } = internalData;
        const currentColumnOpts = computeCurrentColumnOpts.value;
        const beforeRowMethod = currentColumnOpts.beforeSelectMethod;
        let newValue: AsTableDefines.ColumnInfo | null = params.column;
        const { trigger, strict } = currentColumnOpts;
        if (trigger === 'manual') {
          return;
        }
        let isChange = oldValue !== newValue;
        if (
          !beforeRowMethod ||
          beforeRowMethod({ column: newValue, $table: $asTable })
        ) {
          if (strict) {
            $asTable.setCurrentColumn(newValue);
          } else {
            if (oldValue === newValue) {
              newValue = null;
            }
            isChange = oldValue !== newValue;
            if (isChange && newValue) {
              $asTable.setCurrentColumn(newValue);
            } else {
              newValue = null;
              $asTable.clearCurrentColumn();
            }
          }
          if (isChange) {
            dispatchEvent(
              'current-column-change',
              { oldValue, newValue, selected: !!newValue, ...params },
              evnt,
            );
          }
        } else {
          dispatchEvent('current-column-disabled', params, evnt);
        }
      },
      triggerCurrentRowEvent(evnt, params) {
        const { currentRow: oldValue } = internalData;
        const currentRowOpts = computeCurrentRowOpts.value;
        const beforeRowMethod = currentRowOpts.beforeSelectMethod;
        let { row: newValue } = params;
        const { trigger, strict } = currentRowOpts;
        if (trigger === 'manual') {
          return;
        }
        let isChange = oldValue !== newValue;
        if (
          !beforeRowMethod ||
          beforeRowMethod({ row: newValue, $table: $asTable })
        ) {
          if (strict) {
            $asTable.setCurrentRow(newValue);
          } else {
            if (oldValue === newValue) {
              newValue = null;
            }
            isChange = oldValue !== newValue;
            if (isChange && newValue) {
              $asTable.setCurrentRow(newValue);
            } else {
              newValue = null;
              $asTable.clearCurrentRow();
            }
          }
          if (isChange) {
            dispatchEvent(
              'current-row-change',
              { oldValue, newValue, selected: !!newValue, ...params },
              evnt,
            );
          }
        } else {
          dispatchEvent('current-row-disabled', params, evnt);
        }
      },
      /**
       * 展开行事件
       */
      triggerRowExpandEvent(evnt, params) {
        const { expandColumn } = reactData;
        const { rowExpandLazyLoadedMaps } = internalData;
        const expandOpts = computeExpandOpts.value;
        const { row } = params;
        const { lazy, trigger } = expandOpts;
        if (trigger === 'manual') {
          return;
        }
        evnt.stopPropagation();
        const rowid = getRowid($asTable, row);
        if (!lazy || !rowExpandLazyLoadedMaps[rowid]) {
          const expanded = !$asTable.isRowExpandByRow(row);
          const columnIndex = expandColumn
            ? $asTable.getColumnIndex(expandColumn)
            : -1;
          const $columnIndex = expandColumn
            ? $asTable.getVMColumnIndex(expandColumn)
            : -1;
          $asTable.setRowExpand(row, expanded);
          dispatchEvent(
            'toggle-row-expand',
            {
              expanded,
              column: expandColumn,
              columnIndex,
              $columnIndex,
              row,
              rowIndex: $asTable.getRowIndex(row),
              $rowIndex: $asTable.getVMRowIndex(row),
            },
            evnt,
          );
        }
      },
      /**
       * 行分组事件
       */
      triggerRowGroupExpandEvent(evnt, params) {
        const { rowGroupExpandedMaps } = internalData;
        const aggregateOpts = computeAggregateOpts.value;
        const { row, column } = params;
        const { trigger } = aggregateOpts;
        if (trigger === 'manual') {
          return;
        }
        evnt.stopPropagation();
        const rowid = getRowid($asTable, row);
        const expanded = !rowGroupExpandedMaps[rowid];
        const columnIndex = $asTable.getColumnIndex(column);
        const $columnIndex = $asTable.getVMColumnIndex(column);
        $asTable.setRowGroupExpand(row, expanded);
        dispatchEvent(
          'toggle-row-group-expand',
          { expanded, column, columnIndex, $columnIndex, row },
          evnt,
        );
      },
      /**
       * 展开树节点事件
       */
      triggerTreeExpandEvent(evnt, params) {
        const { treeExpandLazyLoadedMaps, treeEATime } = internalData;
        const treeOpts = computeTreeOpts.value;
        const { row, column } = params;
        const { lazy, trigger, accordion } = treeOpts;
        if (trigger === 'manual') {
          return;
        }
        evnt.stopPropagation();
        const rowid = getRowid($asTable, row);
        if (!lazy || !treeExpandLazyLoadedMaps[rowid]) {
          const expanded = !$asTable.isTreeExpandByRow(row);
          const columnIndex = $asTable.getColumnIndex(column);
          const $columnIndex = $asTable.getVMColumnIndex(column);
          if (treeEATime) {
            clearTimeout(treeEATime);
          }
          $asTable.setTreeExpand(row, expanded).then(() => {
            if (accordion) {
              internalData.treeEATime = setTimeout(() => {
                internalData.treeEATime = undefined;
                $asTable.scrollToRow(row);
              }, 30);
            }
          });
          dispatchEvent(
            'toggle-tree-expand',
            { expanded, column, columnIndex, $columnIndex, row },
            evnt,
          );
        }
      },
      handleColumnSortEvent(evnt, column) {
        const { mouseConfig } = props;
        const mouseOpts = computeMouseOpts.value;
        const { field, sortable, order } = column;
        if (sortable) {
          const params = {
            $table: $asTable,
            $event: evnt,
            column,
            field,
            property: field,
            order,
            sortList: $asTable.getSortColumns(),
            sortTime: column.sortTime,
          };
          if (mouseConfig && mouseOpts.area && $asTable.handleSortEvent) {
            $asTable.handleSortEvent(evnt, params);
          }
          if (!order) {
            dispatchEvent('clear-sort', params, evnt);
          }
          dispatchEvent('sort-change', params, evnt);
        }
      },
      /**
       * 点击排序事件
       */
      triggerSortEvent(evnt, column, order) {
        const sortOpts = computeSortOpts.value;
        const { multiple, allowClear } = sortOpts;
        const { field, sortable } = column;
        if (sortable) {
          if (!order || column.order === order) {
            if (allowClear) {
              $asTable.clearSort(multiple ? column : null);
            }
          } else {
            $asTable.sort({ field, order });
          }
          $asTable.handleColumnSortEvent(evnt, column);
        }
      },
      handleCellRuleUpdateStatus(type, cellParams, cellValue) {
        const { validStore } = reactData;
        const { row, column } = cellParams;
        if ($asTable.hasCellRules && $asTable.hasCellRules(type, row, column)) {
          const cell = $asTable.getCellElement(row, column);
          if (cell) {
            const customVal = !isUndefined(cellValue);
            return $asTable
              .validCellRules(type, row, column, cellValue)
              .then(() => {
                if (customVal && validStore.visible) {
                  setCellValue(row, column, cellValue);
                }
                $asTable.clearValidate(row, column);
              })
              .catch(({ rule }: any) => {
                if (customVal) {
                  setCellValue(row, column, cellValue);
                }
                $asTable.showValidTooltip({ rule, row, column, cell });
              });
          }
        }
        return nextTick();
      },
      /**
       * 表头单元格按下事件
       */
      triggerHeaderCellMousedownEvent(evnt, params) {
        const { mouseConfig } = props;
        const mouseOpts = computeMouseOpts.value;
        const columnOpts = computeColumnOpts.value;
        const columnDragOpts = computeColumnDragOpts.value;
        const { trigger, isCrossDrag, isPeerDrag, disabledMethod } =
          columnDragOpts;
        const cell = evnt.currentTarget as HTMLDivElement;
        const triggerInput =
          cell && cell.tagName && cell.tagName.toLowerCase() === 'input';
        const triggerCheckbox = getEventTargetNode(
          evnt,
          cell,
          `${prefixCls.value}-cell--checkbox`,
        ).flag;
        const triggerSort = getEventTargetNode(
          evnt,
          cell,
          `${prefixCls.value}-cell--sort`,
        ).flag;
        const triggerFilter = getEventTargetNode(
          evnt,
          cell,
          `${prefixCls.value}-cell--filter`,
        ).flag;
        let triggerDrag = false;
        const isColDragCell = columnOpts.drag && trigger === 'cell';
        if (
          !(triggerInput || triggerCheckbox || triggerSort || triggerFilter)
        ) {
          const { column } = params;
          if (
            isColDragCell &&
            !column.fixed &&
            (isCrossDrag || isPeerDrag || !column.parentId) &&
            !(disabledMethod && disabledMethod(params))
          ) {
            triggerDrag = true;
            $asTable.handleHeaderCellDragMousedownEvent(evnt, params);
          }
        }
        if (
          !triggerDrag &&
          mouseConfig &&
          mouseOpts.area &&
          $asTable.handleHeaderCellAreaMouseDnEvent
        ) {
          $asTable.handleHeaderCellAreaMouseDnEvent(
            evnt,
            Object.assign({ cell, triggerSort, triggerFilter }, params),
          );
        }
        $asTable.focus();
        if ($asTable.closeMenu) {
          $asTable.closeMenu();
        }
      },
      /**
       * 单元格按下事件
       */
      triggerCellMousedownEvent(evnt, params) {
        const { column } = params;
        const { type, treeNode } = column;
        const isRadioType = type === 'radio';
        const isCheckboxType = type === 'checkbox';
        const isExpandType = type === 'expand';
        const rowOpts = computeRowOpts.value;
        const rowDragOpts = computeRowDragOpts.value;
        const { trigger, isCrossDrag, isPeerDrag, disabledMethod } =
          rowDragOpts;
        const cell = evnt.currentTarget as HTMLElement;
        params.cell = cell;
        const triggerInput =
          cell && cell.tagName && cell.tagName.toLowerCase() === 'input';
        const triggerRadio =
          isRadioType &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}-cell--radio`).flag;
        const triggerCheckbox =
          isCheckboxType &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}-cell--checkbox`)
            .flag;
        const triggerTreeNode =
          treeNode &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}-cell--tree-btn`)
            .flag;
        const triggerExpandNode =
          isExpandType &&
          getEventTargetNode(evnt, cell, `${prefixCls.value}--expanded`).flag;
        const isColDragCell = rowOpts.drag
          ? trigger === 'row' || (column.dragSort && trigger === 'cell')
          : false;
        let triggerDrag = false;
        if (
          !(
            triggerInput ||
            triggerRadio ||
            triggerCheckbox ||
            triggerTreeNode ||
            triggerExpandNode
          ) &&
          isColDragCell &&
          (isCrossDrag || isPeerDrag || !params.level) &&
          !(disabledMethod && disabledMethod(params))
        ) {
          triggerDrag = true;
          $asTable.handleCellDragMousedownEvent(evnt, params);
        }
        if (!triggerDrag && $asTable.handleCellMousedownEvent) {
          $asTable.handleCellMousedownEvent(evnt, params);
        }
        $asTable.focus();
        $asTable.closeFilter();
        if ($asTable.closeMenu) {
          $asTable.closeMenu();
        }
      },
      triggerCellMouseupEvent() {
        clearDragStatus();
      },

      /**
       * 行拖拽
       */
      handleRowDragDragstartEvent(evnt) {
        if (evnt.dataTransfer) {
          evnt.dataTransfer.setDragImage(getTpImg(), 0, 0);
        }
        $asTable.closeTooltip();
      },
      handleRowDragSwapEvent(
        evnt,
        isSyncRow,
        dragRow,
        prevDragRow,
        prevDragPos,
        prevDragToChild,
      ) {
        const { treeConfig } = props;
        const rowDragOpts = computeRowDragOpts.value;
        const { afterFullData, tableFullData, fullAllDataRowIdData } =
          internalData;
        // TODO const $xeGanttView = internalData.xeGanttView;
        const {
          animation,
          isPeerDrag,
          isCrossDrag,
          isSelfToChildDrag,
          dragEndMethod,
          dragToChildMethod,
        } = rowDragOpts;
        const treeOpts = computeTreeOpts.value;
        const cellOpts = computeCellOpts.value;
        const defaultRowHeight = computeDefaultRowHeight.value;
        const { transform, rowField, mapChildrenField, parentField } = treeOpts;
        const childrenField = treeOpts.childrenField;
        const dEndMethod = dragEndMethod;
        const dragOffsetIndex = prevDragPos === 'bottom' ? 1 : 0;
        const el = refElem.value;
        const errRest = {
          status: false,
        };
        if (!(el && prevDragRow && dragRow)) {
          handleRowDragEndClearStatus();
          return Promise.resolve(errRest);
        }
        // 判断是否有拖动
        if (prevDragRow !== dragRow) {
          const dragParams = {
            oldRow: dragRow,
            newRow: prevDragRow,
            dragRow,
            dragPos: prevDragPos as 'bottom' | 'top',
            dragToChild: !!prevDragToChild,
            offsetIndex: dragOffsetIndex as 0 | 1,
          };

          const dragRowid = getRowid($asTable, dragRow);
          const dragRowRest =
            fullAllDataRowIdData[dragRowid] ||
            ({} as AsTableDefines.RowCacheItem);
          const _dragRowIndex = dragRowRest._index;
          let dragRowHeight = 0;
          let dragOffsetTop = -1;
          if (animation) {
            dragRowHeight = getCellRestHeight(
              dragRowRest,
              cellOpts,
              defaultRowHeight,
            );
            const oldTrEl = el.querySelector<HTMLElement>(
              `.${prefixCls.value}-body--row[rowid="${CSS.escape(dragRowid)}"]`,
            );
            if (oldTrEl) {
              dragOffsetTop = oldTrEl.offsetTop;
            }
          }

          let oafIndex = -1;
          let nafIndex = -1;
          const oldRest = dragRowRest;
          const newRowid = getRowid($asTable, prevDragRow);
          const newRest = fullAllDataRowIdData[newRowid];
          const oldAllMaps: Record<string, any> = {};
          let isSelfToChildStatus = false;

          // 如果为树结构
          if (treeConfig && transform && oldRest && newRest) {
            const { level: oldLevel } = oldRest;
            const { level: newLevel } = newRest;

            eachTree(
              [dragRow],
              (item) => {
                oldAllMaps[getRowid($asTable, item)] = item;
              },
              { children: mapChildrenField },
            );

            if (oldLevel && newLevel) {
              // 子到子

              if (isPeerDrag && !isCrossDrag) {
                if (oldRest.row[parentField] !== newRest.row[parentField]) {
                  // 非同级
                  handleRowDragEndClearStatus();
                  return Promise.resolve(errRest);
                }
              } else {
                if (!isCrossDrag) {
                  handleRowDragEndClearStatus();
                  return Promise.resolve(errRest);
                }
                if (oldAllMaps[newRowid]) {
                  isSelfToChildStatus = true;
                  if (!(isCrossDrag && isSelfToChildDrag)) {
                    if (message) {
                      message.error(locale?.value.treeDragChild);
                    }
                    handleRowDragEndClearStatus();
                    return Promise.resolve(errRest);
                  }
                }
              }
            } else if (oldLevel) {
              // 子到根

              if (!isCrossDrag) {
                handleRowDragEndClearStatus();
                return Promise.resolve(errRest);
              }
            } else if (newLevel) {
              // 根到子

              if (!isCrossDrag) {
                handleRowDragEndClearStatus();
                return Promise.resolve(errRest);
              }
              if (oldAllMaps[newRowid]) {
                isSelfToChildStatus = true;
                if (!(isCrossDrag && isSelfToChildDrag)) {
                  if (message) {
                    message.error(locale?.value.treeDragChild);
                  }
                  handleRowDragEndClearStatus();
                  return Promise.resolve(errRest);
                }
              }
            } else {
              // 根到根
            }
          }

          const isDragToChildFlag =
            isSelfToChildDrag && dragToChildMethod
              ? dragToChildMethod(dragParams)
              : prevDragToChild;
          if (dEndMethod) {
            handleRowDragEndClearStatus();
          }
          return Promise.resolve(dEndMethod ? dEndMethod(dragParams) : true)
            .then((status) => {
              if (!status) {
                return errRest;
              }

              // 如果为树结构
              if (treeConfig) {
                // 移出源位置
                if (transform && oldRest && newRest) {
                  const fullList = toTreeArray(internalData.afterTreeFullData, {
                    updated: false,
                    key: rowField,
                    parentKey: parentField,
                    children: mapChildrenField,
                  });

                  // 移出
                  const otfIndex = $asTable.findRowIndexOf(fullList, dragRow);
                  fullList.splice(otfIndex, 1);

                  // 插入
                  const ptfIndex = $asTable.findRowIndexOf(
                    fullList,
                    prevDragRow,
                  );
                  const ntfIndex = ptfIndex + dragOffsetIndex;
                  fullList.splice(ntfIndex, 0, dragRow);

                  // 改变层级
                  if (isSelfToChildStatus && isCrossDrag && isSelfToChildDrag) {
                    each(dragRow[childrenField], (childRow) => {
                      childRow[parentField] = dragRow[parentField];
                    });
                  }
                  // eslint-disable-next-line unicorn/prefer-minimal-ternary
                  dragRow[parentField] = isDragToChildFlag
                    ? prevDragRow[rowField]
                    : prevDragRow[parentField];

                  internalData.tableFullTreeData = toArrayTree(fullList, {
                    key: rowField,
                    parentKey: parentField,
                    children: childrenField,
                    mapChildren: mapChildrenField,
                  });
                }
              } else {
                // 移出
                oafIndex = $asTable.findRowIndexOf(afterFullData, dragRow);
                const otfIndex = $asTable.findRowIndexOf(
                  tableFullData,
                  dragRow,
                );
                afterFullData.splice(oafIndex, 1);
                tableFullData.splice(otfIndex, 1);
                // 插入
                const pafIndex = $asTable.findRowIndexOf(
                  afterFullData,
                  prevDragRow,
                );
                const ptfIndex = $asTable.findRowIndexOf(
                  tableFullData,
                  prevDragRow,
                );
                nafIndex = pafIndex + dragOffsetIndex;
                const ntfIndex = ptfIndex + dragOffsetIndex;
                afterFullData.splice(nafIndex, 0, dragRow);
                tableFullData.splice(ntfIndex, 0, dragRow);
              }

              $asTable.handleClearStack();
              $asTable.handleTableData(treeConfig && transform);
              $asTable.cacheRowMap(false);
              updateScrollYStatus();
              if (!(treeConfig && transform)) {
                $asTable.updateAfterDataIndex();
              }
              $asTable.checkSelectionStatus();
              if (reactData.scrollYLoad) {
                $asTable.updateScrollYSpace();
              }

              if (evnt) {
                dispatchEvent(
                  'row-dragend',
                  {
                    oldRow: dragRow,
                    newRow: prevDragRow,
                    dragRow,
                    dragPos: prevDragPos as any,
                    dragToChild: isDragToChildFlag,
                    offsetIndex: dragOffsetIndex,
                    _index: {
                      newIndex: nafIndex,
                      oldIndex: oafIndex,
                    },
                  },
                  evnt,
                );
              }

              return nextTick()
                .then(() => {
                  if (animation) {
                    const { tableData } = reactData;
                    const { fullAllDataRowIdData } = internalData;
                    const dragRowRest = fullAllDataRowIdData[dragRowid]!;
                    const _newRowIndex = dragRowRest._index;
                    const firstRow = tableData[0];
                    const firstRowRest =
                      fullAllDataRowIdData[getRowid($asTable, firstRow)];
                    let wrapperEl = el;

                    // TODO if ($xeGantt && $xeGanttView) {
                    //   const { refGanttContainerElem } = $xeGantt.getRefMaps();
                    //   const ganttContainerElem = refGanttContainerElem.value;
                    //   if (ganttContainerElem) {
                    //     wrapperEl = ganttContainerElem;
                    //   }
                    // }
                    if (firstRowRest) {
                      const _firstRowIndex = firstRowRest._index;
                      const _lastRowIndex = _firstRowIndex + tableData.length;

                      let rsIndex = -1;

                      let reIndex = -1;
                      let offsetRate = 1;
                      if (_dragRowIndex < _firstRowIndex) {
                        // 从上往下虚拟拖拽
                        rsIndex = 0;
                        reIndex = _newRowIndex - _firstRowIndex;
                      } else if (_dragRowIndex > _lastRowIndex) {
                        // 从下往上虚拟拖拽
                        const $newRowIndex = dragRowRest.$index;
                        rsIndex = $newRowIndex + 1;
                        reIndex = tableData.length;
                        offsetRate = -1;
                      } else {
                        if (_newRowIndex > _dragRowIndex) {
                          // 从上往下拖拽
                          rsIndex = _dragRowIndex - _firstRowIndex;
                          reIndex = rsIndex + _newRowIndex - _dragRowIndex;
                        } else {
                          // 从下往上拖拽
                          rsIndex = _newRowIndex - _firstRowIndex;
                          reIndex = rsIndex + _dragRowIndex - _newRowIndex + 1;
                          offsetRate = -1;
                        }
                      }

                      const dragRangeList = tableData.slice(rsIndex, reIndex);
                      if (dragRangeList.length > 0) {
                        const dtClss: string[] = [];
                        dragRangeList.forEach((row) => {
                          const rowid = getRowid($asTable, row);
                          dtClss.push(
                            `.${prefixCls.value}-body--row[rowid="${rowid}"]`,
                          );
                          // TODO if ($xeGantt) {
                          //   dtClss.push(
                          //     `.As-gantt-view--body-row[rowid="${rowid}"]`,
                          //     `.As-gantt-view--chart-row[rowid="${rowid}"]`,
                          //   );
                          // }
                        });
                        const dtTrList =
                          wrapperEl.querySelectorAll<HTMLElement>(
                            dtClss.join(','),
                          );
                        moveRowAnimateToTb(
                          dtTrList,
                          offsetRate * dragRowHeight,
                        );
                      }
                    }

                    const drClss = [
                      `.${prefixCls.value}-body--row[rowid="${dragRowid}"]`,
                    ];
                    // TODO if ($xeGantt) {
                    //   drClss.push(
                    //     `.As-gantt-view--body-row[rowid="${dragRowid}"]`,
                    //     `.As-gantt-view--chart-row[rowid="${dragRowid}"]`,
                    //   );
                    // }
                    const newDtTrList = wrapperEl.querySelectorAll<HTMLElement>(
                      drClss.join(','),
                    );
                    const newTrEl = newDtTrList[0];
                    if (dragOffsetTop > -1 && newTrEl) {
                      moveRowAnimateToTb(
                        newDtTrList,
                        dragOffsetTop - newTrEl.offsetTop,
                      );
                    }
                  }

                  updateRowOffsetTop();
                  updateRowExpandStyle();
                  $asTable.updateCellAreas();
                  $asTable.recalculate();
                })
                .then(() => {
                  return {
                    status: true,
                  };
                });
            })
            .catch(() => {
              return errRest;
            })
            .then((rest) => {
              handleRowDragEndClearStatus();
              return rest;
            });
        }
        handleRowDragEndClearStatus();
        return Promise.resolve(errRest);
      },
      handleCrossTableRowDragCancelEvent() {
        handleRowDragEndClearStatus();
      },
      /**
       * 处理跨表拖拽完成
       */
      handleCrossTableRowDragFinishEvent(evnt) {
        const { tableData } = reactData;
        const { fullAllDataRowIdData } = internalData;
        const cellOpts = computeCellOpts.value;
        const defaultRowHeight = computeDefaultRowHeight.value;
        const rowDragOpts = computeRowDragOpts.value;
        const { animation, isCrossTableDrag } = rowDragOpts;
        const treeOpts = computeTreeOpts.value;
        const { mapChildrenField } = treeOpts;
        const el = refElem.value;
        if (isCrossTableDrag && crossTableDragRowObj && crossTableDragRowInfo) {
          const { row: dragRow } = crossTableDragRowInfo;
          if (dragRow) {
            const dragRowid = getRowid($asTable, dragRow);
            const dragRowRest = fullAllDataRowIdData[dragRowid];
            let dragRowHeight = 0;
            let rsIndex = -1;
            if (dragRowRest) {
              if (animation) {
                dragRowHeight = getCellRestHeight(
                  dragRowRest,
                  cellOpts,
                  defaultRowHeight,
                );
              }
              rsIndex = dragRowRest.$index;
            }
            const dragRangeList =
              rsIndex > -1 && rsIndex < tableData.length - 1
                ? tableData.slice(rsIndex + 1)
                : [];
            const dragList = toTreeArray([dragRow], {
              updated: true,
              children: mapChildrenField,
            });
            $asTable.remove(dragList).then(() => {
              if (!(animation && dragRowHeight && dragRangeList.length > 0)) {
                return;
              }

              // TODO const $xeGanttView = internalData.xeGanttView;
              let wrapperEl = el;
              // if ($xeGantt && $xeGanttView) {
              //   const { refGanttContainerElem } = $xeGantt.getRefMaps();
              //   const ganttContainerElem = refGanttContainerElem.value;
              //   if (ganttContainerElem) {
              //     wrapperEl = ganttContainerElem;
              //   }
              // }

              const dtClss: string[] = [];
              dragRangeList.forEach((row) => {
                const rowid = getRowid($asTable, row);
                dtClss.push(`.${prefixCls.value}-body--row[rowid="${rowid}"]`);
                // TODO if ($xeGantt) {
                //   dtClss.push(
                //     `.${prefixCls.value}-gantt-view--body-row[rowid="${rowid}"]`,
                //     `.${prefixCls.value}-gantt-view--chart-row[rowid="${rowid}"]`,
                //   );
                // }
              });
              const dtTrList = wrapperEl.querySelectorAll<HTMLElement>(
                dtClss.join(','),
              );
              moveRowAnimateToTb(dtTrList, dragRowHeight);
            });
            dispatchEvent(
              'row-remove-dragend',
              {
                row: dragRow,
              },
              evnt,
            );
            handleRowDragEndClearStatus();
          }
        }
      },
      /**
       * 处理跨表拖至新的空表
       */
      handleCrossTableRowDragoverEmptyEvent(evnt) {
        const { tableData } = reactData;
        const rowDragOpts = computeRowDragOpts.value;
        const { isCrossTableDrag } = rowDragOpts;
        if (
          isCrossTableDrag &&
          crossTableDragRowObj &&
          tableData.length === 0
        ) {
          const { $oldTable, $newTable } = crossTableDragRowObj;
          if ($oldTable) {
            const oldTableReactData = $oldTable.reactData;
            if ($oldTable.xID !== $asTable.xID) {
              if ($newTable && $newTable.xID !== $asTable.xID) {
                $newTable.hideCrossTableRowDropClearStatus();
              }
              evnt.preventDefault();
              $oldTable.hideCrossTableRowDropClearStatus();
              crossTableDragRowObj.$newTable = $asTable;
              internalData.prevDragRow = null;
              reactData.dragTipText = oldTableReactData.dragTipText;
              showDropTip(
                evnt,
                evnt.currentTarget as HTMLDivElement,
                null,
                true,
                '',
              );
            }
          }
        }
      },
      /**
       * 处理跨表拖插入
       */
      handleCrossTableRowDragInsertEvent(evnt) {
        const { treeConfig } = props;
        const { prevDragRow, prevDragPos, prevDragToChild } = internalData;
        const rowDragOpts = computeRowDragOpts.value;
        const {
          animation,
          isSelfToChildDrag,
          isCrossTableDrag,
          dragEndMethod,
          dragToChildMethod,
        } = rowDragOpts;
        const cellOpts = computeCellOpts.value;
        const defaultRowHeight = computeDefaultRowHeight.value;
        const treeOpts = computeTreeOpts.value;
        const { parentField, mapChildrenField } = treeOpts;
        const childrenField = treeOpts.childrenField;
        // 跨表拖拽
        if (isCrossTableDrag && crossTableDragRowObj && crossTableDragRowInfo) {
          const { row: oldRow } = crossTableDragRowInfo;
          const { $oldTable } = crossTableDragRowObj;
          const el = refElem.value;
          if ($oldTable && oldRow) {
            const dragRow = oldRow;
            let dragOffsetIndex = -1;
            if (prevDragRow) {
              dragOffsetIndex = prevDragPos === 'bottom' ? 1 : 0;
            }
            const dragParams = {
              oldRow: dragRow,
              newRow: prevDragRow,
              dragRow,
              dragPos: prevDragPos as 'bottom' | 'top',
              dragToChild: !!prevDragToChild,
              offsetIndex: dragOffsetIndex as 0 | 1,
            };
            const isDragToChildFlag =
              isSelfToChildDrag && dragToChildMethod
                ? dragToChildMethod(dragParams)
                : prevDragToChild;
            const errRest = {
              status: false,
            };
            if (dragEndMethod) {
              handleRowDragEndClearStatus();
            }
            Promise.resolve(
              dragEndMethod ? dragEndMethod(dragParams) : true,
            ).then((status) => {
              if (!status) {
                if ($oldTable && $oldTable.xID !== $asTable.xID) {
                  $oldTable.handleCrossTableRowDragCancelEvent(evnt);
                }
                handleRowDragEndClearStatus();
                return errRest;
              }
              let insertRest: Promise<any> = Promise.resolve();
              if (treeConfig) {
                const dragList = toTreeArray([dragRow], {
                  updated: true,
                  children: mapChildrenField,
                });
                $oldTable.handleCrossTableRowDragFinishEvent(evnt);
                dragRow[parentField] = prevDragRow
                  ? prevDragRow[parentField]
                  : null;
                dragList.forEach((row) => {
                  row[childrenField] = undefined;
                  row[mapChildrenField] = undefined;
                });
                if (prevDragRow) {
                  insertRest =
                    prevDragPos === 'bottom'
                      ? $asTable.insertNextAt(dragList, prevDragRow)
                      : $asTable.insertAt(dragList, prevDragRow);
                } else {
                  insertRest = $asTable.insert(dragList);
                }
              } else {
                $oldTable.handleCrossTableRowDragFinishEvent(evnt);
                if (prevDragRow) {
                  insertRest =
                    prevDragPos === 'bottom'
                      ? $asTable.insertNextAt(dragRow, prevDragRow)
                      : $asTable.insertAt(dragRow, prevDragRow);
                } else {
                  insertRest = $asTable.insert(dragRow);
                }
              }
              dispatchEvent(
                'row-insert-dragend',
                {
                  oldRow,
                  newRow: prevDragRow,
                  dragRow,
                  dragPos: prevDragPos as any,
                  dragToChild: isDragToChildFlag,
                  offsetIndex: dragOffsetIndex,
                },
                evnt,
              );
              clearRowDragData();

              insertRest.then(() => {
                const { tableData } = reactData;
                const { fullAllDataRowIdData } = internalData;
                const oldRowid = getRowid($asTable, dragRow);
                const oldRowRest = fullAllDataRowIdData[oldRowid];
                let dragRowHeight = 0;
                let rsIndex = -1;
                if (oldRowRest) {
                  if (animation) {
                    dragRowHeight = getCellRestHeight(
                      oldRowRest,
                      cellOpts,
                      defaultRowHeight,
                    );
                  }
                  rsIndex = oldRowRest.$index;
                }
                const dragRangeList =
                  rsIndex > -1 ? tableData.slice(rsIndex) : [];
                if (animation && dragRowHeight && dragRangeList.length > 0) {
                  // TODO const $xeGanttView = internalData.xeGanttView;
                  let wrapperEl = el;
                  // if ($xeGantt && $xeGanttView) {
                  //   const { refGanttContainerElem } = $xeGantt.getRefMaps();
                  //   const ganttContainerElem = refGanttContainerElem.value;
                  //   if (ganttContainerElem) {
                  //     wrapperEl = ganttContainerElem;
                  //   }
                  // }

                  const dtClss: string[] = [];
                  dragRangeList.forEach((row) => {
                    const rowid = getRowid($asTable, row);
                    dtClss.push(
                      `.${prefixCls.value}-body--row[rowid="${rowid}"]`,
                    );
                    // TODO if ($xeGantt) {
                    //   dtClss.push(
                    //     `.${prefixCls.value}-gantt-view--body-row[rowid="${rowid}"]`,
                    //     `.${prefixCls.value}-gantt-view--chart-row[rowid="${rowid}"]`,
                    //   );
                    // }
                  });
                  const dtTrList = wrapperEl.querySelectorAll<HTMLElement>(
                    dtClss.join(','),
                  );
                  moveRowAnimateToTb(dtTrList, -dragRowHeight);
                }
              });
            });
          }
        }
      },
      hideCrossTableRowDropClearStatus() {
        hideDropTip();
      },
      handleRowDragDragendEvent(evnt) {
        const { treeConfig } = props;
        const { fullAllDataRowIdData, prevDragToChild } = internalData;
        const { dragRow } = reactData;
        const treeOpts = computeTreeOpts.value;
        const { lazy } = treeOpts;
        const hasChildField = treeOpts.hasChildField;
        const { prevDragRow, prevDragPos } = internalData;
        const rowDragOpts = computeRowDragOpts.value;
        const { isCrossTableDrag } = rowDragOpts;
        // 跨表拖拽
        if (isCrossTableDrag && crossTableDragRowObj) {
          const { $newTable } = crossTableDragRowObj;
          if ($newTable && $newTable.xID !== $asTable.xID) {
            $newTable.handleCrossTableRowDragInsertEvent(evnt);
            return;
          }
        }
        if (treeConfig && lazy && prevDragToChild) {
          // 懒加载
          const newRowid = getRowid($asTable, prevDragRow);
          const rowRest = fullAllDataRowIdData[newRowid];
          if (prevDragRow[hasChildField]) {
            if (rowRest && rowRest.treeLoaded) {
              $asTable.handleRowDragSwapEvent(
                evnt,
                true,
                dragRow,
                prevDragRow,
                prevDragPos,
                prevDragToChild,
              );
            }
          } else {
            $asTable.handleRowDragSwapEvent(
              evnt,
              true,
              dragRow,
              prevDragRow,
              prevDragPos,
              prevDragToChild,
            );
          }
        } else {
          $asTable.handleRowDragSwapEvent(
            evnt,
            true,
            dragRow,
            prevDragRow,
            prevDragPos,
            prevDragToChild,
          );
        }
      },
      handleRowDragDragoverEvent(evnt) {
        const { treeConfig } = props;
        const { fullAllDataRowIdData } = internalData;
        const { dragRow } = reactData;
        const treeOpts = computeTreeOpts.value;
        const { lazy, transform, parentField } = treeOpts;
        const hasChildField = treeOpts.hasChildField;
        const rowDragOpts = computeRowDragOpts.value;
        const { isPeerDrag, isCrossDrag, isToChildDrag, isCrossTableDrag } =
          rowDragOpts;
        if (
          !dragRow &&
          !(
            isCrossTableDrag &&
            (!treeConfig || isCrossDrag) &&
            crossTableDragRowObj
          )
        ) {
          evnt.preventDefault();
          return;
        }
        const isControlKey = hasControlKey(evnt);
        const trEl = evnt.currentTarget as HTMLElement;
        const rowid = trEl.getAttribute('rowid') || '';
        const rowRest = fullAllDataRowIdData[rowid];
        if (rowRest) {
          evnt.preventDefault();
          const row = rowRest.row;
          const offsetY = evnt.clientY - trEl.getBoundingClientRect().y;
          const dragPos = offsetY < trEl.clientHeight / 2 ? 'top' : 'bottom';
          internalData.prevDragToChild = !!(
            treeConfig &&
            transform &&
            isCrossDrag &&
            isToChildDrag &&
            isControlKey
          );
          internalData.prevDragRow = row;
          internalData.prevDragPos = dragPos;
          // 跨表拖拽
          if (
            isCrossTableDrag &&
            (!treeConfig || isCrossDrag) &&
            crossTableDragRowObj
          ) {
            const { $oldTable, $newTable } = crossTableDragRowObj;
            if ($oldTable) {
              const oldTableReactData = $oldTable.reactData;
              if ($oldTable.xID === $asTable.xID) {
                if ($newTable) {
                  $newTable.hideCrossTableRowDropClearStatus();
                }
                reactData.isCrossDragRow = false;
                oldTableReactData.isCrossDragRow = false;
                crossTableDragRowObj.$newTable = null;
              } else {
                if ($newTable && $newTable.xID !== $asTable.xID) {
                  $newTable.hideCrossTableRowDropClearStatus();
                }
                $oldTable.hideCrossTableRowDropClearStatus();
                oldTableReactData.isCrossDragRow = true;
                reactData.dragTipText = oldTableReactData.dragTipText;
                crossTableDragRowObj.$newTable = $asTable;
                showDropTip(evnt, trEl, null, true, dragPos);
                return;
              }
            }
          }
          if (
            $asTable.eqRow(dragRow, row) ||
            (isControlKey &&
              treeConfig &&
              lazy &&
              row[hasChildField] &&
              rowRest &&
              !rowRest.treeLoaded) ||
            (!isCrossDrag &&
              treeConfig &&
              transform &&
              (isPeerDrag
                ? dragRow[parentField] !== row[parentField]
                : rowRest.level))
          ) {
            showDropTip(evnt, trEl, null, false, dragPos);
            return;
          }
          showDropTip(evnt, trEl, null, true, dragPos);
          dispatchEvent(
            'row-dragover',
            {
              oldRow: dragRow,
              targetRow: row,
              dragPos,
            },
            evnt,
          );
        }
      },
      handleCellDragMousedownEvent(evnt, params) {
        evnt.stopPropagation();
        const rowDragOpts = computeRowDragOpts.value;
        const { isCrossTableDrag, trigger, dragStartMethod } = rowDragOpts;
        const { row } = params;
        const dragEl = evnt.currentTarget as HTMLElement;
        const tdEl =
          trigger === 'cell' || trigger === 'row'
            ? dragEl
            : (dragEl.parentElement?.parentElement as HTMLElement);
        const trEl = tdEl.parentElement as HTMLElement;
        clearRowDropOrigin();
        if (dragStartMethod && !dragStartMethod(params)) {
          trEl.draggable = false;
          reactData.dragRow = null;
          reactData.dragCol = null;
          clearCrossTableDragStatus();
          hideDropTip();
          return;
        }
        if (isCrossTableDrag) {
          crossTableDragRowInfo.row = row;
          crossTableDragRowObj = { $oldTable: $asTable, $newTable: null };
        }
        reactData.dragRow = row;
        reactData.isCrossDragRow = false;
        reactData.dragCol = null;
        trEl.draggable = true;
        updateRowDropOrigin(row);
        updateRowDropTipContent(tdEl);
        dispatchEvent('row-dragstart', params, evnt);
      },
      handleCellDragMouseupEvent() {
        clearDragStatus();
      },

      /**
       * 列拖拽
       */
      handleHeaderCellDragDragstartEvent(evnt) {
        if (evnt.dataTransfer) {
          evnt.dataTransfer.setDragImage(getTpImg(), 0, 0);
        }
        $asTable.closeTooltip();
      },

      handleColDragSwapColumn() {
        handleUpdateColumn();
        return parseColumns(false).then(() => {
          $asTable.updateCellAreas();
          $asTable.saveCustomStore('update:sort');
        });
      },
      handleColDragSwapEvent(
        evnt,
        isSyncColumn,
        dragCol,
        prevDragCol,
        prevDragPos,
        prevDragToChild,
      ) {
        const { mouseConfig } = props;
        const columnDragOpts = computeColumnDragOpts.value;
        const {
          animation,
          isPeerDrag,
          isCrossDrag,
          isSelfToChildDrag,
          isToChildDrag,
          dragEndMethod,
          dragToChildMethod,
        } = columnDragOpts;
        const { collectColumn, fullColumnIdData } = internalData;
        const el = refElem.value;
        const dragOffsetIndex = prevDragPos === 'right' ? 1 : 0;
        const errRest = {
          status: false,
        };
        if (!(el && prevDragCol && dragCol)) {
          return Promise.resolve(errRest);
        }
        // 判断是否有拖动
        if (prevDragCol !== dragCol) {
          const dragColumn = dragCol;
          const newColumn = prevDragCol;
          const dragParams = {
            oldColumn: dragColumn,
            newColumn,
            dragColumn,
            dragPos: prevDragPos as 'left' | 'right',
            dragToChild: !!prevDragToChild,
            offsetIndex: dragOffsetIndex as 0 | 1,
          };

          let dragTargetColumn: AsTableDefines.ColumnInfo | null = null;
          const dragAllTargetCols: AsTableDefines.ColumnInfo[] = [];
          let dragColWidth = 0;
          if (animation) {
            eachTree([dragColumn], (column) => {
              if (
                !dragTargetColumn &&
                (!column.children || column.children.length === 0)
              ) {
                dragTargetColumn = column;
                dragColWidth += column.renderWidth;
              }
              dragAllTargetCols.push(column);
            });
          }
          if (!dragTargetColumn) {
            dragTargetColumn = dragColumn;
          }
          const dragColRest =
            fullColumnIdData[dragTargetColumn!.id] ||
            ({} as AsTableDefines.ColumnCacheItem);
          const _dragColIndex = dragColRest._index;

          let dragOffsetLeft = -1;
          if (animation) {
            const oldTrEl = el.querySelector<HTMLElement>(
              `.${prefixCls.value}--column[colid="${CSS.escape(dragTargetColumn!.id)}"]`,
            );
            if (oldTrEl) {
              dragOffsetLeft = oldTrEl.offsetLeft;
            }
          }

          let oafIndex = -1;
          let nafIndex = -1;

          const oldAllMaps: Record<string, any> = {};
          eachTree([dragColumn], (column) => {
            oldAllMaps[column.id] = column;
          });

          let isSelfToChildStatus = false;

          if (dragColumn.parentId && newColumn.parentId) {
            // 子到子

            if (isPeerDrag && !isCrossDrag) {
              if (dragColumn.parentId !== newColumn.parentId) {
                // 非同级
                handleColDragEndClearStatus();
                return Promise.resolve(errRest);
              }
            } else {
              if (!isCrossDrag) {
                handleColDragEndClearStatus();
                return Promise.resolve(errRest);
              }

              if (oldAllMaps[newColumn.id]) {
                isSelfToChildStatus = true;
                if (!(isCrossDrag && isSelfToChildDrag)) {
                  if (message) {
                    message.error(locale?.value.treeDragChild);
                  }
                  handleColDragEndClearStatus();
                  return Promise.resolve(errRest);
                }
              }
            }
          } else if (dragColumn.parentId) {
            // 子到根

            if (!isCrossDrag) {
              handleColDragEndClearStatus();
              return Promise.resolve(errRest);
            }
          } else if (newColumn.parentId) {
            // 根到子

            if (!isCrossDrag) {
              handleColDragEndClearStatus();
              return Promise.resolve(errRest);
            }
            if (oldAllMaps[newColumn.id]) {
              isSelfToChildStatus = true;
              if (!(isCrossDrag && isSelfToChildDrag)) {
                if (message) {
                  message.error(locale?.value.treeDragChild);
                }
                handleColDragEndClearStatus();
                return Promise.resolve(errRest);
              }
            }
          } else {
            // 根到根
          }

          const isDragToChildFlag =
            isSelfToChildDrag && dragToChildMethod
              ? dragToChildMethod(dragParams)
              : prevDragToChild;
          return Promise.resolve(
            dragEndMethod ? dragEndMethod(dragParams) : true,
          )
            .then((status) => {
              if (!status) {
                return errRest;
              }

              const oldewMatchRest = findTree(
                collectColumn,
                (item) => item.id === dragColumn.id,
              );

              // 改变层级
              if (isSelfToChildStatus && isCrossDrag && isSelfToChildDrag) {
                if (oldewMatchRest) {
                  const { items: oCols, index: oIndex } = oldewMatchRest;
                  const childList = dragColumn.children || [];
                  childList.forEach((column: any) => {
                    column.parentId = dragColumn.parentId;
                  });
                  oCols.splice(oIndex, 1, ...childList);
                  dragColumn.children = [];
                }
              } else {
                if (oldewMatchRest) {
                  const {
                    items: oCols,
                    index: oIndex,
                    parent: oParent,
                  } = oldewMatchRest;
                  oCols.splice(oIndex, 1);
                  if (!oParent) {
                    oafIndex = oIndex;
                  }
                }
              }

              const newMatchRest = findTree(
                collectColumn,
                (item) => item.id === newColumn.id,
              );
              if (newMatchRest) {
                const {
                  items: nCols,
                  index: nIndex,
                  parent: nParent,
                } = newMatchRest;
                // 转子级
                if (isCrossDrag && isToChildDrag && isDragToChildFlag) {
                  dragColumn.parentId = newColumn.id;
                  newColumn.children = (newColumn.children || []).concat([
                    dragColumn,
                  ]);
                } else {
                  dragColumn.parentId = newColumn.parentId;
                  nCols.splice(nIndex + dragOffsetIndex, 0, dragColumn);
                }
                if (!nParent) {
                  nafIndex = nIndex;
                }
              }

              eachTree(
                collectColumn,
                (column, index, items, path, parentColumn) => {
                  if (parentColumn) {
                    return;
                  }

                  const sortIndex = index + 1;
                  column.renderSortNumber = sortIndex;
                },
              );

              $asTable.handleClearStack();
              if (mouseConfig) {
                if ($asTable.clearSelected) {
                  $asTable.clearSelected();
                }
                if ($asTable.clearCellAreas) {
                  $asTable.clearCellAreas();
                  $asTable.clearCopyCellArea();
                }
              }

              if (evnt) {
                dispatchEvent(
                  'column-dragend',
                  {
                    oldColumn: dragColumn,
                    newColumn,
                    dragColumn,
                    dragPos: prevDragPos,
                    dragToChild: isDragToChildFlag,
                    offsetIndex: dragOffsetIndex,
                    _index: {
                      newIndex: nafIndex,
                      oldIndex: oafIndex,
                    },
                  },
                  evnt,
                );
              }

              return nextTick()
                .then(() => {
                  if (isSyncColumn) {
                    return $asTable.handleColDragSwapColumn();
                  }
                })
                .then(() => {
                  if (animation) {
                    const { tableColumn } = reactData;
                    const { visibleColumn, fullColumnIdData } = internalData;
                    let dragNewColumn: AsTableDefines.ColumnInfo | null = null;
                    const dragNewColMaps: Record<
                      string,
                      AsTableDefines.ColumnInfo
                    > = {};
                    eachTree([dragColumn], (column) => {
                      if (
                        !dragNewColumn &&
                        (!column.children || column.children.length === 0)
                      ) {
                        dragNewColumn = column;
                      }
                      dragNewColMaps[column.id] = column;
                    });
                    if (!dragNewColumn) {
                      dragNewColumn = dragColumn;
                    }

                    if (dragColWidth && dragAllTargetCols.length > 0) {
                      const _newColIndex = findIndexOf(
                        visibleColumn,
                        (column) =>
                          !!dragNewColumn && column.id === dragNewColumn.id,
                      );
                      const firstCol = tableColumn[0]!;
                      const firstColRest = fullColumnIdData[firstCol.id];

                      if (firstColRest) {
                        const _firstColIndex = firstColRest._index;
                        const _lastColIndex =
                          _firstColIndex + tableColumn.length;

                        let csIndex = -1;

                        let ceIndex = -1;
                        let offsetRate = 1;
                        if (_dragColIndex < _firstColIndex) {
                          // 从左往右虚拟拖拽
                          csIndex = 0;
                          ceIndex = _newColIndex - _firstColIndex;
                        } else if (_dragColIndex > _lastColIndex) {
                          // 从右往左虚拟拖拽
                          const $newRowIndex = dragColRest.$index;
                          csIndex = $newRowIndex + 1;
                          ceIndex = tableColumn.length;
                          offsetRate = -1;
                        } else {
                          if (_newColIndex > _dragColIndex) {
                            // 从左往右拖拽
                            csIndex = _dragColIndex - _firstColIndex;
                            ceIndex = csIndex + _newColIndex - _dragColIndex;
                          } else {
                            // 从右往左拖拽
                            csIndex = _newColIndex - _firstColIndex + 1;
                            ceIndex = csIndex + _dragColIndex - _newColIndex;
                            offsetRate = -1;
                          }
                        }

                        const dragRangeList: AsTableDefines.ColumnInfo[] = [];
                        const dragRangeMaps: Record<
                          string,
                          AsTableDefines.ColumnInfo
                        > = {};
                        for (let i = csIndex; i < ceIndex; i++) {
                          const column = tableColumn[i]!;
                          if (
                            !dragRangeMaps[column.id] &&
                            !dragNewColMaps[column.id]
                          ) {
                            dragRangeMaps[column.id] = column;
                            dragRangeList.push(column);
                          }
                        }
                        eachTree([newColumn], (column) => {
                          if (dragRangeMaps[column.id]) {
                            return;
                          }

                          dragRangeMaps[column.id] = column;
                          dragRangeList.push(column);
                        });
                        if (dragRangeList.length > 0) {
                          const dtTrList = el.querySelectorAll<HTMLElement>(
                            dragRangeList
                              .map(
                                (column) =>
                                  `.${prefixCls.value}--column[colid="${column.id}"]`,
                              )
                              .join(','),
                          );
                          moveColAnimateToLr(
                            dtTrList,
                            offsetRate * dragColWidth,
                          );
                        }
                      }

                      const newTrList = el.querySelectorAll<HTMLElement>(
                        dragAllTargetCols
                          .map(
                            (column) =>
                              `.${prefixCls.value}--column[colid="${column.id}"]`,
                          )
                          .join(','),
                      );
                      const newTdEl = newTrList[0];
                      if (dragOffsetLeft > -1 && newTdEl) {
                        moveColAnimateToLr(
                          newTrList,
                          dragOffsetLeft - newTdEl.offsetLeft,
                        );
                      }
                    }
                  }

                  updateColumnOffsetLeft();
                  loadScrollXData();
                  $asTable.updateCellAreas();

                  return {
                    status: true,
                  };
                });
            })
            .catch(() => {
              return errRest;
            })
            .then((rest) => {
              handleColDragEndClearStatus();
              return rest;
            });
        }
        handleColDragEndClearStatus();
        return Promise.resolve(errRest);
      },

      handleHeaderCellDragDragendEvent(evnt) {
        const { dragCol } = reactData;
        const { prevDragCol, prevDragPos, prevDragToChild } = internalData;
        $asTable.handleColDragSwapEvent(
          evnt,
          true,
          dragCol,
          prevDragCol,
          prevDragPos,
          prevDragToChild,
        );
      },
      handleHeaderCellDragDragoverEvent(evnt) {
        const { dragCol } = reactData;
        const columnDragOpts = computeColumnDragOpts.value;
        const { isToChildDrag, isPeerDrag, isCrossDrag } = columnDragOpts;
        if (!dragCol) {
          evnt.preventDefault();
          return;
        }
        const isControlKey = hasControlKey(evnt);
        const thEl = evnt.currentTarget as HTMLElement;
        const colid = thEl.getAttribute('colid');
        const column = $asTable.getColumnById(colid);
        if (column) {
          evnt.preventDefault();
          const { clientX } = evnt;
          const offsetX = clientX - thEl.getBoundingClientRect().x;
          const dragPos = offsetX < thEl.clientWidth / 2 ? 'left' : 'right';
          internalData.prevDragToChild = !!(
            isCrossDrag &&
            isToChildDrag &&
            isControlKey
          );
          internalData.prevDragCol = column;
          internalData.prevDragPos = dragPos;
          if (
            column.fixed ||
            (dragCol && dragCol.id === column.id) ||
            (!isCrossDrag &&
              (isPeerDrag
                ? dragCol.parentId !== column.parentId
                : column.parentId))
          ) {
            showDropTip(evnt, null, thEl, false, dragPos);
            return;
          }
          showDropTip(evnt, null, thEl, true, dragPos);
          dispatchEvent(
            'column-dragover',
            {
              oldColumn: dragCol,
              targetColumn: column,
              dragPos,
            },
            evnt,
          );

          // 边缘滚动
          const el = refElem.value;
          if (!el) {
            return;
          }
          const xHandleEl = refScrollXHandleElem.value;
          const tableBody = refTableBody.value;
          const tableBodyElem = tableBody
            ? (tableBody.$el as HTMLDivElement)
            : null;
          const scrollTargetEl = xHandleEl || tableBodyElem;
          if (scrollTargetEl) {
            const wrapperRect = el.getBoundingClientRect();
            const tableWrapperWidth = el.clientWidth;
            const leftContainerElem = refLeftContainer.value;
            const leftContainerWidth = leftContainerElem
              ? leftContainerElem.clientWidth
              : 0;
            const rightContainerElem = refRightContainer.value;
            const rightContainerWidth = rightContainerElem
              ? rightContainerElem.clientWidth
              : 0;
            const srartX = wrapperRect.x + leftContainerWidth;
            const endX =
              wrapperRect.x + tableWrapperWidth - rightContainerWidth;
            const distSize = 28;
            const startDistSize = clientX - srartX;
            const endDistSize = endX - clientX;
            if (startDistSize > 0 && startDistSize <= distSize) {
              const scrollRatio = Math.floor(
                tableWrapperWidth / (startDistSize > distSize / 2 ? 240 : 120),
              );
              scrollTargetEl.scrollLeft -=
                scrollRatio * (distSize - startDistSize);
            } else if (endDistSize > 0 && endDistSize <= distSize) {
              const scrollRatio = Math.floor(
                tableWrapperWidth / (endDistSize > distSize / 2 ? 240 : 120),
              );
              scrollTargetEl.scrollLeft +=
                scrollRatio * (distSize - endDistSize);
            }
          }
        }
      },
      handleHeaderCellDragMousedownEvent(evnt, params) {
        evnt.stopPropagation();
        const columnDragOpts = computeColumnDragOpts.value;
        const { trigger, dragStartMethod } = columnDragOpts;
        const { column } = params;
        const dragEl = evnt.currentTarget as HTMLElement;
        const thEl =
          trigger === 'cell'
            ? dragEl
            : (dragEl.parentElement?.parentElement as HTMLElement);
        clearColDropOrigin();
        if (dragStartMethod && !dragStartMethod(params)) {
          thEl.draggable = false;
          reactData.dragRow = null;
          reactData.dragCol = null;
          clearCrossTableDragStatus();
          hideDropTip();
          return;
        }
        reactData.dragCol = column;
        reactData.dragRow = null;
        thEl.draggable = true;
        clearCrossTableDragStatus();
        updateColDropOrigin(column);
        updateColDropTipContent(thEl);
        dispatchEvent('column-dragstart', params, evnt);
      },
      handleHeaderCellDragMouseupEvent() {
        clearColDropOrigin();
        hideDropTip();
        clearCrossTableDragStatus();
        reactData.dragRow = null;
        reactData.dragCol = null;
      },

      handleScrollEvent(evnt, isRollY, isRollX, scrollTop, scrollLeft, params) {
        const { lastScrollLeft, lastScrollTop } = internalData;
        const xHandleEl = refScrollXHandleElem.value;
        const yHandleEl = refScrollYHandleElem.value;
        if (!xHandleEl || !yHandleEl) {
          return;
        }
        const rowOpts = computeRowOpts.value;
        const validTip = refValidTooltip.value;
        const tooltip = refTooltip.value;
        const bodyHeight = yHandleEl.clientHeight;
        const bodyWidth = xHandleEl.clientWidth;
        const scrollHeight = yHandleEl.scrollHeight;
        const scrollWidth = xHandleEl.scrollWidth;
        let isTop = false;
        let isBottom = false;
        let isLeft = false;
        let isRight = false;
        let direction = '';
        let isTopBoundary = false;
        let isBottomBoundary = false;
        let isLeftBoundary = false;
        let isRightBoundary = false;
        if (isRollX) {
          const xThreshold = computeScrollXThreshold.value;
          isLeft = scrollLeft <= 0;
          if (!isLeft) {
            isRight = scrollLeft + bodyWidth >= scrollWidth;
          }
          if (scrollLeft > lastScrollLeft) {
            direction = 'right';
            if (scrollLeft + bodyWidth >= scrollWidth - xThreshold) {
              isRightBoundary = true;
            }
          } else {
            direction = 'left';
            if (scrollLeft <= xThreshold) {
              isLeftBoundary = true;
            }
          }
          $asTable.checkScrolling();
          internalData.lastScrollLeft = scrollLeft;
        }
        if (isRollY) {
          const yThreshold = computeScrollYThreshold.value;
          isTop = scrollTop <= 1;
          if (!isTop) {
            isBottom = scrollTop + bodyHeight >= scrollHeight - 1;
          }
          if (scrollTop > lastScrollTop) {
            direction = 'bottom';
            if (scrollTop + bodyHeight >= scrollHeight - yThreshold) {
              isBottomBoundary = true;
            }
          } else {
            direction = 'top';
            if (scrollTop <= yThreshold) {
              isTopBoundary = true;
            }
          }
          internalData.lastScrollTop = scrollTop;
        }
        internalData.lastSTime = Date.now();
        const evntParams = {
          source: sourceType,
          scrollTop,
          scrollLeft,
          bodyHeight,
          bodyWidth,
          scrollHeight,
          scrollWidth,
          isX: isRollX,
          isY: isRollY,
          isTop,
          isBottom,
          isLeft,
          isRight,
          direction,
          ...params,
        };
        updateRowExpandStyle();
        checkLastSyncScroll(isRollX, isRollY);
        if (isRollX) {
          $asTable.closeFilter();
        }
        if (rowOpts.isHover) {
          $asTable.clearHoverRow();
        }
        if (validTip && validTip.reactData.visible) {
          validTip.close();
        }
        if (tooltip && tooltip.reactData.visible) {
          tooltip.close();
        }
        if (
          isBottomBoundary ||
          isTopBoundary ||
          isRightBoundary ||
          isLeftBoundary
        ) {
          dispatchEvent('scroll-boundary', evntParams, evnt);
        }
        dispatchEvent('scroll', evntParams, evnt);
      },

      /**
       * 横向 X 可视渲染事件处理
       */
      triggerScrollXEvent() {
        const virtualXOpts = computeVirtualXOpts.value;
        if (virtualXOpts.immediate) {
          loadScrollXData();
        } else {
          lazyScrollXData();
        }
      },
      /**
       * 纵向 Y 可视渲染事件处理
       */
      triggerScrollYEvent() {
        const virtualYOpts = computeVirtualYOpts.value;
        if (virtualYOpts.immediate) {
          loadScrollYData();
        } else {
          lazyScrollYData();
        }
      },

      triggerBodyScrollEvent(evnt, fixedType) {
        const { scrollYLoad, scrollXLoad } = reactData;
        const {
          elemStore,
          intoRunScroll,
          lastScrollTop,
          lastScrollLeft,
          inWheelScroll,
          inVirtualScroll,
          inHeaderScroll,
          inBodyScroll,
          scrollRenderType,
          inFooterScroll,
        } = internalData;
        if (
          inWheelScroll ||
          inVirtualScroll ||
          inHeaderScroll ||
          inFooterScroll
        ) {
          return;
        }
        const xHandleEl = refScrollXHandleElem.value;
        const yHandleEl = refScrollYHandleElem.value;
        const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        const rowExpandEl = refRowExpandElem.value;
        if (intoRunScroll) {
          return;
        }
        if (!bodyScrollElem) {
          return;
        }
        if (!xHandleEl) {
          return;
        }
        if (!yHandleEl) {
          return;
        }
        if (inBodyScroll && scrollRenderType !== fixedType) {
          return;
        }

        let scrollTop = yHandleEl.scrollTop;
        let scrollLeft = xHandleEl.scrollLeft;
        if (leftScrollElem && fixedType === 'left') {
          scrollTop = leftScrollElem.scrollTop;
        } else if (rightScrollElem && fixedType === 'right') {
          scrollTop = rightScrollElem.scrollTop;
        } else {
          scrollTop = bodyScrollElem.scrollTop;
          scrollLeft = bodyScrollElem.scrollLeft;
        }
        const isRollX = scrollLeft !== lastScrollLeft;
        const isRollY = scrollTop !== lastScrollTop;
        internalData.inBodyScroll = true;
        internalData.scrollRenderType = fixedType;
        if (isRollY) {
          if (fixedType === 'left') {
            setScrollTop(bodyScrollElem, scrollTop);
            setScrollTop(rightScrollElem, scrollTop);
          } else if (fixedType === 'right') {
            setScrollTop(bodyScrollElem, scrollTop);
            setScrollTop(leftScrollElem, scrollTop);
          } else {
            setScrollTop(leftScrollElem, scrollTop);
            setScrollTop(rightScrollElem, scrollTop);
          }
          setScrollTop(yHandleEl, scrollTop);
          setScrollTop(rowExpandEl, scrollTop);
          // TODO syncGanttScrollTop(scrollTop);
          if (scrollYLoad) {
            $asTable.triggerScrollYEvent(evnt);
          }
        }
        if (isRollX) {
          setScrollLeft(xHandleEl, scrollLeft);
          setScrollLeft(headerScrollElem, scrollLeft);
          setScrollLeft(footerScrollElem, scrollLeft);
          if (scrollXLoad) {
            $asTable.triggerScrollXEvent(evnt);
          }
        }
        $asTable.handleScrollEvent(
          evnt,
          isRollY,
          isRollX,
          scrollTop,
          scrollLeft,
          {
            type: 'body',
            fixed: fixedType,
          },
        );
      },
      triggerHeaderScrollEvent(evnt, fixedType) {
        const { scrollXLoad } = reactData;
        const {
          elemStore,
          intoRunScroll,
          inWheelScroll,
          inVirtualScroll,
          inBodyScroll,
          inFooterScroll,
        } = internalData;
        if (
          inWheelScroll ||
          inVirtualScroll ||
          inBodyScroll ||
          inFooterScroll
        ) {
          return;
        }
        const yHandleEl = refScrollYHandleElem.value;
        const xHandleEl = refScrollXHandleElem.value;
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        if (intoRunScroll) {
          return;
        }
        if (!headerScrollElem) {
          return;
        }
        if (!xHandleEl) {
          return;
        }
        if (!yHandleEl) {
          return;
        }
        const scrollTop = yHandleEl.scrollTop;
        const scrollLeft = headerScrollElem.scrollLeft;
        const isRollX = true;
        const isRollY = false;
        internalData.inHeaderScroll = true;
        setScrollLeft(xHandleEl, scrollLeft);
        setScrollLeft(footerScrollElem, scrollLeft);
        setScrollLeft(bodyScrollElem, scrollLeft);
        if (scrollXLoad) {
          $asTable.triggerScrollXEvent(evnt);
        }
        $asTable.handleScrollEvent(
          evnt,
          isRollY,
          isRollX,
          scrollTop,
          scrollLeft,
          {
            type: 'header',
            fixed: fixedType,
          },
        );
      },
      triggerFooterScrollEvent(evnt, fixedType) {
        const { scrollXLoad } = reactData;
        const {
          elemStore,
          intoRunScroll,
          inWheelScroll,
          inVirtualScroll,
          inHeaderScroll,
          inBodyScroll,
        } = internalData;
        if (
          inWheelScroll ||
          inVirtualScroll ||
          inHeaderScroll ||
          inBodyScroll
        ) {
          return;
        }
        const yHandleEl = refScrollYHandleElem.value;
        const xHandleEl = refScrollXHandleElem.value;
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        if (intoRunScroll) {
          return;
        }
        if (!footerScrollElem) {
          return;
        }
        if (!xHandleEl) {
          return;
        }
        if (!yHandleEl) {
          return;
        }
        const scrollTop = yHandleEl.scrollTop;
        const scrollLeft = footerScrollElem.scrollLeft;
        const isRollX = true;
        const isRollY = false;
        internalData.inFooterScroll = true;
        setScrollLeft(xHandleEl, scrollLeft);
        setScrollLeft(headerScrollElem, scrollLeft);
        setScrollLeft(bodyScrollElem, scrollLeft);
        if (scrollXLoad) {
          $asTable.triggerScrollXEvent(evnt);
        }
        $asTable.handleScrollEvent(
          evnt,
          isRollY,
          isRollX,
          scrollTop,
          scrollLeft,
          {
            type: 'footer',
            fixed: fixedType,
          },
        );
      },
      triggerBodyWheelEvent(evnt) {
        const { target, deltaY, deltaX, shiftKey } = evnt;
        if (target && /^textarea$/i.test((target as HTMLElement).tagName)) {
          return;
        }
        // 如果滚轮未移动或者触摸板未变化位置
        if (!deltaY && !deltaX) {
          return;
        }

        const { scrollXLoad, scrollYLoad, overflowX, overflowY, expandColumn } =
          reactData;
        const leftFixedWidth = computeLeftFixedWidth.value;
        const rightFixedWidth = computeRightFixedWidth.value;

        const { elemStore, lastScrollTop, lastScrollLeft } = internalData;
        const rowOpts = computeRowOpts.value;
        const scrollbarXOpts = computeScrollbarXOpts.value;
        const scrollbarYOpts = computeScrollbarYOpts.value;
        const xHandleEl = refScrollXHandleElem.value;
        const yHandleEl = refScrollYHandleElem.value;
        const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
        const rowExpandEl = refRowExpandElem.value;
        if (!bodyScrollElem) {
          return;
        }

        const wheelSpeed = getWheelSpeed(internalData.lastSTime);
        const deltaTop = shiftKey ? 0 : deltaY * wheelSpeed;
        const deltaLeft = (shiftKey ? deltaX || deltaY : deltaX) * wheelSpeed;

        const currScrollTop = bodyScrollElem.scrollTop;
        const currScrollLeft = bodyScrollElem.scrollLeft;

        const scrollTop = Math.max(0, currScrollTop + deltaTop);
        const scrollLeft = Math.max(0, currScrollLeft + deltaLeft);
        const isRollX = overflowX && scrollLeft !== lastScrollLeft;
        const isRollY = overflowY && scrollTop !== lastScrollTop;

        // 如果禁用滚动
        if (isRollX && scrollbarXOpts.visible === 'hidden') {
          evnt.preventDefault();
          return;
        }
        if (isRollY) {
          // 如果禁用滚动
          if (scrollbarYOpts.visible === 'hidden') {
            evnt.preventDefault();
            return;
          }
          const isTopWheel = deltaTop < 0;
          // 如果滚动位置已经是顶部或底部，则不需要触发
          if (
            isTopWheel
              ? currScrollTop <= 0
              : currScrollTop >=
                bodyScrollElem.scrollHeight - bodyScrollElem.clientHeight
          ) {
            return;
          }
        }

        // 展开行处理，如果展开行嵌入表格中
        if ($asParentTable) {
          if (
            isRollY &&
            checkTargetElement(
              evnt.target,
              [leftScrollElem, bodyScrollElem, rightScrollElem],
              evnt.currentTarget,
            )
          ) {
            evnt.stopPropagation();
            return;
          }
          if (
            isRollX &&
            checkTargetElement(
              evnt.target,
              [headerScrollElem, bodyScrollElem, footerScrollElem],
              evnt.currentTarget,
            )
          ) {
            evnt.stopPropagation();
            return;
          }
        }

        if (!(isRollX || leftFixedWidth || rightFixedWidth || expandColumn)) {
          return;
        }

        if (rowOpts.isHover) {
          $asTable.clearHoverRow();
        }

        // 用于鼠标纵向滚轮处理
        if (isRollX) {
          evnt.preventDefault();
          internalData.inWheelScroll = true;
          wheelScrollLeftTo(scrollLeft, (offsetLeft: number) => {
            internalData.inWheelScroll = true;
            const currLeftNum = offsetLeft;
            setScrollLeft(xHandleEl, currLeftNum);
            setScrollLeft(bodyScrollElem, currLeftNum);
            setScrollLeft(headerScrollElem, currLeftNum);
            setScrollLeft(footerScrollElem, currLeftNum);
            if (scrollXLoad) {
              $asTable.triggerScrollXEvent(evnt);
            }
            $asTable.handleScrollEvent(
              evnt,
              isRollY,
              isRollX,
              bodyScrollElem.scrollTop,
              currLeftNum,
              {
                type: 'table',
                fixed: '',
              },
            );
          });
        }
        if (isRollY) {
          evnt.preventDefault();
          internalData.inWheelScroll = true;
          wheelScrollTopTo(scrollTop, (offsetTop: number) => {
            internalData.inWheelScroll = true;
            const currTopNum = offsetTop;
            setScrollTop(yHandleEl, currTopNum);
            setScrollTop(bodyScrollElem, currTopNum);
            setScrollTop(leftScrollElem, currTopNum);
            setScrollTop(rightScrollElem, currTopNum);
            setScrollTop(rowExpandEl, currTopNum);
            // TODO syncGanttScrollTop(currTopNum);
            if (scrollYLoad) {
              $asTable.triggerScrollYEvent(evnt);
            }
            $asTable.handleScrollEvent(
              evnt,
              isRollY,
              isRollX,
              offsetTop,
              bodyScrollElem.scrollLeft,
              {
                type: 'table',
                fixed: '',
              },
            );
          });
        }
      },

      triggerVirtualScrollXEvent(evnt) {
        const { scrollXLoad } = reactData;
        const {
          elemStore,
          inWheelScroll,
          lastScrollTop,
          inHeaderScroll,
          inBodyScroll,
          inFooterScroll,
        } = internalData;
        if (inHeaderScroll || inBodyScroll || inFooterScroll) {
          return;
        }
        if (inWheelScroll) {
          return;
        }
        const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const footerScrollElem = getRefElem(elemStore['main-footer-scroll']);
        const yHandleEl = refScrollYHandleElem.value;
        const wrapperEl = evnt.currentTarget as HTMLDivElement;
        const { scrollLeft } = wrapperEl;
        const yBodyEl = yHandleEl || bodyScrollElem;
        const scrollTop = yBodyEl ? yBodyEl.scrollTop : 0;
        const isRollX = true;
        const isRollY = scrollTop !== lastScrollTop;

        internalData.inVirtualScroll = true;
        setScrollLeft(bodyScrollElem, scrollLeft);
        setScrollLeft(headerScrollElem, scrollLeft);
        setScrollLeft(footerScrollElem, scrollLeft);
        if (scrollXLoad) {
          $asTable.triggerScrollXEvent(evnt);
        }
        $asTable.handleScrollEvent(
          evnt,
          isRollY,
          isRollX,
          scrollTop,
          scrollLeft,
          {
            type: 'table',
            fixed: '',
          },
        );
      },
      triggerVirtualScrollYEvent(evnt) {
        const { scrollYLoad } = reactData;
        const {
          elemStore,
          inWheelScroll,
          lastScrollLeft,
          inHeaderScroll,
          inBodyScroll,
          inFooterScroll,
        } = internalData;
        if (inHeaderScroll || inBodyScroll || inFooterScroll) {
          return;
        }
        if (inWheelScroll) {
          return;
        }
        const leftScrollElem = getRefElem(elemStore['left-body-scroll']);
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const rightScrollElem = getRefElem(elemStore['right-body-scroll']);
        const rowExpandEl = refRowExpandElem.value;
        const xHandleEl = refScrollXHandleElem.value;
        const wrapperEl = evnt.currentTarget as HTMLDivElement;
        const { scrollTop } = wrapperEl;
        const xBodyEl = xHandleEl || bodyScrollElem;
        const scrollLeft = xBodyEl ? xBodyEl.scrollLeft : 0;
        const isRollX = scrollLeft !== lastScrollLeft;
        const isRollY = true;
        internalData.inVirtualScroll = true;
        setScrollTop(bodyScrollElem, scrollTop);
        setScrollTop(leftScrollElem, scrollTop);
        setScrollTop(rightScrollElem, scrollTop);
        setScrollTop(rowExpandEl, scrollTop);
        // TODO syncGanttScrollTop(scrollTop);
        if (scrollYLoad) {
          $asTable.triggerScrollYEvent(evnt);
        }
        $asTable.handleScrollEvent(
          evnt,
          isRollY,
          isRollX,
          scrollTop,
          scrollLeft,
          {
            type: 'table',
            fixed: '',
          },
        );
      },

      /**
       * 对于树形结构中，可以直接滚动到指定深层节点中
       * 对于某些特定的场景可能会用到，比如定位到某一节点
       * @param {Row} row 行对象
       */
      scrollToTreeRow(row) {
        const { treeConfig } = props;
        const { isRowGroupStatus } = reactData;
        const { tableFullData } = internalData;
        const rests: Promise<any>[] = [];
        if (treeConfig || isRowGroupStatus) {
          const aggregateOpts = computeAggregateOpts.value;
          const treeOpts = computeTreeOpts.value;
          const childrenField = treeOpts.childrenField;
          const matchObj = findTree(
            tableFullData,
            (item) => $asTable.eqRow(item, row),
            {
              children: isRowGroupStatus
                ? aggregateOpts.mapChildrenField
                : childrenField,
            },
          );
          if (matchObj) {
            const nodes = matchObj.nodes;
            nodes.forEach((row, index) => {
              if (
                index < nodes.length - 1 &&
                !$asTable.isTreeExpandByRow(row)
              ) {
                rests.push($asTable.setTreeExpand(row, true));
              }
            });
          }
        }
        return Promise.all(rests).then(() => rowToVisible($asTable, row));
      },
      updateScrollYStatus,
      // 更新横向 X 可视渲染上下剩余空间大小
      updateScrollXSpace() {
        const { scrollXLoad, overflowX, scrollXWidth } = reactData;
        const { visibleColumn, scrollXStore, elemStore, fullColumnIdData } =
          internalData;
        // TODO const $xeGanttView = internalData.xeGanttView
        const mouseOpts = computeMouseOpts.value;
        const tableBody = refTableBody.value;
        const tableBodyElem = tableBody
          ? (tableBody.$el as HTMLDivElement)
          : null;
        if (tableBodyElem) {
          const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
          const bodyTableElem = getRefElem(elemStore['main-body-table']);
          const headerTableElem = getRefElem(elemStore['main-header-table']);
          const footerTableElem = getRefElem(elemStore['main-footer-table']);
          let xSpaceLeft = 0;
          const firstColumn = visibleColumn[scrollXStore.startIndex];
          if (firstColumn) {
            const colRest =
              fullColumnIdData[firstColumn.id] ||
              ({} as AsTableDefines.ColumnCacheItem);
            xSpaceLeft = colRest.oLeft;
          }

          const clientWidth = bodyScrollElem ? bodyScrollElem.clientWidth : 0;
          // 虚拟渲染
          let isScrollXBig = false;
          let ySpaceWidth = scrollXWidth;
          if (scrollXWidth > maxXWidth) {
            // 触右
            xSpaceLeft =
              bodyScrollElem &&
              bodyTableElem &&
              bodyScrollElem.scrollLeft + clientWidth >= maxXWidth
                ? maxXWidth - bodyTableElem.clientWidth
                : (maxXWidth - clientWidth) *
                  (xSpaceLeft / (scrollXWidth - clientWidth));
            ySpaceWidth = maxXWidth;
            isScrollXBig = true;
          }
          if (!(scrollXLoad && overflowX)) {
            xSpaceLeft = 0;
          }

          if (headerTableElem) {
            headerTableElem.style.transform = headerTableElem.getAttribute(
              'xvm',
            )
              ? `translate(${xSpaceLeft}px, 0px)`
              : '';
          }
          if (bodyTableElem) {
            bodyTableElem.style.transform = `translate(${xSpaceLeft}px, ${reactData.scrollYTop || 0}px)`;
          }
          if (footerTableElem) {
            footerTableElem.style.transform = footerTableElem.getAttribute(
              'xvm',
            )
              ? `translate(${xSpaceLeft}px, 0px)`
              : '';
          }
          const containerList = ['main'];
          containerList.forEach((name) => {
            const layoutList = ['header', 'body', 'footer'];
            layoutList.forEach((layout) => {
              const xSpaceElem = getRefElem(
                elemStore[`${name}-${layout}-xSpace`],
              );
              if (xSpaceElem) {
                xSpaceElem.style.width = scrollXLoad ? `${ySpaceWidth}px` : '';
              }
            });
          });

          reactData.scrollXLeft = xSpaceLeft;
          reactData.scrollXWidth = ySpaceWidth;
          reactData.isScrollXBig = isScrollXBig;

          const scrollXSpaceEl = refScrollXSpaceElem.value;
          if (scrollXSpaceEl) {
            scrollXSpaceEl.style.width = `${ySpaceWidth}px`;
          }

          calcScrollbar();
          if (isScrollXBig && mouseOpts.area) {
            log.error('notProp', ['mouse-config.area']);
          }
          // TODO if ($xeGanttView && $xeGanttView.handleUpdateSXSpace) {
          //   $xeGanttView.handleUpdateSXSpace()
          // }
          return nextTick().then(() => {
            updateStyle();
          });
        }
      },
      // 更新纵向 Y 可视渲染上下剩余空间大小
      updateScrollYSpace() {
        const {
          isAllOverflow,
          overflowY,
          scrollYLoad,
          scrollYHeight,
          expandColumn,
        } = reactData;
        const {
          scrollYStore,
          elemStore,
          isResizeCellHeight,
          afterFullData,
          fullAllDataRowIdData,
          rowExpandedMaps,
        } = internalData;
        const { startIndex } = scrollYStore;
        const mouseOpts = computeMouseOpts.value;
        const expandOpts = computeExpandOpts.value;
        const cellOpts = computeCellOpts.value;
        const defaultRowHeight = computeDefaultRowHeight.value;
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const bodyTableElem = getRefElem(elemStore['main-body-table']);
        const leftBodyTableElem = getRefElem(elemStore['left-body-table']);
        const rightbodyTableElem = getRefElem(elemStore['right-body-table']);
        const containerList = ['main', 'left', 'right'];
        let ySpaceTop = 0;
        let sYHeight = scrollYHeight;
        let isScrollYBig = false;
        if (scrollYLoad) {
          const isCustomCellHeight = isResizeCellHeight || cellOpts.height;
          if (!isCustomCellHeight && !expandColumn && isAllOverflow) {
            sYHeight = afterFullData.length * defaultRowHeight;
            if (sYHeight > maxYHeight) {
              isScrollYBig = true;
            }
            ySpaceTop = Math.max(0, startIndex * defaultRowHeight);
          } else {
            const firstRow = afterFullData[startIndex];
            if (firstRow) {
              let rowid = getRowid($asTable, firstRow);
              let rowRest =
                fullAllDataRowIdData[rowid] ||
                ({} as AsTableDefines.RowCacheItem);
              ySpaceTop = rowRest.oTop || 0;

              const lastRow = afterFullData[afterFullData.length - 1];
              rowid = getRowid($asTable, lastRow);
              rowRest =
                fullAllDataRowIdData[rowid] ||
                ({} as AsTableDefines.RowCacheItem);
              if (rowRest) {
                const rHeight = getCellRestHeight(
                  rowRest,
                  cellOpts,
                  defaultRowHeight,
                );
                // 如果为空时还没计算完数据，保持原高度不变
                if (rHeight) {
                  sYHeight = (rowRest.oTop || 0) + rHeight;
                  // 是否展开行
                  if (expandColumn && rowExpandedMaps[rowid]) {
                    sYHeight += rowRest.expandHeight || expandOpts.height || 0;
                  }
                }
              }
              if (sYHeight > maxYHeight) {
                isScrollYBig = true;
              }
            } else {
              sYHeight = bodyTableElem ? bodyTableElem.clientHeight : 0;
            }
          }
        } else {
          if (bodyTableElem) {
            sYHeight = bodyTableElem.clientHeight;
          }
        }
        const clientHeight = bodyScrollElem ? bodyScrollElem.clientHeight : 0;
        // 虚拟渲染
        let ySpaceHeight = sYHeight;
        let scrollYTop = ySpaceTop;
        if (isScrollYBig) {
          // 触底
          scrollYTop =
            bodyScrollElem &&
            bodyTableElem &&
            bodyScrollElem.scrollTop + clientHeight >= maxYHeight
              ? maxYHeight - bodyTableElem.clientHeight
              : (maxYHeight - clientHeight) *
                (ySpaceTop / (scrollYHeight - clientHeight));
          ySpaceHeight = maxYHeight;
        }
        if (!(scrollYLoad && overflowY)) {
          scrollYTop = 0;
        }

        if (leftBodyTableElem) {
          leftBodyTableElem.style.transform = `translate(0px, ${scrollYTop}px)`;
        }
        if (bodyTableElem) {
          bodyTableElem.style.transform = `translate(${reactData.scrollXLeft || 0}px, ${scrollYTop}px)`;
        }
        if (rightbodyTableElem) {
          rightbodyTableElem.style.transform = `translate(0px, ${scrollYTop}px)`;
        }

        containerList.forEach((name) => {
          const layoutList = ['header', 'body', 'footer'];
          layoutList.forEach((layout) => {
            const ySpaceElem = getRefElem(
              elemStore[`${name}-${layout}-ySpace`],
            );
            if (ySpaceElem) {
              ySpaceElem.style.height = ySpaceHeight ? `${ySpaceHeight}px` : '';
            }
          });
        });

        const scrollYSpaceEl = refScrollYSpaceElem.value;
        if (scrollYSpaceEl) {
          scrollYSpaceEl.style.height = ySpaceHeight ? `${ySpaceHeight}px` : '';
        }
        const rowExpandYSpaceEl = refRowExpandYSpaceElem.value;
        if (rowExpandYSpaceEl) {
          rowExpandYSpaceEl.style.height = ySpaceHeight
            ? `${ySpaceHeight}px`
            : '';
        }
        reactData.scrollYTop = scrollYTop;
        reactData.scrollYHeight = isScrollYBig ? sYHeight : ySpaceHeight;
        reactData.isScrollYBig = isScrollYBig;

        calcScrollbar();
        if (isScrollYBig && mouseOpts.area) {
          log.error('notProp', ['mouse-config.area']);
        }
        // TODO if ($xeGanttView && $xeGanttView.handleUpdateSYSpace) {
        //   $xeGanttView.handleUpdateSYSpace();
        // }
        return nextTick().then(() => {
          return updateStyle();
        });
      },
      updateScrollXData() {
        const { isAllOverflow } = reactData;
        handleTableColumn();
        $asTable.updateScrollXSpace();
        return nextTick().then(() => {
          handleTableColumn();
          $asTable.updateScrollXSpace();
          if (!isAllOverflow) {
            $asTable.updateScrollYSpace();
          }
        });
      },
      updateScrollYData() {
        $asTable.handleTableData();
        $asTable.updateScrollYSpace();
        return nextTick().then(() => {
          $asTable.handleTableData();
          $asTable.updateScrollYSpace();
        });
      },

      /** 处理固定列的显示状态，修正左右滚动阴影 */
      checkScrolling() {
        const { elemStore } = internalData;
        const bodyScrollElem = getRefElem(elemStore['main-body-scroll']);
        const leftContainerElem = refLeftContainer.value;
        const rightContainerElem = refRightContainer.value;
        const xHandleEl = refScrollXHandleElem.value;
        const bodtTargetEl = xHandleEl || bodyScrollElem;
        if (bodtTargetEl) {
          if (leftContainerElem) {
            if (bodtTargetEl.scrollLeft > 0) {
              addClass(leftContainerElem, 'scrolling--middle');
            } else {
              removeClass(leftContainerElem, 'scrolling--middle');
            }
          }
          if (rightContainerElem) {
            if (
              bodtTargetEl.clientWidth <
              bodtTargetEl.scrollWidth - Math.ceil(bodtTargetEl.scrollLeft)
            ) {
              addClass(rightContainerElem, 'scrolling--middle');
            } else {
              removeClass(rightContainerElem, 'scrolling--middle');
            }
          }
        }
      },
      handleUpdateAggData() {
        return loadTableData(internalData.tableSynchData, false, true);
      },
      handlePushStack() {
        const keyboardOpts = computeKeyboardOpts.value;
        if (!keyboardOpts.isUndoRedo) {
          return;
        }
        const { stackHistoryStore } = internalData;
        const stackObj = getSnapshotStackData();
        stackHistoryStore.undoStacks.push(stackObj);
        stackHistoryStore.redoStacks = [];
        truncateStackHistory();
      },
      handleUndoStackEvent(evnt) {
        const { stackHistoryStore } = internalData;
        const { undoStacks, redoStacks } = stackHistoryStore;
        if (undoStacks.length > 0) {
          const stackObj = getSnapshotStackData();
          redoStacks.push(stackObj);
          handleUpdateSnapshotStackData(undoStacks.pop());
          if (evnt) {
            dispatchEvent('undo', {}, evnt);
          }
          return nextTick(() => {
            return { status: true };
          });
        }
        return Promise.resolve({ status: false });
      },
      handleRedoStackEvent(evnt) {
        const { stackHistoryStore } = internalData;
        const { undoStacks, redoStacks } = stackHistoryStore;
        if (redoStacks.length > 0) {
          const stackObj = getSnapshotStackData();
          undoStacks.push(stackObj);
          handleUpdateSnapshotStackData(redoStacks.pop());
          if (evnt) {
            dispatchEvent('redo', {}, evnt);
          }
          return nextTick(() => {
            return { status: true };
          });
        }
        return Promise.resolve({ status: false });
      },
      handleClearStack() {
        const { stackHistoryStore } = internalData;
        stackHistoryStore.undoStacks = [];
        stackHistoryStore.redoStacks = [];
        return nextTick();
      },
      updateZindex() {
        if (props.zIndex) {
          internalData.tZindex = props.zIndex;
        } else if (internalData.tZindex < getLastZIndex()) {
          internalData.tZindex = nextZIndex();
        }
      },
      handleCheckedCheckboxRow,

      /**
       * 行 hover 事件
       */
      triggerHoverEvent(evnt, { row }) {
        $asTable.setHoverRow(row);
      },

      setHoverRow(row) {
        // TODO const $xeGanttView = internalData.xeGanttView;
        $asTable.clearHoverRow();
        const rowid = getRowid($asTable, row);
        const el = refElem.value;
        if (el) {
          arrayEach(
            el.querySelectorAll(
              `.${prefixCls.value}-body--row[rowid="${CSS.escape(rowid)}"]`,
            ),
            (elem) => addClass(elem, 'row--hover'),
          );
        }
        internalData.hoverRow = row;
        // TODO if ($xeGanttView && $xeGanttView.handleUpdateHoverRow) {
        //   $xeGanttView.handleUpdateHoverRow(row);
        // }
      },

      clearHoverRow() {
        // TODO const $xeGanttView = internalData.xeGanttView;
        const el = refElem.value;
        if (el) {
          arrayEach(
            el.querySelectorAll(`.${prefixCls.value}-body--row.row--hover`),
            (elem) => removeClass(elem, 'row--hover'),
          );
        }
        internalData.hoverRow = null;
        // TODO if ($xeGanttView && $xeGanttView.handleUpdateHoverRow) {
        //   $xeGanttView.handleUpdateHoverRow()
        // }
      },
      findRowIndexOf(list, row) {
        return row
          ? findIndexOf(list, (item) => $asTable.eqRow(item, row))
          : -1;
      },

      eqRow(row1, row2) {
        if (row1 && row2) {
          if (row1 === row2) {
            return true;
          }
          return getRowid($asTable, row1) === getRowid($asTable, row2);
        }
        return false;
      },
    };

    Object.assign($asTable, tableMethods, tablePrivateMethods);

    /**
     * 渲染浮固定列
     * 分别渲染左边固定列和右边固定列
     * 如果宽度足够情况下，则不需要渲染固定列
     * @param fixedType 固定列类型
     */
    function renderViewFixed(fixedType: 'left' | 'right') {
      const { showHeader, showFooter } = props;
      const {
        tableData,
        tableColumn,
        tableGroupColumn,
        columnStore,
        footerTableData,
      } = reactData;
      const scrollbarOpts = computeScrollbarOpts.value;
      const scrollbarXOpts = computeScrollbarXOpts.value;
      const scrollbarYOpts = computeScrollbarYOpts.value;
      const { overscrollBehavior: overscrollXBehavior } = scrollbarXOpts;
      const { overscrollBehavior: overscrollYBehavior } = scrollbarYOpts;
      const isFixedLeft = fixedType === 'left';
      const fixedColumn = isFixedLeft
        ? columnStore.leftList
        : columnStore.rightList;
      const osXBehavior = eqNull(overscrollXBehavior)
        ? scrollbarOpts.overscrollBehavior
        : overscrollXBehavior;
      const osYBehavior = eqNull(overscrollYBehavior)
        ? scrollbarOpts.overscrollBehavior
        : overscrollYBehavior;

      return (
        <div
          class={[
            `${prefixCls.value}--fixed-${fixedType}-wrapper`,
            `sx--${scrollbarXOpts.visible}`,
            `sy--${scrollbarYOpts.visible}`,
            {
              [`x-ob--${osXBehavior}`]: osXBehavior,
              [`y-ob--${osYBehavior}`]: osYBehavior,
            },
          ]}
          ref={isFixedLeft ? refLeftContainer : refRightContainer}
        >
          {showHeader && (
            <TableHeaderComponent
              fixedColumn={fixedColumn}
              fixedType={fixedType}
              prefixCls={prefixCls.value}
              ref={isFixedLeft ? refTableLeftHeader : refTableRightHeader}
              size={mergedSize.value}
              tableColumn={tableColumn}
              tableData={tableData}
              tableGroupColumn={tableGroupColumn}
            ></TableHeaderComponent>
          )}
          <TableBodyComponent
            fixedColumn={fixedColumn}
            fixedType={fixedType}
            prefixCls={prefixCls.value}
            ref={isFixedLeft ? refTableLeftBody : refTableRightBody}
            size={mergedSize.value}
            tableColumn={tableColumn}
            tableData={tableData}
          ></TableBodyComponent>
          {showFooter && (
            <TableFooterComponent
              fixedColumn={fixedColumn}
              fixedType={fixedType}
              footerTableData={footerTableData}
              prefixCls={prefixCls.value}
              ref={isFixedLeft ? refTableLeftFooter : refTableRightFooter}
              size={mergedSize.value}
              tableColumn={tableColumn}
            ></TableFooterComponent>
          )}
        </div>
      );
    }

    const renderEmptyBody = () => {
      const emptyOpts = computeEmptyOpts.value;
      const emptySlot = slots.empty;
      const emptyParams = {
        $table: $asTable,
        // TODO $grid: $asGrid, gantt: $asGantt
      };
      if (emptySlot) {
        return emptySlot(emptyParams);
      } else {
        const rendererOpts = computeRendererOpts.value;
        const compConf = emptyOpts.name
          ? rendererOpts[emptyOpts.name] || renderer.get(emptyOpts.name)
          : null;
        const rtEmptyView = compConf
          ? compConf.renderTableEmpty || compConf.renderTableEmptyView
          : null;
        if (rtEmptyView) {
          return getSlotVNs(rtEmptyView(emptyOpts, emptyParams));
        }
      }
      return getFuncText(props.emptyText) || locale?.value.emptyText;
    };

    const renderDragTipContents = () => {
      const { dragRow, dragCol, dragTipText } = reactData;
      const columnDragOpts = computeColumnDragOpts.value;
      const rowDragOpts = computeRowDragOpts.value;
      const rowDragSlots = rowDragOpts.slots || {};
      const rTipSlot = rowDragSlots.tip;
      const columnDragSlots = columnDragOpts.slots || {};
      const cTipSlot = columnDragSlots.tip;
      const dRow =
        dragRow ||
        (rowDragOpts.isCrossTableDrag ? crossTableDragRowInfo.row : null);

      if (dRow && rTipSlot) {
        return callSlot(rTipSlot, { row: dRow });
      }
      if (dragCol && cTipSlot) {
        return callSlot(cTipSlot, { column: dragCol });
      }
      return [h('span', dragTipText)];
    };

    const renderDragTip = () => {
      const { dragRow, dragCol } = reactData;
      const rowOpts = computeRowOpts.value;
      const columnOpts = computeColumnOpts.value;
      const rowDragOpts = computeRowDragOpts.value;
      const columnDragOpts = computeColumnDragOpts.value;
      const dRow =
        dragRow ||
        (rowDragOpts.isCrossTableDrag ? crossTableDragRowInfo.row : null);

      if (rowOpts.drag || columnOpts.drag) {
        return (
          <div class={`${prefixCls.value}--drag-wrapper`}>
            <div
              class={[
                `${prefixCls.value}--drag-row-line`,
                { 'is--guides': rowDragOpts.showGuidesStatus },
              ]}
              ref={refDragRowLineElem}
            />
            <div
              class={[
                `${prefixCls.value}--drag-col-line`,
                { 'is--guides': columnDragOpts.showGuidesStatus },
              ]}
              ref={refDragColLineElem}
            />
            {(dRow && rowDragOpts.showDragTip) ||
            (dragCol && columnDragOpts.showDragTip) ? (
              <div
                class={`${prefixCls.value}--drag-sort-tip`}
                ref={refDragTipElem}
              >
                <div class={`${prefixCls.value}--drag-sort-tip-wrapper`}>
                  <div class={`${prefixCls.value}--drag-sort-tip-status`}>
                    <span
                      class={`${prefixCls.value}--drag-sort-tip-normal-status`}
                    >
                      {dRow ? <SwapOutlined rotate={90} /> : <SwapOutlined />}
                    </span>
                    <span
                      class={`${prefixCls.value}--drag-sort-tip-sub-status`}
                    >
                      <SubnodeOutlined />
                    </span>
                    <span
                      class={`${prefixCls.value}--drag-sort-tip-disabled-status`}
                    >
                      <StopOutlined />
                    </span>
                  </div>
                  <div class={`${prefixCls.value}--drag-sort-tip-content`}>
                    {renderDragTipContents()}
                  </div>
                </div>
              </div>
            ) : (
              createCommentVNode()
            )}
          </div>
        );
      }
      return createCommentVNode();
    };

    const renderRowExpandedVNs = () => {
      const { treeConfig } = props;
      const { expandColumn, isRowGroupStatus } = reactData;
      const tableRowExpandedList = computeTableRowExpandedList.value;
      const expandOpts = computeExpandOpts.value;
      const { mode } = expandOpts;
      if (mode !== 'fixed') {
        return createCommentVNode();
      }
      const expandVNs = [
        h('div', {
          key: 'repY',
          ref: refRowExpandYSpaceElem,
        }),
      ];

      if (expandColumn) {
        const { handleGetRowId } = createHandleGetRowId($asTable);
        tableRowExpandedList.forEach((row) => {
          const expandOpts = computeExpandOpts.value;
          const { height: expandHeight, padding, indent } = expandOpts;
          const { fullAllDataRowIdData, fullColumnIdData } = internalData;
          const treeOpts = computeTreeOpts.value;
          const { transform, seqMode } = treeOpts;
          const cellStyle: Record<string, string> = {};
          const rowid = handleGetRowId(row);
          const rowRest = fullAllDataRowIdData[rowid];
          const colid = expandColumn.id;
          const colRest =
            fullColumnIdData[colid] || ({} as AsTableDefines.ColumnCacheItem);
          let rowLevel = 0;
          let seq: number | string = -1;
          let _rowIndex = -1;
          let rowIndex = -1;
          let $rowIndex = -1;
          if (rowRest) {
            rowIndex = rowRest.index;
            $rowIndex = rowRest.$index;
            _rowIndex = rowRest._index;
            rowLevel = rowRest.level;
            seq = rowRest.seq;
            if (
              isRowGroupStatus ||
              (treeConfig && transform && seqMode === 'increasing')
            ) {
              seq = rowRest._index + 1;
            } else if (treeConfig && seqMode === 'fixed') {
              seq = rowRest._tIndex + 1;
            }
          }
          if (expandHeight) {
            cellStyle.height = `${expandHeight}px`;
          }
          if (isRowGroupStatus || treeConfig) {
            cellStyle.paddingLeft = `${rowLevel * (isNumber(indent) ? indent : treeOpts.indent) + 30}px`;
          }
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
            seq,
            column: expandColumn,
            columnIndex,
            $columnIndex,
            _columnIndex,
            fixed: '',
            source: 'table',
            type: 'body',
            level: rowLevel,
            rowid,
            row,
            rowIndex,
            $rowIndex,
            _rowIndex,
            isHidden: false,
            isEdit: false,
            prefixCls: prefixCls.value,
          };
          expandVNs.push(
            h(
              'div',
              {
                key: rowid,
                class: [
                  `${prefixCls.value}-body--row-expanded-cell`,
                  {
                    'is--padding': padding,
                    'is--ellipsis': expandHeight,
                  },
                ],
                rowid,
                style: cellStyle,
              },
              [
                h(
                  'div',
                  {
                    class: `${prefixCls.value}-body--row-expanded-content`,
                  },
                  expandColumn.renderData(expandParams),
                ),
              ],
            ),
          );
        });
      }
      return (
        <div
          class={`${prefixCls.value}--row-expanded-wrapper`}
          ref={refRowExpandElem}
        >
          {expandVNs}
        </div>
      );
    };

    const renderScrollX = () => {
      return (
        <div
          class={`${prefixCls.value}--scroll-x-virtual`}
          key="vsx"
          ref={refScrollXVirtualElem}
        >
          <div
            class={`${prefixCls.value}--scroll-x-left-corner`}
            ref={refScrollXLeftCornerElem}
          />

          <div
            class={`${prefixCls.value}--scroll-x-wrapper`}
            ref={refScrollXWrapperElem}
          >
            <div
              class={`${prefixCls.value}--scroll-x-handle`}
              onScroll={$asTable.triggerVirtualScrollXEvent}
              ref={refScrollXHandleElem}
            >
              <div
                class={`${prefixCls.value}--scroll-x-space`}
                ref={refScrollXSpaceElem}
              />
            </div>

            <div class={`${prefixCls.value}--scroll-x-handle-appearance`} />
          </div>

          <div
            class={`${prefixCls.value}--scroll-x-right-corner`}
            ref={refScrollXRightCornerElem}
          />
        </div>
      );
    };

    const renderScrollY = () => {
      return (
        <div
          class={`${prefixCls.value}--scroll-y-virtual`}
          ref={refScrollYVirtualElem}
        >
          <div
            class={`${prefixCls.value}--scroll-y-top-corner`}
            ref={refScrollYTopCornerElem}
          />

          <div
            class={`${prefixCls.value}--scroll-y-wrapper`}
            ref={refScrollYWrapperElem}
          >
            <div
              class={`${prefixCls.value}--scroll-y-handle`}
              onScroll={$asTable.triggerVirtualScrollYEvent}
              ref={refScrollYHandleElem}
            >
              <div
                class={`${prefixCls.value}--scroll-y-space`}
                ref={refScrollYSpaceElem}
              />
            </div>

            <div class={`${prefixCls.value}--scroll-y-handle-appearance`} />
          </div>

          <div
            class={`${prefixCls.value}--scroll-y-bottom-corner`}
            ref={refScrollYBottomCornerElem}
          />
        </div>
      );
    };

    function renderViewport() {
      const { showHeader, showFooter } = props;
      const scrollbarOpts = computeScrollbarOpts.value;
      const scrollbarXOpts = computeScrollbarXOpts.value;
      const scrollbarYOpts = computeScrollbarYOpts.value;
      const { overscrollBehavior: overscrollXBehavior } = scrollbarXOpts;
      const { overscrollBehavior: overscrollYBehavior } = scrollbarYOpts;

      const {
        overflowX,
        tableData,
        tableColumn,
        tableGroupColumn,
        footerTableData,
        columnStore,
      } = reactData;
      const { leftList, rightList } = columnStore;

      const osXBehavior = eqNull(overscrollXBehavior)
        ? scrollbarOpts.overscrollBehavior
        : overscrollXBehavior;
      const osYBehavior = eqNull(overscrollYBehavior)
        ? scrollbarOpts.overscrollBehavior
        : overscrollYBehavior;

      return (
        <div
          class={[
            `${prefixCls.value}--viewport-wrapper`,
            {
              [`x-ob--${osXBehavior}`]: osXBehavior,
              [`y-ob--${osYBehavior}`]: osYBehavior,
            },
          ]}
          ref={refTableViewportElem}
        >
          <div
            class={[
              `${prefixCls.value}--main-wrapper`,
              `sx--${scrollbarXOpts.visible}`,
              `sy--${scrollbarYOpts.visible}`,
            ]}
          >
            {showHeader && (
              <TableHeaderComponent
                prefixCls={prefixCls.value}
                ref={refTableHeader}
                size={mergedSize.value}
                tableColumn={tableColumn}
                tableData={tableData}
                tableGroupColumn={tableGroupColumn}
              ></TableHeaderComponent>
            )}
            <TableBodyComponent
              fixedType={''}
              prefixCls={prefixCls.value}
              ref={refTableBody}
              size={mergedSize.value}
              tableColumn={tableColumn}
              tableData={tableData}
            ></TableBodyComponent>
            {showFooter && (
              <TableFooterComponent
                footerTableData={footerTableData}
                prefixCls={prefixCls.value}
                ref={refTableFooter}
                tableColumn={tableColumn}
              ></TableFooterComponent>
            )}
          </div>
          <div class={`${prefixCls.value}--fixed-wrapper`}>
            {leftList &&
              leftList.length > 0 &&
              overflowX &&
              renderViewFixed('left')}
            {rightList &&
              rightList.length > 0 &&
              overflowX &&
              renderViewFixed('right')}
          </div>
          {renderRowExpandedVNs()}
        </div>
      );
    }

    function renderBody() {
      const scrollbarYToLeft = computeScrollbarYToLeft.value;

      return (
        <div class={`${prefixCls.value}--layout-wrapper`}>
          {scrollbarYToLeft
            ? [renderScrollY(), renderViewport()]
            : [renderViewport(), renderScrollY()]}
        </div>
      );
    }

    const renderVN = () => {
      const {
        loading,
        stripe,
        showHeader,
        treeConfig,
        mouseConfig,
        showFooter,
        editRules,
        height,
      } = props;
      const {
        isGroup,
        overflowX,
        overflowY,
        scrollXLoad,
        scrollYLoad,
        tableData,
        isRowGroupStatus,
        columnStore,
        tooltipStore,
        initStore,
        filterStore,
        customStore,
      } = reactData;
      const { teleportToWrapperElem } = internalData;
      const { leftList, rightList } = columnStore;
      const tipSlots = {
        header: slots.headerTooltip || slots['header-tooltip'],
        body: slots.tooltip,
        footer: slots.footerTooltip || slots['footer-tooltip'],
      };
      const currTooltipSlot =
        tooltipStore.visible && tooltipStore.type
          ? tipSlots[tooltipStore.type]
          : null;
      const rowDragOpts = computeRowDragOpts.value;
      const tableTipConfig = computeTableTipConfig.value;
      const validTipConfig = computeValidTipConfig.value;
      const validOpts = computeValidOpts.value;
      const loadingOpts = computeLoadingOpts.value;
      const checkboxOpts = computeCheckboxOpts.value;
      const treeOpts = computeTreeOpts.value;
      const rowOpts = computeRowOpts.value;
      const columnOpts = computeColumnOpts.value;
      const tableBorder = computeTableBorder.value;
      const mouseOpts = computeMouseOpts.value;
      const areaOpts = computeAreaOpts.value;
      const currLoading =
        reactData.isColLoading || reactData.isRowLoading || loading;
      const loadingSlot = slots.loading;
      const resizableOpts = computeResizableOpts.value;
      const isArea = mouseConfig && mouseOpts.area;
      const columnDragOpts = computeColumnDragOpts.value;
      const scrollbarXToTop = computeScrollbarXToTop.value;
      const scrollbarYToLeft = computeScrollbarYToLeft.value;
      const tableStyle = computeTableStyle.value;
      const { isCrossTableDrag } = rowDragOpts;

      const cls = clsx(
        prefixCls.value,
        hashId.value,
        cssVarCls.value,
        `${prefixCls.value}--render-default`,
        `tid_${xID}`,
        `border--${tableBorder}`,
        `sx-pos--${scrollbarXToTop ? 'top' : 'bottom'}`,
        `sy-pos--${scrollbarYToLeft ? 'left' : 'right'}`,
        {
          [`${prefixCls.value}-large`]: mergedSize.value === 'large',
          [`${prefixCls.value}-small`]: mergedSize.value === 'small',
          [`${prefixCls.value}-medium`]: mergedSize.value === 'medium',
        },
        {
          [`valid-msg--${validOpts.msgMode}`]: !!editRules,
          'cell--selected': mouseConfig && mouseOpts.selected,
          'cell--area': isArea,
          'header-cell--area': isArea && areaOpts.selectCellByHeader,
          'body-cell--area': isArea && areaOpts.selectCellByBody,
          'row--highlight': rowOpts.isHover,
          'column--highlight': columnOpts.isHover,
          'checkbox--range': checkboxOpts.range,
          'col--drag-cell':
            columnOpts.drag && columnDragOpts.trigger === 'cell',
          'is--header': showHeader,
          'not--header': !showHeader,
          'is--footer': showFooter,
          'not--footer': !showFooter,
          'is--group': isGroup,
          'is-row-group': isRowGroupStatus,
          'is--tree-line': treeConfig && treeOpts.showLine,
          'is--fixed-left': leftList.length,
          'is--fixed-right': rightList.length,
          'is--round': props.round,
          'is--stripe': !treeConfig && stripe,
          'is--loading': currLoading,
          'is--empty': !currLoading && tableData.length === 0,
          'is--scroll-y': overflowY,
          'not--scroll-y': !overflowY,
          'is--scroll-x': overflowX,
          'not--scroll-x': !overflowX,
          'is--virtual-x': scrollXLoad,
          'is--virtual-y': scrollYLoad,
        },
      );

      const tbOns: {
        onContextmenu: (...args: any[]) => void;
        onDragover?: (...args: any[]) => void;
        onKeydown: (...args: any[]) => void;
      } = {
        onKeydown: keydownEvent,
        onContextmenu: contextMenuEvent,
      };
      if (isCrossTableDrag && tableData.length === 0) {
        tbOns.onDragover = $asTable.handleCrossTableRowDragoverEmptyEvent;
      }

      return (
        <div
          class={cls}
          ref={refElem}
          spellcheck={false}
          style={tableStyle}
          {...tbOns}
        >
          {/* 隐藏列 */}
          <div class={`${prefixCls.value}-slots`}>{slots.default?.()}</div>
          <div class={`${prefixCls.value}-vars`} ref={refVarElem}>
            <div class={`${prefixCls.value}-var-large`}></div>
            <div class={`${prefixCls.value}-var-medium`}></div>
            <div class={`${prefixCls.value}-var-small`}></div>
          </div>
          <div class={`${prefixCls.value}--render-wrapper`} key="tw">
            {scrollbarXToTop
              ? [renderScrollX(), renderBody()]
              : [renderBody(), renderScrollX()]}
          </div>
          {/* 空数据 */}
          <div
            class={`${prefixCls.value}--empty-place-wrapper`}
            key="tn"
            ref={refEmptyPlaceholder}
            xid={xID}
          >
            <div class={`${prefixCls.value}--empty-placeholder`}>
              <div class={`${prefixCls.value}--empty-content`}>
                {renderEmptyBody()}
              </div>
            </div>
          </div>
          {/* 边框线 */}
          <div class={`${prefixCls.value}--border-line`} key="tl"></div>
          {/* 列宽线 */}
          {
            <div
              class={`${prefixCls.value}--resizable-col-bar`}
              key="tcl"
              ref={refColResizeBar}
            >
              {resizableOpts.showDragTip && (
                <div class={`${prefixCls.value}--resizable-number-tip`}></div>
              )}
            </div>
          }
          {/** TODO 行高线 disabled={!($xeGantt && teleportToWrapperElem)}*/}
          <div key="ttw">
            <Teleport
              disabled={!teleportToWrapperElem}
              to={teleportToWrapperElem}
            >
              <div ref={refTeleportWrapper}>
                {/* 行高线 */}
                <div
                  class={`${prefixCls.value}--resizable-row-bar`}
                  key="trl"
                  ref={refRowResizeBar}
                >
                  {resizableOpts.showDragTip ? (
                    <div class={`${prefixCls.value}--resizable-number-tip`} />
                  ) : null}
                </div>
                {/* 加载中 */}
                {loadingSlot ? (
                  <div
                    class={clsx(`${prefixCls.value}--loading-custom-wrapper`, {
                      'is--visible': !!currLoading,
                    })}
                    key="lg"
                  >
                    {callSlot(loadingSlot, {
                      $table: $asTable,
                      loading: currLoading,
                    })}
                  </div>
                ) : currLoading ? (
                  <div
                    class={clsx(`${prefixCls.value}--loading`, {
                      'is--visible': !!currLoading,
                    })}
                    key="lg"
                  >
                    <Spin
                      description={loadingOpts.text}
                      indicator={loadingOpts.icon}
                      spinning
                    />
                  </div>
                ) : (
                  createCommentVNode()
                )}
                {
                  /** 拖拽排序提示 */
                  renderDragTip()
                }
              </div>
            </Teleport>
          </div>
          <div key="tpw">
            <div ref={refPopupWrapperElem}>
              {/* 筛选 */}
              {initStore.filter && (
                <TableFilterPanelComponent
                  filterStore={filterStore}
                  key="tf"
                  ref={refTableFilter}
                ></TableFilterPanelComponent>
              )}
              {/* 右键菜单 */}
              {computeIsContentMenu.value && (
                <TableMenuPanelComponent
                  key="tm"
                  ref={refTableMenu}
                ></TableMenuPanelComponent>
              )}
              {/* 自定义列 */}
              {initStore.custom && (
                <TableCustomPanelComponent
                  customStore={customStore}
                  key="tc"
                  ref={refTableCustom}
                ></TableCustomPanelComponent>
              )}
            </div>
          </div>
          {/** 提示相关 */}
          <div>
            {/* 通用提示 */}
            <SharedTooltip
              enterable={false}
              isArrow={false}
              key="ctp"
              ref={refCommTooltip}
            />
            <SharedTooltip
              defaultPlacement={tableTipConfig.defaultPlacement}
              enterable={tableTipConfig.enterable}
              enterDelay={tableTipConfig.enterDelay}
              height={tableTipConfig.height}
              key="btp"
              leaveDelay={tableTipConfig.leaveDelay}
              maxHeight={tableTipConfig.maxHeight}
              maxWidth={tableTipConfig.maxWidth}
              minHeight={tableTipConfig.minHeight}
              minWidth={tableTipConfig.minWidth}
              placement={tableTipConfig.placement}
              popupClassName={tableTipConfig.popupClassName}
              ref={refTooltip}
              useHtml={
                isBoolean(tableTipConfig.useHtml)
                  ? tableTipConfig.useHtml
                  : undefined
              }
              v-slots={
                currTooltipSlot
                  ? {
                      content: () => {
                        const {
                          type,
                          row,
                          column,
                          content: tooltipContent,
                        } = tooltipStore;
                        if (currTooltipSlot) {
                          if (column && type === 'header') {
                            return (
                              <div key={type}>
                                {currTooltipSlot({
                                  column,
                                  tooltipContent,
                                  $table: $asTable,
                                  // TODO $grid: $xeGrid,
                                  // $gantt: $xeGantt,
                                })}
                              </div>
                            );
                          }
                          if (row && column && type === 'body') {
                            return (
                              <div key={type}>
                                {currTooltipSlot({
                                  row,
                                  column,
                                  tooltipContent,
                                  $table: $asTable,
                                  // TODO $grid: $xeGrid,
                                  // $gantt: $xeGantt,
                                })}
                              </div>
                            );
                          }
                          if (row && column && type === 'footer') {
                            return (
                              <div key={type}>
                                {currTooltipSlot({
                                  row,
                                  column,
                                  tooltipContent,
                                  $table: $asTable,
                                  // TODO $grid: $xeGrid,
                                  // $gantt: $xeGantt,
                                })}
                              </div>
                            );
                          }
                        }
                        return createCommentVNode();
                      },
                    }
                  : undefined
              }
              width={tableTipConfig.width}
            ></SharedTooltip>
            {/* 校验提示 */}
            {editRules &&
            validOpts.showErrorMessage &&
            (validOpts.message === 'default'
              ? !height
              : validOpts.message === 'tooltip') ? (
              <SharedTooltip
                class={`${prefixCls.value}--valid-error`}
                enterable={validTipConfig.enterable}
                enterDelay={validTipConfig.enterDelay}
                key="vtp"
                leaveDelay={validTipConfig.leaveDelay}
                ref={refValidTooltip}
              />
            ) : null}
          </div>
        </div>
      );
    };

    const dataFlag = ref(0);
    watch(
      () => (props.data ? props.data.length : -1),
      () => {
        dataFlag.value++;
      },
    );
    watch(
      () => props.data,
      () => {
        dataFlag.value++;
      },
    );

    watch(dataFlag, () => {
      const value = props.data || [];
      if (value && value.length >= 20_000) {
        log.warn('errLargeData', ['loadData(data), reloadData(data)']);
      }
      loadTableData(value, false, true).then(() => {
        const { initStatus } = internalData;
        const { scrollXLoad, scrollYLoad, expandColumn } = reactData;
        const expandOpts = computeExpandOpts.value;
        internalData.inited = true;
        internalData.initStatus = true;
        if (!initStatus) {
          handleLoadDefaults();
        }
        // const checkboxOpts = computeCheckboxOpts.value
        // const checkboxColumn = internalData.tableFullColumn.find(column => column.type === 'checkbox')
        // if (checkboxColumn && internalData.tableFullData.length > 300 && !checkboxOpts.checkField) {
        //   log.error('checkProp', ['checkbox-config.checkField'])
        // }
        if (
          (scrollXLoad || scrollYLoad) &&
          expandColumn &&
          expandOpts.mode !== 'fixed'
        ) {
          log.error('scrollErrProp', ['column.type=expand']);
        }
        return $asTable.recalculate();
      });
    });

    /**  两个 watcher 是为了覆盖"同长度但换了顺序/换了元素"和"长度变了"两种情况 */
    const staticColumnFlag = ref(0);
    watch(
      () => reactData.staticColumns.length,
      () => {
        staticColumnFlag.value++;
      },
    );
    watch(
      () => reactData.staticColumns,
      () => {
        staticColumnFlag.value++;
      },
    );
    watch(staticColumnFlag, () => {
      nextTick(() => handleInitColumn(clone(reactData.staticColumns)));
    });

    const tableColumnFlag = ref(0);
    watch(
      () => reactData.tableColumn.length,
      () => {
        tableColumnFlag.value++;
      },
    );
    watch(
      () => reactData.tableColumn,
      () => {
        tableColumnFlag.value++;
      },
    );
    watch(tableColumnFlag, () => {
      $asTable.analyColumnWidth();
    });

    watch(
      () => reactData.upDataFlag,
      () => {
        nextTick(() => {
          $asTable.updateData();
        });
      },
    );

    watch(
      () => reactData.reColumnFlag,
      () => {
        nextTick(() => {
          $asTable.refreshColumn();
        });
      },
    );

    const reLayoutFlag = ref(0);
    watch(mergedSize, () => {
      reLayoutFlag.value++;
    });
    watch(
      () => props.showHeader,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => props.showFooter,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => props.showHeaderOverflow,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => props.showOverflow,
      () => {
        updateColumnAllOverflow();
        reLayoutFlag.value++;
      },
    );
    watch(
      () => props.showFooterOverflow,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => reactData.overflowX,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => reactData.overflowY,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => props.height,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => props.maxHeight,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(computeScrollbarXToTop, () => {
      reLayoutFlag.value++;
    });
    watch(computeScrollbarYToLeft, () => {
      reLayoutFlag.value++;
    });
    const { locale: language } = useLocaleContext();
    watch(
      () => language.value?.locale,
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => {
        const scrollbarXOpts = computeScrollbarXOpts.value;
        return scrollbarXOpts.visible;
      },
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => {
        const scrollbarYOpts = computeScrollbarYOpts.value;
        return scrollbarYOpts.visible;
      },
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(
      () => {
        const cellOpts = computeCellOpts.value;
        return cellOpts.height;
      },
      () => {
        reLayoutFlag.value++;
      },
    );
    watch(reLayoutFlag, () => {
      $asTable.recalculate(true);
    });

    const footFlag = ref(0);
    watch(
      () => (props.footerData ? props.footerData.length : -1),
      () => {
        footFlag.value++;
      },
    );
    watch(
      () => props.footerData,
      () => {
        footFlag.value++;
      },
    );
    watch(footFlag, () => {
      internalData.footerFullDataRowData = {};
      $asTable.updateFooter();
    });

    watch(
      () => props.syncResize,
      (value) => {
        if (!value) {
          return;
        }
        handleUpdateResize();
        nextTick(() => {
          handleUpdateResize();
          setTimeout(() => handleUpdateResize(), 0);
        });
      },
    );

    const mergeCellFlag = ref(0);
    watch(
      () => (props.mergeCells ? props.mergeCells.length : -1),
      () => {
        mergeCellFlag.value++;
      },
    );
    watch(
      () => props.mergeCells,
      () => {
        mergeCellFlag.value++;
      },
    );
    watch(mergeCellFlag, () => {
      handleUpdateMergeBodyCells(props.mergeCells || []);
    });

    const mergeHeaderItemFlag = ref(0);
    watch(
      () => (props.mergeHeaderCells ? props.mergeHeaderCells.length : -1),
      () => {
        mergeHeaderItemFlag.value++;
      },
    );
    watch(
      () => props.mergeHeaderCells,
      () => {
        mergeHeaderItemFlag.value++;
      },
    );
    watch(mergeHeaderItemFlag, () => {
      handleUpdateMergeHeaderCells(props.mergeHeaderCells || []);
    });

    const mergeFooteCellFlag = ref(0);
    watch(
      () => (props.mergeFooterCells ? props.mergeFooterCells.length : -1),
      () => {
        mergeFooteCellFlag.value++;
      },
    );
    watch(
      () => props.mergeFooterCells,
      () => {
        mergeFooteCellFlag.value++;
      },
    );
    watch(mergeFooteCellFlag, () => {
      const mFooterCells = props.mergeFooterCells;
      handleUpdateMergeFooterCells(mFooterCells || []);
    });

    watch(computeRowGroupFields, (val) => {
      handleUpdateRowGroup(val);
    });

    watch(computeRowField, () => {
      const { inited, tableFullData } = internalData;
      // 行主键被改变，重载表格
      if (inited) {
        handleKeyField();
        reactData.tableData = [];
        nextTick(() => {
          $asTable.reloadData(tableFullData);
        });
      }
    });

    const kfFlag = ref(0);
    watch(
      () => reactData.updateColFlag,
      () => {
        kfFlag.value++;
      },
    );
    watch(computeKeepFields, () => {
      kfFlag.value++;
    });

    watch(kfFlag, () => {
      const keepFields = computeKeepFields.value;
      const kpfMaps: Record<string, number> = {};
      keepFields.forEach((field) => {
        kpfMaps[field] = 1;
      });
      internalData.keepUpdateFieldMaps = kpfMaps;
    });

    watch(computeAggregateMode, () => {
      if (reactData.isRowGroupStatus) {
        loadTableData(internalData.tableSynchData, false, true);
      }
    });

    // TODO const layoutReFlag = ref(0);
    // watch(combineTabsResizeFlag, () => {
    //   layoutReFlag.value++;
    // });
    // watch(combineModalResizeFlag, () => {
    //   layoutReFlag.value++;
    // });
    // watch(combineSplitterResizeFlag, () => {
    //   layoutReFlag.value++;
    // });
    // watch(layoutReFlag, () => {
    //   handleGlobalResizeEvent();
    // });

    handleKeyField();

    hooks.forEach((options) => {
      const { setupTable } = options;
      if (setupTable) {
        const hookRest = setupTable($asTable);
        if (hookRest && isObject(hookRest)) {
          Object.assign($asTable, hookRest);
        }
      }
    });

    $asTable.preventEvent(null, 'created', { $table: $asTable });

    let resizeObserver: ResizeObserver;

    onActivated(() => {
      $asTable.recalculate().then(() => $asTable.refreshScroll());
      $asTable.preventEvent(null, 'activated', { $table: $asTable });
    });

    onDeactivated(() => {
      const { filterStore } = reactData;
      if (filterStore.visible) {
        $asTable.clearFilter();
      }
      $asTable.closeTooltip();
      internalData.isActivated = false;
      $asTable.preventEvent(null, 'deactivated', { $table: $asTable });
    });

    onMounted(() => {
      const {
        editConfig,
        exportConfig,
        importConfig,
        treeConfig,
        minHeight,
        keepSource,
      } = props;
      const { scrollXStore, scrollYStore } = internalData;
      const columnOpts = computeColumnOpts.value;
      const columnDragOpts = computeColumnDragOpts.value;
      const aggregateOpts = computeAggregateOpts.value;
      const virtualYOpts = computeVirtualYOpts.value;
      const editOpts = computeEditOpts.value;
      const treeOpts = computeTreeOpts.value;
      const radioOpts = computeRadioOpts.value;
      const checkboxOpts = computeCheckboxOpts.value;
      const expandOpts = computeExpandOpts.value;
      const rowOpts = computeRowOpts.value;
      const customOpts = computeCustomOpts.value;
      const mouseOpts = computeMouseOpts.value;
      const exportOpts = computeExportOpts.value;
      const importOpts = computeImportOpts.value;
      const rowDragOpts = computeRowDragOpts.value;
      const areaOpts = computeAreaOpts.value;
      const sortOpts = computeSortOpts.value;
      const filterOpts = computeFilterOpts.value;
      const { groupFields } = aggregateOpts;

      // TODO if ($xeGantt) {
      //   const { refClassifyWrapperElem } = $xeGantt.getRefMaps()
      //   const classifyWrapperEl = refClassifyWrapperElem.value
      //   if (classifyWrapperEl) {
      //     internalData.teleportToWrapperElem = classifyWrapperEl
      //   }
      // }
      // if ($xeGGWrapper) {
      //   const { refPopupContainerElem } = $xeGGWrapper.getRefMaps()
      //   const popupContainerEl = refPopupContainerElem.value
      //   if (popupContainerEl) {
      //     internalData.popupToWrapperElem = popupContainerEl
      //   }
      // }

      if (columnOpts.drag || rowOpts.drag || customOpts.allowSort) {
        initTpImg();
      }

      if (
        !rowOpts.keyField &&
        (checkboxOpts.reserve ||
          checkboxOpts.checkRowKeys ||
          radioOpts.reserve ||
          radioOpts.checkRowKey ||
          expandOpts.expandRowKeys ||
          treeOpts.expandRowKeys)
      ) {
        log.warn('reqProp', ['row-config.keyField']);
      }
      if (
        editConfig &&
        !keepSource &&
        (editOpts.showStatus ||
          editOpts.showUpdateStatus ||
          editOpts.showInsertStatus)
      ) {
        log.warn('reqSupportProp', [
          'edit-config.showStatus | showUpdateStatus | showInsertStatus',
          'keep-source',
        ]);
      }
      if (treeConfig && !treeOpts.transform) {
        if (sortOpts.isDeep) {
          log.warn('reqSupportProp', [
            'transform=false',
            'sort-config.isDeep=false',
          ]);
        }
        if (filterOpts.isDeep) {
          log.warn('reqSupportProp', [
            'transform=false',
            'filter-config.isDeep=false',
          ]);
        }
      }
      if (props.showFooter && !(props.footerMethod || props.footerData)) {
        log.warn('reqProp', ['footer-data | footer-method']);
      }

      // 检查导入导出类型，如果自定义导入导出方法，则不校验类型
      if (
        importConfig &&
        importOpts.types &&
        !importOpts.importMethod &&
        !includeArrays(keys(importOpts._typeMaps), importOpts.types)
      ) {
        log.warn('errProp', [
          `export-config.types=${importOpts.types.join(',')}`,
          importOpts.types
            .filter((type) => includes(keys(importOpts._typeMaps), type))
            .join(',') || keys(importOpts._typeMaps).join(','),
        ]);
      }
      if (
        exportConfig &&
        exportOpts.types &&
        !exportOpts.exportMethod &&
        !includeArrays(keys(exportOpts._typeMaps), exportOpts.types)
      ) {
        log.warn('errProp', [
          `export-config.types=${exportOpts.types.join(',')}`,
          exportOpts.types
            .filter((type) => includes(keys(exportOpts._typeMaps), type))
            .join(',') || keys(exportOpts._typeMaps).join(','),
        ]);
      }
      if (
        !props.id &&
        (props.customConfig ? isEnableConf(customOpts) : customOpts.enabled) &&
        customOpts.storage
      ) {
        log.error('reqProp', ['id']);
      }
      if (props.treeConfig && checkboxOpts.range) {
        log.error('noTree', ['checkbox-config.range']);
      }
      if (!$asTable.triggerClAreaMnEvent) {
        if (props.areaConfig) {
          log.error('notProp', ['area-config']);
        }
        if (props.clipConfig) {
          log.error('notProp', ['clip-config']);
        }
        if (props.fnrConfig) {
          log.error('notProp', ['fnr-config']);
        }
        if (mouseOpts.area) {
          log.error('notProp', ['mouse-config.area']);
          return;
        }
        if (
          mouseOpts.area &&
          areaOpts.selectCellByHeader &&
          columnOpts.drag &&
          columnDragOpts.trigger === 'cell'
        ) {
          log.error('notSupportProp', [
            'area-config.selectCellByHeader & column-config.drag',
            'column-drag-config.trigger=cell',
            'column-drag-config.trigger=default | area-config.selectCellByHeader=false',
          ]);
        }
        if (mouseOpts.area && props.spanMethod) {
          log.error('notSupportProp', [
            'mouse-config.area',
            'span-method',
            'merge-cells',
          ]);
        }
      }
      if (!$asTable.handlePivotTableAggData) {
        if (customOpts.allowGroup) {
          log.error('notProp', ['custom-config.allowGroup']);
          return;
        }
        if (customOpts.allowValues) {
          log.error('notProp', ['custom-config.allowValues']);
          return;
        }
      }
      if (treeConfig && rowOpts.drag && !treeOpts.transform) {
        log.error('notSupportProp', [
          'row-config.drag',
          'tree-config.transform=false',
          'tree-config.transform=true',
        ]);
      }
      if (
        treeConfig &&
        rowDragOpts.isCrossTableDrag &&
        !rowDragOpts.isCrossDrag
      ) {
        log.error('reqSupportProp', [
          'tree-config & row-drag-config.isCrossTableDrag',
          'row-drag-config.isCrossDrag',
        ]);
      }
      if (mouseOpts.area && mouseOpts.selected) {
        log.error('errConflicts', [
          'mouse-config.area',
          'mouse-config.selected',
        ]);
      }
      if (mouseOpts.area && props.treeConfig && !treeOpts.transform) {
        log.error('notSupportProp', [
          'mouse-config.area',
          'tree-config.transform=false',
          'tree-config.transform=true',
        ]);
      }
      if (
        props.editConfig &&
        isEnableConf(editOpts) &&
        props.editRules &&
        (minHeight === 0 || minHeight === '0')
      ) {
        log.error('reqSupportProp', ['edit-config & edit-rules', 'min-height']);
      }

      if (treeConfig) {
        arrayEach(
          [
            'rowField',
            'parentField',
            'childrenField',
            'hasChildField',
            'mapChildrenField',
          ],
          (key) => {
            const val = treeOpts[key as 'rowField'];
            if (val && val.includes('.')) {
              log.error('errProp', [
                `${key}=${val}`,
                `${key}=${val.split('.', 1)[0]}`,
              ]);
            }
          },
        );
      }

      Object.assign(scrollYStore, {
        startIndex: 0,
        endIndex: 0,
        visibleSize: 0,
      });
      Object.assign(scrollXStore, {
        startIndex: 0,
        endIndex: 0,
        visibleSize: 0,
      });

      handleUpdateRowGroup(groupFields);

      initData();

      nextTick(() => {
        if (!props.autoResize) {
          return;
        }

        const el = refElem.value;
        const parentEl = $asTable.getParentElem();
        resizeObserver = globalResize.create(() => {
          if (props.autoResize) {
            handleResizeEvent();
          }
        });
        if (el) {
          resizeObserver.observe(el);
        }
        if (parentEl) {
          resizeObserver.observe(parentEl);
        }
      });

      if (virtualYOpts.mode !== 'scroll') {
        const tableViewportEl = refTableViewportElem.value;
        if (tableViewportEl) {
          tableViewportEl.addEventListener(
            'wheel',
            $asTable.triggerBodyWheelEvent,
            { passive: false },
          );
        }
      }

      globalEvents.on($asTable, 'paste', handleGlobalPasteEvent);
      globalEvents.on($asTable, 'copy', handleGlobalCopyEvent);
      globalEvents.on($asTable, 'cut', handleGlobalCutEvent);
      globalEvents.on($asTable, 'mousedown', handleGlobalMousedownEvent);
      globalEvents.on($asTable, 'blur', handleGlobalBlurEvent);
      globalEvents.on($asTable, 'mousewheel', handleGlobalMousewheelEvent);
      globalEvents.on($asTable, 'keydown', handleGlobalKeydownEvent);
      globalEvents.on($asTable, 'resize', handleGlobalResizeEvent);
      globalEvents.on($asTable, 'scroll', handleGlobalScrollEvent);
      globalEvents.on(
        $asTable,
        'contextmenu',
        $asTable.handleGlobalContextmenuEvent,
      );
      $asTable.preventEvent(null, 'mounted', { $table: $asTable });
    });

    onBeforeUnmount(() => {
      const { _sToTime } = internalData;
      if (_sToTime) {
        clearTimeout(_sToTime);
      }

      const tableViewportEl = refTableViewportElem.value;
      if (tableViewportEl) {
        tableViewportEl.removeEventListener(
          'wheel',
          $asTable.triggerBodyWheelEvent,
        );
      }

      internalData.cvCacheMaps = {};
      internalData.prevDragRow = null;
      internalData.prevDragCol = null;

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      $asTable.closeTooltip();
      $asTable.closeFilter();
      if ($asTable.closeMenu) {
        $asTable.closeMenu();
      }

      globalEvents.off($asTable, 'paste');
      globalEvents.off($asTable, 'copy');
      globalEvents.off($asTable, 'cut');
      globalEvents.off($asTable, 'mousedown');
      globalEvents.off($asTable, 'blur');
      globalEvents.off($asTable, 'mousewheel');
      globalEvents.off($asTable, 'keydown');
      globalEvents.off($asTable, 'resize');
      globalEvents.off($asTable, 'scroll');
      globalEvents.off($asTable, 'contextmenu');

      $asTable.preventEvent(null, 'beforeUnmount', { $table: $asTable });
      assign(reactData, createReactData());
      assign(internalData, createInternalData());
    });

    onUnmounted(() => {
      $asTable.preventEvent(null, 'unmounted', { $table: $asTable });
    });

    provide('$asColgroup', null);
    provide('$asTable', $asTable);

    return renderVN;
  },
  {
    name: 'AsTable',
  },
);

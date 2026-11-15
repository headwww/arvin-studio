/* eslint-disable unicorn/no-undeclared-class-members */
import type { ComputedRef } from 'vue';

import type { AsColumnProps } from './types/column';
import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePrivateMethods,
} from './types/table';

import AsKit, {
  isArray,
  isBoolean,
  isFunction,
  isObject,
  isString,
  toInteger,
  uniqueId,
} from '@arvin-studio/kit';

import { ArvinStudio } from '..';
import { isPx } from '../_util/dom';
import useLog from '../_util/logger';
import { isEnableConf, toFilters } from './util';

const { renderer, formats } = ArvinStudio;

/**
 * columnInfo.ts 定义的是表格的列运行时模型 ColumnInfo：把用户写的声明式列配置（<column> 的 props、或 columns 数组里的 ColumnOptions）转换成表格内部可以计算、缓存、渲染、动态增删改的列实例。
 * 它是"用户配置"和"表格渲染"之间的那层适配器——整个表格所有关于列的能力（列宽算法、固定列、排序、筛选、分组表头、自定义列、编辑、导出）都读写这个对象。
 */
export class ColumnInfo {
  [key: string]: any;

  constructor(
    $asTable: AsTableConstructor & AsTablePrivateMethods,
    colConfs: AsColumnProps & {
      renderCell?: any;
      renderFooter?: any;
      renderHeader?: any;
      slots?: any;
    },
    { renderHeader, renderCell, renderFooter, renderData }: any = {},
    locale?: ComputedRef<any>,
  ) {
    const log = useLog('Table');
    const tableProps = $asTable.props;
    const $asGrid = $asTable.asGrid;
    const $asGantt = $asTable.asGantt;
    const $asGGWrapper = $asGrid || $asGantt;

    const {
      type,
      field,
      width,
      visible,
      fixed,
      align,
      headerAlign,
      footerAlign,
      aggFunc,
      formatter,
      filterMultiple,
      cellRender,
      editRender,
      filterRender,
    } = colConfs;

    const colId = colConfs.colId || uniqueId('col_');
    const defaultVisible = isBoolean(visible) ? visible : true;
    const defaultRenderWidth =
      width && isPx(width) && width !== 'auto'
        ? Math.max(0, toInteger(width))
        : 0;

    const flCompConf =
      filterRender && isEnableConf(filterRender)
        ? renderer.get(filterRender.name)
        : null;
    const ctFilterOptions = flCompConf
      ? flCompConf.createTableFilterOptions
      : null;
    const filters = toFilters(colConfs.filters, colId);

    const types = ['seq', 'checkbox', 'radio', 'expand', 'html'];

    if (type && !types.includes(type)) {
      log.warn('errProp', [`type=${type}`, types.join(', ')]);
    }
    if (isBoolean(cellRender) || (cellRender && !isObject(cellRender))) {
      log.warn('errProp', [
        `column.cell-render=${cellRender}`,
        'column.cell-render={}',
      ]);
    }
    if (isBoolean(editRender) || (editRender && !isObject(editRender))) {
      log.warn('errProp', [
        `column.edit-render=${editRender}`,
        'column.edit-render={}',
      ]);
    }
    if (type === 'expand') {
      const { treeConfig } = tableProps;
      const { computeTreeOpts } = $asTable.getComputeMaps();
      const treeOpts = computeTreeOpts.value;
      if (treeConfig && treeOpts.showLine) {
        log.error('errConflicts', [
          'tree-config.showLine',
          'column.type=expand',
        ]);
      }
    }
    if (formatter) {
      if (isString(formatter)) {
        const gFormatOpts = formats.get(formatter) || AsKit[formatter];
        if (!gFormatOpts || !isFunction(gFormatOpts.tableCellFormatMethod)) {
          log.error('notFormats', [formatter]);
        }
      } else if (isArray(formatter)) {
        const gFormatOpts = formats.get(formatter[0]) || AsKit[formatter[0]];
        if (!gFormatOpts || !isFunction(gFormatOpts.tableCellFormatMethod)) {
          log.error('notFormats', [formatter[0]]);
        }
      }
    }

    if (aggFunc && !$asTable.handlePivotTableAggData && aggFunc !== true) {
      log.error('errProp', [
        `column.agg-func=${aggFunc}`,
        'column.agg-func=true',
      ]);
    }

    if (field && editRender) {
      if (editRender.startField && `${editRender.startField}`.includes(field)) {
        log.error('modelConflicts', [
          `field=${field}`,
          `edit-render.startField=${editRender.startField}`,
        ]);
      }
      if (editRender.endField && `${editRender.endField}`.includes(field)) {
        log.error('modelConflicts', [
          `field=${field}`,
          `edit-render.endField=${editRender.endField}`,
        ]);
      }
    }

    Object.assign(this, {
      locale,
      // 基本属性
      type: colConfs.type,
      property: colConfs.field,
      field,
      title: colConfs.title,
      width: colConfs.width,
      minWidth: colConfs.minWidth,
      maxWidth: colConfs.maxWidth,
      resizable: colConfs.resizable,
      fixed,
      align,
      headerAlign,
      footerAlign,
      showOverflow: colConfs.showOverflow,
      showHeaderOverflow: colConfs.showHeaderOverflow,
      showFooterOverflow: colConfs.showFooterOverflow,
      className: colConfs.className,
      headerClassName: colConfs.headerClassName,
      footerClassName: colConfs.footerClassName,
      formatter,
      headerFormatter: colConfs.headerFormatter,
      footerFormatter: colConfs.footerFormatter,
      padding: colConfs.padding,
      verticalAlign: colConfs.verticalAlign,
      sortable: colConfs.sortable,
      sortBy: colConfs.sortBy,
      sortType: colConfs.sortType,
      filters,
      filterMultiple: isBoolean(filterMultiple) ? filterMultiple : true,
      filterMethod: colConfs.filterMethod,
      filterResetMethod: colConfs.filterResetMethod,
      filterRecoverMethod: colConfs.filterRecoverMethod,
      filterRender,
      floatingFilters: colConfs.floatingFilters,
      rules: colConfs.rules,
      rowGroupNode: colConfs.rowGroupNode,
      treeNode: colConfs.treeNode,
      dragSort: colConfs.dragSort,
      rowResize: colConfs.rowResize,
      cellType: colConfs.cellType,
      cellRender,
      editRender,
      contentRender: colConfs.contentRender,
      headerExportMethod: colConfs.headerExportMethod,
      exportMethod: colConfs.exportMethod,
      footerExportMethod: colConfs.footerExportMethod,
      titlePrefix: colConfs.titlePrefix,
      titleSuffix: colConfs.titleSuffix,

      aggFunc,
      copyMethod: colConfs.copyMethod,
      cutMethod: colConfs.cutMethod,
      pasteMethod: colConfs.pasteMethod,

      // 自定义参数
      params: colConfs.params,
      // 渲染属性
      id: colId,
      parentId: null,
      visible: defaultVisible,
      // 内部属性（一旦被使用，将导致不可升级版本）
      defaultParentId: null,
      halfVisible: false,
      defaultVisible,
      defaultFixed: fixed,
      defaultAlign: align,
      defaultHeaderAlign: headerAlign,
      defaultFooterAlign: footerAlign,

      defaultAggFunc: aggFunc,

      checked: false,
      halfChecked: false,
      disabled: false,
      // 分组层级
      level: 1,
      // 跨行
      rowSpan: 1,
      // 跨列
      colSpan: 1,

      // 数据排序
      order: null, // 用于记录排序类型，升序和倒序
      sortTime: 0, // 用于多列的先后顺序

      // 列排序
      sortNumber: 0, // 用于记录自定义列顺序
      renderSortNumber: 0, // 用于记录自定义列顺序

      renderAggFn: '',
      renderAggDigits: null,
      renderAggFormat: null,

      renderAlign: '',
      renderHeaderAlign: '',
      renderFooterAlign: '',
      renderFixed: '',
      renderVisible: false,

      renderWidth: defaultRenderWidth,
      renderHeight: 0,
      renderResizeWidth: 0,
      renderAutoWidth: 0,
      resizeWidth: 0, // 手动调整

      renderLeft: 0,
      renderArgs: [], // 渲染参数可用于扩展
      model: {},
      renderHeader: renderHeader || colConfs.renderHeader,
      renderCell: renderCell || colConfs.renderCell,
      renderFooter: renderFooter || colConfs.renderFooter,
      renderData,
      // 单元格插槽，只对 grid 有效
      slots: colConfs.slots,
    });

    if (ctFilterOptions && (!filters || filters.length === 0)) {
      (this as any).filters = toFilters(
        ctFilterOptions({
          $table: $asTable,
          column: this as unknown as AsTableDefines.ColumnInfo,
        }),
        colId,
      );
    }
    if ($asGGWrapper) {
      const { computeProxyOpts } = $asGGWrapper.getComputeMaps();
      const proxyOpts = computeProxyOpts.value;
      if (proxyOpts.beforeColumn) {
        proxyOpts.beforeColumn({
          $table: $asTable,
          $grid: $asGrid,
          $gantt: $asGantt,
          column: this as unknown as AsTableDefines.ColumnInfo,
        });
      }
    }
  }

  getKey() {
    const { type, field } = this;
    return field || (type ? `type=${type}` : null);
  }

  getTitle() {
    return this.title || (this.type === 'seq' ? this.locale.seqTitle : '');
  }

  update(name: string, value: any) {
    if (name !== 'filters') {
      this[name] = value;
    }
  }
}

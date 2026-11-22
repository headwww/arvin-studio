import type { AsTableDefines } from '../../types/table';
import type { TableFilterMethods, TableFilterPrivateMethods } from './filter';

import { nextTick } from 'vue';

import { ArvinStudio } from '../../..';
import { getRefElem, isEnableConf } from '../../util';

const { hooks, renderer } = ArvinStudio;

hooks.add('tableFilterModule', {
  setupTable($asTable) {
    const { props, reactData, internalData, prefixCls } = $asTable;
    const { refTableFilter } = $asTable.getRefMaps();
    const { computeFilterOpts, computeMouseOpts, computeRendererOpts } =
      $asTable.getComputeMaps();

    const updatePopupStyle = () => {
      const { filterStore } = reactData;
      const { elemStore } = internalData;
      const { column, targetEl } = filterStore;
      if (!column) {
        return nextTick();
      }
      const filterOpts = computeFilterOpts.value;
      const rendererOpts = computeRendererOpts.value;
      const { maxHeight: customMaxHeight, zIndex } = filterOpts;
      const filterRender = column ? column.filterRender : null;
      const compConf =
        filterRender && isEnableConf(filterRender) && filterRender.name
          ? rendererOpts[filterRender.name] || renderer.get(filterRender.name)
          : null;

      const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
      if (!headerScrollElem) {
        return nextTick();
      }
      const handleStyle = () => {
        let currEl = targetEl;
        if (!targetEl) {
          const headerWrapperElem = getRefElem(
            elemStore[`${column.fixed || 'main'}-header-wrapper`] ||
              elemStore['main-header-wrapper'],
          );
          const colEl = headerWrapperElem
            ? headerWrapperElem.querySelector<HTMLDivElement>(
                `.${prefixCls.value}-header--column.${column.id}`,
              )
            : null;
          if (colEl) {
            currEl = colEl;
          }
        }
        if (!currEl) {
          return nextTick();
        }
        const parentWrapperEl = document.documentElement;
        const targetRect = currEl.getBoundingClientRect();
        const parentWrapperRect = parentWrapperEl.getBoundingClientRect();
        const targetLeft = targetRect.left;
        const targetTop = targetRect.top;
        const offsetLeft = parentWrapperRect.left;
        const offsetTop = parentWrapperRect.top;
        const targetHeight = currEl.offsetHeight;
        const targetWidth = currEl.offsetWidth;

        const panelStyle: Record<string, number | string> = {
          left: targetLeft - offsetLeft,
          top: targetTop - offsetTop,
          height: targetHeight,
          width: targetWidth,
        };
        if (zIndex) {
          panelStyle.zIndex = zIndex;
        }
        let maxHeight = 0;
        filterStore.style = panelStyle;
        // 筛选面板是自适应表格高度
        if (compConf ? !compConf.tableFilterAutoHeight : false) {
          maxHeight = 0;
        } else {
          if (customMaxHeight) {
            maxHeight = Math.min(customMaxHeight, maxHeight);
          }
        }
        // 判断面板不能大于表格高度
        filterStore.maxHeight = maxHeight;
      };

      handleStyle();
      return nextTick().then(() => {
        handleStyle();
      });
    };

    const filterPrivateMethods: TableFilterPrivateMethods = {
      checkFilterOptions() {
        const { filterStore } = reactData;
        const { column } = filterStore;
        if (column) {
          const filterOptions = (column.filters ||
            []) as AsTableDefines.FilterOption[];
          filterStore.isAllSelected = filterOptions.every(
            (item) => item._checked,
          );
          filterStore.isIndeterminate =
            !filterStore.isAllSelected &&
            filterOptions.some((item) => item._checked);
        }
      },
      handleOpenFilterColumn(
        evnt: MouseEvent,
        btnEl: HTMLDivElement | null,
        colEl: HTMLDivElement,
        column: AsTableDefines.ColumnInfo,
        params: any,
      ) {
        const { initStore, filterStore } = reactData;
        if (filterStore.column === column && filterStore.visible) {
          filterStore.visible = false;
        } else {
          $asTable.handleFilterOptions(column);
          internalData._currFilterParams = params;
          filterStore.targetEl = btnEl;
          filterStore.style = null;
          filterStore.visible = true;
          initStore.filter = true;
        }
        nextTick().then(() => {
          updatePopupStyle();
        });
        $asTable.dispatchEvent(
          'filter-visible',
          {
            column,
            field: column.field,
            property: column.field,
            filterList: $asTable.getCheckedFilters(),
            visible: filterStore.visible,
          },
          evnt,
        );
      },
      /**
       * 点击筛选事件
       * 当筛选图标被点击时触发
       * 更新选项是否全部状态
       * 打开筛选面板
       * @param {Event} evnt 事件
       * @param {ColumnInfo} column 列配置
       * @param {Object} params 参数
       */
      triggerFilterEvent(
        evnt: MouseEvent,
        column: AsTableDefines.ColumnInfo,
        params,
      ) {
        const { elemStore } = internalData;
        const { fixed } = column;
        const headerWrapperElem = getRefElem(
          elemStore[`${fixed || 'main'}-header-wrapper`] ||
            elemStore['main-header-wrapper'],
        );
        const btnElem = evnt.currentTarget as HTMLDivElement;
        const colEl = headerWrapperElem
          ? headerWrapperElem.querySelector<HTMLElement>(
              `.${prefixCls.value}-header--column.${column.id}`,
            )
          : null;
        $asTable.handleOpenFilterColumn(
          evnt,
          btnElem,
          colEl || btnElem,
          column,
          params,
        );
      },
    };
    const filterMethods: TableFilterMethods = {
      getCheckedFilters() {
        const { tableFullColumn } = internalData;
        const filterList: AsTableDefines.FilterCheckedParams[] = [];
        tableFullColumn.forEach((column) => {
          const { field, filters } = column;
          const filterOptions = filters || [];
          const valueList: any[] = [];
          const dataList: any[] = [];
          if (filterOptions) {
            filterOptions.forEach((item) => {
              if (!item.checked) {
                return;
              }

              valueList.push(item.value);
              dataList.push(item.data);
            });
            if (valueList.length > 0) {
              filterList.push({
                column,
                field,
                values: valueList,
                datas: dataList,
              });
            }
          }
        });
        return filterList;
      },
    };
    return { ...filterMethods, ...filterPrivateMethods };
  },
});

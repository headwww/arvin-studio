import type { AsTableDefines } from '../../types/table';
import type { TableFilterMethods, TableFilterPrivateMethods } from './filter';

import { nextTick } from 'vue';

import { ArvinStudio } from '../../..';
import { getRefElem, isEnableConf } from '../../util';

const { hooks, renderer } = ArvinStudio;

hooks.add('tableFilterModule', {
  setupTable($asTable) {
    const { props, reactData, internalData, prefixCls } = $asTable;
    const { refElem, refTableFilter } = $asTable.getRefMaps();
    const { computeFilterOpts, computeMouseOpts, computeRendererOpts } =
      $asTable.getComputeMaps();

    const updatePopupStyle = () => {
      const { filterStore } = reactData;
      const { elemStore } = internalData;
      const { column, targetEl } = filterStore;
      if (!column) {
        return nextTick();
      }
      const tableEl = refElem.value;
      const filterOpts = computeFilterOpts.value;
      const rendererOpts = computeRendererOpts.value;
      const { maxHeight: customMaxHeight, transfer, zIndex } = filterOpts;
      const filterRender = column ? column.filterRender : null;
      const compConf =
        filterRender && isEnableConf(filterRender) && filterRender.name
          ? rendererOpts[filterRender.name] || renderer.get(filterRender.name)
          : null;

      const headerScrollElem = getRefElem(elemStore['main-header-scroll']);
      if (!headerScrollElem) {
        return nextTick();
      }
      const tableFilter = refTableFilter.value;
      const filterWrapperElem = tableFilter
        ? (tableFilter.getRefMaps().refElem.value as HTMLDivElement)
        : null;
      if (!filterWrapperElem) {
        return nextTick();
      }
      const filterHeadElem = filterWrapperElem.querySelector<HTMLDivElement>(
        '.vxe-table--filter-header',
      );
      const filterFootElem = filterWrapperElem.querySelector<HTMLDivElement>(
        '.vxe-table--filter-footer',
      );

      /**
       * 是否显示筛选按钮图标
       * 如果不存在图标，则相对单元格居中显示
       */
      const handleStyle = () => {
        let currEl = targetEl;
        if (!targetEl) {
          const headerWrapperElem = getRefElem(
            elemStore[`${column.fixed || 'main'}-header-wrapper`] ||
              elemStore['main-header-wrapper'],
          );
          const colEl = headerWrapperElem
            ? headerWrapperElem.querySelector<HTMLDivElement>(
                `.vxe-header--column.${column.id}`,
              )
            : null;
          if (colEl) {
            currEl = colEl;
          }
        }
        if (!currEl) {
          return nextTick();
        }

        const btnRect = currEl.getBoundingClientRect();
        const tableRect = tableEl.getBoundingClientRect();
        let left = 0;
        let top = 0;
        let maxHeight = 0;
        let panelStyle: Record<string, number | string> = {};
        if (transfer) {
          const ppObj = updatePanelPlacement(currEl, filterWrapperElem, {
            defaultPlacement: 'bottom',
            isMinWidth: false,
            teleportTo: transfer,
          });
          panelStyle = ppObj.style;
        } else {
          const filterWidth = filterWrapperElem.offsetWidth;
          // eslint-disable-next-line unicorn/prefer-minimal-ternary
          const centerWidth = targetEl
            ? filterWidth / 2
            : (filterWidth - column.renderWidth) / 2;
          left = btnRect.left - tableRect.left - centerWidth;
          top = btnRect.top - tableRect.top + currEl.clientHeight;
          maxHeight = Math.max(
            40,
            tableEl.clientHeight -
              top -
              (filterHeadElem ? filterHeadElem.clientHeight : 0) -
              (filterFootElem ? filterFootElem.clientHeight : 0) -
              14,
          );
          if (left < 1) {
            left = 1;
          } else if (left > tableEl.clientWidth - filterWidth - 1) {
            left = tableEl.clientWidth - filterWidth - 1;
          }
          if ($xeGGWrapper) {
            const wrapperEl = $xeGGWrapper.getRefMaps().refElem.value;
            if (wrapperEl) {
              const wrapperRect = wrapperEl.getBoundingClientRect();
              top += tableRect.top - wrapperRect.top;
            }
          }
          panelStyle = {
            top: toCssUnit(top),
            left: toCssUnit(left),
          };
        }
        if (zIndex) {
          panelStyle.zIndex = zIndex;
        }
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
    const filterMethods: TableFilterMethods = {};
    return { ...filterMethods, ...filterPrivateMethods };
  },
});

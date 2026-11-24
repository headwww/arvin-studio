import type { AsColumnPropTypes } from '../../types/column';
import type { AsTableDefines } from '../../types/table';
import type { TableFilterMethods, TableFilterPrivateMethods } from './filter';

import { nextTick } from 'vue';

import { clone } from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import { triggerEvent } from '../../../_util/dom';
import {
  getRefElem,
  handleFieldOrColumn,
  isEnableConf,
  toFilters,
} from '../../util';

const { hooks, renderer } = ArvinStudio;

hooks.add('tableFilterModule', {
  setupTable($asTable) {
    const { reactData, internalData, prefixCls } = $asTable;
    const { computeFilterOpts, computeRendererOpts } =
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
      confirmFilterEvent(evnt, column) {
        if (column) {
          $asTable.handleColumnConfirmFilter(column, evnt);
        }
      },
      handleClearFilter(column) {
        if (!column) {
          return;
        }

        const filterResetMethod = (
          column as AsTableDefines.ColumnInfo & {
            filterResetMethod?: AsColumnPropTypes.FilterResetMethod;
          }
        ).filterResetMethod;
        const { filters } = column;
        if (filters) {
          const filterOptions = filters as AsTableDefines.FilterOption[];
          filterOptions.forEach((item) => {
            item._checked = false;
            item.checked = false;
            if (!filterResetMethod) {
              item.data = clone(item.resetValue, true);
            }
          });
          if (filterResetMethod) {
            filterResetMethod({
              options: filterOptions,
              column,
              $table: $asTable,
            });
          }
        }
      },
      handleColumnConfirmFilter(column, evnt) {
        const { scrollXLoad: oldScrollXLoad, scrollYLoad: oldScrollYLoad } =
          reactData;
        const filterOpts = computeFilterOpts.value;
        const { field, filters } = column;
        const filterOptions = filters || [];
        const values: any[] = [];
        const datas: any[] = [];
        filterOptions.forEach((item) => {
          if (!item.checked) {
            return;
          }

          values.push(item.value);
          datas.push(item.data);
        });
        const filterList = $asTable.getCheckedFilters();
        const params = {
          $table: $asTable,
          $event: evnt as Event,
          column,
          field,
          property: field,
          values,
          datas,
          filters: filterList,
          filterList,
        };
        // 如果是服务端筛选，则跳过本地筛选处理
        if (!filterOpts.remote) {
          $asTable.handleTableData(true);
          $asTable.checkSelectionStatus();
        }
        if (evnt) {
          $asTable.dispatchEvent('filterChange', params, evnt);
        }
        $asTable.closeFilter();
        return $asTable
          .updateFooter()
          .then(() => {
            const { scrollXLoad, scrollYLoad } = reactData;
            if (
              oldScrollXLoad ||
              scrollXLoad ||
              oldScrollYLoad ||
              scrollYLoad
            ) {
              if (oldScrollXLoad || scrollXLoad) {
                $asTable.updateScrollXSpace();
              }
              if (oldScrollYLoad || scrollYLoad) {
                $asTable.updateScrollYSpace();
              }
              return $asTable.refreshScroll();
            }
          })
          .then(() => {
            $asTable.updateCellAreas();
            return $asTable.recalculate(true);
          })
          .then(() => {
            // 存在滚动行为未结束情况
            setTimeout(() => {
              $asTable.recalculate();
            }, 50);
          });
      },
      handleFilterChangeMultipleOption(_evnt, checked, item) {
        item._checked = checked;
        $asTable.checkFilterOptions();
      },
      handleFilterChangeOption(evnt, checked, item) {
        const { filterStore } = reactData;
        const { fullColumnIdData } = internalData;
        const column =
          filterStore.column ||
          (item._colId ? fullColumnIdData[item._colId]?.column : null);
        if (column) {
          if (column.filterMultiple) {
            $asTable.handleFilterChangeMultipleOption(evnt, checked, item);
          } else {
            $asTable.handleFilterChangeRadioOption(evnt, checked, item);
          }
        }
      },
      handleFilterChangeRadioOption(evnt, checked, item) {
        const { filterStore } = reactData;
        const { column } = filterStore;
        if (column) {
          const filterOptions = (column.filters ||
            []) as AsTableDefines.FilterOption[];
          filterOptions.forEach((option) => {
            option._checked = false;
          });
          item._checked = checked;
          $asTable.checkFilterOptions();
          $asTable.handleFilterConfirmFilter(evnt, column);
        }
      },
      handleFilterConfirmFilter(evnt, column) {
        if (!column) {
          return;
        }

        const filterOptions = (column.filters ||
          []) as AsTableDefines.FilterOption[];
        filterOptions.forEach((option) => {
          option.checked = option._checked;
        });
        $asTable.confirmFilterEvent(evnt, column);
      },
      handleFilterResetFilter(evnt, column) {
        if (!column) {
          return;
        }

        $asTable.handleClearFilter(column);
        $asTable.confirmFilterEvent(evnt, column);
        if (evnt) {
          $asTable.dispatchEvent('clearFilter', { filterList: [] }, evnt);
        }
      },
      handleFilterStyle() {
        const { filterStore } = reactData;
        if (filterStore.visible) {
          return updatePopupStyle();
        }
        return nextTick();
      },
      handleOpenFilterColumn(
        evnt: MouseEvent,
        btnEl: HTMLDivElement | null,
        _colEl: HTMLDivElement,
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
          'filterVisible',
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
      clearFilter(fieldOrColumn) {
        const { filterStore } = reactData;
        const { tableFullColumn } = internalData;
        const filterOpts = computeFilterOpts.value;
        let column: AsTableDefines.ColumnInfo | null = null;
        if (fieldOrColumn) {
          column = handleFieldOrColumn($asTable, fieldOrColumn);
          if (column) {
            $asTable.handleClearFilter(column);
          }
        } else {
          tableFullColumn.forEach((col) => {
            $asTable.handleClearFilter(col);
          });
        }
        if (!fieldOrColumn || column !== filterStore.column) {
          Object.assign(filterStore, {
            isAllSelected: false,
            isIndeterminate: false,
            style: null,
            column: null,
            visible: false,
          });
        }
        if (!filterOpts.remote) {
          return $asTable.updateData();
        }
        return nextTick();
      },
      openFilter(fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (column && column.filters) {
          const { elemStore } = internalData;
          const { fixed, filters } = column;
          return $asTable.scrollToColumn(column).then(() => {
            const headerWrapperElem = getRefElem(
              elemStore[`${fixed || 'main'}-header-wrapper`] ||
                elemStore['main-header-wrapper'],
            );
            if (headerWrapperElem) {
              const filterBtnElem =
                headerWrapperElem.querySelector<HTMLElement>(
                  `.${prefixCls.value}-header--column.${column.id} .${prefixCls.value}-cell--filter`,
                );
              if (filterBtnElem) {
                triggerEvent(filterBtnElem, 'click');
              } else {
                const colEl = headerWrapperElem.querySelector<HTMLElement>(
                  `.${prefixCls.value}-header--column.${column.id}`,
                );
                if (colEl) {
                  const evnt = new Event('click');
                  const params = {
                    $table: $asTable,
                    $event: evnt,
                    $rowIndex: -1,
                    column,
                    columnIndex: $asTable.getColumnIndex(column),
                    $columnIndex: $asTable.getVMColumnIndex(column),
                    _columnIndex: $asTable.getVTColumnIndex(column),
                    firstFilterOption: filters[0] || null,
                    fixed,
                    source: 'table',
                    type: 'header',
                  };
                  $asTable.handleOpenFilterColumn(
                    evnt,
                    null,
                    colEl,
                    column,
                    params,
                  );
                }
              }
            }
          });
        }
        return nextTick();
      },
      resetFilter(fieldOrColumn) {
        if (fieldOrColumn) {
          const column = handleFieldOrColumn($asTable, fieldOrColumn);
          $asTable.handleFilterResetFilter(null, column);
        }
        return nextTick();
      },
      resetFilterByEvent(evnt, fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        $asTable.handleFilterResetFilter(evnt, column);
        return nextTick();
      },
      resetFilterPanel() {
        const { filterStore } = reactData;
        $asTable.handleFilterResetFilter(null, filterStore.column || null);
        return nextTick();
      },
      resetFilterPanelByEvent(evnt) {
        const { filterStore } = reactData;
        $asTable.handleFilterResetFilter(evnt, filterStore.column || null);
        return nextTick();
      },
      saveFilter(fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn || null);
        $asTable.handleFilterConfirmFilter(null, column);
        return nextTick();
      },
      saveFilterByEvent(evnt, fieldOrColumn) {
        const column = handleFieldOrColumn($asTable, fieldOrColumn || null);
        $asTable.handleFilterConfirmFilter(evnt, column);
        return nextTick();
      },
      saveFilterPanel() {
        const { filterStore } = reactData;
        $asTable.handleFilterConfirmFilter(null, filterStore.column || null);
        return nextTick();
      },
      saveFilterPanelByEvent(evnt) {
        const { filterStore } = reactData;
        $asTable.handleFilterConfirmFilter(evnt, filterStore.column || null);
        return nextTick();
      },
      setFilter(fieldOrColumn, options, update) {
        const { filterStore } = reactData;
        const column = handleFieldOrColumn($asTable, fieldOrColumn);
        if (column && column.filters) {
          column.filters = toFilters(options || [], column.id);
          if (update) {
            return $asTable.handleColumnConfirmFilter(column, null);
          }
          if (filterStore.visible) {
            $asTable.handleFilterOptions(column);
          }
        }
        return nextTick();
      },
      updateFilterOptionStatus(item, checked) {
        const filterOption = item as AsTableDefines.FilterOption;
        filterOption._checked = checked;
        filterOption.checked = checked;
        return nextTick();
      },
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

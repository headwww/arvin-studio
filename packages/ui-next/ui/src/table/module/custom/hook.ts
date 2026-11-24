import type {
  AsTableConstructor,
  AsTableDefines,
  AsTablePrivateMethods,
} from '../../types/table';
import type { TableCustomMethods, TableCustomPrivateMethods } from './custom';

import { nextTick } from 'vue';

import { eachTree, orderBy, toArrayTree } from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import { toCssUnit } from '../../../_util/dom';
import { getColumnList } from '../../util';

const { hooks } = ArvinStudio;

export default hooks.add('tableCustomModule', {
  setupTable(
    $asTable: AsTableConstructor & AsTablePrivateMethods,
  ): TableCustomMethods & TableCustomPrivateMethods {
    const { reactData, internalData, getComputeMaps, getRefMaps } = $asTable;
    const { computeCustomOpts } = getComputeMaps();
    const refElem = getRefMaps().refElem;

    const { customStore } = reactData;

    /**
     * 计算简单模式下的弹层位置与最大高度
     */
    const updatePopupStyle = () => {
      const customOpts = computeCustomOpts.value;
      const { mode, placement, popupOptions } = customOpts;
      if (mode === 'modal' || mode === 'drawer') {
        return;
      }
      const rootElem = refElem.value;
      if (!rootElem) {
        return;
      }
      const tableRect = rootElem.getBoundingClientRect();
      const btnEl = customStore.btnEl;
      const btnRect = btnEl
        ? btnEl.getBoundingClientRect()
        : {
            left: tableRect.left,
            top: tableRect.top,
            right: tableRect.right,
            bottom: tableRect.top + 40,
          };
      const top = Math.max(2, btnRect.bottom - tableRect.top + 2);
      const popupMaxHeight = Number(popupOptions?.maxHeight ?? 360) || 360;
      const maxHeight = Math.max(120, rootElem.clientHeight - top - 8);
      const style: Record<string, any> = {
        top: toCssUnit(top),
        maxHeight: toCssUnit(Math.min(popupMaxHeight, maxHeight)),
      };
      if (['bottom-right', 'right', 'top-right'].includes(placement ?? '')) {
        style.right = '2px';
      } else {
        style.left = toCssUnit(Math.max(0, btnRect.left - tableRect.left));
      }
      if (popupOptions?.width) {
        style.width = toCssUnit(Number(popupOptions.width));
      }
      if (popupOptions?.minWidth) {
        style.minWidth = toCssUnit(Number(popupOptions.minWidth));
      }
      customStore.defPopupStyle = style;
      customStore.maxHeight = Math.min(popupMaxHeight, maxHeight);
    };

    /**
     * 把当前列的配置同步到渲染字段
     */
    const handleUpdateCustomColumn = () => {
      if (!customStore.visible) {
        return;
      }
      eachTree(internalData.collectColumn, (column) => {
        column.renderFixed = column.fixed;
        column.renderVisible = column.visible !== false;
        column.renderResizeWidth = column.renderWidth;
        column.renderAlign = column.align;
        column.renderHeaderAlign = column.headerAlign;
        column.renderFooterAlign = column.footerAlign;
        const key = column.getKey();
        customStore.oldSortMaps[key] = column.renderSortNumber;
        customStore.oldFixedMaps[key] = column.fixed;
        customStore.oldVisibleMaps[key] = column.visible;
      });
      reactData.customColumnList = internalData.collectColumn.slice(0);
    };

    const checkCustomStatus = () => {
      const customOpts = computeCustomOpts.value;
      const { checkMethod } = customOpts;
      const columns = internalData.collectColumn;
      const isAll = columns.every((column) => {
        if (checkMethod && !checkMethod({ $table: $asTable, column })) {
          return true;
        }
        return column.renderVisible;
      });
      customStore.isAll = isAll;
      customStore.isIndeterminate =
        !isAll &&
        columns.some((column) => {
          if (checkMethod && !checkMethod({ $table: $asTable, column })) {
            return false;
          }
          return column.renderVisible || column.halfVisible;
        });
    };

    const openCustom = () => {
      customStore.visible = true;
      reactData.initStore.custom = true;
      handleUpdateCustomColumn();
      checkCustomStatus();
      updatePopupStyle();
      return nextTick(() => {
        updatePopupStyle();
      });
    };

    const closeCustom = () => {
      const customOpts = computeCustomOpts.value;
      customStore.visible = false;
      if (!customOpts.immediate) {
        $asTable.handleCustom();
      }
      return nextTick();
    };

    const toggleCustom = () => {
      return customStore.visible ? closeCustom() : openCustom();
    };

    const saveCustom = (isDirectly?: boolean) => {
      const customOpts = computeCustomOpts.value;
      const {
        allowAlign,
        allowFixed,
        allowFooterAlign,
        allowHeaderAlign,
        allowResizable,
        allowSort,
        allowVisible,
      } = customOpts;
      const { customColumnList } = reactData;
      if (isDirectly) {
        eachTree(customColumnList, (column) => {
          if (
            !(allowResizable && column.renderVisible) ||
            (column.children && column.children.length > 0)
          ) {
            return;
          }

          const width = Number.parseFloat(`${column.renderWidth || 0}`) || 0;
          column.resizeWidth = Math.max(0, width);
        });
      } else {
        eachTree(
          customColumnList,
          (column, index, _items, _path, parentColumn) => {
            if (parentColumn) {
              column.fixed = parentColumn.fixed;
            } else {
              if (allowSort) {
                column.renderSortNumber = index + 1;
              }
              if (allowFixed) {
                column.fixed = column.renderFixed;
              }
            }
            if (
              allowResizable &&
              column.renderVisible &&
              !(column.children && column.children.length > 0) &&
              column.renderResizeWidth !== column.renderWidth
            ) {
              column.resizeWidth = column.renderResizeWidth;
              column.renderWidth = column.renderResizeWidth;
            }
            if (allowVisible) {
              column.visible = column.renderVisible;
            }
            if (allowAlign) {
              column.align = column.renderAlign;
            }
            if (allowHeaderAlign) {
              column.headerAlign = column.renderHeaderAlign;
            }
            if (allowFooterAlign) {
              column.footerAlign = column.renderFooterAlign;
            }
          },
        );
      }
      reactData.isCustomStatus = true;
      if (allowSort) {
        internalData.collectColumn = customColumnList;
      }
      return $asTable.saveCustomStore('confirm');
    };

    const cancelCustom = () => {
      eachTree(reactData.customColumnList, (column) => {
        const key = column.getKey();
        const oldVisible = customStore.oldVisibleMaps[key];
        if (oldVisible !== undefined) {
          column.visible = oldVisible;
        }
        column.renderVisible = column.visible !== false;
        const oldFixed = customStore.oldFixedMaps[key];
        if (oldFixed !== undefined) {
          column.fixed = oldFixed;
        }
        column.renderFixed = column.fixed;
        const oldSort = customStore.oldSortMaps[key];
        if (oldSort !== undefined) {
          column.renderSortNumber = oldSort;
        }
        column.renderResizeWidth = column.renderWidth;
        column.renderAlign = column.align;
        column.renderHeaderAlign = column.headerAlign;
        column.renderFooterAlign = column.footerAlign;
      });
      reactData.isCustomStatus = false;
      checkCustomStatus();
      $asTable.handleCustom();
      return nextTick();
    };

    const resetCustom = (options?: boolean | Record<string, any>) => {
      const customOpts = computeCustomOpts.value;
      const optMap =
        typeof options === 'object' && options !== null ? options : {};
      const opts = {
        visible: true,
        resizable: options === true,
        fixed: options === true,
        sort: options === true,
        align: options === true,
        headerAlign: options === true,
        footerAlign: options === true,
        ...optMap,
      };
      const allCols: AsTableDefines.ColumnInfo[] = [];
      eachTree(internalData.collectColumn, (column) => {
        if (opts.resizable) {
          column.resizeWidth = 0;
        }
        if (opts.fixed) {
          column.fixed = column.defaultFixed;
          column.renderFixed = column.defaultFixed;
        }
        column.renderSortNumber = column.sortNumber;
        column.parentId = column.defaultParentId;
        if (opts.visible) {
          const visibleMethod = customOpts.visibleMethod;
          column.visible = visibleMethod
            ? visibleMethod({ $table: $asTable, column })
            : column.defaultVisible;
        }
        if (opts.align) {
          column.align = column.defaultAlign;
        }
        if (opts.headerAlign) {
          column.headerAlign = column.defaultHeaderAlign;
        }
        if (opts.footerAlign) {
          column.footerAlign = column.defaultFooterAlign;
        }
        column.renderResizeWidth = column.renderWidth;
        column.renderVisible = column.visible !== false;
        column.renderAlign = column.align;
        column.renderHeaderAlign = column.headerAlign;
        column.renderFooterAlign = column.footerAlign;
        allCols.push(column);
      });
      if (opts.sort) {
        const newCollectCols = toArrayTree(
          orderBy(allCols, 'renderSortNumber'),
          {
            key: 'id',
            parentKey: 'parentId',
            children: 'children',
          },
        ) as AsTableDefines.ColumnInfo[];
        internalData.collectColumn = newCollectCols;
        internalData.tableFullColumn = getColumnList(newCollectCols);
      }
      reactData.isCustomStatus = false;
      checkCustomStatus();
      return $asTable.handleCustom().then(() => {
        return $asTable.saveCustomStore('reset');
      });
    };

    const setCustomAllCheckbox = (checked: boolean) => {
      const customOpts = computeCustomOpts.value;
      const { checkMethod, immediate, visibleMethod } = customOpts;
      eachTree(internalData.collectColumn, (column) => {
        if (visibleMethod && !visibleMethod({ $table: $asTable, column })) {
          return;
        }
        if (checkMethod && !checkMethod({ $table: $asTable, column })) {
          return;
        }
        if (immediate) {
          column.visible = checked;
          column.renderVisible = checked;
          column.halfVisible = false;
        } else {
          column.renderVisible = checked;
          column.halfVisible = false;
        }
      });
      if (immediate) {
        reactData.isCustomStatus = true;
        $asTable.handleCustom();
        $asTable.saveCustomStore('update:visible');
      }
      checkCustomStatus();
      return nextTick();
    };

    const emitCustomEvent = (type: string, evnt?: Event) => {
      $asTable.dispatchEvent('custom', { type }, evnt as Event);
    };

    const customMethods: TableCustomMethods = {
      cancelCustom,
      closeCustom,
      getCustomVisible: () => customStore.visible,
      openCustom,
      resetCustom,
      saveCustom,
      setCustomAllCheckbox,
      toggleCustom,
      toggleCustomAllCheckbox: () => {
        return setCustomAllCheckbox(!customStore.isAll);
      },
    };

    const customPrivateMethods: TableCustomPrivateMethods = {
      checkCustomStatus,
      emitCustomEvent,
      handleUpdateCustomColumn,
      handleCustomStyle() {
        if (!customStore.visible) {
          return nextTick();
        }
        reactData.isCustomDragStatus = false;
        updatePopupStyle();
        return nextTick();
      },
      triggerCustomEvent(evnt: Event) {
        if (customStore.visible) {
          closeCustom();
          emitCustomEvent('close', evnt);
          $asTable.dispatchEvent('customClose', {}, evnt);
        } else {
          customStore.btnEl = evnt.target as HTMLDivElement;
          openCustom();
          emitCustomEvent('open', evnt);
          $asTable.dispatchEvent('customOpen', {}, evnt);
        }
      },
      customOpenEvent(evnt: Event) {
        if (customStore.visible) {
          return;
        }

        customStore.activeBtn = true;
        customStore.btnEl = evnt.target as HTMLDivElement;
        openCustom();
        emitCustomEvent('open', evnt);
        $asTable.dispatchEvent('customOpen', {}, evnt);
      },
      customCloseEvent(evnt: Event) {
        if (!customStore.visible) {
          return;
        }

        customStore.activeBtn = false;
        closeCustom();
        emitCustomEvent('close', evnt);
        $asTable.dispatchEvent('customClose', {}, evnt);
      },
    };

    return {
      ...customMethods,
      ...customPrivateMethods,
    };
  },
});

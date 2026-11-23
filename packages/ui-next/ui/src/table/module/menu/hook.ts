import type { AsTableDefines } from '../../types/table';
import type { TableMenuMethods, TableMenuPrivateMethods } from './menu';

import { nextTick } from 'vue';

import { findIndexOf } from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import {
  getAbsolutePos,
  getDomNode,
  getEventTargetNode,
  toCssUnit,
} from '../../../_util/dom';
import { hasChildrenList, isEnableConf } from '../../util';

const { hooks, globalEvents, GLOBAL_EVENT_KEYS } = ArvinStudio;

// 全局菜单注册表（可选，未注册时仅派发 menu-click 事件）
const menus: any = (ArvinStudio as any).menus;

/**
 * 从事件源向上查找表格根节点
 */
const isInTable = (target: Element | null, rootElem: Element | null, xID: string) => {
  let node: any = target;
  while (node && node !== rootElem) {
    if (node.getAttribute && node.getAttribute('xid') === xID) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

hooks.add('tableMenuModule', {
  setupTable($asTable) {
    const { xID, props, reactData, internalData } = $asTable;
    const { refElem, refTableFilter, refTableMenu } = $asTable.getRefMaps();
    const { computeIsContentMenu, computeMenuOpts, computeMouseOpts } =
      $asTable.getComputeMaps();

    const menuMethods = {} as TableMenuMethods;
    const menuPrivateMethods = {} as TableMenuPrivateMethods;

    /**
     * 显示快捷菜单
     */
    const handleOpenMenuEvent = (
      evnt: any,
      type: 'body' | 'footer' | 'header',
      params: any,
    ) => {
      const { ctxMenuStore } = reactData;
      const isContentMenu = computeIsContentMenu.value;
      const menuOpts = computeMenuOpts.value;
      const config = menuOpts[type];
      const { zIndex, transfer, width, visibleMethod } = menuOpts;
      if (config) {
        const { options, disabled } = config;
        if (disabled) {
          evnt.preventDefault();
        } else if (isContentMenu && options && options.length > 0) {
          params.options = options;
          $asTable.preventEvent(evnt, 'event.showMenu', params, () => {
            if (!visibleMethod || visibleMethod(params)) {
              evnt.preventDefault();
              $asTable.updateZindex();
              const el = refElem.value;
              if (!el) {
                return;
              }
              const tableRect = el.getBoundingClientRect();
              const { scrollTop, scrollLeft, visibleHeight, visibleWidth } =
                getDomNode();

              let top = evnt.clientY - tableRect.top;
              let left = evnt.clientX - tableRect.left;
              if (transfer) {
                top = evnt.clientY + scrollTop;
                left = evnt.clientX + scrollLeft;
              }

              const handleVisible = () => {
                internalData._currMenuParams = params;
                const ctxStyle: Record<string, any> = {
                  zIndex: zIndex || internalData.tZindex,
                  top: `${top}px`,
                  left: `${left}px`,
                };
                if (width) {
                  ctxStyle['--menu-item-width'] = toCssUnit(width);
                }
                Object.assign(ctxMenuStore, {
                  visible: true,
                  list: options,
                  selected: null,
                  selectChild: null,
                  showChild: false,
                  style: ctxStyle,
                });
                nextTick(() => {
                  const tableMenu = refTableMenu.value;
                  const ctxElem = tableMenu
                    ? tableMenu.getRefMaps().refElem.value
                    : null;
                  if (!ctxElem) {
                    return;
                  }
                  const clientHeight = ctxElem.clientHeight;
                  const clientWidth = ctxElem.clientWidth;
                  const { boundingTop, boundingLeft } = getAbsolutePos(ctxElem);
                  const offsetTop = boundingTop + clientHeight - visibleHeight;
                  const offsetLeft = boundingLeft + clientWidth - visibleWidth;
                  if (offsetTop > -10) {
                    ctxMenuStore.style.top = `${Math.max(scrollTop + 2, top - clientHeight - 2)}px`;
                  }
                  if (offsetLeft > -10) {
                    ctxMenuStore.style.left = `${Math.max(scrollLeft + 2, left - clientWidth - 2)}px`;
                  }
                });
              };
              const { keyboard, row, column } = params;
              if (keyboard && row && column) {
                $asTable.scrollToRow(row, column).then(() => {
                  const cell = $asTable.getCellElement(row, column);
                  if (cell) {
                    const { boundingTop, boundingLeft } = getAbsolutePos(cell);
                    top =
                      boundingTop +
                      scrollTop +
                      Math.floor(cell.offsetHeight / 2);
                    left =
                      boundingLeft +
                      scrollLeft +
                      Math.floor(cell.offsetWidth / 2);
                  }
                  handleVisible();
                });
              } else {
                handleVisible();
              }
            } else {
              menuMethods.closeMenu();
            }
          });
        }
      }
      $asTable.closeFilter();
    };

    Object.assign(menuMethods, {
      /**
       * 关闭快捷菜单
       */
      closeMenu() {
        Object.assign(reactData.ctxMenuStore, {
          visible: false,
          selected: null,
          selectChild: null,
          showChild: false,
        });
        return nextTick();
      },
    });

    Object.assign(menuPrivateMethods, {
      /**
       * 处理菜单的移动
       */
      moveCtxMenu(
        evnt: KeyboardEvent,
        ctxMenuStore: any,
        property: 'selectChild' | 'selected',
        hasOper: boolean,
        operRest: any,
        menuList: any[],
      ) {
        let selectItem;
        const selectIndex = findIndexOf(
          menuList,
          (item) => ctxMenuStore[property] === item,
        );
        if (hasOper) {
          if (operRest && hasChildrenList(ctxMenuStore.selected)) {
            ctxMenuStore.showChild = true;
          } else {
            ctxMenuStore.showChild = false;
            ctxMenuStore.selectChild = null;
          }
        } else if (globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ARROW_UP)) {
          for (let len = selectIndex - 1; len >= 0; len--) {
            if (menuList[len].visible !== false) {
              selectItem = menuList[len];
              break;
            }
          }
          ctxMenuStore[property] = selectItem || menuList[menuList.length - 1];
        } else if (globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ARROW_DOWN)) {
          for (let index = selectIndex + 1; index < menuList.length; index++) {
            if (menuList[index].visible !== false) {
              selectItem = menuList[index];
              break;
            }
          }
          ctxMenuStore[property] = selectItem || menuList[0];
        } else if (
          ctxMenuStore[property] &&
          (globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.ENTER) ||
            globalEvents.hasKey(evnt, GLOBAL_EVENT_KEYS.SPACEBAR))
        ) {
          $asTable.ctxMenuLinkEvent(evnt, ctxMenuStore[property]);
        }
      },
      handleOpenMenuEvent,
      /**
       * 快捷菜单事件处理
       */
      handleGlobalContextmenuEvent(evnt: Event) {
        const { menuConfig, mouseConfig } = props;
        const { editStore, ctxMenuStore } = reactData;
        const { visibleColumn } = internalData;
        const tableFilter = refTableFilter.value;
        const tableMenu = refTableMenu.value;
        const mouseOpts = computeMouseOpts.value;
        const menuOpts = computeMenuOpts.value;
        const el = refElem.value;
        const { selected } = editStore;
        const layoutList = ['header', 'body', 'footer'] as const;
        if (isEnableConf(menuConfig)) {
          const menuElem = tableMenu
            ? tableMenu.getRefMaps().refElem.value
            : null;
          if (
            ctxMenuStore.visible &&
            menuElem &&
            getEventTargetNode(evnt, menuElem).flag
          ) {
            evnt.preventDefault();
            return;
          }
          if (internalData._keyCtx) {
            const type = 'body';
            const params: any = {
              source: 'table',
              type,
              $table: $asTable,
              keyboard: true,
              columns: visibleColumn.slice(0),
              $event: evnt,
            };
            // 如果开启单元格区域
            if (
              mouseConfig &&
              mouseOpts.area &&
              typeof ($asTable as any).getActiveCellArea === 'function'
            ) {
              const activeArea = ($asTable as any).getActiveCellArea();
              if (activeArea && activeArea.row && activeArea.column) {
                params.row = activeArea.row;
                params.column = activeArea.column;
                handleOpenMenuEvent(evnt, type, params);
                return;
              }
            } else if (mouseConfig && mouseOpts.selected && selected.row && selected.column) {
              params.row = selected.row;
              params.column = selected.column;
              handleOpenMenuEvent(evnt, type, params);
              return;
            }
          }
          // 分别匹配表头、内容、表尾的快捷菜单
          for (const layout of layoutList) {
            const columnTargetNode = getEventTargetNode(
              evnt,
              el,
              `${$asTable.prefixCls.value}-${layout}--column`,
              (target: Element) => isInTable(target, el, xID),
            );
            const params: any = {
              source: 'table',
              type: layout,
              $table: $asTable,
              columns: visibleColumn.slice(0),
              $event: evnt,
            };
            if (columnTargetNode.flag) {
              const cell = columnTargetNode.targetElem as HTMLElement;
              const columnNodeRest = $asTable.getColumnNode(cell);
              const column = columnNodeRest ? columnNodeRest.item : null;
              let typePrefix = `${layout}-`;
              if (column) {
                Object.assign(params, {
                  column,
                  columnIndex: $asTable.getColumnIndex(column),
                  cell,
                });
              }
              if (layout === 'body') {
                const rowNodeRest = $asTable.getRowNode(
                  cell.parentNode as HTMLElement,
                );
                const row = rowNodeRest ? rowNodeRest.item : null;
                typePrefix = '';
                if (row) {
                  params.row = row;
                  params.rowIndex = $asTable.getRowIndex(row);
                }
              }
              const eventType = `${typePrefix}cell-menu` as
                | 'cell-menu'
                | 'footer-cell-menu'
                | 'header-cell-menu';
              handleOpenMenuEvent(evnt, layout, params);
              $asTable.dispatchEvent(eventType, params, evnt);
              return;
            }
            const wrapperCls = `${$asTable.prefixCls.value}--${layout}-wrapper`;
            const emptyCls = `${$asTable.prefixCls.value}--empty-place-wrapper`;
            if (
              getEventTargetNode(evnt, el, wrapperCls, (target: Element) => {
                return target.getAttribute('xid') === xID;
              }).flag ||
              (layout === 'body' &&
                getEventTargetNode(evnt, el, emptyCls, (target: Element) => {
                  return target.getAttribute('xid') === xID;
                }).flag)
            ) {
              if (menuOpts.trigger === 'cell') {
                evnt.preventDefault();
              } else {
                handleOpenMenuEvent(evnt, layout, params);
              }
              return;
            }
          }
        }
        const filterElem = tableFilter
          ? tableFilter.getRefMaps().refElem.value
          : null;
        if (filterElem && !getEventTargetNode(evnt, filterElem).flag) {
          $asTable.closeFilter();
        }
        menuMethods.closeMenu();
      },
      ctxMenuMouseoverEvent(
        evnt: Event,
        item: AsTableDefines.MenuChildOption | AsTableDefines.MenuFirstOption,
        child?: any,
      ) {
        const menuElem = evnt.currentTarget as HTMLDivElement;
        const { ctxMenuStore } = reactData;
        evnt.preventDefault();
        evnt.stopPropagation();
        ctxMenuStore.selected = item;
        ctxMenuStore.selectChild = child;
        if (!child) {
          ctxMenuStore.showChild = hasChildrenList(item);
          if (ctxMenuStore.showChild) {
            nextTick(() => {
              const childWrapperElem =
                menuElem.nextElementSibling as HTMLDivElement;
              if (childWrapperElem) {
                const {
                  boundingTop,
                  boundingLeft,
                  visibleHeight,
                  visibleWidth,
                } = getAbsolutePos(menuElem);
                const posTop = boundingTop + menuElem.offsetHeight;
                const posLeft = boundingLeft + menuElem.offsetWidth;
                let left = '';
                let right = '';
                // 是否超出右侧
                if (posLeft + childWrapperElem.offsetWidth > visibleWidth - 10) {
                  left = 'auto';
                  right = `${menuElem.offsetWidth}px`;
                }
                // 是否超出底部
                let top = '';
                let bottom = '';
                if (posTop + childWrapperElem.offsetHeight > visibleHeight - 10) {
                  top = 'auto';
                  bottom = '0';
                }
                childWrapperElem.style.left = left;
                childWrapperElem.style.right = right;
                childWrapperElem.style.top = top;
                childWrapperElem.style.bottom = bottom;
              }
            });
          }
        }
      },
      ctxMenuMouseoutEvent(_evnt: Event, item: any) {
        const { ctxMenuStore } = reactData;
        if (!item.children) {
          ctxMenuStore.selected = null;
        }
        ctxMenuStore.selectChild = null;
      },
      /**
       * 快捷菜单点击事件
       */
      ctxMenuLinkEvent(
        evnt: Event,
        menu: AsTableDefines.MenuChildOption | AsTableDefines.MenuFirstOption,
      ) {
        // 如果一级菜单有配置 code 则允许点击，否则不能点击
        if (!(!menu.loading &&
          !menu.disabled &&
          (menu.code || !menu.children || menu.children.length === 0))) {
        	return;
        }

        const gMenuOpts = menus ? menus.get(menu.code) : null;
        const params = Object.assign({}, internalData._currMenuParams, {
          menu,
          $table: $asTable,
          $event: evnt,
        });
        const tmMethod = gMenuOpts
          ? gMenuOpts.tableMenuMethod || gMenuOpts.menuMethod
          : null;
        if (tmMethod) {
          tmMethod(params, evnt);
        }
        $asTable.dispatchEvent('menu-click', params, evnt);
        menuMethods.closeMenu();
      },
    });

    return { ...menuMethods, ...menuPrivateMethods };
  },
});

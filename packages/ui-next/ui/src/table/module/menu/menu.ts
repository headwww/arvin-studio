import type { AsTableDefines } from '../../types/table';

export interface TableMenuMethods<D = any> {
  [key: symbol]: any | D;

  /**
   * 手动关闭快捷菜单
   */
  closeMenu(): Promise<any>;
}

export interface TableMenuPrivateMethods<D = any> {
  [key: symbol]: any | D;
  /**
   * @private
   */
  ctxMenuLinkEvent(
    evnt: Event,
    menu: AsTableDefines.MenuChildOption | AsTableDefines.MenuFirstOption,
  ): void;
  /**
   * @private
   */
  ctxMenuMouseoutEvent(
    evnt: Event,
    item: AsTableDefines.MenuChildOption | AsTableDefines.MenuFirstOption,
  ): void;
  /**
   * @private
   */
  ctxMenuMouseoverEvent(
    evnt: Event,
    item: AsTableDefines.MenuChildOption | AsTableDefines.MenuFirstOption,
    child?: any,
  ): void;
  /**
   * @private
   */
  handleGlobalContextmenuEvent(evnt: Event): void;
  /**
   * @private
   */
  handleOpenMenuEvent(
    evnt: Event,
    type: 'body' | 'footer' | 'header',
    params: any,
  ): void;
  /**
   * @private
   */
  moveCtxMenu(
    evnt: KeyboardEvent,
    ctxMenuStore: any,
    property: 'selectChild' | 'selected',
    hasOper: boolean,
    operRest: any,
    menuList: any[],
  ): void;
}

declare module '../../types/table' {
  export interface AsTableMethods<D = any> extends TableMenuMethods<D> {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends TableMenuPrivateMethods<D> {}
}

// oxlint-disable-next-line no-unused-vars
export interface TableKeyboardMethods {}

export interface TableKeyboardPrivateMethods<D = any> {
  /** 内部占位，保证泛型参数被使用 */
  [key: symbol]: D;
  handleCellMousedownEvent(evnt: any, params: any): void;
  moveArrowSelected(
    args: any,
    isLeftArrow: boolean,
    isUpArrow: boolean,
    isRightArrow: boolean,
    isDwArrow: boolean,
    evnt: any,
  ): void;
  moveCurrentColumn(
    isLeftArrow: boolean,
    isRightArrow: boolean,
    evnt: any,
  ): void;
  moveCurrentRow(isUpArrow: boolean, isDwArrow: boolean, evnt: any): void;
  moveEnterSelected(
    args: any,
    isLeftArrow: boolean,
    isUpArrow: boolean,
    isRightArrow: boolean,
    isDwArrow: boolean,
    evnt: any,
  ): void;

  moveTabSelected(args: any, isLeft: any, evnt: any): void;
}

declare module '../../types/table' {
  export interface AsTablePrivateMethods<D = any>
    extends TableKeyboardPrivateMethods<D> {}
}

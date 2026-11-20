import type { AsColumnPropTypes } from '../../types/column';
import type { AsTableDefines } from '../../types/table';

export interface AsFilterPanel {
  /**
   * 筛选所有发生改变
   * @param evnt 事件
   * @param checked 是否选中
   */
  changeAllOption(evnt: Event | null, checked: boolean): void;
  /**
   * 筛选选项发生改变
   * @param evnt 事件
   * @param checked 是否选中
   * @param option 选项对象
   */
  changeOption(
    evnt: Event | null,
    checked: boolean,
    option: AsTableDefines.FilterOption,
  ): void;
  /**
   * 确认筛选
   */
  confirmFilter(evnt?: Event): void;
  /**
   * 重置筛选
   */
  resetFilter(evnt?: Event): void;
}

export interface TableFilterMethods<D = any> {
  /**
   * 手动清空筛选条件；如果需要同时触发对应的事件，请使用 clearFilterByEvent
   */
  clearFilter(
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<void>;
  /**
   * 获取当前筛选的所有列信息
   */
  getCheckedFilters(): AsTableDefines.FilterCheckedParams<D>[];
  /**
   * 手动弹出筛选
   * @param fieldOrColumn
   */
  openFilter(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
  ): Promise<void>;
  /**
   * 对指定列手动重置筛选
   */
  resetFilter(
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<any>;
  /**
   * 对指定列手动重置筛选并触发 filter-change 事件
   */
  resetFilterByEvent(
    event: Event,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<any>;
  /**
   * 用于在自定义面板中使用，手动重置筛选
   */
  resetFilterPanel(): Promise<any>;
  /**
   * 用于在自定义面板中使用，手动重置筛选并触发 filter-change 事件
   */
  resetFilterPanelByEvent(event: Event): Promise<any>;
  /**
   * 对指定列手动确认筛选
   */
  saveFilter(
    fieldOrColumn?: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<any>;
  /**
   * 对指定列手动确认筛选并触发 filter-change 事件
   */
  saveFilterByEvent(
    event: Event,
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo | null,
  ): Promise<any>;
  /**
   * 用于在自定义面板中使用，手动确认筛选
   */
  saveFilterPanel(): Promise<any>;
  /**
   * 用于在自定义面板中使用，手动确认筛选并触发 filter-change 事件
   */
  saveFilterPanelByEvent(event: Event): Promise<any>;
  /**
   * 用于 filters，修改筛选列表，update 是否同时更新数据，如果不传，则可以手动调用 updateData() 更新数据；如果需要同时触发对应的事件，请使用 setFilterByEvent
   */
  setFilter(
    fieldOrColumn: AsColumnPropTypes.Field | AsTableDefines.ColumnInfo,
    options: AsColumnPropTypes.Filters,
    update?: boolean,
  ): Promise<void>;
  /**
   * 更新筛选选项的状态
   */
  updateFilterOptionStatus(
    item: AsColumnPropTypes.FilterItem | AsTableDefines.FilterOption,
    checked: boolean,
  ): Promise<void>;
}

export interface TableFilterPrivateMethods<D = any> {
  [key: symbol]: D;

  /**
   * @private
   */
  checkFilterOptions(): void;
  /**
   * @private
   */
  confirmFilterEvent(
    evnt: Event | null,
    column?: AsTableDefines.ColumnInfo | null,
  ): void;
  /**
   * @private
   */
  handleClearFilter(column: AsTableDefines.ColumnInfo): void;
  /**
   * @private
   */
  handleColumnConfirmFilter(
    column: AsTableDefines.ColumnInfo,
    evnt: Event | null,
  ): Promise<any>;
  /**
   * @private
   */
  handleFilterChangeMultipleOption(
    evnt: Event,
    checked: boolean,
    item: any,
  ): void;
  /**
   * @private
   */
  handleFilterChangeOption(evnt: Event, checked: boolean, item: any): void;
  /**
   * @private
   */
  handleFilterChangeRadioOption(evnt: Event, checked: boolean, item: any): void;
  /**
   * @private
   */
  handleFilterConfirmFilter(
    evnt: Event | null,
    column: AsTableDefines.ColumnInfo | null,
  ): void;
  /**
   * @private
   */
  handleFilterResetFilter(
    evnt: Event | null,
    column: AsTableDefines.ColumnInfo | null,
  ): void;
  /**
   * @private
   */
  handleFilterStyle(): Promise<any>;
  /**
   * @private
   */
  handleOpenFilterColumn(
    evnt: Event,
    btnEl: HTMLElement | null,
    cellEl: HTMLElement,
    column: AsTableDefines.ColumnInfo,
    params: any,
  ): void;
  /**
   * @private
   */
  triggerFilterEvent(
    evnt: Event,
    column: AsTableDefines.ColumnInfo,
    params: any,
  ): void;
}

declare module '../../types/table' {
  export interface AsTableMethods<D = any> extends TableFilterMethods<D> {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends TableFilterPrivateMethods<D> {}
}

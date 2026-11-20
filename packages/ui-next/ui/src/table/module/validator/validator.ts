import type { AsColumnPropTypes } from '../../types/column';
import type { AsTableDefines } from '../../types/table';

export interface TableValidatorMethods<D = any> {
  /**
   * 手动清除校验
   */
  clearValidate(
    rows?: any,
    fieldOrColumn?:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
  ): Promise<void>;
  /**
   * 完整校验行，默认校验当前表格数据，和 validate 的区别就是默认校验当前表格数据并且给有效数据中的每一行进行校验
   * @param rows 指定行
   */
  fullValidate(
    rows?:
      | ((errMap: AsTableDefines.ValidatorErrorMapParams<D>) => void)
      | any[]
      | boolean
      | object,
    callback?: (errMap: AsTableDefines.ValidatorErrorMapParams<D>) => void,
  ): Promise<AsTableDefines.ValidatorErrorMapParams<D>>;
  /**
   * 完整校验单元格，默认校验当前表格数据，如果存在记录不通过的记录，则返回不再继续校验（异步校验除外）；
   * 如果第一个参数为 true 则校验当前表格数据，如果指定 row 或 rows 则校验指定一行或多行，如果不指定数据，则默认只校验临时变动的数据，例如新增或修改。返回一个 promise
   * @param rows 指定行
   * @param fieldOrColumn 指定字段
   */
  fullValidateField(
    rows?: any[] | boolean | object,
    fieldOrColumn?:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
  ): Promise<AsTableDefines.ValidatorErrorMapParams<D>>;

  /**
   * 快速校验行，默认校验当前表格数据，如果存在记录不通过的记录，则返回不再继续校验（异步校验除外）；
   * 如果第一个参数为 true 则校验当前表格数据，如果指定 row 或 rows 则校验指定一行或多行，如果不指定数据，则默认只校验临时变动的数据，例如新增或修改。该回调函数会在校验结束后被调用 callback(errMap)。若不传入回调函数，则会返回一个 promise
   * @param rows 指定行
   */
  validate(
    rows?:
      | ((errMap?: AsTableDefines.ValidatorErrorMapParams<D>) => void)
      | any[]
      | boolean
      | object,
    callback?: (errMap?: AsTableDefines.ValidatorErrorMapParams<D>) => void,
  ): Promise<AsTableDefines.ValidatorErrorMapParams<D>>;
  /**
   * 快速校定单元格，默认校验当前表格数据，如果存在记录不通过的记录，则返回不再继续校验（异步校验除外）；
   * 如果第一个参数为 true 则校验当前表格数据，如果指定 row 或 rows 则校验指定一行或多行，如果不指定数据，则默认只校验临时变动的数据，例如新增或修改。返回一个 promise
   * @param rows 指定行
   * @param fieldOrColumn 指定字段
   */
  validateField(
    rows?: any[] | boolean | object,
    fieldOrColumn?:
      | AsColumnPropTypes.Field
      | AsColumnPropTypes.Field[]
      | AsTableDefines.ColumnInfo
      | AsTableDefines.ColumnInfo[],
  ): Promise<AsTableDefines.ValidatorErrorMapParams<D>>;
}

export interface TableValidatorPrivateMethods<D = any> {
  /** 内部占位，保证泛型参数被使用 */
  [key: symbol]: D;
  hasCellRules(type: any, row: any, column: AsTableDefines.ColumnInfo): boolean;
  showValidTooltip(params: any): void;
  triggerValidate(type: any): Promise<any>;
  validCellRules(
    type: any,
    row: any,
    column: AsTableDefines.ColumnInfo,
    val?: any,
  ): Promise<any>;
}

declare module '../../types/table' {
  export interface AsTableMethods<D = any> extends TableValidatorMethods<D> {}
  export interface AsTablePrivateMethods<
    D = any,
  > extends TableValidatorPrivateMethods<D> {}
}

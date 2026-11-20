import type { AsTableDefines } from '../../types/table';
import type {
  TableValidatorMethods,
  TableValidatorPrivateMethods,
} from './validator';

import { nextTick } from 'vue';

import {
  each,
  eachTree,
  eqNull,
  get,
  isArray,
  isFunction,
  isString,
  isUndefined,
  toNumber,
} from '@arvin-studio/kit';

import { ArvinStudio } from '../../..';
import { scrollToView } from '../../../_util/dom';
import useLog from '../../../_util/logger';
import { eqEmptyValue, getRowid, handleFieldOrColumn } from '../../util';

const { hooks } = ArvinStudio;

/**
 * 校验规则包装类
 * 统一读取原始配置，并把 content/message 归一化成可直接展示的文本
 */
class Rule {
  [key: string]: any;

  /**
   * 获取校验不通过的提示内容，支持函数形式
   */
  get content() {
    // eslint-disable-next-line unicorn/no-undeclared-class-members
    const raw = this.$options.content ?? this.$options.message;
    return isFunction(raw) ? `${raw()}` : `${raw ?? ''}`;
  }

  get message() {
    return this.content;
  }

  // eslint-disable-next-line unicorn/consistent-class-member-order
  constructor(rule: any) {
    Object.assign(this, {
      $options: rule,
      required: rule.required,
      min: rule.min,
      max: rule.max,
      type: rule.type,
      pattern: rule.pattern,
      validator: rule.validator,
      trigger: rule.trigger,
      maxWidth: rule.maxWidth,
    });
  }
}

/**
 * 判断正则是否匹配
 */
function validREValue(pattern: RegExp | string | undefined, val: string) {
  return !(
    pattern &&
    !(pattern instanceof RegExp ? pattern : new RegExp(pattern)).test(val)
  );
}

/**
 * 判断是否超过最大值
 */
function validMaxValue(max: number | string | undefined, num: number) {
  return !(!eqNull(max) && num > toNumber(max));
}

/**
 * 判断是否小于最小值
 */
function validMinValue(min: number | string | undefined, num: number) {
  return !(!eqNull(min) && num < toNumber(min));
}

/**
 * 按规则类型校验值
 */
function validRuleValue(
  rule: AsTableDefines.ValidatorRule,
  val: any,
  required: boolean | undefined,
) {
  const { type, min, max, pattern } = rule;
  const isArrType = type === 'array';
  const isNumType = type === 'number';
  const isStrType = type === 'string';
  const strVal = `${val}`;
  if (!validREValue(pattern, strVal)) {
    return false;
  }
  if (isArrType) {
    if (!isArray(val)) {
      return false;
    }
    if (required && val.length === 0) {
      return false;
    }
    if (!validMinValue(min, val.length)) {
      return false;
    }
    if (!validMaxValue(max, val.length)) {
      return false;
    }
  } else if (isNumType) {
    const numVal = Number(val);
    if (Number.isNaN(numVal)) {
      return false;
    }
    if (!validMinValue(min, numVal)) {
      return false;
    }
    if (!validMaxValue(max, numVal)) {
      return false;
    }
  } else {
    if (isStrType && !isString(val)) {
      return false;
    }
    if (required && !strVal) {
      return false;
    }
    if (!validMinValue(min, strVal.length)) {
      return false;
    }
    if (!validMaxValue(max, strVal.length)) {
      return false;
    }
  }
  return true;
}

/**
 * 判断当前值是否满足规则
 */
function checkRuleStatus(
  rule: AsTableDefines.ValidatorRule,
  row: any,
  val: any,
) {
  const { required, field } = rule;
  const currVal = field ? get(row, field) : val;
  const isEmptyVal = isArray(currVal)
    ? currVal.length === 0
    : eqEmptyValue(currVal);
  if (required) {
    if (isEmptyVal) {
      return false;
    }
    return validRuleValue(rule, currVal, required);
  }
  if (!isEmptyVal) {
    return validRuleValue(rule, currVal, required);
  }
  return true;
}

/**
 * 表格校验模块
 * 提供行/单元格校验、清除校验以及校验失败提示
 */
hooks.add('tableValidatorModule', {
  setupTable($asTable) {
    const { props, reactData, internalData } = $asTable;
    const { refValidTooltip } = $asTable.getRefMaps();
    const {
      computeValidOpts,
      computeTreeOpts,
      computeEditOpts,
      computeAggregateOpts,
    } = $asTable.getComputeMaps();
    const log = useLog('Table');

    let validatorMethods = {} as TableValidatorMethods;
    let validatorPrivateMethods = {} as TableValidatorPrivateMethods;

    /**
     * 聚焦到校验不通过的单元格并弹出错误提示
     */
    const handleValidError = (params: any): Promise<void> => {
      return new Promise((resolve) => {
        const validOpts = computeValidOpts.value;
        if (validOpts.autoPos === false) {
          $asTable.dispatchEvent('valid-error', params, null);
          resolve();
          return;
        }
        $asTable
          .handleEdit(
            {
              ...params,
              $columnIndex: params.columnIndex ?? 0,
              $rowIndex: params.rowIndex ?? 0,
              $table: $asTable,
              _columnIndex: params.columnIndex ?? 0,
              _rowIndex: params.rowIndex ?? 0,
            },
            { type: 'valid-error', trigger: 'call' },
          )
          .then(() => {
            resolve($asTable.showValidTooltip(params));
          });
      });
    };

    /**
     * 根据 msgMode 截取校验结果
     */
    const handleErrMsgMode = (
      validErrMaps: Record<
        string,
        { column: any; content: any; row: any; rule: any }
      >,
    ) => {
      const validOpts = computeValidOpts.value;
      if (validOpts.msgMode === 'single') {
        const keys = Object.keys(validErrMaps);
        const resMaps: Record<
          string,
          { column: any; content: any; row: any; rule: any }
        > = {};
        const firstKey = keys[0];
        const firstVal = firstKey ? validErrMaps[firstKey] : undefined;
        if (firstKey && firstVal) {
          resMaps[firstKey] = firstVal;
        }
        return resMaps;
      }
      return validErrMaps;
    };

    /**
     * 校验表格数据
     * 不传数据时只校验新增/修改的数据；传 true 校验当前表格数据；传 row/rows 校验指定行
     * 返回 Promise，或者使用回调
     */
    const beginValidate = (
      rows: any,
      cols: AsTableDefines.ColumnInfo[] | null,
      cb: any,
      isFull?: boolean,
    ): Promise<any> => {
      const validRest: Record<string, any[]> = {};
      const { editRules, treeConfig } = props;
      const { isRowGroupStatus } = reactData;
      const { afterFullData, pendingRowMaps, removeRowMaps } = internalData;
      const treeOpts = computeTreeOpts.value as any;
      const aggregateOpts = computeAggregateOpts.value as any;
      const validOpts = computeValidOpts.value;
      let validList: any[] | undefined;
      if (rows === true) {
        validList = afterFullData;
      } else if (rows) {
        if (isFunction(rows)) {
          cb = rows;
        } else {
          validList = isArray(rows) ? rows : [rows];
        }
      }
      if (!validList) {
        validList = $asTable.getInsertRecords
          ? $asTable.getInsertRecords().concat($asTable.getUpdateRecords())
          : [];
      }

      const rowValidErrs: Promise<any>[] = [];
      internalData._lastCallTime = Date.now();
      // 快速校验时，一旦出现失败单元格就终止后续校验
      internalData.validRuleErr = false;
      $asTable.clearValidate();

      const validErrMaps: Record<
        string,
        { column: any; content: any; row: any; rule: any }
      > = {};

      if (editRules) {
        const columns = cols && cols.length > 0 ? cols : $asTable.getColumns();
        const handleVaild = (row: any) => {
          const rowid = getRowid($asTable, row);
          if (removeRowMaps[rowid]) {
            return;
          }
          if (pendingRowMaps[rowid]) {
            return;
          }
          if ($asTable.isAggregateRecord(row)) {
            return;
          }
          if (isFull || !internalData.validRuleErr) {
            const colVailds: Promise<any>[] = [];
            columns.forEach((column: any) => {
              const field = isString(column) ? column : column.field;
              if (!field) {
                return;
              }
              if (
                (isFull || !internalData.validRuleErr) &&
                get(editRules, field)
              ) {
                colVailds.push(
                  validatorPrivateMethods
                    .validCellRules('all', row, column)
                    .catch(({ rule, rules }: any) => {
                      const rest = {
                        rule,
                        rules,
                        rowIndex: $asTable.getRowIndex(row),
                        row,
                        columnIndex: $asTable.getColumnIndex(column),
                        column,
                        field,
                        $table: $asTable,
                      };
                      if (!validRest[field]) {
                        validRest[field] = [];
                      }
                      validErrMaps[`${getRowid($asTable, row)}:${column.id}`] =
                        {
                          column,
                          row,
                          rule,
                          content: rule.content,
                        };
                      validRest[field].push(rest);
                      if (!isFull) {
                        internalData.validRuleErr = true;
                        // oxlint-disable-next-line prefer-promise-reject-errors no-throw-literal
                        throw rest;
                      }
                    }),
                );
              }
            });
            rowValidErrs.push(Promise.all(colVailds));
          }
        };

        if (isRowGroupStatus) {
          eachTree(validList, handleVaild, {
            children: aggregateOpts.mapChildrenField,
          });
        } else if (treeConfig) {
          eachTree(validList, handleVaild, {
            children: treeOpts.children || treeOpts.childrenField,
          });
        } else {
          validList.forEach(handleVaild);
        }

        return Promise.all(rowValidErrs)
          .then(() => {
            const ruleProps = Object.keys(validRest);
            reactData.validErrorMaps = handleErrMsgMode(validErrMaps);
            return nextTick().then(() => {
              const firstProp = ruleProps[0];
              const firstRest = firstProp ? validRest[firstProp] : undefined;
              if (firstRest && firstRest.length > 0) {
                throw firstRest[0];
              }
              if (cb) {
                cb();
              }
            });
          })
          .catch((error) => {
            return new Promise<any>((resolve) => {
              const finish = () => {
                nextTick(() => {
                  if (cb) {
                    cb(validRest);
                  }
                  resolve(validRest);
                });
              };
              if (validOpts.autoPos === false) {
                finish();
                return;
              }
              const { row, column } = error;
              $asTable.scrollToRow(row, column).then(() => {
                error.cell = $asTable.getCellElement(row, column);
                scrollToView(error.cell);
                handleValidError(error).then(finish);
              });
            });
          });
      } else {
        reactData.validErrorMaps = {};
      }
      return nextTick().then(() => {
        if (cb) {
          cb();
        }
      });
    };

    validatorMethods = {
      /**
       * 完整校验行，会校验有效数据中的每一行
       */
      fullValidate(rows, cb) {
        return beginValidate(rows, null, cb, true);
      },
      /**
       * 快速校验行，出现失败后不再继续校验（异步校验除外）
       */
      validate(rows, cb) {
        return beginValidate(rows, null, cb);
      },
      /**
       * 完整校验单元格
       */
      fullValidateField(rows, fieldOrColumn) {
        const colList = (
          isArray(fieldOrColumn)
            ? fieldOrColumn
            : fieldOrColumn
              ? [fieldOrColumn]
              : []
        )
          .map((column: any) => handleFieldOrColumn($asTable, column))
          .filter(Boolean) as AsTableDefines.ColumnInfo[];
        if (colList.length > 0) {
          return beginValidate(rows, colList, null, true);
        }
        return nextTick();
      },
      /**
       * 快速校验单元格
       */
      validateField(rows, fieldOrColumn) {
        const colList = (
          isArray(fieldOrColumn)
            ? fieldOrColumn
            : fieldOrColumn
              ? [fieldOrColumn]
              : []
        )
          .map((column: any) => handleFieldOrColumn($asTable, column))
          .filter(Boolean) as AsTableDefines.ColumnInfo[];
        if (colList.length > 0) {
          return beginValidate(rows, colList, null);
        }
        return nextTick();
      },
      /**
       * 清除校验结果
       */
      clearValidate(rows, fieldOrColumn) {
        const { validErrorMaps } = reactData;
        const validTip = refValidTooltip.value;
        const validOpts = computeValidOpts.value;
        const rowList = isArray(rows) ? rows : rows ? [rows] : [];
        const colList = (
          isArray(fieldOrColumn)
            ? fieldOrColumn
            : fieldOrColumn
              ? [fieldOrColumn]
              : []
        )
          .map((column: any) => handleFieldOrColumn($asTable, column))
          .filter(Boolean) as AsTableDefines.ColumnInfo[];
        if (validTip && validTip.reactData.visible) {
          validTip.close();
        }
        if (validOpts.msgMode === 'single') {
          reactData.validErrorMaps = {};
          return nextTick();
        }
        let validErrMaps: Record<string, any> = {};
        if (rowList.length > 0 && colList.length > 0) {
          validErrMaps = Object.assign({}, validErrorMaps);
          rowList.forEach((row: any) => {
            colList.forEach((column) => {
              const validKey = `${getRowid($asTable, row)}:${column.id}`;
              if (validErrMaps[validKey]) {
                delete validErrMaps[validKey];
              }
            });
          });
        } else if (rowList.length > 0) {
          const rowIdList = new Set(
            rowList.map((row: any) => `${getRowid($asTable, row)}`),
          );
          each(validErrorMaps, (item, key) => {
            if (rowIdList.has(`${key}`.split(':', 1)[0] ?? '')) {
              validErrMaps[`${key}`] = item;
            }
          });
        } else if (colList.length > 0) {
          const colIdList = new Set(colList.map((column) => `${column.id}`));
          each(validErrorMaps, (item, key) => {
            if (colIdList.has(`${key}`.split(':', 2)[1] ?? '')) {
              validErrMaps[`${key}`] = item;
            }
          });
        }
        reactData.validErrorMaps = validErrMaps;
        return nextTick();
      },
    };

    validatorPrivateMethods = {
      /**
       * 校验单元格
       * 按规则顺序依次校验，异步校验会等待完成后再继续
       */
      validCellRules(validType, row, column, val) {
        const { editRules } = props;
        const { field } = column;
        const errorRules: Rule[] = [];
        const syncValidList: Promise<any>[] = [];
        if (field && editRules) {
          // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
          const rules = (column as any).rules
            ? (column as any).rules
            : get(editRules, field);
          if (rules) {
            const cellValue = isUndefined(val) ? get(row, field) : val;
            (rules as any[]).forEach((rule: any) => {
              const { trigger, validator } = rule;
              if (validType === 'all' || !trigger || validType === trigger) {
                if (validator) {
                  const validParams = {
                    cellValue,
                    rule,
                    rules,
                    row,
                    rowIndex: $asTable.getRowIndex(row),
                    column,
                    columnIndex: $asTable.getColumnIndex(column),
                    field: column.field,
                    $table: $asTable,
                  };
                  let customValid: any;
                  if (isString(validator)) {
                    // 仓库没有全局校验器注册表，字符串形式的校验器无效
                    log.error('notValidators', [validator]);
                  } else {
                    customValid = validator(validParams);
                  }
                  if (customValid) {
                    if (customValid instanceof Error) {
                      internalData.validRuleErr = true;
                      errorRules.push(
                        new Rule({
                          content: customValid.message,
                          rule: new Rule(rule),
                          trigger,
                          type: 'custom',
                        }),
                      );
                    } else if (isFunction(customValid.catch)) {
                      // 异步校验并发执行，失败后统一进入 errorRules
                      syncValidList.push(
                        customValid.catch((error: any) => {
                          internalData.validRuleErr = true;
                          errorRules.push(
                            new Rule({
                              content:
                                error && error.message
                                  ? error.message
                                  : rule.content || rule.message,
                              rule: new Rule(rule),
                              trigger,
                              type: 'custom',
                            }),
                          );
                        }),
                      );
                    }
                  }
                } else if (!checkRuleStatus(rule, row, cellValue)) {
                  internalData.validRuleErr = true;
                  errorRules.push(new Rule(rule));
                }
              }
            });
          }
        }
        return Promise.all(syncValidList).then(() => {
          if (errorRules.length > 0) {
            // oxlint-disable-next-line prefer-promise-reject-errors no-throw-literal
            throw {
              rule: errorRules[0],
              rules: errorRules,
            };
          }
        });
      },
      /**
       * 判断单元格是否存在可触发的校验规则
       */
      hasCellRules(type, _row, column) {
        const { editRules } = props;
        const { field } = column;
        if (field && editRules) {
          // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
          const rules = (column as any).rules
            ? (column as any).rules
            : get(editRules, field);
          return !!(
            rules &&
            (rules as any[]).some(
              (rule: any) =>
                type === 'all' || !rule.trigger || type === rule.trigger,
            )
          );
        }
        return false;
      },
      /**
       * 触发当前编辑单元格的校验
       */
      triggerValidate(type) {
        const { editConfig, editRules } = props;
        const { editStore } = reactData;
        const { actived } = editStore;
        const editOpts = computeEditOpts.value;
        const validOpts = computeValidOpts.value;
        if (editRules && validOpts.msgMode === 'single') {
          reactData.validErrorMaps = {};
        }
        if (editConfig && editRules && actived.row) {
          const { row, column, cell } = actived.args as any;
          if ($asTable.hasCellRules(type, row, column)) {
            return $asTable
              .validCellRules(type, row, column)
              .then(() => {
                if (editOpts.mode === 'row') {
                  validatorMethods.clearValidate(row, column);
                }
              })
              .catch(({ rule }: any) => {
                // 只有触发方式一致时才聚焦并提示
                if (!rule.trigger || type === rule.trigger) {
                  const rest = { rule, row, column, cell };
                  $asTable.showValidTooltip(rest);
                  // oxlint-disable-next-line prefer-promise-reject-errors no-throw-literal
                  throw rest;
                }
                // oxlint-disable-next-line no-useless-return
                return;
              });
          }
        }
        return Promise.resolve();
      },
      /**
       * 弹出校验错误提示
       */
      showValidTooltip(params) {
        const { height } = props;
        const { tableData, validStore, validErrorMaps } = reactData;
        const { rule, row, column, cell } = params;
        const validOpts = computeValidOpts.value;
        const validTip = refValidTooltip.value;
        const content = rule.content;
        const validKey = `${getRowid($asTable, row)}:${column.id}`;
        validStore.visible = true;
        reactData.validErrorMaps =
          validOpts.msgMode === 'single'
            ? {
                [validKey]: {
                  column,
                  content,
                  row,
                  rule,
                },
              }
            : Object.assign({}, validErrorMaps, {
                [validKey]: {
                  column,
                  content,
                  row,
                  rule,
                },
              });
        $asTable.dispatchEvent('valid-error', params, null);
        if (
          validTip &&
          (validOpts.message === 'tooltip' ||
            (validOpts.message === 'default' &&
              !height &&
              tableData.length < 2))
        ) {
          return validTip.open(cell, content);
        }
        return nextTick();
      },
    };

    return { ...validatorMethods, ...validatorPrivateMethods };
  },
});

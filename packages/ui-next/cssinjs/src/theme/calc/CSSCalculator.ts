/**
 * @file CSS calc 计算器，将链式算术操作拼接为 CSS `calc()` 表达式字符串
 */

import { isNumber } from '@arvin-studio/kit';

import AbstractCalculator from './calculator';

/**
 * 占位符字符串，在构建表达式时暂时代替 `px` 单位。
 * 最终调用 `equal()` 时根据 `unitlessCssVar` 判断是否替换为 `px` 或移除。
 */
const CALC_UNIT = 'CALC_UNIT';

const regexp = new RegExp(CALC_UNIT, 'g');

/**
 * 将数字值包装为带 `CALC_UNIT` 占位符的字符串，字符串值直接返回。
 * @param value - 数字或字符串（CSS 变量等）
 * @returns 带占位符单位的字符串
 */
function unit(value: number | string) {
  if (isNumber(value)) {
    return `${value}${CALC_UNIT}`;
  }
  return value;
}

/**
 * CSS 计算器，构造 CSS `calc()` 表达式字符串。
 * 支持链式四则运算，内部自动处理运算符优先级（加减为低优先级，乘除为高优先级）。
 * 最终通过 `equal()` 输出带或不带 `px` 单位的 `calc()` 字符串。
 * @class
 * @example
 * const calc = new CSSCalculator(10, new Set());
 * calc.add(5).mul(2).equal(); // => 'calc((10px + 5px) * 2)'
 */
export default class CSSCalculator extends AbstractCalculator {
  /**
   * 当前运算是否为低优先级（加减），用于后续乘除时添加括号。
   * `undefined` 表示尚未进行任何运算。
   */
  lowPriority?: boolean;

  /** 当前构建的表达式字符串 */
  result: string = '';

  /** 无单位的 CSS 变量名集合，遇到这些变量时不追加 `px` 单位 */
  unitlessCssVar: Set<string>;

  /**
   * @param num - 初始值，可以是数字、字符串或另一个 CSSCalculator 实例
   * @param unitlessCssVar - 无单位的 CSS 变量名集合
   */
  constructor(
    num: AbstractCalculator | number | string,
    unitlessCssVar: Set<string>,
  ) {
    super();

    const numType = typeof num;

    this.unitlessCssVar = unitlessCssVar;

    if (num instanceof CSSCalculator) {
      this.result = `(${num.result})`;
    } else if (isNumber(num)) {
      this.result = unit(num);
    } else if (numType === 'string') {
      this.result = num as string;
    }
  }

  /**
   * 加法运算，拼接 `+` 表达式并将当前运算标记为低优先级。
   * @param num - 被加数
   * @returns 当前实例，支持链式调用
   */
  add(num: AbstractCalculator | number | string): this {
    if (num instanceof CSSCalculator) {
      this.result = `${this.result} + ${num.getResult()}`;
    } else if (typeof num === 'number' || typeof num === 'string') {
      this.result = `${this.result} + ${unit(num)}`;
    }
    this.lowPriority = true;
    return this;
  }

  /**
   * 除法运算，拼接 `/` 表达式。
   * 前置运算为低优先级（加减）时自动加括号以保持正确的运算顺序。
   * @param num - 除数
   * @returns 当前实例，支持链式调用
   */
  div(num: AbstractCalculator | number | string): this {
    if (this.lowPriority) {
      this.result = `(${this.result})`;
    }
    if (num instanceof CSSCalculator) {
      this.result = `${this.result} / ${num.getResult(true)}`;
    } else if (typeof num === 'number' || typeof num === 'string') {
      this.result = `${this.result} / ${num}`;
    }
    this.lowPriority = false;
    return this;
  }

  /**
   * 输出最终计算结果，将占位符 `CALC_UNIT` 替换为 `px` 或空字符串。
   * 如果最终的表达式是低优先级运算，则用 `calc()` 包裹。
   * @param options - 可选配置
   * @param options.unit - 是否强制追加 `px` 单位，不传时根据 `unitlessCssVar` 自动判断
   * @returns CSS calc 表达式或普通 CSS 值字符串
   */
  equal(options?: { unit?: boolean }): string {
    const { unit: cssUnit } = options || {};

    let mergedUnit: boolean = true;
    if (typeof cssUnit === 'boolean') {
      mergedUnit = cssUnit;
    } else if (
      Array.from(this.unitlessCssVar).some((cssVar) =>
        this.result.includes(cssVar),
      )
    ) {
      // 表达式中引用了无单位 CSS 变量时，不追加 px 以避免非法值
      mergedUnit = false;
    }

    this.result = this.result.replaceAll(regexp, mergedUnit ? 'px' : '');
    if (this.lowPriority !== undefined) {
      return `calc(${this.result})`;
    }
    return this.result;
  }

  /**
   * 获取当前的表达式字符串，低优先级时自动加括号。
   * @param force - 是否强制加括号
   * @returns 表达式片段
   */
  getResult(force?: boolean): string {
    return this.lowPriority || force ? `(${this.result})` : this.result;
  }

  /**
   * 乘法运算，拼接 `*` 表达式。
   * 前置运算为低优先级（加减）时自动加括号以保持正确的运算顺序。
   * @param num - 乘数
   * @returns 当前实例，支持链式调用
   */
  mul(num: AbstractCalculator | number | string): this {
    if (this.lowPriority) {
      this.result = `(${this.result})`;
    }
    if (num instanceof CSSCalculator) {
      this.result = `${this.result} * ${num.getResult(true)}`;
    } else if (typeof num === 'number' || typeof num === 'string') {
      this.result = `${this.result} * ${num}`;
    }
    this.lowPriority = false;
    return this;
  }

  /**
   * 减法运算，拼接 `-` 表达式并将当前运算标记为低优先级。
   * @param num - 减数
   * @returns 当前实例，支持链式调用
   */
  sub(num: AbstractCalculator | number | string): this {
    if (num instanceof CSSCalculator) {
      this.result = `${this.result} - ${num.getResult()}`;
    } else if (typeof num === 'number' || typeof num === 'string') {
      this.result = `${this.result} - ${unit(num)}`;
    }
    this.lowPriority = true;
    return this;
  }
}

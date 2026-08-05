/**
 * @file 数值计算器，在 JS 侧直接进行链式四则运算，生成数值结果
 */

import AbstractCalculator from './calculator';

/**
 * 数值计算器，基于 JavaScript 原生算术直接计算数值结果。
 * 用于在编译时或运行时直接获取计算结果，而非生成 CSS `calc()` 表达式。
 * 不处理字符串类型的输入（遇到则忽略）。
 * @class
 * @example
 * const calc = new NumCalculator(10);
 * calc.add(5).mul(2).equal(); // => 30
 */
export default class NumCalculator extends AbstractCalculator {
  /** 当前计算结果 */
  result: number = 0;

  /**
   * @param num - 初始值，仅处理 NumCalculator 实例和数字类型
   */
  constructor(num: AbstractCalculator | number | string) {
    super();
    if (num instanceof NumCalculator) {
      this.result = num.result;
    } else if (typeof num === 'number') {
      this.result = num;
    }
  }

  /**
   * 加法运算。
   * @param num - 被加数
   * @returns 当前实例，支持链式调用
   */
  add(num: AbstractCalculator | number | string): this {
    if (num instanceof NumCalculator) {
      this.result += num.result;
    } else if (typeof num === 'number') {
      this.result += num;
    }
    return this;
  }

  /**
   * 除法运算。
   * @param num - 除数
   * @returns 当前实例，支持链式调用
   */
  div(num: AbstractCalculator | number | string): this {
    if (num instanceof NumCalculator) {
      this.result /= num.result;
    } else if (typeof num === 'number') {
      this.result /= num;
    }
    return this;
  }

  /**
   * 获取最终计算结果。
   * @returns 当前数值
   */
  equal(): number {
    return this.result;
  }

  /**
   * 乘法运算。
   * @param num - 乘数
   * @returns 当前实例，支持链式调用
   */
  mul(num: AbstractCalculator | number | string): this {
    if (num instanceof NumCalculator) {
      this.result *= num.result;
    } else if (typeof num === 'number') {
      this.result *= num;
    }
    return this;
  }

  /**
   * 减法运算。
   * @param num - 减数
   * @returns 当前实例，支持链式调用
   */
  sub(num: AbstractCalculator | number | string): this {
    if (num instanceof NumCalculator) {
      this.result -= num.result;
    } else if (typeof num === 'number') {
      this.result -= num;
    }
    return this;
  }
}

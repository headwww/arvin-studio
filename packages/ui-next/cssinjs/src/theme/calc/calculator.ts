/**
 * @file 抽象计算器基类，定义链式算术运算的统一接口
 */

/**
 * 抽象计算器，提供 `add`、`sub`、`mul`、`div` 四则运算的链式调用接口。
 * 子类需实现具体的运算逻辑和 `equal` 求值方法。
 * CSSCalculator 生成 CSS `calc()` 字符串，NumCalculator 直接计算数值。
 * @abstract
 * @class
 */
abstract class AbstractCalculator {
  /**
   * 计算两数的和。
   * @param num - 被加数，可以是数字、字符串或另一个计算器实例
   * @returns 当前计算器实例，支持链式调用
   */
  abstract add(num: AbstractCalculator | number | string): this;

  /**
   * 计算两数的商。
   * @param num - 除数，可以是数字、字符串或另一个计算器实例
   * @returns 当前计算器实例，支持链式调用
   */
  abstract div(num: AbstractCalculator | number | string): this;

  /**
   * 获取最终计算结果。
   * @param options - 可选配置
   * @param options.unit - 是否追加单位（仅 CSSCalculator 使用），默认根据 `unitlessCssVar` 判断
   * @returns 计算结果，CSSCalculator 返回字符串，NumCalculator 返回数字
   */
  abstract equal(options?: { unit?: boolean }): number | string;

  /**
   * 计算两数的积。
   * @param num - 乘数，可以是数字、字符串或另一个计算器实例
   * @returns 当前计算器实例，支持链式调用
   */
  abstract mul(num: AbstractCalculator | number | string): this;

  /**
   * 计算两数的差。
   * @param num - 减数，可以是数字、字符串或另一个计算器实例
   * @returns 当前计算器实例，支持链式调用
   */
  abstract sub(num: AbstractCalculator | number | string): this;
}

export default AbstractCalculator;

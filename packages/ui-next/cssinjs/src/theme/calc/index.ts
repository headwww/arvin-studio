/**
 * @file 计算器工厂模块，根据类型（CSS 或 JS）创建对应的链式计算器实例
 */

import type AbstractCalculator from './calculator';

import CSSCalculator from './CSSCalculator';
import NumCalculator from './NumCalculator';

/**
 * 创建计算器工厂函数，根据 `type` 返回 CSSCalculator 或 NumCalculator 的构造函数。
 * CSSCalculator 生成 `calc()` 表达式字符串，NumCalculator 直接计算数值结果。
 * @param type - 计算器类型，`css` 生成 CSS calc 表达式，`js` 直接计算数值
 * @param unitlessCssVar - 无单位的 CSS 变量名集合，CSSCalculator 遇到这些变量时不追加 `px` 单位
 * @returns 工厂函数，调用后返回对应类型的计算器实例
 */
function genCalc(type: 'css' | 'js', unitlessCssVar: Set<string>) {
  const Calculator = type === 'css' ? CSSCalculator : NumCalculator;

  return (num: AbstractCalculator | number | string) =>
    new Calculator(num, unitlessCssVar);
}

export default genCalc;

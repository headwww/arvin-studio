import type { DerivativeFunc, TokenType } from './interface';

import Theme from './Theme';
import ThemeCache from './ThemeCache';

/**
 * 模块级全局缓存，所有通过 createTheme 创建的主题实例都存在这里。
 * 模块单例：整个应用共享同一个 ThemeCache 实例。
 */
const cacheThemes = new ThemeCache();

/**
 * 创建主题实例的工厂函数，是使用 Theme 的推荐入口。
 *
 * 与直接 new Theme() 的区别：
 * - new Theme()：每次调用都创建一个新实例，即使派生函数完全相同
 * - createTheme()：相同的派生函数数组复用同一个实例，避免重复创建
 *
 * "相同"的判定标准是函数引用相等（===），
 * 因此派生函数应定义在模块作用域或稳定的变量中，不要在渲染函数里内联创建。
 *
 * @example
 * // ✅ 函数引用稳定，两次调用返回同一个 Theme 实例
 * const theme1 = createTheme(colorDerivative)
 * const theme2 = createTheme(colorDerivative)
 * console.log(theme1 === theme2)  // true
 *
 * // ❌ 每次渲染都创建新函数，引用不同，缓存永远未命中
 * const theme = createTheme((token) => ({ ...token }))
 *
 * @param derivatives 派生函数，或派生函数数组（多个时按顺序链式执行）
 * @returns 对应的 Theme 实例（命中缓存时返回已有实例，否则新建后返回）
 */
export default function createTheme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
>(
  derivatives:
    | DerivativeFunc<DesignToken, DerivativeToken>
    | DerivativeFunc<DesignToken, DerivativeToken>[],
) {
  // 统一转为数组，和 ThemeCache 的 key 格式保持一致
  const derivativeArr = Array.isArray(derivatives)
    ? derivatives
    : [derivatives];
  // 未命中缓存时才创建新实例，然后存入缓存
  if (!cacheThemes.has(derivativeArr)) {
    cacheThemes.set(derivativeArr, new Theme(derivativeArr));
  }

  // 从缓存中取出并返回，保证相同入参始终拿到同一个实例
  return cacheThemes.get(derivativeArr)!;
}

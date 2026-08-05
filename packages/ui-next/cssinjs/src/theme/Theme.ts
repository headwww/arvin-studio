import type { DerivativeFunc, TokenType } from './interface';

let uuid = 0;

/**
 * 主题类，持有一组"派生函数"，负责将设计 Token 转换为最终使用的派生 Token。
 *
 * 设计 Token（DesignToken）：原始设计变量，如基础色板、间距基数等
 * 派生 Token（DerivativeToken）：由设计 Token 计算得出的实际使用值，如组件级颜色、尺寸等
 *
 * 不建议直接 new Theme()，应使用 `createTheme()` 工厂函数，
 * 它会对相同配置的主题实例做缓存，避免重复创建。
 *
 * @example
 * const theme = new Theme((designToken) => ({
 *   ...designToken,
 *   colorPrimaryHover: lighten(designToken.colorPrimary),
 * }))
 *
 * theme.id  // 唯一数字 id，可用于缓存 key
 * theme.getDerivativeToken(baseToken)  // 传入设计 Token，得到派生 Token
 */
export default class Theme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> {
  public readonly id: number;
  // eslint-disable-next-line unicorn/consistent-class-member-order
  private derivatives: DerivativeFunc<DesignToken, DerivativeToken>[];

  constructor(
    derivatives:
      | DerivativeFunc<DesignToken, DerivativeToken>
      | DerivativeFunc<DesignToken, DerivativeToken>[],
  ) {
    this.derivatives = Array.isArray(derivatives) ? derivatives : [derivatives];
    this.id = uuid;

    if (derivatives.length === 0) {
      console.warn(
        derivatives.length > 0,
        '[AS CSS-in-JS] Theme should have at least one derivative function.',
      );
    }

    uuid += 1;
  }

  getDerivativeToken(token: DesignToken): DerivativeToken {
    return this.derivatives.reduce<DerivativeToken>(
      (result, derivative) => derivative(token, result),
      undefined as any,
    );
  }
}

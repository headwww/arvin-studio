/**
 * Token 的基础约束类型，要求必须是一个对象。
 * DesignToken 和 DerivativeToken 都必须满足这个约束。
 */
export type TokenType = object;

/**
 * 派生函数类型：接收设计 Token 和上一步的派生 Token（可选），返回新的派生 Token。
 *
 * @param designToken   原始设计 Token，整个链式过程中始终不变
 * @param derivativeToken 上一个派生函数的输出结果，第一个函数调用时为 undefined
 * @returns 本次派生计算的结果，会作为下一个函数的 derivativeToken 入参
 *
 * @example
 * const myDerivative: DerivativeFunc<DesignToken, DerivativeToken> = (
 *   designToken,
 *   derivativeToken,
 * ) => ({
 *   ...derivativeToken,
 *   colorPrimaryHover: lighten(designToken.colorPrimary, 10),
 * })
 */
export type DerivativeFunc<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = (
  designToken: DesignToken,
  derivativeToken?: DerivativeToken,
) => DerivativeToken;

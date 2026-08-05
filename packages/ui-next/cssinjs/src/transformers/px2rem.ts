/**
 * @file px 转 rem 转换器，将 CSS 属性中的 px 值按根字体大小换算为 rem
 */

import type { CSSObject } from '..';
import type { Transformer } from './interface';

import unitless from '@emotion/unitless';

/**
 * px2rem 转换器的配置选项。
 * @interface
 */
interface Options {
  /**
   * 是否转换媒体查询中的 px 值。
   * @default false
   */
  mediaQuery?: boolean;
  /**
   * rem 值保留的小数位数。
   * @default 5
   */
  precision?: number;
  /**
   * 根字体大小（1rem = ?px）。
   * @default 16
   */
  rootValue?: number;
}

/**
 * 匹配 CSS 值中的 px 数字，同时跳过 `url()` 和 `var()` 内的 px。
 * 捕获组 `$1` 为纯数字部分，未匹配到数字时 $1 为空字符串。
 */
const pxRegex = /url\([^)]+\)|var\([^)]+\)|(\d+(?:\.\d+)?|\.\d+)px/g;

/**
 * 按指定精度对数字进行舍入处理。
 * 例如 `toFixed(1.23456, 3)` → `1.235`。
 * @param number - 原始数值
 * @param precision - 保留的小数位数
 * @returns 舍入后的数值
 */
function toFixed(number: number, precision: number) {
  const multiplier = 10 ** (precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

/**
 * 创建 px → rem 转换器。
 * 遍历 CSSObject 的所有属性，将 px 值按 `rootValue` 换算为 rem。
 * 数值类型的属性自动补 `px` 后缀后再转换。
 * @param options - 转换选项
 * @returns Transformer 实例，包含 `visit` 方法供解析器调用
 */
function transform(options: Options = {}): Transformer {
  const { rootValue = 16, precision = 5, mediaQuery = false } = options;

  /**
   * 单个 px 值的替换函数，用于 `String.replaceAll`。
   * 跳过 `url()` / `var()`（$1 为空）以及 ≤1px 的值（视为细线边框，不转换）。
   * @param m - 完整匹配字符串
   * @param $1 - 捕获的数字部分
   * @returns 转换后的 rem 字符串或原样返回
   */
  const pxReplace = (m: string, $1: any) => {
    if (!$1) return m;
    const pixels = Number.parseFloat($1);
    // ≤1px 不转换，保留为物理像素（常用于 1px 边框、hairline 等场景）
    if (pixels <= 1) return m;
    const fixedVal = toFixed(pixels / rootValue, precision);
    return `${fixedVal}rem`;
  };

  /**
   * 遍历 CSSObject，转换其中所有 px 值。
   * @param cssObj - 原始样式对象
   * @returns 转换后的新样式对象（浅拷贝）
   */
  const visit = (cssObj: CSSObject): CSSObject => {
    const clone: CSSObject = { ...cssObj };

    Object.entries(cssObj).forEach(([key, value]) => {
      // 字符串值：直接替换其中的 px → rem
      if (typeof value === 'string' && value.includes('px')) {
        const newValue = value.replaceAll(pxRegex, pxReplace);
        clone[key] = newValue;
      }

      // 纯数字值（且不在无单位属性黑名单中、非零）：自动补 px 后再转换
      if (!unitless[key] && typeof value === 'number' && value !== 0) {
        clone[key] = `${value}px`.replaceAll(pxRegex, pxReplace);
      }

      // 媒体查询 key：仅在 `mediaQuery` 开启时转换（如 `@media (max-width: 768px)`）
      const mergedKey = key.trim();
      if (mergedKey.startsWith('@') && mergedKey.includes('px') && mediaQuery) {
        const newKey = key.replaceAll(pxRegex, pxReplace);

        clone[newKey] = clone[key];
        delete clone[key];
      }
    });

    return clone;
  };

  return { visit };
}

export default transform;

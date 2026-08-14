/**
 * @file 颜色选择器专用 Color 类，在 FastColor 基础上扩展 HSB 颜色空间支持
 */

import type { ColorInput, HSV } from '../util/FastColor/types';
import type { ColorGenInput, HSB } from './interface';

import { FastColor } from '../util';

/**
 * 数值四舍五入取整，null/undefined/NaN 统一处理为 0。
 */
export const getRoundNumber = (value: number) =>
  Math.round((value || 0) satisfies number);

/**
 * 将 HSB 颜色转换为 FastColor 支持的 HSV 格式。
 *
 * HSB 与 HSV 是同一颜色模型，只是亮度通道命名不同：
 * - HSB 用 `b`（Brightness）
 * - HSV 用 `v`（Value）
 *
 * 处理三种输入：
 * 1. FastColor 实例 → 原样返回
 * 2. 含 `h` 和 `b` 字段的对象 → 把 `b` 改名为 `v`
 * 3. `hsb(...)` 字符串 → 替换为 `hsv(...)`
 */
function convertHsb2Hsv(color: ColorGenInput): ColorInput {
  if (color instanceof FastColor) {
    return color;
  }

  if (color && typeof color === 'object' && 'h' in color && 'b' in color) {
    const { b, ...resets } = color as HSB;
    return {
      ...resets,
      v: b,
    } as HSV;
  }
  if (typeof color === 'string' && /hsb/.test(color)) {
    return color.replace(/hsb/, 'hsv');
  }
  return color as ColorInput;
}

/**
 * 颜色选择器专用颜色类，继承 FastColor 并补充 HSB 输出能力。
 *
 * FastColor 内部使用 RGB/HSL/HSV，而颜色选择器（ColorPicker）以 HSB 为
 * 标准颜色模型。此类在构造时把 HSB 输入转成 HSV，并提供 HSB 输出方法。
 */
export class Color extends FastColor {
  constructor(color: ColorGenInput) {
    super(convertHsb2Hsv(color));
  }

  /**
   * 输出 HSB 对象。
   * 把 FastColor 的 HSV 结果中的 `v` 改回 `b`，并补上 alpha 通道。
   */
  toHsb() {
    const { v, ...resets } = this.toHsv();
    return {
      ...resets,
      b: v,
      a: this.a,
    };
  }

  /**
   * 输出 HSB 字符串。
   * - alpha === 1 → `hsb(h, s%, b%)`
   * - alpha < 1   → `hsba(h, s%, b%, a)`
   *
   * 饱和度和亮度转为百分比，透明度保留最多 2 位小数（alpha 为 0 时不保留小数）。
   */
  toHsbString() {
    const hsb = this.toHsb();
    const saturation = getRoundNumber(hsb.s * 100);
    const lightness = getRoundNumber(hsb.b * 100);
    const hue = getRoundNumber(hsb.h);
    const alpha = hsb.a;
    const hsbString = `hsb(${hue}, ${saturation}%, ${lightness}%)`;
    const hsbaString = `hsba(${hue}, ${saturation}%, ${lightness}%, ${alpha.toFixed(
      alpha === 0 ? 0 : 2,
    )})`;
    return alpha === 1 ? hsbString : hsbaString;
  }
}

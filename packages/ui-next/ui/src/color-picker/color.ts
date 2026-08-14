/**
 * @file 颜色选择器的聚合颜色类，支持单色与渐变色两种形态
 */

import type { ColorGenInput, Colors } from './interface';

import { Color as VcColor } from '@arvin-studio/headless';

/**
 * 将颜色字符串格式化为纯十六进制（去掉 # 前缀及非法字符）。
 *
 * @param value - 颜色字符串，如 `#ff0000`、`#ff000080`
 * @param alpha - 是否保留 alpha 通道（true → 8 位，false → 6 位）
 *
 * @example
 * toHexFormat('#ff0000')          // → 'ff0000'
 * toHexFormat('#ff000080', true)  // → 'ff000080'（保留 alpha）
 * toHexFormat('#ff000080', false) // → 'ff0000'（截断 alpha）
 */
export function toHexFormat(value?: string, alpha?: boolean) {
  return value?.replaceAll(/[^0-9a-f]/gi, '').slice(0, alpha ? 8 : 6) || '';
}

/** 提取颜色的十六进制字符串，空值返回空字符串 */
export const getHex = (value?: string, alpha?: boolean) =>
  value ? toHexFormat(value, alpha) : '';

/** 渐变色的定义：一组颜色节点，每个节点有颜色值和百分比位置 */
export type GradientColor = {
  color: AggregationColor;
  percent: number;
}[];

/**
 * 聚合颜色类，是颜色选择器的核心数据模型。
 *
 * 它能表示两种形态：
 * 1. 单色 —— 内部用一个 VcColor（FastColor）存储
 * 2. 渐变色 —— 内部用 GradientColor 数组存储多个颜色节点
 *
 * 通过统一的 API 屏蔽单色/渐变的差异，向上层提供 toHex/toRgb/toHsb 等转换。
 * 同时支持被"清空"（cleared）状态，表示用户清除了颜色选择。
 */
export class AggregationColor {
  /** 是否已被清空（用户清除了颜色） */
  public cleared = false;

  /** 渐变颜色节点数组（单色时为 undefined） */
  // eslint-disable-next-line unicorn/consistent-class-member-order
  private colors: GradientColor | undefined;

  /** 底层的原始颜色对象（单色时即实际颜色，渐变时代表第一个节点） */
  private metaColor: VcColor;

  constructor(
    color: ColorGenInput<AggregationColor> | Colors<AggregationColor>,
  ) {
    // 从另一个 AggregationColor 克隆
    if (color instanceof AggregationColor) {
      this.metaColor = color.metaColor.clone();
      this.colors = color.colors?.map((info) => ({
        color: new AggregationColor(info.color),
        percent: info.percent,
      }));
      this.cleared = color.cleared;
      return;
    }

    const isArray = Array.isArray(color);

    if (isArray && color.length > 0) {
      // 渐变色：数组中的每个节点递归包装为 AggregationColor
      this.colors = color.map(({ color: c, percent }) => ({
        color: new AggregationColor(c),
        percent,
      }));
      // metaColor 取第一个节点的颜色，作为渐变色的代表
      // @ts-expect-error this is fine
      this.metaColor = new VcColor(this?.colors[0].color.metaColor);
    } else {
      // 单色：直接用 VcColor 包装
      this.metaColor = new VcColor(isArray ? '' : color);
    }

    // 空值或空数组 → 透明色 + 标记为已清空
    if (!color || (isArray && !this.colors)) {
      this.metaColor = this.metaColor.setA(0);
      this.cleared = true;
    }
  }

  /**
   * 判断两个颜色是否相等。
   * 单色比较 hex 字符串，渐变比较每个节点的颜色和位置。
   */
  equals(color: AggregationColor | null): boolean {
    if (!color || this.isGradient() !== color.isGradient()) {
      return false;
    }

    if (!this.isGradient()) {
      return this.toHexString() === color.toHexString();
    }

    return (
      this.colors!.length === color.colors!.length &&
      this.colors!.every((c, i) => {
        const target = color.colors![i];
        return c.percent === target?.percent && c.color.equals(target.color);
      })
    );
  }

  /**
   * 获取颜色节点数组。
   * 单色时返回 `[{ color: this, percent: 0 }]`，渐变时返回实际节点数组。
   */
  getColors(): GradientColor {
    return this.colors || [{ color: this, percent: 0 }];
  }

  /** 是否为渐变色（有节点数组且未被清空） */
  isGradient(): boolean {
    return !!this.colors && !this.cleared;
  }

  /**
   * 输出 CSS 字符串。
   * 渐变 → `linear-gradient(90deg, rgb(...) 0%, rgb(...) 100%)`
   * 单色 → 直接返回 rgb 字符串
   */
  toCssString(): string {
    const { colors } = this;

    if (colors) {
      const colorsStr = colors
        .map((c) => `${c.color.toRgbString()} ${c.percent}%`)
        .join(', ');
      return `linear-gradient(90deg, ${colorsStr})`;
    }

    return this.metaColor.toRgbString();
  }

  /** 输出十六进制颜色（不含 # 前缀），alpha < 1 时保留 8 位 */
  toHex() {
    return getHex(this.toHexString(), this.metaColor.a < 1);
  }

  /** 输出带 # 前缀的十六进制字符串 */
  toHexString() {
    return this.metaColor.toHexString();
  }

  /** 输出 HSB 对象 */
  toHsb() {
    return this.metaColor.toHsb();
  }

  /** 输出 HSB 字符串 */
  toHsbString() {
    return this.metaColor.toHsbString();
  }

  /** 输出 RGB 对象 */
  toRgb() {
    return this.metaColor.toRgb();
  }

  /** 输出 RGB 字符串 */
  toRgbString() {
    return this.metaColor.toRgbString();
  }
}

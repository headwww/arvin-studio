/**
 * 预设颜色名称数组，包含所有内置的颜色主题名。
 * `as const` 将数组固定为字面量元组，使每个元素的类型是具体字符串而非宽泛的 string，
 * 后续类型推导依赖此约束。
 */
export const PresetColors = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
] as const;

/**
 * 所有预设颜色名的联合类型。
 * `(typeof PresetColors)[number]` 取数组所有数字索引对应的值类型：
 * 'blue' | 'purple' | 'cyan' | 'green' | 'magenta' | 'pink' |
 * 'red' | 'orange' | 'yellow' | 'volcano' | 'geekblue' | 'lime' | 'gold'
 */
export type PresetColorKey = (typeof PresetColors)[number];

/**
 * 预设颜色的基础对象类型，key 为所有颜色名，value 为对应的颜色值字符串。
 * 展开后等价于：
 * {
 *   blue: string
 *   purple: string
 *   cyan: string
 *   // ...共 13 个
 * }
 */
export type PresetColorType = Record<PresetColorKey, string>;

/**
 * 色阶索引，每种颜色有 10 个色阶，从 1（最浅）到 10（最深）。
 * 对应 As 色板体系：1-2 为浅色背景，5-6 为主色，8-10 为深色。
 */
type ColorPaletteKeyIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * 新版调色板类型，key 格式为 `${颜色名}${色阶}`（无连字符）。
 * 13 种颜色 × 10 个色阶 = 130 个属性。
 * 展开后等价于：
 * {
 *   blue1: string   blue2: string   ... blue10: string
 *   purple1: string purple2: string ... purple10: string
 *   // ...
 * }
 * 实际使用中会混入到 Token 对象里，组件通过 token.blue1 ~ token.blue10 获取具体色阶值。
 */
export type ColorPalettes = {
  [key in `${keyof PresetColorType}${ColorPaletteKeyIndex}`]: string;
};

/**
 * 间距尺寸判定工具（gapSize）
 *
 * 供 Space 等组件使用，把「间距尺寸」分成两类，对应两套渲染策略：
 * - 预设尺寸（small / middle / medium / large）：走 CSS 类名（如 -gap-row-small），
 *   由样式表映射到主题 token，零运行时样式生成；
 * - 自定义数值（number）：走内联 rowGap / columnGap。
 *
 * 两个函数都是类型守卫（is 谓词），在判定成立的同时把类型收窄：
 * isPresetSize → size is SizeType，isValidGapNumber → size is number。
 */
import type { SizeType } from '../config-provider/size-context';

/**
 * 是否为预设尺寸
 *
 * 注意同时兼容 'medium'（antd 的 medium 别名，与 middle 同值），
 * 使预设类名（-gap-row-medium 等）同样能匹配样式表。
 *
 * @param size 间距尺寸（预设字符串 / 任意字符串 / 数值）
 * @returns true 时为预设尺寸，类型收窄为 SizeType
 */
export function isPresetSize(
  size?: number | SizeType | string,
): size is SizeType {
  return ['large', 'medium', 'middle', 'small'].includes(size as string);
}

/**
 * 是否为有效的自定义数值间距
 *
 * 判定成立时才应写内联 gap 样式。刻意排除以下情况：
 * - undefined / null / 空串等 falsy 值；
 * - 数值 0：CSS gap 默认值本就是 0，传入 0 等价于不设置，直接忽略即可；
 * - NaN：非法的数值。
 *
 * @param size 间距尺寸（预设字符串 / 任意字符串 / 数值）
 * @returns true 时为有效数值，类型收窄为 number
 */
export function isValidGapNumber(
  size?: number | SizeType | string,
): size is number {
  if (!size) {
    // The case of size = 0 is deliberately excluded here, because the default value of the gap attribute in CSS is 0, so if the user passes 0 in, we can directly ignore it.
    return false;
  }
  return typeof size === 'number' && !Number.isNaN(size);
}

/**
 * @file 动画哈希检查器，检测 `animation` 属性中使用的哈希值名称，推荐改用 `animationName` + Keyframe 实例
 */

import type { Linter } from './interface';

import { lintWarning } from './utils';

/**
 * 检查 `animation` 属性值是否使用了 CSS-in-JS 生成的哈希动画名。
 * 哈希动画名在每次构建后可能变化，推荐使用 `animationName` 属性并传入 Keyframe 实例，
 * 让库自动处理名称映射。
 */
const linter: Linter = (key, value, info) => {
  if (key === 'animation' && info.hashId && value !== 'none') {
    lintWarning(
      `You seem to be using hashed animation '${value}', in which case 'animationName' with Keyframe as value is recommended.`,
      info,
    );
  }
};

export default linter;

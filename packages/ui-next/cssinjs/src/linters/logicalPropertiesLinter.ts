/**
 * @file RTL 兼容性 Linter，检查非逻辑属性/值的使用，提示改用逻辑属性以兼容 RTL 布局
 */

import type { Linter } from './interface';

import { lintWarning } from './utils';

/**
 * 检查 CSS 属性和值是否使用了非逻辑（物理方向）写法，这些写法在 RTL 模式下不会自动翻转。
 *
 * 检查项：
 * - **物理方向属性**：`left`、`right`、`marginLeft`、`borderLeft` 等 —— 应改用 `insetInlineStart` 等
 * - **物理圆角**：`borderRadius` 左右值不对称时 —— 应改用 `borderStartStartRadius` 等
 * - **简写属性左右不一致**：`margin: 1px 2px 3px 4px`（左右不等）—— 应拆分逻辑属性
 * - **物理方向值**：`textAlign: 'left'`、`clear: 'right'` —— 应改用 `start` / `end`
 */
const linter: Linter = (key, value, info) => {
  switch (key) {
    // 物理方向属性：在 RTL 下不会自动翻转
    case 'borderBottomLeftRadius':
    case 'borderBottomRightRadius':
    case 'borderLeft':
    case 'borderLeftColor':
    case 'borderLeftStyle':
    case 'borderLeftWidth':
    case 'borderRight':
    case 'borderRightColor':
    case 'borderRightStyle':
    case 'borderRightWidth':
    case 'borderTopLeftRadius':
    case 'borderTopRightRadius':
    case 'left':
    case 'marginLeft':
    case 'marginRight':
    case 'paddingLeft':
    case 'paddingRight':
    case 'right': {
      lintWarning(
        `You seem to be using non-logical property '${key}' which is not compatible with RTL mode. Please use logical properties and values instead. For more information: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties.`,
        info,
      );
      return;
    }
    // borderRadius 简写：检测左右值是否不对称
    case 'borderRadius': {
      if (typeof value === 'string') {
        const radiusGroups = value.split('/').map((item) => item.trim());
        const invalid = radiusGroups.reduce((result, group) => {
          if (result) {
            return result;
          }
          const radiusArr = group.split(' ').map((item) => item.trim());
          // borderRadius: '2px 4px' → 左右不等
          if (radiusArr.length >= 2 && radiusArr[0] !== radiusArr[1]) {
            return true;
          }
          // borderRadius: '4px 4px 2px' → 左右不等
          if (radiusArr.length === 3 && radiusArr[1] !== radiusArr[2]) {
            return true;
          }
          // borderRadius: '4px 4px 2px 4px' → 左右不等
          if (radiusArr.length === 4 && radiusArr[2] !== radiusArr[3]) {
            return true;
          }
          return result;
        }, false);

        if (invalid) {
          lintWarning(
            `You seem to be using non-logical value '${value}' of ${key}, which is not compatible with RTL mode. Please use logical properties and values instead. For more information: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties.`,
            info,
          );
        }
      }

      return;
    }
    // 四值简写属性：检测左右值是否不一致
    case 'borderStyle':
    case 'borderWidth':
    case 'margin':
    case 'padding': {
      if (typeof value === 'string') {
        const valueArr = value.split(' ').map((item) => item.trim());
        // 四值时第 2 个是右，第 4 个是左，两者不等说明左右不对称
        if (valueArr.length === 4 && valueArr[1] !== valueArr[3]) {
          lintWarning(
            `You seem to be using '${key}' property with different left ${key} and right ${key}, which is not compatible with RTL mode. Please use logical properties and values instead. For more information: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties.`,
            info,
          );
        }
      }
      return;
    }
    // 物理方向值：left/right 应改用 start/end
    case 'clear':
    case 'textAlign': {
      if (value === 'left' || value === 'right') {
        lintWarning(
          `You seem to be using non-logical value '${value}' of ${key}, which is not compatible with RTL mode. Please use logical properties and values instead. For more information: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties.`,
          info,
        );
      }
      return;
    }
    default:
  }
};

export default linter;

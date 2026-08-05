/**
 * @file CSS 逻辑属性转物理属性转换器，将 `margin-block`、`inset-inline` 等逻辑属性展开为
 * `marginTop`/`marginBottom`/`top`/`left` 等传统物理属性，兼容不支持逻辑属性的旧浏览器
 */

import type { CSSObject } from '..';
import type { Transformer } from './interface';

/**
 * 将 CSS 值字符串按空格分割为多个子值，同时检测 `!important`。
 * 分隔时会正确处理括号内的空格（如 `calc(1px + 2px)` 不会被拆分）。
 * @param value - 数字或字符串形式的 CSS 值
 * @returns 元组 `[values, important]`，values 为分割后的值数组，important 表示是否含 `!important`
 */
function splitValues(
  value: number | string,
): [values: (number | string)[], important: boolean] {
  if (typeof value === 'number') {
    return [[value], false];
  }

  const rawStyle = (value satisfies string).trim();
  const importantCells = rawStyle.match(/(.*)(!important)/);

  const splitStyle = (importantCells ? importantCells[1]! : rawStyle)
    .trim()
    .split(/\s+/);

  // 括号内的空格不应拆分，将带括号的片段重新合并
  let temp: string[] = [];
  let brackets = 0;
  return [
    splitStyle.reduce<string[]>((list, item) => {
      if (item.includes('(') || item.includes(')')) {
        const left = item.split('(').length - 1;
        const right = item.split(')').length - 1;
        brackets += left - right;
      }
      if (brackets >= 0) temp.push(item);
      if (brackets === 0) {
        list.push(temp.join(' '));
        temp = [];
      }
      return list;
    }, []),
    !!importantCells,
  ];
}

/**
 * 映射值类型，`string[]` 的增强版：数组元素为展开后对应的物理属性名。
 * `notSplit` 标记表示该属性值不拆分，所有展开的物理属性共享同一个完整值（如 border 系列）。
 */
type MatchValue = {
  /** 是否不拆分值，如 border 的宽度、样式、颜色必须整段复用 */
  notSplit?: boolean;
} & string[];

/**
 * 标记该映射值为"不拆分"模式，所有目标属性共享同一个完整值。
 * @param list - 逻辑属性到物理属性的映射数组
 * @returns 标记了 `notSplit` 的同一数组
 */
function noSplit(list: MatchValue): MatchValue {
  list.notSplit = true;
  return list;
}

/**
 * CSS 逻辑属性 → 物理属性的映射表。
 *
 * 逻辑属性按书写方向自适应（LTR/RTL/垂直文本），物理属性固定对应上下左右。
 * 这里将逻辑属性展开为纯物理属性，让不支持逻辑属性的浏览器也能正确渲染。
 *
 * `border*` 系列标记了 `notSplit`，因为 `border: 1px solid red` 的值不可拆分，
 * 必须作为整体复制到每个对应的物理属性上。
 */
const keyMap: Record<string, MatchValue> = {
  // Inset（定位偏移）
  inset: ['top', 'right', 'bottom', 'left'],
  insetBlock: ['top', 'bottom'],
  insetBlockStart: ['top'],
  insetBlockEnd: ['bottom'],
  insetInline: ['left', 'right'],
  insetInlineStart: ['left'],
  insetInlineEnd: ['right'],

  // Margin
  marginBlock: ['marginTop', 'marginBottom'],
  marginBlockStart: ['marginTop'],
  marginBlockEnd: ['marginBottom'],
  marginInline: ['marginLeft', 'marginRight'],
  marginInlineStart: ['marginLeft'],
  marginInlineEnd: ['marginRight'],

  // Padding
  paddingBlock: ['paddingTop', 'paddingBottom'],
  paddingBlockStart: ['paddingTop'],
  paddingBlockEnd: ['paddingBottom'],
  paddingInline: ['paddingLeft', 'paddingRight'],
  paddingInlineStart: ['paddingLeft'],
  paddingInlineEnd: ['paddingRight'],

  // Border（notSplit：宽度/样式/颜色不可拆分）
  borderBlock: noSplit(['borderTop', 'borderBottom']),
  borderBlockStart: noSplit(['borderTop']),
  borderBlockEnd: noSplit(['borderBottom']),
  borderInline: noSplit(['borderLeft', 'borderRight']),
  borderInlineStart: noSplit(['borderLeft']),
  borderInlineEnd: noSplit(['borderRight']),

  // Border width
  borderBlockWidth: ['borderTopWidth', 'borderBottomWidth'],
  borderBlockStartWidth: ['borderTopWidth'],
  borderBlockEndWidth: ['borderBottomWidth'],
  borderInlineWidth: ['borderLeftWidth', 'borderRightWidth'],
  borderInlineStartWidth: ['borderLeftWidth'],
  borderInlineEndWidth: ['borderRightWidth'],

  // Border style
  borderBlockStyle: ['borderTopStyle', 'borderBottomStyle'],
  borderBlockStartStyle: ['borderTopStyle'],
  borderBlockEndStyle: ['borderBottomStyle'],
  borderInlineStyle: ['borderLeftStyle', 'borderRightStyle'],
  borderInlineStartStyle: ['borderLeftStyle'],
  borderInlineEndStyle: ['borderRightStyle'],

  // Border color
  borderBlockColor: ['borderTopColor', 'borderBottomColor'],
  borderBlockStartColor: ['borderTopColor'],
  borderBlockEndColor: ['borderBottomColor'],
  borderInlineColor: ['borderLeftColor', 'borderRightColor'],
  borderInlineStartColor: ['borderLeftColor'],
  borderInlineEndColor: ['borderRightColor'],

  // Border radius
  borderStartStartRadius: ['borderTopLeftRadius'],
  borderStartEndRadius: ['borderTopRightRadius'],
  borderEndStartRadius: ['borderBottomLeftRadius'],
  borderEndEndRadius: ['borderBottomRightRadius'],
};

/**
 * 包装值和 `!important` 标记，用 `_skip_check_` 绕过后续 CSS 属性的类型检查。
 * @param value - CSS 属性值
 * @param important - 是否追加 `!important`
 * @returns 带 `_skip_check_` 标记的安全值对象
 */
function wrapImportantAndSkipCheck(value: number | string, important: boolean) {
  let parsedValue = value;

  if (important) {
    parsedValue += ` !important`;
  }

  return { _skip_check_: true, value: parsedValue };
}

/**
 * CSS 逻辑属性 → 物理属性转换器。
 *
 * 将 `margin-block-start` → `marginTop`、`inset-inline` → `left` & `right` 等。
 *
 * 值的分发规则：
 * - 1 个目标属性：如 `marginBlockStart` → `marginTop`，直接使用第一个值
 * - 2 个目标属性：如 `marginBlock` → `marginTop` & `marginBottom`，两值则一一对应，单值则复用
 * - 4 个目标属性：如 `inset` → `top` & `right` & `bottom` & `left`，按 CSS 简写规则分发
 * - `notSplit` 模式：如 `borderBlock`，完整值直接复制到每个目标属性，不拆分
 *
 * @example
 * // marginBlock: '10px 20px'  →  marginTop: '10px', marginBottom: '20px'
 * // marginInline: '8px'       →  marginLeft: '8px', marginRight: '8px'
 * // borderBlock: '1px solid'  →  borderTop: '1px solid', borderBottom: '1px solid'
 */
const transform: Transformer = {
  visit: (cssObj) => {
    const clone: CSSObject = {};

    Object.keys(cssObj).forEach((key) => {
      const value = cssObj[key];
      const matchValue = keyMap[key];

      if (
        matchValue &&
        (typeof value === 'number' || typeof value === 'string')
      ) {
        const [values, important] = splitValues(value);

        if (matchValue.length > 0 && matchValue.notSplit) {
          // notSplit 模式：完整值直接复制到每个目标属性（如 border 系列）
          matchValue.forEach((matchKey) => {
            clone[matchKey] = wrapImportantAndSkipCheck(value, important);
          });
        } else
          switch (matchValue.length) {
            case 1: {
              // 单目标：如 `marginBlockStart` → `marginTop`
              clone[matchValue[0]!] = wrapImportantAndSkipCheck(
                values[0]!,
                important,
              );

              break;
            }
            case 2: {
              // 双目标：如 `marginBlock` → `marginTop` & `marginBottom`，值不足时复用第一个
              matchValue.forEach((matchKey, index) => {
                clone[matchKey] = wrapImportantAndSkipCheck(
                  values[index] ?? values[0]!,
                  important,
                );
              });

              break;
            }
            case 4: {
              // 四目标：如 `inset` → `top` & `right` & `bottom` & `left`
              // 不足 4 个值时按 CSS 简写规则回退：第 3 个回退到第 1 个，第 4 个回退到第 2 个
              matchValue.forEach((matchKey, index) => {
                clone[matchKey] = wrapImportantAndSkipCheck(
                  values[index] ?? values[index - 2] ?? values[0]!,
                  important,
                );
              });

              break;
            }
            default: {
              clone[key] = value;
            }
          }
      } else {
        clone[key] = value;
      }
    });

    return clone;
  },
};

export default transform;

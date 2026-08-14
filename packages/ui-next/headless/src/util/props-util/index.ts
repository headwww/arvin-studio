/**
 * @file Vue VNode / Props 工具函数集合
 *
 * 提供 8 个工具函数：
 * 1. isEmptyElement — 判断 VNode 是否为空（注释、空 Fragment、空文本）
 * 2. filterEmpty — 过滤空 VNode，展平 Fragment
 * 3. flattenChildren — 递归展平子节点（支持 Fragment 展开与跳过标记）
 * 4. toPropsRefs — 将对象属性批量转为 Ref
 * 5. removeUndefined — 移除对象中值为 undefined 的属性
 * 6. pureAttrs — 从 attrs 中剥离 class 和 style
 * 7. getAttrStyleAndClass — 从 attrs 中分离 class、style 和其余属性
 * 8. getStylePxValue — 数值自动补 px 后缀
 */

import type { Ref, VNode, VNodeNormalizedChildren } from 'vue';

import { Comment, Fragment, isVNode, Text, toRef } from 'vue';

import isValid from '../isValid';
import omit from '../omit';

/**
 * 判断 VNode 是否为空元素。
 * 以下三种视为空：
 * - Comment 节点（HTML 注释）
 * - 空 Fragment（无子节点）
 * - 空白文本节点（仅包含空格）
 */
export function isEmptyElement(c: any) {
  return (
    c &&
    (c.type === Comment ||
      (c.type === Fragment && c.children.length === 0) ||
      (c.type === Text && c.children.trim() === ''))
  );
}

/**
 * 过滤掉空元素，同时展平嵌套数组和 Fragment。
 * 常用于处理 slot 内容，去除空白节点避免影响布局。
 *
 * @example
 * // 输入 [{ type: Text, children: '  ' }, { type: 'div' }]
 * // 输出 [{ type: 'div' }]（空白文本被过滤）
 */
export function filterEmpty(children: any = []) {
  if (!Array.isArray(children)) {
    children = [children];
  }
  const res: any[] = [];
  children.forEach((child: any) => {
    if (Array.isArray(child)) res.push(...child);
    else if (child?.type === Fragment) res.push(...filterEmpty(child.children));
    else res.push(child);
  });
  return res.filter((c) => !isEmptyElement(c));
}

/**
 * 跳过展平的标记 key。
 * 当 Fragment 的 key 等于此 Symbol 时，flattenChildren 不会展平该 Fragment，
 * 而是将其作为一个整体保留。用于需要保留 Fragment 边界的场景。
 */
export const skipFlattenKey = Symbol('skipFlatten');

/**
 * 递归展平子节点。
 * 处理逻辑：
 * 1. 数组 → 递归展平
 * 2. 有效值 → 保留
 * 3. Fragment（key !== skipFlattenKey）→ 展平其子节点
 * 4. Fragment（key === skipFlattenKey）→ 保留整体，不展平
 * 5. isVNode 节点 → 根据 isFilterEmpty 决定是否过滤空元素
 *
 * @param children - VNode 或子节点数组
 * @param isFilterEmpty - 是否过滤空元素，默认 true
 */
function flattenChildren(
  children?: VNode | VNodeNormalizedChildren,
  isFilterEmpty = true,
) {
  const temp = Array.isArray(children) ? children : [children];
  const res: any[] = [];
  temp.forEach((child: any) => {
    if (Array.isArray(child)) {
      res.push(...flattenChildren(child, isFilterEmpty));
    } else if (isValid(child)) {
      res.push(child);
    } else if (child && typeof child === 'object' && child.type === Fragment) {
      if (child.key === skipFlattenKey) {
        // 带跳过标记的 Fragment：保留原样，不展平
        res.push(child);
      } else {
        // 普通 Fragment：递归展平子节点
        res.push(...flattenChildren(child.children, isFilterEmpty));
      }
    } else if (child && isVNode(child)) {
      if (isFilterEmpty && !isEmptyElement(child)) {
        res.push(child);
        // eslint-disable-next-line unicorn/no-duplicate-if-branches
      } else if (!isFilterEmpty) {
        res.push(child);
      }
    }
  });
  if (isFilterEmpty) {
    return filterEmpty(res);
  }
  return res;
}

export { flattenChildren };

/**
 * 将普通对象的指定 key 批量转为 Vue Ref。
 * 常用于将组件 props 中的字段单独取出为响应式引用。
 *
 * @param obj - 源对象（通常是 props 对象）
 * @param args - 要提取的 key 列表
 * @returns 每个 key 对应一个 Ref 的新对象
 *
 * @example
 * const props = defineProps<{ name: string; age: number }>();
 * const { name, age } = toPropsRefs(props, 'name', 'age');
 * // name 和 age 现在都是 Ref<string> 和 Ref<number>
 */
export function toPropsRefs<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...args: K[]
) {
  const _res: Record<any, any> = {};
  args.forEach((key) => {
    _res[key] = toRef(obj, key);
  });
  return _res as { [key in K]-?: Ref<T[key]> };
}

/**
 * 移除对象中值为 undefined 的属性。
 * 用于在传递 props 时剔除未传入的可选属性，避免覆盖子组件的默认值。
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  const res: Partial<T> = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key as keyof T];
    if (value !== undefined) {
      res[key as keyof T] = value;
    }
  });
  return res;
}

interface RemoveBaseAttributesOptions {
  class?: boolean;
  omits?: string[];
  style?: boolean;
}

const defaultOptions = {
  class: true,
  style: true,
};

/**
 * 从 attrs 对象中剥离 class 和 style，返回纯净的属性对象。
 * 常用于将父组件透传的 attrs 传给子组件时，排除 class 和 style 避免重复或冲突。
 *
 * @param attrs - 原始属性对象
 * @param options - class/style 是否剥离（默认都剥离），omits 额外要移除的属性列表
 */
export function pureAttrs(
  attrs: Record<string, any>,
  options: RemoveBaseAttributesOptions = defaultOptions,
) {
  const enableClass = options.class ?? defaultOptions.class;
  const enableStyle = options.style ?? defaultOptions.style;
  const newAttrs = { ...attrs };
  if (enableClass) {
    delete newAttrs.class;
  }
  if (enableStyle) {
    delete newAttrs.style;
  }
  if (options.omits && options.omits.length > 0) {
    return omit(newAttrs, options.omits);
  }
  return newAttrs;
}

/**
 * 从 attrs 中分离 class、style 和其余属性。
 * 返回三个独立字段，方便分别处理样式类和样式对象。
 *
 * @returns { className, style, restAttrs } — class 名、内联样式对象、剩余属性
 */
export function getAttrStyleAndClass(
  attrs: Record<string, any>,
  options?: RemoveBaseAttributesOptions,
) {
  return {
    className: attrs.class,
    style: attrs.style,
    restAttrs: pureAttrs(attrs, options),
  } as { className: any; restAttrs: Record<string, any>; style: any };
}

/**
 * 将数值转为带 px 后缀的字符串，字符串原样返回。
 * 用于将 JS 中的数字样式值转为合法的 CSS 值。
 *
 * @example
 * getStylePxValue(14)       // → '14px'
 * getStylePxValue('1em')    // → '1em'
 * getStylePxValue('14')     // → '14px'（纯数字字符串也会补 px）
 * getStylePxValue(null)     // → null
 */
export function getStylePxValue(value: null | number | string | undefined) {
  if (typeof value === 'number') {
    return `${value}px`;
  } else if (typeof value === 'string') {
    const trimed = value.trim();
    return Number.isNaN(Number(trimed)) ? trimed : `${Number(trimed)}px`;
  }
  return value;
}

/**
 *  —— 解包元素引用
 *
 * 把"元素 Ref / 组件实例 Ref / 直接值"统一解析为真实 DOM 元素：
 * 先用 toValue 解包 Ref，若得到的是组件实例（带 $el）则取其根元素。
 * 对齐 VueUse 的 unrefElement 语义，是组件内获取目标元素的标准入口。
 */
import type { ComponentPublicInstance, MaybeRef } from 'vue';

import { toValue } from 'vue';

/** Vue 组件公开实例类型（配合 unrefElement 使用） */
export type VueInstance = ComponentPublicInstance;
/**
 * Get the dom element of a ref of element or Vue component instance
 *
 * @param elRef
 */
// （中文补充）获取元素 Ref 或组件实例 Ref 对应的 DOM 元素：
// toValue 解包 Ref 拿到原值；组件实例的 $el 是其根元素（Fragment 组件
// 的 $el 可能是文本/注释占位符，需要真实元素时应配合 resolveToElement）。
// @param elRef 元素 / 元素 Ref / 组件实例 Ref（MaybeRef）
// @returns 解析出的 DOM 元素（组件实例时为其根元素）
export function unrefElement<T extends Element>(elRef: MaybeRef<T>): T {
  const plain = toValue(elRef);
  return (plain as any)?.$el ?? plain;
}

/**
 * @v-c/util 组件根 DOM 解析（Dom/findDOMNode）
 *
 * 从"组件实例 / 元素引用 / ref"统一解析出真实 DOM 节点，
 * 供定位、测量、事件委托等需要原生节点的场景使用。
 *
 * 关键设计：
 * 1. SSR 安全：非浏览器环境直接透传原值，不做 DOM 解析；
 * 2. 兼容多种输入：组件实例（取其 $el）、原生 DOM、可能包了一层 ref 的对象；
 * 3. Vue 3 兼容：组件可能渲染为 Fragment/Transition 占位符，
 *    $el 是 Text/Comment 节点，此时解析为下一个元素兄弟节点
 *    （真正可测量的 DOM）——见 getDOM 中的处理；
 * 4. 约定：组件根元素应通过 createElementRef 获取（见
 *    docs/function-ref-element-resolve.md），本文件只负责解析已持有的引用。
 */
import type { ComponentPublicInstance, MaybeRef } from 'vue';

import { unref } from 'vue';

import canUseDom from './canUseDom';

/** 判断是否为原生 DOM 元素节点（HTMLElement 或 SVGElement） */
export function isDOM(node: any): node is HTMLElement | SVGElement {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element
  // Since XULElement is also subclass of Element, we only need HTMLElement and SVGElement
  // Element 的子类还包括 XULElement 等，这里只需判定 HTMLElement 与 SVGElement
  return node instanceof HTMLElement || node instanceof SVGElement;
}

/**
 * 把 MaybeRef（可能是 ref 的值）解析为真实 DOM 节点
 * 兼容组件实例（nativeElement 回退）、Fragment/Transition 占位符解析
 */
export function getDOM(elementRef: MaybeRef) {
  const unrefElementRef = unref(elementRef);
  // SSR：不解析直接返回原值
  if (!canUseDom()) {
    return unrefElementRef;
  }
  // 优先找 DOM 节点；组件实例则先看 $el，再看 nativeElement（组件自定义的根节点暴露）
  const dom =
    findDOMNode(unrefElementRef) ||
    (unrefElementRef && typeof unrefElementRef === 'object'
      ? findDOMNode((unrefElementRef as any).nativeElement)
      : null);

  // Vue components may render as Fragment/Transition placeholders, whose `$el` is a Text/Comment node.
  // In that case, resolve to the next element sibling as the real measurable DOM element.
  // Vue 组件可能渲染为 Fragment/Transition 占位符，$el 是 Text/Comment 节点；
  // 此时取下一个元素兄弟节点作为真正可测量的 DOM 元素
  if (
    dom &&
    (dom.nodeType === 3 || dom.nodeType === 8) &&
    (dom as any).nextElementSibling
  )
    return (dom as any).nextElementSibling as HTMLElement;

  return dom;
}

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
/**
 * 解析组件根 DOM：
 * - 已是 DOM 节点 → 原样返回；
 * - 组件实例（含 $el）→ 返回其 $el；
 * - 无法解析 → 返回 null。
 * @returns 解析出的 DOM 节点（T），无则 null
 */
export default function findDOMNode<T = Element | Text>(
  _node: MaybeRef<ComponentPublicInstance | HTMLElement | SVGElement>,
): null | T {
  const node = unref(_node);
  // SSR：不解析直接透传
  if (!canUseDom()) {
    return node as any;
  }
  if (isDOM(node)) return node as unknown as T;
  else if (node && '$el' in node) return node.$el as unknown as T;

  return null;
}

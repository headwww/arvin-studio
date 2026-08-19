/**
 *
 * 一组围绕 VNode 的常用操作，供各组件复用：
 * 1. 克隆：cloneElement / cloneVNodes / deepCloneElement ——
 *    给 VNode 覆盖式（而非合并式）注入 props，并支持递归深克隆 children；
 * 2. 插槽渲染校验：ensureValidVNode / customRenderSlot ——
 *    过滤空插槽（全为注释/空 Fragment），空时回退到 fallback；
 * 3. 节点解析：resolveToElement / createElementRef ——
 *    把 VNode / 组件实例 / ref 归一化为真实 DOM 元素（函数式 ref 的
 *    正确用法，见 docs/function-ref-element-resolve.md）；
 * 4. triggerVNodeUpdate —— 用给定 attrs 把 VNode 重渲染到指定容器。
 */
import type { Slots, VNode, VNodeArrayChildren, VNodeProps } from 'vue';

import type { RefObject } from './createRef';

import {
  cloneVNode,
  Comment,
  Fragment,
  isVNode,
  nextTick,
  render as VueRender,
} from 'vue';

import { isDOM } from './Dom/findDOMNode';
import { filterEmpty } from './props-util';

/**
 * 可注入的节点 props：原生 VNodeProps 的 ref 被放宽为兼容 createRef 的 RefObject
 */
type NodeProps = Omit<VNodeProps, 'ref'> &
  Record<string, any> & { ref?: RefObject | VNodeProps['ref'] };

/**
 * 克隆 VNode 并（默认）覆盖式注入 props
 *
 * @param vnode 目标 VNode；传数组时取过滤空节点后的第一个元素
 * @param nodeProps 要注入的 props
 * @param override true 时用 nodeProps 覆盖原 props（默认）；false 时保留 cloneVNode 的合并语义
 * @param mergeRef 是否合并 ref（透传给 Vue 的 cloneVNode）
 * @returns 克隆后的 VNode；无有效节点时返回 null
 */
export function cloneElement<T, U>(
  vnode: VNode<T, U> | VNode<T, U>[],
  nodeProps: NodeProps = {},
  override = true,
  mergeRef = false,
): null | VNode<T, U> {
  const ele = Array.isArray(vnode) ? filterEmpty(vnode)[0] : vnode;

  if (!ele) return null;

  const node: any = cloneVNode(ele as VNode<T, U>, nodeProps as any, mergeRef);

  // cloneVNode内部是合并属性，这里改成覆盖属性
  node.props = (override ? { ...node.props, ...nodeProps } : node.props) as any;
  console.warn(typeof node.props.class !== 'object', 'class must be string');
  return node;
}

/**
 * 批量克隆：对 VNode 数组逐个执行 cloneElement（override 透传）
 */
export function cloneVNodes(vnodes: any, nodeProps = {}, override = true) {
  return vnodes.map((vnode: any) => cloneElement(vnode, nodeProps, override));
}

/**
 * 深克隆 VNode：除根节点外，children 中的 VNode 也递归克隆
 *
 * 数组入参逐项深克隆并返回数组；非 VNode（如文本/数字）原样返回——
 * 因为只有 VNode 才拥有可变的 props/children 结构，克隆才有意义。
 * @returns 克隆后的 VNode / VNode 数组 / 原值（非 VNode 时）
 */
export function deepCloneElement<T, U>(
  vnode: VNode<T, U> | VNode<T, U>[],
  nodeProps: NodeProps = {},
  override = true,
  mergeRef = false,
): any {
  if (Array.isArray(vnode)) {
    return vnode.map((item: any) =>
      deepCloneElement(item, nodeProps, override, mergeRef),
    );
  } else {
    // 需要判断是否为vnode方可进行clone操作
    if (!isVNode(vnode)) return vnode;

    const cloned: any = cloneElement(vnode, nodeProps, override, mergeRef);
    // 递归深克隆 children，避免多个克隆体共享同一批子 VNode
    if (Array.isArray(cloned.children))
      cloned.children = deepCloneElement(cloned.children as VNode<T, U>[]);

    return cloned;
  }
}

/**
 * 用新 attrs 把 VNode 重渲染到指定容器（借助 Vue 的 render 函数）
 * 用于强制刷新已挂载的 VNode（如弹层/浮层的内容更新）
 */
export function triggerVNodeUpdate(
  vm: VNode,
  attrs: Record<string, any>,
  dom: any,
) {
  VueRender(cloneVNode(vm, { ...attrs }), dom);
}

/**
 * 判断插槽渲染结果是否包含"有效"内容
 *
 * 递归判定规则：
 * - 非 VNode 子项（文本/数字等）视为有效；
 * - 注释节点视为无效（渲染后不产生可见内容）；
 * - Fragment 递归检查其 children（空 Fragment 视为无效）。
 * 只要存在任一有效子项，整个插槽即视为有效。
 * @returns 有效时返回原 slot，否则返回 null
 */
export function ensureValidVNode<T extends Array<unknown>>(slot: null | T) {
  return (slot || []).some((child) => {
    if (!isVNode(child)) return true;
    if (child.type === Comment) return false;
    if (
      child.type === Fragment &&
      !ensureValidVNode(child.children as VNodeArrayChildren)
    )
      return false;
    return true;
  })
    ? slot
    : null;
}

/**
 * 渲染具名插槽，结果为空时回退到 fallback
 *
 * @param slots 组件 slots 对象
 * @param name 插槽名
 * @param props 传给插槽函数的 props
 * @param fallback 插槽无有效内容时的兜底渲染函数
 */
export function customRenderSlot(
  slots: Slots,
  name: string,
  props: Record<string, unknown>,
  fallback?: () => VNodeArrayChildren,
) {
  const slot = slots[name]?.(props);
  if (ensureValidVNode(slot as any)) return slot;

  return fallback?.();
}

/**
 * 把"任意节点引用"归一化为真实 DOM 元素
 *
 * 按优先级依次尝试以下来源：
 * 1. `__$el`（vxe 风格直接暴露的根元素）；
 * 2. 本身就是 DOM 元素；
 * 3. 组件暴露契约 nativeElement / el / getElement（兼容 Ref 对象与直接值）；
 * 4. `$el`（Vue 组件实例的根元素）。
 * @param node VNode / 组件实例 / DOM / Ref 等任意引用
 * @returns 解析出的 HTMLElement；无法解析时返回 null
 */
export function resolveToElement(node: any) {
  if (!node) {
    return null;
  }
  if (isDOM(node?.__$el)) {
    return node.__$el;
  }
  if (isDOM(node)) {
    return node as HTMLElement;
  }
  const exposed = node as any;

  // 依次尝试组件暴露的元素契约：nativeElement → el → getElement()
  const nativeEl = exposed?.nativeElement;
  if (isDOM(nativeEl?.value)) {
    return nativeEl.value;
  }
  if (isDOM(nativeEl)) {
    return nativeEl;
  }
  const exposedEl = exposed?.el;
  if (isDOM(exposedEl?.value)) {
    return exposedEl.value;
  }
  if (isDOM(exposedEl)) {
    return exposedEl;
  }
  if (typeof exposed?.getElement === 'function') {
    const el = exposed.getElement();
    if (isDOM(el)) {
      return el as HTMLElement;
    }
  }
  if (isDOM(exposed?.$el)) {
    return exposed.$el;
  } else if (exposed.$el) {
    // A text/comment `$el` usually means a fragment/transition placeholder
    // whose real content is the next element sibling. But when the component
    // exposes an element contract (`nativeElement` / `el` / `getElement`)
    // that is simply not fulfilled yet — e.g. trigger's Popup before its
    // portal content mounts — the placeholder's sibling is an unrelated
    // host-tree element (the next Space.Compact item), so guessing there
    // steals the wrong element. Return null and let the caller retry.
    // （中文补充）文本/注释型 $el 通常是 Fragment/Transition 占位符，
    // 其下一个兄弟元素才是真实内容；但组件一旦声明了元素契约（nativeElement
    // / el / getElement）且尚未兑现（如 trigger 的 Popup 挂载前），
    // 占位符的兄弟就是宿主树中无关的元素，猜测会取错目标，
    // 因此此时返回 null，交由调用方稍后重试。
    const hasElementContract =
      exposed.nativeElement !== null ||
      exposed.el !== null ||
      typeof exposed.getElement === 'function';
    const dom = exposed.$el;
    if (
      !hasElementContract &&
      (dom.nodeType === 3 || dom.nodeType === 8) &&
      (dom as any).nextElementSibling
    )
      return (dom as any).nextElementSibling as HTMLElement;
  }
  return null;
}

/**
 * Create a function-ref callback that resolves the referenced node to a DOM
 * element before handing it to `apply`.
 *
 * Vue invokes function refs synchronously at patch time, while a component's
 * exposed template ref only lands in a post job — and since vue 3.5.39
 * function refs run with tracking paused (vuejs/core#14985), the callback is
 * no longer re-invoked reactively once that ref lands. So when the node is
 * present but not resolvable yet, re-resolve after the current flush instead
 * of applying `null`. A later invocation (e.g. unmount) supersedes the
 * pending retry.
 */
// （中文补充）创建"先解析成 DOM 元素再回调"的函数式 ref：
// Vue 在 patch 阶段同步调用函数式 ref，而组件 expose 的模板 ref 要等到
// post job 才落地；vue 3.5.39 起函数式 ref 在响应式追踪暂停的状态下执行
// （vuejs/core#14985），ref 落地后不会再次触发回调。因此节点存在但暂
// 不可解析时，推迟到当前 flush 之后（nextTick）重试，而不是回调 null；
// 通过递增序号保证只有最新一次调用生效（如卸载会覆盖挂载时的待重试）。
export function createElementRef<T extends Element = HTMLElement>(
  apply: (element: null | T, node: any) => void,
  resolve: (node: any) => null | T = resolveToElement,
): (node: any) => void {
  // 递增序号：标记最新一次调用，nextTick 重试时只应用最新状态
  let seq = 0;
  return (node: any) => {
    const current = ++seq;
    const element = resolve(node);
    if (node && !element) {
      // 节点在但暂不可解析：推迟到下一轮 flush 重试（此时模板 ref 已落地）
      nextTick(() => {
        if (current === seq) {
          apply(resolve(node), node);
        }
      });
      return;
    }
    apply(element, node);
  };
}

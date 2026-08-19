/**
 *
 * 兼容 React 风格 ref 与 Vue ref 的通用封装：
 * - createRef：创建一个"函数 + current 属性"的复合 ref，调用它即写入节点；
 * - fillRef：把节点写入任意形态的 ref（函数 ref / 带 current 的对象 ref）；
 * - composeRef：合并多个 ref 为一个，典型场景是"内部 ref + 外部传入 ref"
 *   同时生效，保证子组件节点既能被内部使用、也能被外部拿到。
 */
import type { Ref } from 'vue';

/** 复合 ref 类型：可调用（赋值节点），同时通过 current 读取最新节点 */
export interface RefObject extends Function {
  current?: any;
}

/**
 * 创建一个复合 ref：调用它即把节点写入 current
 * @returns 可调用且带 current 属性的函数（初始 current 为 undefined）
 */
function createRef(): any {
  const func: RefObject = (node: any) => {
    func.current = node;
  };
  return func;
}

/**
 * 把节点填充到 ref 中，兼容两种形态：
 * - 函数 ref：直接调用（如 createRef / composeRef 的产物）；
 * - 带 current 的对象 ref（React 风格 / Vue 的 Ref 对象）。
 * @param ref 目标 ref
 * @param node 要写入的节点
 */
export function fillRef<T>(ref: Ref, node: T) {
  if (typeof ref === 'function') (ref as any)(node);
  else if (typeof ref === 'object' && ref && 'current' in ref)
    (ref as any).current = node;
}

/**
 * Merge refs into one ref function to support ref passing.
 * 把多个 ref 合并为一个：节点会同时写入每个 ref。
 * 典型场景：组件内部保留自己的 ref，同时让外部传入的 ref 也能拿到节点。
 * @param refs 任意数量的 ref
 * @returns 合并后的单一 ref 函数
 */
export function composeRef<T>(...refs: any[]) {
  return (node: T) => {
    refs.forEach((ref) => {
      fillRef(ref, node);
    });
  };
}

export default createRef;

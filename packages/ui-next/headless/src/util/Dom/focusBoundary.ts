/**
 *  焦点边界上下文（Dom/focusBoundary）
 *
 * 与 Dom/focus.ts 的 useLockFocus 配套使用：弹层（Modal/Drawer）打开时
 * 会锁定容器内的焦点，并允许把"允许元素"（如 teleport 出去的 popup 容器）
 * 注册进焦点陷阱。本模块把这个"注册允许元素"的能力通过 provide/inject
 * 下发给后代组件，使弹层内容里更深层的组件也能注册自己的外部容器。
 */
import type { InjectionKey } from 'vue';

import { inject, provide } from 'vue';

/** 焦点边界上下文的对外形状：注册一个允许元素，返回注销函数 */
export interface FocusBoundaryContextProps {
  registerAllowedElement: (element: HTMLElement) => VoidFunction;
}

/** 注入键：用 Symbol 保证唯一性，避免与其它上下文冲突 */
const FocusBoundaryContextKey: InjectionKey<FocusBoundaryContextProps | null> =
  Symbol('FocusBoundaryContext');

/**
 * 在弹层根组件提供焦点边界上下文，把 registerAllowedElement 下发给后代
 * @param props 包含 registerAllowedElement 的上下文值
 */
export function useFocusBoundaryProvider(props: FocusBoundaryContextProps) {
  provide(FocusBoundaryContextKey, props);
}

/**
 * 后代组件消费焦点边界上下文
 * @returns 上下文值；未处于任何 provider 之下时返回 null
 */
export function useFocusBoundary() {
  return inject(FocusBoundaryContextKey, null);
}

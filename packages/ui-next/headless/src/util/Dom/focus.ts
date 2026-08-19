/**
 * @v-c/util 焦点管理工具（Dom/focus）
 *
 * 三部分能力：
 * 1. focusable / getFocusNodeList：可聚焦元素判定与枚举
 *    （Modal/Drawer 等弹层计算可 Tab 元素列表用）；
 * 2. triggerFocus：聚焦 input/textarea 并支持光标位置选项
 *    （Input/Textarea 组件暴露的 focus API 底层实现）；
 * 3. 焦点锁定系统（lockFocus / useLockFocus）：弹层打开时把焦点圈禁在容器内
 *    （焦点陷阱，focus trap）——Tab 到边界自动回绕、focusin 逃逸自动拉回，
 *    并支持"忽略元素/允许元素"（如 teleport 出去的 popup 容器、隐藏的关闭按钮）。
 */
import type { Ref } from 'vue';

import { watch } from 'vue';

import useId from '../hooks/useId';
import { getDOM } from './findDOMNode';
import isVisible from './isVisible';

/** 带 disabled 属性的元素类型（原生 disabled 会阻止聚焦） */
type DisabledElement =
  | HTMLButtonElement
  | HTMLFieldSetElement
  | HTMLInputElement
  | HTMLLinkElement
  | HTMLOptGroupElement
  | HTMLOptionElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

/**
 * 判定元素是否可聚焦
 *
 * 判定链：
 * 1. 必须可见（isVisible）；
 * 2. 必须是"可聚焦元素"：input/select/textarea/button、可编辑元素
 *    （contentEditable）、带 href 的 a 标签；
 * 3. 解析 tabindex：显式 tabindex 生效；可聚焦元素无 tabindex 视作 0；
 *    原生 disabled 的元素 tabIndex 置 null（不可聚焦）；
 * 4. 结果：tabIndex 非 null 且 >= 0；includePositive=true 时也接受负 tabindex
 *    （负 tabindex 可用 JS 聚焦但不在 Tab 序列里）。
 *
 * @param includePositive 是否把负 tabindex（仅 JS 可聚焦）也算作可聚焦
 */
function focusable(node: HTMLElement, includePositive = false): boolean {
  if (isVisible(node)) {
    const nodeName = node.nodeName.toLowerCase();
    const isFocusableElement =
      // Focusable element
      // 原生可聚焦标签
      ['button', 'input', 'select', 'textarea'].includes(nodeName) ||
      // Editable element
      // 可编辑元素（contentEditable，如富文本）
      node.isContentEditable ||
      // Anchor with href element
      // 带 href 的链接
      (nodeName === 'a' && !!node.getAttribute('href'));

    // Get tabIndex
    // 解析 tabindex 属性
    const tabIndexAttr = node.getAttribute('tabindex');
    const tabIndexNum = Number(tabIndexAttr);

    // Parse as number if validate
    // 合法数字才生效；可聚焦元素无 tabindex 时默认为 0
    let tabIndex: null | number = null;
    if (tabIndexAttr && !Number.isNaN(tabIndexNum)) tabIndex = tabIndexNum;
    else if (isFocusableElement && tabIndex === null) tabIndex = 0;

    // Block focusable if disabled
    // 原生 disabled 的元素不可聚焦
    if (isFocusableElement && (node as DisabledElement).disabled)
      tabIndex = null;

    return (
      tabIndex !== null && (tabIndex >= 0 || (includePositive && tabIndex < 0))
    );
  }

  return false;
}

/**
 * 枚举节点内（含自身）的所有可聚焦元素，按文档顺序返回
 * 供焦点陷阱计算 Tab 首/末元素使用
 */
export function getFocusNodeList(node: HTMLElement, includePositive = false) {
  const res = [...node.querySelectorAll<HTMLElement>('*')].filter((child) => {
    return focusable(child, includePositive);
  });
  // 节点自身也可聚焦时排到最前
  if (focusable(node, includePositive)) res.unshift(node);

  return res;
}

/** 聚焦选项：在原生 FocusOptions 基础上增加光标位置控制 */
export interface InputFocusOptions extends FocusOptions {
  /** 聚焦后光标位置：start（开头）/ end（末尾）/ all（全选），缺省不移动 */
  cursor?: 'all' | 'end' | 'start';
}

/**
 * 聚焦 input/textarea 并可选设置光标位置
 * 是 Input/Textarea 组件 expose 的 focus() 底层实现
 */
export function triggerFocus(
  element?: HTMLInputElement | HTMLTextAreaElement,
  option?: InputFocusOptions,
) {
  if (!element) return;

  element.focus(option);

  // Selection content
  // 按选项移动光标
  const { cursor } = option || {};
  if (cursor) {
    const len = element.value.length;

    switch (cursor) {
      case 'end': {
        element.setSelectionRange(len, len);
        break;
      }

      case 'start': {
        element.setSelectionRange(0, 0);
        break;
      }

      default: {
        // 'all'：全选
        element.setSelectionRange(0, len);
      }
    }
  }
}

// ======================================================
// ==                    Lock Focus                    ==
// ======================================================
// ====================== 焦点锁定 ======================
// 全局状态（单例）：记录上次聚焦元素 + 锁定的元素栈 + 各锁的忽略/允许集合
// 支持嵌套锁定（如 Modal 内再开 Drawer）：只有栈顶（最后锁定的）元素生效
let lastFocusElement: HTMLElement | null = null;
let focusElements: HTMLElement[] = [];
// Map stable ID to lock element
// 稳定 ID → 锁定的容器元素
const idToElementMap = new Map<string, HTMLElement>();
// Map stable ID to ignored element
// 稳定 ID → 忽略元素（该元素及其子树内的焦点不强制拉回）
const ignoredElementMap = new Map<string, HTMLElement | null>();
// Map stable ID to allowed external roots, e.g. teleported popup containers
// 稳定 ID → 允许的外部根元素集合（如 teleport 出去的弹层容器）
const allowedElementMap = new Map<string, Set<HTMLElement>>();

/** 取当前生效（栈顶）的锁定元素 */
function getLastElement() {
  return focusElements[focusElements.length - 1];
}

/** 取栈顶锁定元素对应的 lock id */
function getLastLockId() {
  const lastElement = getLastElement();
  if (!lastElement) return undefined;

  for (const [id, ele] of idToElementMap) {
    if (ele === lastElement) {
      return id;
    }
  }
  return undefined;
}

/** 元素是否属于当前锁的"忽略范围"（其内焦点不被强制拉回） */
function isIgnoredElement(element: Element | null): boolean {
  const lockId = getLastLockId();
  if (!lockId || !element) return false;

  const ignoredEle = ignoredElementMap.get(lockId);
  return (
    !!ignoredEle && (ignoredEle === element || ignoredEle.contains(element))
  );
}

/** 元素是否属于当前锁的"允许范围"（焦点可合法落在其内） */
function isAllowedElement(element: Element | null): boolean {
  const lockId = getLastLockId();
  if (!lockId || !element) return false;

  const allowedElements = allowedElementMap.get(lockId);
  if (!allowedElements?.size) return false;

  for (const allowedElement of allowedElements) {
    if (allowedElement === element || allowedElement.contains(element)) {
      return true;
    }
  }

  return false;
}

/** 焦点是否在当前元素内（自身或子树） */
function hasFocus(element: HTMLElement) {
  const { activeElement } = document;
  return element === activeElement || element.contains(activeElement);
}

/**
 * 焦点同步（focusin 时触发）：
 * - 焦点落在忽略/允许元素上 → 放行（不强制拉回）；
 * - 焦点离开锁定容器 → 拉回容器内：优先回到上次聚焦的元素，否则回到第一个可聚焦元素；
 * - 焦点仍在容器内 → 记录为 lastFocusElement（作为下次拉回的优先目标）。
 */
function syncFocus() {
  const lastElement = getLastElement();
  const { activeElement } = document;

  // If current focus is on an ignored element, don't force it back
  // 焦点在忽略/允许元素上时不强制拉回
  if (isIgnoredElement(activeElement) || isAllowedElement(activeElement))
    return;

  if (lastElement && !hasFocus(lastElement)) {
    const focusableList = getFocusNodeList(lastElement);

    // 优先拉回上次聚焦的元素；已不可聚焦/不在列表则回退到第一个
    const matchElement = focusableList.includes(lastFocusElement as HTMLElement)
      ? lastFocusElement
      : focusableList[0];

    matchElement?.focus({ preventScroll: true });
  } else {
    lastFocusElement = activeElement as HTMLElement;
  }
}

/**
 * Tab 键边界回绕（keydown 捕获阶段）：
 * - Shift+Tab 且焦点在第一个可聚焦元素 → 把 lastFocusElement 指向最后一个
 *   （让 syncFocus 在 focusin 时把它拉回最后一个，形成回绕）；
 * - Tab 且焦点在最后一个 → 指向第一个。
 */
function onWindowKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Tab') {
    return;
  }

  const { activeElement } = document;
  const lastElement = getLastElement();
  const focusableList = getFocusNodeList(lastElement!);
  const last = focusableList[focusableList.length - 1];

  if (e.shiftKey && activeElement === focusableList[0]) {
    // Tab backward on first focusable element
    // 在第一个元素上向后 Tab：引导焦点回到最后一个
    lastFocusElement = last as any;
  } else if (!e.shiftKey && activeElement === last) {
    // Tab forward on last focusable element
    // 在最后一个元素上向前 Tab：引导焦点回到第一个
    lastFocusElement = focusableList[0] as any;
  }
}

/**
 * Lock focus in the element.
 * It will force back to the first focusable element when focus leaves the element.
 * 锁定元素内的焦点：焦点逃逸时强制拉回。
 * 支持嵌套（多次调用）：后锁定的生效，解锁后回退到上一层。
 * @param id - A stable ID for this lock instance
 * @param id - 该锁实例的稳定 ID（解锁/维护忽略/允许集合时使用）
 */
export function lockFocus(element: HTMLElement, id: string): VoidFunction {
  if (element) {
    idToElementMap.set(id, element);

    // Refresh focus elements
    // 把该元素放到锁定栈顶（去重后 push，形成嵌套层级）
    focusElements = focusElements.filter((ele) => ele !== element);
    focusElements.push(element);

    // Just add event since it will de-duplicate
    // 监听 focusin（逃逸拉回）与 keydown（Tab 回绕）；重复添加自动去重
    window.addEventListener('focusin', syncFocus);
    window.addEventListener('keydown', onWindowKeyDown, { capture: true });
    syncFocus();
  }

  // Always return unregister function
  // 返回解锁函数：从栈中移除、清理各 map，栈空时移除全局监听
  return () => {
    lastFocusElement = null;
    focusElements = focusElements.filter((ele) => ele !== element);
    idToElementMap.delete(id);
    ignoredElementMap.delete(id);
    allowedElementMap.delete(id);
    if (focusElements.length === 0) {
      window.removeEventListener('focusin', syncFocus);
      window.removeEventListener('keydown', onWindowKeyDown, true);
    }
  };
}

/**
 * Lock focus within an element.
 * When locked, focus will be restricted to focusable elements within the specified element.
 * If multiple elements are locked, only the last locked element will be effective.
 * 响应式焦点锁定（组件内使用）：lock 为真时锁定 getElement() 返回的容器。
 * 返回两个能力：
 * - ignoreElement：把某元素标记为"忽略"——其内焦点可暂时离开锁定区；
 * - registerAllowedElement：把某元素注册为"允许"（如 teleport 弹层容器），
 *   返回注销函数；配合 onCleanup 在组件卸载时自动清理。
 * @returns A function to mark an element as ignored, which will temporarily allow focus on that element even if it's outside the locked area.
 * @returns [ignoreElement, registerAllowedElement]
 */
export function useLockFocus(
  lock: Ref<boolean>,
  getElement: () => HTMLElement | null,
): [
  ignoreElement: (ele: HTMLElement) => void,
  registerAllowedElement: (ele: HTMLElement) => VoidFunction,
] {
  // 每个锁实例一个稳定 ID（useId 保证 SSR 安全）
  const id = useId();

  // lock 或目标元素变化时重新锁定/解锁（onCleanup 自动解旧锁）
  watch(
    [lock, () => getElement()],
    ([nextLock, element], _o, onCleanup) => {
      element = getDOM(element) as HTMLElement;
      if (nextLock && element) {
        const fn = lockFocus(element, id);
        onCleanup(fn);
      }
    },
    {
      flush: 'post',
      immediate: true,
    },
  );

  /** 把元素标记为忽略（如关闭按钮在 transition 时先移出锁定区） */
  const ignoreElement = (ele: HTMLElement) => {
    if (ele) ignoredElementMap.set(id, ele);
  };

  /** 注册允许元素（返回注销函数）；集合为空时自动清理 map 条目 */
  const registerAllowedElement = (ele: HTMLElement) => {
    if (!ele) {
      return () => {};
    }

    let allowedElements = allowedElementMap.get(id);
    if (!allowedElements) {
      allowedElements = new Set();
      allowedElementMap.set(id, allowedElements);
    }
    allowedElements.add(ele);

    return () => {
      const nextAllowedElements = allowedElementMap.get(id);
      nextAllowedElements?.delete(ele);
      if (!nextAllowedElements?.size) {
        allowedElementMap.delete(id);
      }
    };
  };

  return [ignoreElement, registerAllowedElement];
}

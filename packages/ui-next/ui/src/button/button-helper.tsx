/**
 * @file Button 组件辅助函数，提供按钮类型判断与中文字符间距处理
 */

import type { CSSProperties, VNodeChild } from 'vue';

import { cloneVNode, createVNode, Fragment, isVNode, Text } from 'vue';

import { PresetColors } from '../theme/interface';

/**
 * 判断按钮变体是否为无边框类型。
 * `text` 和 `link` 两种变体不渲染边框，其余变体（outlined/dashed/solid/filled）均有可见边框。
 */
export function isUnBorderedButtonVariant(type?: ButtonVariantType) {
  return type === 'text' || type === 'link';
}

/**
 * 正则：匹配恰好两个中文字符。
 * 用于在按钮文本中两个汉字之间插入空格，提升排版美观度。
 */
const rxTwoCNChar = /^[\u{4E00}-\u{9FA5}]{2}$/u;
export const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);

/** 判断子节点是否为纯文本（string、number 或 Text VNode） */
function isPureTextChild(child: VNodeChild): boolean {
  if (typeof child === 'string' || typeof child === 'number') {
    return true;
  }

  if (isVNode(child)) {
    return child.type === Text && typeof child.children === 'string';
  }

  return false;
}

/** 从子节点中提取文本内容 */
function getChildText(child: VNodeChild): string {
  if (typeof child === 'string' || typeof child === 'number') {
    return String(child);
  }

  if (
    isVNode(child) &&
    child.type === Text &&
    typeof child.children === 'string'
  ) {
    return child.children;
  }

  return '';
}

/**
 * 处理按钮子节点：合并连续的纯文本节点，并在两个中文字符间插入空格。
 *
 * 例：按钮文字为 "确认"（两个汉字）→ "确 认"（中间插入空格），
 * 这是 As 的标志性排版细节。
 *
 * @param children - 子节点数组
 * @param needInserted - 是否需要在两汉字间插入空格
 * @param style - 包裹 span 的样式
 * @param className - 包裹 span 的类名
 */
export function spaceChildren(
  children: VNodeChild[],
  needInserted: boolean,
  style?: CSSProperties,
  className?: string,
): VNodeChild[] {
  const childList: VNodeChild[] = [];
  let isPrevChildPure = false;

  children.forEach((child) => {
    const isCurrentChildPure = isPureTextChild(child);
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      const lastText = getChildText(lastChild);
      const currentText = getChildText(child);

      if (lastText !== '' && currentText !== '') {
        // 连续的纯文本节点合并为一个
        childList[lastIndex] = `${lastText}${currentText}`;
      } else {
        childList.push(child);
      }
    } else {
      childList.push(child);
    }

    isPrevChildPure = isCurrentChildPure;
  });

  return childList.map((item) =>
    splitCNCharsBySpace(item, needInserted, style, className),
  );
}

/**
 * 对单个子节点执行中文空格插入。
 * 如果内容恰好是两个汉字（如"确认"），则拆开并在中间插入空格，
 * 用 span 包裹以应用样式。
 */
function splitCNCharsBySpace(
  child: VNodeChild,
  needInserted: boolean,
  style?: CSSProperties,
  className?: string,
): VNodeChild {
  if (child === null || child === undefined) {
    return child;
  }

  const SPACE = needInserted ? ' ' : '';

  if (typeof child === 'string' || typeof child === 'number') {
    const text = String(child);
    const content = isTwoCNChar(text) ? text.split('').join(SPACE) : text;
    return createVNode('span', { class: className, style }, content);
  }

  if (isVNode(child)) {
    if (child.type === Text) {
      const text = String(child.children ?? '');
      const content = isTwoCNChar(text) ? text.split('').join(SPACE) : text;
      return createVNode(
        'span',
        { key: (child as any).key, class: className, style },
        content,
      );
    }

    // Fragment 的子节点直接提升到 span 内
    if (child.type === Fragment) {
      return createVNode(
        'span',
        { key: (child as any).key, class: className, style },
        child.children,
      );
    }

    // 原生 HTML 元素（如 a）子节点恰为两个汉字 → clone 并插入空格
    if (
      typeof child.type === 'string' &&
      typeof child.children === 'string' &&
      isTwoCNChar(child.children)
    ) {
      return cloneVNode(
        child,
        { class: className, style },
        (child as any).children?.split('')?.join?.(SPACE),
      );
    }

    return child;
  }

  return child;
}

const _ButtonTypes = ['default', 'primary', 'dashed', 'link', 'text'] as const;
export type ButtonType = (typeof _ButtonTypes)[number];

const _ButtonShapes = ['default', 'circle', 'round', 'square'] as const;
export type ButtonShape = (typeof _ButtonShapes)[number];

const _ButtonHTMLTypes = ['submit', 'button', 'reset'] as const;
export type ButtonHTMLType = (typeof _ButtonHTMLTypes)[number];

export const _ButtonVariantTypes = [
  'outlined',
  'dashed',
  'solid',
  'filled',
  'text',
  'link',
] as const;
export type ButtonVariantType = (typeof _ButtonVariantTypes)[number];

export const _ButtonColorTypes = [
  'default',
  'primary',
  'danger',
  ...PresetColors,
] as const;

export type ButtonColorType = (typeof _ButtonColorTypes)[number];

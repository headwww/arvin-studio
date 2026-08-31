/**
 *  CSS 特性检测（Dom/styleChecker）
 *
 * 两类检测能力：
 * - 样式名支持（isStyleNameSupport）：如 backdrop-filter 等新特性是否可用；
 * - 样式值支持（isStyleValueSupport）：给元素临时赋值，验证浏览器是否接受
 *   （用于 grid 等新语法值的能力降级）。
 * 供按浏览器能力做条件渲染/降级使用。
 */
import canUseDom from './canUseDom';

/* 检测样式名是否被支持：逐个尝试，命中其一即可（如带厂商前缀的样式名） */
function isStyleNameSupport(styleName: string | string[]): boolean {
  if (canUseDom() && window.document.documentElement) {
    const styleNameList = Array.isArray(styleName) ? styleName : [styleName];
    const { documentElement } = window.document;

    return styleNameList.some((name) => name in documentElement.style);
  }
  return false;
}

/* 检测样式值是否被支持：赋值前后值不同，说明浏览器接受了该值 */
function isStyleValueSupport(styleName: string, value: any) {
  if (!isStyleNameSupport(styleName)) return false;

  const ele: any = document.createElement('div');
  const origin = ele.style[styleName];
  ele.style[styleName] = value;
  return ele.style[styleName] !== origin;
}

/* 重载签名：只传样式名 → 名字检测；样式名 + 值 → 值检测 */
export function isStyleSupport(styleName: string | string[]): boolean;
export function isStyleSupport(styleName: string, styleValue: any): boolean;

export function isStyleSupport(styleName: string | string[], styleValue?: any) {
  if (!Array.isArray(styleName) && styleValue !== undefined)
    return isStyleValueSupport(styleName, styleValue);

  return isStyleNameSupport(styleName);
}

/**
 * 滚动条尺寸测量（getScrollBarSize）
 *
 * 测量浏览器滚动条的宽度/高度，供布局计算（如给内容预留滚动条宽度、
 * 弹层对齐偏移）使用。
 * 关键设计：
 * 1. 隐藏测量节点：创建一个 100x100、overflow: scroll 的绝对定位 div
 *    塞进 body，用 offsetWidth - clientWidth 算出滚动条宽度，测量后立即移除；
 * 2. 缓存：默认只测一次（模块级缓存），fresh 参数可强制重新测量；
 * 3. 目标元素自适应：传入 ele 时复制其 scrollbar-color / scrollbar-width
 *    与 ::-webkit-scrollbar 样式，测出与该元素一致的滚动条尺寸（自定义
 *    滚动条样式场景）。
 */
import { removeCSS, updateCSS } from './Dom/dynamicCSS';

/** 滚动条尺寸（宽 + 高） */
interface ScrollBarSize {
  height: number;
  width: number;
}

/** 扩展 CSSStyleDeclaration：非标准滚动条样式属性（Firefox 支持） */
type ExtendCSSStyleDeclaration = CSSStyleDeclaration & {
  scrollbarColor?: string;
  scrollbarWidth?: string;
};

// 模块级缓存：默认只测量一次，之后直接复用
let cached: ScrollBarSize;

/**
 * 实际测量滚动条尺寸
 * @param ele 可选：目标元素，复制其滚动条样式后测量（自定义滚动条场景）
 * @returns 滚动条宽度与高度
 */
function measureScrollbarSize(ele?: HTMLElement): ScrollBarSize {
  // 为测量节点生成唯一 id（供注入的 ::-webkit-scrollbar 样式选择器使用）
  const randomId = `headless-scrollbar-measure-${Math.random().toString(36).substring(7)}`;
  const measureEle = document.createElement('div');
  measureEle.id = randomId;

  // 隐藏测量节点：绝对定位到视口外，100x100 且强制出现滚动条
  const measureStyle = measureEle.style as ExtendCSSStyleDeclaration;
  measureStyle.position = 'absolute';
  measureStyle.left = '0';
  measureStyle.top = '0';
  measureStyle.width = '100px';
  measureStyle.height = '100px';
  measureStyle.overflow = 'scroll';

  let fallbackWidth: number | undefined;
  let fallbackHeight: number | undefined;

  if (ele) {
    // 复制目标元素的滚动条样式，保证测量结果与其一致
    const targetStyle = getComputedStyle(ele) as ExtendCSSStyleDeclaration;
    measureStyle.scrollbarColor = targetStyle.scrollbarColor;
    measureStyle.scrollbarWidth = targetStyle.scrollbarWidth;

    // WebKit 内核：读 ::-webkit-scrollbar 的宽高（px），并注入到测量节点上
    const webkitScrollbarStyle = getComputedStyle(ele, '::-webkit-scrollbar');
    const width = parseInt(webkitScrollbarStyle.width, 10);
    const height = parseInt(webkitScrollbarStyle.height, 10);

    try {
      const widthStyle = width ? `width: ${webkitScrollbarStyle.width};` : '';
      const heightStyle = height
        ? `height: ${webkitScrollbarStyle.height};`
        : '';

      updateCSS(
        `
#${randomId}::-webkit-scrollbar {
${widthStyle}
${heightStyle}
}`,
        randomId,
      );
    } catch (error) {
      // 注入样式失败（如非 WebKit 环境）：回退到解析出的数值
      console.error(error);
      fallbackWidth = width;
      fallbackHeight = height;
    }
  }

  document.body.append(measureEle);

  // 有目标元素样式回退值时优先使用，否则用 offset - client 差值计算
  const scrollWidth =
    ele && fallbackWidth && !Number.isNaN(fallbackWidth)
      ? fallbackWidth
      : measureEle.offsetWidth - measureEle.clientWidth;

  const scrollHeight =
    ele && fallbackHeight && !Number.isNaN(fallbackHeight)
      ? fallbackHeight
      : measureEle.offsetHeight - measureEle.clientHeight;

  // 清理：移除测量节点与注入的样式
  measureEle.remove();
  removeCSS(randomId);

  return {
    width: scrollWidth,
    height: scrollHeight,
  };
}

/**
 * 获取浏览器默认滚动条宽度
 * @param fresh 为 true 时强制重新测量，忽略缓存
 * @returns 滚动条宽度（px）；非浏览器环境返回 0
 */
export default function getScrollBarSize(fresh?: boolean): number {
  // SSR 安全：无 document 时返回 0
  if (typeof document === 'undefined') return 0;

  // 首次调用或 fresh 时测量，之后走缓存
  if (fresh || cached === undefined) cached = measureScrollbarSize();

  return cached.width;
}

/**
 * 获取目标元素（自定义滚动条）的滚动条尺寸
 * @param target 目标元素
 * @returns 滚动条宽度与高度；无 document / 非法 target 时返回 { width: 0, height: 0 }
 */
export function getTargetScrollBarSize(target: HTMLElement) {
  if (
    typeof document === 'undefined' ||
    !target ||
    !(target instanceof Element)
  )
    return { width: 0, height: 0 };

  return measureScrollbarSize(target);
}

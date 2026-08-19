/**
 *  属性挑选工具（pickAttrs）
 *
 * 从一组 props 中挑选出"可安全透传给原生 DOM 元素"的属性，用于把
 * 组件的自定义 props 与需要透传给原生元素的属性分离开。
 * 挑选范围三类：
 * - aria：role 与所有 aria-* 前缀属性（无障碍）；
 * - data：所有 data-* 前缀属性（自定义数据）；
 * - attr：白名单内的标准 HTML 属性与 onXxx 事件。
 */
/** 标准 HTML 属性白名单（aria-* / data-* 不在此列，按前缀单独匹配） */
const attributes = `accept acceptCharset accessKey action allowFullScreen allowTransparency
    alt async autoComplete autoFocus autoPlay capture cellPadding cellSpacing challenge
    charSet checked classID className colSpan cols content contentEditable contextMenu
    controls coords crossOrigin data dateTime default defer dir disabled download draggable
    encType form formAction formEncType formMethod formNoValidate formTarget frameBorder
    headers height hidden high href hrefLang htmlFor httpEquiv icon id inputMode integrity
    is keyParams keyType kind label lang list loop low manifest marginHeight marginWidth max maxLength media
    mediaGroup method min minLength multiple muted name noValidate nonce open
    optimum pattern placeholder poster preload radioGroup readOnly rel required
    reversed role rowSpan rows sandbox scope scoped scrolling seamless selected
    shape size sizes span spellCheck src srcDoc srcLang srcSet start step style
    summary tabIndex target title type useMap value width wmode wrap`;

/** 事件名白名单（onXxx 风格），命中即视为需要透传的事件属性 */
const eventsName = `onCopy onCut onPaste onCompositionEnd onCompositionStart onCompositionUpdate onKeyDown
    onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onClick onContextMenu onDoubleClick
    onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown
    onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onSelect onTouchCancel
    onTouchEnd onTouchMove onTouchStart onScroll onWheel onAbort onCanPlay onCanPlayThrough
    onDurationChange onEmptied onEncrypted onEnded onError onLoadedData onLoadedMetadata
    onLoadStart onPause onPlay onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend onTimeUpdate onVolumeChange onWaiting onLoad
    onPointerDown onPointerMove onPointerUp onPointerCancel onPointerEnter onPointerLeave onPointerOver onPointerOut onGotPointerCapture onLostPointerCapture
    onAnimationStart onAnimationEnd onAnimationIteration
    onTransitionEnd onTransitionRun onTransitionStart onTransitionCancel
    onBeforeInput onReset onInvalid
    onAuxClick onToggle onBeforeToggle onCancel onClose onResize onScrollEnd`;

// 合并两份白名单并预切分为数组（避免每次挑选时重复 split）
const propList = new Set(`${attributes} ${eventsName}`.split(/\s+/));

const ariaPrefix = 'aria-';
const dataPrefix = 'data-';

/** 判断 key 是否以指定前缀开头（用于匹配 aria-* / data-*） */
function match(key: string, prefix: string) {
  return key.startsWith(prefix);
}

/** 挑选配置：分别开关 aria / data / attr 三类属性的挑选 */
export interface PickConfig {
  aria?: boolean;
  attr?: boolean;
  data?: boolean;
}

/**
 * Picker props from exist props with filter
 * 从 props 中按配置挑选出需要透传的属性，返回新的属性对象。
 * @param props Passed props
 * @param props 源 props 对象
 * @param ariaOnly boolean | { aria?: boolean; data?: boolean; attr?: boolean; } filter config
 * @param ariaOnly false 时挑选全部三类；true 时仅挑 aria-*；传对象时按字段精确控制
 */
export function pickAttrs(
  props: object,
  ariaOnly: boolean | PickConfig = false,
) {
  // 归一化配置：boolean 简写展开为对象
  let mergedConfig: PickConfig;
  if (ariaOnly === false) {
    mergedConfig = {
      aria: true,
      data: true,
      attr: true,
    };
  } else if (ariaOnly === true) {
    mergedConfig = {
      aria: true,
    };
  } else {
    mergedConfig = {
      ...ariaOnly,
    };
  }

  const attrs: Record<string, any> = {};
  Object.keys(props).forEach((key) => {
    if (
      // Aria
      // role 与 aria-* 前缀命中（无障碍属性）
      (mergedConfig.aria && (key === 'role' || match(key, ariaPrefix))) ||
      // Data
      // data-* 前缀命中（自定义数据属性）
      (mergedConfig.data && match(key, dataPrefix)) ||
      // Attr
      // 命中标准属性/事件白名单
      (mergedConfig.attr && propList.has(key))
    ) {
      attrs[key] = (props as any)[key];
    }
  });
  return attrs;
}

/**
 * @file SharedTooltip 共享文字提示组件。
 *
 * 逻辑复刻 VXE Tooltip：组件挂载后把默认插槽中的触发元素从面板容器里搬出来，
 * 面板本身挂到 body 上，再根据触发元素的位置计算浮层坐标。这样触发元素可以
 * 留在组件使用处，而面板不受父级 overflow / transform 的影响。
 */

import type { App, CSSProperties, PropType, SetupContext, VNode } from 'vue';

import type { AsScrollbarInstance } from '../scrollbar/scrollbar';
import type {
  AsSharedTooltipConstructor,
  AsSharedTooltipEmits,
  AsSharedTooltipProps,
  TooltipInternalData,
  TooltipMethods,
  TooltipPrivateComputed,
  TooltipPrivateRef,
  TooltipReactData,
} from './shared-tooltip';

import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRef,
  watch,
} from 'vue';

import {
  arrayEach,
  assign,
  clsx,
  debounce,
  eqNull,
  isElement,
  isFunction,
  isString,
  uniqueId,
} from '@arvin-studio/kit';

import { toCssUnit } from '../_util/dom';
import { getSlotVNs } from '../_util/vn';
import { useComponentBaseConfig } from '../config-provider/context';
import { useSize } from '../config-provider/hooks/useSize';
import Scrollbar from '../scrollbar';
import useSharedTooltipStyle from './style/shared';
import { getLastZIndex, nextZIndex } from './util';

/**
 * 创建 Tooltip 的响应式数据。
 * 每次重置时都返回全新对象，避免旧面板状态残留。
 */
function createReactData(): TooltipReactData {
  return {
    target: null,
    isUpdate: false,
    visible: false,
    tipPos: null,
    tipContent: '',
    tipActive: false,
    tipTarget: null,
    tipZindex: 0,
    tipStore: {
      style: {},
      placement: '',
      arrowStyle: {},
    },
  };
}

/** 组件事件名联合类型 */
type SharedTooltipEmitType = AsSharedTooltipEmits[number];

/** 组件内部状态，在类型文件之外补充动画收尾所需的定时器 */
interface SharedTooltipInternalData extends TooltipInternalData {
  closeTimer?: ReturnType<typeof setTimeout>;
}

const SharedTooltip = defineComponent({
  name: 'AsSharedTooltip',
  props: {
    prefixCls: {
      type: String,
      default: undefined,
    },
    rootClass: {
      type: String,
      default: undefined,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<AsSharedTooltipProps['size']>,
      default: undefined,
    },
    selector: {
      type: [String, Object] as unknown as PropType<
        AsSharedTooltipProps['selector']
      >,
      default: undefined,
    },
    trigger: {
      type: String as PropType<AsSharedTooltipProps['trigger']>,
      default: 'hover',
    },
    content: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['content']
      >,
      default: null,
    },
    useHtml: {
      type: Boolean,
      default: false,
    },
    useScrollbar: {
      type: Boolean,
      default: false,
    },
    scrollbarConfig: {
      type: Object as PropType<AsSharedTooltipProps['scrollbarConfig']>,
      default: undefined,
    },
    zIndex: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['zIndex']
      >,
      default: undefined,
    },
    popupClassName: {
      type: [String, Function] as unknown as PropType<
        AsSharedTooltipProps['popupClassName']
      >,
      default: undefined,
    },
    width: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['width']
      >,
      default: undefined,
    },
    height: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['height']
      >,
      default: undefined,
    },
    minWidth: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['minWidth']
      >,
      default: undefined,
    },
    minHeight: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['minHeight']
      >,
      default: undefined,
    },
    maxWidth: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['maxWidth']
      >,
      default: undefined,
    },
    maxHeight: {
      type: [String, Number] as unknown as PropType<
        AsSharedTooltipProps['maxHeight']
      >,
      default: undefined,
    },
    placement: {
      type: String as PropType<AsSharedTooltipProps['placement']>,
      default: undefined,
    },
    defaultPlacement: {
      type: String as PropType<AsSharedTooltipProps['defaultPlacement']>,
      default: undefined,
    },
    isArrow: {
      type: Boolean,
      default: true,
    },
    enterable: {
      type: Boolean,
      default: false,
    },
    enterDelay: {
      type: Number,
      default: 500,
    },
    leaveDelay: {
      type: Number,
      default: 300,
    },
    /**
     * 保留类型文件中的 `leaveMethod` 属性。
     * 当前 VXE 源码并未消费该属性，这里同样不实现额外语义。
     */
    leaveMethod: {
      type: Function as PropType<AsSharedTooltipProps['leaveMethod']>,
      default: undefined,
    },
  },
  emits: ['update:modelValue'] as AsSharedTooltipEmits,
  setup(props, context) {
    const { slots, emit } = context;
    const xID = uniqueId();

    const mergedSize = useSize(toRef(props, 'size'));
    const {
      class: contextClass,
      prefixCls,
      style: contextStyle,
    } = useComponentBaseConfig('shared-tooltip', props);
    const [hashId, cssVarCls] = useSharedTooltipStyle(prefixCls);

    const reactData: TooltipReactData = reactive(createReactData());
    const internalData: SharedTooltipInternalData = {};

    const refElem = ref<HTMLDivElement>();
    const contentWrapperfElem = ref<HTMLDivElement>();
    const contentScrollbar = ref<AsScrollbarInstance>();

    const refMaps: TooltipPrivateRef = {
      refElem,
    };

    /**
     * 面板内容区的尺寸样式。
     * 尺寸类属性由使用方控制，未设置的项不写内联样式，交给 CSS 默认值。
     */
    const computeWrapperStyle = computed<CSSProperties>(() => {
      const stys: CSSProperties = {};

      if (props.width) {
        stys.width = toCssUnit(props.width);
      }
      if (props.height) {
        stys.height = toCssUnit(props.height);
      }
      if (props.minWidth) {
        stys.minWidth = toCssUnit(props.minWidth);
      }
      if (props.minHeight) {
        stys.minHeight = toCssUnit(props.minHeight);
      }
      if (props.maxWidth) {
        stys.maxWidth = toCssUnit(props.maxWidth);
      }
      if (props.maxHeight) {
        stys.maxHeight = toCssUnit(props.maxHeight);
      }
      return stys;
    });

    /**
     * Scrollbar 的视图元素宽度默认由内容撑开。
     * 不设置时 Scrollbar 自身会给 view 写入 width: 100%，在 tooltip 的
     * shrink-to-fit 容器中会退化成最小宽度。
     */
    const computeScrollbarViewStyle = computed<CSSProperties>(() => {
      const stys = { ...computeWrapperStyle.value };
      if (!stys.width) {
        stys.width = 'max-content';
      }
      return stys;
    });

    const getRefMaps = () => refMaps;
    const getComputeMaps = (): TooltipPrivateComputed => ({});

    const $asSharedTooltip = {
      xID,
      props: props as unknown as AsSharedTooltipProps,
      context: context as unknown as SetupContext<AsSharedTooltipEmits>,
      reactData,
      internalData,
      getComputeMaps,
      getRefMaps,
    } as unknown as AsSharedTooltipConstructor;

    const dispatchEvent = (
      type: SharedTooltipEmitType,
      params: Record<string, any>,
      evnt: Event | null,
    ) => {
      (emit as any)(type, {
        ...params,
        $event: evnt,
        $tooltip: $asSharedTooltip,
      });
    };

    /**
     * 计算面板位置与箭头位置。
     *
     * 坐标基于 `getBoundingClientRect`（视口坐标）；面板绝对定位在 body 下，
     * 使用文档坐标，因此赋值前需要加上页面滚动偏移。
     * 未显式指定 placement 时根据 defaultPlacement 与视口空间自动上下翻转。
     */
    const updateTipStyle = () => {
      const { isArrow, placement, defaultPlacement } = props;
      const { tipTarget: targetElem, tipStore, tipPos } = reactData;
      // eslint-disable-next-line no-useless-assignment
      let top: '' | number = '';
      // eslint-disable-next-line no-useless-assignment
      let left: '' | number = '';
      let panelPlacement: 'bottom' | 'top' = 'bottom';
      let arrowLeft: '' | number = '';
      const panelElem = refElem.value;
      if (panelElem && targetElem) {
        const documentElement = document.documentElement;
        const bodyElem = document.body;
        const targetWidth = targetElem.offsetWidth;
        const targetHeight = targetElem.offsetHeight;
        const panelHeight = panelElem.offsetHeight;
        const panelWidth = panelElem.offsetWidth;

        const targetRect = targetElem.getBoundingClientRect();
        const visibleHeight =
          documentElement.clientHeight || bodyElem.clientHeight;
        const visibleWidth =
          documentElement.clientWidth || bodyElem.clientWidth;

        const marginSize = 6;
        left = targetRect.left;
        top = targetRect.top + targetHeight;
        if (tipPos && (tipPos.oLeft || tipPos.oTop)) {
          if (isArrow) {
            left =
              left +
              Math.max(8, Math.min(targetWidth - 8, tipPos.oLeft)) -
              panelWidth / 2;
          } else {
            left = tipPos.x + 1;
            top = tipPos.y + 1;
          }
        } else {
          left = targetRect.left + (targetWidth - panelWidth) / 2;
        }
        if (placement === 'top') {
          panelPlacement = 'top';
          top = targetRect.top - panelHeight;
        } else if (!placement) {
          if (defaultPlacement === 'top') {
            panelPlacement = 'top';
            top = targetRect.top - panelHeight;
            // 如果上面不够放，则向下
            if (top < marginSize) {
              panelPlacement = 'bottom';
              top = targetRect.top + targetHeight;
            }
            // 如果下面不够放，则向上（优先）
            if (top + panelHeight + marginSize > visibleHeight) {
              panelPlacement = 'top';
              top = targetRect.top - panelHeight;
            }
          } else {
            // 如果下面不够放，则向上
            if (top + panelHeight + marginSize > visibleHeight) {
              panelPlacement = 'top';
              top = targetRect.top - panelHeight;
            }
            // 如果上面不够放，则向下（优先）
            if (top < marginSize) {
              panelPlacement = 'bottom';
              top = targetRect.top + targetHeight;
            }
          }
        }
        // 如果溢出右边
        if (left + panelWidth + marginSize > visibleWidth) {
          left -= left + panelWidth + marginSize - visibleWidth;
        }
        // 如果溢出左边
        if (left < marginSize) {
          left = marginSize;
        }

        // 箭头
        if (left === targetRect.left) {
          if (targetWidth <= panelWidth) {
            arrowLeft = targetWidth / 2;
          }
        } else if (left < targetRect.left) {
          arrowLeft =
            left + panelWidth > targetRect.left + targetWidth
              ? targetRect.left - left + targetWidth / 2
              : targetRect.left -
                left +
                (panelWidth - (targetRect.left - left)) / 2;
        }

        // 面板绝对定位在 body 下，getBoundingClientRect 得到视口坐标，
        // 需要加上页面滚动偏移换算成文档坐标，否则页面滚动后整体偏移。
        const offsetTop = window.scrollY || documentElement.scrollTop || 0;
        const offsetLeft = window.scrollX || documentElement.scrollLeft || 0;
        tipStore.placement = panelPlacement;
        tipStore.style.top = `${Number(top) + offsetTop}px`;
        tipStore.style.left = `${Number(left) + offsetLeft}px`;
        tipStore.arrowStyle.left = `${arrowLeft}px`;
      }
    };

    const updateValue = (value: boolean) => {
      if (value === reactData.visible) {
        return;
      }
      reactData.visible = value;
      reactData.isUpdate = true;
      emit('update:modelValue', value);
    };

    const updateZindex = () => {
      if (reactData.tipZindex < getLastZIndex()) {
        reactData.tipZindex = nextZIndex();
      }
    };

    const clickEvent = () => {
      if (reactData.visible) {
        tooltipMethods.close();
      } else {
        handleVisible(reactData.target || getSelectorEl(), props.content);
      }
    };

    const targetMouseenterEvent = () => {
      handleVisible(reactData.target || getSelectorEl(), props.content);
    };

    /**
     * 重建进入延迟的防抖函数。
     * enterDelay 变化时需要重新生成，否则旧闭包会继续使用旧延迟。
     */
    const handleDelayFn = () => {
      internalData.showDelayTip = debounce(
        () => {
          // 延迟期间鼠标已经离开时不再显示，避免面板“迟到”
          if (reactData.tipActive) {
            showTip();
          }
        },
        props.enterDelay,
        { leading: false, trailing: true },
      );
    };

    /**
     * 鼠标离开触发元素。
     * enterable 时给用户留出从触发元素移入面板的时间，
     * 延迟结束后若仍未进入面板则关闭。
     */
    const targetMouseleaveEvent = () => {
      const { trigger, enterable, leaveDelay } = props;
      reactData.tipActive = false;
      if (enterable && trigger === 'hover') {
        setTimeout(() => {
          if (!reactData.tipActive) {
            tooltipMethods.close();
          }
        }, leaveDelay);
      } else {
        tooltipMethods.close();
      }
    };

    /** 鼠标进入面板，取消离开延迟中的关闭动作 */
    const wrapperMouseenterEvent = () => {
      reactData.tipActive = true;
    };

    /** 鼠标离开面板，enterable 时同样延迟判断是否关闭 */
    const wrapperMouseleaveEvent = () => {
      const { trigger, enterable, leaveDelay } = props;
      reactData.tipActive = false;
      if (enterable && trigger === 'hover') {
        setTimeout(() => {
          if (!reactData.tipActive) {
            tooltipMethods.close();
          }
        }, leaveDelay);
      }
    };
    /**
     * 显示面板：先把面板挂到 body，再初始化位置与层级。
     * 挂载动作放在显示时做，避免组件未使用时就创建游离节点。
     */
    const showTip = () => {
      const { tipStore } = reactData;
      const el = refElem.value;
      if (el) {
        const parentNode = el.parentNode;
        if (!parentNode) {
          document.body.append(el);
        }
      }
      updateValue(true);
      updateZindex();
      tipStore.placement = 'top';

      tipStore.style = {
        width: 'auto',
        left: 0,
        top: 0,
        zIndex: props.zIndex || reactData.tipZindex,
      };
      tipStore.arrowStyle = { left: '50%' };
      return tooltipMethods.updatePlacement();
    };

    /**
     * 处理显示请求。
     * @param target 触发元素；为空时直接跳过
     * @param content 临时内容，优先级高于 content prop
     * @param evnt 鼠标事件，存在时按鼠标位置定位
     */
    const handleVisible = (
      target: HTMLElement | null,
      content?: AsSharedTooltipProps['content'],
      evnt?: MouseEvent,
    ) => {
      const contentSlot = slots.content;
      if (!contentSlot && (content === '' || eqNull(content))) {
        return nextTick();
      }
      if (target) {
        const { showDelayTip } = internalData;
        const { trigger, enterDelay } = props;
        reactData.tipPos = evnt
          ? {
              x: evnt.clientX,
              y: evnt.clientY,
              oLeft: evnt.offsetX,
              oTop: evnt.offsetY,
            }
          : null;
        reactData.tipActive = true;
        reactData.tipTarget = target;
        reactData.tipContent = content;
        if (reactData.visible) {
          return $asSharedTooltip.updatePlacement();
        }
        if (enterDelay && trigger === 'hover') {
          if (showDelayTip) {
            showDelayTip();
          }
        } else {
          return showTip();
        }
      }
      return nextTick();
    };

    /** 解析 selector 属性，支持真实元素或 CSS 选择器字符串 */
    const getSelectorEl = (): HTMLElement | null => {
      const { selector } = props;
      if (selector) {
        if (isElement(selector)) {
          return selector as HTMLElement;
        }
        if (isString(selector)) {
          return document.querySelector(selector) as HTMLElement | null;
        }
      }
      return null;
    };

    const tooltipMethods: TooltipMethods = {
      dispatchEvent,
      openByEvent(evnt: Event, target?: any, content?: any) {
        return handleVisible(
          target || (reactData.target as HTMLElement) || getSelectorEl(),
          content,
          evnt as MouseEvent,
        );
      },
      open(target?: any, content?: any) {
        return handleVisible(
          target || (reactData.target as HTMLElement) || getSelectorEl(),
          content,
        );
      },
      close() {
        reactData.tipPos = null;
        reactData.tipTarget = null;
        reactData.tipActive = false;
        Object.assign(reactData.tipStore, {
          style: {},
          placement: '',
          arrowStyle: null,
        });
        updateValue(false);
        return nextTick();
      },
      toVisible(target?: HTMLElement, content?: any) {
        return handleVisible(target || null, content);
      },
      updatePlacement() {
        const { visible, tipTarget } = reactData;
        let el = refElem.value;
        if (visible && tipTarget && el) {
          updateTipStyle();
        }
        return nextTick().then(() => {
          el = refElem.value;
          if (tipTarget && el) {
            updateTipStyle();
            return nextTick().then(() => {
              updateTipStyle();
              // 面板从 display:none 变为可见后，Scrollbar 才能量到真实尺寸；
              // 第一次 recalculate 会让轨道从 display:none 变为可见，再补一次才能量到轨道宽度
              if (contentScrollbar.value) {
                const scrollbar = contentScrollbar.value;
                void scrollbar.recalculate();
                return nextTick().then(() => scrollbar.recalculate());
              }
            });
          }
        });
      },
      isActived() {
        return reactData.tipActive;
      },
      setActived(actived: boolean) {
        reactData.tipActive = !!actived;
      },
    };

    Object.assign($asSharedTooltip, tooltipMethods);

    /** 阻止面板内滚动事件冒泡，避免触发外层的滚动监听 */
    const wheelEvent = (evnt: Event) => {
      evnt.stopPropagation();
    };

    /** 渲染面板内容：插槽 > useHtml > 纯文本 */
    const renderContent = () => {
      const { useHtml, useScrollbar, scrollbarConfig } = props;
      const { tipContent } = reactData;
      const contentSlot = slots.content;
      const contentVNs: VNode[] = [];

      if (contentSlot) {
        contentVNs.push(
          h('div', { key: 'ct' }, getSlotVNs(contentSlot({}) as any)),
        );
      } else if (useHtml) {
        contentVNs.push(
          h('div', {
            key: 'ch',
            innerHTML: tipContent === undefined ? '' : `${tipContent}`,
          }),
        );
      } else {
        contentVNs.push(
          h(
            'span',
            { key: 'cd' },
            `${tipContent === undefined ? '' : tipContent}`,
          ),
        );
      }

      if (useScrollbar) {
        const {
          className,
          viewClassName,
          viewInnerClassName,
          ...restConfig
        } = scrollbarConfig || {};

        return h(
          Scrollbar,
          {
            ...restConfig,
            ref: contentScrollbar,
            class: clsx(
              `${prefixCls.value}-scrollbar-content`,
              className,
            ),
            viewClassName: clsx(
              `${prefixCls.value}-scrollbar-content-view`,
              viewClassName,
            ),
            viewInnerClassName: clsx(
              `${prefixCls.value}-scrollbar-content-inner`,
              viewInnerClassName,
            ),
            viewStyle: computeScrollbarViewStyle.value,
          },
          {
            default: () => contentVNs,
          },
        );
      }

      return h(
        'div',
        {
          key: 3,
          ref: contentWrapperfElem,
          class: `${prefixCls.value}-content`,
          style: computeWrapperStyle.value,
        },
        contentVNs,
      );
    };

    /** 渲染面板根节点，默认插槽中的元素作为触发元素 */
    const renderVN = () => {
      const { popupClassName, isArrow, enterable } = props;
      const { tipActive, visible, tipStore } = reactData;
      const defaultSlot = slots.default;
      const size = mergedSize.value;
      const popupCls = isFunction(popupClassName)
        ? popupClassName({ $tooltip: $asSharedTooltip })
        : popupClassName;

      const wrapperProps: Record<string, any> = {
        ref: refElem,
        class: clsx(
          prefixCls.value,
          popupCls,
          {
            [`${prefixCls.value}-${size}`]: size,
            [`${prefixCls.value}-placement-${tipStore.placement}`]:
              tipStore.placement,
            [`${prefixCls.value}-enterable`]: enterable,
            // 退场期间 visible 已经为 false，但面板还要继续显示到动画结束
            [`${prefixCls.value}-visible`]: visible,
            [`${prefixCls.value}-has-arrow`]: isArrow,
            [`${prefixCls.value}-active`]: tipActive,
          },
          contextClass.value,
          props.rootClass,
          hashId.value,
          cssVarCls.value,
        ),
        style: {
          ...(tipStore.style as CSSProperties),
          ...contextStyle.value,
        },
      };

      // enterable 时面板自身也要参与鼠标事件，否则无法从触发元素移入面板
      if (enterable) {
        wrapperProps.onMouseenter = wrapperMouseenterEvent;
        wrapperProps.onMouseleave = wrapperMouseleaveEvent;
      }

      return h('div', wrapperProps, [
        h('div', { key: 'tby', class: `${prefixCls.value}-body` }, [
          renderContent(),
          h('div', {
            class: `${prefixCls.value}-arrow`,
            style: tipStore.arrowStyle as CSSProperties,
          }),
        ]),
        ...(defaultSlot ? getSlotVNs(defaultSlot({})) : []),
      ]);
    };

    watch(
      () => props.enterDelay,
      () => {
        handleDelayFn();
      },
    );

    watch(
      () => props.content,
      (val) => {
        reactData.tipContent = val;
      },
    );

    watch(
      () => props.modelValue,
      (val) => {
        // isUpdate 为 true 说明这次变化来自组件内部，无需再次处理
        if (!reactData.isUpdate) {
          if (val) {
            void handleVisible(
              reactData.target || getSelectorEl(),
              props.content,
            );
          } else {
            void $asSharedTooltip.close();
          }
        }
        reactData.isUpdate = false;
      },
    );

    handleDelayFn();

    onMounted(() => {
      const contentScrollbarEl = contentScrollbar.value;
      const scrollbarViewEl = contentScrollbarEl?.getScrollViewElem();
      if (scrollbarViewEl) {
        scrollbarViewEl.addEventListener('wheel', wheelEvent, {
          passive: false,
        });
        internalData.scrollbarViewEl = scrollbarViewEl;
      }
      const contentWrapperfEl = contentWrapperfElem.value;
      if (contentWrapperfEl) {
        contentWrapperfEl.addEventListener('wheel', wheelEvent, {
          passive: false,
        });
      }
      nextTick(() => {
        const { trigger, content } = props;
        const wrapperElem = refElem.value;
        if (wrapperElem) {
          const parentNode = wrapperElem.parentNode;
          if (parentNode) {
            reactData.tipContent = content;
            reactData.tipZindex = nextZIndex();
            arrayEach(wrapperElem.children, (elem, index) => {
              if (!index) {
                return;
              }

              wrapperElem.before(elem);
              if (!reactData.target) {
                reactData.target = elem as HTMLElement;
              }
            });
            wrapperElem.remove();
            const { target } = reactData;
            if (target) {
              if (trigger === 'hover') {
                target.onmouseenter = targetMouseenterEvent;
                target.onmouseleave = targetMouseleaveEvent;
              } else if (trigger === 'click') {
                target.onclick = clickEvent;
              }
            }
            if (props.modelValue) {
              handleVisible(target || getSelectorEl(), content);
            }
          }
        }
      });
    });

    onBeforeUnmount(() => {
      const { target } = reactData;
      const wrapperElem = refElem.value;
      if (target) {
        target.onmouseenter = null;
        target.onmouseleave = null;
        target.onclick = null;
      }
      const contentWrapperfEl = contentWrapperfElem.value;
      if (contentWrapperfEl) {
        contentWrapperfEl.removeEventListener('wheel', wheelEvent);
      }
      const { scrollbarViewEl } = internalData;
      if (scrollbarViewEl) {
        scrollbarViewEl.removeEventListener('wheel', wheelEvent);
      }
      if (wrapperElem) {
        const parentNode = wrapperElem.parentNode;
        if (parentNode) {
          wrapperElem.remove();
        }
      }
    });

    onUnmounted(() => {
      assign(reactData, createReactData());
      assign(internalData, {});
    });

    $asSharedTooltip.renderVN = renderVN;

    return $asSharedTooltip;
  },
  render() {
    // setup 返回的构造器对象会挂到组件实例上，这里直接复用 renderVN
    // eslint-disable-next-line unicorn/no-this-outside-of-class
    return (this as unknown as AsSharedTooltipConstructor).renderVN();
  },
});

(SharedTooltip as any).install = (app: App) => {
  app.component(SharedTooltip.name!, SharedTooltip);
};

export default SharedTooltip;

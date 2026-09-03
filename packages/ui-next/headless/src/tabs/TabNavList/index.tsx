/**
 * TabNavList（TSX 版，对应 TabNavList/index.vue）
 *
 * 标签导航栏（最复杂的一块）：
 * - 布局：extra-left + wrap（tab 列表，可滚动）+ more 操作节点 + extra-right；
 * - 溢出管理：ResizeObserver 测量各尺寸 → useVisibleRange 计算可见区间 →
 *   隐藏标签收进 OperationNode 的"更多"下拉；
 * - 滚动：transform 平移 + 边界钳制（alignInRange）+ scrollToTab 定位激活项；
 * - 指示条（ink-bar）：useIndicator 按激活项 offset 计算位置/宽度；
 * - 交互：点击切换、键盘导航（方向键/Home/End/Delete）、触摸滑动（useTouchMove）、
 *   滚轮（垂直方向）、焦点管理（focusKey + isMouse）。
 */
import type { CSSProperties, Ref } from 'vue';

import type { SizeInfo, Tab, TabNavListProps } from '../interface';

import {
  computed,
  defineComponent,
  Fragment,
  h,
  nextTick,
  onUnmounted,
  shallowRef,
  toRefs,
  useSlots,
  watch,
} from 'vue';

import ResizeObserver from '../../resize-observer';
import { RenderComponent } from '../../util/RenderComponent';
import useIndicator from '../hooks/useIndicator';
import useOffsets from '../hooks/useOffsets';
import useTouchMove from '../hooks/useTouchMove';
import useVisibleRange from '../hooks/useVisibleRange';
import { useTabContext } from '../TabContext';
import { genDataNodeKey } from '../utils';
import AddButton from './AddButton';
import ExtraContent from './ExtraContent';
import OperationNode from './OperationNode';
import TabNode from './TabNode';

const TabNavList = defineComponent<TabNavListProps>(
  (props) => {
    const {
      className,
      style,
      id,
      animated,
      activeKey,
      rtl,
      extra,
      editable,
      locale,
      tabPosition,
      tabBarGutter: tabBarGutterProp,
      children,
      onTabClick,
      onTabScroll,
      indicator,
      classNames: tabsClassNames,
      styles,
      mobile,
      more,
      getPopupContainer,
      popupClassName,
    } = toRefs(props) as any;

    const tabBarGutter = computed(() =>
      tabBarGutterProp.value ? `${tabBarGutterProp.value}px` : undefined,
    );

    // Support scoped default slot as `children` wrapper function.
    // When consumer uses `<template #default="node">...</template>`,
    // we invoke the slot for each internal `TabNode`.
    const slots = useSlots();
    const defaultSlotWrapper = computed(() => {
      if (!slots.default) return undefined;

      return (node: any) => {
        // Pass the tab node directly so `#default="node"` works.
        const slotResult = slots.default?.(node);
        if (!slotResult) return node;

        // Preserve fragment semantics (no extra wrapper element).
        if (Array.isArray(slotResult))
          return slotResult.length > 0 ? h(Fragment, null, slotResult) : node;

        // Slot can return a single VNode.
        return slotResult;
      };
    });

    const renderWrapper = computed(
      () => children.value ?? defaultSlotWrapper.value,
    );

    // const { tabs, prefixCls } = toRefs(useTabContext()?.value || {})
    const ctx = useTabContext();
    const tabs = computed(() => ctx?.value.tabs || []);
    const prefixCls = computed(() => ctx?.value.prefixCls || '');

    const containerRef = shallowRef<HTMLDivElement | null>(null);
    const extraLeftRef = shallowRef<null | { extraContentRef?: HTMLElement }>(
      null,
    );
    const extraRightRef = shallowRef<null | { extraContentRef?: HTMLElement }>(
      null,
    );
    const tabsWrapperRef = shallowRef<HTMLDivElement | null>(null);
    const tabListRef = shallowRef<HTMLDivElement | null>(null);

    const tabPositionTopOrBottom = computed(
      () => tabPosition.value === 'top' || tabPosition.value === 'bottom',
    );

    const transformLeft = shallowRef(0);
    const transformTop = shallowRef(0);

    watch(
      transformLeft,
      (next, prev) => {
        if (tabPositionTopOrBottom.value && onTabScroll) {
          props.onTabScroll?.({
            direction: next > (prev || 0) ? 'left' : 'right',
          });
        }
      },
      { immediate: true },
    );

    watch(
      transformTop,
      (next, prev) => {
        if (!tabPositionTopOrBottom.value && onTabScroll) {
          props.onTabScroll?.({
            direction: next > (prev || 0) ? 'top' : 'bottom',
          });
        }
      },
      { immediate: true },
    );

    const containerExcludeExtraSize = shallowRef<SizeInfo>([0, 0]);
    const tabContentSize = shallowRef<SizeInfo>([0, 0]);
    const firstTabContentSize = computed(() => tabContentSize.value[0]);
    const addSize = shallowRef<SizeInfo>([0, 0]);
    const operationSize = shallowRef<SizeInfo>([0, 0]);

    const tabSizes = shallowRef(new Map());
    const tabOffsets = useOffsets(tabs, tabSizes, firstTabContentSize);
    const operationsRef = shallowRef<null | { operationNodeRef?: HTMLElement }>(
      null,
    );
    const innerAddButtonRef = shallowRef<null | { buttonRef?: HTMLElement }>(
      null,
    );

    /**
     * Convert `SizeInfo` to unit value. Such as [123, 456] with `top` position get `123`
     */
    function getUnitValue(size: SizeInfo, tabPositionTopOrBottom: boolean) {
      return size[tabPositionTopOrBottom ? 0 : 1];
    }

    // ========================== Unit =========================
    const containerExcludeExtraSizeValue = computed(() =>
      getUnitValue(
        containerExcludeExtraSize.value,
        tabPositionTopOrBottom.value,
      ),
    );

    const tabContentSizeValue = computed(() =>
      getUnitValue(tabContentSize.value, tabPositionTopOrBottom.value),
    );
    const addSizeValue = computed(() =>
      getUnitValue(addSize.value, tabPositionTopOrBottom.value),
    );
    const operationSizeValue = computed(() =>
      getUnitValue(operationSize.value, tabPositionTopOrBottom.value),
    );

    const needScroll = computed(
      () =>
        Math.floor(containerExcludeExtraSizeValue.value) <
        Math.floor(tabContentSizeValue.value + addSizeValue.value),
    );
    const visibleTabContentValue = computed(() =>
      needScroll.value
        ? containerExcludeExtraSizeValue.value - operationSizeValue.value
        : containerExcludeExtraSizeValue.value - addSizeValue.value,
    );
    // ========================== Util =========================
    const operationsHiddenClassName = computed(
      () => `${prefixCls.value}-nav-operations-hidden`,
    );

    const transformComputed = computed(() => {
      // eslint-disable-next-line no-useless-assignment
      let transformMin = 0;
      // eslint-disable-next-line no-useless-assignment
      let transformMax = 0;

      if (!tabPositionTopOrBottom.value) {
        transformMin = Math.min(
          0,
          visibleTabContentValue.value - tabContentSizeValue.value,
        );
        transformMax = 0;
      } else if (rtl.value) {
        transformMin = 0;
        transformMax = Math.max(
          0,
          tabContentSizeValue.value - visibleTabContentValue.value,
        );
      } else {
        transformMin = Math.min(
          0,
          visibleTabContentValue.value - tabContentSizeValue.value,
        );
        transformMax = 0;
      }
      return {
        transformMin,
        transformMax,
      };
    });

    function alignInRange(value: number): number {
      const { transformMin, transformMax } = transformComputed.value;
      if (value < transformMin) {
        return transformMin;
      }
      if (value > transformMax) {
        return transformMax;
      }
      return value;
    }

    // ========================= Mobile ========================
    const touchMovingRef = shallowRef<null | ReturnType<typeof setTimeout>>(
      null,
    );

    const lockAnimation = shallowRef<number>();
    function doLockAnimation() {
      lockAnimation.value = Date.now();
    }

    function clearTouchMoving() {
      if (touchMovingRef.value) {
        clearTimeout(touchMovingRef.value);
      }
    }

    useTouchMove(tabsWrapperRef, (offsetX, offsetY) => {
      function doMove(dataRef: Ref<number>, offset: number) {
        dataRef.value = alignInRange(dataRef.value + offset);
      }

      // Skip scroll if place is enough
      if (!needScroll.value) {
        return false;
      }

      if (tabPositionTopOrBottom.value) {
        doMove(transformLeft, offsetX);
      } else {
        doMove(transformTop, offsetY);
      }

      clearTouchMoving();
      doLockAnimation();

      return true;
    });

    watch(
      () => lockAnimation.value,
      async (_n, _o, onCleanup) => {
        await nextTick();
        if (lockAnimation.value) {
          touchMovingRef.value = setTimeout(() => {
            lockAnimation.value = 0;
          }, 100);
        }
        onCleanup(() => {
          clearTouchMoving();
        });
      },
      { immediate: true },
    );

    onUnmounted(() => {
      clearTouchMoving();
    });
    // ===================== Visible Range =====================
    const visibleRangeRef = useVisibleRange(
      tabOffsets,
      // Container
      visibleTabContentValue,
      // Transform
      computed(() =>
        tabPositionTopOrBottom.value ? transformLeft.value : transformTop.value,
      ),
      // Tabs
      tabContentSizeValue,
      // Add
      addSizeValue,
      // Operation
      operationSizeValue,
      { tabs, tabPosition, rtl },
    );
    const visibleStart = computed(() => visibleRangeRef.value[0]);
    const visibleEnd = computed(() => visibleRangeRef.value[1]);
    const hiddenTabs = computed(() => {
      const startHidden = tabs.value.slice(0, visibleStart.value);
      const endHidden = tabs.value.slice(visibleEnd.value + 1);
      return [...startHidden, ...endHidden];
    });
    const hasDropdown = computed(() => hiddenTabs.value.length > 0);
    const wrapPrefix = computed(() => `${prefixCls.value}-nav-wrap`);
    const pingLeft = computed(() =>
      tabPositionTopOrBottom.value
        ? rtl.value
          ? transformLeft.value > 0
          : transformLeft.value < 0
        : false,
    );
    const pingRight = computed(() => {
      if (!tabPositionTopOrBottom.value) return false;
      if (rtl.value)
        return transformLeft.value !== transformComputed.value.transformMax;
      return transformLeft.value !== transformComputed.value.transformMin;
    });
    const pingTop = computed(() =>
      tabPositionTopOrBottom.value ? false : transformTop.value < 0,
    );
    const pingBottom = computed(() =>
      tabPositionTopOrBottom.value
        ? false
        : transformTop.value !== transformComputed.value.transformMin,
    );

    // ========================= Scroll ========================
    function scrollToTab(key = activeKey.value) {
      const tabOffset = tabOffsets.value.get(key) || {
        width: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
      };

      if (tabPositionTopOrBottom.value) {
        // ============ Align with top & bottom ============
        const newTransform = transformLeft;

        // RTL
        if (rtl.value) {
          if (tabOffset.right < transformLeft.value) {
            newTransform.value = tabOffset.right;
          } else if (
            tabOffset.right + tabOffset.width >
            transformLeft.value + visibleTabContentValue.value
          ) {
            newTransform.value =
              tabOffset.right + tabOffset.width - visibleTabContentValue.value;
          }
        }
        // LTR
        else if (tabOffset.left < -transformLeft.value) {
          newTransform.value = -tabOffset.left;
        } else if (
          tabOffset.left + tabOffset.width >
          -transformLeft.value + visibleTabContentValue.value
        ) {
          newTransform.value = -(
            tabOffset.left +
            tabOffset.width -
            visibleTabContentValue.value
          );
        }

        // setTransformTop(0);
        transformTop.value = 0;
        transformLeft.value = alignInRange(newTransform.value);
      } else {
        // ============ Align with left & right ============
        const newTransform = transformTop;

        if (tabOffset.top < -transformTop.value) {
          newTransform.value = -tabOffset.top;
        } else if (
          tabOffset.top + tabOffset.height >
          -transformTop.value + visibleTabContentValue.value
        ) {
          newTransform.value = -(
            tabOffset.top +
            tabOffset.height -
            visibleTabContentValue.value
          );
        }

        transformLeft.value = 0;
        transformTop.value = alignInRange(newTransform.value);
      }
    }

    // ========================= Focus =========================
    const focusKey = shallowRef<string | undefined>();
    const isMouse = shallowRef(false);

    const enabledTabs = computed(() =>
      tabs.value.filter((tab) => !tab.disabled).map((tab) => tab.key),
    );

    function onOffset(offset: number) {
      const enabledKeys = getEnabledKeys(tabs.value);
      const currentIndex = enabledKeys.indexOf(
        focusKey.value || activeKey.value,
      );
      const len = enabledKeys.length;
      const nextIndex = (currentIndex + offset + len) % len;
      focusKey.value = enabledKeys[nextIndex];
    }

    function handleRemoveTab(
      removalKey: string | undefined,
      e: KeyboardEvent | MouseEvent,
    ) {
      if (!removalKey) return;
      const removeTab = tabs.value.find((t) => t.key === removalKey);
      const removable =
        removeTab &&
        !removeTab.disabled &&
        (removeTab.closable || editable.value);
      if (removable) {
        e.preventDefault();
        e.stopPropagation();
        editable.value?.onEdit('remove', { key: removalKey, event: e as any });
        const enabledKeys = getEnabledKeys(tabs.value);
        const removeIndex = enabledKeys.indexOf(removalKey);
        if (removeIndex === enabledKeys.length - 1) onOffset(-1);
        else onOffset(1);
      }
    }

    function handleMouseDown(key: string, e: MouseEvent) {
      isMouse.value = true;
      if (e.button === 1) handleRemoveTab(key, e);
    }

    function handleKeyDown(e: KeyboardEvent) {
      const { code } = e;

      const isRTL = rtl.value && tabPositionTopOrBottom.value;
      const firstEnabledTab = enabledTabs.value[0];
      const lastEnabledTab = enabledTabs.value[enabledTabs.value.length - 1];

      switch (code) {
        // DOWN
        case 'ArrowDown': {
          e.preventDefault();
          if (!tabPositionTopOrBottom.value) {
            onOffset(1);
          }
          break;
        }

        // LEFT
        case 'ArrowLeft': {
          if (tabPositionTopOrBottom.value) {
            onOffset(isRTL ? 1 : -1);
          }
          break;
        }

        // RIGHT
        case 'ArrowRight': {
          if (tabPositionTopOrBottom.value) {
            onOffset(isRTL ? -1 : 1);
          }
          break;
        }

        // UP
        case 'ArrowUp': {
          e.preventDefault();
          if (!tabPositionTopOrBottom.value) {
            onOffset(-1);
          }
          break;
        }

        // Backspace
        case 'Backspace':

        // oxlint-disable-next-line no-fallthrough
        case 'Delete': {
          handleRemoveTab(focusKey.value, e);
          break;
        }

        // END
        case 'End': {
          e.preventDefault();
          focusKey.value = lastEnabledTab;
          break;
        }
        // Enter & Space
        case 'Enter':
        case 'Space': {
          e.preventDefault();
          props.onTabClick?.(focusKey.value ?? activeKey.value, e);
          break;
        }
        // HOME
        case 'Home': {
          e.preventDefault();
          focusKey.value = firstEnabledTab;
          break;
        }
      }
    }

    const isHorizontal = computed(() => tabPositionTopOrBottom.value);
    const navClass = computed(() => [
      `${prefixCls.value}-nav`,
      className.value,
      tabsClassNames.value?.header,
    ]);
    const navStyle = computed(() => ({
      ...styles.value?.header,
      ...style.value,
    }));
    const navListClass = computed(() => `${prefixCls.value}-nav-list`);

    function onItemClick(key: string, e: KeyboardEvent | MouseEvent) {
      onTabClick.value?.(key, e as any);
    }

    function getEnabledKeys(list: Tab[]) {
      return list.filter((t) => !t.disabled).map((t) => t.key);
    }

    function onItemBlur() {
      focusKey.value = undefined;
    }

    function onTabFocus(key: string) {
      if (!isMouse.value) {
        focusKey.value = key;
      }
      scrollToTab(key);
      doLockAnimation();
      const wrap = tabsWrapperRef.value;
      if (!wrap) return;
      if (!rtl.value) wrap.scrollLeft = 0;
      wrap.scrollTop = 0;
    }

    const activeTabOffset = computed(() =>
      tabOffsets.value.get(activeKey.value)!,
    );

    const inkStyle = useIndicator({
      activeTabOffset,
      horizontal: isHorizontal,
      indicator,
      rtl,
    });

    // ========================== Measure ==========================
    function getTabSize(
      tab: HTMLElement,
      containerRect: { left: number; top: number },
    ) {
      const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = tab;
      const { width, height, left, top } = tab.getBoundingClientRect();
      if (Math.abs(width - offsetWidth) < 1)
        return [
          width,
          height,
          left - containerRect.left,
          top - containerRect.top,
        ];
      return [offsetWidth, offsetHeight, offsetLeft, offsetTop];
    }

    function getSize(refObj: Ref<HTMLElement | null>) {
      const el = refObj.value;
      const { offsetWidth = 0, offsetHeight = 0 } = el || {};
      if (el) {
        const { width, height } = el.getBoundingClientRect();
        if (Math.abs(width - offsetWidth) < 1) return [width, height];
      }
      return [offsetWidth, offsetHeight];
    }

    function updateTabSizes() {
      tabSizes.value = (() => {
        const newSizes = new Map<
          string,
          { height: number; left: number; top: number; width: number }
        >();
        const listRect = tabListRef.value?.getBoundingClientRect?.();
        tabs.value.forEach(({ key }) => {
          const listEl = tabListRef.value;
          const btnNode = listEl?.querySelector?.(
            `[data-node-key="${CSS.escape(genDataNodeKey(key))}"]`,
          ) as HTMLElement | null;
          if (btnNode && listRect) {
            const [width, height, left, top] = getTabSize(
              btnNode,
              listRect as any,
            );
            newSizes.set(key, { width, height, left, top } as any);
          }
        });
        return newSizes;
      })();
    }

    function onListHolderResize() {
      const containerSize = getSize(containerRef);
      const extraLeftEl = (extraLeftRef.value as any)
        ?.extraContentRef as HTMLElement | null;
      const extraRightEl = (extraRightRef.value as any)
        ?.extraContentRef as HTMLElement | null;
      const extraLeftSize = extraLeftEl
        ? getSize({ value: extraLeftEl } as any)
        : [0, 0];
      const extraRightSize = extraRightEl
        ? getSize({ value: extraRightEl } as any)
        : [0, 0];
      containerExcludeExtraSize.value = [
        containerSize[0]! - extraLeftSize[0]! - extraRightSize[0]!,
        containerSize[1]! - extraLeftSize[1]! - extraRightSize[1]!,
      ];

      const opEl = operationsRef.value?.operationNodeRef as HTMLElement | null;
      operationSize.value = opEl
        ? (getSize({ value: opEl } as any) as any)
        : [0, 0];

      const tabListEl = tabListRef.value;
      const tabContentFullSize = tabListEl
        ? getSize({ value: tabListEl } as any)
        : [0, 0];
      const addEl = (innerAddButtonRef.value as any)
        ?.buttonRef as HTMLElement | null;
      addSize.value = addEl
        ? (getSize({ value: addEl } as any) as any)
        : [0, 0];
      tabContentSize.value = [
        tabContentFullSize[0]! - addSize.value[0],
        tabContentFullSize[1]! - addSize.value[1],
      ];

      updateTabSizes();
    }

    watch(
      () => tabs.value.map((t) => t.key).join('_'),
      () => {
        nextTick(() => {
          updateTabSizes();
        });
      },
    );

    watch(
      [
        activeKey,
        () => transformComputed.value.transformMin,
        () => transformComputed.value.transformMax,
        visibleTabContentValue,
        tabOffsets,
      ],
      () => {
        scrollToTab();
      },
    );

    watch(rtl, () => {
      onListHolderResize();
    });

    return () => (
      <ResizeObserver onResize={onListHolderResize}>
        <div
          aria-orientation={isHorizontal.value ? 'horizontal' : 'vertical'}
          class={navClass.value}
          onKeydown={() => {
            doLockAnimation();
          }}
          ref={containerRef}
          role="tablist"
          style={navStyle.value}
        >
          <ExtraContent
            extra={extra.value}
            position="left"
            prefixCls={prefixCls.value}
            ref={extraLeftRef}
          />
          <ResizeObserver onResize={onListHolderResize}>
            <div
              class={[
                wrapPrefix.value,
                {
                  [`${wrapPrefix.value}-ping-left`]: pingLeft.value,
                  [`${wrapPrefix.value}-ping-right`]: pingRight.value,
                  [`${wrapPrefix.value}-ping-top`]: pingTop.value,
                  [`${wrapPrefix.value}-ping-bottom`]: pingBottom.value,
                },
              ]}
              ref={tabsWrapperRef}
            >
              <ResizeObserver onResize={onListHolderResize}>
                <div
                  class={navListClass.value}
                  ref={tabListRef}
                  style={{
                    transform: `translate(${transformLeft.value}px, ${transformTop.value}px)`,
                    transition: lockAnimation.value ? 'none' : undefined,
                  }}
                >
                  <RenderComponent
                    render={tabs.value.map((tab, i) =>
                      h(TabNode, {
                        id: id.value,
                        prefixCls: prefixCls.value,
                        key: tab.key,
                        tab,
                        className: tabsClassNames.value?.item,
                        style:
                          i === 0
                            ? undefined
                            : isHorizontal.value
                              ? { marginInlineStart: tabBarGutter.value }
                              : { marginTop: tabBarGutter.value },
                        classNames: {
                          item: tabsClassNames.value?.item,
                          remove: tabsClassNames.value?.remove,
                        },
                        styles: {
                          item: styles.value?.item,
                          remove: styles.value?.remove,
                        },
                        closable: tab.closable,
                        editable: editable.value,
                        active: tab.key === activeKey.value,
                        focus: tab.key === focusKey.value,
                        renderWrapper: renderWrapper.value,
                        removeAriaLabel: locale.value?.removeAriaLabel,
                        tabCount: tabs.value.filter((t) => !t.disabled).length,
                        currentPosition: i + 1,
                        onClick: (e: KeyboardEvent | MouseEvent) =>
                          onItemClick(tab.key, e),
                        onKeyDown: handleKeyDown,
                        onFocus: () => onTabFocus(tab.key),
                        onBlur: () => onItemBlur(),
                        onMouseDown: (e: MouseEvent) =>
                          handleMouseDown(tab.key, e),
                        onMouseUp: () => {
                          isMouse.value = false;
                        },
                      }),
                    )}
                  />
                  <AddButton
                    editable={editable.value}
                    locale={locale.value}
                    prefixCls={prefixCls.value}
                    ref={innerAddButtonRef}
                    style={
                      {
                        ...(tabs.value.length > 0 &&
                          (isHorizontal.value
                            ? { marginInlineStart: tabBarGutter.value }
                            : { marginTop: tabBarGutter.value })),
                        visibility: hasDropdown.value ? 'hidden' : null,
                      } as CSSProperties
                    }
                  />

                  <div
                    class={[
                      `${prefixCls.value}-ink-bar`,
                      tabsClassNames.value?.indicator,
                      {
                        [`${prefixCls.value}-ink-bar-animated`]:
                          animated.value?.inkBar,
                      },
                    ]}
                    style={{ ...styles.value?.indicator, ...inkStyle.value }}
                  />
                </div>
              </ResizeObserver>
            </div>
          </ResizeObserver>

          <OperationNode
            activeKey={activeKey.value}
            className={[
              tabsClassNames.value?.operations,
              hasDropdown.value ? undefined : operationsHiddenClassName.value,
            ]}
            classNames={{ remove: tabsClassNames.value?.remove }}
            editable={editable.value}
            getPopupContainer={getPopupContainer.value}
            id={id.value}
            locale={locale.value}
            mobile={mobile.value}
            more={more.value}
            onTabClick={onTabClick.value!}
            popupClassName={popupClassName.value}
            popupStyle={styles.value?.popup}
            prefixCls={prefixCls.value}
            ref={operationsRef}
            removeAriaLabel={locale.value?.removeAriaLabel}
            rtl={rtl.value}
            styles={{ remove: styles.value?.remove }}
            tabBarGutter={tabBarGutterProp.value}
            tabMoving={!!lockAnimation.value}
            tabs={hiddenTabs.value}
          />

          <ExtraContent
            extra={extra.value}
            position="right"
            prefixCls={prefixCls.value}
            ref={extraRightRef}
          />
        </div>
      </ResizeObserver>
    );
  },
  {
    name: 'TabNavList',
    inheritAttrs: false,
  },
);

export default TabNavList;

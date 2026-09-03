/**
 * Tabs（TSX 版，对应 Tabs.vue）
 *
 * 对外主组件，逻辑与 SFC 版完全一致：
 * - 受控/非受控 activeKey（useMergedState）；
 * - items 过滤 + 默认激活项计算 + 非法激活回退；
 * - 无障碍：onMounted 生成稳定 id（SSR 安全）；
 * - 组装 TabNavListWrapper（标签栏）+ TabPanelList（内容面板）；
 * - prefixCls/tabPosition 默认值通过 computed 兜底（对应 SFC 的 withDefaults）。
 */
import type { TabsProps } from './interface';

import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  toRefs,
  watch,
} from 'vue';

import { clsx } from '@arvin-studio/kit';

import useMergedState from '../util/hooks/useMergedState';
import getIsMobile from '../util/isMobile';
import omit from '../util/omit';
import useAnimateConfig from './hooks/useAnimateConfig';
import { provideTabContext } from './TabContext';
import TabNavListWrapper from './TabNavList/Wrapper';
import TabPanelList from './TabPanelList';
import { getUUid, setUUid } from './utils';

/** 默认 props（对应 withDefaults 的 prefixCls/tabPosition） */
const defaults = {
  prefixCls: 'headless-tabs',
  tabPosition: 'top',
} as any;

const Tabs = defineComponent<TabsProps>(
  (props = defaults) => {
    const {
      id,
      items,
      direction,
      defaultActiveKey,
      tabPosition,
      editable,
      locale,
      tabBarGutter,
      more,
      animated,
      styles,
      prefixCls,
      className,
      activeKey,
      tabBarStyle,
      tabBarExtraContent,
      destroyOnHidden,
      renderTabBar,
      onChange,
      onTabClick,
      onTabScroll,
      getPopupContainer,
      popupClassName,
      indicator,
      classNames: tabsClassNames,
    } = toRefs(props) as any;

    // withDefaults 等价：缺省时补默认值
    const mergedPrefixCls = computed(() => prefixCls.value ?? 'headless-tabs');
    const mergedTabPosition = computed(() => tabPosition.value ?? 'top');

    const restProps = computed(() => {
      return omit(props, [
        'id',
        'prefixCls',
        'className',
        'items',
        'direction',
        'activeKey',
        'defaultActiveKey',
        'editable',
        'animated',
        'tabPosition',
        'tabBarGutter',
        'tabBarStyle',
        'tabBarExtraContent',
        'locale',
        'more',
        'destroyOnHidden',
        'renderTabBar',
        'onChange',
        'onTabClick',
        'onTabScroll',
        'getPopupContainer',
        'popupClassName',
        'indicator',
        'classNames',
        'styles',
      ]);
    });

    const tabs = computed(() =>
      (items.value || []).filter(
        (item: any) => item && typeof item === 'object' && 'key' in item,
      ),
    );

    const rtl = computed(() => direction.value === 'rtl');

    // FIXME:
    const mergedAnimated = computed(() => useAnimateConfig(animated.value));
    // ======================== Mobile ========================
    const mobile = ref(false);
    onMounted(() => {
      mobile.value = getIsMobile();
    });

    // ====================== Active Key ======================
    const defaultKey = computed(
      () => defaultActiveKey.value ?? tabs.value[0]?.key,
    );
    const [mergedActiveKey, setMergedActiveKey] = useMergedState('', {
      defaultValue: activeKey.value ?? defaultKey.value,
      value: activeKey,
    });

    const activeIndex = ref(
      tabs.value.findIndex(
        (item: { key: any }) => item.key === mergedActiveKey.value,
      ),
    );

    const tabKeyStr = computed(() =>
      tabs.value.map((tab: { key: any }) => tab.key).join('_'),
    );

    watch(
      [tabKeyStr, mergedActiveKey, activeIndex],
      async () => {
        await nextTick();
        activeIndex.value = tabs.value.findIndex(
          (item: { key: any }) => item.key === mergedActiveKey.value,
        );
        let newActiveIndex = tabs.value.findIndex(
          (tab: { key: any }) => tab.key === mergedActiveKey.value,
        );
        if (newActiveIndex === -1) {
          newActiveIndex = Math.max(
            0,
            Math.min(activeIndex.value, tabs.value.length - 1),
          );
          setMergedActiveKey(tabs.value[newActiveIndex]?.key);
        }
        activeIndex.value = newActiveIndex;
      },
      { immediate: true },
    );

    // ===================== Accessibility ====================
    const [mergedId, setMergedId] = useMergedState(null as null | string, {
      value: id.value,
    });

    // Async generate id to avoid ssr mapping failed
    onMounted(() => {
      const uuid = getUUid();
      setMergedId(
        // oxlint-disable-next-line typescript/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line n/prefer-global/process
        `headless-tabs-${process.env.NODE_ENV === 'test' ? 'test' : uuid}`,
      );
      setUUid(uuid + 1);
    });

    // ======================== Events ========================
    function onInternalTabClick(key: string, e: KeyboardEvent | MouseEvent) {
      onTabClick.value?.(key, e);
      const isActiveChanged = key !== mergedActiveKey.value;
      setMergedActiveKey(key);
      if (isActiveChanged) {
        onChange.value?.(key);
      }
    }

    // ======================== Render ========================
    const sharedProps = computed(() => ({
      id: mergedId.value as string,
      activeKey: mergedActiveKey.value,
      animated: mergedAnimated.value,
      tabPosition: mergedTabPosition.value,
      rtl: rtl.value,
      mobile: mobile.value,
    }));

    const tabNavBarProps = computed(() => {
      return {
        ...sharedProps.value,
        editable: editable.value,
        locale: locale.value,
        more: more.value,
        tabBarGutter: tabBarGutter.value,
        onTabClick: onInternalTabClick,
        onTabScroll: onTabScroll.value,
        extra: tabBarExtraContent.value,
        style: tabBarStyle.value!,
        getPopupContainer: getPopupContainer.value,
        popupClassName: clsx([
          popupClassName.value,
          tabsClassNames.value?.popup,
        ]),
        indicator: indicator.value,
        styles: styles.value,
        classNames: tabsClassNames.value,
      };
    });

    const memoizedValue = computed(() => {
      return { tabs: tabs.value, prefixCls: mergedPrefixCls.value };
    });

    const tabRef = ref<HTMLDivElement>();

    provideTabContext(memoizedValue);

    return () => (
      <div
        class={[
          mergedPrefixCls.value,
          `${mergedPrefixCls.value}-${mergedTabPosition.value}`,
          {
            [`${mergedPrefixCls.value}-mobile`]: mobile.value,
            [`${mergedPrefixCls.value}-editable`]: editable.value,
            [`${mergedPrefixCls.value}-rtl`]: rtl.value,
          },
          className.value,
        ]}
        id={id.value!}
        ref={tabRef}
        {...restProps.value}
      >
        <TabNavListWrapper
          {...tabNavBarProps.value}
          renderTabBar={renderTabBar.value!}
        />
        <TabPanelList
          destroyOnHidden={destroyOnHidden.value}
          {...sharedProps.value}
          animated={mergedAnimated.value}
          bodyClassName={tabsClassNames.value?.body}
          bodyStyle={styles.value?.body}
          contentClassName={tabsClassNames.value?.content}
          contentStyle={styles.value?.content}
        />
      </div>
    );
  },
  {
    name: 'Tabs',
    inheritAttrs: false,
  },
);

export default Tabs;

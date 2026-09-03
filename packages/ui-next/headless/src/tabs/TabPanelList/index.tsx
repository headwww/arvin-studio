/**
 * TabPanelList（TSX 版，对应 TabPanelList/index.vue）
 *
 * 内容面板列表：
 * - 非动画模式：非激活面板用 `-hidden` 类 + display:none（v-show 语义）；
 * - 动画模式：用 Transition 包裹实现切换动画（注意不能给离场面板上
 *   display:none，否则 leave 过渡会被杀，见原 SFC 注释）；
 * - keep-alive 语义：曾经激活过的面板保持挂载（visitedKeys），
 *   destroyOnHidden/forceRender 控制销毁与强制渲染。
 */
import type { CSSProperties } from 'vue';

import type { AnimatedConfig, Tab, TabPosition } from '../interface';

import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  Transition,
  watch,
} from 'vue';

import { getTransitionProps } from '../../util';
import { RenderComponent } from '../../util/RenderComponent';
import { useTabContext } from '../TabContext';
import TabPane from './TabPane';

interface TabPanelListProps {
  activeKey: string;
  animated?: AnimatedConfig;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  destroyOnHidden?: boolean;
  id: null | string;
  tabPosition?: TabPosition;
}

const TabPanelList = defineComponent<TabPanelListProps>(
  (props) => {
    const {
      id,
      activeKey,
      animated,
      tabPosition,
      destroyOnHidden,
      bodyStyle,
      bodyClassName,
      contentStyle,
      contentClassName,
    } = toRefs(props) as any;

    const ctx = useTabContext();
    const tabs = computed<Tab[]>(() => ctx?.value.tabs || []);
    const prefixCls = computed(() => ctx?.value.prefixCls || '');

    const tabPaneAnimated = computed(() => animated.value?.tabPane === true);
    // rc-tabs 1.11.0 semantic rename: each pane is now `${prefixCls}-content`
    // (was `${prefixCls}-tabpane`); the inner wrapper became `${prefixCls}-body`.
    const tabPanePrefixCls = computed(() => `${prefixCls.value}-content`);
    const transitionProps = computed(() => {
      if (!tabPaneAnimated.value) return {};

      if (animated.value?.tabPaneMotion) return animated.value.tabPaneMotion;
      return getTransitionProps(tabPanePrefixCls.value);
    });

    function shouldDestroyOnHidden(item: Tab) {
      return !!(
        !item.forceRender &&
        (destroyOnHidden.value ?? item.destroyOnHidden) === true
      );
    }

    // Track which panes have ever been active, mirroring rc-motion's `renderedRef`:
    // once a pane has been visible it stays mounted (keep-alive) unless destroyed.
    const visitedKeys = reactive(new Set<string>());
    watch(
      activeKey,
      (key) => {
        // oxlint-disable-next-line eqeqeq
        if (key != null) visitedKeys.add(key);
      },
      { immediate: true },
    );

    // Decide whether a pane's content is mounted, replicating CSSMotion (STATUS_NONE,
    // leavedClassName always truthy):
    //   active                          -> mounted
    //   forceRender                     -> mounted (forceRender wins over destroy)
    //   destroyOnHidden && inactive     -> unmounted
    //   visited before (keep-alive)     -> mounted
    //   never visited (lazy)            -> unmounted
    function shouldRender(item: Tab) {
      if (item.key === activeKey.value) return true;
      if (item.forceRender) return true;
      if ((destroyOnHidden.value ?? item.destroyOnHidden) === true)
        return false;
      return visitedKeys.has(item.key);
    }

    return () => (
      <div class={[`${prefixCls.value}-body-holder`]}>
        <div
          class={[
            `${prefixCls.value}-body`,
            `${prefixCls.value}-body-${tabPosition.value}`,
            { [`${prefixCls.value}-body-animated`]: tabPaneAnimated.value },
            bodyClassName.value,
          ]}
          style={bodyStyle.value}
        >
          {tabs.value.map((item) => {
            if (tabPaneAnimated.value) {
              // 动画模式：可见性交给 v-show 语义（display:none 由 leave 结束后写入），
              // 离场面板保持可过渡状态
              const show = shouldDestroyOnHidden(item)
                ? true
                : item.key === activeKey.value;
              const pane = shouldRender(item) ? (
                <TabPane
                  active={item.key === activeKey.value}
                  animated={tabPaneAnimated.value}
                  className={[contentClassName.value, item.className]}
                  id={id.value}
                  key={item.key}
                  prefixCls={tabPanePrefixCls.value}
                  style={{
                    ...contentStyle.value,
                    ...item.style,
                    display: show ? undefined : 'none',
                  }}
                  tabKey={item.key}
                >
                  <RenderComponent render={item.children} />
                </TabPane>
              ) : null;
              return (
                <Transition key={item.key} {...transitionProps.value}>
                  {pane}
                </Transition>
              );
            }

            const show = shouldDestroyOnHidden(item)
              ? true
              : item.key === activeKey.value || item.forceRender;
            if (!shouldRender(item)) return null;

            return (
              <TabPane
                active={item.key === activeKey.value}
                animated={tabPaneAnimated.value}
                className={[
                  contentClassName.value,
                  item.className,
                  item.key !== activeKey.value &&
                    `${tabPanePrefixCls.value}-hidden`,
                ]}
                id={id.value}
                key={item.key}
                prefixCls={tabPanePrefixCls.value}
                style={{
                  ...contentStyle.value,
                  ...item.style,
                  display: show ? undefined : 'none',
                }}
                tabKey={item.key}
              >
                <RenderComponent render={item.children} />
              </TabPane>
            );
          })}
        </div>
      </div>
    );
  },
  {
    name: 'TabPanelList',
    inheritAttrs: false,
  },
);

export default TabPanelList;

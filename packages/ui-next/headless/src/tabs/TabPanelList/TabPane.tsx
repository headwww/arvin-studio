import type { TabPaneProps } from '../interface';

import { computed, defineComponent, shallowRef } from 'vue';

/**
 * TabPane（TSX 版，对应 TabPanelList/TabPane.vue）
 *
 * 单个内容面板：渲染为 role="tabpanel" 的 div，
 * id/aria-labelledby 与 TabNode 的 tab 按钮一一对应（无障碍联动）。
 */
import { ensureValidVNode } from '../../util';
import { RenderComponent } from '../../util/RenderComponent';

const TabPane = defineComponent<TabPaneProps>(
  (props, { slots }) => {
    const childrenNode = computed(() =>
      ensureValidVNode(slots.default?.() || []),
    );

    const TabPaneRef = shallowRef<HTMLDivElement>();
    const hasContent = computed(
      () => childrenNode.value && childrenNode.value?.length > 0,
    );

    const id: any = props.id && `${props.id}-panel-${props.tabKey}`;
    const hidden: any = !props.active;
    const labelledby: any = props.id && `${props.id}-tab-${props.tabKey}`;
    return () => (
      <div
        aria-hidden={hidden}
        aria-labelledby={labelledby}
        class={[
          props.prefixCls,
          props.active && `${props.prefixCls}-active`,
          props.className,
        ]}
        id={id}
        ref={TabPaneRef}
        role="tabpanel"
        style={props.style}
        tabindex={props.active && hasContent.value ? 0 : -1}
      >
        <RenderComponent render={childrenNode.value} />
      </div>
    );
  },
  {
    name: 'TabPane',
    inheritAttrs: false,
  },
);

export default TabPane;

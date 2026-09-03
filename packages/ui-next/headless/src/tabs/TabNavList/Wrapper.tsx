/**
 * TabNavListWrapper（TSX 版，对应 TabNavList/Wrapper.vue）
 *
 * renderTabBar 的接入点：用户提供 renderTabBar(props, TabNavList) 时
 * 用它自定义整个标签栏；否则默认渲染 TabNavList。
 */
import type { TabNavListWrapperProps } from '../interface';

import { computed, defineComponent, h } from 'vue';

import { RenderComponent } from '../../util/RenderComponent';
import TabNavList from './index';

const Wrapper = defineComponent<TabNavListWrapperProps>(
  (props) => {
    const renderNode = computed(() => {
      const restProps = { ...props } as any;
      delete restProps.renderTabBar;

      if (props.renderTabBar) {
        return props.renderTabBar(restProps, TabNavList);
      }

      return h(TabNavList, restProps);
    });

    return () => <RenderComponent render={renderNode.value} />;
  },
  {
    name: 'TabNavListWrapper',
    inheritAttrs: false,
  },
);

export default Wrapper;

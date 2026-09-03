/**
 * ExtraContent（TSX 版，对应 TabNavList/ExtraContent.vue）
 *
 * 标签栏两侧的附加内容（tabBarExtraContent）：
 * - extra 为对象时按 { left, right } 取对应侧内容；
 * - 非对象时视为 right 侧内容。
 */
import type { VNodeArrayChildren } from 'vue';

import type { ExtraContentProps, TabBarExtraMap } from '../interface';

import { computed, defineComponent, isVNode, shallowRef } from 'vue';

import { ensureValidVNode } from '../../util';
import { RenderComponent } from '../../util/RenderComponent';

const ExtraContent = defineComponent<ExtraContentProps>(
  (props, { expose }) => {
    const extraContentRef = shallowRef<HTMLDivElement>();

    const isValidExtra = computed(() => {
      if (
        typeof props.extra === 'object' &&
        isVNode(props.extra) &&
        ensureValidVNode(
          Array.isArray(props.extra)
            ? props.extra
            : ([props.extra] as unknown as VNodeArrayChildren),
        )
      )
        return true;

      if (
        ['boolean', 'number', 'object', 'string'].includes(typeof props.extra)
      )
        return true;

      return false;
    });

    const childrenNodes = computed(() => {
      if (!props.extra) return null;

      let assertExtra: TabBarExtraMap = {};
      // React.isValidElement replace isVNode
      if (typeof props.extra === 'object' && !isVNode(props.extra)) {
        assertExtra = props.extra as TabBarExtraMap;
      } else {
        assertExtra.right = props.extra;
      }

      return props.position === 'right' ? assertExtra.right : assertExtra.left;
    });

    expose({
      extraContentRef,
    });

    return () =>
      isValidExtra.value ? (
        <div class={[`${props.prefixCls}-extra-content`]} ref={extraContentRef}>
          <RenderComponent render={childrenNodes.value} />
        </div>
      ) : null;
  },
  {
    name: 'ExtraContent',
    inheritAttrs: false,
  },
);

export default ExtraContent;

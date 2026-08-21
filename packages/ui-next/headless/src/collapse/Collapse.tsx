import type { Ref } from 'vue';

import type { CollapseProps, Key } from './interface';

import { defineComponent, ref, toRef } from 'vue';

import { clsx, omit } from '@arvin-studio/kit';

import { pickAttrs } from '../util';
import useMergedState from '../util/hooks/useMergedState';
import { useItems } from './hooks/useItems';

function getActiveKeysArray(activeKey: Array<Key> | Key) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    const activeKeyType = typeof currentActiveKey;
    currentActiveKey =
      activeKeyType === 'number' || activeKeyType === 'string'
        ? [currentActiveKey]
        : [];
  }
  return currentActiveKey.map(String);
}

const defaults = {
  prefixCls: 'headless-collapse',
} as any;

const Collapse = defineComponent<CollapseProps>({
  name: 'HeadlessCollapse',
  inheritAttrs: false,
  setup(props = defaults, { attrs, expose, slots }) {
    const refWrapper = ref<HTMLDivElement>();

    const [activeKey, setActiveKey] = useMergedState<
      Key | Key[],
      Ref<Array<Key>>
    >([], {
      value: toRef(props, 'activeKey') as Ref<Key | Key[]>,
      onChange: (v) => props.onChange?.(v as Key[]),
      defaultValue: props.defaultActiveKey,
      postState: getActiveKeysArray,
    });

    const getActiveKey = (key: Key) => {
      if (props.accordion) {
        return activeKey.value[0] === key ? [] : [key];
      }

      const index = activeKey.value.indexOf(key);
      const isActive = index !== -1;
      if (isActive) {
        return activeKey.value.filter((item) => item !== key);
      }

      return [...activeKey.value, key];
    };
    const onItemClick = (key: Key) => {
      activeKey.value = getActiveKey(key);
      setActiveKey(activeKey.value);
    };

    expose({
      ref: refWrapper,
    });

    return () => {
      const {
        prefixCls = 'headless-collapse',
        openMotion,
        expandIcon,
        collapsible,
        accordion,
        classNames,
        styles,
        items,
        destroyOnHidden,
      } = props;

      const collapseClassName = clsx(prefixCls, (attrs as any).class);

      const mergedProps = { ...props, ...omit(attrs, ['class', 'style']) };

      const mergedChildren = useItems(items, slots.default, {
        prefixCls,
        accordion,
        openMotion,
        expandIcon,
        collapsible,
        onItemClick,
        activeKey: activeKey.value,
        destroyOnHidden,
        classNames,
        styles,
      });

      return (
        <div
          class={collapseClassName}
          ref={refWrapper}
          role={accordion ? 'tablist' : undefined}
          style={(attrs as any).style}
          {...pickAttrs(mergedProps, { aria: true, data: true })}
        >
          {mergedChildren}
        </div>
      );
    };
  },
});

export default Collapse;
